import { beforeEach, describe, expect, it, vi } from 'vitest';

const calls = vi.hoisted(() => ({ set: [], remove: [], where: [], upload: [] }));
vi.mock('./client.js', () => ({ requireFirebaseClient: () => ({ db: { name: 'db' }, storage: { name: 'storage' } }) }));
vi.mock('firebase/firestore', () => ({
  collection: (_db, name) => ({ collection: name }),
  doc: (_db, name, id) => ({ path: `${name}/${id}` }),
  where: (field, op, value) => { calls.where.push([field, op, value]); return { field, value }; },
  query: (ref, ...filters) => ({ ref, filters }),
  setDoc: vi.fn(async (ref, data, options) => { calls.set.push([ref.path, data, options]); }),
  deleteDoc: vi.fn(async (ref) => { calls.remove.push(ref.path); }),
  getDocs: vi.fn(async (q) => ({ docs: q.ref.collection === 'studentMonologues'
    ? [
      { id: 'c1_2026-09', data: () => ({ studentId: 'c1', month: '2026-09', seconds: 80, audioPath: 'a' }) },
      { id: 'c1_2026-11', data: () => ({ studentId: 'c1', month: '2026-11', seconds: 118, audioPath: 'b', wordCount: 150 }) },
      { id: 'c1_2026-10', data: () => ({ studentId: 'c1', month: '2026-10', seconds: 120, audioPath: 'c', updatedAt: 't1', transcript: 'Mina olen Mari.', words: 3, wpm: 2, transcribedTake: 't1' }) },
      { id: 'c1_2026-08', data: () => ({ studentId: 'c1', month: '2026-08', seconds: 120, audioPath: 'd', updatedAt: 't2', transcript: 'Vana tekst.', words: 2, wpm: 1, transcribedTake: 't1' }) },
    ]
    : q.ref.collection === 'studentMonologueAnalysis'
      ? [{ id: 'c1_2026-10', data: () => ({ studentId: 'c1', take: 't1', checked: 4, errors: [{ said: 'ma läksin pood', corrected: 'ma läksin poodi', kind: 'vorm' }, { said: '' }], focus: [{ key: 'form', topic: 'Формы слов: падеж', count: 1 }] }) }]
      : [{ id: 'c1_2026-11', data: () => ({ studentId: 'c1', text: 'Hea', byName: 'Kati' }) }] })),
}));
vi.mock('firebase/storage', () => ({
  ref: (_storage, path) => ({ path }),
  getDownloadURL: vi.fn(async (r) => `https://files/${r.path}`),
  uploadBytesResumable: (r, blob, meta) => {
    calls.upload.push([r.path, meta.contentType]);
    return { on: (_event, _progress, _reject, resolve) => resolve() };
  },
}));

const { studentMonologuesService } = await import('./studentMonologues.js');
const blob = (type = 'audio/webm', size = 3) => ({ type, size });
const student = { id: 'c1', subject: 'Eesti keel', level: 'B1' };

describe('studentMonologuesService', () => {
  beforeEach(() => { Object.values(calls).forEach((list) => { list.length = 0; }); });

  it('lists one card, newest month first, with word counts when present', async () => {
    const items = await studentMonologuesService.listByStudent('c1');
    expect(calls.where).toEqual([['studentId', '==', 'c1']]);
    expect(items.map((item) => item.month)).toEqual(['2026-11', '2026-10', '2026-09', '2026-08']);
    expect(items[0].wordCount).toBe(150);
    expect(items[2]).not.toHaveProperty('wordCount');
  });

  it('reads the transcriber\'s text, words and wpm, but not a text made for an earlier take', async () => {
    const items = await studentMonologuesService.listByStudent('c1');
    expect(items[1]).toMatchObject({ transcriptText: 'Mina olen Mari.', wordCount: 3, wpm: 2 });
    expect(items[3]).not.toHaveProperty('transcriptText');
    expect(items[3]).not.toHaveProperty('wordCount');
    expect(items[3]).not.toHaveProperty('wpm');
  });

  it('lists the staff-only error checks of a card', async () => {
    const analyses = await studentMonologuesService.listAnalysis('c1');
    expect(calls.where).toEqual([['studentId', '==', 'c1']]);
    expect(analyses['c1_2026-10']).toEqual({ id: 'c1_2026-10', take: 't1', checked: 4, analyzedAt: '',
      errors: [{ said: 'ma läksin pood', corrected: 'ma läksin poodi', kind: 'vorm' }], focus: [{ key: 'form', topic: 'Формы слов: падеж', count: 1 }] });
    expect(await studentMonologuesService.listAnalysis('')).toEqual({});
  });

  it('uploads the month file and writes the record with the rules’ fields', async () => {
    const saved = await studentMonologuesService.submit({ student, uid: 'u1', month: '2026-11', level: 'B1', blob: blob('audio/webm;codecs=opus'), seconds: 117 });
    expect(calls.upload).toEqual([['homework/c1/monologues/2026-11.webm', 'audio/webm']]);
    const [path, data, options] = calls.set[0];
    expect(path).toBe('studentMonologues/c1_2026-11');
    expect(Object.keys(data).sort()).toEqual(['audioPath', 'contentType', 'createdAt', 'level', 'month', 'promptId', 'seconds', 'studentId', 'studentUid', 'updatedAt']);
    expect(data).toMatchObject({ studentUid: 'u1', seconds: 117, promptId: 'et-self-v1' });
    expect(options).toBeUndefined();
    expect(saved.id).toBe('c1_2026-11');
  });

  it('a second take changes only the take', async () => {
    await studentMonologuesService.submit({ student, uid: 'u1', month: '2026-11', level: 'B1', blob: blob('audio/mp4'), seconds: 90, existing: { id: 'c1_2026-11', createdAt: 'old' } });
    const [, data, options] = calls.set[0];
    expect(Object.keys(data).sort()).toEqual(['audioPath', 'contentType', 'level', 'promptId', 'seconds', 'updatedAt']);
    expect(data.audioPath).toBe('homework/c1/monologues/2026-11.m4a');
    expect(options).toEqual({ merge: true });
  });

  it('refuses what is not a sound or is empty', async () => {
    await expect(studentMonologuesService.submit({ student, uid: 'u1', month: '2026-11', level: 'B1', blob: blob('image/png'), seconds: 3 })).rejects.toThrow('helifail');
    await expect(studentMonologuesService.submit({ student, uid: 'u1', month: '2026-11', level: 'B1', blob: blob('audio/webm', 0), seconds: 3 })).rejects.toThrow('tühjaks');
    await expect(studentMonologuesService.submit({ student, uid: 'u1', month: 'nov', level: 'B1', blob: blob(), seconds: 3 })).rejects.toThrow();
    expect(calls.upload).toEqual([]);
  });

  it('the teacher note: saved apart, empty removes it', async () => {
    const notes = await studentMonologuesService.listNotes('c1');
    expect(notes['c1_2026-11'].text).toBe('Hea');
    await studentMonologuesService.saveNote({ monologue: { id: 'c1_2026-11', studentId: 'c1' }, text: '  Räägib vabamalt. ', user: { uid: 't1', displayName: 'Kati' } });
    expect(calls.set[0][0]).toBe('studentMonologueNotes/c1_2026-11');
    expect(calls.set[0][1]).toMatchObject({ studentId: 'c1', monologueId: 'c1_2026-11', text: 'Räägib vabamalt.', byUid: 't1', byName: 'Kati' });
    expect(await studentMonologuesService.saveNote({ monologue: { id: 'c1_2026-11', studentId: 'c1' }, text: '  ', user: { uid: 't1' } })).toBeNull();
    expect(calls.remove).toEqual(['studentMonologueNotes/c1_2026-11']);
  });

  it('gives a playable address for a path', async () => {
    expect(await studentMonologuesService.audioUrl('homework/c1/monologues/2026-11.webm')).toBe('https://files/homework/c1/monologues/2026-11.webm');
  });
});
