// Who a new invoice is for and where it goes — the browser mirror of `functions/invoice-payer-core.js` (the server
// stores the snapshot and sends the e-mail with that file; keep the field order the same). Used here only to warn
// before an invoice is created that nobody can receive it (bug 2026-11-04: an invoice stored „Jekaterina” with no
// e-mail). Issued invoices keep their snapshot; `invoiceShownEmail` only displays the address one was sent to.

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const clean = (value) => String(value ?? '').trim().replace(/\s+/g, ' ');

export const CARD_EMAIL_FIELDS = ['payerEmail', 'parentEmail', 'billingEmail', 'contactEmail', 'guardianEmail', 'email'];

export function firstEmail(...values) {
  return values.flat().map((value) => String(value || '').trim()).find((value) => EMAIL_RE.test(value)) || '';
}

export function linkedParentIds(card = {}) {
  return [...new Set([card.linkedParentId, card.parentUid, card.guardianUid].map(clean).filter(Boolean))];
}

// the card's own invoice address, else the e-mail of a linked parent account when the caller has it
export function cardPayerEmail(card = {}, linkedAccountEmail = '') {
  return firstEmail(...CARD_EMAIL_FIELDS.map((field) => card?.[field]), linkedAccountEmail);
}

export function cardPayerName(card = {}) {
  return clean(card.payerName || card.companyName || card.parentName || card.guardianName || card.name);
}

// what the dialog says before „Loo arve”: the payer, the address (or none) and whether the server can still fall back
// to a linked parent account (its login e-mail; the browser may not have it)
export function invoicePayerPreview(card = {}, parents = []) {
  const ids = linkedParentIds(card);
  const account = parents.find((parent) => ids.includes(parent.id) && firstEmail(parent.email));
  const email = cardPayerEmail(card, account?.email || '');
  const linkedParent = ids.length > 0 || card.linkedParent === true;
  return {
    studentName: clean(card.name),
    payerName: cardPayerName(card),
    email,
    // no e-mail anywhere: the invoice can be made but not sent („Arvel pole saaja e-posti”)
    missingEmail: !email && !linkedParent,
    // a single word: probably a first name only, the invoice will carry it as the student's name
    shortName: clean(card.name).split(' ').filter(Boolean).length < 2,
  };
}

// the e-mail shown for an issued invoice: its snapshot, else the address it was sent to (old invoices made without one)
export function invoiceShownEmail(invoice = {}) {
  return firstEmail(invoice.payerEmail, invoice.parentEmail, invoice.emailRecipient);
}
