import { beforeEach, describe, expect, it, vi } from 'vitest';

const firestore = vi.hoisted(() => ({
  collection: vi.fn(), deleteDoc: vi.fn(), getDocs: vi.fn(), onSnapshot: vi.fn(), query: vi.fn(), setDoc: vi.fn(), updateDoc: vi.fn(), where: vi.fn(),
  doc: vi.fn((_db, name, id) => `${name}/${id}`),
  batch: { set: vi.fn(), commit: vi.fn().mockResolvedValue(undefined) },
  writeBatch: vi.fn(),
}));
vi.mock('firebase/firestore', () => firestore);
vi.mock('./client.js', () => ({ requireFirebaseClient: () => ({ db: 'db' }) }));

import { studentWordsService } from './studentWords.js';

describe('studentWordsService.addLessonWords', () => {
  beforeEach(() => { vi.clearAllMocks(); firestore.writeBatch.mockReturnValue(firestore.batch); });

  it('creates the words under their fixed ids with box 0 and only the allowed keys', async () => {
    const records = await studentWordsService.addLessonWords({
      studentId: 's1', user: { uid: 'u1', displayName: 'Mari' },
      items: [{ id: 'lw_s1_a2-001_0', word: 'nimi', translation: 'имя', example: 'Minu nimi on Anna.' }],
    });
    expect(firestore.batch.set).toHaveBeenCalledTimes(1);
    const [ref, data] = firestore.batch.set.mock.calls[0];
    expect(ref).toBe('studentWords/lw_s1_a2-001_0');
    expect(data).toMatchObject({ studentId: 's1', invitationId: '', word: 'nimi', box: 0, createdByUid: 'u1' });
    expect(Object.keys(data).every((key) => ['studentId', 'invitationId', 'word', 'translation', 'example', 'forms', 'formItems',
      'createdByUid', 'createdByName', 'createdAt', 'updatedAt', 'box', 'dueAt'].includes(key))).toBe(true);
    expect(firestore.batch.commit).toHaveBeenCalledTimes(1);
    expect(records[0].id).toBe('lw_s1_a2-001_0');
  });

  it('splits a large topic into several batches', async () => {
    const items = Array.from({ length: 450 }, (_, i) => ({ id: `lw_s1_a2-001_${i}`, word: `sõna${i}`, translation: 'x' }));
    await studentWordsService.addLessonWords({ studentId: 's1', user: { uid: 'u1' }, items });
    expect(firestore.batch.commit).toHaveBeenCalledTimes(2);
  });
});

describe('studentWordsService.rate / review (spaced repetition, 2026-11-09)', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('writes only srs and the old summary fields, migrating a Leitner word lazily', async () => {
    const word = { id: 'w1', word: 'kass', translation: 'кошка', box: 2, reviews: 3, dueAt: '2026-11-08T00:00:00Z', reviewedAt: '2026-11-05T00:00:00Z' };
    const patch = await studentWordsService.rate(word, { direction: 'r', rating: 'good', now: new Date('2026-11-09T10:00:00Z') });
    expect(firestore.updateDoc).toHaveBeenCalledWith('studentWords/w1', patch);
    expect(Object.keys(patch).sort()).toEqual(['box', 'dueAt', 'reviewedAt', 'reviews', 'srs']);
    expect(patch.srs).toMatchObject({ v: 1, r: { state: 'review' } });
    expect(patch.reviews).toBe(4);
  });

  it('a plain knew / did not know answer is „Hea” / „Uuesti” on the given direction', async () => {
    const patch = await studentWordsService.review({ id: 'w2', word: 'koer', box: 0, reviews: 0 }, false, 'p');
    expect(patch.srs.p).toMatchObject({ state: 'learning', step: 0 });
    expect(patch.box).toBe(0);
  });

  it('with rules that do not know `srs` yet it still saves the summary fields', async () => {
    firestore.updateDoc.mockRejectedValueOnce(Object.assign(new Error('denied'), { code: 'permission-denied' }));
    const patch = await studentWordsService.rate({ id: 'w3', word: 'maja', box: 1, reviews: 1 }, { rating: 'good' });
    expect(firestore.updateDoc).toHaveBeenCalledTimes(2);
    expect(patch).not.toHaveProperty('srs');
    expect(Object.keys(firestore.updateDoc.mock.calls[1][1]).sort()).toEqual(['box', 'dueAt', 'reviewedAt', 'reviews']);
    firestore.updateDoc.mockRejectedValueOnce(Object.assign(new Error('offline'), { code: 'unavailable' }));
    await expect(studentWordsService.rate({ id: 'w4', word: 'auto' }, { rating: 'good' })).rejects.toThrow('offline');
  });
});
