// „Täna” step „Laused ja grammatika” (owner 2026-11-09): one practice lesson for the student — course sentences and
// grammar of his level and current module (engine/, docs/PRACTICE_ENGINE.md) plus his own wrong sentences from both
// mistake sources (engine/ownSentences.js). The course file of his level loads only when the step starts.
import { coursePath } from '../students/levelProgress.js';
import { mainSubject } from '../students/subjects.js';
import { COURSE_LEVELS, extractCourseItems } from './engine/extract.js';
import { buildLesson, LESSON_MIN } from './engine/lesson.js';
import { OWN_MAX, ownSentenceItems, ownSentencePairs } from './engine/ownSentences.js';
import { pictureWordsFor } from './engine/pictures.js';
import { loadWordsForLessons } from '../vocabulary/lessonWords.js';

const COURSE_OF_STEP = { A2: 'a2', B1: 'b1', B2: 'b2', C1: 'c1' };

// the practice course of a card: the level he is working towards (B1 course = A2 → B1, owner 2026-11-02); Estonian only
export function practiceCourseFor(student) {
  if (!student) return '';
  if (/inglise|english/i.test(mainSubject(student) || student.subject || '')) return '';
  const path = coursePath(student.level, student.targetLevel);
  if (!path.known) return '';
  return COURSE_OF_STEP[path.reached ? path.from : path.step] || '';
}

// his current module: the module of the newest lesson held with the teacher that the course has, else the first module
export function currentModule(items = [], lessons = []) {
  const byLesson = new Map(items.map((item) => [item.lessonId, item]));
  const held = [...lessons]
    .filter((lesson) => lesson?.topicLessonId && (!lesson.status || lesson.status === 'Toimunud'))
    .sort((a, b) => String(b.date || '').localeCompare(String(a.date || '')))
    .find((lesson) => byLesson.has(lesson.topicLessonId));
  if (held) return byLesson.get(held.topicLessonId).moduleId;
  const first = items.filter((item) => !item.supplement).sort((a, b) => a.moduleIndex - b.moduleIndex)[0];
  return first?.moduleId || '';
}

// whether the step has something to do, without loading the course: a course for his level, or own sentences
export function sentencesAvailable({ student, words = [], stats = [] }) {
  return { available: Boolean(practiceCourseFor(student)), own: ownSentencePairs({ words, stats }).length };
}

// the Russian meaning of each picture word from the course lesson vocabulary (vocabulary/lessonWords) → { word: 'имя' }
export async function pictureMeanings(lessonIds = [], load = loadWordsForLessons) {
  const byLesson = await Promise.resolve().then(() => load([...new Set(lessonIds)])).catch(() => ({}));
  const out = {};
  Object.values(byLesson || {}).flat().forEach((entry) => { if (entry?.et && entry.ru && !out[entry.et]) out[entry.et] = entry.ru; });
  return out;
}

const SCENE_TYPES = new Set(['build', 'transform', 'form', 'connector']);
// the lesson's own scene picture (worksheet-generator/art/textbookArt.js) above its sentence items; loaded with the lesson
export async function withScenes(items, load = () => import('../worksheet-generator/art/textbookArt.js')) {
  if (!items.some((item) => SCENE_TYPES.has(item.type) && item.lessonId)) return items;
  try {
    const { visualsFor, visualSrc } = await load();
    return items.map((item) => {
      if (!SCENE_TYPES.has(item.type) || !item.lessonId) return item;
      const visual = visualsFor(item.lessonId, item.phase).find((v) => v.format !== 'opener') || visualsFor(item.lessonId).find((v) => v.format !== 'opener');
      return visual ? { ...item, scene: { src: visualSrc(visual), alt: visual.alt || visual.caption || '' } } : item;
    });
  } catch {
    return items; // no pictures: the sentences still work
  }
}

/**
 * → { items, own, course, moduleId, pictures } — own sentences first (at most OWN_MAX), then a course lesson of LESSON_MIN items.
 * `loaders`: worksheet-generator/admin/course/courseLoaders.js COURSE_LOADERS (injected in tests). Picture items come
 * from his own words that have a word picture and the picture words of his current module (engine/pictures.js).
 */
export async function loadStudentPractice({ student, lessons = [], words = [], stats = [], loaders, seed = 'tana', canListen = false, loadMeanings, loadScenes }) {
  const own = ownSentenceItems(ownSentencePairs({ words, stats }), { max: OWN_MAX, seed });
  const course = practiceCourseFor(student);
  let lessonItems = [];
  let moduleId = '';
  if (course && loaders?.[course]) {
    try {
      const file = await loaders[course]();
      const pool = extractCourseItems(course, file.MODULES);
      moduleId = currentModule(pool, lessons);
      const moduleLessons = [...new Set(pool.filter((item) => item.moduleId === moduleId).map((item) => item.lessonId))];
      const pictures = await picturesFor(words, moduleLessons, loadMeanings);
      lessonItems = buildLesson({ pool, level: COURSE_LEVELS[course], moduleId, size: LESSON_MIN + (pictures.length ? 2 : 0), canListen, pictures, seed }).items;
      lessonItems = await withScenes(lessonItems, loadScenes);
    } catch {
      lessonItems = []; // the course did not load: his own sentences still make a lesson
    }
  }
  if (!lessonItems.length) {
    // no course lesson: his own words that have a picture still make picture items
    const pictures = await picturesFor(words, [], loadMeanings);
    if (pictures.length) lessonItems = buildLesson({ pool: [], pictures, canListen, seed }).items;
  }
  return { items: [...own, ...lessonItems], own: own.length, course, moduleId, pictures: lessonItems.filter((item) => item.type === 'picture' || item.type === 'hear').length };
}

async function picturesFor(words, lessonIds, loadMeanings) {
  const found = pictureWordsFor({ words, lessonIds });
  if (!found.length) return [];
  const meanings = await pictureMeanings(found.flatMap((entry) => entry.lessonIds), loadMeanings);
  return pictureWordsFor({ words, lessonIds, meanings });
}
