// After a deploy the old page files are gone: a tab opened before it fails to load a lazy page and stays blank.
// Then the page is reloaded once (not in a loop) so it picks up the new build.
const KEY = 'ks-stale-build-reload';
const WINDOW_MS = 30000;

export function isStaleBuildError(error) {
  return /dynamically imported module|Importing a module script failed|error loading dynamically imported|ChunkLoadError|Unable to preload CSS/i.test(String(error?.message || error || ''));
}

// A running lesson (Live room) holds these reloads: a page reload there drops the call (owner 2026-11-24: „Sõnad” in a
// lesson threw the teacher out of the lesson, the second press worked — the tab was opened before a release). While
// held, a missing file of the old build fails in its own panel (RoomPartBoundary: „KeeleSepp uuenes tunni ajal”).
let holds = 0;
export function holdReloads() {
  holds += 1;
  let released = false;
  return () => { if (!released) { released = true; holds -= 1; } };
}
export const reloadsHeld = () => holds > 0;

export function reloadOnceForNewBuild(storage = globalThis.sessionStorage, location = globalThis.location, now = Date.now()) {
  if (reloadsHeld()) return false;
  let last = 0;
  try { last = Number(storage?.getItem(KEY)) || 0; } catch { last = 0; }
  if (last && now - last < WINDOW_MS) return false;
  try { storage?.setItem(KEY, String(now)); } catch { /* storage blocked: still reload once */ }
  location?.reload();
  return true;
}
