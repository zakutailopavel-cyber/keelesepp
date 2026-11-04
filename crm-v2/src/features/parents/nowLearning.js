// „Mida õpime praegu” on „Minu pere” (owner 2026-11-04): the latest held lesson's module, the lesson topics of the last
// 30 days, and the month's „Ma oskan …” steps as traffic lights (states from monthSteps.js). Pure; Tallinn days.
import { MASTERED, PRACTISE } from '../learner/monthSteps.js';

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
