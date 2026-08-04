import { describe, expect, it } from 'vitest';
import { expenseTotals, filterExpenses, validateExpenseForm } from './expenses.js';

const records = [
  { id: 'active', expenseDate: '2026-08-04', category: 'software', description: 'Videotarkvara', amountCents: 2440, vatAmountCents: 440, netAmountCents: 2000, documentCount: 1, status: 'active' },
  { id: 'voided', expenseDate: '2026-08-03', category: 'rent', description: 'Vana üür', amountCents: 10000, vatAmountCents: 0, netAmountCents: 10000, documentCount: 1, status: 'voided' },
  { id: 'other-month', expenseDate: '2026-07-03', category: 'advertising', description: 'Reklaam', amountCents: 5000, vatAmountCents: 0, netAmountCents: 5000, documentCount: 0, status: 'active' },
];

describe('expenses', () => {
  it('excludes voided and corrected records from active totals', () => {
    expect(expenseTotals(records)).toEqual({ count: 2, amountCents: 7440, vatAmountCents: 440, netAmountCents: 7000, documentCount: 1 });
  });

  it('filters by month and localized category label', () => {
    expect(filterExpenses(records, '2026-08', 'tarkvara').map((item) => item.id)).toEqual(['active']);
    expect(filterExpenses(records, '2026-07', '').map((item) => item.id)).toEqual(['other-month']);
  });

  it('validates required values and VAT boundaries', () => {
    const valid = { expenseDate: '2026-08-04', category: 'software', description: 'Videotarkvara', amount: '24,40', vatAmount: '4,40' };
    expect(validateExpenseForm(valid)).toBe('');
    expect(validateExpenseForm({ ...valid, description: '' })).toMatch(/kirjeldus/i);
    expect(validateExpenseForm({ ...valid, vatAmount: '30' })).toMatch(/käibemaks/i);
  });
});
