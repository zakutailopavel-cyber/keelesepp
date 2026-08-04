import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  setDoc: vi.fn(),
  getDoc: vi.fn(),
  sendPasswordResetEmail: vi.fn(),
  currentUser: { uid: 'user-1', email: 'mari@example.com', displayName: 'Mari Auth', getIdTokenResult: vi.fn().mockResolvedValue({ claims: {} }) },
}));

vi.mock('firebase/auth', () => ({
  GoogleAuthProvider: vi.fn(),
  onAuthStateChanged: vi.fn(),
  sendPasswordResetEmail: mocks.sendPasswordResetEmail,
  signInWithEmailAndPassword: vi.fn(),
  signInWithPopup: vi.fn(),
  signOut: vi.fn(),
}));
vi.mock('firebase/firestore', () => ({
  doc: vi.fn((...parts) => parts.join(':')),
  getDoc: mocks.getDoc,
  setDoc: mocks.setDoc,
}));
vi.mock('./client.js', () => ({
  getFirebaseClient: vi.fn(),
  requireFirebaseClient: () => ({ auth: { currentUser: mocks.currentUser }, db: 'firebase-db' }),
}));

import { authService } from './auth.js';

describe('authService self-service account operations', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getDoc.mockResolvedValue({ exists: () => true, data: () => ({ role: 'student', displayName: 'Mari Tamm', phone: '55556' }) });
    mocks.setDoc.mockResolvedValue(undefined);
    mocks.sendPasswordResetEmail.mockResolvedValue(undefined);
  });

  it('writes only normalized contact fields to the current user document', async () => {
    await expect(authService.updateProfile({ displayName: ' Mari Tamm ', phone: ' 55556 ', role: 'admin' })).resolves.toMatchObject({ uid: 'user-1', displayName: 'Mari Tamm', roles: ['student'] });
    expect(mocks.setDoc).toHaveBeenCalledWith('firebase-db:users:user-1', expect.objectContaining({ displayName: 'Mari Tamm', phone: '55556' }), { merge: true });
    expect(mocks.setDoc.mock.calls[0][1]).not.toHaveProperty('role');
    expect(mocks.setDoc.mock.calls[0][1]).not.toHaveProperty('email');
  });

  it('sends password reset only to the signed-in account email', async () => {
    await expect(authService.sendPasswordReset()).resolves.toBe('mari@example.com');
    expect(mocks.sendPasswordResetEmail).toHaveBeenCalledWith(expect.objectContaining({ currentUser: mocks.currentUser }), 'mari@example.com');
  });
});
