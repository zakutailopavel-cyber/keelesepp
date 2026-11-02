// The data the textbook's own pages are built from, loaded per course only when a book of that course is built:
// the lesson words (vocabulary/lessonWords/<course>.json) and the learner goals „Ma oskan …” of the course lessons
// (worksheet-generator/admin/course/<course>/lessonGoals.js). Each file is its own build chunk.
import { loadWordsForLessons } from '../vocabulary/lessonWords.js';

const GOALS = [
  ['a2b1-', () => import('../worksheet-generator/admin/course/b1/lessonGoals.js').then((m) => m.B1_LESSON_GOALS)],
  ['b1b2-', () => import('../worksheet-generator/admin/course/b2/lessonGoals.js').then((m) => m.B2_LESSON_GOALS)],
  ['est-c1-', () => import('../worksheet-generator/admin/course/c1/lessonGoals.js').then((m) => m.C1_LESSON_GOALS)],
  ['a2-', () => import('../worksheet-generator/admin/course/a2/lessonGoals.js').then((m) => m.A2_LESSON_GOALS)],
];
const cache = new Map();
const goalsFile = (prefix, load) => {
  if (!cache.has(prefix)) cache.set(prefix, load().catch(() => ({})));
  return cache.get(prefix);
};

async function loadGoals(lessonIds) {
  const wanted = GOALS.filter(([prefix]) => lessonIds.some((id) => String(id).startsWith(prefix)));
  const files = await Promise.all(wanted.map(([prefix, load]) => goalsFile(prefix, load)));
  const all = Object.assign({}, ...files);
  return Object.fromEntries(lessonIds.filter((id) => all[id]).map((id) => [id, all[id]]));
}

// { words: { lessonId: [...] }, goals: { lessonId: { canDo } } }; a file that fails to load leaves its part empty
export async function loadBookExtras(lessonIds = []) {
  const [words, goals] = await Promise.all([loadWordsForLessons(lessonIds).catch(() => ({})), loadGoals(lessonIds)]);
  return { words, goals };
}
