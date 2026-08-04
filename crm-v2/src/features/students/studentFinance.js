function finiteNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

export function invoiceBalanceCents(invoice = {}) {
  if (Number.isFinite(Number(invoice.balanceDueCents))) return Math.max(0, Number(invoice.balanceDueCents));
  if (Number.isFinite(Number(invoice.amountCents))) {
    return Math.max(0, Number(invoice.amountCents) - finiteNumber(invoice.paidAmountCents));
  }
  return Math.max(0, Math.round((finiteNumber(invoice.amount) - finiteNumber(invoice.paidAmount)) * 100));
}

export function isInvoiceOverdue(invoice = {}, today = new Date()) {
  if (invoiceBalanceCents(invoice) <= 0) return false;
  if (invoice.status === 'overdue' || invoice.paymentStatus === 'overdue') return true;
  if (['Makstud', 'Tühistatud', 'paid', 'cancelled'].includes(invoice.status)) return false;
  const dueDate = String(invoice.due || invoice.dueDate || invoice.paymentDueDate || '').slice(0, 10);
  const todayIso = (today instanceof Date ? today : new Date()).toISOString().slice(0, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(dueDate) && dueDate < todayIso;
}

export function studentFinancialSummary(invoices = [], today = new Date()) {
  return {
    balanceCents: invoices.reduce((sum, invoice) => sum + invoiceBalanceCents(invoice), 0),
    overdue: invoices.filter((invoice) => isInvoiceOverdue(invoice, today)).length,
  };
}
