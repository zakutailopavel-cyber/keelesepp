import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { getFirebaseClient, requireFirebaseClient } from './client.js';
import { normalizeRoles } from '../../utils/roles.js';

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
    return onAuthStateChanged(client.auth, async (firebaseUser) => {
      try { onSession(await enrichUser(firebaseUser)); } catch (error) { onError(error); }
    }, onError);
  },
  async signIn(email, password) {
    const { auth } = requireFirebaseClient();
    const credential = await signInWithEmailAndPassword(auth, email, password);
    return enrichUser(credential.user);
  },
  async signOut() {
    const { auth } = requireFirebaseClient();
    await signOut(auth);
  },
};
