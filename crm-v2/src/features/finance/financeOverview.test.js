import { describe, expect, it } from 'vitest';
import { deltaPercent, financeOverview, invoiceMetrics, invoiceReceipts, metricTrend, overdueNow, periodInvoices, periodLabel, periodRange, receivedSeries, shiftPeriod } from './financeOverview.js';

const today = new Date(2031, 9, 10, 12); // 10.10.2031

describe('periods', () => {
  it('a month, its calendar quarter and its calendar year', () => {
    expect(periodRange('month', '2031-10')).toMatchObject({ from: '2031-10', to: '2031-10', months: ['2031-10'] });
    expect(periodRange('quarter', '2031-11')).toMatchObject({ from: '2031-10', to: '2031-12' });
    expect(periodRange('quarter', '2031-01').months).toEqual(['2031-01', '2031-02', '2031-03']);
    expect(periodRange('year', '2031-06')).toMatchObject({ from: '2031-01', to: '2031-12' });
  });

  it('steps back and forward by one period, over the year end', () => {
    expect(shiftPeriod('month', '2031-01', -1)).toBe('2030-12');
    expect(shiftPeriod('quarter', '2031-02', -1)).toBe('2030-10');
    expect(shiftPeriod('quarter', '2031-11', 1)).toBe('2032-01');
    expect(shiftPeriod('year', '2031-05', -1)).toBe('2030-01');
  });

  it('labels', () => {
    expect(periodLabel(periodRange('month', '2031-10'))).toBe('oktoober 2031');
    expect(periodLabel(periodRange('quarter', '2031-10'))).toBe('IV kvartal 2031');
    expect(periodLabel(periodRange('year', '2031-10'))).toBe('2031');
  });
});

const invoices = [
  { id: 'a', planMonth: '2031-10', studentId: 's1', payerEmail: 'p1@x.ee', amountCents: 10000, paidAmountCents: 10000, paidAt: '2031-10-05', due: '2031-10-10', status: 'Makstud' },
  { id: 'b', planMonth: '2031-10', studentId: 's2', payerEmail: 'p2@x.ee', amountCents: 6000, paidAmountCents: 0, due: '2031-10-15' },
  { id: 'c', planMonth: '2031-09', studentId: 's1', payerEmail: 'p1@x.ee', amountCents: 8000, paidAmountCents: 3000, paidAt: '2031-09-20', due: '2031-09-10' },
  { id: 'd', planMonth: '2031-09', studentId: 's3', payerEmail: 'p3@x.ee', amountCents: 4000, paidAmountCents: 4000, paidAt: '2031-09-03', due: '2031-09-10', status: 'Makstud' },
  { id: 'x', planMonth: '2031-10', studentId: 's4', amountCents: 99900, status: 'Tühistatud' },
  { id: 'e', planMonth: '2031-08', studentId: 's2', payerEmail: 'p2@x.ee', amountCents: 5000, paidAmountCents: 0, due: '2031-08-01' },
];

describe('card figures', () => {
  it('the period by billing month, cancelled invoices left out', () => {
    expect(periodInvoices(invoices, periodRange('month', '2031-10')).map((i) => i.id)).toEqual(['a', 'b']);
    expect(periodInvoices(invoices, periodRange('quarter', '2031-10')).map((i) => i.id)).toEqual(['a', 'b']);
    expect(periodInvoices(invoices, periodRange('quarter', '2031-09')).map((i) => i.id)).toEqual(['c', 'd', 'e']);
  });

  it('invoiced, open, average and students', () => {
    const m = invoiceMetrics(periodInvoices(invoices, periodRange('month', '2031-10')), today);
    expect(m).toMatchObject({ count: 2, billableCount: 2, invoicedCents: 16000, paidCents: 10000, openCents: 6000, averageCents: 8000, students: 2 });
  });

  it('a change in whole percent, none against zero', () => {
    expect(deltaPercent(16000, 12000)).toBe(33);
    expect(deltaPercent(6000, 5000 + 5000)).toBe(-40);
    expect(deltaPercent(100, 0)).toBeNull();
  });
});

describe('received money (cash by payment date)', () => {
  it('an invoice payment list wins; the rest of the paid amount lands on paidAt', () => {
    expect(invoiceReceipts({ amountCents: 10000, paidAmountCents: 10000, paidAt: '2031-10-09', payments: [{ paidAt: '2031-10-01', amountCents: 4000 }, { paidAt: '2031-10-02', amountCents: 999, status: 'void' }] }, today))
      .toEqual([{ date: '2031-10-01', cents: 4000 }, { date: '2031-10-09', cents: 6000 }]);
    expect(invoiceReceipts({ amountCents: 5000, paidAmountCents: 0 }, today)).toEqual([]);
    // an old invoice marked „Makstud” by hand counts in full on its date
    expect(invoiceReceipts({ amountCents: 5000, status: 'Makstud', date: '2031-09-01' }, today)).toEqual([{ date: '2031-09-01', cents: 5000 }]);
    expect(invoiceReceipts({ amountCents: 5000, paidAmountCents: 5000, paidAt: '2031-09-01', status: 'Tühistatud' }, today)).toEqual([]);
  });

  it('a running month stops at today and is compared with last month up to the same day', () => {
    const series = receivedSeries({ invoices, range: periodRange('month', '2031-10'), today });
    expect(series.points).toHaveLength(31);
    expect(series.currentUntil).toBe(9);
    expect(series.running).toBe(true);
    expect(series.totalCents).toBe(10000); // a, paid 05.10
    expect(series.points[3].value).toBe(0);
    expect(series.points[4].value).toBe(10000);
    expect(series.compareCents).toBe(4000); // d (03.09) by the 10th; c's 3000 came on 20.09
    expect(series.compareFullCents).toBe(7000);
    expect(series.delta).toBe(150);
  });

  it('a past period is compared in full; a future one has nothing yet', () => {
    const past = receivedSeries({ invoices, range: periodRange('month', '2031-09'), today });
    expect(past.running).toBe(false);
    expect(past.totalCents).toBe(7000);
    expect(past.compareCents).toBe(0);
    expect(past.delta).toBeNull();
    const future = receivedSeries({ invoices, range: periodRange('month', '2031-12'), today });
    expect(future.future).toBe(true);
    expect(future.currentUntil).toBe(-1);
  });

  it('a year goes month by month', () => {
    const year = receivedSeries({ invoices, range: periodRange('year', '2031-10'), today });
    expect(year.points.map((p) => p.label)).toEqual(['jaan', 'veebr', 'märts', 'apr', 'mai', 'juuni', 'juuli', 'aug', 'sept', 'okt', 'nov', 'dets']);
    expect(year.currentUntil).toBe(9);
    expect(year.points[8].value).toBe(7000);
    expect(year.points[9].value).toBe(17000);
  });
});

describe('overdue and trends', () => {
  it('everything past due today, by family, with age buckets', () => {
    const overdue = overdueNow(invoices, today);
    expect(overdue.cents).toBe(5000 + 5000); // c (5000 left) and e
    expect(overdue.count).toBe(2);
    expect(overdue.families).toBe(2);
    expect(overdue.ages.map((b) => [b.id, b.cents])).toEqual([['d30', 5000], ['d60', 0], ['older', 5000]]);
  });

  it('a card trend leaves out the empty periods before the first invoice', () => {
    const trend = metricTrend({ invoices, unit: 'month', anchor: '2031-10', count: 8, pick: (m) => m.invoicedCents, today });
    expect(trend).toEqual([5000, 12000, 16000]);
  });

  it('the whole overview for a quarter', () => {
    const model = financeOverview({ invoices, unit: 'quarter', anchor: '2031-10', today });
    expect(model.label).toBe('IV kvartal 2031');
    expect(model.beforeLabel).toBe('III kvartal 2031');
    expect(model.metrics.invoicedCents).toBe(16000);
    // October is the first month of IV kvartal: compared with July only (no invoices), not with the whole III kvartal
    expect(model.toDate).toBe(true);
    expect(model.previous.invoicedCents).toBe(0);
    expect(model.deltas.invoiced).toBeNull();
    const past = financeOverview({ invoices, unit: 'quarter', anchor: '2031-09', today });
    expect(past.toDate).toBe(false);
    expect(past.metrics.invoicedCents).toBe(17000);
    expect(model.received.points).toHaveLength(92);
  });
});
