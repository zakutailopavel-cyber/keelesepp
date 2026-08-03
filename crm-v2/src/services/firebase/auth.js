import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { getFirebaseClient, requireFirebaseClient } from './client.js';
import { normalizeRoles } from '../../utils/roles.js';

export class AccountAccessError extends Error {
  constructor(message = 'Konto profiilile puudub ligipääs. Võta ühendust administraatoriga.') {
    super(message);
    this.name = 'AccountAccessError';
    this.code = 'auth/account-access-denied';
  }
}

function accountAccessError(error) {
  return error?.code === 'permission-denied' || error?.code === 'firestore/permission-denied'
    ? new AccountAccessError()
    : error;
}

async function enrichUser(firebaseUser) {
  if (!firebaseUser) return null;
  const { db } = requireFirebaseClient();
  const [profileSnapshot, tokenResult] = await Promise.all([
    getDoc(doc(db, 'users', firebaseUser.uid)),
    firebaseUser.getIdTokenResult(),
  ]);
  const profile = profileSnapshot.exists() ? profileSnapshot.data() : {};
  return {
    uid: firebaseUser.uid,
    email: firebaseUser.email || profile.email || '',
    displayName: profile.displayName || firebaseUser.displayName || firebaseUser.email || '',
    profile,
    roles: normalizeRoles(profile, tokenResult.claims),
  };
}

export const authService = {
  subscribe(onSession, onError) {
    const client = getFirebaseClient();
    if (!client) {
      onSession(null);
      return () => {};
    }
    let generation = 0;
    const unsubscribe = onAuthStateChanged(client.auth, async (firebaseUser) => {
      const activeGeneration = ++generation;
      try {
        const user = await enrichUser(firebaseUser);
        if (activeGeneration === generation) onSession(user);
      } catch (error) {
        if (activeGeneration === generation) onError(accountAccessError(error));
      }
    }, onError);
    return () => { generation += 1; unsubscribe(); };
  },
  async signIn(email, password) {
    const { auth } = requireFirebaseClient();
    const credential = await signInWithEmailAndPassword(auth, email, password);
    try {
      return await enrichUser(credential.user);
    } catch (error) {
      await signOut(auth);
      throw accountAccessError(error);
    }
  },
  async signInWithGoogle() {
    const { auth } = requireFirebaseClient();
    const credential = await signInWithPopup(auth, new GoogleAuthProvider());
    try {
      return await enrichUser(credential.user);
    } catch (error) {
      await signOut(auth);
      throw accountAccessError(error);
    }
  },
  async signOut() {
    const { auth } = requireFirebaseClient();
    await signOut(auth);
  },
};
