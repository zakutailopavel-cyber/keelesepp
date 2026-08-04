import { invoiceBalanceCents, isInvoiceOverdue, studentFinancialSummary } from './studentFinance.js';

describe('legacy invoice summary', () => {
  it('prefers cent-based financial fields', () => {
    expect(invoiceBalanceCents({ amountCents: 12500, paidAmountCents: 2500 })).toBe(10000);
    expect(invoiceBalanceCents({ balanceDueCents: 4200, amount: 999 })).toBe(4200);
  });

  it('recognizes an unpaid legacy invoice after its due date', () => {
    const today = new Date('2026-08-03T12:00:00Z');
    expect(isInvoiceOverdue({ status: 'Ootel', amount: 80, due: '2026-08-01' }, today)).toBe(true);
    expect(isInvoiceOverdue({ status: 'Ootel', amount: 80, dueDate: '2026-08-01' }, today)).toBe(true);
    expect(isInvoiceOverdue({ status: 'Makstud', amount: 80, dueDate: '2026-08-01' }, today)).toBe(false);
  });

  it('aggregates outstanding and overdue invoices', () => {
    const summary = studentFinancialSummary([
      { amountCents: 10000, paidAmountCents: 4000, dueDate: '2026-08-01', status: 'Ootel' },
      { balanceDueCents: 2500, dueDate: '2026-08-10', status: 'Ootel' },
    ], new Date('2026-08-03T12:00:00Z'));
    expect(summary).toEqual({ balanceCents: 8500, overdue: 1 });
  });

  it('is safe to pass directly to Array.filter', () => {
    const invoices = [{ balanceDueCents: 1000, dueDate: '2020-01-01' }];
    expect(invoices.filter(isInvoiceOverdue)).toHaveLength(1);
  });
});
