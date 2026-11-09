import { connectStorageEmulator, getStorage } from 'firebase/storage';
import { provideStorage, usesEmulators } from './storageSlot.js';

// Imported (for its effect) by every service file that uses `requireFirebaseClient().storage`, so Firebase Storage
// downloads with the pages that upload or download files and not with /login (client.js `storage`;
// storageClient.test.js checks that every user of `firebase/storage` imports this file).
provideStorage((app) => {
  const storage = getStorage(app);
  if (usesEmulators()) connectStorageEmulator(storage, '127.0.0.1', 9199);
  return storage;
});
