/* global File */
import { beforeEach } from 'vitest';

const firestore = vi.hoisted(() => ({
  collection: vi.fn((_db, name) => name),
  doc: vi.fn((a, b, c) => (c ? { id: c, path: `${b}/${c}` } : { id: `${a}-new`, path: `${a}/new` })),
  getDoc: vi.fn(),
  batch: { set: vi.fn(), commit: vi.fn().mockResolvedValue(undefined) },
  writeBatch: vi.fn(),
}));
const storageApi = vi.hoisted(() => ({
  ref: vi.fn((_storage, path) => `storage-ref:${path}`),
  uploadBytesResumable: vi.fn(),
  getDownloadURL: vi.fn().mockResolvedValue('https://files.example/uploaded.jpg'),
}));

vi.mock('firebase/firestore', () => firestore);
vi.mock('firebase/storage', () => storageApi);
vi.mock('./client.js', () => ({ requireFirebaseClient: () => ({ db: 'firebase-db', storage: 'firebase-storage' }) }));

import { validateWorksheetDoc, worksheetDocsService } from './worksheetDocs.js';
import { sampleDocument } from '../../features/worksheet-studio/engine/sample.js';

const user = { uid: 'teacher-1', displayName: 'Õpetaja', roles: ['teacher'] };

describe('worksheetDocsService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    firestore.writeBatch.mockReturnValue(firestore.batch);
    storageApi.uploadBytesResumable.mockReturnValue({ on: vi.fn((_e, _p, _err, done) => done()) });
  });

  it('opens a stored v2 worksheet as is', async () => {
    const stored = sampleDocument();
    firestore.getDoc.mockResolvedValue({ exists: () => true, id: 'lesson-1', data: () => ({ title: 'Tund', worksheetDoc: stored }) });
    const res = await worksheetDocsService.load('lesson-1');
    expect(res.source).toBe('worksheetDoc');
    expect(res.document).toEqual(stored);
  });

  it('converts a legacy v1 worksheet without writing anything', async () => {
    firestore.getDoc.mockResolvedValue({ exists: () => true, id: 'lesson-2', data: () => ({ title: 'Vana', level: 'B1', worksheetData: { meta: { title: 'Vana' }, blocks: [{ type: 'fill', text: 'Ma [elan] siin.' }] } }) });
    const res = await worksheetDocsService.load('lesson-2');
    expect(res.source).toBe('converted');
    expect(res.document.blocks[0].type).toBe('gaps');
    expect(firestore.batch.set).not.toHaveBeenCalled();
  });

  it('starts an empty worksheet from lesson metadata when nothing exists yet', async () => {
    firestore.getDoc.mockResolvedValue({ exists: () => true, id: 'lesson-3', data: () => ({ title: 'Pere', level: 'A2', topic: 'Minu pere' }) });
    const res = await worksheetDocsService.load('lesson-3');
    expect(res.source).toBe('new');
    expect(res.document.meta).toMatchObject({ title: 'Pere', level: 'A2', module: 'Minu pere' });
  });

  it('saves onto the existing lesson with merge and keeps v1 worksheetData untouched', async () => {
    const res = await worksheetDocsService.save({ lessonId: 'lesson-1', document: sampleDocument(), user });
    expect(res).toMatchObject({ id: 'lesson-1', created: false });
    const [ref, payload, options] = firestore.batch.set.mock.calls[0];
    expect(ref.path).toBe('curriculumLessons/lesson-1');
    expect(options).toEqual({ merge: true });
    expect(payload).toHaveProperty('worksheetDoc');
    expect(payload).not.toHaveProperty('worksheetData');
    expect(firestore.batch.set.mock.calls[1][1]).toMatchObject({ type: 'worksheet_doc.updated', byUid: 'teacher-1' });
  });

  it('creates a new curriculum lesson for a new worksheet', async () => {
    const res = await worksheetDocsService.save({ document: sampleDocument(), user });
    expect(res.created).toBe(true);
    expect(firestore.batch.set.mock.calls[0][1]).toMatchObject({ title: 'Minu päev ja kellaaeg', type: 'material', level: 'A2', authorUid: 'teacher-1' });
  });

  it('rejects inline photos, unknown blocks and missing titles', () => {
    const d = sampleDocument();
    expect(() => validateWorksheetDoc({ ...d, blocks: [{ ...d.blocks[0], data: { ...d.blocks[0].data, img: { src: 'data:image/jpeg;base64,xx' } } }] })).toThrow(/üles laaditud/);
    expect(() => validateWorksheetDoc({ ...d, blocks: [{ id: 'x', type: 'nope', data: {} }] })).toThrow(/Tundmatu/);
    expect(() => validateWorksheetDoc({ ...d, meta: { ...d.meta, title: ' ' } })).toThrow(/pealkiri/);
  });

  it('uploads audio to the curriculum storage prefix', async () => {
    const file = new File(['x'], 'kuula mind.mp3', { type: 'audio/mpeg' });
    const res = await worksheetDocsService.uploadAudio(file);
    expect(storageApi.ref).toHaveBeenCalledWith('firebase-storage', expect.stringMatching(/^curriculum\/ws_audio_\d+_kuula-mind\.mp3$/));
    expect(res.src).toBe('https://files.example/uploaded.jpg');
    await expect(worksheetDocsService.uploadAudio(new File(['x'], 'a.pdf', { type: 'application/pdf' }))).rejects.toThrow(/helifail/);
  });
});
