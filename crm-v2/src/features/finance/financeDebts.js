import { financeRowState, sortFinanceRows } from './financeRows.js';

export function pastDueInvoices(invoices = [], month) {
  return sortFinanceRows(invoices.filter((invoice) => {
    const invoiceMonth = String(invoice.planMonth || invoice.month || invoice.date || '').slice(0, 7);
    return invoiceMonth && invoiceMonth < month && financeRowState(invoice).balanceCents > 0;
  }), 'dueDate');
}
