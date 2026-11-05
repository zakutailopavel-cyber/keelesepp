import { beforeEach, describe, expect, it, vi } from 'vitest';

const firestore = vi.hoisted(() => ({
  status: 'accepted',
  setDoc: vi.fn(async () => {}),
}));

vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  doc: vi.fn((_db, ...segments) => ({ path: segments.join('/') })),
  getDoc: vi.fn(async () => ({ exists: () => firestore.status !== null, data: () => ({ status: firestore.status }) })),
  onSnapshot: vi.fn(),
  serverTimestamp: vi.fn(() => 'SERVER_TIME'),
  setDoc: firestore.setDoc,
}));
vi.mock('./client.js', () => ({ requireFirebaseClient: () => ({ db: {} }) }));

const { liveLessonPresenceService } = await import('./liveLessonPresence.js');
const teacher = { uid: 't1', role: 'teacher', displayName: 'Kati' };

describe('leaving the room (markOffline)', () => {
  beforeEach(() => { firestore.setDoc.mockClear(); });

  it('an open lesson: the participant is marked offline', async () => {
    firestore.status = 'accepted';
    await expect(liveLessonPresenceService.markOffline('inv-1', teacher)).resolves.toBe(true);
    expect(firestore.setDoc).toHaveBeenCalledWith({ path: 'liveLessonInvitations/inv-1/presence/t1' }, expect.objectContaining({ online: false, role: 'teacher' }));
  });

  it('a lesson just closed (the rules would refuse): no write', async () => {
    for (const status of ['closed', 'cancelled', null]) {
      firestore.status = status;
      await expect(liveLessonPresenceService.markOffline('inv-1', teacher)).resolves.toBe(false);
    }
    expect(firestore.setDoc).not.toHaveBeenCalled();
  });
});
