// „Lõpeta tund” → calendar: what the Live Classroom knows about the lesson (the note and the curriculum lessons of the
// worksheets used) is handed to the calendar lesson it was started from, which marks it held („Toimunud”) on arrival.
// Kept in the teacher's browser only, per lesson key, and used once; a bare `?lesson=` link never marks anything.
import { isLessonKey } from './lessonLink.js';

const KEY = 'keelesepp.liveLessonHandoff';
const MAX_AGE = 12 * 60 * 60 * 1000;

const storage = () => {
  try { return globalThis.localStorage || null; } catch { return null; }
};
function readAll(store) {
  try {
    const value = JSON.parse(store?.getItem(KEY) || '{}');
    return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
  } catch {
    return {};
  }
}

export function saveLessonHandoff(lessonKey, { notes = '', lessonIds = [] } = {}, store = storage(), now = Date.now()) {
  if (!isLessonKey(lessonKey) || !store) return;
  const fresh = Object.fromEntries(Object.entries(readAll(store)).filter(([, entry]) => now - (entry?.savedAt || 0) < MAX_AGE));
  fresh[lessonKey] = {
    notes: String(notes || '').trim().slice(0, 1000),
    lessonIds: [...new Set(lessonIds.filter((id) => typeof id === 'string' && id))].slice(0, 10),
    savedAt: now,
  };
  try { store.setItem(KEY, JSON.stringify(fresh)); } catch { /* private mode: the teacher marks the lesson by hand */ }
}

// the handoff for this lesson (once: it is removed when read), or null
export function takeLessonHandoff(lessonKey, store = storage(), now = Date.now()) {
  if (!isLessonKey(lessonKey) || !store) return null;
  const all = readAll(store);
  const entry = all[lessonKey];
  if (!entry) return null;
  delete all[lessonKey];
  try { store.setItem(KEY, JSON.stringify(all)); } catch { /* ignore */ }
  return now - (entry.savedAt || 0) < MAX_AGE ? entry : null;
}

// The topic for the journal: the first worksheet's curriculum lesson that is in the catalogue, else the suggestion.
export function handoffTopic(catalog, handoff, suggestion = null) {
  const fromSheet = (handoff?.lessonIds || []).map((id) => catalog?.byId.get(id)).find(Boolean);
  return fromSheet || suggestion || null;
}

// room worksheets not finished in the lesson (they can become homework with one click)
export const unfinishedSheets = (sheets = []) => sheets.filter((sheet) => sheet.status !== 'done' && !sheet.completedAt);
