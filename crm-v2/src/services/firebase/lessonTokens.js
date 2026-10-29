import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore';
import { requireFirebaseClient } from './client.js';

// Lesson tokens of a card (functions/lesson-tokens-core.js, docs/LESSON_TOKENS.md): its lesson packages, their ledger
// and the lessons it owes. The administrator, finance and the card's own student / parent may read them (firestore.rules).

// one held lesson takes one credit, whatever its length (the same rule as functions/lesson-tokens-core.js)
export const TOKENS_PER_LESSON = 1;
// low balance: time to send the next package invoice
export const TOKENS_LOW = 2;

// a package that counts: still has credits, or was used up (a used-up package still shows what was bought and held)
const COUNTED = new Set(['active', 'depleted']);
const num = (value) => Number(value) || 0;

export function tokenSummary(packages = []) {
  const counted = packages.filter((item) => COUNTED.has(item.status));
  const sum = (key) => counted.reduce((n, item) => n + num(item[key]), 0);
  return { balance: sum('balanceCredits'), granted: sum('grantedCredits'), consumed: sum('consumedCredits'), packages: counted.filter((item) => item.status === 'active').length };
}

// the package of a token invoice (the server's id rule, functions/lesson-tokens-core.js tokenPackageId)
export const tokenPackageId = (invoiceId) => `tokens_${invoiceId}`.replace(/[^A-Za-z0-9_-]/g, '_').slice(0, 140);

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
  const owedCredits = owedLessons.length * TOKENS_PER_LESSON;
  return {
    rows,
    bought: total('bought'),
    held: total('held'),
    left,
    owed: owedCredits,
    owedLessons,
    state: owedCredits > 0 ? 'owed' : !rows.length ? 'none' : left <= 0 ? 'empty' : left <= TOKENS_LOW ? 'low' : 'ok',
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
export function tokenInvoiceUsage(invoice = {}, studentPackage = null, { owed = 0, showOwed = false } = {}) {
  const credits = num(invoice.tokenCredits);
  const parts = [`Tunnipakett · ${credits} tundi`];
  if (invoice.tokenStatus === 'credited') {
    if (studentPackage) {
      const left = num(studentPackage.balanceCredits);
      parts.push(`peetud ${num(studentPackage.consumedCredits)}`, left > 0 ? `alles ${left}` : 'läbi');
    } else parts.push('✓ lisatud õpilasele');
  } else if (invoice.tokenStatus !== 'voided') parts.push('tunnid lisatakse pärast makset');
  if (showOwed && owed > 0) parts.push(`võlg ${owed} ${owed === 1 ? 'tund' : 'tundi'} (uus arve)`);
  return parts.join(' · ');
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
  // the packages of these token invoices (finance month view): { [invoiceId]: package }
  async packagesForInvoices(invoices = []) {
    const credited = invoices.filter((invoice) => invoice?.id && invoice.billingMode === 'lesson_tokens_v1' && invoice.tokenStatus === 'credited');
    if (!credited.length) return {};
    const { db } = requireFirebaseClient();
    const found = await Promise.all(credited.map(async (invoice) => {
      const snapshot = await getDoc(doc(db, 'studentPackages', invoice.tokenPackageId || tokenPackageId(invoice.id)));
      return snapshot.exists() ? [invoice.id, { id: snapshot.id, ...snapshot.data() }] : null;
    }));
    return Object.fromEntries(found.filter(Boolean));
  },
};
