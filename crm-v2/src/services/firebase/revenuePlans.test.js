import { beforeEach, describe, expect, it, vi } from 'vitest';

const firestore = vi.hoisted(() => ({
  collection: vi.fn((_db, name) => name),
  doc: vi.fn((...parts) => parts.length === 1 ? { id: 'activity', path: `${parts[0]}:activity` } : parts.join(':')),
  getDocs: vi.fn(),
  getDoc: vi.fn(),
  batch: { set: vi.fn(), commit: vi.fn().mockResolvedValue(undefined) },
  writeBatch: vi.fn(),
}));

vi.mock('firebase/firestore', () => firestore);
vi.mock('./client.js', () => ({ requireFirebaseClient: () => ({ db: 'firebase-db' }) }));

import { nextPriceHistory, normalizeRevenuePlan, priceTermsRecord, revenuePlansService, validateRevenuePlan } from './revenuePlans.js';

describe('revenuePlansService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    firestore.writeBatch.mockReturnValue(firestore.batch);
  });

  it('validates euro price and fractional weekly lesson count', () => {
    expect(validateRevenuePlan({ lessonPrice: '27,50', weeklyLessons: '1,5' })).toMatchObject({ valid: true, lessonPriceCents: 2750, weeklyLessons: 1.5 });
    expect(validateRevenuePlan({ lessonPrice: '0', weeklyLessons: '80' }).valid).toBe(false);
  });

  it('defaults new and old plans to advance billing and preserves actual billing', () => {
    expect(normalizeRevenuePlan('s1', {}).billingMode).toBe('advance');
    expect(normalizeRevenuePlan('s1', { billingMode: 'actual' }).billingMode).toBe('actual');
  });

  it('loads the finance-safe forecast projection', async () => {
    firestore.getDocs.mockResolvedValue({ docs: [
      { id: 'student-1', data: () => ({ studentId: 'student-1', studentName: 'Mari', lessonPriceCents: 2500, weeklyLessons: 2, active: true }) },
      { id: 'student-2', data: () => ({ studentId: 'student-2', studentName: 'Vana', active: false }) },
    ] });
    await expect(revenuePlansService.list()).resolves.toEqual([expect.objectContaining({ id: 'student-1', studentName: 'Mari' })]);
    expect(firestore.getDocs).toHaveBeenCalledWith('studentRevenuePlans');
  });

  it('saves the price only in the private plan (never on the student card) with an audit event', async () => {
    const admin = { uid: 'admin-1', displayName: 'Admin', roles: ['admin'] };
    await expect(revenuePlansService.save({ id: 'student-1', name: 'Mari' }, { lessonPrice: '25', weeklyLessons: '2', lessonMinutes: '45', billingMode: 'advance', chargeNoShow: false, validFrom: '2026-10-01' }, admin))
      .resolves.toMatchObject({ studentId: 'student-1', lessonPriceCents: 2500, weeklyLessons: 2, lessonMinutes: 45, billingMode: 'advance', chargeNoShow: false });
    expect(firestore.batch.set).toHaveBeenCalledTimes(2);
    expect(firestore.batch.set.mock.calls[0]).toEqual(['firebase-db:studentRevenuePlans:student-1', expect.objectContaining({ lessonPriceCents: 2500, validFrom: '2026-10-01', priceHistory: [] }), { mergeFields: expect.arrayContaining(['lessonPriceCents', 'priceHistory']) }]);
    expect(firestore.batch.set.mock.calls.some(([path]) => String(path).includes(':students:'))).toBe(false);
    expect(firestore.batch.set.mock.calls[1][1]).toMatchObject({ type: 'finance.revenue_plan_updated', byUid: 'admin-1' });
  });

  it('keeps the previous price in the history when the price changes', () => {
    const previous = { lessonPriceCents: 2500, lessonMinutes: 60, validFrom: '2026-01-01', priceHistory: [] };
    expect(nextPriceHistory(previous, { lessonPriceCents: 2800, lessonMinutes: 60, validFrom: '2026-10-01' }))
      .toEqual([{ lessonPriceCents: 2500, lessonMinutes: 60, validFrom: '2026-01-01', validTo: '2026-10-01' }]);
    expect(nextPriceHistory(previous, { lessonPriceCents: 2500, lessonMinutes: 60, validFrom: '2026-10-01' })).toEqual([]);
    expect(nextPriceHistory(null, { lessonPriceCents: 2500, lessonMinutes: 60 })).toEqual([]);
  });

  it('stores the price terms with who and when changed them; the activity log gets no reason', async () => {
    const admin = { uid: 'admin-1', displayName: 'Admin', roles: ['admin'] };
    await revenuePlansService.save({ id: 'student-1', name: 'Mari' }, { lessonPrice: '20', weeklyLessons: '1', lessonMinutes: '60', priceTerms: 'discount', hourlyRateCents: 2000, discountReason: ' Kaks last ' }, admin);
    const [, written, options] = firestore.batch.set.mock.calls[0];
    expect(written).toMatchObject({ lessonPriceCents: 2000, priceTerms: 'discount', hourlyRateCents: 2000, discountReason: 'Kaks last', priceTermsChangedBy: 'Admin', priceTermsChangedByUid: 'admin-1' });
    expect(written.priceTermsChangedAt).toMatch(/^\d{4}-/);
    expect(options.mergeFields).toEqual(expect.arrayContaining(['priceTerms', 'discountReason', 'priceTermsChangedAt']));
    expect(firestore.batch.set.mock.calls[1][1].meta).toMatchObject({ priceTerms: 'discount' });
    expect(firestore.batch.set.mock.calls[1][1].meta.discountReason).toBeUndefined();
  });

  it('refuses a discount without a reason and keeps the old terms when the form has none', async () => {
    const admin = { uid: 'admin-1', roles: ['admin'] };
    await expect(revenuePlansService.save({ id: 'student-1' }, { lessonPrice: '20', weeklyLessons: '1', priceTerms: 'discount', hourlyRateCents: 2000, discountReason: ' ' }, admin)).rejects.toThrow('põhjus');
    expect(firestore.batch.commit).not.toHaveBeenCalled();
    expect(priceTermsRecord({ lessonPrice: '20' })).toEqual({});
    expect(() => priceTermsRecord({ priceTerms: 'discount', hourlyRateCents: 2000, discountReason: 'x'.repeat(301) })).toThrow('300');
    const previous = { priceTerms: 'discount', hourlyRateCents: 2000, discountReason: 'Kaks last', priceTermsChangedAt: '2026-10-01T00:00:00.000Z', priceTermsChangedBy: 'Vana', priceTermsChangedByUid: 'u0' };
    expect(priceTermsRecord({ priceTerms: 'discount', hourlyRateCents: 2000, discountReason: 'Kaks last' }, previous, { at: 'now', name: 'Uus', uid: 'u1' }))
      .toMatchObject({ priceTermsChangedAt: '2026-10-01T00:00:00.000Z', priceTermsChangedBy: 'Vana' });
    expect(priceTermsRecord({ priceTerms: 'general', hourlyRateCents: 2500, discountReason: 'ignored' }, previous, { at: 'now', name: 'Uus', uid: 'u1' }))
      .toEqual({ priceTerms: 'general', hourlyRateCents: 2500, discountReason: '', priceTermsChangedAt: 'now', priceTermsChangedBy: 'Uus', priceTermsChangedByUid: 'u1' });
  });

  it('the price history remembers the terms of the previous price', () => {
    const previous = { lessonPriceCents: 2000, lessonMinutes: 60, validFrom: '2026-01-01', priceTerms: 'discount', discountReason: 'Kaks last' };
    expect(nextPriceHistory(previous, { lessonPriceCents: 2500, lessonMinutes: 60, validFrom: '2026-11-01' }))
      .toEqual([{ lessonPriceCents: 2000, lessonMinutes: 60, validFrom: '2026-01-01', validTo: '2026-11-01', priceTerms: 'discount', discountReason: 'Kaks last' }]);
  });

  it('does not let a non-admin change a revenue plan', async () => {
    await expect(revenuePlansService.save({ id: 'student-1' }, { lessonPrice: 25, weeklyLessons: 2 }, { roles: ['finance'] })).rejects.toThrow('Ainult administraator');
    expect(firestore.batch.commit).not.toHaveBeenCalled();
  });
});
