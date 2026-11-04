// „Mida õpime praegu” on „Minu pere” (owner 2026-11-04): the latest held lesson's module, the lesson topics of the last
// 30 days, and the month's „Ma oskan …” steps as traffic lights (states from monthSteps.js). Pure; Tallinn days.
import { MASTERED, PRACTISE } from '../learner/monthSteps.js';
import { isTeacherGoal } from '../homework/taskList.js';
import { goalEntries } from '../worksheet-studio/engine/goals.js';

export const TIME_ZONE = 'Europe/Tallinn';
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

export const STEP_LIGHT = Object.freeze({
  mastered: { label: 'Oskan', ru: 'умею', tone: 'good' },
  practise: { label: 'Harjutan', ru: 'тренирую', tone: 'warn' },
  review: { label: 'Kordame', ru: 'повторяем', tone: 'review' },
  todo: { label: 'Veel tegemata', ru: 'ещё не делали', tone: 'todo' },
});
export const stepLight = (pct) => (pct === null || pct === undefined ? 'todo' : pct >= MASTERED ? 'mastered' : pct >= PRACTISE ? 'practise' : 'review');

// One meaning of „Oskan” on the family's page (owner 2026-11-04): the level curve's rule (progress-points/levelCurve.js)
// — ≥ 2 sheets scored the goal automatically and together ≥ 70 % right. Harjutan: a result, not yet Oskan, ≥ 50 %
// (or ≥ 70 % from one sheet only); Kordame: under 50 %; Veel tegemata: no result yet. The month = the lessons of the
// sheets of the last 30 days (as „Kuu sammud”), the results of those lessons' goals from all their sheets.
export const OSKAN_PCT = 70;
export const OSKAN_SHEETS = 2;
const time = (value) => (typeof value?.toMillis === 'function' ? value.toMillis() : Date.parse(value || '') || 0);

export function goalLight({ ok = 0, total = 0, sheets = 0 }) {
  if (!total) return 'todo';
  const pct = (ok / total) * 100;
  if (sheets >= OSKAN_SHEETS && pct >= OSKAN_PCT) return 'mastered';
  return pct >= PRACTISE ? 'practise' : 'review';
}

export function monthGoalSteps(assignments = [], { now = Date.now(), days = 30 } = {}) {
  const from = now - days * 86400000;
  const lessonOf = (item) => clean(item.lessonTitle || item.worksheetDoc?.meta?.title || item.title) || 'Tund';
  const withGoals = assignments.filter((item) => item?.worksheetDoc?.meta?.goals);
  const recentLessons = new Set(withGoals.filter((item) => time(item.completedAt || item.assignedAt) >= from).map(lessonOf));
  const steps = new Map();
  const counted = new Map();
  withGoals
    .filter((item) => recentLessons.has(lessonOf(item)))
    .sort((a, b) => time(a.completedAt || a.assignedAt) - time(b.completedAt || b.assignedAt))
    .forEach((item) => {
      const lesson = lessonOf(item);
      const perGoal = item.status === 'done' ? item.score?.perGoal || {} : {};
      const canDo = clean(item.worksheetDoc.meta.canDo);
      // a teacher's goal („Õpilane …”) reads as the lesson's own promise (canDo); with no promise it is left out
      goalEntries(item.worksheetDoc.meta.goals).forEach(([id, label]) => {
        const text = isTeacherGoal(label) ? (isTeacherGoal(canDo) ? '' : canDo) : clean(label);
        if (!text) return;
        const key = `${lesson}|${text}`;
        const step = steps.get(key) || { key, lesson, goal: text, ok: 0, total: 0, sheets: 0 };
        const result = perGoal[id];
        if (result?.total) {
          step.ok += Number(result.ok) || 0;
          step.total += Number(result.total) || 0;
          // one sheet counts once for a step, even when several of its goals read as the same promise
          const seen = counted.get(key) || new Set(); if (!seen.has(item.id)) { seen.add(item.id); counted.set(key, seen); step.sheets += 1; }
        }
        steps.set(key, step);
      });
    });
  const list = [...steps.values()].map((step) => ({ ...step, state: goalLight(step) }));
  const count = (state) => list.filter((step) => step.state === state).length;
  return { steps: list, total: list.length, mastered: count('mastered'), practise: count('practise'), review: count('review'), todo: count('todo') };
}

const GENERIC_TOPIC = /^individuaalne tund$/i;

export function nowLearning({ lessons = [], today, days = 30 } = {}) {
  const date = new Date(`${today}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate() - days);
  const from = date.toISOString().slice(0, 10);
  const held = lessons
    .map((lesson) => ({ lesson, day: tallinnDay(lesson.date) }))
    .filter(({ lesson, day }) => (!lesson.status || lesson.status === 'Toimunud') && day && day <= today)
    .sort((a, b) => `${b.day} ${b.lesson.time || ''}`.localeCompare(`${a.day} ${a.lesson.time || ''}`));
  const withModule = held.find(({ lesson }) => clean(lesson.topicModule));
  const recent = held.filter(({ day }) => day >= from);
  return {
    module: withModule ? clean(withModule.lesson.topicModule) : '',
    level: withModule ? clean(withModule.lesson.topicLevel) : '',
    topics: [...new Set(recent.map(({ lesson }) => clean(lesson.topic)).filter((topic) => topic && !GENERIC_TOPIC.test(topic)))],
    lessonsInMonth: recent.length,
  };
}
