import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

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

export function getFirebaseClient() {
  if (!isFirebaseConfigured()) return null;
  const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  return { app, auth: getAuth(app), db: getFirestore(app), storage: getStorage(app) };
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
