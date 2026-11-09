// The meeting point of client.js and storageClient.js (kept apart from client.js so the many tests that mock client.js
// do not have to know about it). Firebase Storage is not part of the first download (vite.config.js
// `firebase-storage`): storageClient.js puts its `getStorage` here when a service that uses files loads.
let factory = null;

export function provideStorage(next) { factory = next; }
export function storageFactory() { return factory; }

// Local checks only: VITE_FIREBASE_EMULATORS=1 connects the Auth, Firestore and Storage emulators.
export const usesEmulators = () => import.meta.env.VITE_FIREBASE_EMULATORS === '1';
