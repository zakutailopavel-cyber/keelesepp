// „Täna” step „Laused ja grammatika” (owner 2026-11-09): one practice lesson for the student — course sentences and
// grammar of his level and current module (engine/, docs/PRACTICE_ENGINE.md) plus his own wrong sentences from both
// mistake sources (engine/ownSentences.js). The course file of his level loads only when the step starts.
import { coursePath } from '../students/levelProgress.js';
import { mainSubject } from '../students/subjects.js';
import { COURSE_LEVELS, extractCourseItems } from './engine/extract.js';
import { buildLesson, LESSON_MIN } from './engine/lesson.js';
import { OWN_MAX, ownSentenceItems, ownSentencePairs } from './engine/ownSentences.js';

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

/**
 * → { items, own, course, moduleId } — own sentences first (at most OWN_MAX), then a course lesson of LESSON_MIN items.
 * `loaders`: worksheet-generator/admin/course/courseLoaders.js COURSE_LOADERS (injected in tests).
 */
export async function loadStudentPractice({ student, lessons = [], words = [], stats = [], loaders, seed = 'tana', canListen = false }) {
  const own = ownSentenceItems(ownSentencePairs({ words, stats }), { max: OWN_MAX, seed });
  const course = practiceCourseFor(student);
  let lessonItems = [];
  let moduleId = '';
  if (course && loaders?.[course]) {
    try {
      const file = await loaders[course]();
      const pool = extractCourseItems(course, file.MODULES);
      moduleId = currentModule(pool, lessons);
      lessonItems = buildLesson({ pool, level: COURSE_LEVELS[course], moduleId, size: LESSON_MIN, canListen, seed }).items;
    } catch {
      lessonItems = []; // the course did not load: his own sentences still make a lesson
    }
  }
  return { items: [...own, ...lessonItems], own: own.length, course, moduleId };
}
