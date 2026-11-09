import { beforeEach, describe, expect, it, vi } from 'vitest';

const calls = vi.hoisted(() => ({ add: [], update: [], remove: [], where: [] }));
vi.mock('./client.js', () => ({ requireFirebaseClient: () => ({ db: { name: 'db' } }) }));
vi.mock('firebase/firestore', () => ({
  collection: (_db, name) => ({ collection: name }),
  doc: (_db, name, id) => ({ path: `${name}/${id}` }),
  where: (field, op, value) => { calls.where.push([field, op, value]); return { field, value }; },
  query: (ref, ...filters) => ({ ref, filters }),
  addDoc: vi.fn(async (ref, data) => { calls.add.push([ref.collection, data]); return { id: 'new-id' }; }),
  updateDoc: vi.fn(async (ref, data) => { calls.update.push([ref.path, data]); }),
  deleteDoc: vi.fn(async (ref) => { calls.remove.push(ref.path); }),
  getDocs: vi.fn(async () => ({ docs: [
    { id: 'b', data: () => ({ invitationId: 'i', at: '2026-11-04T10:30:00Z', label: 'teine', atMs: 5 }) },
    { id: 'a', data: () => ({ invitationId: 'i', at: '2026-11-04T10:00:00Z', atMs: null }) },
  ] })),
}));

const { lessonMomentsService, normalizeMoment } = await import('./lessonMoments.js');

describe('lessonMomentsService', () => {
  beforeEach(() => { calls.add.length = 0; calls.update.length = 0; calls.remove.length = 0; calls.where.length = 0; });

  it('adds a moment to lessonMoments', async () => {
    const saved = await lessonMomentsService.add({ invitationId: 'i', label: '', at: 'x', atMs: 10 });
    expect(calls.add).toEqual([['lessonMoments', { invitationId: 'i', label: '', at: 'x', atMs: 10 }]]);
    expect(saved).toMatchObject({ id: 'new-id', invitationId: 'i', atMs: 10 });
  });

  it('changes only the label (cleaned)', async () => {
    await lessonMomentsService.setLabel('m1', '  hea   lause ');
    expect(calls.update).toEqual([['lessonMoments/m1', { label: 'hea lause' }]]);
    await expect(lessonMomentsService.setLabel('', 'x')).rejects.toThrow();
  });

  it('removes a moment', async () => {
    await lessonMomentsService.remove('m1');
    expect(calls.remove).toEqual(['lessonMoments/m1']);
  });

  it('lists a student\'s moments: a teacher only his own lessons, oldest first', async () => {
    const list = await lessonMomentsService.listForStudent({ studentId: 's1', user: { uid: 't1' } });
    expect(calls.where).toEqual([['studentId', '==', 's1'], ['teacherUid', '==', 't1']]);
    expect(list.map((m) => m.id)).toEqual(['a', 'b']);
    expect(list[0].atMs).toBeNull();
    calls.where.length = 0;
    await lessonMomentsService.listForStudent({ studentId: 's1', user: { uid: 'a1' }, isAdmin: true });
    expect(calls.where).toEqual([['studentId', '==', 's1']]);
  });

  it('fills missing fields', () => {
    expect(normalizeMoment('x', { createdAt: '2026-11-04T10:00:00Z' })).toMatchObject({ id: 'x', at: '2026-11-04T10:00:00Z', label: '', recordingId: '', atMs: null });
  });
});
