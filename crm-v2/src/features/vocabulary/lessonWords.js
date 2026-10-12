// The vocabulary of every course lesson A2 → C1 (owner, 2026-10-11; data from PR #519, not yet checked by a teacher):
// 8–15 key words per lesson with a Russian meaning and an example sentence, in lessonWords/<course>.json
// ({ lessonId: [{ et, ru, ex, pos }] }). „Sõnavara → Teemad” (topicModel.js) groups them by course module.

const COURSES = [
  ['a2b1-', () => import('./lessonWords/a2b1.json')],
  ['b1b2-', () => import('./lessonWords/b1b2.json')],
  ['est-c1-', () => import('./lessonWords/c1.json')],
  ['a2-', () => import('./lessonWords/a2.json')],
];

const cache = new Map();
const courseOf = (lessonId) => COURSES.find(([prefix]) => String(lessonId || '').startsWith(prefix));
export const hasLessonWords = (lessonId) => Boolean(courseOf(lessonId));

function loadCourse(course) {
  if (!cache.has(course[0])) cache.set(course[0], course[1]().then((module) => module.default || module).catch(() => ({})));
  return cache.get(course[0]);
}

export async function loadLessonWords(lessonId) {
  const course = courseOf(lessonId);
  if (!course) return [];
  const words = (await loadCourse(course))[lessonId];
  return Array.isArray(words) ? words : [];
}

// { lessonId: words } for many lessons; each course file is loaded once (a separate build chunk each)
export async function loadWordsForLessons(lessonIds = []) {
  const entries = await Promise.all(lessonIds.filter(hasLessonWords).map(async (id) => [id, await loadLessonWords(id)]));
  return Object.fromEntries(entries);
}

// fixed id of a lesson word in „Minu sõnad”: `lw_<student>_<lesson>_<index in the lesson list>`, so a word is
// never added twice and the id tells where it came from (the rules allow no extra field)
const safe = (value) => String(value || '').replace(/[^A-Za-z0-9_-]/g, '');
export const lessonWordId = (studentId, lessonId, index) => `lw_${safe(studentId)}_${safe(lessonId)}_${index}`;
