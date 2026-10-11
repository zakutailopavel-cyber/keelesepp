// The vocabulary of every course lesson A2 → C1 (owner, 2026-10-11): 12–15 key words per lesson with a Russian
// translation and an example sentence from the lesson, in lessonWords/<course>.json ({ lessonId: [{ et, ru, ex, pos }] }).
// The student meets them as a lesson deck in „Sõnavara”, and the words of lessons he has just had go into
// „Minu sõnad” by themselves — there the Leitner repetition and the pet's food (petCare) already live.
import { sameWord } from './wordsModel.js';

const COURSES = [
  ['a2b1-', () => import('./lessonWords/a2b1.json')],
  ['b1b2-', () => import('./lessonWords/b1b2.json')],
  ['est-c1-', () => import('./lessonWords/c1.json')],
  ['a2-', () => import('./lessonWords/a2.json')],
];
// a lesson's words are added to „Minu sõnad” for lessons held in the last IMPORT_DAYS days, at most
// IMPORT_LESSONS lessons at a time (a long history must not bury the student and starve the pet)
export const IMPORT_DAYS = 14;
export const IMPORT_LESSONS = 3;

const cache = new Map();
const courseOf = (lessonId) => COURSES.find(([prefix]) => String(lessonId || '').startsWith(prefix));

export async function loadLessonWords(lessonId) {
  const course = courseOf(lessonId);
  if (!course) return [];
  if (!cache.has(course[0])) cache.set(course[0], course[1]().then((module) => module.default || module).catch(() => ({})));
  const words = (await cache.get(course[0]))[lessonId];
  return Array.isArray(words) ? words : [];
}

// the cards of a lesson deck (StudySession): Estonian front, Russian back, the example as hint
export function lessonWordCards(words = [], lessonId = '') {
  return words.filter((w) => w?.et && w?.ru).map((w, i) => ({ id: `lw:${lessonId}:${i}`, front: w.et, back: w.ru, hint: w.ex || '' }));
}

// fixed id of a lesson word in „Minu sõnad”: the same lesson is never imported twice
const safe = (value) => String(value || '').replace(/[^A-Za-z0-9_-]/g, '');
export const lessonWordId = (studentId, lessonId, index) => `lw_${safe(studentId)}_${safe(lessonId)}_${index}`;
export const lessonImported = (studentId, lessonId, words = []) => words.some((w) => String(w.id || '').startsWith(`lw_${safe(studentId)}_${safe(lessonId)}_`));

// lesson words added in the last days and not practised yet (the dashboard invites the student to repeat them)
export function freshLessonWords(words = [], now = Date.now(), days = 3) {
  return words.filter((w) => String(w.id || '').startsWith('lw_') && !w.reviewedAt
    && now - new Date(w.createdAt || 0).getTime() <= days * 24 * 60 * 60 * 1000);
}

// held lessons with an Õppevara topic from the last IMPORT_DAYS days whose words are not in „Minu sõnad” yet
export function lessonsToImport({ studentId, lessons = [], words = [], now = Date.now() }) {
  const since = now - IMPORT_DAYS * 24 * 60 * 60 * 1000;
  const seen = new Set();
  return [...lessons]
    .filter((l) => l.topicLessonId && courseOf(l.topicLessonId) && (!l.status || l.status === 'Toimunud'))
    .filter((l) => { const t = new Date(`${String(l.date).slice(0, 10)}T12:00:00`).getTime(); return t >= since && t <= now; })
    .sort((a, b) => String(b.date).localeCompare(String(a.date)))
    .map((l) => l.topicLessonId)
    .filter((id) => (seen.has(id) ? false : seen.add(id)))
    .filter((id) => !lessonImported(studentId, id, words))
    .slice(0, IMPORT_LESSONS);
}

// writes the lesson's words the student does not have yet, in one batch; returns how many were added
export async function importLessonWords({ studentId, lessonId, words = [], service, user, load = loadLessonWords }) {
  const lessonWords = await load(lessonId);
  const items = [];
  const known = [...words];
  lessonWords.forEach((w, index) => {
    if (!w?.et || sameWord(known, w.et)) return;
    items.push({ id: lessonWordId(studentId, lessonId, index), word: w.et, translation: w.ru, example: w.ex || '' });
    known.push({ word: w.et });
  });
  if (items.length) await service.addLessonWords({ studentId, items, user });
  return items.length;
}
