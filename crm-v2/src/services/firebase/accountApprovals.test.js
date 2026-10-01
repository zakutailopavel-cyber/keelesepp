import { beforeEach, afterEach } from 'vitest';
import { accountApprovalsService, APPROVAL_RESPONSE_LOST_MESSAGE } from './accountApprovals.js';

const mocks = vi.hoisted(() => ({
  getDocFromServer: vi.fn(),
  currentUser: { getIdToken: vi.fn().mockResolvedValue('admin-token') },
}));
vi.mock('./client.js', () => ({ requireFirebaseClient: () => ({ auth: { currentUser: mocks.currentUser }, db: 'db' }) }));
vi.mock('firebase/firestore', () => ({
  collection: vi.fn(), getDocs: vi.fn(), query: vi.fn(), where: vi.fn(),
  doc: (_db, collection, uid) => `${collection}/${uid}`,
  getDocFromServer: mocks.getDocFromServer,
}));

describe('approval response recovery', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));
  });
  afterEach(() => vi.unstubAllGlobals());

  it('recovers only an explicitly approved profile from the server after a network failure', async () => {
    mocks.getDocFromServer.mockResolvedValue({ exists: () => true, data: () => ({ approvalStatus: 'approved' }) });
    await expect(accountApprovalsService.decide({ uid: 'student-1', decision: 'approve' })).resolves.toEqual({ uid: 'student-1', approvalStatus: 'approved', mailed: false, responseLost: true, message: APPROVAL_RESPONSE_LOST_MESSAGE });
    expect(mocks.getDocFromServer).toHaveBeenCalledWith('users/student-1');
    expect(globalThis.fetch).toHaveBeenCalledOnce();
  });

  it.each(['pending', 'rejected', undefined])('keeps a network failure for status %s', async (approvalStatus) => {
    mocks.getDocFromServer.mockResolvedValue({ exists: () => true, data: () => ({ approvalStatus }) });
    await expect(accountApprovalsService.decide({ uid: 'student-1', decision: 'approve' })).rejects.toThrow(/serveriga/);
  });

  it('keeps a network failure if the profile cannot be read or is absent', async () => {
    mocks.getDocFromServer.mockRejectedValueOnce(new Error('offline')).mockResolvedValueOnce({ exists: () => false });
    for (let i = 0; i < 2; i++) await expect(accountApprovalsService.decide({ uid: 'student-1', decision: 'approve' })).rejects.toThrow(/serveriga/);
  });

  it('does not turn a failed rejection into a successful approval', async () => {
    await expect(accountApprovalsService.decide({ uid: 'student-1', decision: 'reject' })).rejects.toThrow(/serveriga/);
    expect(mocks.getDocFromServer).not.toHaveBeenCalled();
  });

  it('preserves a normal server error without reconciliation', async () => {
    globalThis.fetch.mockResolvedValue({ ok: false, json: async () => ({ error: 'Admin required' }) });
    await expect(accountApprovalsService.decide({ uid: 'student-1', decision: 'approve' })).rejects.toThrow('Admin required');
    expect(mocks.getDocFromServer).not.toHaveBeenCalled();
  });

  it('also reconciles a connection lost while reading the response body', async () => {
    globalThis.fetch.mockResolvedValue({ ok: true, json: async () => { throw new TypeError('network body lost'); } });
    mocks.getDocFromServer.mockResolvedValue({ exists: () => true, data: () => ({ approvalStatus: 'approved' }) });
    await expect(accountApprovalsService.decide({ uid: 'student-1', decision: 'approve' })).resolves.toMatchObject({ responseLost: true, mailed: false });
  });

  it('returns a normal successful server response without rereading the profile', async () => {
    const result = { approvalStatus: 'approved', mailed: false, mailPending: true };
    globalThis.fetch.mockResolvedValue({ ok: true, json: async () => result });
    await expect(accountApprovalsService.decide({ uid: 'student-1', decision: 'approve' })).resolves.toEqual(result);
    expect(mocks.getDocFromServer).not.toHaveBeenCalled();
  });
});
