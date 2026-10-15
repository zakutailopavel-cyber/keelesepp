import { duplicatePayments, missingPaymentRecord, reconcilePayments } from './paymentReconciliation.js';

const pay = (id, invoiceId, amountCents, paidAt, createdAt, extra = {}) => ({ id, invoiceId, amountCents, paidAt, createdAt, status: 'active', ...extra });

describe('payment reconciliation', () => {
  it('finds a payment entered twice (double click), not two real payments days apart', () => {
    const first = pay('p1', 'i', 18000, '2026-09-01', '2026-09-01T09:57:28.010Z');
    const second = pay('p2', 'i', 18000, '2026-09-01', '2026-09-01T09:57:30.470Z');
    expect(duplicatePayments([second, first])).toEqual([second]);
    expect(duplicatePayments([first, pay('p3', 'i', 18000, '2026-10-01', '2026-10-01T10:00:00Z')])).toEqual([]);
  });

  it('sorts every invoice into the right finding', () => {
    const invoices = [
      { id: 'dup', num: 'KS-2026-066', amountCents: 18000, status: 'Makstud', date: '2026-09-01' },
      { id: 'over', num: 'KS-2026-070', amountCents: 5000, status: 'Makstud', date: '2026-09-02' },
      { id: 'legacy', num: 'KS-2026-001', amount: 63, status: 'Makstud', paidAt: '2026-06-19', parentPaymentMethod: 'bank', date: '2026-06-19' },
      { id: 'partial', num: 'KS-2026-071', amountCents: 10000, status: 'Makstud', date: '2026-09-03' },
      { id: 'open', num: 'KS-2026-072', amountCents: 10000, status: 'Ootel', date: '2026-09-04' },
      { id: 'fine', num: 'KS-2026-073', amountCents: 10000, status: 'Makstud', date: '2026-09-05' },
      { id: 'unpaid', num: 'KS-2026-074', amountCents: 10000, status: 'Ootel', date: '2026-09-06' },
      { id: 'void', num: 'KS-2026-075', amountCents: 10000, status: 'Tühistatud', date: '2026-09-07' },
    ];
    const payments = [
      pay('a', 'dup', 18000, '2026-09-01', '2026-09-01T09:57:28Z'), pay('b', 'dup', 18000, '2026-09-01', '2026-09-01T09:57:30Z'),
      pay('c', 'over', 7000, '2026-09-02', '2026-09-02T10:00:00Z'),
      pay('d', 'partial', 4000, '2026-09-03', '2026-09-03T10:00:00Z'),
      pay('e', 'open', 10000, '2026-09-04', '2026-09-04T10:00:00Z'),
      pay('f', 'fine', 10000, '2026-09-05', '2026-09-05T10:00:00Z'), pay('g', 'fine', 10000, '2026-09-05', '2026-09-05T10:00:00Z', { status: 'voided' }),
      pay('h', 'void', 10000, '2026-09-07', '2026-09-07T10:00:00Z'),
      pay('x', 'gone', 2000, '2026-09-08', '2026-09-08T10:00:00Z', { invoiceNum: 'KS-2026-099' }),
    ];
    const transactions = [{ id: 't1', payerName: 'LESNIKOVA JEKATERINA', paidAt: '2026-05-07', unappliedAmountCents: 18500 }, { id: 't2', unappliedAmountCents: 0 }];
    const { issues, count, invoicedCents, recordedCents } = reconcilePayments({ invoices, payments, transactions });
    expect(issues.duplicate.map((item) => [item.label, item.duplicates.map((p) => p.id)])).toEqual([['KS-2026-066', ['b']]]);
    expect(issues.overpaid.map((item) => [item.label, item.overCents])).toEqual([['KS-2026-070', 2000]]);
    expect(issues.missingPayment.map((item) => item.label)).toEqual(['KS-2026-001']);
    expect(issues.statusMismatch.map((item) => item.label)).toEqual(['KS-2026-072', 'KS-2026-071']);
    expect(issues.cancelledWithPayment.map((item) => item.label)).toEqual(['KS-2026-075']);
    expect(issues.unknownInvoice.map((item) => item.label)).toEqual(['KS-2026-099']);
    expect(issues.unapplied.map((item) => item.amountCents)).toEqual([18500]);
    expect(count).toBe(8);
    expect(invoicedCents).toBe(18000 + 5000 + 6300 + 10000 * 4);
    expect(recordedCents).toBe(36000 + 7000 + 4000 + 10000 + 10000);
  });

  it('a credited invoice is never a finding', () => {
    const { count } = reconcilePayments({ invoices: [{ id: 'c', amountCents: 5000, status: 'Krediteeritud' }], payments: [] });
    expect(count).toBe(0);
  });

  it('the missing record takes the amount, day and method of the invoice and has one request id per invoice', () => {
    expect(missingPaymentRecord({ id: 'abc', num: 'KS-2026-001', amount: 63, paidAt: '2026-06-19', parentPaymentMethod: 'bank', paymentReference: 'KS-2026-001' }))
      .toEqual({ amount: 63, paidAt: '2026-06-19', method: 'bank', reference: 'KS-2026-001', note: expect.stringMatching(/Kontroll/), requestId: 'reconcile-missing-abc' });
    expect(missingPaymentRecord({ id: 'x', amountCents: 1000, date: '2026-07-01' })).toMatchObject({ amount: 10, paidAt: '2026-07-01', method: 'bank' });
  });
});
