import { beforeEach } from 'vitest';

const firestore = vi.hoisted(() => ({
  collection: vi.fn((_db, name) => name),
  doc: vi.fn((name) => `${name}-new-document`),
  getDocs: vi.fn(),
  batch: { set: vi.fn(), commit: vi.fn().mockResolvedValue(undefined) },
  writeBatch: vi.fn(),
}));

vi.mock('firebase/firestore', () => firestore);
vi.mock('./client.js', () => ({ requireFirebaseClient: () => ({ db: 'firebase-db' }) }));

import { libraryService } from './library.js';

describe('libraryService', () => {
  beforeEach(() => {
    firestore.batch.set.mockClear();
    firestore.batch.commit.mockClear();
    firestore.writeBatch.mockReturnValue(firestore.batch);
  });

  it('loads the existing curriculum and exercise collections without changing their records', async () => {
    firestore.getDocs.mockImplementation(async (name) => ({
      docs: name === 'curriculumLessons'
        ? [{ id: 'lesson-1', data: () => ({ title: 'Tunnikava' }) }]
        : [{ id: 'exercise-1', data: () => ({ title: 'Harjutus' }) }],
    }));

    await expect(libraryService.list()).resolves.toEqual({
      curriculumLessons: [{ id: 'lesson-1', title: 'Tunnikava' }],
      exercises: [{ id: 'exercise-1', title: 'Harjutus' }],
    });
    expect(firestore.collection).toHaveBeenCalledWith('firebase-db', 'curriculumLessons');
    expect(firestore.collection).toHaveBeenCalledWith('firebase-db', 'exercises');
  });

  it('assigns a worksheet with the legacy payload and one activity event', async () => {
    const item = {
      kind: 'curriculum',
      type: 'worksheet',
      sourceId: 'worksheet-1',
      title: 'Pere tööleht',
      subject: 'Eesti keel',
      level: 'A1',
      topic: 'Pere',
      source: { worksheetData: { blocks: [{ type: 'fill' }] } },
    };
    const user = { uid: 'teacher-1', displayName: 'Õpetaja', roles: ['teacher'] };

    await expect(libraryService.assign({
      item,
      students: [{ id: 'student-1', name: 'Mari' }, { id: 'student-2', name: 'Jaan' }],
      dueDate: '2026-08-10',
      note: 'Tee lõpuni',
      user,
    })).resolves.toEqual({ count: 2, mode: 'worksheet' });

    expect(firestore.batch.set).toHaveBeenCalledTimes(3);
    expect(firestore.batch.set.mock.calls[0][1]).toMatchObject({
      lessonId: 'worksheet-1',
      studentId: 'student-1',
      dueDate: '2026-08-10',
      source: 'learning_library',
    });
    expect(firestore.batch.set.mock.calls[2][1]).toMatchObject({
      type: 'learning_material.assigned',
      byUid: 'teacher-1',
      meta: { studentIds: ['student-1', 'student-2'] },
    });
    expect(firestore.batch.commit).toHaveBeenCalledOnce();
  });

  it('creates a legacy-compatible worksheet and an audit event', async () => {
    const user = { uid: 'teacher-1', displayName: 'Õpetaja', roles: ['teacher'] };
    await expect(libraryService.saveMaterial({
      values: {
        title: 'Pere tööleht',
        materialType: 'worksheet',
        subject: 'Eesti keel',
        level: 'A1',
        topic: 'Pere',
        description: 'Lünkharjutus',
        blocks: [{ id: 'block-1', type: 'fill', text: 'Minu [ema].' }],
      },
      user,
    })).resolves.toMatchObject({ title: 'Pere tööleht', created: true });

    expect(firestore.batch.set).toHaveBeenCalledTimes(2);
    expect(firestore.batch.set.mock.calls[0][1]).toMatchObject({
      title: 'Pere tööleht',
      type: 'material',
      authorUid: 'teacher-1',
      worksheetData: { meta: { title: 'Pere tööleht', subject: 'Eesti keel', level: 'A1', topic: 'Pere' }, blocks: [{ id: 'block-1', type: 'fill', text: 'Minu [ema].' }] },
    });
    expect(firestore.batch.set.mock.calls[1][1]).toMatchObject({ type: 'learning_material.created', byUid: 'teacher-1' });
  });

  it('updates an existing material with merge semantics', async () => {
    const item = { sourceId: 'lesson-1', type: 'lesson', source: { type: 'lesson' } };
    await libraryService.saveMaterial({
      item,
      values: { title: 'Muudetud tund', materialType: 'lesson', subject: 'Eesti keel', description: 'Uus kirjeldus' },
      user: { uid: 'admin-1', email: 'admin@example.com', roles: ['admin'] },
    });

    expect(firestore.doc).toHaveBeenCalledWith('firebase-db', 'curriculumLessons', 'lesson-1');
    expect(firestore.batch.set.mock.calls[0][1]).toMatchObject({ title: 'Muudetud tund', type: 'lesson', description: 'Uus kirjeldus' });
    expect(firestore.batch.set.mock.calls[0][2]).toEqual({ merge: true });
    expect(firestore.batch.set.mock.calls[1][1]).toMatchObject({ type: 'learning_material.updated' });
  });
});
