import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import FinanceOverview from './FinanceOverview.jsx';
import { moneyFlows, periodRange, receivedSeries } from './financeOverview.js';

// „Ülekanded” and „Sularaha” under „Laekunud” (owner 2026-11-10; test data only)
const today = new Date(2031, 9, 10, 12); // 10.10.2031
const invoices = [
  { id: 'bank', planMonth: '2031-10', studentId: 's1', amountCents: 10000, paidAmountCents: 10000, status: 'Makstud', paidAt: '2031-10-02' },
  { id: 'cash', planMonth: '2031-10', studentId: 's2', amountCents: 6000, paidAmountCents: 6000, status: 'Makstud', paidAt: '2031-10-03' },
  { id: 'credit', planMonth: '2031-10', studentId: 's3', amountCents: 2000, paidAmountCents: 2000, status: 'Makstud', paidAt: '2031-10-04' },
  { id: 'gone', planMonth: '2031-10', studentId: 's4', amountCents: 5000, paidAmountCents: 0, status: 'Tühistatud' },
  { id: 'sept', planMonth: '2031-09', studentId: 's1', amountCents: 9000, paidAmountCents: 9000, status: 'Makstud', paidAt: '2031-09-03' },
];
const payments = [
  { id: 'p1', invoiceId: 'bank', amountCents: 6000, paidAt: '2031-10-02', method: 'bank', status: 'active' },
  { id: 'p2', invoiceId: 'bank', amountCents: 4000, paidAt: '2031-10-06', method: 'linkpay', status: 'active' },
  { id: 'p3', invoiceId: 'cash', amountCents: 6000, paidAt: '2031-10-03', method: 'cash', status: 'active' },
  { id: 'p4', invoiceId: 'credit', amountCents: 2000, paidAt: '2031-10-04', method: 'credit', status: 'active' },
  { id: 'p5', invoiceId: 'bank', amountCents: 999, paidAt: '2031-10-05', method: 'bank', status: 'voided' },
  { id: 'p6', invoiceId: 'gone', amountCents: 5000, paidAt: '2031-10-05', method: 'bank', status: 'active' },
  { id: 'p7', invoiceId: 'unknown-fie', amountCents: 7000, paidAt: '2031-10-05', method: 'bank', status: 'active' },
  { id: 'p8', invoiceId: 'sept', amountCents: 9000, paidAt: '2031-09-03', method: 'bank', status: 'active' },
];
const cashEntries = [
  { id: 'lc1', type: 'receipt', source: 'lesson', status: 'open', amountCents: 2500, receivedAt: '2031-10-08' }, // a lesson paid in cash
  { id: 'r2', type: 'receipt', status: 'allocated', amountCents: 6000, receivedAt: '2031-10-03', paymentId: 'p3' }, // counted as p3
  { id: 'r3', type: 'receipt', status: 'void', amountCents: 3000, receivedAt: '2031-10-04' },
  { id: 'h1', type: 'handover', status: 'active', amountCents: 2500, handedAt: '2031-10-09' },
  { id: 'old', type: 'receipt', source: 'lesson', status: 'open', amountCents: 1500, receivedAt: '2031-09-20' },
];

describe('moneyFlows + receivedSeries', () => {
  const flows = moneyFlows({ invoices, payments, cashEntries });

  it('transfers = bank + LinkPay of company invoices on the page; cash = cash payments + open cash-box receipts', () => {
    expect(flows.transfers.map((item) => item.cents).sort()).toEqual([4000, 6000, 9000]);
    expect(flows.cashPayments).toEqual([{ date: '2031-10-03', cents: 6000 }]);
    expect(flows.ledgerCash).toEqual([{ date: '2031-10-08', cents: 2500 }, { date: '2031-09-20', cents: 1500 }]);
  });

  it('the total takes the payment days and the open cash; the two lines add up without double counting', () => {
    const series = receivedSeries({ invoices, range: periodRange('month', '2031-10'), today, flows });
    expect(series.totalCents).toBe(10000 + 6000 + 2000 + 2500);
    expect(series.split).toEqual({ transferCents: 10000, cashCents: 8500, otherCents: 2000 });
    const day = (key) => series.points.find((point) => point.key === key);
    expect(day('2031-10-02')).toMatchObject({ value: 6000, transfer: 6000, cash: 0 });
    expect(day('2031-10-06')).toMatchObject({ transfer: 10000, cash: 6000 });
    expect(day('2031-10-08')).toMatchObject({ cash: 8500 });
    // the period before: total only, with its open lesson cash
    expect(series.compareFullCents).toBe(9000 + 1500);
  });

  it('without flows (the bookkeeper) the chart is exactly as before', () => {
    const series = receivedSeries({ invoices, range: periodRange('month', '2031-10'), today });
    expect(series.split).toBeNull();
    expect(series.totalCents).toBe(18000);
    expect(series.points[0]).not.toHaveProperty('transfer');
  });
});

describe('FinanceOverview with the split', () => {
  it('shows the small totals, the legend and the teachers’ cash card (admin)', () => {
    const flows = moneyFlows({ invoices, payments, cashEntries });
    render(<FinanceOverview invoices={invoices} unit="month" anchor="2031-10" today={today} flows={flows} cashHeld={{ cents: 2500, people: 1 }} onOpenCash={() => {}} />);
    const split = document.querySelector('.fo-hero__split');
    expect(split.textContent).toMatch(/Ülekanded\s*100\s*€/);
    expect(split.textContent).toMatch(/Sularaha\s*85\s*€/);
    expect(split.textContent).toMatch(/Muu\s*20\s*€/);
    const legend = screen.getByRole('list', { name: 'Joonise selgitus' });
    expect(within(legend).getByText('Ülekanded')).toBeInTheDocument();
    expect(within(legend).getByText('Sularaha')).toBeInTheDocument();
    expect(screen.getByText('Õpetajate käes sularaha · täna')).toBeInTheDocument();
    // the hidden table carries both lines for screen readers
    expect(screen.getAllByRole('columnheader').map((cell) => cell.textContent)).toEqual(expect.arrayContaining(['Ülekanded', 'Sularaha']));
  });

  it('the bookkeeper (no flows) sees no split and no cash card', () => {
    render(<FinanceOverview invoices={invoices} unit="month" anchor="2031-10" today={today} />);
    expect(document.querySelector('.fo-hero__split')).toBeNull();
    expect(screen.queryByText('Õpetajate käes sularaha · täna')).toBeNull();
    expect(screen.queryByText('Sularaha')).toBeNull();
  });
});
