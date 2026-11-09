import { describe, expect, it } from 'vitest';
import { openPaymentClaim, PAYMENT_CLAIM_NOTE_MAX, paymentClaimRecord } from './invoicePaymentClaims.js';

describe('„Maksin ära” payment claim', () => {
  it('keeps exactly the fields the rules allow (the server adds claimedAt), the note only when written', () => {
    expect(paymentClaimRecord('inv-1', '  Maksin   08.11  ', { uid: 'p1', displayName: 'Mari Ema' })).toEqual({ invoiceId: 'inv-1', claimedByUid: 'p1', claimedByName: 'Mari Ema', note: 'Maksin 08.11' });
    expect(paymentClaimRecord('inv-1', '', { uid: 'p1', email: 'ema@example.com' })).toEqual({ invoiceId: 'inv-1', claimedByUid: 'p1', claimedByName: 'ema@example.com' });
  });
  it('refuses a missing invoice, a missing login and an over-long note', () => {
    expect(() => paymentClaimRecord('', 'x', { uid: 'p1' })).toThrow('Arve puudub');
    expect(() => paymentClaimRecord('inv-1', 'x', {})).toThrow('Sisselogimine');
    expect(() => paymentClaimRecord('inv-1', 'x'.repeat(PAYMENT_CLAIM_NOTE_MAX + 1), { uid: 'p1' })).toThrow(String(PAYMENT_CLAIM_NOTE_MAX));
  });
  it('is worth the administrator\'s attention only while the invoice still has an open balance', () => {
    const claims = new Map([['i1', { id: 'i1' }]]);
    expect(openPaymentClaim(claims, { id: 'i1' }, 500)).toEqual({ id: 'i1' });
    expect(openPaymentClaim(claims, { id: 'i1' }, 0)).toBeNull();
    expect(openPaymentClaim(claims, { id: 'i2' }, 500)).toBeNull();
    expect(openPaymentClaim(null, { id: 'i1' }, 500)).toBeNull();
  });
});
