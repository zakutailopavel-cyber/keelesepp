import {
  createUserWithEmailAndPassword,
  deleteUser,
  GoogleAuthProvider,
  sendEmailVerification,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile as updateAuthProfile,
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

// Self-registration (same profile shape as the legacy CRM, see haldus.html `register`).
// Teachers and administrators are created by an administrator, never here.
export const TERMS_VERSION = '2025-08-10';
export const STUDY_TERMS_VERSION = '2026-10-01';
export const REGISTRATION_TEACHERS = ['Pavel', 'Jelena', 'Elizaveta', 'Angelina'];
export const SELF_ROLES = ['parent', 'student'];
const STAFF_OPERATIONS_URL = 'https://us-central1-keelesepp-5136b.cloudfunctions.net/staffOperationsApi';

export class ProfileMissingError extends Error {
  constructor() {
    super('Selle Google’i kontoga pole veel KeeleSeppi kontot. Vali roll ja nõustu tingimustega, et konto luua.');
    this.name = 'ProfileMissingError';
    this.code = 'auth/profile-missing';
  }
}

const localDate = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

export function registrationProfile(values = {}, now = new Date()) {
  const role = values.role;
  const displayName = String(values.displayName || '').trim();
  const email = String(values.email || '').trim();
  if (!SELF_ROLES.includes(role)) throw new Error('Õpetaja ja administraatori kontod loob administraator.');
  if (!displayName) throw new Error('Nimi on kohustuslik.');
  if (displayName.length > 160) throw new Error('Nimi võib olla kuni 160 märki.');
  if (!email) throw new Error('E-post on kohustuslik.');
  if (!values.acceptedTerms) throw new Error('Konto loomiseks nõustu kasutustingimustega.');
  const isParent = role === 'parent';
  return {
    role,
    displayName,
    email,
    childName: isParent ? String(values.childName || '').trim().slice(0, 300) : '',
    preferredTeacher: isParent ? (REGISTRATION_TEACHERS.includes(values.preferredTeacher) ? values.preferredTeacher : 'Pavel') : '',
    createdAt: localDate(now),
    termsAcceptedAt: now.toISOString(),
    termsVersion: TERMS_VERSION,
    // no access until an administrator approves (Firestore rules require exactly this on self-registration)
    approvalStatus: 'pending',
  };
}

export const isAwaitingApproval = (user) => ['pending', 'rejected'].includes(user?.approvalStatus);

export function validatePassword(password, repeat) {
  if (!password) return 'Parool on kohustuslik.';
  if (password.length < 6) return 'Parool peab olema vähemalt 6 tähemärki.';
  if (repeat !== undefined && password !== repeat) return 'Paroolid ei ühti.';
  return '';
}

// Server links the account to its student card(s) (creates a card for a new student,
// matches a parent's children). Best effort: login must not fail because of it.
async function bootstrapAccount(firebaseUser, profile) {
  if (['pending', 'rejected'].includes(profile?.approvalStatus)) return null;
  if (!firebaseUser || !SELF_ROLES.some((role) => profile?.role === role || profile?.roles?.includes?.(role))) return null;
  try {
    const token = await firebaseUser.getIdToken();
    const response = await globalThis.fetch(`${STAFF_OPERATIONS_URL}/accounts/bootstrap`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ includeSelfStudent: false }),
    });
    return response.ok ? response.json() : null;
  } catch (error) {
    globalThis.console?.warn?.('Account bootstrap failed:', error);
    return null;
  }
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
    approvalStatus: profile.approvalStatus || 'approved',
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
      const user = await enrichUser(credential.user);
      await bootstrapAccount(credential.user, user.profile);
      return user;
    } catch (error) {
      await signOut(auth);
      throw accountAccessError(error);
    }
  },
  // `registration` ({ role, acceptedTerms, childName, preferredTeacher }) creates the profile for a new Google account;
  // without it a Google account that has no profile is signed out with ProfileMissingError.
  async signInWithGoogle(registration = null) {
    const { auth, db } = requireFirebaseClient();
    const credential = await signInWithPopup(auth, new GoogleAuthProvider());
    const firebaseUser = credential.user;
    try {
      const snapshot = await getDoc(doc(db, 'users', firebaseUser.uid));
      if (!snapshot.exists()) {
        if (!registration) throw new ProfileMissingError();
        const profile = registrationProfile({ ...registration, displayName: firebaseUser.displayName || firebaseUser.email, email: firebaseUser.email });
        await setDoc(doc(db, 'users', firebaseUser.uid), profile);
      }
      const user = await enrichUser(firebaseUser);
      await bootstrapAccount(firebaseUser, user.profile);
      return user;
    } catch (error) {
      await signOut(auth);
      throw accountAccessError(error);
    }
  },
  async register(values) {
    const { auth, db } = requireFirebaseClient();
    const profile = registrationProfile(values);
    const passwordError = validatePassword(values.password, values.passwordRepeat);
    if (passwordError) throw new Error(passwordError);
    const credential = await createUserWithEmailAndPassword(auth, profile.email, values.password);
    try {
      await updateAuthProfile(credential.user, { displayName: profile.displayName });
      await setDoc(doc(db, 'users', credential.user.uid), profile);
    } catch (error) {
      // no half-made accounts: without a profile the account cannot be used anyway
      await deleteUser(credential.user).catch(() => null);
      throw error;
    }
    await sendEmailVerification(credential.user).catch(() => null);
    const user = await enrichUser(credential.user);
    await bootstrapAccount(credential.user, user.profile);
    return user;
  },
  // re-read the own profile (the waiting screen's "check again"); runs the account link once approved
  async refresh() {
    const { auth } = requireFirebaseClient();
    if (!auth.currentUser) return null;
    await auth.currentUser.getIdToken(true);
    const user = await enrichUser(auth.currentUser);
    await bootstrapAccount(auth.currentUser, user.profile);
    return user;
  },
  async resetPasswordFor(email) {
    const { auth } = requireFirebaseClient();
    const clean = String(email || '').trim();
    if (!clean) throw new Error('Sisesta oma e-posti aadress.');
    await sendPasswordResetEmail(auth, clean);
    return clean;
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
  async acceptStudyTerms() {
    const { auth, db } = requireFirebaseClient();
    if (!auth.currentUser) throw new Error('Kasutajaseanss on aegunud. Logi uuesti sisse.');
    const current = await enrichUser(auth.currentUser);
    if (!current?.roles?.includes('parent')) throw new Error('Õppetingimused kinnitab lapsevanem.');
    const acceptedAt = new Date().toISOString();
    await setDoc(doc(db, 'users', auth.currentUser.uid), {
      studyTermsAcceptedAt: acceptedAt,
      studyTermsVersion: STUDY_TERMS_VERSION,
      updatedAt: acceptedAt,
    }, { merge: true });
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
