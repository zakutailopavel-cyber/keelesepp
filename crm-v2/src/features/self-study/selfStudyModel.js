import { coursePath, courseKeyFor } from '../students/levelProgress.js';
import { mainSubject, tracksOf } from '../students/subjects.js';

// „Õpi ise” (owner 2026-10-12): the course on one's own. Progress of a lesson = its three sheets (Avasta, Harjuta,
// Kasuta) from the student's worksheet assignments (self-study or given by the teacher), whatever the source.
export const PHASES = [
  { key: 'discover', label: 'Avasta' },
  { key: 'practice', label: 'Harjuta' },
  { key: 'transfer', label: 'Kasuta' },
];

const phaseOf = (assignment) => assignment.phase || assignment.worksheetDoc?.meta?.phase || '';
const pct = (assignment) => {
  const score = assignment.score;
  if (score && Number.isFinite(score.pct)) return score.pct;
  if (score && score.total) return Math.round((score.correct / score.total) * 100);
  return null;
};

// { `${lessonId}|${phase}`: { status: 'done' | 'started', pct, assignment } } — a done sheet wins over an open one
export function progressMap(assignments = []) {
  const map = {};
  for (const assignment of assignments) {
    const phase = phaseOf(assignment);
    if (!assignment.lessonId || !phase) continue;
    const key = `${assignment.lessonId}|${phase}`;
    const done = assignment.status === 'done' || Boolean(assignment.completedAt);
    const entry = { status: done ? 'done' : 'started', pct: done ? pct(assignment) : null, assignment };
    if (!map[key] || (done && map[key].status !== 'done')) map[key] = entry;
  }
  return map;
}

export function lessonProgress(lessonId, map) {
  const phases = PHASES.map((phase) => ({ ...phase, ...(map[`${lessonId}|${phase.key}`] || { status: 'none', pct: null }) }));
  return { phases, done: phases.filter((phase) => phase.status === 'done').length };
}

// where to go on: the first lesson of the level that was started but is not finished, else the first untouched one
export function nextLesson(lessons = [], map = {}) {
  const started = lessons.find((lesson) => { const p = lessonProgress(lesson.id, map); return p.done < 3 && p.phases.some((ph) => ph.status !== 'none'); });
  return started || lessons.find((lesson) => lessonProgress(lesson.id, map).phases.every((ph) => ph.status === 'none')) || null;
}

// a course lesson held with the teacher (Live Classroom, the calendar topic) counts as done like its three sheets
export const heldCourseLessons = (lessons = []) => new Set(lessons.filter((lesson) => lesson.topicLessonId && (!lesson.status || lesson.status === 'Toimunud')).map((lesson) => lesson.topicLessonId));

const CHILDREN_COURSE = /^(Eelkool|Kooliks valmis|\d+\.–\d+\. klass)/;
const gradeOf = (student) => Number(String(student?.grade || '').match(/\d+/)?.[0]) || 0;

/**
 * Which courses a card is offered in „Minu kursus” and which opens: its way from level to target (the same `step` as
 * „Minu areng”), a course named by its own level („Eelkool”, „9. klass”), and any course he already has work in.
 * A card with no matching course sees all but the children's courses, which a pupil above grade 3 is not offered.
 * → { offered: catalogue levels, current: the one to open }
 */
export function courseChoice(student, levels = [], touchedLessonIds = new Set()) {
  if (!student) return { offered: levels, current: levels[0] || null };
  const main = mainSubject(student);
  const path = coursePath(student.level, student.targetLevel);
  // no language level on the card („Eelkool”, „9. klass”, empty): no way to walk, only what the card names
  const wanted = new Set(path.known ? path.levels.map((level) => courseKeyFor(level, main)) : []);
  tracksOf(student).forEach((track) => {
    const own = coursePath(track.level, '');
    if (track.subject !== main && own.known) own.levels.forEach((level) => wanted.add(courseKeyFor(level, track.subject)));
  });
  const named = [student.level, ...tracksOf(student).map((track) => track.level)].map((value) => String(value || '').trim()).filter(Boolean);
  const isOwn = (entry) => wanted.has(entry.key) || named.some((name) => entry.key === name || entry.key.startsWith(`${name} `))
    || entry.modules?.some((module) => module.lessons.some((lesson) => touchedLessonIds.has(lesson.id)));
  const own = levels.filter(isOwn);
  const grade = gradeOf(student);
  const offered = own.length ? own : levels.filter((entry) => !(grade > 3 && CHILDREN_COURSE.test(entry.key)));
  const current = (path.known ? offered.find((entry) => entry.key === courseKeyFor(path.step, main)) : null)
    || offered.find((entry) => named.some((name) => entry.key === name || entry.key.startsWith(`${name} `)))
    || offered[0] || null;
  return { offered, current };
}
