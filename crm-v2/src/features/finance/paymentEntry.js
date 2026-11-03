// The date of a payment typed in by hand (October 2026 accounting audit): the receipt is booked on this date
// (functions/accounting-core.js), so a backlog payment entered weeks later with the default „today” landed in the
// wrong month. The field stays editable; these checks only warn and show what is known about the invoice.

const DAY_MS = 24 * 60 * 60 * 1000;
export const LATE_AFTER_DUE_DAYS = 7;

// yyyy-mm-dd of a stored date (string, Firestore Timestamp or Date); '' when unknown
export function isoDay(value) {
  const raw = value?.toDate ? value.toDate() : value;
  if (!raw) return '';
  if (typeof raw === 'string') return (raw.match(/^\d{4}-\d{2}-\d{2}/) || [''])[0];
  if (raw instanceof Date && !Number.isNaN(raw.getTime())) return raw.toISOString().slice(0, 10);
  return '';
}

const dayNumber = (iso) => Math.round(Date.parse(`${iso}T12:00:00Z`) / DAY_MS);
const dmy = (iso) => (iso ? iso.split('-').reverse().join('.') : '');

// the latest earlier payment date: the invoice's paidAt, or the newest active payment when the list is known
export function earlierPaymentDate(invoice = {}, payments = []) {
  const dates = [isoDay(invoice.paidAt), ...(payments || [])
    .filter((payment) => payment && payment.status !== 'voided' && payment.status !== 'void')
    .map((payment) => isoDay(payment.paidAt))].filter(Boolean).sort();
  return dates.at(-1) || '';
}

export function paymentDateCheck({ invoice = {}, payments = [], paidAt = '', method = 'bank', today = new Date().toISOString().slice(0, 10) } = {}) {
  const dueDate = isoDay(invoice.due || invoice.dueDate);
  const earlier = earlierPaymentDate(invoice, payments);
  const facts = [
    dueDate ? `Maksetähtaeg ${dmy(dueDate)}` : '',
    earlier ? `varasem makse ${dmy(earlier)}` : '',
  ].filter(Boolean);
  const reasons = [];
  const date = /^\d{4}-\d{2}-\d{2}$/.test(String(paidAt)) ? String(paidAt) : '';
  if (date) {
    if (earlier && earlier !== date) reasons.push(`Arvel on juba makse kuupäevaga ${dmy(earlier)}.`);
    if (dueDate && dayNumber(date) - dayNumber(dueDate) > LATE_AFTER_DUE_DAYS) {
      reasons.push(`Kuupäev on üle ${LATE_AFTER_DUE_DAYS} päeva pärast maksetähtaega (${dmy(dueDate)}).`);
    }
    if (today && date.slice(0, 7) !== String(today).slice(0, 7)) reasons.push('Kuupäev on teises kuus kui täna.');
  }
  return {
    dueDate,
    earlier,
    info: facts.length ? `${facts.join(' · ')}.` : '',
    warning: reasons.length
      ? (method === 'cash' ? 'Kuupäev peab olema päev, mil sularaha kätte saadi.' : 'Kuupäev peab olema päev, mil raha pangakontole laekus.')
      : '',
    reasons,
  };
}

// a 409 from financeApi /payments that the person can answer (financeApi.js keeps details.code on the error)
export const isOverpaymentRefusal = (error) => error?.details?.code === 'overpayment';
export const OVERPAYMENT_ADVANCE_REASON = 'Ülemakse registreeriti ettemaksuna (kinnitatud makse sisestamisel)';

// records the payment; when the person confirmed an overpayment, the excess is moved to the payer's advance with the
// existing „Muuda avansiks” (financeApi /invoices/resolve-overpayment → payerCredits). If that second step fails the
// payment stays recorded and the overpayment waits on the invoice as before („Ülejääk ettemaksuks” in Kontroll).
export async function recordPaymentWithAdvance(financeRepository, invoiceId, payment) {
  const result = await financeRepository.recordPayment(invoiceId, payment);
  if (payment.allowOverpayment !== true || !(Number(result?.invoice?.overpaidAmountCents) > 0)) return { result, advanced: false, advanceError: '' };
  try {
    await financeRepository.resolveInvoiceOverpayment(invoiceId, OVERPAYMENT_ADVANCE_REASON);
    return { result, advanced: true, advanceError: '' };
  } catch (error) {
    return { result, advanced: false, advanceError: error?.message || 'Ülejääki ei saanud ettemaksuks kanda.' };
  }
}

export function paymentRecordedNotice({ advanced, advanceError } = {}, invoiceNumber = '') {
  const what = invoiceNumber ? `Makse arvele ${invoiceNumber}` : 'Makse';
  if (advanced) return `${what} registreeriti, ülejääk kanti maksja ettemaksuks.`;
  if (advanceError) return `${what} registreeriti, kuid ülejääki ei saanud ettemaksuks kanda (${advanceError}). Tee seda arve juures („Muuda avansiks”).`;
  return `${what} registreeriti.`;
}
