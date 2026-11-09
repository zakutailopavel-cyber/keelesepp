import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it, vi } from 'vitest';
import { provideStorage, storageFactory } from './storageSlot.js';

const SRC = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

function sourceFiles(dir = SRC, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) sourceFiles(full, out);
    else if (/\.(jsx?|tsx?)$/.test(entry.name) && !/\.(test|testkit)\./.test(entry.name)) out.push(full);
  }
  return out;
}

const read = (file) => fs.readFileSync(file, 'utf8');
const usesStorageSdk = (text) => /from\s+['"]firebase\/storage['"]/.test(text);

describe('Firebase Storage stays out of the first download', () => {
  it('client.js does not import the Storage SDK', () => {
    expect(usesStorageSdk(read(path.join(SRC, 'services/firebase/client.js')))).toBe(false);
  });

  it('every file that uses the Storage SDK imports storageClient.js (so client.storage works there)', () => {
    const users = sourceFiles().filter((file) => usesStorageSdk(read(file)) && !file.endsWith('storageClient.js'));
    expect(users.length).toBeGreaterThan(5);
    users.forEach((file) => expect(read(file), path.relative(SRC, file)).toMatch(/import\s+['"]\.\/storageClient\.js['"]/));
  });

  it('storageClient.js hands over getStorage; client.storage is created once, on first use', async () => {
    vi.resetModules();
    const getStorage = vi.fn((app) => ({ app }));
    vi.doMock('firebase/storage', () => ({ getStorage, connectStorageEmulator: vi.fn() }));
    const slot = await import('./storageSlot.js');
    slot.provideStorage(null);
    await import('./storageClient.js');
    const factory = slot.storageFactory();
    expect(factory('app-1')).toEqual({ app: 'app-1' });
    expect(getStorage).toHaveBeenCalledWith('app-1');
    vi.doUnmock('firebase/storage');
  });

  it('client.storage: a clear error without storageClient.js, then one shared instance', async () => {
    const before = storageFactory();
    vi.resetModules();
    ['API_KEY', 'AUTH_DOMAIN', 'PROJECT_ID', 'APP_ID'].forEach((key) => vi.stubEnv(`VITE_FIREBASE_${key}`, 'x'));
    vi.doMock('firebase/app', () => ({ getApps: () => [], getApp: vi.fn(), initializeApp: () => ({ name: 'app' }) }));
    vi.doMock('firebase/auth', () => ({ getAuth: () => ({}), connectAuthEmulator: vi.fn() }));
    vi.doMock('firebase/firestore', () => ({ getFirestore: () => ({}), connectFirestoreEmulator: vi.fn() }));
    const slot = await import('./storageSlot.js');
    const { getFirebaseClient } = await import('./client.js');
    slot.provideStorage(null);
    const client = getFirebaseClient();
    expect(() => client.storage).toThrow(/storageClient\.js/);
    const factory = vi.fn(() => ({ bucket: 'b' }));
    slot.provideStorage(factory);
    expect(client.storage).toBe(client.storage);
    expect(factory).toHaveBeenCalledTimes(1);
    ['firebase/app', 'firebase/auth', 'firebase/firestore'].forEach((name) => vi.doUnmock(name));
    vi.unstubAllEnvs();
    provideStorage(before);
  });
});
