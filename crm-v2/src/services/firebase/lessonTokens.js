import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore';
import { requireFirebaseClient } from './client.js';

// Lesson tokens of a card (functions/lesson-tokens-core.js, docs/LESSON_TOKENS.md): its lesson packages, their ledger
// and the lessons it owes. The administrator, finance and the card's own student / parent may read them (firestore.rules).

// credits per lesson (owner 2026-10-29, the same rule as functions/lesson-tokens-core.js lessonTokenCost): one per full
// hour, at least one — 45 / 60 / 90 min = 1, 120 min = 2, 180 min = 3; a lesson without a length counts as 60 min
export const TOKEN_MINUTES = 60;
export const TOKENS_PER_LESSON = 1;
export function lessonTokenCost(lesson = {}) {
  const minutes = Number(lesson.duration ?? lesson.durationMinutes) || TOKEN_MINUTES;
  return Math.max(TOKENS_PER_LESSON, Math.floor(minutes / TOKEN_MINUTES));
}
// credits an owed lesson needs (the server stores them on its state; older states took one)
export const owedCredits = (owed = []) => owed.reduce((n, item) => n + (Number(item?.credits) || TOKENS_PER_LESSON), 0);
// low balance: time to send the next package invoice
export const TOKENS_LOW = 2;

// a package that counts: still has credits, or was used up (a used-up package still shows what was bought and held)
const COUNTED = new Set(['active', 'depleted']);
const num = (value) => Number(value) || 0;

// One subject per package (Oleksiy 2026-11-03): a package invoice names a subject and its package (tokenSubject) pays
// only that subject's lessons; a package without one pays every lesson of the card. The same key as the server's
// (functions/lesson-tokens-core.js tokenSubjectKey): case, spaces, diacritics and the built-in aliases do not matter.
const SUBJECT_ALIASES = { eesti: 'Eesti keel', estonian: 'Eesti keel', english: 'Inglise keel', inglise: 'Inglise keel', matem: 'Matemaatika', 'eesti keel emakeelena': 'Emakeel', russian: 'Vene keel' };
export function tokenSubjectKey(subject) {
  const low = String(subject || '').trim().replace(/\s+/g, ' ').toLocaleLowerCase('et');
  if (!low) return '';
  return (SUBJECT_ALIASES[low] || low).toLocaleLowerCase('et').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60);
}
// the lessons left that a lesson of this subject can take: its own subject's packages and the packages without a subject
export function subjectBalance(packages = [], subject = '') {
  const key = tokenSubjectKey(subject);
  return packages.filter((item) => item?.status === 'active' && (!tokenSubjectKey(item.tokenSubject) || tokenSubjectKey(item.tokenSubject) === key))
    .reduce((n, item) => n + num(item.balanceCredits), 0);
}

export function tokenSummary(packages = []) {
  const counted = packages.filter((item) => COUNTED.has(item.status));
  const sum = (key) => counted.reduce((n, item) => n + num(item[key]), 0);
  return { balance: sum('balanceCredits'), granted: sum('grantedCredits'), consumed: sum('consumedCredits'), packages: counted.filter((item) => item.status === 'active').length };
}

// the package of a token invoice (the server's id rule, functions/lesson-tokens-core.js tokenPackageId)
export const tokenPackageId = (invoiceId) => `tokens_${invoiceId}`.replace(/[^A-Za-z0-9_-]/g, '_').slice(0, 140);

// „Ühine tunnipakett” (owner 2026-11-04): one package invoice for a family; after payment every line (cardParts) is its
// own package on its own card — the server's id rule (functions/lesson-tokens-core.js tokenPartPackageId / tokenInvoiceParts)
export const tokenPartPackageId = (invoiceId, index) => `tokens_${invoiceId}_${index}`.replace(/[^A-Za-z0-9_-]/g, '_').slice(0, 140);
export const isCombinedTokenInvoice = (invoice = {}) => invoice?.billingMode === 'lesson_tokens_v1' && invoice.combined === true && Array.isArray(invoice.cardParts) && invoice.cardParts.length > 0;
// the lines a token invoice credits: one for a one-card invoice, one per card and subject for a combined one
export function tokenInvoiceParts(invoice = {}) {
  if (!isCombinedTokenInvoice(invoice)) {
    return [{ index: 0, packageId: invoice.tokenPackageId || tokenPackageId(invoice.id), studentId: invoice.studentId || '', studentName: invoice.studentName || '', subject: invoice.subject || '', tokenCredits: num(invoice.tokenCredits) }];
  }
  return invoice.cardParts.map((part, index) => ({
    index, packageId: invoice.tokenPackageIds?.[index] || tokenPartPackageId(invoice.id, index), studentId: part.studentId || '',
    studentName: part.studentName || '', subject: part.subject || '', tokenCredits: num(part.tokenCredits),
  }));
}
// every card a token invoice is for (a combined one: each of its cards)
export const tokenInvoiceStudentIds = (invoice = {}) => [...new Set(tokenInvoiceParts(invoice).map((part) => part.studentId).filter(Boolean))];

// Per package (oldest first, the order lessons take credits) and in total: bought, held, left, and the lessons held
// when no package had credits (owed: to be invoiced and paid; the next paid package takes them first).
// packages: studentPackages docs; owed: lessonPackageStates with status needs_attention ([{ lessonId, lessonDate }]).
export function tokenAccount({ packages = [], owed = [] } = {}) {
  const rows = packages.filter((item) => COUNTED.has(item.status))
    .sort((a, b) => `${a.issuedAt || ''}:${a.createdAt || ''}:${a.id || ''}`.localeCompare(`${b.issuedAt || ''}:${b.createdAt || ''}:${b.id || ''}`))
    .map((item) => {
      const bought = num(item.grantedCredits);
      const held = num(item.consumedCredits);
      const left = num(item.balanceCredits);
      return {
        id: item.id,
        invoiceId: item.sourceInvoiceId || '',
        invoiceNum: item.sourceInvoiceNum || '',
        issuedAt: item.issuedAt || '',
        name: item.packageProductName || '',
        // '' = paid any lesson of the card (packages before 2026-11-03 or a card without a subject)
        subject: String(item.tokenSubject || '').trim(),
        bought,
        held,
        left,
        // a correction („Parandus”, financeApi /student-packages/adjust) added or removed credits
        corrected: left + held - bought,
        usedUp: left <= 0,
      };
    });
  const owedLessons = owed.filter((item) => item && item.status !== 'cleared' && item.status !== 'consumed')
    .sort((a, b) => String(a.lessonDate || '').localeCompare(String(b.lessonDate || '')));
  const total = (key) => rows.reduce((n, row) => n + row[key], 0);
  const left = total('left');
  const owedTotal = owedCredits(owedLessons);
  return {
    rows,
    bought: total('bought'),
    held: total('held'),
    left,
    owed: owedTotal,
    owedLessons,
    state: owedTotal > 0 ? 'owed' : !rows.length ? 'none' : left <= 0 ? 'empty' : left <= TOKENS_LOW ? 'low' : 'ok',
  };
}

// the one line the student / parent reads
export function tokenLine(account) {
  if (!account || !account.rows.length) return '';
  if (account.owed > 0) return `Pakett on läbi · ${account.owed} ${account.owed === 1 ? 'tund' : 'tundi'} ootab tasumist`;
  return `Paketist alles ${account.left} ${account.left === 1 ? 'tund' : 'tundi'}`;
}

// the line under a token invoice in the finance month view: before payment, waiting to be credited, or bought / held /
// left of its package; owed lessons of the student are shown on their newest token invoice (showOwed)
// A combined invoice („Ühine tunnipakett”) gets a line per card and subject: studentPackage is then the array of its
// packages (index = line), owedBy { studentId: owed credits } and showOwedFor(studentId) say where the owed lessons go
// (once per card, on its first line).
export function tokenInvoiceUsageLines(invoice = {}, studentPackage = null, { owed = 0, showOwed = false, owedBy = {}, showOwedFor = null } = {}) {
  const credits = num(invoice.tokenCredits);
  const owedText = (n) => `võlg ${n} ${n === 1 ? 'tund' : 'tundi'} (uus arve)`;
  const usage = (pkg) => {
    if (!pkg) return ['✓ lisatud õpilasele'];
    const left = num(pkg.balanceCredits);
    return [`peetud ${num(pkg.consumedCredits)}`, left > 0 ? `alles ${left}` : 'läbi'];
  };
  if (isCombinedTokenInvoice(invoice)) {
    const packages = Array.isArray(studentPackage) ? studentPackage : [];
    const head = [`Ühine tunnipakett · ${credits} tundi`];
    if (invoice.tokenStatus !== 'credited' && invoice.tokenStatus !== 'voided') head.push('tunnid lisatakse pärast makset');
    const seen = new Set();
    const lines = tokenInvoiceParts(invoice).map((part) => {
      const bits = [`${[part.studentName, part.subject].filter(Boolean).join(' · ') || 'Õpilane'}: ${part.tokenCredits} tundi`];
      if (invoice.tokenStatus === 'credited') bits.push(...usage(packages[part.index]));
      const n = num(owedBy[part.studentId]);
      if (!seen.has(part.studentId) && n > 0 && showOwedFor?.(part.studentId)) bits.push(owedText(n));
      seen.add(part.studentId);
      return bits.join(' · ');
    });
    return [head.join(' · '), ...lines];
  }
  const parts = [`Tunnipakett · ${credits} tundi`];
  if (invoice.tokenStatus === 'credited') parts.push(...usage(studentPackage));
  else if (invoice.tokenStatus !== 'voided') parts.push('tunnid lisatakse pärast makset');
  if (showOwed && owed > 0) parts.push(owedText(owed));
  return [parts.join(' · ')];
}

export function tokenInvoiceUsage(invoice = {}, studentPackage = null, options = {}) {
  return tokenInvoiceUsageLines(invoice, studentPackage, options).join('; ');
}

export const lessonTokensService = {
  async listByStudent(studentId) {
    if (!studentId) return [];
    const { db } = requireFirebaseClient();
    const snapshot = await getDocs(query(collection(db, 'studentPackages'), where('studentId', '==', studentId)));
    return snapshot.docs.map((item) => ({ id: item.id, ...item.data() })).sort((a, b) => String(b.createdAt || '').localeCompare(String(a.createdAt || '')));
  },
  async ledgerByStudent(studentId) {
    if (!studentId) return [];
    const { db } = requireFirebaseClient();
    const snapshot = await getDocs(query(collection(db, 'packageLedger'), where('studentId', '==', studentId)));
    return snapshot.docs.map((item) => ({ id: item.id, ...item.data() })).sort((a, b) => String(b.createdAt || '').localeCompare(String(a.createdAt || '')));
  },
  // lessons held when no package had credits (the server marks them, functions/index.js syncLessonPackageConsumption)
  async owedByStudent(studentId) {
    if (!studentId) return [];
    const { db } = requireFirebaseClient();
    const snapshot = await getDocs(query(collection(db, 'lessonPackageStates'), where('studentId', '==', studentId)));
    return snapshot.docs.map((item) => ({ id: item.id, ...item.data() })).filter((item) => item.status === 'needs_attention');
  },
  // „Täna” (admin / finance): every package that counts and every owed lesson, for the „running out” list
  async listCountedPackages() {
    const { db } = requireFirebaseClient();
    const snapshot = await getDocs(query(collection(db, 'studentPackages'), where('status', 'in', [...COUNTED])));
    return snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
  },
  async listOwed() {
    const { db } = requireFirebaseClient();
    const snapshot = await getDocs(query(collection(db, 'lessonPackageStates'), where('status', '==', 'needs_attention')));
    return snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
  },
  // the packages of these token invoices (finance month view): { [invoiceId]: package }; a combined invoice gets the
  // array of its lines' packages (index = line, null when one cannot be read)
  async packagesForInvoices(invoices = []) {
    const credited = invoices.filter((invoice) => invoice?.id && invoice.billingMode === 'lesson_tokens_v1' && invoice.tokenStatus === 'credited');
    if (!credited.length) return {};
    const { db } = requireFirebaseClient();
    const read = async (id) => {
      const snapshot = await getDoc(doc(db, 'studentPackages', id));
      return snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null;
    };
    const found = await Promise.all(credited.map(async (invoice) => {
      if (isCombinedTokenInvoice(invoice)) return [invoice.id, await Promise.all(tokenInvoiceParts(invoice).map((part) => read(part.packageId).catch(() => null)))];
      const item = await read(invoice.tokenPackageId || tokenPackageId(invoice.id));
      return item ? [invoice.id, item] : null;
    }));
    return Object.fromEntries(found.filter(Boolean));
  },
};
