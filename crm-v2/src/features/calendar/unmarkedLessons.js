// „Märkimata tunnid” (owner 2026-10-23: учителя не отмечают уроки — без журнала врут риск ухода, отчёты и „Õpilase
// pilt”; monthly invoices count marks too): the calendar's past lessons of the last year that have no journal record
// yet, weekly series included, so the teacher marks them held or missed in one click. The card says how many are older
// than two weeks (a lesson used to fall off silently after 14 days) and how far back it looks. A cancelled lesson, a group lesson and a lesson already in the journal
// (the record of completeFromSchedule, or any lesson of that student on that day) are left out.
import { occurrencesForDates, shiftDate } from './calendarView.js';

export const UNMARKED_DAYS = 365;
export const RECENT_DAYS = 14;

export function unmarkedLessons({ schedule = [], lessons = [], today, days = UNMARKED_DAYS, teacherUid = '' } = {}) {
  const dates = Array.from({ length: days }, (_, index) => shiftDate(today, -(index + 1)));
  const marked = new Set();
  lessons.forEach((lesson) => {
    if (lesson.scheduleId && (lesson.occurrenceDate || lesson.date)) marked.add(`${lesson.scheduleId}:${lesson.occurrenceDate || lesson.date}`);
    if (lesson.studentId && lesson.date) marked.add(`${lesson.studentId}@${lesson.date}`);
  });
  return occurrencesForDates(schedule.filter((event) => !event.isGroup && event.studentId && (!teacherUid || !event.teacherUid || event.teacherUid === teacherUid)), dates)
    .filter((item) => (item.status || 'Planeeritud') === 'Planeeritud')
    .filter((item) => !marked.has(`${item.id}:${item.occurrenceDate}`) && !marked.has(`${item.studentId}@${item.occurrenceDate}`))
    .sort((a, b) => `${b.occurrenceDate} ${b.time}`.localeCompare(`${a.occurrenceDate} ${a.time}`));
}

// how many of the list are older than two weeks
export function olderUnmarked(items = [], today) {
  const from = shiftDate(today, -RECENT_DAYS);
  return items.filter((item) => item.occurrenceDate < from).length;
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

export function findUnmarkedLessons({ schedule = [], lessons = [], sessions = [], today, days = REVIEW_DAYS, teacherUid = '' } = {}) {
  const dates = Array.from({ length: days }, (_, index) => shiftDate(today, -(index + 1)));
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
  const unmarked = occurrencesForDates(schedule.filter((event) => !event.isGroup && event.studentId && (!teacherUid || !event.teacherUid || event.teacherUid === teacherUid)), dates)
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
  }).sort((a, b) => `${b.occurrenceDate} ${b.time}`.localeCompare(`${a.occurrenceDate} ${a.time}`));
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
// It looks back REMINDER_DAYS (= the „Märkimata tunnid” page's 60 days), so the old backlog (owner: „308 неотмеченных —
// пока не делаем”, nothing is bulk-marked) does not nag a teacher every morning, and the number matches the page the
// reminder opens. The banner gives a day of grace: only lessons from before yesterday nudge.
export const REMINDER_DAYS = REVIEW_DAYS;
export const REMINDER_GRACE_DAYS = 1;
const shortDate = (iso) => (/^\d{4}-\d{2}-\d{2}$/.test(String(iso || '')) ? `${iso.slice(8, 10)}.${iso.slice(5, 7)}` : '');

// items of findUnmarkedLessons (one teacher's) → { total, oldest, oldestLabel „DD.MM”, stale (older than the grace) }
export function unmarkedReminder(items = [], today, { days = REMINDER_DAYS, graceDays = REMINDER_GRACE_DAYS } = {}) {
  const from = shiftDate(today, -days);
  const inWindow = items.filter((item) => item.occurrenceDate && item.occurrenceDate >= from && item.occurrenceDate < today);
  const oldest = inWindow.reduce((first, item) => (!first || item.occurrenceDate < first ? item.occurrenceDate : first), '');
  const graceFrom = shiftDate(today, -graceDays);
  return { total: inWindow.length, oldest, oldestLabel: shortDate(oldest), stale: inWindow.filter((item) => item.occurrenceDate < graceFrom).length };
}
