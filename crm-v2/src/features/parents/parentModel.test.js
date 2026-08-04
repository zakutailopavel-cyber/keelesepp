import { buildParentRows, filterParentRows, parentMatchesStudent } from './parentModel.js';

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
});
