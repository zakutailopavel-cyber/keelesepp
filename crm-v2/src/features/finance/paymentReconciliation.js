// „Kontroll” (owner 2026-10-15: „надо сделать так чтобы админ мог сверять счета по оплатам”): every invoice is compared
// with its payment records and the bank's money that is not on an invoice. Pure: the panel loads the data and acts
// through the finance API (record a missing payment, void a duplicate, move an overpayment to the payer's credit).
import { invoiceAmountCents } from './finance.js';

const DUPLICATE_WINDOW_MS = 10 * 60 * 1000;
const isCancelled = (invoice) => invoice.status === 'Tühistatud';
const isCredited = (invoice) => invoice.credited === true || ['credited', 'Krediteeritud'].includes(invoice.status)
  || invoice.paymentStatus === 'credited' || invoice.correctionStatus === 'fully_credited';
const markedPaid = (invoice) => invoice.status === 'Makstud' || invoice.paymentStatus === 'paid' || invoice.paymentStatus === 'overpaid';
const cents = (payment) => Math.round(Number(payment.amountCents ?? Number(payment.amount || 0) * 100) || 0);
const activePayment = (payment) => !['voided', 'cancelled', 'reversed'].includes(payment.status);
const invoiceLabel = (invoice) => invoice.num || invoice.number || invoice.invoiceNumber || invoice.id;

// two records of one payment: same amount and day, entered within ten minutes (a double click)
export function duplicatePayments(payments = []) {
  const sorted = [...payments].sort((a, b) => String(a.createdAt || '').localeCompare(String(b.createdAt || '')));
  const duplicates = [];
  sorted.forEach((payment, index) => {
    const earlier = sorted.slice(0, index).find((other) => !duplicates.includes(other) && cents(other) === cents(payment)
      && other.paidAt === payment.paidAt
      && Math.abs(new Date(payment.createdAt || 0).getTime() - new Date(other.createdAt || 0).getTime()) <= DUPLICATE_WINDOW_MS);
    if (earlier) duplicates.push(payment);
  });
  return duplicates;
}

// the invoice's amount for the check: a credited invoice owes nothing more than what was paid
export function reconcilePayments({ invoices = [], payments = [], transactions = [] } = {}) {
  const byInvoice = new Map();
  payments.filter(activePayment).forEach((payment) => {
    byInvoice.set(payment.invoiceId, [...(byInvoice.get(payment.invoiceId) || []), payment]);
  });
  const invoiceIds = new Set(invoices.map((invoice) => invoice.id));
  const issues = { duplicate: [], overpaid: [], missingPayment: [], statusMismatch: [], cancelledWithPayment: [], unknownInvoice: [], unapplied: [] };
  let invoicedCents = 0;
  let recordedCents = 0;

  for (const invoice of invoices) {
    const list = byInvoice.get(invoice.id) || [];
    const paid = list.reduce((sum, payment) => sum + cents(payment), 0);
    const amount = invoiceAmountCents(invoice);
    const base = { invoice, label: invoiceLabel(invoice), amountCents: amount, paidCents: paid, payments: list };
    if (isCancelled(invoice)) {
      if (paid > 0) issues.cancelledWithPayment.push(base);
      continue;
    }
    invoicedCents += amount;
    recordedCents += paid;
    if (isCredited(invoice)) continue;
    const duplicates = duplicatePayments(list);
    if (duplicates.length && paid > amount) issues.duplicate.push({ ...base, duplicates });
    else if (paid > amount) issues.overpaid.push({ ...base, overCents: paid - amount });
    else if (markedPaid(invoice) && paid === 0 && amount > 0) issues.missingPayment.push(base);
    else if (markedPaid(invoice) && paid < amount) issues.statusMismatch.push({ ...base, note: 'märgitud makstuks, maksetest puudub osa' });
    else if (!markedPaid(invoice) && amount > 0 && paid >= amount) issues.statusMismatch.push({ ...base, note: 'maksed katavad arve, olek ei ole „Makstud”' });
  }
  payments.filter(activePayment).filter((payment) => payment.invoiceId && !invoiceIds.has(payment.invoiceId))
    .forEach((payment) => issues.unknownInvoice.push({ payment, label: payment.invoiceNum || payment.invoiceId, paidCents: cents(payment) }));
  transactions.filter((transaction) => Number(transaction.unappliedAmountCents) > 0)
    .forEach((transaction) => issues.unapplied.push({ transaction, label: transaction.payerName || transaction.reference || transaction.id, amountCents: Number(transaction.unappliedAmountCents) }));

  const newestFirst = (a, b) => String(b.invoice?.date || b.transaction?.paidAt || '').localeCompare(String(a.invoice?.date || a.transaction?.paidAt || ''));
  Object.values(issues).forEach((list) => list.sort(newestFirst));
  const count = Object.values(issues).reduce((sum, list) => sum + list.length, 0);
  return { issues, count, invoicedCents, recordedCents };
}

// the payment record a paid invoice without one gets (old invoices marked paid before payments were recorded);
// one request id per invoice: pressing twice never adds two records
export function missingPaymentRecord(invoice) {
  return {
    amount: invoiceAmountCents(invoice) / 100,
    paidAt: String(invoice.paidAt || invoice.parentPaymentSubmittedAt || invoice.date || '').slice(0, 10),
    method: ['bank', 'cash', 'card', 'other'].includes(invoice.parentPaymentMethod) ? invoice.parentPaymentMethod : 'bank',
    reference: invoice.paymentReference || invoice.num || '',
    note: 'Kontroll: makse kirje lisati makstuks märgitud arvele',
    requestId: `reconcile-missing-${invoice.id}`.replace(/[^A-Za-z0-9_-]/g, '_').slice(0, 120),
  };
}

// ---------- „Laekumised”: the incoming money like a bank statement ----------
// One row per bank transaction (it may pay several invoices and leave an advance) and one row per payment entered by
// hand. The payer is the name from the bank where it is known (the bank import, or „LHV väljavõte <day>, <name> (…)”
// in the note of a payment recorded from the statement), otherwise the invoice's payer.
const notePayer = (note) => String(note || '').match(/^LHV väljavõte [\d-]+, (.+?) \(/)?.[1] || '';
const searchKey = (value) => String(value || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLocaleLowerCase('et');

export function paymentLedger({ payments = [], transactions = [], invoices = [] } = {}) {
  const invoiceById = new Map(invoices.map((invoice) => [invoice.id, invoice]));
  const link = (payment) => {
    const invoice = invoiceById.get(payment.invoiceId) || {};
    return { invoiceId: payment.invoiceId || '', label: payment.invoiceNum || invoice.num || '', studentName: payment.studentName || invoice.studentName || '', amountCents: cents(payment) };
  };
  const active = payments.filter(activePayment);
  const rows = transactions.map((transaction) => {
    const parts = active.filter((payment) => payment.bankTransactionId === transaction.id);
    return {
      id: `bank-${transaction.id}`,
      paidAt: String(transaction.paidAt || '').slice(0, 10),
      payerName: transaction.payerName || parts[0]?.payerName || '',
      reference: transaction.reference || '',
      amountCents: Number(transaction.amountCents) || Math.round(Number(transaction.amount || 0) * 100),
      links: parts.map(link),
      advanceCents: Number(transaction.unappliedAmountCents) || 0,
      advanceFor: transaction.creditStudentName || '',
      source: 'bank',
    };
  });
  active.filter((payment) => !payment.bankTransactionId).forEach((payment) => rows.push({
    id: payment.id,
    paidAt: String(payment.paidAt || '').slice(0, 10),
    payerName: notePayer(payment.note) || payment.payerName || '',
    reference: payment.reference || '',
    amountCents: cents(payment),
    links: [link(payment)],
    advanceCents: 0,
    advanceFor: '',
    source: notePayer(payment.note) ? 'statement' : (payment.method || 'bank'),
  }));
  return rows
    .map((row) => ({ ...row, search: searchKey([row.payerName, row.reference, row.advanceFor, ...row.links.flatMap((item) => [item.label, item.studentName]), (row.amountCents / 100).toFixed(2), (row.amountCents / 100).toFixed(2).replace('.', ',')].join(' ')) }))
    .sort((a, b) => `${b.paidAt}${b.id}`.localeCompare(`${a.paidAt}${a.id}`));
}

// every word of the query must appear (name, invoice number, child, explanation or amount); month „2026-09” or „all”
export function filterLedger(rows = [], { query = '', month = 'all' } = {}) {
  const words = searchKey(query).split(/\s+/).filter(Boolean);
  return rows.filter((row) => (month === 'all' || row.paidAt.startsWith(month)) && words.every((word) => row.search.includes(word)));
}
