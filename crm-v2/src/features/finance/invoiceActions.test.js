import { canCancelInvoice } from './invoiceActions.js';

describe('canCancelInvoice', () => {
  const eligible = { billingMode: 'monthly_plan_v1', status: 'Ootel', paidAmountCents: 0 };
  it('permits an unsent and unpaid monthly invoice, including an older month', () => {
    expect(canCancelInvoice({ ...eligible, planMonth: '2026-06' })).toBe(true);
  });
  it.each([
    { billingMode: undefined }, { emailStatus: 'sent' }, { emailStatus: 'sending' },
    { paidAmountCents: 100 }, { creditedAmountCents: 100 }, { lessonIds: ['lesson-1'] },
    { lines: [{ lessonId: 'lesson-1' }] }, { status: 'Makstud' },
  ])('hides cancellation for ineligible financial history %#', (change) => {
    expect(canCancelInvoice({ ...eligible, ...change })).toBe(false);
  });
});
