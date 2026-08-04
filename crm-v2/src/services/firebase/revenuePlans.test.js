import { beforeEach, describe, expect, it, vi } from 'vitest';

const firestore = vi.hoisted(() => ({
  collection: vi.fn((_db, name) => name),
  doc: vi.fn((...parts) => parts.length === 1 ? { id: 'activity', path: `${parts[0]}:activity` } : parts.join(':')),
  getDocs: vi.fn(),
  batch: { set: vi.fn(), commit: vi.fn().mockResolvedValue(undefined) },
  writeBatch: vi.fn(),
}));

vi.mock('firebase/firestore', () => firestore);
vi.mock('./client.js', () => ({ requireFirebaseClient: () => ({ db: 'firebase-db' }) }));

import { revenuePlansService, validateRevenuePlan } from './revenuePlans.js';

describe('revenuePlansService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    firestore.writeBatch.mockReturnValue(firestore.batch);
  });

  it('validates euro price and fractional weekly lesson count', () => {
    expect(validateRevenuePlan({ lessonPrice: '27,50', weeklyLessons: '1,5' })).toMatchObject({ valid: true, lessonPriceCents: 2750, weeklyLessons: 1.5 });
    expect(validateRevenuePlan({ lessonPrice: '0', weeklyLessons: '80' }).valid).toBe(false);
  });

  it('loads the finance-safe forecast projection', async () => {
    firestore.getDocs.mockResolvedValue({ docs: [
      { id: 'student-1', data: () => ({ studentId: 'student-1', studentName: 'Mari', lessonPriceCents: 2500, weeklyLessons: 2, active: true }) },
      { id: 'student-2', data: () => ({ studentId: 'student-2', studentName: 'Vana', active: false }) },
    ] });
    await expect(revenuePlansService.list()).resolves.toEqual([expect.objectContaining({ id: 'student-1', studentName: 'Mari' })]);
    expect(firestore.getDocs).toHaveBeenCalledWith('studentRevenuePlans');
  });

  it('atomically saves the forecast projection, legacy student fields and audit event', async () => {
    const admin = { uid: 'admin-1', displayName: 'Admin', roles: ['admin'] };
    await expect(revenuePlansService.save({ id: 'student-1', name: 'Mari' }, { lessonPrice: '25', weeklyLessons: '2' }, admin)).resolves.toMatchObject({ studentId: 'student-1', lessonPriceCents: 2500, weeklyLessons: 2 });
    expect(firestore.batch.set).toHaveBeenCalledTimes(3);
    expect(firestore.batch.set.mock.calls[0]).toEqual(['firebase-db:studentRevenuePlans:student-1', expect.objectContaining({ studentId: 'student-1', studentName: 'Mari', lessonPriceCents: 2500, weeklyLessons: 2 }), { merge: true }]);
    expect(firestore.batch.set.mock.calls[1]).toEqual(['firebase-db:students:student-1', expect.objectContaining({ lessonPrice: 25, weeklyLessons: 2 }), { merge: true }]);
    expect(firestore.batch.set.mock.calls[2][1]).toMatchObject({ type: 'finance.revenue_plan_updated', byUid: 'admin-1' });
  });

  it('does not let a non-admin change a revenue plan', async () => {
    await expect(revenuePlansService.save({ id: 'student-1' }, { lessonPrice: 25, weeklyLessons: 2 }, { roles: ['finance'] })).rejects.toThrow('Ainult administraator');
    expect(firestore.batch.commit).not.toHaveBeenCalled();
  });
});
