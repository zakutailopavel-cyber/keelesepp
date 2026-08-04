import { describe, expect, it } from 'vitest';
import { displayDate, invoiceAmountCents, invoicePaidCents, invoiceStatus, revenueForecast, validatePayment } from './finance.js';

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

  it('forecasts weekly, average monthly and annual revenue from student plans', () => {
    const forecast = revenueForecast([
      { id: 'student-1', studentName: 'Mari', lessonPriceCents: 2500, weeklyLessons: 2, active: true },
      { id: 'student-2', studentName: 'Jaan', lessonPriceCents: 3000, weeklyLessons: 1, active: true },
      { id: 'student-3', studentName: 'Peatatud', lessonPriceCents: 9000, weeklyLessons: 5, active: false },
    ]);
    expect(forecast).toMatchObject({ weeklyCents: 8000, monthlyCents: 34667, annualCents: 416000 });
    expect(forecast.rows.map((row) => row.id)).toEqual(['student-1', 'student-2']);
  });
});
