// „Teema: Hele / Tume / Süsteem” (docs/DESIGN_TOKENS.md „Dark theme”). The choice lives in localStorage twice: under the
// user (follows the person on this device) and as the device's last choice, which public/theme-boot.js reads before the
// first paint so a dark page never flashes white. The CSS reads <html data-theme>; "system" follows prefers-color-scheme.
export const THEME_STORAGE_KEY = 'keelesepp.theme';
export const THEME_OPTIONS = [
  { id: 'light', label: 'Hele' },
  { id: 'dark', label: 'Tume' },
  { id: 'system', label: 'Süsteem' },
];
const VALID = new Set(THEME_OPTIONS.map((option) => option.id));

const userKey = (uid) => `${THEME_STORAGE_KEY}.${uid}`;
const storage = () => { try { return globalThis.localStorage || null; } catch { return null; } };

function read(key) {
  try {
    const value = storage()?.getItem(key);
    return VALID.has(value) ? value : null;
  } catch { return null; }
}

function write(key, value) {
  try { storage()?.setItem(key, value); } catch { /* private mode / blocked: the choice lasts this visit */ }
}

/** the saved choice: the user's own, else this device's last one, else "system" */
export function readTheme(uid) {
  return (uid ? read(userKey(uid)) : null) || read(THEME_STORAGE_KEY) || 'system';
}

export function applyTheme(theme, root = globalThis.document?.documentElement) {
  if (!root) return;
  root.setAttribute('data-theme', VALID.has(theme) ? theme : 'system');
}

export function saveTheme(theme, uid) {
  const value = VALID.has(theme) ? theme : 'system';
  write(THEME_STORAGE_KEY, value);
  if (uid) write(userKey(uid), value);
  applyTheme(value);
  return value;
}

/** the dark theme needs CSS light-dark(); an older browser stays light and is not offered the choice */
export function themeSupported() {
  try { return Boolean(globalThis.CSS?.supports?.('color', 'light-dark(#000, #fff)')); } catch { return false; }
}
