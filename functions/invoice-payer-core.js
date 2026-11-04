'use strict';

// Who an invoice is for and where it goes (bug 2026-11-04: a manual invoice stored „Jekaterina” with no e-mail while the
// e-mail went to the card's parent address). ONE resolution for both the snapshot stored on a new invoice and the
// address the invoice e-mail is sent to (index.js sendInvoiceMessage), so the two can never differ again.
// The crm-v2 mirror is `crm-v2/src/features/finance/invoicePayer.js` (the warning before creating): keep the field
// order the same. Issued invoices are never changed: they keep the snapshot they were made with.

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const clean = (value, max = 160) => String(value ?? '').trim().replace(/\s+/g, ' ').slice(0, max);

// the first value that is a valid e-mail address
function firstEmail(...values) {
  return values.flat().map((value) => String(value || '').trim()).find((value) => EMAIL_RE.test(value)) || '';
}

// card fields in priority order: an explicit payer, the parent („Lapsevanema e-post (arved)”), a billing address,
// older contact / guardian fields, the learner's own e-mail (adult who pays himself)
const CARD_EMAIL_FIELDS = ['payerEmail', 'parentEmail', 'billingEmail', 'contactEmail', 'guardianEmail', 'email'];

// the parent accounts linked to a card (Lapsevanemad)
function linkedParentIds(card = {}) {
  return [...new Set([card.linkedParentId, card.parentUid, card.guardianUid].map((id) => clean(id)).filter(Boolean))];
}

// the invoice address of a card: its own fields first, then the linked parent account's login e-mail
function cardPayerEmail(card = {}, linkedAccountEmail = '') {
  return firstEmail(...CARD_EMAIL_FIELDS.map((field) => card?.[field]), linkedAccountEmail);
}

// the payer's name: an explicit payer / company, else the parent, else the learner himself (adult self-payer)
function cardPayerName(card = {}) {
  return clean(card.payerName || card.companyName || card.parentName || card.guardianName || card.name);
}

// the snapshot every new invoice of one card carries (manual, monthly, lesson package, lesson-based)
function invoicePayerSnapshot(card = {}, { linkedAccountEmail = '' } = {}) {
  const email = cardPayerEmail(card, linkedAccountEmail);
  const lower = email.toLowerCase();
  return {
    studentName: clean(card.name) || '—',
    parentUid: clean(card.linkedParentId || card.parentUid || card.guardianUid),
    linkedParentId: clean(card.linkedParentId || card.parentUid),
    guardianUid: clean(card.guardianUid),
    parentName: clean(card.parentName || card.guardianName),
    // the address the invoice is sent to; also what the parent's `ownsInvoice` rule matches (parentEmailLower)
    parentEmail: email,
    parentEmailLower: lower,
    payerName: cardPayerName(card),
    payerEmail: email,
    payerEmailLower: lower,
  };
}

// the address an invoice e-mail goes to: the invoice's own snapshot first (an issued invoice keeps its recipient),
// then the same card resolution as at creation
function invoiceRecipient(invoice = {}, card = {}, linkedAccountEmail = '') {
  return firstEmail(invoice?.email, invoice?.parentEmail, invoice?.payerEmail, cardPayerEmail(card || {}, linkedAccountEmail));
}

module.exports = { EMAIL_RE, CARD_EMAIL_FIELDS, firstEmail, linkedParentIds, cardPayerEmail, cardPayerName, invoicePayerSnapshot, invoiceRecipient };
