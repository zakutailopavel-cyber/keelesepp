import { beforeEach, describe, expect, it, vi } from 'vitest';

const denied = () => Object.assign(new Error('Missing or insufficient permissions.'), { code: 'permission-denied' });
const sdk = vi.hoisted(() => ({
  setDoc: vi.fn(), updateDoc: vi.fn(), deleteDoc: vi.fn(), addDoc: vi.fn(), runTransaction: vi.fn(), writeBatch: vi.fn(),
}));
vi.mock('@firebase/firestore', () => sdk);

const { REPORTED } = await import('../../features/client-errors/clientErrorReporter.js');
const firestore = await import('./firestoreWithReporting.js');

describe('firebase/firestore with permission-denied reporting', () => {
  const reporter = { reportPermissionDenied: vi.fn() };
  beforeEach(() => {
    reporter.reportPermissionDenied.mockReset();
    firestore.setFirestoreErrorReporter(reporter);
  });

  it('every `firebase/firestore` import gets the wrapper (vite alias)', async () => {
    const aliased = await import('firebase/firestore');
    expect(aliased.setDoc).toBe(firestore.setDoc);
  });

  it('a refused write is reported with its path (no data) and the same error is re-thrown', async () => {
    const error = denied();
    sdk.updateDoc.mockRejectedValueOnce(error);
    await expect(firestore.updateDoc({ path: 'students/abc' }, { name: 'Mari', email: 'mari@example.com' })).rejects.toBe(error);
    expect(reporter.reportPermissionDenied).toHaveBeenCalledWith(['students/abc'], 'update');
    expect(JSON.stringify(reporter.reportPermissionDenied.mock.calls)).not.toContain('Mari');
    expect(error[REPORTED]).toBe(true);
  });

  it('addDoc / setDoc / deleteDoc / transaction', async () => {
    sdk.addDoc.mockRejectedValueOnce(denied());
    sdk.setDoc.mockRejectedValueOnce(denied());
    sdk.deleteDoc.mockRejectedValueOnce(denied());
    sdk.runTransaction.mockRejectedValueOnce(denied());
    await expect(firestore.addDoc({ path: 'lessons' }, {})).rejects.toThrow();
    await expect(firestore.setDoc({ path: 'users/u1' }, {})).rejects.toThrow();
    await expect(firestore.deleteDoc({ path: 'invoices/i1' })).rejects.toThrow();
    await expect(firestore.runTransaction({}, async () => {})).rejects.toThrow();
    expect(reporter.reportPermissionDenied.mock.calls).toEqual([[['lessons/new'], 'add'], [['users/u1'], 'set'], [['invoices/i1'], 'delete'], [[''], 'transaction']]);
  });

  it('other errors and successful writes are not reported', async () => {
    sdk.setDoc.mockRejectedValueOnce(Object.assign(new Error('offline'), { code: 'unavailable' }));
    sdk.setDoc.mockResolvedValueOnce(undefined);
    await expect(firestore.setDoc({ path: 'a/b' }, {})).rejects.toThrow('offline');
    await expect(firestore.setDoc({ path: 'a/b' }, {})).resolves.toBeUndefined();
    expect(reporter.reportPermissionDenied).not.toHaveBeenCalled();
  });

  it('never reports its own clientErrors writes (no loop before the rules are deployed)', async () => {
    sdk.addDoc.mockRejectedValueOnce(denied());
    await expect(firestore.addDoc({ path: 'clientErrors' }, {})).rejects.toThrow();
    expect(reporter.reportPermissionDenied).not.toHaveBeenCalled();
  });

  it('a refused batch reports the paths it touched', async () => {
    const inner = { set: vi.fn(), update: vi.fn(), delete: vi.fn(), commit: vi.fn().mockRejectedValue(denied()) };
    const originalSet = inner.set;
    sdk.writeBatch.mockReturnValueOnce(inner);
    const batch = firestore.writeBatch({});
    expect(batch.set({ path: 'students/s1' }, { name: 'x' })).toBe(batch);
    batch.update({ path: 'lessons/l1' }, {});
    batch.delete({ path: 'lessons/l2' });
    await expect(batch.commit()).rejects.toThrow();
    expect(originalSet).toHaveBeenCalledWith({ path: 'students/s1' }, { name: 'x' });
    expect(reporter.reportPermissionDenied).toHaveBeenCalledWith(['students/s1', 'lessons/l1', 'lessons/l2'], 'batch');
  });
});
