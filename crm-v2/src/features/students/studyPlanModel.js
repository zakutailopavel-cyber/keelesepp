// „Õppeplaan” on the student card (owner 2026-10-27: „учебный план в карточке ученика, выбирать для каждого
// индивидуально и подбирать те уроки, которые будут максимально эффективны”). Pure: the student's results per course
// lesson (sheets and held lessons), the lessons we recommend next with the reason, an automatic plan and the plan rows.
// Stored on the student card as `studyPlan`: { level, goal, targetDate, lessons: [{ id, status: 'planned' | 'skipped' }],
// updatedAt, updatedByName }.

export const MASTERED = 85; // a lesson learned this well is not planned again
export const REPEAT = 60; // below this a lesson is worth repeating

const pctOf = (assignment) => {
  const score = assignment?.score;
  if (!score) return null;
  if (Number.isFinite(Number(score.pct))) return Number(score.pct);
  return score.total ? Math.round((Number(score.correct) / Number(score.total)) * 100) : null;
};

// lessonId → { pct (average of the lesson's done sheets), sheets, held (a lesson in the calendar journal), last }
export function lessonResults({ assignments = [], records = [] } = {}) {
  const out = new Map();
  const entry = (id) => { if (!out.has(id)) out.set(id, { pcts: [], sheets: 0, held: false, last: '' }); return out.get(id); };
  assignments.filter((item) => item.lessonId && item.status === 'done').forEach((item) => {
    const row = entry(item.lessonId);
    row.sheets += 1;
    const pct = pctOf(item);
    if (pct !== null) row.pcts.push(pct);
    const when = String(item.completedAt || item.assignedAt || '').slice(0, 10);
    if (when > row.last) row.last = when;
  });
  records.filter((record) => record.topicLessonId && (!record.status || record.status === 'Toimunud')).forEach((record) => {
    const row = entry(record.topicLessonId);
    row.held = true;
    if (String(record.date || '') > row.last) row.last = String(record.date);
  });
  return new Map([...out].map(([id, row]) => [id, { pct: row.pcts.length ? Math.round(row.pcts.reduce((a, b) => a + b, 0) / row.pcts.length) : null, sheets: row.sheets, held: row.held, last: row.last }]));
}

const courseLessons = (catalog, level) => (catalog?.levels.find((entry) => entry.key === level)?.modules || []).flatMap((module) => module.lessons);

// what a lesson is for this student: done well, to repeat, held without a result, or new
export function lessonState(result) {
  if (!result) return 'new';
  if (result.pct !== null && result.pct >= MASTERED) return 'mastered';
  if (result.pct !== null && result.pct < REPEAT) return 'repeat';
  return result.pct !== null || result.held ? 'done' : 'new';
}

/**
 * The lessons that help this student most next, best first:
 * 1) lessons of the course already worked on but below 60 % (repeat — the weakest first);
 * 2) the next lessons of the course in order that the student has not done yet.
 * Lessons already in the plan and lessons learned well (≥ 85 %) are left out.
 * → [{ lesson, kind: 'repeat' | 'next', reason }]
 */
export function recommendLessons({ catalog, level, plan = null, results = new Map(), limit = 6 } = {}) {
  const list = courseLessons(catalog, level);
  const inPlan = new Set((plan?.lessons || []).map((item) => item.id));
  const repeats = list.filter((lesson) => !inPlan.has(lesson.id) && lessonState(results.get(lesson.id)) === 'repeat')
    .sort((a, b) => results.get(a.id).pct - results.get(b.id).pct)
    .map((lesson) => ({ lesson, kind: 'repeat', reason: `Korda: tulemus ${results.get(lesson.id).pct}%` }));
  const next = list.filter((lesson) => !inPlan.has(lesson.id) && lessonState(results.get(lesson.id)) === 'new')
    .map((lesson) => ({ lesson, kind: 'next', reason: `Järgmine kursusel · ${lesson.moduleTitle}` }));
  return [...repeats.slice(0, 2), ...next, ...repeats.slice(2)].slice(0, limit);
}

// „Koosta plaan”: up to two repeats first, then the course in order without the lessons learned well
export function autoPlan({ catalog, level, results = new Map(), count = 12 } = {}) {
  return recommendLessons({ catalog, level, results, limit: count }).map((item) => ({ id: item.lesson.id, status: 'planned' }));
}

// the plan as rows for the card, with each lesson's result
export function planRows({ plan = null, catalog, results = new Map() } = {}) {
  return (plan?.lessons || []).map((item) => {
    const lesson = catalog?.byId.get(item.id) || null;
    const result = results.get(item.id) || null;
    return { ...item, lesson, result, state: item.status === 'skipped' ? 'skipped' : lessonState(result) };
  });
}

// the first planned lesson the student has not done yet (the calendar suggests it as the next topic)
export function nextPlannedLesson({ plan = null, catalog, results = new Map() } = {}) {
  const row = planRows({ plan, catalog, results }).find((item) => item.lesson && item.status === 'planned' && ['new', 'repeat'].includes(item.state));
  return row?.lesson || null;
}

export const movePlanLesson = (lessons = [], id, delta) => {
  const index = lessons.findIndex((item) => item.id === id);
  const target = index + delta;
  if (index < 0 || target < 0 || target >= lessons.length) return lessons;
  const copy = [...lessons];
  [copy[index], copy[target]] = [copy[target], copy[index]];
  return copy;
};

const DAY_MS = 24 * 60 * 60 * 1000;
const MAX_WEEKLY = 5;

// lessons of the plan the student has done (sheets with a result or a held lesson)
export const planDoneIds = (results = new Map()) => new Set([...results].filter(([, result]) => ['mastered', 'done', 'repeat'].includes(lessonState(result)) && (result.held || result.pct !== null)).map(([id]) => id));

// the weekly lessons a student has ahead now: his active weekly series in the calendar
export function weeklyLessonsNow(schedule = [], today) {
  return schedule.filter((event) => event.recurring && event.status !== 'Tühistatud' && (!event.endDate || event.endDate >= today) && !event.isGroup).length;
}

/**
 * The plan's pace (owner 2026-10-27: plans and the planner together): lessons left, weeks to the target date, the
 * lessons a week needed and whether the timetable keeps up.
 * → null without a plan or a target date, else { remaining, weeks, needed, weeklyNow, status: 'ok' | 'behind' | 'done' }
 */
export function planPace({ plan = null, doneIds = new Set(), today, weeklyNow = 0 } = {}) {
  if (!plan?.lessons?.length || !/^\d{4}-\d{2}-\d{2}$/.test(plan.targetDate || '')) return null;
  const remaining = plan.lessons.filter((item) => item.status !== 'skipped' && !doneIds.has(item.id)).length;
  const days = (Date.parse(`${plan.targetDate}T12:00:00`) - Date.parse(`${today}T12:00:00`)) / DAY_MS;
  const weeks = Math.max(1, Math.ceil(days / 7));
  const needed = remaining ? Math.min(MAX_WEEKLY, Math.ceil(remaining / weeks)) : 0;
  return { remaining, weeks, needed, weeklyNow, status: !remaining ? 'done' : weeklyNow >= needed ? 'ok' : 'behind' };
}
