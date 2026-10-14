'use strict';

// One invoice for several student cards of one payer (owner / Oleksiy 2026-10-14, high priority): a student learning
// English and Estonian (two cards, one per subject) and a parent with several children get ONE invoice — one number,
// one PDF, one e-mail, one payment. Every line keeps its card (studentId, subject), and `cardParts` keeps the month's
// units per card, so next month's difference and every card's balance are still counted per card.
// Pure helpers; the routes are /monthly-combined and /create-combined in manual-invoice-api.js.

const { manualInvoiceRecord } = require('./manual-invoice-core');
const { monthlyInvoiceLines, monthLabel } = require('./monthly-invoice-core');

const clean = (value, max = 160) => String(value || '').trim().slice(0, max);
const fail = (status, message) => Object.assign(new Error(message), { status });

// who pays for this card: the linked parent account, else the payer / parent e-mail, else the learner's name
function payerKey(card = {}) {
  const parentUid = clean(card.linkedParentId || card.parentUid || card.guardianUid);
  if (parentUid) return `parent:${parentUid}`;
  const email = clean(card.payerEmail || card.parentEmail || card.contactEmail || card.email, 254).toLowerCase();
  if (email) return `email:${email}`;
  return `name:${clean(card.name).toLocaleLowerCase('et')}`;
}

function sameCardsInput(items = []) {
  if (!Array.isArray(items) || items.length < 2 || items.length > 12) throw fail(400, 'Ühisarvele vali 2–12 kaarti.');
  const ids = items.map((item) => clean(item?.studentId));
  if (ids.some((id) => !id) || new Set(ids).size !== ids.length) throw fail(400, 'Iga kaart võib ühisarvel olla üks kord.');
  return ids;
}

function checkOnePayer(cards = []) {
  const keys = new Set(cards.map(payerKey));
  if (keys.size > 1) throw fail(409, 'Kaartidel on erinev maksja: ühisarve on ühe maksja kaartidele (sama õpilane või ühe lapsevanema lapsed).');
}

const nameList = (cards) => [...new Set(cards.map((card) => clean(card.name)).filter(Boolean))];
const subjectOf = (card) => clean(card.subject, 80);
const lineLabel = (card, many) => [many ? clean(card.name) : '', subjectOf(card)].filter(Boolean).join(' · ');

// the fields every combined invoice carries on top of the one-card record
function combinedFields(cards, lines, cardParts) {
  const names = nameList(cards);
  const amountCents = lines.reduce((sum, line) => sum + line.amountCents, 0);
  return {
    combined: true,
    invoiceTargetType: names.length > 1 ? 'parent' : 'student',
    studentIds: cards.map((card) => card.id),
    studentName: names.join(', '),
    subject: '',
    subjects: [...new Set(cards.map(subjectOf).filter(Boolean))],
    lines: lines.map((line) => ({ ...line, amount: line.amountCents / 100 })),
    cardParts,
    amountCents,
    amount: amountCents / 100,
    balanceDueCents: amountCents,
    balanceDue: amountCents / 100,
  };
}

// month: [{ card, plan, plannedUnits, correctionUnits, correctionNote }] → { record, amountCents }
function combinedMonthlyRecord({ month, due, parts, invoiceNum, nowIso, actor, requestId, signature }) {
  const cards = parts.map((part) => part.card);
  checkOnePayer(cards);
  const many = nameList(cards).length > 1;
  const lines = [];
  const cardParts = [];
  for (const part of parts) {
    let priced;
    try {
      priced = monthlyInvoiceLines({ month, plannedUnits: part.plannedUnits, correctionUnits: part.correctionUnits, correctionNote: part.correctionNote }, part.plan || {});
    } catch (error) {
      throw fail(400, `${lineLabel(part.card, true)}: ${error.message === 'Lesson price missing' ? 'tunnihind puudub' : 'summa peab olema positiivne'}`);
    }
    const label = lineLabel(part.card, many);
    priced.lines.forEach((line) => lines.push({ ...line, description: label ? `${label}: ${line.description}` : line.description, studentId: part.card.id, studentName: clean(part.card.name), subject: subjectOf(part.card) }));
    cardParts.push({ studentId: part.card.id, studentName: clean(part.card.name), subject: subjectOf(part.card), plannedUnits: part.plannedUnits, correctionUnits: part.correctionUnits, priceCents: priced.priceCents, minutes: priced.minutes, amountCents: priced.amountCents });
  }
  const fields = combinedFields(cards, lines, cardParts);
  const base = manualInvoiceRecord({
    input: { studentId: cards[0].id, description: `Keeletunnid, ${monthLabel(month)}`, amountCents: fields.amountCents, amount: fields.amount, due, note: '' },
    student: cards[0], invoiceNum, nowIso, actor, requestId, signature,
  });
  return {
    ...base,
    ...fields,
    paymentDueRule: 'monthly',
    billingMode: 'monthly_plan_v1',
    pricingMode: 'plan',
    planMonth: month,
    lessonCount: cardParts.reduce((sum, part) => sum + part.plannedUnits, 0),
  };
}

// manual charge: [{ card, amountCents }] with one description
function combinedManualRecord({ description, due, note, parts, invoiceNum, nowIso, actor, requestId, signature }) {
  const cards = parts.map((part) => part.card);
  checkOnePayer(cards);
  const many = nameList(cards).length > 1;
  const lines = parts.map((part) => {
    const label = lineLabel(part.card, many);
    return { type: 'manual_charge', description: label ? `${description} · ${label}` : description, amountCents: part.amountCents, studentId: part.card.id, studentName: clean(part.card.name), subject: subjectOf(part.card) };
  });
  const cardParts = parts.map((part) => ({ studentId: part.card.id, studentName: clean(part.card.name), subject: subjectOf(part.card), amountCents: part.amountCents }));
  const fields = combinedFields(cards, lines, cardParts);
  const base = manualInvoiceRecord({
    input: { studentId: cards[0].id, description, amountCents: fields.amountCents, amount: fields.amount, due, note },
    student: cards[0], invoiceNum, nowIso, actor, requestId, signature,
  });
  return { ...base, ...fields };
}

// does this invoice already bill the card for the month (an own monthly invoice or a part of a combined one)?
function billsCardForMonth(invoice = {}, cardId, month) {
  if (invoice.status === 'Tühistatud' || invoice.planMonth !== month) return false;
  return invoice.studentId === cardId || (Array.isArray(invoice.studentIds) && invoice.studentIds.includes(cardId));
}

module.exports = { payerKey, sameCardsInput, checkOnePayer, combinedMonthlyRecord, combinedManualRecord, billsCardForMonth };
