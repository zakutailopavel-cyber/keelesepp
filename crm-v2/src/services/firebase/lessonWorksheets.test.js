import { beforeEach, describe, expect, it, vi } from 'vitest';

const firestore = vi.hoisted(() => ({
  collection: vi.fn((...parts) => ({ path: parts.slice(1).join('/') })),
  doc: vi.fn((...parts) => ({ id: parts.at(-1), path: parts.slice(1).join('/') })),
  getDoc: vi.fn(),
  getDocs: vi.fn(),
  query: vi.fn((ref) => ref),
  where: vi.fn(),
  runTransaction: vi.fn(),
}));

vi.mock('firebase/firestore', () => firestore);
vi.mock('./client.js', () => ({ requireFirebaseClient: () => ({ db: 'db' }) }));

import { LessonWorksheetConflictError, lessonWorksheetsService } from './lessonWorksheets.js';
import { sampleDocument } from '../../features/worksheet-studio/engine/sample.js';

const user = { uid: 'teacher-1', displayName: 'Õpetaja' };
const lessonSnapshot = { exists: () => true, data: () => ({ title: 'Tund' }) };
const missingSnapshot = { exists: () => false };

function transactionWith(current = null) {
  const set = vi.fn();
  firestore.runTransaction.mockImplementation(async (_db, callback) => callback({
    get: vi.fn(async (ref) => ref.path === 'curriculumLessons/lesson-1' ? lessonSnapshot : current ? { exists: () => true, data: () => current } : missingSnapshot),
    set,
  }));
  return set;
}

describe('lessonWorksheetsService', () => {
  beforeEach(() => vi.clearAllMocks());

  it.each([
    ['discover', 1],
    ['practice', 2],
    ['transfer', 3],
  ])('creates the %s core draft without writing the legacy lesson root', async (worksheetId, slot) => {
    const set = transactionWith();
    const result = await lessonWorksheetsService.saveDraft({ lessonId: 'lesson-1', worksheetId, role: worksheetId, slot, displayLabel: worksheetId, worksheetDoc: sampleDocument(), user });
    expect(result).toMatchObject({ lessonId: 'lesson-1', worksheetId, role: worksheetId, slot, worksheetDocStatus: 'draft', worksheetDocVersion: 1, created: true });
    expect(set.mock.calls[0][0].path).toBe(`curriculumLessons/lesson-1/worksheets/${worksheetId}`);
    expect(set.mock.calls.some(([ref]) => ref.path === 'curriculumLessons/lesson-1')).toBe(false);
    expect(set.mock.calls[1][0].path).toBe(`worksheetVersions/lesson-1_${worksheetId}_studio_v1`);
  });

  it('increments a matching draft and snapshots generation metadata in its immutable version', async () => {
    const current = { worksheetDocUpdatedAt: 'base', worksheetDocVersion: 2, createdAt: 'created', createdBy: 'teacher-1', generation: { generatorVersion: '1.0.0', seed: 'fixed' } };
    const set = transactionWith(current);
    const result = await lessonWorksheetsService.saveDraft({ lessonId: 'lesson-1', worksheetId: 'practice', role: 'practice', slot: 2, worksheetDoc: sampleDocument(), user, baseUpdatedAt: 'base' });
    expect(result).toMatchObject({ worksheetDocVersion: 3, createdAt: 'created', generation: current.generation });
    expect(set.mock.calls[1][1]).toMatchObject({ worksheetId: 'practice', version: 3, status: 'draft', generation: current.generation });
  });

  it('rejects a stale update inside the transaction', async () => {
    const set = transactionWith({ worksheetDocUpdatedAt: 'newer', worksheetDocVersion: 2 });
    await expect(lessonWorksheetsService.saveDraft({ lessonId: 'lesson-1', worksheetId: 'practice', worksheetDoc: sampleDocument(), user, baseUpdatedAt: 'older' })).rejects.toBeInstanceOf(LessonWorksheetConflictError);
    expect(set).not.toHaveBeenCalled();
  });

  it('publishes a snapshot and a later draft keeps it unchanged', async () => {
    const publishedSet = transactionWith({ worksheetDocUpdatedAt: 'draft-at', worksheetDocVersion: 1 });
    const published = await lessonWorksheetsService.publish({ lessonId: 'lesson-1', worksheetId: 'practice', worksheetDoc: sampleDocument(), user, baseUpdatedAt: 'draft-at' });
    expect(published).toMatchObject({ worksheetDocStatus: 'published', publishedWorksheetDocVersion: 2 });
    const publishedRecord = publishedSet.mock.calls[0][1];

    transactionWith(publishedRecord);
    const edited = sampleDocument();
    edited.meta.title = 'Uus mustand';
    const draft = await lessonWorksheetsService.saveDraft({ lessonId: 'lesson-1', worksheetId: 'practice', worksheetDoc: edited, user, baseUpdatedAt: publishedRecord.worksheetDocUpdatedAt });
    expect(draft).toMatchObject({ worksheetDocStatus: 'draft', worksheetDocVersion: 3, publishedWorksheetDocVersion: 2 });
    expect(draft.publishedWorksheetDoc.meta.title).toBe(publishedRecord.publishedWorksheetDoc.meta.title);
  });

  it('loads and lists child worksheets without reading legacy worksheetDoc', async () => {
    firestore.getDoc.mockResolvedValue({ exists: () => true, id: 'practice', data: () => ({ schema: 'keelesepp.lesson-worksheet/1', title: 'Harjuta' }) });
    await expect(lessonWorksheetsService.load('lesson-1', 'practice')).resolves.toMatchObject({ id: 'practice', title: 'Harjuta' });
    firestore.getDocs.mockResolvedValue({ docs: [
      { id: 'transfer', data: () => ({ schema: 'keelesepp.lesson-worksheet/1', slot: 3, title: 'Kasuta' }) },
      { id: 'discover', data: () => ({ schema: 'keelesepp.lesson-worksheet/1', slot: 1, title: 'Avasta' }) },
    ] });
    await expect(lessonWorksheetsService.list('lesson-1')).resolves.toEqual(expect.arrayContaining([expect.objectContaining({ id: 'discover' }), expect.objectContaining({ id: 'transfer' })]));
  });

  it('lists only versions for the requested child sheet', async () => {
    firestore.getDocs.mockResolvedValue({ docs: [
      { id: 'v1', data: () => ({ lessonId: 'lesson-1', worksheetId: 'practice', version: 1 }) },
      { id: 'v3', data: () => ({ lessonId: 'lesson-1', worksheetId: 'practice', version: 3 }) },
      { id: 'other', data: () => ({ lessonId: 'lesson-1', worksheetId: 'discover', version: 2 }) },
    ] });
    await expect(lessonWorksheetsService.listVersions('lesson-1', 'practice')).resolves.toEqual([
      expect.objectContaining({ id: 'v3', version: 3 }),
      expect.objectContaining({ id: 'v1', version: 1 }),
    ]);
  });
});
