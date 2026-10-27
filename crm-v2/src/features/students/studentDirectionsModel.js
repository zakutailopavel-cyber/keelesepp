// The student card's „Õppesuunad” (owner 2026-10-24): which directions the learner attends — per direction the
// teacher, level, price and whether lessons are planned ahead (derived from the schedule, never stored).
import { occurrencesForDates, shiftDate } from '../calendar/calendarView.js';
import { findDirection } from './studyDirections.js';
import { itemSubject, mainSubject, subjectName } from './subjects.js';
import { localDate } from '../../utils/localDate.js';

const clean = (value) => String(value ?? '').trim();
const AHEAD_DAYS = 56;
const CLOSED = new Set(['Tühistatud', 'Toimunud', 'Puudus_eta', 'Puudus_p']);

// „Käib” / „Paus” / „Lõpetanud” as stored on a track; the old „Mitteaktiivne” (active: false) reads as „Lõpetanud”
export const TRACK_STATUSES = [{ value: 'active', label: 'Käib' }, { value: 'paused', label: 'Paus' }, { value: 'ended', label: 'Lõpetanud' }];
export const statusOf = (track = {}) => (track.status === 'paused' ? 'paused' : track.status === 'ended' || track.active === false ? 'ended' : 'active');
export const statusPatch = (value) => ({ status: value === 'active' ? '' : value, active: value !== 'ended' });

export const DIRECTION_STATES = {
  attending: { label: 'Käib', tone: 'success' },
  unplanned: { label: 'Tunde pole plaanis', tone: 'warning' },
  paused: { label: 'Paus', tone: 'neutral' },
  ended: { label: 'Lõpetanud', tone: 'neutral' },
};

// the stored status of a track: 'ended' (or the old active: false), 'paused', else active
export function trackStatus(track = {}) {
  if (track.status === 'ended' || (track.active === false && track.status !== 'paused')) return 'ended';
  if (track.status === 'paused') return 'paused';
  return 'active';
}

// the price of one subject of the card: its own (subjectPrices), the card's (main subject), or the card's as fallback
export function subjectPrice(plan, subject, student) {
  if (!plan || plan.active === false) return { kind: 'none' };
  const own = plan.subjectPrices?.[subject];
  if (own?.lessonPriceCents) return { kind: 'own', cents: own.lessonPriceCents, minutes: own.lessonMinutes || 60 };
  if (!plan.lessonPriceCents) return { kind: 'none' };
  return { kind: subject === mainSubject(student) ? 'card' : 'same', cents: plan.lessonPriceCents, minutes: plan.lessonMinutes || 60 };
}

export function priceLabel(price) {
  const euro = (cents) => `${(cents / 100).toFixed(2).replace('.', ',')} €`;
  if (!price || price.kind === 'none') return 'hind määramata';
  if (price.kind === 'same') return `${euro(price.cents)} / ${price.minutes} min (kaardi hind)`;
  return `${euro(price.cents)} / ${price.minutes} min`;
}

export function directionRows({ student = {}, schedule = [], lessons = [], plan = null, directions = [], today = localDate() } = {}) {
  const tracks = Array.isArray(student.enrollments) && student.enrollments.length ? student.enrollments : [student];
  const dates = Array.from({ length: AHEAD_DAYS }, (_, index) => shiftDate(today, index));
  const ahead = [
    ...occurrencesForDates(schedule, dates).filter((item) => !CLOSED.has(item.status)),
    // a weekly series without any start date stays one line in the timetable (StudentLessonsPanel does the same)
    ...schedule.filter((item) => !item.date && !item.startDate && item.status !== 'Tühistatud' && (!item.endDate || item.endDate >= today)).map((item) => ({ ...item, weekly: true })),
  ];
  return tracks.filter(Boolean).map((track) => {
    const subject = subjectName(track.subject || student.subject) || 'Eesti keel';
    const status = trackStatus(track);
    // the same subject with two teachers: each track counts its own teacher's lessons
    const twins = tracks.filter((t) => t && (subjectName(t.subject || student.subject) || 'Eesti keel') === subject).length > 1;
    const mine = (item) => itemSubject(item, student) === subject && (!twins || !track.teacherUid || item.teacherUid === track.teacherUid);
    const upcoming = ahead.filter(mine);
    const held = lessons.filter((lesson) => mine(lesson) && (lesson.date || '') <= today && (!lesson.status || lesson.status === 'Toimunud')).map((lesson) => lesson.date).filter(Boolean).sort();
    const next = upcoming.find((item) => item.occurrenceDate) || upcoming[0] || null;
    const state = status === 'ended' ? 'ended' : status === 'paused' ? 'paused' : upcoming.length ? 'attending' : 'unplanned';
    const direction = findDirection(subject, directions);
    return {
      id: clean(track.id) || subject,
      track,
      subject,
      teacher: clean(track.teacher || (tracks.length === 1 ? student.teacher : '')),
      level: clean(track.level || (tracks.length === 1 ? student.level : '')),
      targetLevel: clean(track.targetLevel || (tracks.length === 1 ? student.targetLevel : '')),
      status,
      state,
      stateLabel: DIRECTION_STATES[state].label,
      tone: DIRECTION_STATES[state].tone,
      next: next ? { date: next.occurrenceDate || '', time: clean(next.time), weekly: Boolean(next.weekly) } : null,
      upcomingCount: upcoming.filter((item) => item.occurrenceDate).length,
      lastLesson: held[held.length - 1] || '',
      price: subjectPrice(plan, subject, student),
      color: direction?.color || '',
      shortLabel: direction?.shortLabel || '',
      known: Boolean(direction),
    };
  });
}
