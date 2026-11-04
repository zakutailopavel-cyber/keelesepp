import { useCallback, useSyncExternalStore } from 'react';

// „Kiri”: the font the viewer sees typed answers in on a worksheet (owner 2026-11-04). A display preference of the
// person looking at the sheet, never part of the answer: the student picks for herself, the teacher sees the same
// answers in the teacher's own choice. Kept on this device only (localStorage) — the users doc rules
// (firestore.rules safeSelfUserFields) have no field for it.
// Every font is already loaded by engine/sheet.css (Google Fonts, latin-ext: õ ä ö ü š ž).
export const ANSWER_FONTS = [
  { key: 'plain', label: 'Tavaline', hint: 'ühtlane ja selge kiri' },
  { key: 'hand', label: 'Käekiri', hint: 'nagu pliiatsiga kirjutatud' },
  { key: 'serif', label: 'Raamatukiri', hint: 'raamatu moodi kiri' },
  { key: 'large', label: 'Suur', hint: 'tavaline, aga suurem' },
];
export const DEFAULT_ANSWER_FONT = 'plain';
export const ANSWER_FONT_KEY = 'ks.answerFont';
const CHANGED = 'ks-answer-font';

// the last choice made on this page when storage could not keep it
let memory = null;
const known = (key) => ANSWER_FONTS.some((font) => font.key === key);
const storageOf = (storage) => {
  if (storage !== undefined) return storage;
  try { return globalThis.localStorage || null; } catch { return null; }
};

export function readAnswerFont(storage) {
  try {
    const value = storageOf(storage)?.getItem(ANSWER_FONT_KEY);
    return known(value) ? value : DEFAULT_ANSWER_FONT;
  } catch { return DEFAULT_ANSWER_FONT; }
}

// returns the key that is now in use (an unknown key falls back to the default)
export function saveAnswerFont(key, storage) {
  const next = known(key) ? key : DEFAULT_ANSWER_FONT;
  // private window or blocked storage: the choice lasts until the page is reloaded
  memory = next;
  try {
    const store = storageOf(storage);
    if (store) {
      if (next === DEFAULT_ANSWER_FONT) store.removeItem(ANSWER_FONT_KEY);
      else store.setItem(ANSWER_FONT_KEY, next);
      memory = null;
    }
  } catch { /* kept in memory */ }
  try { globalThis.dispatchEvent?.(new globalThis.Event(CHANGED)); } catch { /* no window (tests, server) */ }
  return next;
}

// the class on .ws-root (engine/sheet.css): the plain font is the default
export const answerFontClass = (key) => `ans-${known(key) ? key : DEFAULT_ANSWER_FONT}`;

const snapshot = () => memory || readAnswerFont();
const subscribe = (onChange) => {
  const onStorage = (event) => { if (!event || event.key === ANSWER_FONT_KEY || event.key === null) onChange(); };
  globalThis.addEventListener?.(CHANGED, onChange);
  globalThis.addEventListener?.('storage', onStorage);
  return () => {
    globalThis.removeEventListener?.(CHANGED, onChange);
    globalThis.removeEventListener?.('storage', onStorage);
  };
};

// [key, setKey]: every open sheet on the page follows the choice at once (and other tabs of the same device)
export function useAnswerFont() {
  const key = useSyncExternalStore(subscribe, snapshot, () => DEFAULT_ANSWER_FONT);
  const setKey = useCallback((next) => { saveAnswerFont(next); }, []);
  return [key, setKey];
}
