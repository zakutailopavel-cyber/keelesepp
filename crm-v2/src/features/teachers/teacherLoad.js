// „Õpetajate koormus” (admin only): one row per teacher for a chosen week or month — lessons held / planned / cancelled /
// absences and hours taught, free availability not booked in the next 14 days, works waiting for a review, unmarked
// past lessons, active students and (admin only) the pay estimate. Read only; pure, so every rule is tested.
//
// Rules reused, not copied:
// - lessons of the period: finance/businessReport.js lessonFacts (calendar + journal marks, weekly series, groups once
//   per occurrence, one-off cancelled lessons); a weekly lesson cancelled only by `excludedDates` (the calendar's and
//   „Märkimata tunnid”'s cancel path) is added here as cancelled, unless the date has a moved / cancelled child record;
// - unmarked: features/calendar/unmarkedLessons.js markingSplit — the ONE definition (from MARKING_START up to yesterday, as /calendar/markimata);
// - free time: features/calendar/availabilityModel.js effectiveSlots (a window for one date overrides the weekly ones);
// - waiting reviews: the same rule as Kodutööd (a submitted worksheet / exercise without reviewStatus „reviewed”);
// - pay: „Ärinäitajad” withTeacherPay — the staff account's `workHourlyRateCents` × minutes of lessons given (held,
//   unmarked, school-covered, charged no-show; a group lesson once). No rate → payCents null („määramata”), never a guess.
// Dates and times are Europe/Tallinn wall clock (the calendar stores wall-clock text).
import { MISSED, lessonFacts, withTeacherPay } from '../finance/businessReport.js';
import { monthDates } from '../finance/monthlyBilling.js';
import { eventOccursOn, groupCalendarEvents, shiftDate, startOfWeek } from '../calendar/calendarView.js';
import { markingSplit } from '../calendar/unmarkedLessons.js';
import { effectiveSlots } from '../calendar/availabilityModel.js';
import { toMinutes } from '../calendar/calendarGrid.js';
import { isSameTeacher, teachesStudent } from '../../utils/teachers.js';

export const TIME_ZONE = 'Europe/Tallinn';
export const FREE_DAYS = 14;
export const REVIEW_DUE_DAYS = 3; // a work waiting longer than this is an overdue review
export const SUBMISSION_LOOKBACK_DAYS = 180; // waiting works older than this are not read (date-range query)
export const SLOT_MINUTES = 60; // a free „slot” = room for one 60-minute lesson

export const tallinnDay = (date = new Date()) => new Intl.DateTimeFormat('sv-SE', { timeZone: TIME_ZONE }).format(date);
export const tallinnClock = (date = new Date()) => new Intl.DateTimeFormat('en-GB', { timeZone: TIME_ZONE, hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(date);
const clock = (minutes) => `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;
const dayDiff = (from, to) => Math.round((Date.parse(`${to}T12:00:00Z`) - Date.parse(`${from}T12:00:00Z`)) / 86400000);
// a stored instant (ISO / Timestamp) → its Tallinn day; a bare YYYY-MM-DD stays as it is
export function tallinnDayOf(value) {
  if (!value) return '';
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const date = typeof value?.toDate === 'function' ? value.toDate() : new Date(value);
  return Number.isNaN(date.getTime()) ? '' : tallinnDay(date);
}

// { from, to, label } of a week (Monday first) or a month; anchor = any day of the week / 'YYYY-MM' or a day of the month
export function periodRange(mode, anchor) {
  if (mode === 'week') {
    const from = startOfWeek(anchor);
    const to = shiftDate(from, 6);
    return { mode, from, to, label: `${from.slice(8, 10)}.${from.slice(5, 7)}–${to.slice(8, 10)}.${to.slice(5, 7)}.${to.slice(0, 4)}` };
  }
  const month = String(anchor).slice(0, 7);
  const dates = monthDates(month);
  return { mode: 'month', from: dates[0], to: dates[dates.length - 1], label: month };
}

// does a calendar item / fact belong to this teacher: the account id first, else the name, else (no teacher on it) a
// student of the teacher
function belongsTo(item, teacher, ownIds) {
  if (item.teacherUid) return item.teacherUid === teacher.id;
  if (item.teacher) return isSameTeacher(item.teacher, teacher.name);
  return ownIds.has(item.studentId);
}

// weekly lessons whose date was cancelled by `excludedDates` only (no child record moved / cancelled it)
export function excludedCancellations(schedule = [], from, to) {
  const children = new Set(schedule.filter((event) => event.seriesId && event.originalOccurrenceDate).map((event) => `${event.seriesId}:${event.originalOccurrenceDate}`));
  const out = [];
  schedule.filter((event) => event.recurring && !event.isGroup && (event.excludedDates || []).length).forEach((event) => {
    const open = { ...event, status: 'Planeeritud', excludedDates: [] };
    (event.excludedDates || []).filter((date) => date >= from && date <= to && !children.has(`${event.id}:${date}`) && eventOccursOn(open, date))
      .forEach((date) => out.push({ occurrence: `${event.id}:${date}`, minutes: Number(event.duration) || 60, date, studentId: event.studentId, teacher: event.teacher || '', teacherUid: event.teacherUid || '', group: false, state: 'cancelled' }));
  });
  return out;
}

// one state per lesson occurrence (a group lesson has a fact per student): took place > unmarked > absent > cancelled > planned
const RANK = { held: 6, covered: 6, unmarked: 5, absentCharged: 4, absentNotified: 3, absentFree: 3, cancelled: 2, planned: 1 };
function perOccurrence(facts) {
  const map = new Map();
  facts.forEach((fact) => {
    const current = map.get(fact.occurrence);
    if (!current || (RANK[fact.state] || 0) > (RANK[current.state] || 0)) map.set(fact.occurrence, fact);
  });
  return [...map.values()];
}

// free time of one teacher in the next `days` days: effective free / online windows minus the teacher's lessons, from now on
export function freeSlots({ availability, events = [], teacher, today, nowClock = '00:00', days = FREE_DAYS }) {
  if (!availability?.slots?.length) return { count: 0, minutes: 0, windows: [], hasAvailability: false };
  const windows = [];
  for (let index = 0; index < days; index += 1) {
    const date = shiftDate(today, index);
    const taken = events.filter((event) => eventOccursOn(event, date) && event.occurrenceStatuses?.[date]?.status !== 'Tühistatud'
      && (event.teacherUid ? event.teacherUid === teacher.id : isSameTeacher(event.teacher, teacher.name)))
      .map((event) => ({ start: toMinutes(event.time), end: toMinutes(event.time) + (Number(event.duration) || 60) }));
    if (index === 0) taken.push({ start: 0, end: toMinutes(nowClock) });
    const used = [];
    const slots = effectiveSlots(availability, date);
    // red wins over yellow and green (availabilityModel's rule): a busy window is never free time
    slots.filter((slot) => slot.kind === 'busy').forEach((slot) => taken.push({ start: slot.start, end: slot.end }));
    slots.filter((slot) => slot.kind === 'free' || slot.kind === 'online').forEach((slot) => {
      let pieces = [{ start: slot.start, end: slot.end }];
      [...taken, ...used].forEach((hole) => {
        pieces = pieces.flatMap((piece) => (piece.start < hole.end && hole.start < piece.end ? [
          ...(piece.start < hole.start ? [{ start: piece.start, end: hole.start }] : []),
          ...(hole.end < piece.end ? [{ start: hole.end, end: piece.end }] : []),
        ] : [piece]));
      });
      pieces.filter((piece) => piece.end - piece.start >= 30).forEach((piece) => {
        used.push(piece);
        windows.push({ date, start: clock(piece.start), end: clock(piece.end), minutes: piece.end - piece.start, online: slot.kind === 'online', slots: Math.floor((piece.end - piece.start) / SLOT_MINUTES) });
      });
    });
  }
  windows.sort((a, b) => `${a.date} ${a.start}`.localeCompare(`${b.date} ${b.start}`));
  return { count: windows.reduce((sum, item) => sum + item.slots, 0), minutes: windows.reduce((sum, item) => sum + item.minutes, 0), windows, hasAvailability: true };
}

// the works of active students waiting for a review (Kodutööd's rule), attributed to the teacher who gave the sheet, else
// to every teacher of the student
export function waitingReviews({ submissions = [], students = [], teachers = [], today }) {
  const cards = new Map(students.filter((student) => student.active !== false).map((student) => [student.id, student]));
  const teacherIds = new Set(teachers.map((teacher) => teacher.id));
  const byTeacher = new Map();
  submissions.forEach((item) => {
    const student = cards.get(item.studentId);
    if (!student || item.reviewStatus === 'reviewed') return;
    const day = tallinnDayOf(item.completedAt);
    const age = day ? Math.max(0, dayDiff(day, today)) : 0;
    const giver = item.source?.assignedBy;
    const owners = giver && teacherIds.has(giver) ? [giver] : teachers.filter((teacher) => teachesStudent(student, teacher)).map((teacher) => teacher.id);
    owners.forEach((id) => {
      if (!byTeacher.has(id)) byTeacher.set(id, { waiting: 0, overdue: 0, oldestDays: null });
      const row = byTeacher.get(id);
      row.waiting += 1;
      if (age > REVIEW_DUE_DAYS) row.overdue += 1;
      if (row.oldestDays === null || age > row.oldestDays) row.oldestDays = age;
    });
  });
  return byTeacher;
}

const round1 = (value) => Math.round(value * 10) / 10;

/**
 * One row per teacher. Input: teachers (users docs), students (active cards), schedule, groups, lessons (journal, from at
 * least min(period start, today − 60 days)), availability (teacherAvailability docs), submissions (normalized), the
 * period from periodRange, today / nowClock (Tallinn).
 * → [{ id, name, students, held, planned, cancelled, absences, absentNotified, absentUnnotified, pastUnmarked, hours, unmarked,
 *      free: { count, minutes, windows, hasAvailability }, reviews: { waiting, overdue, oldestDays },
 *      pay: { rateCents, givenHours, payCents, forecastCents } }]
 */
export function teacherLoad({ teachers = [], students = [], schedule = [], groups = [], lessons = [], availability = [], submissions = [], period, today, nowClock = '00:00' } = {}) {
  const known = new Set(students.map((student) => student.id));
  // a student archived meanwhile still had those lessons: a bare record keeps them countable (as „Õpetajate võrdlus”)
  const others = [...new Set([...lessons, ...schedule].map((item) => item.studentId).filter((id) => id && !known.has(id)))].map((id) => ({ id, active: false }));
  const groupOnly = [...new Set(groups.flatMap((group) => group.students || []))].filter((id) => id && !known.has(id) && !others.some((item) => item.id === id));
  const everyone = [...students, ...others, ...groupOnly.map((id) => ({ id, active: false }))];
  const facts = [...lessonFacts({ from: period.from, to: period.to, today, students: everyone, schedule, groups, lessons }), ...excludedCancellations(schedule, period.from, period.to)];
  const unmarked = markingSplit({ schedule, lessons, today, context: { staff: teachers, archivedStudentIds: others.map((item) => item.id) } }).items;
  const events = [...schedule, ...groupCalendarEvents(groups)];
  const reviews = waitingReviews({ submissions, students, teachers, today });
  const availabilityOf = new Map(availability.map((item) => [item.teacherUid || item.id, item]));

  return teachers.filter((teacher) => !teacher.disabled && !teacher.deletedAt).map((teacher) => {
    const own = students.filter((student) => student.active !== false && teachesStudent(student, teacher));
    const ownIds = new Set(own.map((student) => student.id));
    const mine = perOccurrence(facts.filter((fact) => belongsTo(fact, teacher, ownIds)));
    const count = (states) => mine.filter((fact) => states.includes(fact.state)).length;
    const heldFacts = mine.filter((fact) => fact.state === 'held' || fact.state === 'covered');
    const key = `teacher:${teacher.id}`;
    const named = mine.map((fact) => ({ ...fact, teacher: key }));
    const rate = Number(teacher.workHourlyRateCents) > 0 ? Number(teacher.workHourlyRateCents) : null;
    const [given] = withTeacherPay([{ name: key, earnedCents: 0 }], named, () => rate);
    const [ahead] = withTeacherPay([{ name: key, earnedCents: 0 }], named.map((fact) => (fact.state === 'planned' ? { ...fact, state: 'held' } : fact)), () => rate);
    const free = freeSlots({ availability: availabilityOf.get(teacher.id), events, teacher, today, nowClock });
    return {
      id: teacher.id,
      name: teacher.name || teacher.email || 'Õpetaja',
      role: teacher.role || 'teacher',
      students: own.length,
      held: heldFacts.length,
      planned: count(['planned']),
      cancelled: count(['cancelled']),
      absences: mine.filter((fact) => MISSED.has(fact.state) && fact.state !== 'cancelled').length,
      absentNotified: count(['absentNotified']),
      absentUnnotified: count(['absentCharged', 'absentFree']),
      pastUnmarked: count(['unmarked']),
      hours: round1(heldFacts.reduce((sum, fact) => sum + fact.minutes, 0) / 60),
      unmarked: unmarked.filter((item) => belongsTo(item, teacher, ownIds)).length,
      free,
      reviews: reviews.get(teacher.id) || { waiting: 0, overdue: 0, oldestDays: null },
      pay: { rateCents: rate, givenHours: given.hours, payCents: given.payCents, forecastCents: ahead.payCents },
    };
  }).filter((row) => row.role === 'teacher' || row.students || row.held || row.planned || row.unmarked || row.free.hasAvailability)
    .sort((a, b) => b.hours - a.hours || b.planned - a.planned || a.name.localeCompare(b.name, 'et'));
}

export function loadTotals(rows = []) {
  const sum = (pick) => rows.reduce((total, row) => total + pick(row), 0);
  return {
    held: sum((row) => row.held), planned: sum((row) => row.planned), cancelled: sum((row) => row.cancelled), absences: sum((row) => row.absences),
    hours: round1(sum((row) => row.hours)), unmarked: sum((row) => row.unmarked), free: sum((row) => row.free.count),
    waiting: sum((row) => row.reviews.waiting), overdue: sum((row) => row.reviews.overdue),
    payCents: sum((row) => row.pay.payCents || 0), unrated: rows.filter((row) => !row.pay.rateCents).map((row) => row.name),
  };
}
