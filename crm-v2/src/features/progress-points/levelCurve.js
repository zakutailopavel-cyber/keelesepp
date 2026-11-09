// „Keeleoskus” = level % from the coursework (owner 2026-11-04; formula in docs/PROGRESS_ESTIMATE.md „Level curve”).
// Pure: the caller passes the learner's worksheetAssignments, the course's goal list and the stored progressPoints.
//
//  • Course = the course that leads to the target level (B1 → the a2b1 course, its lessonGoals.js). Its goals are every
//    lesson's sub-goals (`lessonId|g_read`, …).
//  • A goal is „Oskan” on a day when, up to that day, ≥ 2 submitted sheets of that lesson scored it automatically
//    (`score.perGoal[goal].total > 0`) and together they have ≥ 70 % right (READY in students/levelProgress.js).
//  • Without a starting point: level % = Oskan goals / all course goals.
//  • Anchor = a measured point of kind 'teacher' („Algus”, a correction) or 'estimate' (the admin's saved skill
//    estimate). From the newest anchor A on or before the day: level % = A % + (100 − A %) × (Oskan goals now − Oskan
//    goals on A's day) / (all goals − Oskan goals on A's day). So the start counts what he already knew; only new
//    coursework moves the curve, never past 100 %.
//  • A mock exam ('exam') is a marker only: it never moves the curve (it confirms it).
import { READY } from '../students/levelProgress.js';
import { tallinnDay } from '../parents/nowLearning.js';

export const MIN_SHEETS = 2;
export const GOAL_READY = READY; // 70 %
export const EXAM_GAP_WARNING = 15; // admin warning when a mock exam differs from the curve by more
const PHASE_ID = /^ws_(.+)_(discover|practice|transfer)$/;
const ANCHOR_KINDS = new Set(['teacher', 'estimate']);

// the course's goals as keys `lessonId|goalId`
export function courseGoalKeys(lessonGoals = {}) {
  const keys = [];
  Object.entries(lessonGoals).forEach(([lessonId, lesson]) => Object.keys(lesson?.goals || {}).forEach((goal) => keys.push(`${lessonId}|${goal}`)));
  return keys;
}

// which course lesson a sheet belongs to: the course sheet's own id `ws_<lessonId>_<phase>`, else the stored lessonId
export function courseLessonIdOf(assignment = {}) {
  const match = PHASE_ID.exec(String(assignment.worksheetDoc?.id || ''));
  return match ? match[1] : String(assignment.courseLessonId || assignment.lessonId || '');
}

// each automatic goal result of a submitted course sheet, with its Tallinn day
export function goalResults(assignments = [], keys = new Set()) {
  const results = [];
  assignments.forEach((item) => {
    if (item?.status !== 'done' && !item?.completedAt) return;
    const day = tallinnDay(item.completedAt);
    const lessonId = courseLessonIdOf(item);
    if (!day || !lessonId) return;
    Object.entries(item.score?.perGoal || {}).forEach(([goal, result]) => {
      const key = `${lessonId}|${goal}`;
      if (!keys.has(key) || !(Number(result?.total) > 0)) return;
      results.push({ key, day, ok: Number(result.ok) || 0, total: Number(result.total) });
    });
  });
  return results.sort((a, b) => a.day.localeCompare(b.day));
}

// how many course goals are „Oskan” at the end of `day`
export function masteredOn(results, day) {
  const pooled = new Map();
  results.forEach((result) => {
    if (result.day > day) return;
    const sum = pooled.get(result.key) || { ok: 0, total: 0, sheets: 0 };
    pooled.set(result.key, { ok: sum.ok + result.ok, total: sum.total + result.total, sheets: sum.sheets + 1 });
  });
  let count = 0;
  pooled.forEach((sum) => { if (sum.sheets >= MIN_SHEETS && (sum.ok / sum.total) * 100 >= GOAL_READY) count += 1; });
  return count;
}

const addDays = (day, days) => { const date = new Date(`${day}T12:00:00Z`); date.setUTCDate(date.getUTCDate() + days); return date.toISOString().slice(0, 10); };

/**
 * Weekly points of the level curve for one level. `points` = progressPoints (any kinds; only anchors of this level are
 * used), `goalKeys` = courseGoalKeys(...). Returns { total, line: [{ date, percent, kind: 'computed' | anchor kind,
 * anchor?, mastered }], exams, anchors } — the first point is the first anchor or the first counted sheet; nothing
 * before it, nothing invented.
 */
export function levelCurve({ assignments = [], goalKeys = [], points = [], level = '', today } = {}) {
  const keys = new Set(goalKeys);
  const total = keys.size;
  const ofLevel = points.filter((point) => point && point.level === level && point.date && Number.isFinite(point.percent));
  const anchors = ofLevel.filter((point) => ANCHOR_KINDS.has(point.kind) && point.date <= today).sort((a, b) => a.date.localeCompare(b.date) || String(a.createdAt || '').localeCompare(String(b.createdAt || '')));
  const exams = ofLevel.filter((point) => point.kind === 'exam').sort((a, b) => a.date.localeCompare(b.date));
  const results = total ? goalResults(assignments, keys) : [];
  const start = [anchors[0]?.date, results[0]?.day].filter(Boolean).sort()[0];
  if (!start || (!total && !anchors.length)) return { total, line: [], exams, anchors };

  // sample days: the anchors' days, every 7 days from the start, and today
  const days = new Set(anchors.map((anchor) => anchor.date));
  for (let day = start; day <= today; day = addDays(day, 7)) days.add(day);
  days.add(today);
  const line = [...days].filter((day) => day >= start && day <= today).sort().map((day) => {
    const anchor = anchors.filter((item) => item.date <= day).at(-1) || null;
    const mastered = masteredOn(results, day);
    let percent;
    if (anchor) {
      const before = masteredOn(results, anchor.date);
      const rest = total - before;
      const gained = Math.max(0, mastered - before);
      percent = rest > 0 ? anchor.percent + (100 - anchor.percent) * (gained / rest) : anchor.percent;
    } else {
      percent = total ? (mastered / total) * 100 : 0;
    }
    const isAnchorDay = anchor && anchor.date === day;
    return { date: day, percent: Math.min(100, Math.round(percent)), kind: isAnchorDay ? anchor.kind : 'computed', ...(isAnchorDay ? { anchor } : {}), mastered };
  });
  return { total, line, exams, anchors };
}

// the curve's value on a day (the newest point on or before it), for comparing a mock exam
export const curveOn = (line, day) => line.filter((point) => point.date <= day).at(-1) || null;

// admin only: mock exams far from the curve (they confirm it; a big gap means the curve or the exam needs a look)
export function examGaps(curve) {
  return curve.exams.map((exam) => {
    const at = curveOn(curve.line, exam.date);
    return at ? { exam, curve: at.percent, gap: Math.round(exam.percent - at.percent) } : null;
  }).filter((item) => item && Math.abs(item.gap) > EXAM_GAP_WARNING);
}

// the course goal list of a target level, loaded only when needed (each file is ~90 kB)
const COURSE_GOALS = {
  A2: () => import('../worksheet-generator/admin/course/a2/lessonGoals.js').then((m) => m.A2_LESSON_GOALS),
  B1: () => import('../worksheet-generator/admin/course/b1/lessonGoals.js').then((m) => m.B1_LESSON_GOALS),
  B2: () => import('../worksheet-generator/admin/course/b2/lessonGoals.js').then((m) => m.B2_LESSON_GOALS),
  C1: () => import('../worksheet-generator/admin/course/c1/lessonGoals.js').then((m) => m.C1_LESSON_GOALS),
};
export async function loadCourseGoalKeys(level) {
  const load = COURSE_GOALS[level];
  return load ? courseGoalKeys(await load()) : [];
}

// the target level of a learner (one person may have several cards / enrollments): the Estonian track's target first
export function targetLevelOf(person = {}) {
  const tracks = person.enrollments || [];
  const estonian = tracks.find((item) => /eesti/i.test(item.subject || '') && item.targetLevel) || tracks.find((item) => item.targetLevel);
  return String(estonian?.targetLevel || person.targetLevel || '').toUpperCase();
}
