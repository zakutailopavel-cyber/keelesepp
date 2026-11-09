// „Märkimata tunnid” — ONE definition for every place that counts or lists unmarked lessons (calendar badge, the
// page /calendar/markimata, the dashboard card and tile, the teacher's nudge and bell, „Õpetajate koormus”, the admin's
// menu badge and the weekly e-mail digest). Owner 2026-11-09: a teacher marks a past lesson in ~10 seconds on a phone,
// target < 20 open.
//   window   — from MARKING_START (owner 2026-11-09: „забыть неотмеченные до 1.11 пока”) up to yesterday; today is
//              never counted. Lessons before the start are not changed or deleted, only not counted (the admin sees
//              them on the page under „Vanemad (enne 1.11)”).
//   counted  — a past planned 1:1 lesson (weekly series included) without a journal record (findUnmarkedLessons).
//   excluded — never shown to a teacher, never counted; the admin sees them under „Vajab admini” with a reason and a
//              fix (markingSplit / exclusionReason): no teacher on the entry, the teacher's account is closed or gone,
//              the student is archived, the day is in a closed financial period (financialLockedDates).
// Pure: no Firebase (services/firebase/unmarkedLessons.js loads). Contract: docs/LESSON_MARKING.md.
import { occurrencesForDates, shiftDate } from './calendarView.js';

// the first day that counts; one constant (docs/LESSON_MARKING.md). Owner: admin-changeable later if needed.
export const MARKING_START = '2026-11-01';
// how far before MARKING_START the admin's „Vanemad” view looks
export const OLDER_DAYS = 60;

const isoDate = (value) => /^\d{4}-\d{2}-\d{2}$/.test(String(value || ''));
// the counted days, newest first: [from … yesterday] (or [from … to] when `to` is before yesterday)
export function markingDates(today, { from = MARKING_START, to = '' } = {}) {
  const yesterday = shiftDate(today, -1);
  const last = isoDate(to) && to < yesterday ? to : yesterday;
  const first = isoDate(from) ? from : MARKING_START;
  const dates = [];
  for (let date = last; date >= first && dates.length < 3660; date = shiftDate(date, -1)) dates.push(date);
  return dates;
}
// the admin's „Vanemad (enne 1.11)” window: OLDER_DAYS before the start
export const olderWindow = (start = MARKING_START) => ({ from: shiftDate(start, -OLDER_DAYS), to: shiftDate(start, -1) });
// „1.11” for labels
export const startLabel = (start = MARKING_START) => `${Number(start.slice(8, 10))}.${Number(start.slice(5, 7))}`;

// ── exclusions („Vajab admini”) ───────────────────────────────────────────────────────────────────────────────────
export const EXCLUSION_REASONS = Object.freeze({
  'no-teacher': 'Tunnil pole õpetajat',
  'teacher-gone': 'Õpetaja konto on suletud või eemaldatud',
  'student-archived': 'Õpilane on arhiivis',
  'period-closed': 'Finantsperiood on suletud',
});
const asSet = (value) => (value instanceof Set ? value : new Set(value || []));
// context: { archivedStudentIds, staff (users docs: id, role, disabled, deletedAt, purgedAt), lockedDates }.
// Only what is known excludes: without a staff list nobody is „gone”, a card not in the archive list counts.
export function markingContext({ archivedStudentIds = [], staff = null, lockedDates = [] } = {}) {
  const activeStaff = Array.isArray(staff) && staff.length
    ? new Set(staff.filter((person) => !person.disabled && !person.deletedAt && !person.purgedAt && ['admin', 'teacher'].includes(person.role || 'teacher')).map((person) => person.id))
    : null;
  return { archived: asSet(archivedStudentIds), activeStaff, locked: asSet(lockedDates) };
}
export function exclusionReason(item, context = markingContext()) {
  const ctx = context.archived ? context : markingContext(context);
  if (!item.teacherUid) return 'no-teacher';
  if (ctx.activeStaff && !ctx.activeStaff.has(item.teacherUid)) return 'teacher-gone';
  if (item.studentId && ctx.archived.has(item.studentId)) return 'student-archived';
  if (ctx.locked.has(item.occurrenceDate)) return 'period-closed';
  return '';
}

/**
 * The unified list. → { items (counted, oldest first), adminItems (excluded, with `reason`; always empty in a
 * teacher's view) }. `teacherUid` (a teacher's own view): only entries with exactly that teacher — an entry without a
 * teacher is never shown to a teacher. `context`: see markingContext. Other arguments as findUnmarkedLessons.
 */
export function markingSplit({ schedule = [], lessons = [], sessions = [], today, teacherUid = '', context, from = MARKING_START, to = '' } = {}) {
  const all = findUnmarkedLessons({ schedule, lessons, sessions, today, teacherUid, from, to });
  const ctx = markingContext(context || {});
  const items = [];
  const adminItems = [];
  all.forEach((item) => {
    const reason = exclusionReason(item, ctx);
    if (!reason) items.push(item);
    else if (!teacherUid) adminItems.push({ ...item, reason });
  });
  return { items, adminItems };
}

// the counted list only (badges, the dashboard): the same rules, nothing else
export function unmarkedLessons(args = {}) {
  return markingSplit(args).items;
}

// ── „Märkimata tunnid” page (2026-11-04): unmarked past lessons with the Live Classroom's evidence ─────────────────
// Production showed lessons that happened (a Live Classroom summary / recording of that student exists) but whose
// calendar entry was never marked, so no `lessons` record exists and nothing is billed; and planned entries left over
// on a day where the same student already has a marked lesson (a moved lesson's leftover). Each past occurrence of the
// last 60 days (up to yesterday) without a mark gets one suggestion:
//   'evidence'  — a live session / recording of that student within ±3 h → „Märgi toimunuks” (completeFromSchedule)
//   'duplicate' — no own session, but the student has another lesson that day (marked, or a planned one that has the
//                 session) → „Tõenäoliselt topelt”, cancel through the calendar's own cancel path
//   'teacher'   — nothing found → the teacher says: Toimus / Puudus (teatas) / Puudus (ei teatanud)
// Pure: no Firebase, so the admin's morning digest can count with it too (services/firebase/unmarkedLessons.js loads).
// REVIEW_DAYS: the old rolling window, used only by callers that pass `days` explicitly.
export const REVIEW_DAYS = 60;
export const EVIDENCE_WINDOW_MINUTES = 180;
// a record of the same student that day within this many minutes (or without a time) is this lesson's own mark,
// written before marks carried the schedule id
const SAME_LESSON_MINUTES = 15;
const TIME_ZONE = 'Europe/Tallinn';

let tallinnFormat;
// a UTC ISO time („2026-10-20T07:02:00.000Z”) as the school's local date and time („2026-10-20”, „10:02”)
export function tallinnLocal(iso) {
  const at = new Date(iso || '');
  if (!iso || Number.isNaN(at.getTime())) return null;
  tallinnFormat ||= new Intl.DateTimeFormat('en-CA', { timeZone: TIME_ZONE, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });
  const parts = Object.fromEntries(tallinnFormat.formatToParts(at).map((part) => [part.type, part.value]));
  return { date: `${parts.year}-${parts.month}-${parts.day}`, time: `${parts.hour === '24' ? '00' : parts.hour}:${parts.minute}` };
}

function clockMinutes(time) {
  const match = /^(\d{1,2}):(\d{2})/.exec(String(time || ''));
  return match ? Number(match[1]) * 60 + Number(match[2]) : null;
}
// minutes on one line through all days, so ±3 h works across midnight; null without a time
function absoluteMinutes(date, time) {
  const minutes = clockMinutes(time);
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(date || ''));
  if (minutes === null || !match) return null;
  return Math.round(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])) / 60000) + minutes;
}
const sameTeacher = (left = '', right = '') => !left || !right || left === right;

// Live Classroom summaries + recordings → one session per lesson room (a summary and a recording of the same
// invitation are one session; the earliest start wins)
export function liveSessions({ summaries = [], recordings = [] } = {}) {
  const byKey = new Map();
  const add = (source, item, startIso, endIso) => {
    const local = tallinnLocal(startIso);
    if (!item?.studentId || !local) return;
    const key = item.invitationId ? String(item.invitationId) : `${source}:${item.id}`;
    const end = tallinnLocal(endIso);
    const session = {
      key, source, studentId: item.studentId, teacherUid: item.teacherUid || '', teacherName: item.teacherName || '',
      startedAt: startIso, date: local.date, time: local.time, endTime: end && end.date === local.date ? end.time : '',
      minutes: absoluteMinutes(local.date, local.time), sources: [source],
    };
    const current = byKey.get(key);
    if (!current) { byKey.set(key, session); return; }
    const sources = [...new Set([...current.sources, source])];
    byKey.set(key, startIso < current.startedAt
      ? { ...session, endTime: session.endTime || current.endTime, sources }
      : { ...current, endTime: current.endTime || session.endTime, sources });
  };
  // a summary saved without the start time keeps only its end: the lesson started before it
  summaries.forEach((item) => add('summary', item, item.startedAt || item.endedAt, item.endedAt));
  recordings.forEach((item) => add('recording', item, item.startedAt, item.endedAt));
  return [...byKey.values()];
}

// pairs within the window, closest first; each side is used once
function claimClosest(pairs, claimed, onPair) {
  const left = new Set();
  pairs.sort((a, b) => a.distance - b.distance || String(a.leftKey).localeCompare(String(b.leftKey)));
  pairs.forEach((pair) => {
    if (left.has(pair.leftKey) || claimed.has(pair.rightKey)) return;
    left.add(pair.leftKey);
    claimed.add(pair.rightKey);
    onPair(pair);
  });
}
function distanceOf(minutesA, dateA, minutesB, dateB) {
  if (minutesA !== null && minutesB !== null) return Math.abs(minutesA - minutesB);
  // one side without a time: the same day counts, as the farthest in the window
  return dateA === dateB ? EVIDENCE_WINDOW_MINUTES : Infinity;
}
const recordDate = (lesson) => lesson.occurrenceDate || lesson.date || '';

export function findUnmarkedLessons({ schedule = [], lessons = [], sessions = [], today, days = 0, from = MARKING_START, to = '', teacherUid = '' } = {}) {
  // `days`: a rolling window (legacy callers); else [from … yesterday]
  const dates = days > 0 ? Array.from({ length: days }, (_, index) => shiftDate(today, -(index + 1))) : markingDates(today, { from, to });
  const first = dates[dates.length - 1] || '';
  const linked = new Set();
  const byReference = new Set();
  const recordsByDay = new Map();
  lessons.forEach((lesson) => {
    const date = recordDate(lesson);
    if (lesson.scheduleId && date) linked.add(`${lesson.scheduleId}:${date}`);
    if (lesson.id) byReference.add(lesson.id);
    if (!lesson.studentId || !date || date < first) return;
    const key = `${lesson.studentId}@${date}`;
    recordsByDay.set(key, [...(recordsByDay.get(key) || []), lesson]);
  });
  const ownReference = (item) => item.occurrenceStatuses?.[item.occurrenceDate]?.lessonEntryId
    || ((!item.recurring || (item.lessonOccurrenceDate || item.date) === item.occurrenceDate) ? item.lessonEntryId : '');
  // a teacher's view: exactly his entries (an entry without a teacher goes to the admin, never to every teacher)
  const unmarked = occurrencesForDates(schedule.filter((event) => !event.isGroup && event.studentId && (!teacherUid || event.teacherUid === teacherUid)), dates)
    .filter((item) => (item.status || 'Planeeritud') === 'Planeeritud')
    .filter((item) => !linked.has(`${item.id}:${item.occurrenceDate}`) && !(ownReference(item) && byReference.has(ownReference(item))))
    .map((item) => ({ ...item, minutes: absoluteMinutes(item.occurrenceDate, item.time) }))
    // a record of that student and teacher at this very time (or without a time) is this lesson's own older mark
    .filter((item) => !(recordsByDay.get(`${item.studentId}@${item.occurrenceDate}`) || []).some((record) => {
      if (!sameTeacher(record.teacherUid, item.teacherUid)) return false;
      const recordMinutes = absoluteMinutes(recordDate(record), record.time);
      return recordMinutes === null || item.minutes === null || Math.abs(recordMinutes - item.minutes) <= SAME_LESSON_MINUTES;
    }));

  // sessions near a lesson already marked held belong to it; the rest may prove an unmarked lesson
  const relevant = sessions.filter((session) => session.date >= shiftDate(first, -1));
  const claimed = new Set();
  const heldPairs = [];
  lessons.filter((lesson) => (lesson.status || 'Toimunud') === 'Toimunud' && recordDate(lesson) >= first).forEach((lesson, index) => {
    const minutes = absoluteMinutes(recordDate(lesson), lesson.time);
    relevant.forEach((session) => {
      if (session.studentId !== lesson.studentId || !sameTeacher(session.teacherUid, lesson.teacherUid)) return;
      const distance = distanceOf(minutes, recordDate(lesson), session.minutes, session.date);
      if (distance <= EVIDENCE_WINDOW_MINUTES) heldPairs.push({ leftKey: `lesson:${lesson.id || index}`, rightKey: session.key, distance });
    });
  });
  claimClosest(heldPairs, claimed, () => {});

  const evidence = new Map();
  const itemPairs = [];
  unmarked.forEach((item) => relevant.forEach((session) => {
    if (claimed.has(session.key) || session.studentId !== item.studentId || !sameTeacher(session.teacherUid, item.teacherUid)) return;
    const distance = distanceOf(item.minutes, item.occurrenceDate, session.minutes, session.date);
    if (distance <= EVIDENCE_WINDOW_MINUTES) itemPairs.push({ leftKey: item.occurrenceId, rightKey: session.key, distance, session });
  }));
  claimClosest(itemPairs, claimed, (pair) => evidence.set(pair.leftKey, pair.session));

  return unmarked.map(({ minutes: _minutes, ...item }) => {
    const session = evidence.get(item.occurrenceId) || null;
    if (session) return { ...item, kind: 'evidence', evidence: session, duplicateOf: null };
    const sameDay = (recordsByDay.get(`${item.studentId}@${item.occurrenceDate}`) || [])
      .filter((record) => sameTeacher(record.teacherUid, item.teacherUid) || (record.subject && record.subject === item.subject));
    const markedTwin = sameDay.find((record) => (record.status || 'Toimunud') === 'Toimunud') || sameDay[0];
    if (markedTwin) {
      return { ...item, kind: 'duplicate', evidence: null, duplicateOf: { source: 'lesson', id: markedTwin.id || '', date: recordDate(markedTwin), time: markedTwin.time || '', status: markedTwin.status || 'Toimunud', teacher: markedTwin.teacher || '' } };
    }
    const plannedTwin = unmarked.find((other) => other.occurrenceId !== item.occurrenceId && other.studentId === item.studentId
      && other.occurrenceDate === item.occurrenceDate && sameTeacher(other.teacherUid, item.teacherUid) && evidence.has(other.occurrenceId));
    if (plannedTwin) {
      return { ...item, kind: 'duplicate', evidence: null, duplicateOf: { source: 'planned', id: plannedTwin.occurrenceId, date: plannedTwin.occurrenceDate, time: plannedTwin.time || '', status: 'Planeeritud', teacher: plannedTwin.teacher || '' } };
    }
    return { ...item, kind: 'teacher', evidence: null, duplicateOf: null };
  // oldest first: the teacher works through the list from the top (owner 2026-11-09)
  }).sort((a, b) => `${a.occurrenceDate} ${a.time}`.localeCompare(`${b.occurrenceDate} ${b.time}`));
}

// the calendar's message for a lesson the rules refuse (on an invoice / in a closed period)
export function actionError(problem, fallback) {
  if (problem?.code === 'permission-denied' || problem?.code === 'firestore/permission-denied') {
    return 'Seda tundi ei saa siin muuta: tund on arvel või periood on suletud. Paranda see Finantsides.';
  }
  return problem?.message || fallback;
}

// the numbers for a badge or the admin's morning digest
export function summarizeUnmarked(items = []) {
  return {
    total: items.length,
    evidence: items.filter((item) => item.kind === 'evidence').length,
    duplicate: items.filter((item) => item.kind === 'duplicate').length,
    teacher: items.filter((item) => item.kind === 'teacher').length,
  };
}

// ── Teacher's daily reminder (owner 2026-11-09: „ежедневное напоминание учителям о неотмеченных уроках — в CRM, НЕ
// письмом”). Never an e-mail / SMS: the bell (NotificationCenter) and a once-a-day banner on the home page only.
// It counts from MARKING_START (the same window as the page), so the old backlog does not nag a teacher every morning,
// and the number matches the page the reminder opens. The banner gives a day of grace: only lessons from before
// yesterday nudge. REMINDER_DAYS stays for older imports (= the old rolling window).
export const REMINDER_DAYS = REVIEW_DAYS;
export const REMINDER_GRACE_DAYS = 1;
const shortDate = (iso) => (/^\d{4}-\d{2}-\d{2}$/.test(String(iso || '')) ? `${iso.slice(8, 10)}.${iso.slice(5, 7)}` : '');

// items of markingSplit (one teacher's) → { total, oldest, oldestLabel „DD.MM”, stale (older than the grace) }
export function unmarkedReminder(items = [], today, { from = MARKING_START, graceDays = REMINDER_GRACE_DAYS } = {}) {
  const inWindow = items.filter((item) => item.occurrenceDate && item.occurrenceDate >= from && item.occurrenceDate < today);
  const oldest = inWindow.reduce((first, item) => (!first || item.occurrenceDate < first ? item.occurrenceDate : first), '');
  const graceFrom = shiftDate(today, -graceDays);
  return { total: inWindow.length, oldest, oldestLabel: shortDate(oldest), stale: inWindow.filter((item) => item.occurrenceDate < graceFrom).length };
}

// „Lõpeta sari” (admin, „Vajab admini”): a weekly series that runs on for an archived student or a closed teacher
// account ends the day before its first listed occurrence, so those occurrences and all later ones go away. Nothing
// is deleted; the old end date is kept for the undo. → the new endDate, or '' when the entry is not a series
export function seriesEndDate(item, listed = []) {
  if (!item?.recurring || !item.id) return '';
  const first = [item, ...listed].filter((entry) => entry.id === item.id && entry.occurrenceDate)
    .reduce((oldest, entry) => (!oldest || entry.occurrenceDate < oldest ? entry.occurrenceDate : oldest), '');
  return first ? shiftDate(first, -1) : '';
}

// the page's day groups: [{ date, items }], oldest day first
export function groupByDay(items = []) {
  const days = new Map();
  items.forEach((item) => days.set(item.occurrenceDate, [...(days.get(item.occurrenceDate) || []), item]));
  return [...days.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([date, list]) => ({ date, items: list }));
}
