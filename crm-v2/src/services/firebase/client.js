import { getApp, getApps, initializeApp } from 'firebase/app';
import { connectAuthEmulator, getAuth } from 'firebase/auth';
import { connectFirestoreEmulator, getFirestore } from 'firebase/firestore';
import { storageFactory, usesEmulators } from './storageSlot.js';

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

// Local checks only: VITE_FIREBASE_EMULATORS=1 connects Auth (9099), Firestore (8080) and Storage (9199, in
// storageClient.js) emulators.
function connectEmulators(auth, db) {
  if (!usesEmulators()) return;
  connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });
  connectFirestoreEmulator(db, '127.0.0.1', 8080);
}

// Firebase Storage is not part of the first download (vite.config.js `firebase-storage`): the service files that upload
// or download files import `./storageClient.js`, which hands `getStorage` over (storageSlot.js). For them
// `client.storage` is the same object as before (created on first use); a file that uses it without importing
// storageClient.js gets a clear error.
function storageOf(app) {
  const factory = storageFactory();
  if (!factory) throw new Error('Firebase Storage is not loaded: import ./storageClient.js in the service that uses it');
  return factory(app);
}

export function getFirebaseClient() {
  if (!isFirebaseConfigured()) return null;
  if (client) return client;
  const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  let storage = null;
  client = { app, auth: getAuth(app), db: getFirestore(app), get storage() { storage ||= storageOf(app); return storage; } };
  connectEmulators(client.auth, client.db);
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
