import { beforeEach, describe, expect, it, vi } from 'vitest';

const firestore = vi.hoisted(() => ({
  collection: vi.fn((_db, name) => name),
  doc: vi.fn((...parts) => parts.length === 1 ? { id: 'generated', path: `${parts[0]}:generated` } : parts.join(':')),
  getDocs: vi.fn(),
  batch: { set: vi.fn(), commit: vi.fn().mockResolvedValue(undefined) },
  writeBatch: vi.fn(),
}));

vi.mock('firebase/firestore', () => firestore);
vi.mock('./client.js', () => ({ requireFirebaseClient: () => ({ db: 'firebase-db' }) }));

import { normalizeParent, parentReviewKey, parentsService, splitChildNames } from './parents.js';

const admin = { uid: 'admin-1', displayName: 'Admin', roles: ['admin'] };

describe('parentsService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    firestore.writeBatch.mockReturnValue(firestore.batch);
  });

  it('normalizes legacy contact fields and canonical child names', () => {
    expect(normalizeParent('parent-1', { displayName: ' Mari Ema ', parentPhone: ' 555 ', childName: 'Mari; mari, Jaan' })).toMatchObject({ id: 'parent-1', displayName: 'Mari Ema', phone: '555', parentContactStatus: 'new' });
    expect(splitChildNames('Mari; mari, Jaan')).toEqual(['Mari', 'Jaan']);
    expect(parentReviewKey('Mari; Jaan')).toBe('mari|jaan');
  });

  it('loads only active parent profiles from the real users collection', async () => {
    firestore.getDocs.mockResolvedValue({ docs: [
      { id: 'parent-1', data: () => ({ role: 'parent', displayName: 'Vanem' }) },
      { id: 'teacher-1', data: () => ({ role: 'teacher', displayName: 'Õpetaja' }) },
      { id: 'parent-2', data: () => ({ role: 'parent', displayName: 'Arhiveeritud', active: false }) },
    ] });
    await expect(parentsService.list()).resolves.toEqual([expect.objectContaining({ id: 'parent-1', displayName: 'Vanem' })]);
    expect(firestore.getDocs).toHaveBeenCalledWith('users');
  });

  it('atomically updates CRM contact fields with an audit event', async () => {
    const parent = { id: 'parent-1', displayName: 'Vanem', email: 'vanem@example.com' };
    await parentsService.updateCrm(parent, { parentContactStatus: 'called', phone: '555', role: 'admin' }, admin);
    expect(firestore.batch.set).toHaveBeenCalledTimes(2);
    expect(firestore.batch.set.mock.calls[0]).toEqual(['firebase-db:users:parent-1', expect.objectContaining({ parentContactStatus: 'called', phone: '555' }), { merge: true }]);
    expect(firestore.batch.set.mock.calls[0][1]).not.toHaveProperty('role');
    expect(firestore.batch.set.mock.calls[1][1]).toMatchObject({ type: 'parent.crm_updated', byUid: 'admin-1' });
  });

  it('links an existing student and confirms the parent registration in one batch', async () => {
    const parent = { id: 'parent-1', displayName: 'Vanem', email: 'vanem@example.com', childName: 'Mari' };
    await expect(parentsService.linkStudent(parent, { id: 'student-1', name: 'Jaan' }, admin)).resolves.toEqual({ childName: 'Mari, Jaan' });
    expect(firestore.batch.set).toHaveBeenCalledTimes(3);
    expect(firestore.batch.set.mock.calls[0]).toEqual(['firebase-db:students:student-1', expect.objectContaining({ linkedParentId: 'parent-1', parentUid: 'parent-1', parentName: 'Vanem' }), { merge: true }]);
    expect(firestore.batch.set.mock.calls[1]).toEqual(['firebase-db:users:parent-1', expect.objectContaining({ childName: 'Mari, Jaan', parentReviewStatus: 'checked', parentReviewKey: 'mari|jaan' }), { merge: true }]);
    expect(firestore.batch.set.mock.calls[2][1]).toMatchObject({ type: 'parent.student_assigned', meta: expect.objectContaining({ studentId: 'student-1' }) });
  });

  it('does not overwrite an existing explicit parent link', async () => {
    await expect(parentsService.linkStudent({ id: 'parent-1' }, { id: 'student-1', linkedParentId: 'parent-2' }, admin)).rejects.toThrow('teise lapsevanema');
    expect(firestore.batch.commit).not.toHaveBeenCalled();
  });
});
