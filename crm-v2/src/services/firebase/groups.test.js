import { beforeEach, describe, expect, it, vi } from 'vitest';

const firestore = vi.hoisted(() => ({
  collection: vi.fn((_db, name) => name),
  doc: vi.fn((...parts) => parts.length === 1 ? { id: 'generated-group', path: `${parts[0]}:generated-group` } : parts.join(':')),
  getDocs: vi.fn(),
  batch: { set: vi.fn(), delete: vi.fn(), commit: vi.fn().mockResolvedValue(undefined) },
  writeBatch: vi.fn(),
}));

vi.mock('firebase/firestore', () => firestore);
vi.mock('./client.js', () => ({ requireFirebaseClient: () => ({ db: 'firebase-db' }) }));

import { groupsService, normalizeGroup } from './groups.js';

const admin = { uid: 'admin-1', displayName: 'Admin', roles: ['admin'] };

describe('groupsService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    firestore.writeBatch.mockReturnValue(firestore.batch);
  });

  it('normalizes legacy members, lessons and student lesson assignments', () => {
    expect(normalizeGroup('group-1', {
      name: ' A1 õhturühm ',
      students: ['student-1', 'student-1', ''],
      lessons: [{ id: 'lesson-1', day: 'Tue', time: '17:30' }],
      studentLessonMap: { 'student-1': ['lesson-1', 'deleted-lesson'] },
    })).toMatchObject({
      id: 'group-1',
      name: 'A1 õhturühm',
      students: ['student-1'],
      lessons: [expect.objectContaining({ id: 'lesson-1', day: 'Tue', time: '17:30', recurring: true })],
      studentLessonMap: { 'student-1': ['lesson-1'] },
    });
  });

  it('keeps a teacher inside UID scope while supporting legacy teacher names', async () => {
    firestore.getDocs.mockResolvedValue({ docs: [
      { id: 'group-1', data: () => ({ name: 'UID grupp', teacherUid: 'teacher-1', teacher: 'Õpetaja' }) },
      { id: 'group-2', data: () => ({ name: 'Legacy grupp', teacher: 'Õpetaja' }) },
      { id: 'group-3', data: () => ({ name: 'Teine grupp', teacherUid: 'teacher-2', teacher: 'Teine' }) },
    ] });

    await expect(groupsService.list({ teacherUid: 'teacher-1', teacherName: 'Õpetaja' })).resolves.toEqual([
      expect.objectContaining({ id: 'group-2' }),
      expect.objectContaining({ id: 'group-1' }),
    ]);
  });

  it('creates a legacy-compatible group together with an audit event', async () => {
    await expect(groupsService.create({ name: 'A1 õhturühm', teacher: 'Õpetaja', teacherUid: 'teacher-1', subject: 'Eesti keel', level: 'A1' }, admin)).resolves.toMatchObject({
      id: 'generated-group', name: 'A1 õhturühm', students: [], lessons: [], active: true,
    });
    expect(firestore.batch.set).toHaveBeenCalledTimes(2);
    expect(firestore.batch.set.mock.calls[0][1]).toMatchObject({ teacher: 'Õpetaja', teacherUid: 'teacher-1', studentLessonMap: {} });
    expect(firestore.batch.set.mock.calls[1][1]).toMatchObject({ type: 'group.created', byUid: 'admin-1' });
    expect(firestore.batch.commit).toHaveBeenCalledOnce();
  });

  it('atomically updates both group membership and the student card', async () => {
    const group = { id: 'group-1', name: 'A1 õhturühm', students: [], lessons: [{ id: 'lesson-1' }], studentLessonMap: {} };
    await groupsService.setStudent(group, { id: 'student-1', name: 'Mari' }, true, admin);

    expect(firestore.batch.set).toHaveBeenCalledTimes(3);
    expect(firestore.batch.set.mock.calls[0]).toEqual([
      'firebase-db:groups:group-1',
      expect.objectContaining({ students: ['student-1'], studentLessonMap: { 'student-1': ['lesson-1'] } }),
      { merge: true },
    ]);
    expect(firestore.batch.set.mock.calls[1]).toEqual([
      'firebase-db:students:student-1',
      expect.objectContaining({ group: 'A1 õhturühm' }),
      { merge: true },
    ]);
    expect(firestore.batch.set.mock.calls[2][1]).toMatchObject({ type: 'group.student_added', meta: expect.objectContaining({ studentId: 'student-1' }) });
  });

  it('rejects group mutations outside the administrator role', async () => {
    await expect(groupsService.create({ name: 'Test' }, { uid: 'teacher-1', roles: ['teacher'] })).rejects.toThrow('administraator');
    expect(firestore.batch.commit).not.toHaveBeenCalled();
  });

  it('lets a teacher store occurrence attendance on the legacy group lesson', async () => {
    const group = { id: 'group-1', name: 'A1 õhturühm', lessons: [{ id: 'lesson-1', attendance: {} }] };
    const teacher = { uid: 'teacher-1', displayName: 'Õpetaja', roles: ['teacher'] };
    await expect(groupsService.setAttendance(group, 'lesson-1', '2026-08-04', 'student-1', 'coming', teacher)).resolves.toMatchObject({
      'student-1_2026-08-04': { status: 'coming', by: 'teacher-1' },
    });
    expect(firestore.batch.set.mock.calls[0][1]).toMatchObject({ lessons: [expect.objectContaining({ attendance: expect.objectContaining({ 'student-1_2026-08-04': expect.objectContaining({ status: 'coming' }) }) })] });
    expect(firestore.batch.set.mock.calls[1][1]).toMatchObject({ type: 'group.attendance_updated', meta: expect.objectContaining({ occurrenceDate: '2026-08-04', studentId: 'student-1' }) });
  });
});
