'use strict';

// Lesson tokens (owner 2026-10-14, docs/LESSON_TOKENS.md): an invoice for N lessons at the card's lesson price; once the
// invoice is paid and the administrator confirms, the card gets a lesson package of N credits (studentPackages +
// packageLedger, the existing ledger); every chargeable lesson then takes one credit, a corrected mark gives it back.
// Pure helpers; the routes are manualInvoiceApi /create-tokens and financeApi /invoices/tokens/credit, the lesson
// trigger is syncLessonTokens in index.js.

const { subjectName, enrollmentsOf } = require('./student-enrollments-core');

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

// ---- One package invoice for a family („Ühine tunnipakett”, owner 2026-11-04) ----
// A parent paying for several children (or one child's two subjects, each at its own price) gets ONE invoice: one
// number, one PDF, one e-mail, one payment. Every line keeps its card and subject (`cardParts`), and „Lisa tunnid” gives
// every line its own package on its own card: studentPackages/tokens_<invoiceId>_<lineIndex>. The invoice is made by
// manualInvoiceApi /create-tokens-combined (combined-invoice-core.js combinedTokenRecord).

// the package of one line of a combined package invoice (invoice ids are ≤ 120 characters, so the index is never cut)
const tokenPartPackageId = (invoiceId, index) => `tokens_${invoiceId}_${index}`.replace(/[^A-Za-z0-9_-]/g, '_').slice(0, 140);

const isCombinedTokenInvoice = (invoice = {}) => isTokenInvoice(invoice) && invoice.combined === true && Array.isArray(invoice.cardParts) && invoice.cardParts.length > 0;

// what „Lisa tunnid” credits: one part per package. A one-card invoice is one part (its old package id); a combined
// invoice has one part per line, each with its own card, subject, lessons and price.
function tokenInvoiceParts(invoiceId, invoice = {}) {
  if (!isCombinedTokenInvoice(invoice)) {
    return [{
      index: 0, packageId: tokenPackageId(invoiceId), studentId: invoice.studentId, studentName: invoice.studentName || '',
      subject: invoice.subject || '', tokenCredits: Number(invoice.tokenCredits) || 0,
      amountCents: Number(invoice.amountCents) || 0, priceCents: Number(invoice.lessonPriceCents) || 0, combined: false,
    }];
  }
  return invoice.cardParts.map((part, index) => ({
    index, packageId: tokenPartPackageId(invoiceId, index), studentId: part.studentId, studentName: part.studentName || '',
    subject: part.subject || '', tokenCredits: Number(part.tokenCredits) || 0,
    amountCents: Number(part.amountCents) || 0, priceCents: Number(part.priceCents) || 0, combined: true,
  }));
}

// the input of a combined package invoice: 2–12 lines { studentId, subject, lessons }, one due date; every line is
// checked like a one-card package invoice (tokenInvoiceInput); a card and subject only once
function combinedTokenInput(values = {}) {
  const items = values.items;
  if (!Array.isArray(items) || items.length < 2 || items.length > 12) throw fail(400, 'Ühisele tunnipaketile vali 2–12 rida.');
  const lines = items.map((item) => tokenInvoiceInput({ studentId: item?.studentId, lessons: item?.lessons, subject: item?.subject, due: values.due }));
  const keys = lines.map((line) => `${line.studentId}|${tokenSubjectKey(line.subject)}`);
  if (new Set(keys).size !== keys.length) throw fail(400, 'Iga õpilane ja aine võib ühisel tunnipaketil olla üks kord.');
  return {
    due: lines[0].due,
    note: clean(values.note, 500),
    items: lines.map(({ studentId, lessons, subject }) => ({ studentId, lessons, ...(subject ? { subject } : {}) })),
  };
}

// part (tokenInvoiceParts): the line of a combined invoice this package is for; without it the whole one-card invoice
function tokenPackageRecord({ invoice, invoiceId, student = {}, issuedAt, nowIso, actor, part = null }) {
  const credits = part ? part.tokenCredits : (Number(invoice.tokenCredits) || 0);
  const amountCents = part ? part.amountCents : (Number(invoice.amountCents) || 0);
  const subject = part ? part.subject : invoice.subject;
  return {
    studentId: part ? part.studentId : invoice.studentId,
    studentName: student.name || (part && part.studentName) || invoice.studentName || '—',
    packageProductId: '',
    packageProductName: `Tunnipakett ${credits} tundi (arve ${invoice.num || invoiceId}${part && part.combined ? `, rida ${part.index + 1}` : ''})`,
    productType: 'lesson_package',
    lessonCredits: credits,
    grantedCredits: credits,
    balanceCredits: credits,
    consumedCredits: 0,
    adjustmentCreditCredits: 0,
    adjustmentDebitCredits: 0,
    ledgerEntryCount: 1,
    priceCents: amountCents,
    price: amountCents / 100,
    lessonPriceCents: part ? part.priceCents : (Number(invoice.lessonPriceCents) || 0),
    currency: 'EUR',
    issuedAt,
    status: 'active',
    sourceType: 'invoice_payment',
    sourceInvoiceId: invoiceId,
    sourceInvoiceNum: invoice.num || '',
    // the line of a combined invoice (one family invoice, a package per line)
    ...(part && part.combined ? { sourceInvoiceLine: part.index } : {}),
    subject: subject || student.subject || '',
    // the subject whose lessons this package pays (owner bug 2026-11-03); only invoices made with a chosen subject have
    // one. A package without tokenSubject is the shared pool: it pays every lesson of the card, as before.
    ...(subjectName(subject) ? { tokenSubject: subjectName(subject) } : {}),
    createdAt: nowIso,
    createdBy: actor,
    updatedAt: nowIso,
    requestId: part ? part.packageId : tokenPackageId(invoiceId),
  };
}

// one credit for a held lesson, and for a no-show without notice when the card's plan charges it (the same rule as
// the monthly invoices: crm-v2 finance/monthlyBilling.js isChargeable)
// A held lesson the school pays itself („Kooli kulul”, owner 2026-10-19) takes no credit: the teacher's hour counts, the
// student pays nothing; a credit it already took comes back.
function lessonTakesToken(lesson = {}, plan = {}) {
  // paid in cash at the lesson (owner 2026-11-10, review D1 2026-11-11): no credit; a credit it took comes back, and
  // undoing the cash mark (the flag goes) takes it again
  if (lesson.cashPaid && lesson.cashPaid.receiptId) return false;
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
// subjectKey (a package of one subject): only the lessons of that subject (lessons then carry their own subjectKey).
function tokenBacklogLessonIds({ lessons = [], issuedAt = '', owedLessonIds = [], owedFirst = OWED_LESSONS_TAKE_NEXT_PACKAGE, subjectKey = '' } = {}) {
  const owed = new Set(owedFirst ? owedLessonIds : []);
  return lessons
    .filter((lesson) => lesson && lesson.id && (!subjectKey || lesson.subjectKey === subjectKey) && (owed.has(lesson.id) || String(lesson.date || '') >= String(issuedAt || '')))
    .sort((a, b) => `${a.date || ''}:${a.id}`.localeCompare(`${b.date || ''}:${b.id}`))
    .map((lesson) => lesson.id);
}

// ---- A package for one subject (Oleksiy 2026-11-03: „при составлении туннипакета нет возможности выбрать курс”) ----
// A card may study several subjects, each at its own price (studentRevenuePlans.subjectPrices). A package invoice names
// one subject; its package then pays only that subject's lessons. Packages without a subject (all made before) stay one
// shared pool and pay every lesson of the card, exactly as before.

// one key per subject: case, spaces, diacritics and the built-in aliases do not matter („English” = „Inglise keel”;
// crm-v2 studyDirections.js DEFAULT_DIRECTIONS aliases and services/firebase/lessonTokens.js tokenSubjectKey)
const SUBJECT_ALIASES = { eesti: 'Eesti keel', estonian: 'Eesti keel', english: 'Inglise keel', inglise: 'Inglise keel', matem: 'Matemaatika', 'eesti keel emakeelena': 'Emakeel', russian: 'Vene keel' };
function tokenSubjectKey(subject) {
  const low = clean(subject, 120).replace(/\s+/g, ' ').toLocaleLowerCase('et');
  if (!low) return '';
  return clean(SUBJECT_ALIASES[low] || low, 120).toLocaleLowerCase('et').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60);
}

// the subjects a card is taught (its active tracks, as written on the card; a card that names none has [])
function cardSubjects(card = {}) {
  const list = Array.isArray(card.enrollments) && card.enrollments.length ? card.enrollments : [card];
  return [...new Set(list.filter((track) => track && track.active !== false && track.status !== 'ended')
    .map((track) => subjectName(track.subject || card.subject)).filter(Boolean))];
}

// the subject of a new package invoice: one of the card's own subjects; a card with one subject gets it without asking;
// a card with several has to name one; a card that names none may take any subject of the school
function tokenInvoiceSubject(requested, card = {}) {
  const subjects = cardSubjects(card);
  const key = tokenSubjectKey(requested);
  if (key) {
    if (!subjects.length) return subjectName(requested);
    const found = subjects.find((subject) => tokenSubjectKey(subject) === key);
    if (!found) throw fail(400, 'Õpilasel ei ole seda ainet: vali üks tema ainetest.');
    return found;
  }
  if (subjects.length > 1) throw fail(400, 'Vali aine: õpilasel on mitu ainet ja pakett kuulub ühele neist.');
  return subjects[0] || '';
}

// the subject a lesson belongs to: its own when the card has it (a schedule entry without a subject is written as
// „Eesti keel”), else its teacher's track, else the card's only subject, else its own, else the card's main subject
// (the order of the monthly invoices, crm-v2 students/subjects.js itemSubject)
function lessonSubject(lesson = {}, card = {}) {
  const subjects = cardSubjects(card);
  const own = subjectName(lesson.subject);
  if (own && (!subjects.length || subjects.some((subject) => tokenSubjectKey(subject) === tokenSubjectKey(own)))) return own;
  const teacher = clean(lesson.teacher).toLocaleLowerCase('et');
  const byTeacher = enrollmentsOf(card).filter((track) => track.active)
    .find((track) => (lesson.teacherUid && track.teacherUid === lesson.teacherUid) || (teacher && track.teacher.toLocaleLowerCase('et') === teacher));
  if (byTeacher) return byTeacher.subject;
  if (subjects.length === 1) return subjects[0];
  return own || subjectName(card.subject) || subjects[0] || '';
}

// '' = the shared pool (a package without a subject)
const packageSubjectKey = (item = {}) => tokenSubjectKey(item.tokenSubject);
const hasSubjectPackages = (packages = []) => (Array.isArray(packages) ? packages : []).some((item) => item && packageSubjectKey(item));

// the packages a lesson of this subject may take, in the order it tries them: its subject's own packages, then the
// shared pool. null = the card has packages only for other subjects: this lesson is not on packages (it takes nothing
// and owes nothing, e.g. English on packages and maths by monthly invoice).
function packageTiersForLesson(packages = [], subjectKey = '') {
  const list = (Array.isArray(packages) ? packages : []).filter(Boolean);
  if (!hasSubjectPackages(list)) return [list];
  const own = subjectKey ? list.filter((item) => packageSubjectKey(item) === subjectKey) : [];
  const shared = list.filter((item) => !packageSubjectKey(item));
  if (!own.length && !shared.length) return null;
  return [own, shared].filter((tier) => tier.length);
}

module.exports = { tokenPartPackageId, isCombinedTokenInvoice, tokenInvoiceParts, combinedTokenInput, tokenSubjectKey, cardSubjects, tokenInvoiceSubject, lessonSubject, packageSubjectKey, hasSubjectPackages, packageTiersForLesson, TOKEN_MINUTES, TOKENS_PER_LESSON, lessonTokenCost, OWED_LESSONS_TAKE_NEXT_PACKAGE, isTokenPackage, packageForOwedLesson, tokenBacklogLessonIds, tokenInvoiceInput, tokenInvoiceLines, isTokenInvoice, invoicePaid, creditBlocker, tokenPackageId, tokenPackageRecord, lessonTakesToken };
