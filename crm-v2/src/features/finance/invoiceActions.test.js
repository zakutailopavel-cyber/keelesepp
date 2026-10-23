import { canCancelInvoice, creditableLessonLines, invoiceWasSent } from './invoiceActions.js';

describe('canCancelInvoice (rule from PR #640, moved unchanged)', () => {
  const eligible = { billingMode: 'monthly_plan_v1', status: 'Ootel', paidAmountCents: 0 };
  it('permits an unpaid monthly invoice, also an e-mailed one and an older month', () => {
    expect(canCancelInvoice({ ...eligible, planMonth: '2026-06' })).toBe(true);
    expect(canCancelInvoice({ ...eligible, emailStatus: 'sent', emailSentAt: '2026-06-02T10:00:00Z' })).toBe(true);
    expect(canCancelInvoice({ billingMode: 'lesson_tokens_v1', status: 'Ootel', tokenStatus: 'pending' })).toBe(true);
  });
  it.each([
    { billingMode: undefined }, { paidAmountCents: 100 }, { creditedAmountCents: 100 }, { lessonIds: ['lesson-1'] },
    { lines: [{ lessonId: 'lesson-1' }] }, { status: 'Makstud' }, { status: 'Tühistatud' },
    { billingMode: 'lesson_tokens_v1', tokenStatus: 'credited' },
  ])('hides cancellation for ineligible financial history %#', (change) => {
    expect(canCancelInvoice({ ...eligible, ...change })).toBe(false);
  });
});

describe('invoice helpers', () => {
  it('detects a sent invoice', () => {
    expect(invoiceWasSent({ emailStatus: 'queued' })).toBe(true);
    expect(invoiceWasSent({})).toBe(false);
  });
  it('lists only lesson lines that are not credited yet', () => {
    expect(creditableLessonLines({ lines: [{ lessonId: 'a' }, { lessonId: 'b' }, { description: 'Kuutasu' }], correctedLessonIds: ['b'] }).map((line) => line.lessonId)).toEqual(['a']);
    expect(creditableLessonLines({})).toEqual([]);
  });
});
