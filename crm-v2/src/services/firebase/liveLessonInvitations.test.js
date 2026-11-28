import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const store = vi.hoisted(() => ({
  commit: vi.fn(async () => {}),
  set: vi.fn(),
  updateDoc: vi.fn(async () => {}),
  transactionUpdate: vi.fn(),
  current: { teacherUid: 't1', studentUid: 's-uid', status: 'pending', expiresAt: '2999-01-01T00:00:00.000Z' },
  existing: null,
}));

vi.mock('firebase/firestore', () => ({
  collection: vi.fn((_db, ...segments) => ({ path: segments.join('/') })),
  doc: vi.fn((first, ...segments) => (segments.length ? { id: segments[segments.length - 1], path: segments.join('/') } : { id: 'new-id', path: `${first.path}/new-id` })),
  getDoc: vi.fn(async () => ({ id: 'new-id', exists: () => Boolean(store.existing), data: () => store.existing })),
  onSnapshot: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  runTransaction: vi.fn(async (_db, run) => run({
    get: async () => ({ id: 'inv-1', exists: () => true, data: () => store.current }),
    update: store.transactionUpdate,
  })),
  serverTimestamp: vi.fn(() => 'SERVER_TIME'),
  Timestamp: { fromMillis: (ms) => ({ toMillis: () => ms }) },
  updateDoc: store.updateDoc,
  writeBatch: vi.fn(() => ({ set: store.set, commit: store.commit })),
}));
vi.mock('./client.js', () => ({ requireFirebaseClient: () => ({ db: {}, auth: { currentUser: { getIdToken: async () => 'id-token' } } }) }));

const { liveLessonInvitationsService: service } = await import('./liveLessonInvitations.js');
const teacher = { uid: 't1', roles: ['teacher'], displayName: 'Kati Kask' };
const student = { id: 'card-1', name: 'Mari Mets', studentUid: 's-uid', subject: 'Eesti keel' };
const answer = (status, body) => ({ ok: status < 300, status, json: async () => body });

describe('invitations go through the server, the direct write is the fallback', () => {
  beforeEach(() => {
    Object.values(store).forEach((item) => item?.mockClear?.());
    store.current = { teacherUid: 't1', studentUid: 's-uid', status: 'pending', expiresAt: '2999-01-01T00:00:00.000Z' };
    store.existing = null;
  });
  afterEach(() => vi.unstubAllGlobals());

  it('create: the server writes it; the browser writes nothing', async () => {
    const fetch = vi.fn().mockResolvedValue(answer(200, { id: 'new-id', invitation: { teacherUid: 't1', studentUid: 's-uid', studentId: 'card-1', status: 'pending', roomKey: 'new-id', expiresAt: '2999-01-01T00:00:00.000Z' } }));
    vi.stubGlobal('fetch', fetch);
    const invitation = await service.create({ student, title: 'Eesti keel', lesson: { scheduleId: 'sch-1', occurrenceDate: '2026-11-30' } }, teacher);
    expect(fetch).toHaveBeenCalledWith(expect.stringMatching(/\/liveInvitationApi\/create$/), expect.objectContaining({ method: 'POST' }));
    expect(fetch.mock.calls[0][1].headers.Authorization).toBe('Bearer id-token');
    expect(JSON.parse(fetch.mock.calls[0][1].body)).toEqual({ id: 'new-id', studentId: 'card-1', studentUid: 's-uid', studentName: 'Mari Mets', teacherName: 'Kati Kask', title: 'Eesti keel', roomKey: '', scheduleId: 'sch-1', occurrenceDate: '2026-11-30' });
    expect(invitation).toMatchObject({ id: 'new-id', status: 'pending', roomKey: 'new-id', expired: false });
    expect(store.commit).not.toHaveBeenCalled();
  });

  it('create: an unreachable function (network, 5xx, not deployed) → the direct write as before', async () => {
    for (const fetch of [vi.fn().mockRejectedValue(new Error('offline')), vi.fn().mockResolvedValue(answer(503, { error: 'Internal error' })), vi.fn().mockResolvedValue({ ok: false, status: 404, json: async () => { throw new Error('html'); } })]) {
      store.commit.mockClear();
      vi.stubGlobal('fetch', fetch);
      const invitation = await service.create({ student, title: 'Eesti keel' }, teacher);
      expect(store.commit).toHaveBeenCalledTimes(1);
      expect(invitation).toMatchObject({ id: 'new-id', teacherUid: 't1', studentUid: 's-uid', status: 'pending' });
    }
  });

  it('create: the server\'s refusal is shown and nothing is written directly', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(answer(403, { error: 'See õpilane ei ole sinu õpilaste hulgas.' })));
    await expect(service.create({ student, title: 'Eesti keel' }, teacher)).rejects.toThrow('See õpilane ei ole sinu õpilaste hulgas.');
    expect(store.commit).not.toHaveBeenCalled();
  });

  it('create: the server wrote it but the answer was lost → the fallback finds the same document', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('timeout')));
    store.commit.mockRejectedValueOnce(new Error('permission-denied'));
    store.existing = { teacherUid: 't1', studentUid: 's-uid', studentId: 'card-1', status: 'pending', expiresAt: '2999-01-01T00:00:00.000Z' };
    await expect(service.create({ student, title: 'Eesti keel' }, teacher)).resolves.toMatchObject({ id: 'new-id', status: 'pending' });
  });

  it('respond, cancel, close, accept for a test student: one server call each', async () => {
    const fetch = vi.fn().mockResolvedValue(answer(200, { id: 'inv-1', status: 'ok' }));
    vi.stubGlobal('fetch', fetch);
    await service.respond('inv-1', 'accepted', { uid: 's-uid' });
    await service.cancel('inv-1', teacher);
    await service.close('inv-1', teacher, { endMark: 'held' });
    await service.acceptForTestStudent('inv-1');
    expect(fetch.mock.calls.map(([url, init]) => [url.replace(/^.*liveInvitationApi/, ''), JSON.parse(init.body)])).toEqual([
      ['/respond', { invitationId: 'inv-1', decision: 'accepted' }],
      ['/cancel', { invitationId: 'inv-1' }],
      ['/close', { invitationId: 'inv-1', endMark: 'held' }],
      ['/accept-test', { invitationId: 'inv-1' }],
    ]);
    expect(store.transactionUpdate).not.toHaveBeenCalled();
    expect(store.updateDoc).not.toHaveBeenCalled();
  });

  it('respond: falls back to the transaction; a status the server already set is not an error', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')));
    await service.respond('inv-1', 'accepted', { uid: 's-uid' });
    expect(store.transactionUpdate).toHaveBeenCalledWith(expect.anything(), { status: 'accepted', respondedAt: 'SERVER_TIME' });
    store.transactionUpdate.mockClear();
    store.current = { ...store.current, status: 'accepted' };
    await expect(service.respond('inv-1', 'accepted', { uid: 's-uid' })).resolves.toBeUndefined();
    expect(store.transactionUpdate).not.toHaveBeenCalled();
  });

  it('respond: a refusal from the server (already answered) is thrown, no fallback', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(answer(409, { error: 'Tunnikutsele on juba vastatud.' })));
    await expect(service.respond('inv-1', 'accepted', { uid: 's-uid' })).rejects.toThrow('Tunnikutsele on juba vastatud.');
    expect(store.transactionUpdate).not.toHaveBeenCalled();
  });
});
