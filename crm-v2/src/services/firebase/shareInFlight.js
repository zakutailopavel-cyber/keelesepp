import { getFirebaseClient } from './client.js';

// Two parts of one page asking for the same list at the same moment (the bell and the page, two cards) share one read.
// Only while that read is running: nothing is kept afterwards, so a read started after a change always sees the change.
// Each caller gets its own copies of the list and of its records, as if it had read them itself.
const running = new Map();

const copy = (value) => {
  if (Array.isArray(value)) return value.map((item) => (item && typeof item === 'object' ? { ...item } : item));
  if (Array.isArray(value?.items)) return { ...value, items: copy(value.items) };
  return value;
};

function currentUid() {
  try { return getFirebaseClient()?.auth?.currentUser?.uid || ''; } catch { return ''; }
}

export function shareInFlight(key, read) {
  const fullKey = `${currentUid()}|${key}`;
  let promise = running.get(fullKey);
  if (!promise) {
    promise = Promise.resolve().then(read).finally(() => running.delete(fullKey));
    running.set(fullKey, promise);
  }
  return promise.then(copy);
}
