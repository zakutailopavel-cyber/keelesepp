import { canCancelInvoice, creditableLessonLines, fullCorrectionBlocker, invoiceHasLessonLines, invoiceOpenCreditCents, invoiceWasSent } from './invoiceActions.js';

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

describe('full credit and correction (owner 2026-10-23, mirrors functions/invoice-correction-core.js)', () => {
  const invoice = { status: 'Ootel', amountCents: 8000, amount: 80 };
  it('the open amount is the original minus earlier lesson-line credits', () => {
    expect(invoiceOpenCreditCents(invoice)).toBe(8000);
    expect(invoiceOpenCreditCents({ ...invoice, creditedAmountCents: 2500 })).toBe(5500);
    expect(invoiceOpenCreditCents({ amountCents: 4000 })).toBe(4000);
  });
  it('is offered for an unpaid issued invoice only', () => {
    expect(fullCorrectionBlocker(invoice)).toBe('');
    expect(fullCorrectionBlocker({ ...invoice, status: 'Tühistatud' })).toMatch(/Tühistatud/);
    expect(fullCorrectionBlocker({ ...invoice, status: 'Krediteeritud' })).toMatch(/täielikult/);
    expect(fullCorrectionBlocker({ ...invoice, creditedAmountCents: 8000 })).toMatch(/täielikult/);
    expect(fullCorrectionBlocker({ ...invoice, correctedBy: { invoiceId: 'n', invoiceNum: 'KS-9' } })).toBe('Arve on juba parandatud uue arvega KS-9.');
    expect(fullCorrectionBlocker({ ...invoice, paidAmountCents: 100 })).toMatch(/laekumisi/);
    expect(fullCorrectionBlocker({ ...invoice, billingMode: 'lesson_tokens_v1', tokenStatus: 'credited' })).toMatch(/paketi/);
  });
  it('knows lesson-line invoices', () => {
    expect(invoiceHasLessonLines({ lines: [{ lessonId: 'a' }] })).toBe(true);
    expect(invoiceHasLessonLines({ lessonIds: ['old-1'] })).toBe(true);
    expect(invoiceHasLessonLines(invoice)).toBe(false);
  });
});
