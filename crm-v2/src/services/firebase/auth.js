import {
  GoogleAuthProvider,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
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
    roles: normalizeRoles(profile, tokenResult.claims, { email: firebaseUser.email }),
  };
}

export function normalizeOwnProfileInput(values = {}) {
  const displayName = String(values.displayName || '').trim();
  const phone = String(values.phone || '').trim();
  if (!displayName) throw new Error('Nimi on kohustuslik.');
  if (displayName.length > 160) throw new Error('Nimi võib olla kuni 160 märki.');
  if (phone.length > 40 || (phone && phone.replace(/\D/g, '').length < 5)) throw new Error('Kontrolli telefoninumbrit.');
  return { displayName, phone };
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
  async updateProfile(values) {
    const { auth, db } = requireFirebaseClient();
    if (!auth.currentUser) throw new Error('Kasutajaseanss on aegunud. Logi uuesti sisse.');
    const payload = { ...normalizeOwnProfileInput(values), updatedAt: new Date().toISOString() };
    await setDoc(doc(db, 'users', auth.currentUser.uid), payload, { merge: true });
    return enrichUser(auth.currentUser);
  },
  async sendPasswordReset() {
    const { auth } = requireFirebaseClient();
    const email = auth.currentUser?.email;
    if (!email) throw new Error('Konto e-posti aadressi ei leitud.');
    await sendPasswordResetEmail(auth, email);
    return email;
  },
};
