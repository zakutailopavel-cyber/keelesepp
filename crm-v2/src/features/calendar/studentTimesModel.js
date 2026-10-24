// „Sobivad ajad” in the calendar (owner 2026-10-24: „интегрировать в календарь, чтобы составлять расписание учителей
// с учётом времени, которое хотели ученики, чтобы не было накладок”). Pure functions: a student's suitable half hours
// (studentAvailability: "Mon-16:00", preferred = ★) × the teacher's windows (availabilityModel) × lessons × rooms.
// All times are the school's wall clock: a date's weekday is read at local noon, so a DST change never moves a day.
import { availabilityAt, effectiveSlots } from './availabilityModel.js';
import { toClock, toMinutes } from './calendarGrid.js';
import { eventOccursOn, shiftDate } from './calendarView.js';
import { roomChoices } from './roomModel.js';

const DAY_IDS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
export const dayOfDate = (date) => DAY_IDS[new Date(`${date}T12:00:00`).getDay()];
const half = (minutes) => `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${minutes % 60 ? '30' : '00'}`;
const overlaps = (a, b) => a.start < b.end && b.start < a.end;
export const hasTimes = (availability) => Boolean(availability?.slots?.length);

// the half hours a lesson touches (16:15–17:00 → 16:00, 16:30)
function halvesOf(time, duration) {
  const start = toMinutes(time);
  const end = start + (Number(duration) || 60);
  const out = [];
  for (let at = Math.floor(start / 30) * 30; at < end; at += 30) out.push(at);
  return out;
}

// 'best' (every half hour ★), 'ok' (every half hour suits), 'partial' (some do), 'none', 'unknown' (no times saved)
export function studentStateAt(availability, { date, time, duration = 60 }) {
  if (!hasTimes(availability)) return 'unknown';
  const day = dayOfDate(date);
  const slots = new Set(availability.slots);
  const best = new Set(availability.preferred || []);
  const keys = halvesOf(time, duration).map((minutes) => `${day}-${half(minutes)}`);
  const hits = keys.filter((key) => slots.has(key)).length;
  if (!hits) return 'none';
  if (hits < keys.length) return 'partial';
  return keys.every((key) => best.has(key)) ? 'best' : 'ok';
}

// the suitable time of one date as ranges in minutes: [{ start, end, kind: 'best' | 'ok' }]
export function studentBandsOn(availability, date) {
  if (!hasTimes(availability)) return [];
  const day = dayOfDate(date);
  const best = new Set(availability.preferred || []);
  const cells = [...new Set(availability.slots)].filter((slot) => slot.startsWith(`${day}-`))
    .map((slot) => ({ start: toMinutes(slot.slice(4)), kind: best.has(slot) ? 'best' : 'ok' }))
    .sort((a, b) => a.start - b.start);
  return cells.reduce((list, cell) => {
    const last = list[list.length - 1];
    if (last && last.end === cell.start && last.kind === cell.kind) last.end = cell.start + 30;
    else list.push({ start: cell.start, end: cell.start + 30, kind: cell.kind });
    return list;
  }, []);
}

// Several students on one date: where all of them can („best” only when ★ for all), and where only some can.
// → [{ start, end, kind: 'best' | 'ok' | 'some', names: [...] }]
export function overlayBandsOn(entries = [], date) {
  const known = entries.filter((entry) => hasTimes(entry.availability));
  if (!known.length) return [];
  const cells = new Map();
  known.forEach((entry) => studentBandsOn(entry.availability, date).forEach((band) => {
    for (let at = band.start; at < band.end; at += 30) {
      const cell = cells.get(at) || { names: [], best: 0 };
      cell.names.push(entry.name || '');
      if (band.kind === 'best') cell.best += 1;
      cells.set(at, cell);
    }
  }));
  const list = [];
  [...cells.entries()].sort((a, b) => a[0] - b[0]).forEach(([start, cell]) => {
    const kind = cell.names.length < known.length ? 'some' : cell.best === known.length ? 'best' : 'ok';
    const names = cell.names.join(', ');
    const last = list[list.length - 1];
    if (last && last.end === start && last.kind === kind && last.names.join(', ') === names) last.end = start + 30;
    else list.push({ start, end: start + 30, kind, names: [...cell.names] });
  });
  return list;
}

// the lessons that take place on a date and involve this teacher or this student (one-to-one or in a group)
export function lessonsOn(events = [], date, { teacherUid = '', teacherName = '', studentIds = [], ignoreId = '' } = {}) {
  const wanted = new Set(studentIds.filter(Boolean));
  return events.filter((event) => event.id !== ignoreId && eventOccursOn(event, date) && event.status !== 'Tühistatud'
    && event.occurrenceStatuses?.[date]?.status !== 'Tühistatud')
    .map((event) => {
      const teacher = Boolean(teacherUid || teacherName) && (event.teacherUid && teacherUid ? event.teacherUid === teacherUid : Boolean(teacherName) && event.teacher === teacherName);
      const student = event.isGroup ? (event.studentIds || []).some((id) => wanted.has(id)) : wanted.has(event.studentId);
      return { event, teacher, student };
    })
    .filter((entry) => entry.teacher || entry.student);
}

const spanOf = (item) => ({ start: toMinutes(item.time), end: toMinutes(item.time) + (Number(item.duration) || 60) });

// the dates a lesson is checked on: one date, or a weekly lesson for `weeks` weeks
export const checkDates = (date, recurring, weeks = 4) => (recurring ? Array.from({ length: weeks }, (_, index) => shiftDate(date, index * 7)) : [date]);

// Clashes of a lesson at date + time: [{ date, event, teacher, student }] (the teacher's or the student's other lessons)
export function clashesAt(events, { date, time, duration = 60, recurring = false, weeks = 4 }, who) {
  const span = { start: toMinutes(time), end: toMinutes(time) + (Number(duration) || 60) };
  return checkDates(date, recurring, weeks).flatMap((day) => lessonsOn(events, day, who)
    .filter(({ event }) => overlaps(span, spanOf(event)))
    .map((entry) => ({ date: day, ...entry })));
}

// A student's usual lesson length: the most common one among their one-to-one lessons (with this teacher first), else 60
export function usualDuration(events = [], studentId, teacherUid = '') {
  const own = events.filter((event) => !event.isGroup && event.studentId === studentId && event.status !== 'Tühistatud' && Number(event.duration));
  const pool = own.some((event) => teacherUid && event.teacherUid === teacherUid) ? own.filter((event) => event.teacherUid === teacherUid) : own;
  if (!pool.length) return 60;
  const counts = new Map();
  pool.forEach((event) => counts.set(Number(event.duration), (counts.get(Number(event.duration)) || 0) + 1));
  return [...counts.entries()].sort((a, b) => b[1] - a[1] || b[0] - a[0])[0][0];
}

// online or on site, from the student's newest one-to-one lesson (null: no lessons yet)
export function usualOnline(events = [], studentId) {
  const own = events.filter((event) => !event.isGroup && event.studentId === studentId && event.status !== 'Tühistatud')
    .sort((a, b) => String(b.startDate || b.date || '').localeCompare(String(a.startDate || a.date || '')));
  return own.length ? Boolean(own[0].online) : null;
}

const RANK = { best: 0, ok: 1 };
const startOf = (date, time) => new Date(`${date}T${time}:00`);

/**
 * Lesson times for one student with one teacher on the given dates (the shown week): every full and half hour where
 * the whole lesson lies in the student's suitable time, the teacher has no red window (a yellow one only for an online
 * lesson), neither the teacher nor the student has another lesson (any subject, any teacher, groups too — for a weekly
 * lesson also on the next weeks) and, for a lesson on site in a school with rooms, a room is free.
 * → [{ date, time, end, student: 'best' | 'ok', teacher: 'free' | 'open' | 'online' }] sorted ★ first, then green, then time.
 */
export function candidateTimes({ studentId, studentAvailability, teacherUid = '', teacherName = '', teacherAvailability = null, events = [], dates = [], duration = 60, online = false, recurring = true, weeks = 4, rooms = [], bookings = [], now = new Date(), limit = 60 }) {
  if (!hasTimes(studentAvailability) || !studentId) return [];
  const length = Number(duration) || 60;
  const needsRoom = !online && rooms.some((room) => room.active !== false);
  const who = { teacherUid, teacherName, studentIds: [studentId] };
  const out = [];
  for (const date of dates) {
    for (const band of studentBandsOn(studentAvailability, date).reduce((list, band) => {
      // join ★ and plain neighbours: a lesson may span both
      const last = list[list.length - 1];
      if (last && last.end === band.start) last.end = band.end; else list.push({ ...band });
      return list;
    }, [])) {
      for (let start = band.start; start + length <= band.end; start += 30) {
        const time = toClock(start);
        if (startOf(date, time) <= now) continue;
        const student = studentStateAt(studentAvailability, { date, time, duration: length });
        if (student !== 'best' && student !== 'ok') continue;
        const windows = checkDates(date, recurring, weeks).map((day) => availabilityAt(teacherAvailability, { date: day, time, duration: length }));
        if (windows.includes('busy') || (!online && windows.includes('online'))) continue;
        if (clashesAt(events, { date, time, duration: length, recurring, weeks }, who).length) continue;
        if (needsRoom && roomChoices(rooms, bookings, { date, startDate: date, time, duration: length, recurring, endDate: '' }).every((room) => room.takenOn)) continue;
        const teacher = windows[0] === 'online' ? 'online' : windows.every((state) => state === 'free') ? 'free' : 'open';
        out.push({ date, time, end: toClock(start + length), student, teacher });
      }
    }
  }
  const teacherRank = (item) => (item.teacher === 'free' || item.teacher === 'online' ? 0 : 1);
  return out.sort((a, b) => RANK[a.student] - RANK[b.student] || teacherRank(a) - teacherRank(b) || `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`)).slice(0, limit);
}

// whether the teacher marked any green window on these dates (otherwise „outside the free time” says nothing)
const teacherHasFree = (availability, dates) => dates.some((date) => effectiveSlots(availability, date).some((slot) => slot.kind === 'free'));

const dateLabel = (date) => new Date(`${date}T12:00:00`).toLocaleDateString('et-EE', { weekday: 'short', day: 'numeric', month: 'numeric' });

/**
 * Warnings for a lesson about to be created or moved. They never block (Oleksiy 2026-10-23: a red hour is a warning,
 * not a ban); the calendar asks „Salvesta ikkagi” / „Tõsta ikkagi” for a red or yellow window (`window` 'busy' /
 * 'online'), the rest are shown.
 * lesson: { date, time, duration, recurring, online, id (ignored as its own clash) }
 * → [{ kind, text, window? }]: kind 'student-time' | 'student-lesson' | 'teacher-lesson' | 'teacher-window'
 */
export function planningWarnings({ lesson, student = null, studentAvailability = null, teacherUid = '', teacherName = '', teacherAvailability = null, events = [], includeTeacherLessons = true, weeks = 4 }) {
  if (!lesson?.date || !lesson?.time) return [];
  const out = [];
  const name = student?.name || 'Õpilane';
  const duration = Number(lesson.duration) || 60;
  if (student) {
    const state = studentStateAt(studentAvailability, { date: lesson.date, time: lesson.time, duration });
    if (state === 'none') out.push({ kind: 'student-time', text: `${name}: see aeg ei ole õpilase sobivate aegade hulgas.` });
    if (state === 'partial') out.push({ kind: 'student-time', text: `${name}: tund jääb osaliselt väljapoole õpilase sobivaid aegu.` });
  }
  const clashes = clashesAt(events, { date: lesson.date, time: lesson.time, duration, recurring: Boolean(lesson.recurring), weeks }, { teacherUid, teacherName, studentIds: student ? [student.id] : [], ignoreId: lesson.id || '' });
  const describe = (entry) => `${lesson.recurring ? `${dateLabel(entry.date)} ` : ''}${entry.event.time} ${entry.event.isGroup ? `grupp ${entry.event.studentName || ''}`.trim() : entry.event.studentName || 'tund'}`;
  const studentClashes = clashes.filter((entry) => entry.student && !entry.teacher);
  if (studentClashes.length) out.push({ kind: 'student-lesson', text: `${name}: samal ajal on õpilasel teine tund — ${studentClashes.slice(0, 3).map((entry) => `${describe(entry)}${entry.event.teacher ? ` (${entry.event.teacher})` : ''}`).join(', ')}.` });
  const teacherClashes = clashes.filter((entry) => entry.teacher);
  if (includeTeacherLessons && teacherClashes.length) out.push({ kind: 'teacher-lesson', text: `${teacherName || 'Õpetaja'}: samal ajal on juba tund — ${teacherClashes.slice(0, 3).map(describe).join(', ')}.` });
  const days = checkDates(lesson.date, Boolean(lesson.recurring), weeks);
  const windows = days.map((date) => availabilityAt(teacherAvailability, { date, time: lesson.time, duration }));
  const on = (state) => (lesson.recurring && days.length > 1 ? ` (${days.filter((_, index) => windows[index] === state).map(dateLabel).slice(0, 3).join(', ')})` : '');
  if (windows.includes('busy')) out.push({ kind: 'teacher-window', window: 'busy', text: `${teacherName || 'Õpetaja'} on sel ajal hõivatud (punane aeg)${on('busy')}.` });
  else if (windows.includes('online') && !lesson.online) out.push({ kind: 'teacher-window', window: 'online', text: `${teacherName || 'Õpetaja'} annab sel ajal ainult veebitunde (kollane aeg)${on('online')}.` });
  else if (windows.includes('open') && teacherHasFree(teacherAvailability, days)) out.push({ kind: 'teacher-window', window: 'outside', text: `${teacherName || 'Õpetaja'}: aeg on väljaspool õpetaja vaba (rohelist) aega.` });
  return out;
}

// a short line of a student's times per weekday: „E 16–19 (★ 17–18) · K 10–12”
const SHORT = { Mon: 'E', Tue: 'T', Wed: 'K', Thu: 'N', Fri: 'R', Sat: 'L', Sun: 'P' };
const MONDAY = '2026-01-05';
export function timesLine(availability) {
  if (!hasTimes(availability)) return '';
  const clock = (minutes) => (minutes % 60 ? toClock(minutes) : String(minutes / 60));
  const text = (ranges) => ranges.map((range) => `${clock(range.start)}–${clock(range.end)}`).join(', ');
  return Object.keys(SHORT).map((day, index) => {
    const bands = studentBandsOn(availability, shiftDate(MONDAY, index));
    const all = bands.reduce((list, band) => { const last = list[list.length - 1]; if (last && last.end === band.start) last.end = band.end; else list.push({ ...band }); return list; }, []);
    const best = bands.filter((band) => band.kind === 'best');
    return all.length ? `${SHORT[day]} ${text(all)}${best.length ? ` (★ ${text(best)})` : ''}` : '';
  }).filter(Boolean).join(' · ');
}
