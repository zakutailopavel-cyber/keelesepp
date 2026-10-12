// The student's own review results on this device ({ [drillKey]: { date, pct } }): the „Korda” badge and today's
// step on the home page. Practice only — nothing the teacher grades depends on it, so browser storage is enough.
const KEY = (uid) => `ks-review:${uid || 'anon'}`;

export function readDone(uid, storage = globalThis.localStorage) {
  try { return JSON.parse(storage?.getItem(KEY(uid)) || '{}') || {}; } catch { return {}; }
}

export function saveDone(uid, drillKey, entry, storage = globalThis.localStorage) {
  const next = { ...readDone(uid, storage), [drillKey]: entry };
  try { storage?.setItem(KEY(uid), JSON.stringify(next)); } catch { /* private mode: the result is shown, not kept */ }
  return next;
}

export const reviewedOn = (uid, day, storage) => Object.values(readDone(uid, storage)).some((entry) => entry?.date === day);
