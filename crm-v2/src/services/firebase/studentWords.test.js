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
