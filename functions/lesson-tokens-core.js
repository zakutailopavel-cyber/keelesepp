'use strict';

// Lesson tokens (owner 2026-10-14, docs/LESSON_TOKENS.md): an invoice for N lessons at the card's lesson price; once the
// invoice is paid and the administrator confirms, the card gets a lesson package of N credits (studentPackages +
// packageLedger, the existing ledger); every chargeable lesson then takes one credit, a corrected mark gives it back.
// Pure helpers; the routes are manualInvoiceApi /create-tokens and financeApi /invoices/tokens/credit, the lesson
// trigger is syncLessonTokens in index.js.

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
  return { studentId, lessons, due, note: clean(values.note, 500) };
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
    subject: invoice.subject || student.subject || '',
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

// One held lesson takes one credit, whatever its length (a 90-min lesson on a 60-min plan is still one credit). The
// package invoice prices N × the plan's lesson length, so a longer lesson is the owner's question (docs/LESSON_TOKENS.md
// „Lahtised küsimused”); the ledger movement itself is ±1 (finance-core packageBalanceAfterLessonMovement).
const TOKENS_PER_LESSON = 1;

// A lesson held while no package had credits is owed („võlg”, lessonPackageStates status needs_attention). The next
// paid package pays it first (oldest owed lesson first), even though that package is dated after the lesson.
const OWED_LESSONS_TAKE_NEXT_PACKAGE = true;

const isTokenPackage = (item = {}) => item.sourceType === 'invoice_payment' && item.productType === 'lesson_package';
const fifoKey = (item = {}) => `${item.issuedAt || ''}:${item.createdAt || ''}:${item.id || ''}`;

// the package that pays an owed lesson when no package dated on or before the lesson has credits: the oldest paid token
// package with credits left (FIFO); null when there is none or the rule is off
function packageForOwedLesson(packages = [], { enabled = OWED_LESSONS_TAKE_NEXT_PACKAGE } = {}) {
  if (!enabled) return null;
  return (Array.isArray(packages) ? packages : [])
    .filter((item) => item && item.id && isTokenPackage(item) && item.status === 'active' && Number.isInteger(item.balanceCredits) && item.balanceCredits > 0)
    .sort((a, b) => fifoKey(a).localeCompare(fifoKey(b)))[0] || null;
}

// the lessons a newly credited package takes, oldest first: every lesson since the invoice date (held while the payment
// was on its way) and every owed lesson of the card, whatever its date. lessons: [{ id, date }]; owedLessonIds: ids.
function tokenBacklogLessonIds({ lessons = [], issuedAt = '', owedLessonIds = [], owedFirst = OWED_LESSONS_TAKE_NEXT_PACKAGE } = {}) {
  const owed = new Set(owedFirst ? owedLessonIds : []);
  return lessons
    .filter((lesson) => lesson && lesson.id && (owed.has(lesson.id) || String(lesson.date || '') >= String(issuedAt || '')))
    .sort((a, b) => `${a.date || ''}:${a.id}`.localeCompare(`${b.date || ''}:${b.id}`))
    .map((lesson) => lesson.id);
}

module.exports = { TOKENS_PER_LESSON, OWED_LESSONS_TAKE_NEXT_PACKAGE, isTokenPackage, packageForOwedLesson, tokenBacklogLessonIds, tokenInvoiceInput, tokenInvoiceLines, isTokenInvoice, invoicePaid, creditBlocker, tokenPackageId, tokenPackageRecord, lessonTakesToken };
