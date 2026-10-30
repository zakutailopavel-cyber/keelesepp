'use strict';

// Lesson tokens (owner 2026-10-14, docs/LESSON_TOKENS.md): an invoice for N lessons at the card's lesson price; once the
// invoice is paid and the administrator confirms, the card gets a lesson package of N credits (studentPackages +
// packageLedger, the existing ledger); every chargeable lesson then takes one credit, a corrected mark gives it back.
// Pure helpers; the routes are manualInvoiceApi /create-tokens and financeApi /invoices/tokens/credit, the lesson
// trigger is syncLessonTokens in index.js.

const { subjectName, enrollmentsOf, cardSubject } = require('./student-enrollments-core');
const { selectStudentPackageForLesson } = require('./finance-core');
const { appToday } = require('./local-date-core');

const clean = (value, max = 300) => String(value || '').trim().slice(0, max);
const fail = (status, message) => Object.assign(new Error(message), { status });
const euros = (cents) => (cents / 100).toFixed(2).replace('.', ',');

function tokenInvoiceInput(values = {}) {
  const studentId = clean(values.studentId, 160);
  if (!studentId) throw fail(400, 'Vali õpilane.');
  const lessons = Number(values.lessons);
  if (!Number.isInteger(lessons) || lessons < 1 || lessons > 100) throw fail(400, 'Tundide arv peab olema 1–100.');
  const due = clean(values.due, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(due) || Number.isNaN(new Date(`${due}T12:00:00Z`).getTime())) throw fail(400, 'Lisa maksetähtaeg.');
  const subject = subjectName(clean(values.subject, 80));
  return { studentId, lessons, due, note: clean(values.note, 500), ...(subject ? { subject } : {}) };
}

// the price comes from the card's private plan, never from the request
function tokenInvoiceLines({ lessons, plan = {}, subject = '' }) {
  const priceCents = Math.max(0, Math.round(Number(plan.lessonPriceCents) || 0));
  if (!priceCents) throw fail(400, 'Õpilasel puudub tunnihind: määra see õpilase kaardil (Finantsid → Arveldus).');
  const minutes = Number(plan.lessonMinutes) || 60;
  const amountCents = lessons * priceCents;
  const label = subject ? `Tunnipakett (${subject})` : 'Tunnipakett';
  return {
    priceCents,
    minutes,
    amountCents,
    description: `${label}: ${lessons} tundi`,
    lines: [{ type: 'lesson_tokens', description: `${label}: ${lessons} × ${minutes} min × ${euros(priceCents)} €`, quantity: lessons, unit: 'tund', unitPriceCents: priceCents, amountCents, amount: amountCents / 100 }],
  };
}

const isTokenInvoice = (invoice = {}) => invoice.billingMode === 'lesson_tokens_v1';

function invoicePaid(invoice = {}) {
  if (invoice.status === 'Tühistatud') return false;
  if (invoice.status === 'Makstud' || invoice.paymentStatus === 'paid') return true;
  const paid = Number(invoice.paidAmountCents) || Math.round((Number(invoice.paidAmount) || 0) * 100);
  const due = Number.isFinite(Number(invoice.balanceDueCents)) ? Number(invoice.balanceDueCents) : Math.round((Number(invoice.balanceDue) || 0) * 100);
  return paid > 0 && due <= 0;
}

// why the tokens of this invoice cannot be credited (empty = they can)
function creditBlocker(invoice) {
  if (!invoice) return 'Arvet ei leitud.';
  if (!isTokenInvoice(invoice)) return 'See ei ole tunnipaketi arve.';
  if (invoice.tokenStatus === 'credited') return '';
  // credited in full or replaced by a corrected invoice (invoice-correction-core.js): the new invoice gives the lessons
  if (invoice.tokenStatus === 'voided' || invoice.status === 'Krediteeritud') return 'Arve on krediteeritud — tunde sellelt arvelt ei lisata.';
  if (!invoicePaid(invoice)) return 'Arve ei ole veel makstud.';
  return '';
}

const tokenPackageId = (invoiceId) => `tokens_${invoiceId}`.replace(/[^A-Za-z0-9_-]/g, '_').slice(0, 140);

function tokenPackageRecord({ invoice, invoiceId, student = {}, issuedAt, nowIso, actor }) {
  const credits = Number(invoice.tokenCredits) || 0;
  return {
    studentId: invoice.studentId,
    studentName: student.name || invoice.studentName || '—',
    packageProductId: '',
    packageProductName: `Tunnipakett ${credits} tundi (arve ${invoice.num || invoiceId})`,
    productType: 'lesson_package',
    lessonCredits: credits,
    grantedCredits: credits,
    balanceCredits: credits,
    consumedCredits: 0,
    adjustmentCreditCredits: 0,
    adjustmentDebitCredits: 0,
    ledgerEntryCount: 1,
    priceCents: Number(invoice.amountCents) || 0,
    price: (Number(invoice.amountCents) || 0) / 100,
    lessonPriceCents: Number(invoice.lessonPriceCents) || 0,
    currency: 'EUR',
    issuedAt,
    status: 'active',
    sourceType: 'invoice_payment',
    sourceInvoiceId: invoiceId,
    sourceInvoiceNum: invoice.num || '',
    // the invoice's subject; an invoice without one: the card's only subject, else the shared pool ('')
    subject: subjectName(invoice.subject) || cardSubject(student),
    activatedOn: appToday(nowIso),
    createdAt: nowIso,
    createdBy: actor,
    updatedAt: nowIso,
    requestId: tokenPackageId(invoiceId),
  };
}

// one credit for a held lesson, and for a no-show without notice when the card's plan charges it (the same rule as
// the monthly invoices: crm-v2 finance/monthlyBilling.js isChargeable)
// A held lesson the school pays itself („Kooli kulul”, owner 2026-10-19) takes no credit: the teacher's hour counts, the
// student pays nothing; a credit it already took comes back.
function lessonTakesToken(lesson = {}, plan = {}) {
  if (lesson.status === 'Toimunud') return lesson.billingStatus !== 'school_covered';
  if (lesson.status === 'Puudus_eta') return plan.chargeNoShow !== false && !lesson.billingWaived;
  return false;
}

// Credits per lesson (owner 2026-10-29): one per full hour, at least one — 45 / 60 / 90 min = 1, a double lesson of
// 120 min = 2, 180 min = 3. A lesson without a length counts as 60 min. The same number is given back when the mark is
// corrected or removed (the lesson's package state keeps it). crm-v2 services/firebase/lessonTokens.js has the same rule.
const TOKEN_MINUTES = 60;
const TOKENS_PER_LESSON = 1; // the minimum
function lessonTokenCost(lesson = {}) {
  const minutes = Number(lesson.duration ?? lesson.durationMinutes) || TOKEN_MINUTES;
  return Math.max(TOKENS_PER_LESSON, Math.floor(minutes / TOKEN_MINUTES));
}

// A lesson held while no package had credits is owed („võlg”, lessonPackageStates status needs_attention). The next
// paid package pays it first (oldest owed lesson first), even though that package is dated after the lesson.
const OWED_LESSONS_TAKE_NEXT_PACKAGE = true;

const isTokenPackage = (item = {}) => item.sourceType === 'invoice_payment' && item.productType === 'lesson_package';
const fifoKey = (item = {}) => `${item.issuedAt || ''}:${item.createdAt || ''}:${item.id || ''}`;

// the package that pays an owed lesson when no package dated on or before the lesson has credits: the oldest paid token
// package with credits left (FIFO); null when there is none or the rule is off
function packageForOwedLesson(packages = [], { enabled = OWED_LESSONS_TAKE_NEXT_PACKAGE, credits = 1 } = {}) {
  if (!enabled) return null;
  const needed = Math.max(1, Math.floor(Number(credits)) || 1);
  return (Array.isArray(packages) ? packages : [])
    .filter((item) => item && item.id && isTokenPackage(item) && item.status === 'active' && Number.isInteger(item.balanceCredits) && item.balanceCredits >= needed)
    .sort((a, b) => fifoKey(a).localeCompare(fifoKey(b)))[0] || null;
}

// the lessons a newly credited package takes, oldest first: every lesson since the invoice date (held while the payment
// was on its way) and every owed lesson of the card, whatever its date. lessons: [{ id, date }]; owedLessonIds: ids.
// With subjectKey (a package of one subject) only that subject's lessons; onlyOwed (an extended package): not the lessons
// since the invoice date.
function tokenBacklogLessonIds({ lessons = [], issuedAt = '', owedLessonIds = [], owedFirst = OWED_LESSONS_TAKE_NEXT_PACKAGE, subjectKey = '', onlyOwed = false } = {}) {
  const owed = new Set(owedFirst ? owedLessonIds : []);
  return lessons
    .filter((lesson) => lesson && lesson.id && (!subjectKey || lesson.subjectKey === subjectKey) && (owed.has(lesson.id) || (!onlyOwed && String(lesson.date || '') >= String(issuedAt || ''))))
    .sort((a, b) => `${a.date || ''}:${a.id}`.localeCompare(`${b.date || ''}:${b.id}`))
    .map((lesson) => lesson.id);
}

// ---- One package per subject (owner 2026-10-30, „вести отдельный пакет на каждый предмет”) ----
// A package belongs to one subject (study direction); a lesson takes only its own subject's packages (FIFO), debt is per
// subject. crm-v2 studyDirections.js directionId + DEFAULT_DIRECTIONS are the same rule (a parity test keeps them equal).
const SUBJECT_ALIASES = { eesti: 'Eesti keel', estonian: 'Eesti keel', english: 'Inglise keel', inglise: 'Inglise keel', matem: 'Matemaatika', 'eesti keel emakeelena': 'Emakeel', russian: 'Vene keel' };
function tokenSubjectKey(subject) {
  const low = clean(subject, 120).replace(/\s+/g, ' ').toLocaleLowerCase('et');
  if (!low) return '';
  return clean(SUBJECT_ALIASES[low] || low, 120).toLocaleLowerCase('et').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60);
}

// the subject of a package; '' = the shared pool („ilma aineta”). No data is rewritten: an old package without a subject
// takes the card's only subject, and on a card with several it stays shared. (A package made from an invoice holds the
// invoice's subject since it was credited, so the invoice itself need not be read.)
const packageSubject = (item = {}, card = {}) => subjectName(item.subject) || cardSubject(card);
const packageSubjectKey = (item = {}, card = {}) => tokenSubjectKey(packageSubject(item, card));

// the subject a lesson belongs to: its own, its teacher's track, the card's only one, else the card's main one (the same
// order as the monthly invoices, crm-v2 finance/monthlyBilling.js)
function lessonSubject(lesson = {}, card = {}) {
  const own = subjectName(lesson.subject);
  if (own) return own;
  const tracks = enrollmentsOf(card).filter((track) => track.active);
  const teacher = clean(lesson.teacher).toLocaleLowerCase('et');
  const byTeacher = tracks.find((track) => (lesson.teacherUid && track.teacherUid === lesson.teacherUid) || (teacher && track.teacher.toLocaleLowerCase('et') === teacher));
  return byTeacher?.subject || cardSubject(card) || subjectName(card.subject) || tracks[0]?.subject || '';
}

// the subject of a new package invoice: a card with several subjects has to name one, and only one of its own
function tokenInvoiceSubject(requested, card = {}) {
  const subjects = [...new Set(enrollmentsOf(card).filter((track) => track.active).map((track) => track.subject))];
  const key = tokenSubjectKey(requested);
  if (key) {
    const found = subjects.find((subject) => tokenSubjectKey(subject) === key);
    if (!found) throw fail(400, 'Õpilasel ei ole seda ainet.');
    return found;
  }
  if (subjects.length > 1) throw fail(400, 'Vali aine: õpilasel on mitu ainet ja pakett kuulub ühele neist.');
  return subjects[0] || subjectName(card.subject);
}

// ---- Expiry (owner 2026-10-30, „неиспользованные уроки сгорают через 14 дней”, docs/LESSON_TOKENS.md) ----
// Nothing is written when a package expires and nothing is refunded or re-invoiced: every reader derives it from the
// package. The owner said only „14 days”: the reading „14 days without use” sits in tokenExpiryStart alone.
const TOKEN_EXPIRY_DAYS = 14;
// packages from before the rule start counting here, never earlier: nothing burns retroactively. Set to the deployment day.
const TOKEN_EXPIRY_FROM = '2026-10-30';

const DATE = /^\d{4}-\d{2}-\d{2}$/;
const asDate = (value) => { const text = String(value || '').slice(0, 10); return DATE.test(text) ? text : ''; };
const latestDate = (...dates) => dates.map(asDate).filter(Boolean).sort().at(-1) || '';
function addDays(date, days) {
  const parsed = new Date(`${date}T12:00:00Z`);
  parsed.setUTCDate(parsed.getUTCDate() + days);
  return parsed.toISOString().slice(0, 10);
}

// the day the package reached the card: „Lisa tunnid”, pressed only after payment, so it is the payment date or later
const packageActivatedOn = (item = {}) => latestDate(item.activatedOn || item.createdAt, item.issuedAt);

// THE RULE, in one place: the 14 days run from the last lesson held from this package; before its first lesson, from
// the day it was paid and added. An owed lesson dated before the payment cannot start the count earlier (latestDate).
function tokenExpiryStart(item = {}) {
  return latestDate(packageActivatedOn(item), item.lastLessonDate, TOKEN_EXPIRY_FROM);
}
// the last day its lessons can be used; an administrator's extension can only move it later
function tokenExpiresOn(item = {}) {
  return latestDate(addDays(tokenExpiryStart(item), TOKEN_EXPIRY_DAYS), item.extendedUntil);
}
// asOf: for a lesson its own date (a lesson held in time and marked late still takes a credit), for a view today
const tokenPackageExpired = (item = {}, asOf = '') => String(asOf).slice(0, 10) > tokenExpiresOn(item);

// a lesson's date moves the count on; an owed lesson older than the last one does not move it back
const lastLessonDateAfter = (item = {}, lessonDate = '') => latestDate(item.lastLessonDate, lessonDate);

// after a corrected or removed mark: the newest lesson still held from this package ('' = none). entries: its ledger;
// restoredEntryId: the consumption being given back now (its restoration entry is not in the ledger yet).
function lastHeldLessonDate(entries = [], { restoredEntryId = '' } = {}) {
  const restored = new Set([restoredEntryId, ...entries.map((entry) => entry.restoresLedgerEntryId)].filter(Boolean));
  return latestDate(...entries.filter((entry) => entry.entryType === 'lesson_consumption' && !restored.has(entry.id)).map((entry) => entry.lessonDate));
}

// the package a lesson takes: its subject's own packages first (FIFO), then the shared pool; expired ones never.
// Within each: one dated on or before the lesson, else the oldest token package with credits (the owed-lesson rule).
function packageForLesson(packages = [], { subjectKey = '', card = {}, lessonDate, requestedPackageId = '', preferredPackageId = '', credits = 1 } = {}) {
  const alive = (Array.isArray(packages) ? packages : []).filter((item) => item && !tokenPackageExpired(item, lessonDate));
  const own = alive.filter((item) => packageSubjectKey(item, card) === subjectKey);
  const shared = alive.filter((item) => !packageSubjectKey(item, card));
  // a requested package has to be usable by this lesson: selectStudentPackageForLesson refuses otherwise
  if (requestedPackageId) return selectStudentPackageForLesson([...own, ...shared], { lessonDate, requestedPackageId, credits });
  for (const tier of [own, shared]) {
    const found = selectStudentPackageForLesson(tier, { lessonDate, preferredPackageId, credits }) || packageForOwedLesson(tier, { credits });
    if (found) return found;
  }
  return null;
}

// a subject the card has no package for is not on packages (e.g. Estonian on packages, maths by monthly invoice): its
// lessons take nothing and owe nothing, as a card without a package
const subjectUsesPackages = (packages = [], subjectKey = '', card = {}) => packages.some((item) => item && item.productType === 'lesson_package' && [subjectKey, ''].includes(packageSubjectKey(item, card)));

// an administrator's extension of a package: to the given day, by default TOKEN_EXPIRY_DAYS from today
function tokenExtensionUntil(item = {}, { today, until = '' } = {}) {
  if (!Number.isInteger(item.balanceCredits) || item.balanceCredits <= 0) throw fail(409, 'Paketis ei ole kasutamata tunde.');
  const target = until ? asDate(until) : addDays(today, TOKEN_EXPIRY_DAYS);
  if (!target) throw fail(400, 'Vigane kuupäev.');
  if (target <= today || target <= tokenExpiresOn(item)) throw fail(409, `Pakett kehtib juba kuni ${tokenExpiresOn(item)}: pikendada saab ainult hilisema kuupäevani.`);
  return target;
}

module.exports = { TOKEN_EXPIRY_DAYS, TOKEN_EXPIRY_FROM, tokenSubjectKey, packageSubject, packageSubjectKey, lessonSubject, tokenInvoiceSubject, packageActivatedOn, tokenExpiryStart, tokenExpiresOn, tokenPackageExpired, lastLessonDateAfter, lastHeldLessonDate, packageForLesson, subjectUsesPackages, tokenExtensionUntil, TOKEN_MINUTES, TOKENS_PER_LESSON, lessonTokenCost, OWED_LESSONS_TAKE_NEXT_PACKAGE, isTokenPackage, packageForOwedLesson, tokenBacklogLessonIds, tokenInvoiceInput, tokenInvoiceLines, isTokenInvoice, invoicePaid, creditBlocker, tokenPackageId, tokenPackageRecord, lessonTakesToken };
