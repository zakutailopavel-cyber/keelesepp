import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore';
import { requireFirebaseClient } from './client.js';
import { subjectName, subjectsOf } from '../../features/students/subjects.js';
import { directionId, findDirection } from '../../features/students/studyDirections.js';
import { localDate } from '../../utils/localDate.js';

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

// One package per subject (owner 2026-10-30): the same rule as functions/lesson-tokens-core.js (parity test). No data is
// rewritten: an old package without a subject takes the card's only subject; on a card with several it stays shared ('').
export function tokenSubjectKey(subject) {
  const text = subjectName(subject);
  return text ? directionId(findDirection(text)?.name || text) : '';
}
const onlySubject = (card) => { const subjects = card ? subjectsOf(card) : []; return subjects.length === 1 ? subjects[0] : ''; };
export const packageSubject = (item = {}, card = null) => subjectName(item.subject) || onlySubject(card);

// Expiry (owner 2026-10-30, the same rule as functions/lesson-tokens-core.js): derived on reading, nothing is written.
export const TOKEN_EXPIRY_DAYS = 14;
export const TOKEN_EXPIRY_FROM = '2026-10-30';
const asDate = (value) => { const text = String(value || '').slice(0, 10); return /^\d{4}-\d{2}-\d{2}$/.test(text) ? text : ''; };
const latestDate = (...dates) => dates.map(asDate).filter(Boolean).sort().at(-1) || '';
function addDays(date, days) {
  const parsed = new Date(`${date}T12:00:00Z`);
  parsed.setUTCDate(parsed.getUTCDate() + days);
  return parsed.toISOString().slice(0, 10);
}
export const tokenExpiryStart = (item = {}) => latestDate(item.activatedOn || item.createdAt, item.issuedAt, item.lastLessonDate, TOKEN_EXPIRY_FROM);
export const tokenExpiresOn = (item = {}) => latestDate(addDays(tokenExpiryStart(item), TOKEN_EXPIRY_DAYS), item.extendedUntil);
export const tokenPackageExpired = (item = {}, asOf = localDate()) => String(asOf).slice(0, 10) > tokenExpiresOn(item);

export function tokenSummary(packages = [], today = localDate()) {
  const counted = packages.filter((item) => COUNTED.has(item.status));
  const sum = (key) => counted.reduce((n, item) => n + num(item[key]), 0);
  return { balance: counted.filter((item) => !tokenPackageExpired(item, today)).reduce((n, item) => n + num(item.balanceCredits), 0), granted: sum('grantedCredits'), consumed: sum('consumedCredits'), packages: counted.filter((item) => item.status === 'active').length };
}

// the package of a token invoice (the server's id rule, functions/lesson-tokens-core.js tokenPackageId)
export const tokenPackageId = (invoiceId) => `tokens_${invoiceId}`.replace(/[^A-Za-z0-9_-]/g, '_').slice(0, 140);

const stateOf = (owed, left, expired, hasRows) => (owed > 0 ? 'owed' : !hasRows ? 'none' : left > 0 ? (left <= TOKENS_LOW ? 'low' : 'ok') : expired > 0 ? 'expired' : 'empty');

// Per package (oldest first, the order lessons take credits), per subject and in total: bought, held, left, expired
// (unused credits of an expired package: no longer „alles”, a lesson cannot take them) and the lessons held when no package
// of the subject had credits (owed: to be invoiced and paid; the next paid package of that subject takes them first).
// packages: studentPackages docs; owed: lessonPackageStates with status needs_attention ([{ lessonId, lessonDate, subject }]);
// card: the student card (the subject of old packages); today: the day expiry is read for.
export function tokenAccount({ packages = [], owed = [], card = null, today = localDate() } = {}) {
  const rows = packages.filter((item) => COUNTED.has(item.status))
    .sort((a, b) => `${a.issuedAt || ''}:${a.createdAt || ''}:${a.id || ''}`.localeCompare(`${b.issuedAt || ''}:${b.createdAt || ''}:${b.id || ''}`))
    .map((item) => {
      const bought = num(item.grantedCredits);
      const held = num(item.consumedCredits);
      const balance = num(item.balanceCredits);
      const isExpired = balance > 0 && tokenPackageExpired(item, today);
      const subject = packageSubject(item, card);
      return {
        id: item.id,
        invoiceId: item.sourceInvoiceId || '',
        invoiceNum: item.sourceInvoiceNum || '',
        issuedAt: item.issuedAt || '',
        name: item.packageProductName || '',
        subject,
        subjectKey: tokenSubjectKey(subject),
        bought,
        held,
        left: isExpired ? 0 : balance,
        expired: isExpired ? balance : 0,
        expiresOn: balance > 0 ? tokenExpiresOn(item) : '',
        // a correction („Parandus”, financeApi /student-packages/adjust) added or removed credits
        corrected: balance + held - bought,
        usedUp: balance <= 0,
      };
    });
  const owedLessons = owed.filter((item) => item && item.status !== 'cleared' && item.status !== 'consumed')
    .sort((a, b) => String(a.lessonDate || '').localeCompare(String(b.lessonDate || '')));
  const total = (list, key) => list.reduce((n, row) => n + row[key], 0);
  const groups = new Map();
  const group = (subject, key) => {
    if (!groups.has(key)) groups.set(key, { key, subject, rows: [], owedLessons: [] });
    return groups.get(key);
  };
  rows.forEach((row) => group(row.subject, row.subjectKey).rows.push(row));
  owedLessons.forEach((item) => {
    const subject = subjectName(item.subject) || onlySubject(card);
    group(subject, tokenSubjectKey(subject)).owedLessons.push(item);
  });
  const subjects = [...groups.values()].map((item) => {
    const left = total(item.rows, 'left');
    const expired = total(item.rows, 'expired');
    const owedTotal = owedCredits(item.owedLessons);
    // the first package lessons take from: its last day is the one that matters
    const expiresOn = item.rows.find((row) => row.left > 0)?.expiresOn || '';
    return { ...item, bought: total(item.rows, 'bought'), held: total(item.rows, 'held'), left, expired, owed: owedTotal, expiresOn, state: stateOf(owedTotal, left, expired, item.rows.length > 0) };
  });
  const left = total(rows, 'left');
  const expired = total(rows, 'expired');
  const owedTotal = owedCredits(owedLessons);
  return { rows, subjects, bought: total(rows, 'bought'), held: total(rows, 'held'), left, expired, owed: owedTotal, owedLessons, state: stateOf(owedTotal, left, expired, rows.length > 0) };
}

const tunde = (n) => `${n} ${n === 1 ? 'tund' : 'tundi'}`;
const shortDate = (value) => { const m = String(value || '').match(/^(\d{4})-(\d{2})-(\d{2})/); return m ? `${m[3]}.${m[2]}.${m[1]}` : ''; };

// the lines the student / parent reads: one per subject, with the subject's name
export function tokenLines(account) {
  if (!account) return [];
  const several = account.subjects.length > 1;
  return account.subjects.filter((item) => item.rows.length).map((item) => {
    const parts = [item.owed > 0 ? `Pakett on läbi · ${tunde(item.owed)} ootab tasumist` : `Paketist alles ${tunde(item.left)}`];
    if (item.expired > 0) parts.push(`aegunud ${tunde(item.expired)}`);
    if (item.left > 0 && item.expiresOn) parts.push(`kehtib kuni ${shortDate(item.expiresOn)}`);
    const name = item.subject || (several ? 'ilma aineta' : '');
    if (name) parts.push(name);
    return parts.join(' · ');
  });
}
export const tokenLine = (account) => tokenLines(account).join(' | ');

// the owed credits a token invoice of this subject shows (a state from before subjects shows on every invoice)
export function owedForSubject(owed = [], subject = '') {
  const key = tokenSubjectKey(subject);
  return owedCredits(owed.filter((item) => !key || !item.subject || tokenSubjectKey(item.subject) === key));
}

// the line under a token invoice in the finance month view: before payment, waiting to be credited, or bought / held /
// left of its package; owed lessons of the student are shown on their newest token invoice (showOwed)
export function tokenInvoiceUsage(invoice = {}, studentPackage = null, { owed = 0, showOwed = false, today = localDate() } = {}) {
  const credits = num(invoice.tokenCredits);
  const parts = [`Tunnipakett · ${credits} tundi`];
  if (invoice.tokenStatus === 'credited') {
    if (studentPackage) {
      const left = num(studentPackage.balanceCredits);
      parts.push(`peetud ${num(studentPackage.consumedCredits)}`, left <= 0 ? 'läbi' : tokenPackageExpired(studentPackage, today) ? `aegunud ${left}` : `alles ${left}`);
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
