import { describe, expect, it } from 'vitest';
import { dashboardSummary, monthRange, niceMax, revenueForecast, revenueHistory } from './financeDashboard.js';

const months = ['2026-08', '2026-09', '2026-10'];

describe('finance dashboard model', () => {
  it('lists the months ending with the given one', () => {
    expect(monthRange('2026-02', 4)).toEqual(['2025-11', '2025-12', '2026-01', '2026-02']);
  });

  it('counts invoiced by the invoice date and received by the payment date, without cancelled or void ones', () => {
    const invoices = [
      { id: 'i1', date: '2026-09-02', amountCents: 10000, paidAmountCents: 10000 },
      { id: 'i2', date: '2026-10-01', amountCents: 8000 },
      { id: 'i3', date: '2026-10-03', amountCents: 5000, status: 'Tühistatud' },
      // an old invoice marked paid by hand: no payment record, its own paidAt
      { id: 'i4', date: '2026-08-05', amountCents: 3000, status: 'Makstud', paidAt: '2026-08-20' },
    ];
    const payments = [
      { invoiceId: 'i1', amountCents: 10000, paidAt: '2026-10-04', status: 'active' },
      { invoiceId: 'i2', amountCents: 999, paidAt: '2026-10-05', status: 'void' },
    ];
    const rows = revenueHistory({ invoices, payments, months });
    expect(rows.map((r) => [r.month, r.invoicedCents, r.receivedCents, r.invoiceCount])).toEqual([
      ['2026-08', 3000, 3000, 1], ['2026-09', 10000, 0, 1], ['2026-10', 8000, 10000, 1],
    ]);
  });

  it('forecasts a month from the calendar: scheduled lessons × the card price; packages and no-price apart', () => {
    const students = [{ id: 's1', name: 'Mia', active: true }, { id: 's2', name: 'Ott', active: true }, { id: 's3', name: 'Pakett', active: true }];
    const plans = [{ studentId: 's1', lessonPriceCents: 2500, lessonMinutes: 60, billingMode: 'advance' }, { studentId: 's3', lessonPriceCents: 2000, billingMode: 'package' }];
    const schedule = [
      { id: 'w1', studentId: 's1', recurring: true, day: 'Mon', startDate: '2026-09-01', time: '17:00', duration: 60, status: 'Planeeritud' },
      { id: 'w2', studentId: 's2', recurring: true, day: 'Tue', startDate: '2026-09-01', time: '17:00', duration: 60, status: 'Planeeritud' },
      { id: 'w3', studentId: 's3', recurring: true, day: 'Wed', startDate: '2026-09-01', time: '17:00', duration: 60, status: 'Planeeritud' },
    ];
    const [november] = revenueForecast({ months: ['2026-11'], students, plans, schedule });
    expect(november).toMatchObject({ month: '2026-11', forecastCents: 5 * 2500, students: 1, lessons: 5, packageStudents: 1, noPrice: 1 });
  });

  it('sums the headline numbers and rounds the chart scale', () => {
    const history = [{ month: '2026-09', invoicedCents: 10000, receivedCents: 9000, invoiceCount: 2 }, { month: '2026-10', invoicedCents: 12000, receivedCents: 6000, invoiceCount: 3 }];
    const forecast = [{ month: '2026-11', forecastCents: 15000, students: 4, lessons: 16 }, { month: '2026-12', forecastCents: 14000 }];
    const s = dashboardSummary({ history, forecast, invoices: [{ id: 'x', date: '2026-10-01', amountCents: 5000, due: '2026-10-10' }], current: '2026-10' });
    expect(s).toMatchObject({ invoicedCents: 12000, receivedCents: 6000, changePercent: 20, received12Cents: 15000, averageMonthCents: 7500, averageInvoiceCents: 4000, forecastTotalCents: 29000 });
    expect(s.outstandingCents).toBe(5000);
    expect(niceMax(387000)).toBe(500000);
    expect(niceMax(180000)).toBe(200000);
  });

  it('the current month: what the calendar owes and what is not invoiced yet (an invoice dated in the month counts)', () => {
    const students = [{ id: 's1', name: 'Mia', active: true }, { id: 's2', name: 'Ott', active: true }];
    const plans = [{ studentId: 's1', lessonPriceCents: 2500, billingMode: 'current' }, { studentId: 's2', lessonPriceCents: 2000, billingMode: 'current' }];
    const schedule = [
      { id: 'w1', studentId: 's1', recurring: true, day: 'Mon', startDate: '2026-09-01', time: '17:00', duration: 60, status: 'Planeeritud' },
      { id: 'w2', studentId: 's2', recurring: true, day: 'Tue', startDate: '2026-09-01', time: '17:00', duration: 60, status: 'Planeeritud' },
    ];
    const invoices = [{ id: 'i1', studentId: 's1', date: '2026-10-02', amountCents: 10000 }];
    const [october] = revenueForecast({ months: ['2026-10'], students, plans, schedule, invoices });
    expect(october).toMatchObject({ forecastCents: 4 * 2500 + 4 * 2000, notInvoicedCents: 4 * 2000, notInvoicedStudents: 1 });
  });
});
