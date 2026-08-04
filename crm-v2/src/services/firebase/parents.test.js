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

  it('creates a requested missing child only with an explicit teacher and parent link', async () => {
    const parent = { id: 'parent-1', displayName: 'Vanem', email: 'vanem@example.com', childName: 'Mari, Karl' };
    await expect(parentsService.createMissingStudent(parent, {
      name: 'Karl', teacherUid: 'teacher-1', teacher: 'Õpetaja', subject: 'Eesti keel', level: 'A1', targetLevel: 'B1',
    }, [], admin)).resolves.toMatchObject({ id: 'generated', name: 'Karl', linkedParentId: 'parent-1', teacherUid: 'teacher-1' });
    expect(firestore.batch.set).toHaveBeenCalledTimes(3);
    expect(firestore.batch.set.mock.calls[0]).toEqual([{ id: 'generated', path: 'students:generated' }, expect.objectContaining({ name: 'Karl', parentUid: 'parent-1', teacher: 'Õpetaja', registrationSource: 'parent-registration' })]);
    expect(firestore.batch.set.mock.calls[1]).toEqual(['firebase-db:users:parent-1', expect.objectContaining({ parentReviewStatus: 'checked', parentReviewKey: 'mari|karl' }), { merge: true }]);
    expect(firestore.batch.set.mock.calls[2][1]).toMatchObject({ type: 'parent.student_created', meta: expect.objectContaining({ studentName: 'Karl', teacherUid: 'teacher-1' }) });
  });

  it('refuses a new card when an active student with the exact child name already exists', async () => {
    await expect(parentsService.createMissingStudent(
      { id: 'parent-1', childName: 'Karl' },
      { name: 'Karl', teacherUid: 'teacher-1', teacher: 'Õpetaja' },
      [{ id: 'student-1', name: ' karl ', active: true }],
      admin,
    )).rejects.toThrow('Seo olemasolev kaart');
    expect(firestore.batch.commit).not.toHaveBeenCalled();
  });

  it('archives exact-email duplicate parent documents and repoints only explicit student links', async () => {
    const primary = { id: 'parent-1', displayName: 'Vanem', email: ' Vanem@Example.com ', childName: 'Mari' };
    const duplicate = { id: 'parent-2', displayName: 'Vanem 2', email: 'vanem@example.com', childName: 'Karl', phone: '555' };
    await expect(parentsService.mergeDuplicates(primary, [duplicate], [
      { id: 'student-1', linkedParentId: 'parent-2', name: 'Karl' },
      { id: 'student-2', parentEmail: 'vanem@example.com', name: 'Mari' },
    ], admin)).resolves.toEqual({ duplicateCount: 1, reassignedStudentCount: 1 });
    expect(firestore.batch.set).toHaveBeenCalledTimes(4);
    expect(firestore.batch.set.mock.calls[0]).toEqual(['firebase-db:users:parent-1', expect.objectContaining({ childName: 'Mari, Karl', mergedDuplicateParentIds: ['parent-2'] }), { merge: true }]);
    expect(firestore.batch.set.mock.calls[1]).toEqual(['firebase-db:users:parent-2', expect.objectContaining({ active: false, mergedIntoParentId: 'parent-1', parentReviewStatus: 'merged' }), { merge: true }]);
    expect(firestore.batch.set.mock.calls[2]).toEqual(['firebase-db:students:student-1', expect.objectContaining({ linkedParentId: 'parent-1', parentUid: 'parent-1' }), { merge: true }]);
    expect(firestore.batch.set.mock.calls.some((call) => call[0] === 'firebase-db:students:student-2')).toBe(false);
    expect(firestore.batch.set.mock.calls[3][1]).toMatchObject({ type: 'parent.duplicates_merged', meta: expect.objectContaining({ duplicateCount: 1, reassignedStudentCount: 1 }) });
  });

  it('refuses to merge parent records whose normalized emails differ', async () => {
    await expect(parentsService.mergeDuplicates(
      { id: 'parent-1', email: 'one@example.com' },
      [{ id: 'parent-2', email: 'two@example.com' }],
      [],
      admin,
    )).rejects.toThrow('täpselt sama e-posti');
    expect(firestore.batch.commit).not.toHaveBeenCalled();
  });
});
