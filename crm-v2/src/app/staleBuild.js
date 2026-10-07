// After a deploy the old page files are gone: a tab opened before it fails to load a lazy page and stays blank.
// Then the page is reloaded once (not in a loop) so it picks up the new build.
const KEY = 'ks-stale-build-reload';
const WINDOW_MS = 30000;

export function isStaleBuildError(error) {
  return /dynamically imported module|Importing a module script failed|error loading dynamically imported|ChunkLoadError|Unable to preload CSS/i.test(String(error?.message || error || ''));
}

export function reloadOnceForNewBuild(storage = globalThis.sessionStorage, location = globalThis.location, now = Date.now()) {
  let last = 0;
  try { last = Number(storage?.getItem(KEY)) || 0; } catch { last = 0; }
  if (last && now - last < WINDOW_MS) return false;
  try { storage?.setItem(KEY, String(now)); } catch { /* storage blocked: still reload once */ }
  location?.reload();
  return true;
}
