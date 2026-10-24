import { beforeEach, describe, expect, it, vi } from 'vitest';

const firestore = vi.hoisted(() => ({
  collection: vi.fn((_db, name) => name),
  doc: vi.fn((...parts) => parts.length === 1 ? { id: 'generated', path: `${parts[0]}:generated` } : parts.join(':')),
  getDocs: vi.fn(),
  batch: { set: vi.fn(), commit: vi.fn().mockResolvedValue(undefined) },
  writeBatch: vi.fn(),
  arrayUnion: vi.fn((...values) => ({ union: values })),
  arrayRemove: vi.fn((...values) => ({ remove: values })),
}));

vi.mock('firebase/firestore', () => firestore);
vi.mock('./client.js', () => ({ requireFirebaseClient: () => ({ db: 'firebase-db' }) }));

import { normalizeParent, parentContactsOf, parentIdsOf, parentReviewKey, parentsService, splitChildNames } from './parents.js';

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
    await expect(parentsService.linkStudent(parent, { id: 'student-1', name: 'Jaan' }, admin)).resolves.toEqual({ childName: 'Mari, Jaan', linkedRecordCount: 1 });
    expect(firestore.batch.set).toHaveBeenCalledTimes(3);
    expect(firestore.batch.set.mock.calls[0]).toEqual(['firebase-db:students:student-1', expect.objectContaining({ linkedParentId: 'parent-1', parentUid: 'parent-1', parentName: 'Vanem' }), { merge: true }]);
    expect(firestore.batch.set.mock.calls[1]).toEqual(['firebase-db:users:parent-1', expect.objectContaining({ childName: 'Mari, Jaan', parentReviewStatus: 'checked', parentReviewKey: 'mari|jaan' }), { merge: true }]);
    expect(firestore.batch.set.mock.calls[2][1]).toMatchObject({ type: 'parent.student_assigned', meta: expect.objectContaining({ studentId: 'student-1' }) });
  });

  it('adds a second parent and keeps the first one as the main parent (several parents per child)', async () => {
    await parentsService.linkStudent({ id: 'parent-1', displayName: 'Isa', email: 'isa@example.com' }, { id: 'student-1', name: 'Mari', linkedParentId: 'parent-2', parentName: 'Ema', parentEmail: 'ema@example.com' }, admin);
    const [, card] = firestore.batch.set.mock.calls[0];
    expect(card.linkedParentIds).toEqual(['parent-1']);
    expect(card).not.toHaveProperty('linkedParentId');
    expect(card).not.toHaveProperty('parentName');
    expect(firestore.batch.set.mock.calls[1][1].linkedStudentIds).toEqual({ union: ['student-1'] });
    vi.clearAllMocks(); firestore.writeBatch.mockReturnValue(firestore.batch);
    await parentsService.linkStudent({ id: 'parent-1', displayName: 'Isa' }, { id: 'student-1', name: 'Mari', linkedParentId: 'parent-2', linkedParentIds: ['parent-2'] }, admin, { force: true });
    expect(firestore.batch.set.mock.calls[0][1]).toMatchObject({ linkedParentIds: ['parent-2', 'parent-1'], linkedParentId: 'parent-1', parentUid: 'parent-1' });
  });

  it('unlinks one parent: the others stay, the main parent moves to the next one', async () => {
    const student = { id: 'student-1', name: 'Mari', linkedParentId: 'parent-1', parentUid: 'parent-1', linkedParentIds: ['parent-1', 'parent-2'] };
    expect(parentIdsOf(student)).toEqual(['parent-1', 'parent-2']);
    await expect(parentsService.unlinkStudent('parent-1', student, admin)).resolves.toEqual({ linkedParentIds: ['parent-2'] });
    expect(firestore.batch.set.mock.calls[0]).toEqual(['firebase-db:students:student-1', expect.objectContaining({ linkedParentIds: ['parent-2'], linkedParentId: 'parent-2', parentUid: 'parent-2' }), { merge: true }]);
    expect(firestore.batch.set.mock.calls[1]).toEqual(['firebase-db:users:parent-1', { linkedStudentIds: { remove: ['student-1'] } }, { merge: true }]);
    expect(firestore.batch.set.mock.calls[2][1]).toMatchObject({ type: 'parent.student_unlinked' });
    await expect(parentsService.unlinkStudent('parent-1', student, { roles: ['teacher'] })).rejects.toThrow('administraator');
  });

  it('keeps parents without an account as contacts; the first one fills the parent fields', async () => {
    const student = { id: 'student-1', name: 'Mari', parentName: 'Ema', parentEmail: 'ema@example.com' };
    expect(parentContactsOf({ ...student, parentContacts: [{ name: 'Ema', email: 'EMA@example.com', phone: '555' }] })).toEqual([{ name: 'Ema', email: 'ema@example.com', phone: '555' }]);
    const patch = await parentsService.addContact(student, { name: 'Isa', email: ' Isa@Example.com ', phone: '5551' }, admin);
    expect(patch.parentContacts).toEqual([{ name: 'Ema', email: 'ema@example.com', phone: '' }, { name: 'Isa', email: 'isa@example.com', phone: '5551' }]);
    expect(patch).not.toHaveProperty('parentName');
    expect(patch.parentPhone).toBe('5551');
    await expect(parentsService.addContact(student, { email: 'ema@example.com' }, admin)).rejects.toThrow('juba olemas');
    await expect(parentsService.addContact(student, { email: 'not-an-email' }, admin)).rejects.toThrow('E-posti');
    await expect(parentsService.addContact(student, {}, admin)).rejects.toThrow('Sisesta');
    const removed = await parentsService.removeContact({ ...student, parentContacts: patch.parentContacts }, { name: 'Ema', email: 'ema@example.com', phone: '' }, admin);
    expect(removed).toMatchObject({ parentContacts: [{ name: 'Isa', email: 'isa@example.com', phone: '5551' }], parentName: 'Isa', parentEmail: 'isa@example.com' });
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

  it('reuses an existing child in the same family and adds a learning enrollment instead of creating a duplicate card', async () => {
    await expect(parentsService.createMissingStudent(
      { id: 'parent-1', displayName: 'Vanem', email: 'vanem@example.com', childName: 'Karl' },
      { name: 'Karl', teacherUid: 'teacher-1', teacher: 'Õpetaja', subject: 'Matemaatika', level: 'A1', targetLevel: 'B1' },
      [{ id: 'student-1', name: ' karl ', active: true, linkedParentId: 'parent-1', parentEmail: 'vanem@example.com', subject: 'Eesti keel', teacher: 'Õpetaja' }],
      admin,
    )).resolves.toMatchObject({ id: 'student-1', reusedExistingStudent: true });
    expect(firestore.batch.set.mock.calls.some((call) => call[0] === 'firebase-db:students:student-1' && Array.isArray(call[1]?.enrollments))).toBe(true);
    expect(firestore.batch.commit).toHaveBeenCalledTimes(1);
  });

  it('does not merge same-name children when the family identity does not match', async () => {
    await expect(parentsService.createMissingStudent(
      { id: 'parent-1', displayName: 'Vanem', email: 'vanem@example.com', childName: 'Karl' },
      { name: 'Karl', teacherUid: 'teacher-1', teacher: 'Õpetaja' },
      [{ id: 'student-1', name: 'Karl', active: true, linkedParentId: 'parent-2', parentEmail: 'other@example.com' }],
      admin,
    )).resolves.toMatchObject({ id: 'generated', name: 'Karl' });
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
