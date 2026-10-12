// „Ei saa tulla?” (owner 2026-10-12): a student or parent asks to move one lesson; the teacher confirms or declines.
// The lesson stays in place until the teacher confirms. Times offered come from the teacher's green („free”) windows;
// the teacher still checks them against the calendar, because a student cannot see other students' lessons.
import { slotsOn } from './availabilityModel.js';
import { toMinutes } from './calendarGrid.js';

export const LATE_HOURS = 24;
export const STATUS = { PENDING: 'pending', ACCEPTED: 'accepted', DECLINED: 'declined', CANCELLED: 'cancelled' };

const pad = (n) => String(n).padStart(2, '0');
const hhmm = (minutes) => `${pad(Math.floor(minutes / 60))}:${pad(minutes % 60)}`;
const addDays = (date, days) => {
  const value = new Date(`${date}T12:00:00`);
  value.setDate(value.getDate() + days);
  return `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())}`;
};
const startOf = (date, time) => new Date(`${date}T${time || '00:00'}:00`);

// less than 24 hours before the lesson: the school may count it as held (shown as a warning, not a block)
export const isLate = (lesson, now = new Date()) => (startOf(lesson.occurrenceDate || lesson.date, lesson.time) - now) / 3600000 < LATE_HOURS;

/**
 * Up to `limit` times in the next `days` days inside the teacher's free windows, at most one per day (the first one,
 * on the full or half hour), never the lesson's own time, never in the past, never on another lesson of this student.
 */
export function proposalSlots({ availability, lesson, from, days = 14, limit = 6, busy = [], now = new Date() }) {
  const duration = Number(lesson?.duration) || 60;
  const out = [];
  for (let i = 0; i < days && out.length < limit; i += 1) {
    const date = addDays(from, i);
    const windows = slotsOn(availability, date).filter((slot) => slot.kind === 'free')
      .map((slot) => ({ start: toMinutes(slot.start), end: toMinutes(slot.end) })).sort((a, b) => a.start - b.start);
    for (const window of windows) {
      let start = Math.ceil(window.start / 30) * 30;
      let found = null;
      while (start + duration <= window.end) {
        const time = hhmm(start);
        const own = date === (lesson.occurrenceDate || lesson.date) && time === lesson.time;
        const clash = busy.some((item) => item.date === date && start < toMinutes(item.time) + (Number(item.duration) || 60) && toMinutes(item.time) < start + duration);
        if (!own && !clash && startOf(date, time) > now) { found = { date, time }; break; }
        start += 30;
      }
      if (found) { out.push(found); break; }
    }
  }
  return out;
}

const dayLabel = (date) => new Date(`${date}T12:00:00`).toLocaleDateString('et-EE', { weekday: 'short', day: 'numeric', month: 'numeric' });
export const slotLabel = ({ date, time }) => `${dayLabel(date)} · ${time}`;

// the request document (validated again by the Firestore rules)
export function buildRequest({ lesson, student, user, role, proposals = [], other = '', reason = '', now = new Date() }) {
  const clean = (value, max) => String(value || '').trim().slice(0, max);
  const picked = proposals.slice(0, 3).map(({ date, time }) => ({ date, time }));
  if (!picked.length && !clean(other, 300)) throw new Error('Vali uus aeg või kirjuta, millal sobiks.');
  return {
    scheduleId: lesson.id, occurrenceDate: lesson.occurrenceDate || lesson.date, occurrenceTime: lesson.time,
    duration: Number(lesson.duration) || 60, studentId: student.id, studentName: clean(student.name, 120),
    teacherUid: lesson.teacherUid || '', teacherName: clean(lesson.teacher, 120),
    requestedByUid: user.uid, requestedByName: clean(user.displayName || user.email, 120), requestedByRole: role,
    proposals: picked, other: clean(other, 300), reason: clean(reason, 300), late: isLate(lesson, now),
    status: STATUS.PENDING, createdAt: now.toISOString(),
  };
}

// the newest request per lesson occurrence, so the card shows its state
export const requestFor = (requests = [], lesson) => requests
  .filter((item) => item.scheduleId === lesson?.id && item.occurrenceDate === (lesson?.occurrenceDate || lesson?.date))
  .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)))[0] || null;
