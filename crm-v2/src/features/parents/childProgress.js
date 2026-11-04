// „Areng” for the family (owner 2026-11-04: „график / кривая развития ребёнка”): monthly points of what the child did,
// from the records the parent already reads (rules unchanged) — never an invented number. Pure: the page passes what it
// read. Months are Tallinn calendar months, whatever the browser's time zone.
//   lessons  — journal rows marked held („Toimunud”, or no mark yet = held, as „Viimased tunnid” shows them)
//   homework — tasks with a deadline in the month (and the deadline passed): share done by the end of the deadline day
//   words    — the child's own dictionary („Minu sõnad”, not the „Sinu lause” error cards), total at the month's end
//   oskan    — the lessons' „Ma oskan …” steps whose auto-checked result up to the month's end is ≥ 80 % (monthSteps.js)
import { goalEntries } from '../worksheet-studio/engine/goals.js';
import { TASK_STATE, isTeacherGoal } from '../homework/taskList.js';
import { MASTERED, PRACTISE } from '../learner/monthSteps.js';

export const TIME_ZONE = 'Europe/Tallinn';
const SENTENCE = 'Sinu lause:';
const MISSED = new Set(['Puudus_p', 'Puudus_eta']);
const clean = (value) => String(value ?? '').replace(/\s+/g, ' ').trim();

const dayFormat = new Intl.DateTimeFormat('en-CA', { timeZone: TIME_ZONE, year: 'numeric', month: '2-digit', day: '2-digit' });

// any stored moment (ISO date, ISO time, Firestore Timestamp, Date, ms) → its Tallinn day 'YYYY-MM-DD', or ''
export function tallinnDay(value) {
  if (value === null || value === undefined || value === '') return '';
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value.trim())) return value.trim();
  let ms = NaN;
  if (typeof value?.toMillis === 'function') ms = value.toMillis();
  else if (typeof value?.toDate === 'function') ms = value.toDate().getTime();
  else if (value instanceof Date) ms = value.getTime();
  else if (typeof value === 'number') ms = value;
  else if (typeof value?.seconds === 'number') ms = value.seconds * 1000;
  else ms = Date.parse(String(value));
  if (!Number.isFinite(ms)) return '';
  const parts = Object.fromEntries(dayFormat.formatToParts(new Date(ms)).map((part) => [part.type, part.value]));
  return `${parts.year}-${parts.month}-${parts.day}`;
}

export const tallinnMonth = (value) => tallinnDay(value).slice(0, 7);

// the last `count` months up to the month of `today` (YYYY-MM-DD), oldest first
export function lastMonths(today, count = 6) {
  const [year, month] = String(today).slice(0, 7).split('-').map(Number);
  return Array.from({ length: count }, (_, index) => {
    const date = new Date(Date.UTC(year, month - 1 - (count - 1 - index), 1));
    return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`;
  });
}

const MONTH_NAMES = ['jaan', 'veebr', 'märts', 'apr', 'mai', 'juuni', 'juuli', 'aug', 'sept', 'okt', 'nov', 'dets'];
export const monthLabel = (month) => MONTH_NAMES[Number(String(month).slice(5, 7)) - 1] || month;

// the „Ma oskan …” step results of the auto-checked sheets, each with its Tallinn day (same keys as monthSteps.js)
function goalResults(assignments = []) {
  const results = [];
  assignments.forEach((item) => {
    const goals = item?.worksheetDoc?.meta?.goals;
    if (!goals || item.status !== 'done') return;
    const day = tallinnDay(item.completedAt);
    if (!day) return;
    const lesson = clean(item.lessonTitle || item.worksheetDoc.meta.title || item.title) || 'Tund';
    const canDo = clean(item.worksheetDoc.meta.canDo);
    const perGoal = item.score?.perGoal || {};
    goalEntries(goals).forEach(([id, label]) => {
      const text = isTeacherGoal(label) ? (isTeacherGoal(canDo) ? '' : canDo) : clean(label);
      const result = perGoal[id];
      if (!text || !result?.total) return;
      results.push({ key: `${lesson}|${text}`, day, ok: Number(result.ok) || 0, total: Number(result.total) || 0 });
    });
  });
  return results;
}

function masteredBy(results, lastDay) {
  const pooled = new Map();
  results.filter((result) => result.day <= lastDay).forEach((result) => {
    const sum = pooled.get(result.key) || { ok: 0, total: 0 };
    pooled.set(result.key, { ok: sum.ok + result.ok, total: sum.total + result.total });
  });
  return [...pooled.values()].filter((sum) => sum.total && (sum.ok / sum.total) * 100 >= MASTERED).length;
}

const monthEnd = (month) => `${month}-31`; // string compare: every day of the month is ≤ „-31”

/**
 * Monthly points for one child. `tasks` = mergeTasks(...) rows; `words` = studentWords docs; `assignments` =
 * worksheetAssignments (with worksheetDoc + score.perGoal). Returns the months from the first month with any data
 * (at most `months` back) to the current month, and which series have any data at all (a series without data is left
 * out, never drawn as zeros).
 */
export function childProgress({ lessons = [], tasks = [], words = [], assignments = [], today, months = 6 } = {}) {
  const range = lastMonths(today, months);
  const first = range[0];
  const points = range.map((month) => ({ month, label: monthLabel(month), lessons: 0, missed: 0, homeworkDue: 0, homeworkOnTime: 0, homeworkPct: null, words: null, oskan: null }));
  const byMonth = new Map(points.map((point) => [point.month, point]));

  lessons.forEach((lesson) => {
    const day = tallinnDay(lesson.date);
    if (!day || day > today) return;
    const point = byMonth.get(day.slice(0, 7));
    if (!point) return;
    if (!lesson.status || lesson.status === 'Toimunud') point.lessons += 1;
    else if (MISSED.has(lesson.status)) point.missed += 1;
  });

  tasks.forEach((task) => {
    const due = tallinnDay(task.due);
    if (!due || due >= today) return; // the deadline day must be over
    const point = byMonth.get(due.slice(0, 7));
    if (!point) return;
    point.homeworkDue += 1;
    const doneDay = task.state !== TASK_STATE.TODO ? tallinnDay(task.doneAt) : '';
    if (doneDay && doneDay <= due) point.homeworkOnTime += 1;
  });
  points.forEach((point) => { if (point.homeworkDue) point.homeworkPct = Math.round((point.homeworkOnTime / point.homeworkDue) * 100); });

  const plainWords = words.filter((word) => !String(word.translation || '').startsWith(SENTENCE)).map((word) => tallinnDay(word.createdAt)).filter(Boolean);
  const hasWords = plainWords.length > 0;
  const goals = goalResults(assignments);
  const hasGoals = goals.length > 0;
  points.forEach((point) => {
    const end = point.month === today.slice(0, 7) ? today : monthEnd(point.month);
    if (hasWords) point.words = plainWords.filter((day) => day <= end).length;
    if (hasGoals) point.oskan = masteredBy(goals, end);
  });

  // a month counts as „with data” when something happened in it (a cumulative total alone does not make one)
  const active = (point) => point.lessons || point.missed || point.homeworkDue
    || plainWords.some((day) => day.slice(0, 7) === point.month) || goals.some((goal) => goal.day.slice(0, 7) === point.month);
  const firstActive = points.findIndex(active);
  const shown = firstActive < 0 ? [] : points.slice(firstActive);
  return {
    points: shown,
    from: firstActive < 0 ? '' : shown[0].month,
    windowStart: first,
    series: {
      lessons: shown.some((point) => point.lessons || point.missed),
      homework: shown.some((point) => point.homeworkPct !== null),
      words: hasWords && shown.length > 0,
      oskan: hasGoals && shown.length > 0,
    },
  };
}

// „Mida õpime praegu”: the latest held lesson's module, the topics of the last 30 days, the month's steps as traffic lights
export const STEP_LIGHT = Object.freeze({
  mastered: { label: 'Oskan', ru: 'умею', tone: 'good' },
  practise: { label: 'Harjutan', ru: 'тренирую', tone: 'warn' },
  review: { label: 'Kordame', ru: 'повторяем', tone: 'review' },
  todo: { label: 'Veel tegemata', ru: 'ещё не делали', tone: 'todo' },
});
export const stepLight = (pct) => (pct === null || pct === undefined ? 'todo' : pct >= MASTERED ? 'mastered' : pct >= PRACTISE ? 'practise' : 'review');

const GENERIC_TOPIC = /^individuaalne tund$/i;

export function nowLearning({ lessons = [], today, days = 30 } = {}) {
  const from = (() => { const date = new Date(`${today}T12:00:00Z`); date.setUTCDate(date.getUTCDate() - days); return date.toISOString().slice(0, 10); })();
  const held = lessons
    .filter((lesson) => (!lesson.status || lesson.status === 'Toimunud') && tallinnDay(lesson.date) && tallinnDay(lesson.date) <= today)
    .sort((a, b) => `${b.date} ${b.time || ''}`.localeCompare(`${a.date} ${a.time || ''}`));
  const withModule = held.find((lesson) => clean(lesson.topicModule));
  const topics = [...new Set(held.filter((lesson) => tallinnDay(lesson.date) >= from).map((lesson) => clean(lesson.topic)).filter((topic) => topic && !GENERIC_TOPIC.test(topic)))];
  return {
    module: withModule ? clean(withModule.topicModule) : '',
    level: withModule ? clean(withModule.topicLevel) : '',
    topics,
    lessonsInMonth: held.filter((lesson) => tallinnDay(lesson.date) >= from).length,
  };
}
