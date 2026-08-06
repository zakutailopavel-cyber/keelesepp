import { describe, expect, it } from 'vitest';
import { batchInvoicePayload, buildBatchInvoicePlan, currentBillingMonth, lessonBelongsToMonth } from './batchInvoices.js';

describe('batch invoice planning', () => {
  it('selects only lessons from the chosen month and totals ready invoices', () => {
    const plan = buildBatchInvoicePlan([
      {
        student: { id: 's1', name: 'Mari Maas' },
        lessonPriceCents: 2500,
        lessons: [
          { id: 'l1', date: '2026-08-03' },
          { id: 'l2', date: '2026-08-10' },
          { id: 'l3', date: '2026-07-28' },
        ],
      },
      {
        student: { id: 's2', name: 'Jaan Tamm' },
        lessonPriceCents: 3000,
        lessons: [{ id: 'l4', date: '2026-08-05' }],
      },
    ], '2026-08');

    expect(plan.ready).toHaveLength(2);
    expect(plan.ready[0].lessonIds).toEqual(['l1', 'l2']);
    expect(plan.totals).toEqual({ invoices: 2, lessons: 3, amountCents: 8000 });
  });

  it('keeps students without a lesson price out of the executable queue', () => {
    const plan = buildBatchInvoicePlan([
      {
        student: { id: 's1', name: 'Mari Maas' },
        lessonPriceCents: 0,
        lessons: [{ id: 'l1', date: '2026-08-03' }],
      },
    ], '2026-08');

    expect(plan.ready).toEqual([]);
    expect(plan.blocked).toEqual([expect.objectContaining({ studentName: 'Mari Maas', reason: 'Tunni hind puudub' })]);
  });

  it('returns an empty plan for an invalid month', () => {
    expect(buildBatchInvoicePlan([], 'august')).toEqual({
      month: '',
      ready: [],
      blocked: [],
      totals: { invoices: 0, lessons: 0, amountCents: 0 },
    });
  });

  it('builds an invoice payload without exposing the mutable source array', () => {
    const item = { studentId: 's1', lessonIds: ['l1', 'l2'] };
    const payload = batchInvoicePayload(item, { due: '2026-08-10', description: 'Augusti tunnid' });

    expect(payload).toEqual({
      studentId: 's1',
      lessonIds: ['l1', 'l2'],
      due: '2026-08-10',
      description: 'Augusti tunnid',
      paymentReference: '',
    });
    expect(payload.lessonIds).not.toBe(item.lessonIds);
  });

  it('uses local calendar values for the default billing month', () => {
    expect(currentBillingMonth(new Date(2026, 7, 6))).toBe('2026-08');
    expect(lessonBelongsToMonth({ date: '2026-08-31' }, '2026-08')).toBe(true);
    expect(lessonBelongsToMonth({ date: '2026-09-01' }, '2026-08')).toBe(false);
  });
});
