import { beforeEach } from 'vitest';

const firestore = vi.hoisted(() => ({
  collection: vi.fn((_db, name) => name),
  doc: vi.fn((name) => `${name}-new-document`),
  getDocs: vi.fn(),
  batch: { set: vi.fn(), commit: vi.fn().mockResolvedValue(undefined) },
  writeBatch: vi.fn(),
}));
const storageApi = vi.hoisted(() => ({
  ref: vi.fn((_storage, path) => `storage-ref:${path}`),
  uploadBytesResumable: vi.fn(),
  getDownloadURL: vi.fn().mockResolvedValue('https://files.example/uploaded.pdf'),
  deleteObject: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('firebase/firestore', () => firestore);
vi.mock('firebase/storage', () => storageApi);
vi.mock('./client.js', () => ({ requireFirebaseClient: () => ({ db: 'firebase-db', storage: 'firebase-storage' }) }));

import { libraryService } from './library.js';

describe('libraryService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    firestore.writeBatch.mockReturnValue(firestore.batch);
    storageApi.uploadBytesResumable.mockReturnValue({
      snapshot: { ref: 'uploaded-storage-ref' },
      on: vi.fn((_event, progress, _error, complete) => {
        progress({ bytesTransferred: 50, totalBytes: 100 });
        complete();
      }),
    });
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
        files: [{ name: 'Pere.pdf', url: 'https://files.example/Pere.pdf', size: 1200, type: 'application/pdf', storagePath: 'curriculum/Pere.pdf', _new: true }],
      },
      user,
    })).resolves.toMatchObject({ title: 'Pere tööleht', created: true });

    expect(firestore.batch.set).toHaveBeenCalledTimes(2);
    expect(firestore.batch.set.mock.calls[0][1]).toMatchObject({
      title: 'Pere tööleht',
      type: 'material',
      authorUid: 'teacher-1',
      files: [{ name: 'Pere.pdf', url: 'https://files.example/Pere.pdf', size: 1200, type: 'application/pdf', storagePath: 'curriculum/Pere.pdf' }],
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

  it('uploads a safe material file to the staff curriculum folder', async () => {
    const progress = vi.fn();
    const file = new globalThis.File(['pdf'], 'Pere tööleht.pdf', { type: 'application/pdf' });
    await expect(libraryService.uploadFile({ file, user: { uid: 'teacher-1' }, onProgress: progress })).resolves.toMatchObject({
      name: 'Pere tööleht.pdf',
      url: 'https://files.example/uploaded.pdf',
      type: 'application/pdf',
    });

    expect(storageApi.ref).toHaveBeenCalledWith('firebase-storage', expect.stringMatching(/^curriculum\/\d+_teacher-1_/));
    expect(storageApi.uploadBytesResumable).toHaveBeenCalledWith(expect.stringMatching(/^storage-ref:curriculum\//), file, { contentType: 'application/pdf' });
    expect(progress).toHaveBeenCalledWith(50);
  });

  it('rejects unsafe or oversized material files before uploading', async () => {
    await expect(libraryService.uploadFile({ file: new globalThis.File(['x'], 'script.exe', { type: 'application/x-msdownload' }), user: { uid: 'teacher-1' } })).rejects.toThrow('failivormingut');
    await expect(libraryService.uploadFile({ file: { name: 'huge.pdf', type: 'application/pdf', size: 20 * 1024 * 1024 }, user: { uid: 'teacher-1' } })).rejects.toThrow('liiga suur');
    expect(storageApi.uploadBytesResumable).not.toHaveBeenCalled();
  });

  it('only deletes temporary files from the curriculum storage folder', async () => {
    await libraryService.deleteUploadedFile({ storagePath: 'curriculum/temporary.pdf' });
    await libraryService.deleteUploadedFile({ storagePath: 'financial/payment-orders/private.pdf' });
    expect(storageApi.deleteObject).toHaveBeenCalledOnce();
    expect(storageApi.ref).toHaveBeenCalledWith('firebase-storage', 'curriculum/temporary.pdf');
  });
});
