import { describe, expect, it } from 'vitest';
import { displayDate, invoiceAmountCents, invoicePaidCents, invoiceStatus, validatePayment } from './finance.js';

describe('finance helpers', () => {
  it('normalizes legacy euro values and cent values', () => {
    expect(invoiceAmountCents({ amount: 19.9 })).toBe(1990);
    expect(invoiceAmountCents({ amount: 99, amountCents: 1250 })).toBe(1250);
    expect(invoicePaidCents({ paidAmount: 4.25 })).toBe(425);
  });

  it('recognizes the legacy due field and partial payments', () => {
    expect(invoiceStatus({ amountCents: 2000, paidAmountCents: 500, due: '2026-08-20' }, new Date('2026-08-04T12:00:00Z'))).toBe('partial');
    expect(invoiceStatus({ amountCents: 2000, due: '2026-08-01' }, new Date('2026-08-04T12:00:00Z'))).toBe('overdue');
    expect(invoiceStatus({ amountCents: 2000, paidAmountCents: 2000 }, new Date('2026-08-04T12:00:00Z'))).toBe('paid');
  });

  it('validates positive payment amounts and ISO dates', () => {
    expect(validatePayment({ amount: '12,50', paidAt: '2026-08-04' })).toEqual({ amount: 12.5, errors: {}, valid: true });
    expect(validatePayment({ amount: '0', paidAt: '' }).valid).toBe(false);
  });

  it('formats ISO dates for Estonian UI', () => {
    expect(displayDate('2026-08-04')).toBe('04.08.2026');
  });
});
