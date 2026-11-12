/* global setTimeout, clearTimeout */
// A Firestore write without network neither resolves nor rejects (Fable review 2026-11-11, U4): the button spun forever.
// withWriteTimeout gives up waiting after WRITE_TIMEOUT_MS with a clear Estonian message. The write itself is not
// cancelled — it may still land later — so the error carries `pending` (the original promise) for whoever wants to
// finish the job when it does.

export const WRITE_TIMEOUT_MS = 8000;
export const OFFLINE_CODE = 'keelesepp/offline';
export const SUBMIT_OFFLINE_MESSAGE = 'Võrku pole – tööleht jäi esitamata. Vastused on selles seadmes alles. Proovi uuesti, kui võrk tuleb.';
export const SAVE_OFFLINE_MESSAGE = 'Võrku pole – ei salvestunud. Vastused on selles seadmes alles. Proovi uuesti, kui võrk tuleb.';

// Firebase codes that mean "no connection" rather than "not allowed" or "broken"
const NETWORK_CODES = new Set(['unavailable', 'deadline-exceeded', 'firestore/unavailable', 'firestore/deadline-exceeded']);

export class OfflineWriteError extends Error {
  constructor(message, pending = null) {
    super(message);
    this.name = 'OfflineWriteError';
    this.code = OFFLINE_CODE;
    this.pending = pending;
  }
}

export const isOfflineError = (error) => error?.code === OFFLINE_CODE;
const isNetworkError = (error) => NETWORK_CODES.has(error?.code) || /client is offline/i.test(String(error?.message || ''));

export function browserOffline() {
  return globalThis.navigator?.onLine === false;
}

// Resolves / rejects like `promise`, or rejects with OfflineWriteError after `ms`. A network error from Firebase is
// turned into the same OfflineWriteError (one message for the learner).
export function withWriteTimeout(promise, { ms = WRITE_TIMEOUT_MS, message = SAVE_OFFLINE_MESSAGE } = {}) {
  const original = Promise.resolve(promise);
  let timer = null;
  const timeout = new Promise((_, reject) => { timer = setTimeout(() => reject(new OfflineWriteError(message, original)), ms); });
  const guarded = original.catch((error) => { throw isNetworkError(error) ? new OfflineWriteError(message, null) : error; });
  // a late outcome of the original after the timeout is handled by whoever holds `pending`; never an unhandled rejection
  original.catch(() => {});
  return Promise.race([guarded, timeout]).finally(() => clearTimeout(timer));
}
