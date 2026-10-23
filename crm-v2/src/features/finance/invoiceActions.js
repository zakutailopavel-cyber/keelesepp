// Invoice action rules shared by the month table and the debts list (Võlgnevused).

export const invoiceWasSent = (invoice = {}) => ['sent', 'queued', 'sending'].includes(invoice.emailStatus) || Boolean(invoice.emailSentAt || invoice.invoiceEmailSentAt || invoice.emailQueuedAt);

// an unpaid invoice can be cancelled, also an e-mailed one (wrong address or wrong invoice, owner 2026-10-15) — with a
// confirmation in the dialog; a credited lesson package is corrected on the package instead
export function canCancelInvoice(invoice) {
  return ['manual_charge_v1', 'monthly_plan_v1', 'lesson_tokens_v1'].includes(invoice.billingMode) &&
    !['Tühistatud', 'Makstud'].includes(invoice.status) &&
    !(invoice.billingMode === 'lesson_tokens_v1' && invoice.tokenStatus === 'credited') &&
    !invoice.lessonIds?.length && !invoice.lines?.some((line) => line.lessonId) &&
    !Number(invoice.paidAmountCents || invoice.paidAmount * 100 || 0) &&
    !Number(invoice.creditedAmountCents || 0);
}

// lesson lines that can still get their own credit note (/invoices/credit-lesson-line); monthly multi-subject
// invoices have no lesson lines, so this is empty for them
export function creditableLessonLines(invoice = {}) {
  const corrected = invoice.correctedLessonIds || [];
  return (Array.isArray(invoice.lines) ? invoice.lines : []).filter((line) => line?.lessonId && !corrected.includes(line.lessonId));
}

const cents = (value) => Math.round(Number(value || 0) * 100);
const originalCents = (invoice = {}) => (invoice.amount !== undefined && invoice.amount !== null && invoice.amount !== '' ? cents(invoice.amount) : Number(invoice.amountCents) || 0);

// what a full credit note would cover: the original amount minus earlier lesson-line credits
// (the same as functions/invoice-correction-core.js openCreditCents)
export function invoiceOpenCreditCents(invoice = {}) {
  return Math.max(0, originalCents(invoice) - (Number(invoice.creditedAmountCents) || 0));
}

// why „Krediteeri kogu arve” / „Paranda summa või maksja” is not offered ('' = it is); mirrors the server's
// fullCreditError so the dialog explains instead of failing
export function fullCorrectionBlocker(invoice = {}) {
  if (invoice.status === 'Tühistatud') return 'Tühistatud arvet ei saa krediteerida.';
  if (invoice.correctedBy?.invoiceId) return `Arve on juba parandatud uue arvega${invoice.correctedBy.invoiceNum ? ` ${invoice.correctedBy.invoiceNum}` : ''}.`;
  if (invoice.status === 'Krediteeritud' || invoice.correctionStatus === 'fully_credited' || invoiceOpenCreditCents(invoice) <= 0) return 'Arve on juba täielikult krediteeritud.';
  if (invoice.status === 'Makstud' || Number(invoice.paidAmountCents || 0) > 0 || Number(invoice.paidAmount || 0) > 0) return 'Arvel on laekumisi. Tühista või tagasta makse enne krediteerimist.';
  if (invoice.billingMode === 'lesson_tokens_v1' && invoice.tokenStatus === 'credited') return 'Selle paketi tunnid on juba õpilase kaardil. Paranda enne paketti.';
  return '';
}

// a lesson line's price comes from the tariff: such an invoice can get a new payer, not a new amount
// (old invoices link their lessons only through lessonIds)
export const invoiceHasLessonLines = (invoice = {}) => (invoice.lines || []).some((line) => line?.lessonId) || (Array.isArray(invoice.lessonIds) && invoice.lessonIds.length > 0);
