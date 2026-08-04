import { buildParentRows, exactParentDuplicateClusters, filterParentRows, parentMatchesStudent } from './parentModel.js';

describe('parent model', () => {
  const parent = { id: 'parent-1', displayName: 'Mari Ema', email: 'ema@example.com', childName: 'Mari', parentReviewStatus: 'checked', parentReviewKey: 'mari', parentContactStatus: 'active' };

  it('accepts explicit IDs and verified contact pairs, but never a child name alone', () => {
    expect(parentMatchesStudent(parent, { id: 'student-1', linkedParentId: 'parent-1', name: 'Keegi' })).toBe(true);
    expect(parentMatchesStudent(parent, { id: 'student-2', parentEmail: 'ema@example.com', name: 'Mari' })).toBe(true);
    expect(parentMatchesStudent(parent, { id: 'student-3', parentName: 'Mari Ema', name: 'Mari' })).toBe(true);
    expect(parentMatchesStudent(parent, { id: 'student-4', name: 'Mari' })).toBe(false);
  });

  it('builds linked children, review gaps and invoice balances', () => {
    const rows = buildParentRows([parent], [{ id: 'student-1', name: 'Mari', linkedParentId: 'parent-1', active: true }], [{ id: 'invoice-1', studentId: 'student-1', amount: 40, paidAmount: 10 }]);
    expect(rows[0]).toMatchObject({ children: [expect.objectContaining({ id: 'student-1' })], missingNames: [], needsReview: false, balanceCents: 3000 });
    expect(filterParentRows(rows, { query: 'mari', status: 'active' })).toHaveLength(1);
  });

  it('detects duplicates by exact normalized email only and prefers the explicitly linked profile', () => {
    const clusters = exactParentDuplicateClusters([
      { id: 'parent-1', email: ' ema@example.com ', displayName: 'Esimene', phone: '555' },
      { id: 'parent-2', email: 'EMA@EXAMPLE.COM', displayName: 'Teine' },
      { id: 'parent-3', email: 'other@example.com', displayName: 'Esimene', phone: '555' },
      { id: 'parent-4', email: '', displayName: 'Esimene', phone: '555' },
    ], [{ id: 'student-1', linkedParentId: 'parent-2' }]);
    expect(clusters).toHaveLength(1);
    expect(clusters[0]).toMatchObject({ email: 'ema@example.com', primary: expect.objectContaining({ id: 'parent-2' }), duplicates: [expect.objectContaining({ id: 'parent-1' })], linkedStudentCount: 1 });
  });
});
