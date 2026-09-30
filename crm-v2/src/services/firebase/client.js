import { getApp, getApps, initializeApp } from 'firebase/app';
import { connectAuthEmulator, getAuth } from 'firebase/auth';
import { connectFirestoreEmulator, getFirestore } from 'firebase/firestore';
import { connectStorageEmulator, getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const requiredConfigKeys = ['apiKey', 'authDomain', 'projectId', 'appId'];

export function isFirebaseConfigured(config = firebaseConfig) {
  return requiredConfigKeys.every((key) => Boolean(config[key]));
}

let client = null;

// Local checks only: VITE_FIREBASE_EMULATORS=1 connects Auth (9099), Firestore (8080) and Storage (9199) emulators.
function connectEmulators(auth, db, storage) {
  if (import.meta.env.VITE_FIREBASE_EMULATORS !== '1') return;
  connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });
  connectFirestoreEmulator(db, '127.0.0.1', 8080);
  connectStorageEmulator(storage, '127.0.0.1', 9199);
}

export function getFirebaseClient() {
  if (!isFirebaseConfigured()) return null;
  if (client) return client;
  const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  client = { app, auth: getAuth(app), db: getFirestore(app), storage: getStorage(app) };
  connectEmulators(client.auth, client.db, client.storage);
  return client;
}

export class FirebaseConfigurationError extends Error {
  constructor() {
    super('Firebase ei ole seadistatud. Lisa CRM v2 keskkonnamuutujad .env faili.');
    this.name = 'FirebaseConfigurationError';
    this.code = 'firebase/not-configured';
  }
}

export function requireFirebaseClient() {
  const client = getFirebaseClient();
  if (!client) throw new FirebaseConfigurationError();
  return client;
}
