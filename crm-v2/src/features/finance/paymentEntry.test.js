import { describe, expect, it, vi } from 'vitest';
import { earlierPaymentDate, isOverpaymentRefusal, paymentDateCheck, paymentRecordedNotice, recordPaymentWithAdvance } from './paymentEntry.js';

const today = '2026-10-14';

describe('paymentDateCheck', () => {
  it('a payment on time, in this month, on an unpaid invoice: only the due date is shown', () => {
    const check = paymentDateCheck({ invoice: { due: '2026-10-10' }, paidAt: '2026-10-14', today });
    expect(check.info).toBe('Maksetähtaeg 10.10.2026.');
    expect(check.warning).toBe('');
    expect(check.reasons).toEqual([]);
  });

  it('the October audit case: a July invoice entered with today\'s date warns twice over', () => {
    const check = paymentDateCheck({ invoice: { due: '2026-07-15' }, paidAt: '2026-10-14', today });
    expect(check.warning).toBe('Kuupäev peab olema päev, mil raha pangakontole laekus.');
    expect(check.reasons).toEqual(['Kuupäev on üle 7 päeva pärast maksetähtaega (15.07.2026).']);
    const corrected = paymentDateCheck({ invoice: { due: '2026-07-15' }, paidAt: '2026-07-16', today });
    expect(corrected.reasons).toEqual(['Kuupäev on teises kuus kui täna.']);
  });

  it('exactly 7 days after the due date is fine, 8 is not', () => {
    expect(paymentDateCheck({ invoice: { due: '2026-10-01' }, paidAt: '2026-10-08', today }).reasons).toEqual([]);
    expect(paymentDateCheck({ invoice: { due: '2026-10-01' }, paidAt: '2026-10-09', today }).reasons).toHaveLength(1);
  });

  it('an earlier payment date is shown and a different date warns', () => {
    const invoice = { due: '2026-10-10', paidAt: '2026-10-02' };
    const check = paymentDateCheck({ invoice, paidAt: '2026-10-14', today });
    expect(check.info).toBe('Maksetähtaeg 10.10.2026 · varasem makse 02.10.2026.');
    expect(check.reasons).toEqual(['Arvel on juba makse kuupäevaga 02.10.2026.']);
    expect(paymentDateCheck({ invoice, paidAt: '2026-10-02', today }).reasons).toEqual([]);
  });

  it('the newest active payment counts when the payment list is known; voided ones do not', () => {
    const payments = [{ paidAt: '2026-09-20', status: 'active' }, { paidAt: '2026-10-05', status: 'voided' }];
    expect(earlierPaymentDate({}, payments)).toBe('2026-09-20');
    expect(earlierPaymentDate({ paidAt: { toDate: () => new Date('2026-09-25T10:00:00Z') } }, payments)).toBe('2026-09-25');
  });

  it('cash asks for the day the money was taken; no date, no warning', () => {
    expect(paymentDateCheck({ invoice: { due: '2026-07-15' }, paidAt: '2026-10-14', method: 'cash', today }).warning).toBe('Kuupäev peab olema päev, mil sularaha kätte saadi.');
    expect(paymentDateCheck({ invoice: { due: '2026-07-15' }, paidAt: '', today }).warning).toBe('');
  });
});

describe('recordPaymentWithAdvance', () => {
  it('a plain payment does not touch the advance', async () => {
    const repo = { recordPayment: vi.fn().mockResolvedValue({ invoice: { overpaidAmountCents: 0 } }), resolveInvoiceOverpayment: vi.fn() };
    const outcome = await recordPaymentWithAdvance(repo, 'i1', { amount: 10 });
    expect(outcome.advanced).toBe(false);
    expect(repo.resolveInvoiceOverpayment).not.toHaveBeenCalled();
    expect(paymentRecordedNotice(outcome, 'KS-1')).toBe('Makse arvele KS-1 registreeriti.');
  });

  it('a confirmed overpayment moves the excess to the advance', async () => {
    const repo = { recordPayment: vi.fn().mockResolvedValue({ invoice: { overpaidAmountCents: 17000 } }), resolveInvoiceOverpayment: vi.fn().mockResolvedValue({}) };
    const outcome = await recordPaymentWithAdvance(repo, 'i1', { amount: 170, allowOverpayment: true });
    expect(repo.resolveInvoiceOverpayment).toHaveBeenCalledWith('i1', expect.any(String));
    expect(paymentRecordedNotice(outcome)).toBe('Makse registreeriti, ülejääk kanti maksja ettemaksuks.');
  });

  it('if the advance step fails the payment stays recorded and the notice says what to do', async () => {
    const repo = { recordPayment: vi.fn().mockResolvedValue({ invoice: { overpaidAmountCents: 500 } }), resolveInvoiceOverpayment: vi.fn().mockRejectedValue(new Error('Periood on suletud')) };
    const outcome = await recordPaymentWithAdvance(repo, 'i1', { amount: 5, allowOverpayment: true });
    expect(outcome).toEqual(expect.objectContaining({ advanced: false, advanceError: 'Periood on suletud' }));
    expect(paymentRecordedNotice(outcome)).toMatch(/Muuda avansiks/);
  });

  it('recognises the server refusal by its code', () => {
    expect(isOverpaymentRefusal({ details: { code: 'overpayment' } })).toBe(true);
    expect(isOverpaymentRefusal({ details: { code: 'duplicate_payment' } })).toBe(false);
    expect(isOverpaymentRefusal(new Error('x'))).toBe(false);
  });
});
