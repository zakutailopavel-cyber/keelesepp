export function canCancelInvoice(invoice = {}) {
  return ['manual_charge_v1', 'monthly_plan_v1'].includes(invoice.billingMode) &&
    !['Tühistatud', 'Makstud'].includes(invoice.status) &&
    !['sent', 'queued', 'sending'].includes(invoice.emailStatus) &&
    !invoice.emailSentAt && !invoice.invoiceEmailSentAt && !invoice.emailQueuedAt &&
    !invoice.lessonIds?.length && !invoice.lines?.some((line) => line.lessonId) &&
    !Number(invoice.paidAmountCents || invoice.paidAmount * 100 || 0) &&
    !Number(invoice.creditedAmountCents || 0);
}
