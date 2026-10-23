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
