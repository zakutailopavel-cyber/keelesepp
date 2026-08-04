import { beforeEach, vi } from 'vitest';

const { addDoc, getDocs, where } = vi.hoisted(() => ({
  addDoc: vi.fn(),
  getDocs: vi.fn(),
  where: vi.fn((...args) => ({ where: args })),
}));

vi.mock('firebase/firestore', () => ({
  addDoc,
  collection: vi.fn((db, name) => ({ db, name })),
  doc: vi.fn(),
  getDoc: vi.fn(),
  getDocs,
  limit: vi.fn((value) => ({ limit: value })),
  orderBy: vi.fn(),
  query: vi.fn(),
  startAfter: vi.fn(),
  updateDoc: vi.fn(),
  where,
}));

vi.mock('./client.js', () => ({
  requireFirebaseClient: () => ({ db: {} }),
}));

import { studentsService } from './students.js';

function studentDoc(id, teacher) {
  return { id, data: () => ({ name: id, teacher, active: true }) };
}

describe('students service pagination', () => {
  beforeEach(() => {
    addDoc.mockReset();
    getDocs.mockReset();
    where.mockClear();
  });

  it('stops on the exact filtered page boundary and preserves the next cursor', async () => {
    const firstMatch = studentDoc('first-match', 'Pavel');
    const nextMatch = studentDoc('next-match', 'Pavel');
    const deferredMatch = studentDoc('deferred-match', 'Pavel');
    getDocs
      .mockResolvedValueOnce({
        size: 2,
        docs: [studentDoc('not-a-match', 'Jelena'), firstMatch],
      })
      .mockResolvedValueOnce({
        size: 2,
        docs: [nextMatch, deferredMatch],
      });

    const result = await studentsService.list({
      scopeTeacher: 'Pavel Zakutailo',
      scopeTeacherUid: 'teacher-pavel',
      pageSize: 2,
    });

    expect(result.items.map((student) => student.id)).toEqual(['first-match', 'next-match']);
    expect(result.cursor).toBe(nextMatch);
    expect(result.hasMore).toBe(true);
    expect(where).toHaveBeenCalledWith('teacherUid', '==', 'teacher-pavel');
  });

  it('persists the stable teacher UID resolved from the staff directory', async () => {
    getDocs
      .mockResolvedValueOnce({
        size: 1,
        docs: [{ id: 'teacher-pavel', data: () => ({ role: 'admin', displayName: 'Pavel Zakutailo' }) }],
      })
      .mockResolvedValueOnce({ size: 0, docs: [] });
    addDoc.mockResolvedValue({ id: 'student-new' });

    const created = await studentsService.create({ name: 'Uus Õpilane', teacher: 'Pavel' });

    expect(addDoc).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ teacher: 'Pavel Zakutailo', teacherUid: 'teacher-pavel' }),
    );
    expect(created).toMatchObject({ id: 'student-new', teacherUid: 'teacher-pavel' });
  });

  it('rejects an ambiguous teacher directory instead of creating an unscoped student', async () => {
    getDocs
      .mockResolvedValueOnce({
        size: 2,
        docs: [
          { id: 'teacher-a', data: () => ({ role: 'teacher', displayName: 'Pavel' }) },
          { id: 'teacher-b', data: () => ({ role: 'teacher', displayName: 'Pavel Zakutailo' }) },
        ],
      });

    await expect(studentsService.create({ name: 'Uus Õpilane', teacher: 'Pavel' }))
      .rejects.toMatchObject({ code: 'students/teacher-not-resolved' });
    expect(addDoc).not.toHaveBeenCalled();
  });

  it('loads a student cabinet only from explicit self ownership fields', async () => {
    getDocs
      .mockResolvedValueOnce({ docs: [
        { id: 'student-self', data: () => ({ name: 'Mari', linkedUserId: 'user-1', active: true }) },
        { id: 'archived', data: () => ({ name: 'Vana', linkedUserId: 'user-1', active: false }) },
      ] })
      .mockResolvedValueOnce({ docs: [
        { id: 'student-self', data: () => ({ name: 'Mari', studentUid: 'user-1', active: true }) },
      ] });

    await expect(studentsService.listSelf('user-1')).resolves.toEqual([
      expect.objectContaining({ id: 'student-self', name: 'Mari' }),
    ]);
    expect(where).toHaveBeenCalledWith('linkedUserId', '==', 'user-1');
    expect(where).toHaveBeenCalledWith('studentUid', '==', 'user-1');
    expect(where).not.toHaveBeenCalledWith('linkedParentId', '==', 'user-1');
  });
});
