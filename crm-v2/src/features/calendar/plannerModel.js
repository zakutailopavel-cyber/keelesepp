// „Planeerija” (owner 2026-10-25): plan the whole weekly timetable at once. „Lisa kõik õpilased” collects every active
// study direction (student × subject × teacher) without a weekly lesson ahead, „Jaota” spreads them over one weekly
// pattern by the students' „Sobivad ajad” (★ first), the teachers' windows, the lessons that stay and the rooms. A
// student who does not fit is never dropped: they get their best partly fitting time, even over another student
// („Kattub”), and the administrator agrees it with the student. Nothing is written before „Kinnita ajakava”, which
// creates the usual weekly lessons. Pure functions (tests: plannerModel.test.js). Wall-clock times, weekdays read at
// local noon: a DST week moves nothing.
import { availabilityAt, effectiveSlots } from './availabilityModel.js';
import { toClock, toMinutes } from './calendarGrid.js';
import { eventOccursOn, shiftDate } from './calendarView.js';
import { ROOM_WEEKS } from './roomModel.js';
import { dayOfDate, hasTimes, studentStateAt, usualDuration, usualOnline } from './studentTimesModel.js';
import { hasLessonAhead } from './unplannedStudents.js';
import { itemSubject, subjectName } from '../students/subjects.js';
import { isSameTeacher } from '../../utils/teachers.js';

export const PLAN_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
export const DAY_LABELS = { Mon: 'E', Tue: 'T', Wed: 'K', Thu: 'N', Fri: 'R', Sat: 'L', Sun: 'P' };
export const PLAN_FROM = 7 * 60;
export const PLAN_TO = 22 * 60;
const STEP = 30;
const CHECK_WEEKS = 4;
const MAX_PER_WEEK = 5;
const clean = (value) => String(value ?? '').trim();
const overlaps = (a, b) => a.start < b.end && b.start < a.end;
const spanOf = (time, duration) => ({ start: toMinutes(time), end: toMinutes(time) + (Number(duration) || 60) });

// The 7 dates of the weekly pattern, Monday first: each weekday's first date on or after the start date (the date the
// new weekly lesson starts on).
export function patternDates(startDate) {
  const dates = Array.from({ length: 7 }, (_, index) => shiftDate(startDate, index));
  return PLAN_DAYS.map((day) => dates.find((date) => dayOfDate(date) === day));
}

// next Monday (the default start of a new timetable)
export function nextMonday(today) {
  const offset = (8 - new Date(`${today}T12:00:00`).getDay()) % 7 || 7;
  return shiftDate(today, offset);
}

const sameTeacher = (a, b) => (a.teacherUid && b.teacherUid ? a.teacherUid === b.teacherUid : Boolean(a.teacher && b.teacher) && isSameTeacher(a.teacher, b.teacher));

// a track's stored state (the same rule as students/studentDirectionsModel.trackStatus)
const trackActive = (track = {}) => track.status !== 'ended' && track.status !== 'paused' && !(track.active === false && track.status !== 'paused');

// lessons per week a direction had: the active weekly series ahead, else the most lessons in one of the last 8 weeks
function perWeekOf(own, today, series) {
  if (series.length) return Math.min(MAX_PER_WEEK, series.length);
  let most = 0;
  for (let week = 1; week <= 8; week += 1) {
    const dates = Array.from({ length: 7 }, (_, index) => shiftDate(today, -7 * week + index));
    const count = dates.reduce((sum, date) => sum + own.filter((event) => event.status !== 'Tühistatud' && eventOccursOn(event, date)).length, 0);
    most = Math.max(most, count);
  }
  return Math.max(1, Math.min(MAX_PER_WEEK, most));
}

/**
 * The study directions to plan: one per active track (student × subject × teacher) of an active card that has no
 * weekly lesson ahead (a group lesson of the same teacher counts as planned too). `includePlanned` also takes the
 * directions with a weekly series ahead (a full re-plan; their series are listed in `replaces`, groups never).
 * teacherUid: only this teacher's directions. teachers: [{ id, name }] to find the account of a track named by name.
 * → [{ key, studentId, studentName, subject, level, teacherUid, teacher, duration, online, perWeek, planned, replaces }]
 */
export function planningRequests({ students = [], events = [], today, teacherUid = '', teachers = [], includePlanned = false }) {
  const out = [];
  for (const student of students) {
    if (!student?.id || student.active === false || student.convertedToParent) continue;
    if (student.planningPausedUntil && student.planningPausedUntil >= today) continue;
    const list = Array.isArray(student.enrollments) && student.enrollments.length ? student.enrollments : [student];
    const subjects = list.filter(Boolean).map((track) => subjectName(track.subject || student.subject) || 'Eesti keel');
    list.forEach((track, index) => {
      if (!track || !trackActive(track)) return;
      const subject = subjects[index];
      const name = clean(track.teacher || (list.length === 1 ? student.teacher : ''));
      let uid = clean(track.teacherUid || (list.length === 1 ? student.teacherUid : ''));
      if (!uid && name) uid = teachers.find((teacher) => isSameTeacher(teacher.name, name))?.id || '';
      const teacher = name || teachers.find((entry) => entry.id === uid)?.name || '';
      if (teacherUid && uid !== teacherUid) return;
      const twins = subjects.filter((value) => value === subject).length > 1;
      const who = { teacherUid: uid, teacher };
      const own = events.filter((event) => !event.isGroup && event.studentId === student.id && itemSubject(event, student) === subject
        && (!twins || (!uid && !teacher) || sameTeacher(event, who)));
      const series = own.filter((event) => event.recurring && hasLessonAhead(event, today));
      const inGroup = events.some((event) => event.isGroup && (event.studentIds || []).includes(student.id) && hasLessonAhead(event, today) && (uid || teacher) && sameTeacher(event, who));
      if (inGroup || (series.length && !includePlanned)) return;
      out.push({
        key: `${student.id}|${subject}|${uid || teacher}`,
        studentId: student.id,
        studentName: clean(student.name) || 'Õpilane',
        subject,
        level: clean(track.level || (list.length === 1 ? student.level : '')),
        teacherUid: uid,
        teacher,
        duration: usualDuration(own, student.id, uid),
        online: usualOnline(own, student.id) ?? usualOnline(events, student.id) ?? false,
        perWeek: perWeekOf(own, today, series),
        planned: series.length > 0,
        replaces: series.map((event) => event.id),
      });
    });
  }
  return out.sort((a, b) => a.studentName.localeCompare(b.studentName, 'et') || a.subject.localeCompare(b.subject, 'et') || a.key.localeCompare(b.key));
}

const holdsRoom = (booking) => Boolean(booking?.roomId) && booking.status !== 'Tühistatud' && booking.online !== true;

/**
 * What the planner decides with, computed once: the pattern dates, every lesson that stays (any teacher, groups too)
 * on the pattern dates and the next 3 weeks, and every room's taken time (12 weeks, like a new weekly lesson's room).
 * replacedIds: weekly series that a re-plan replaces (they free their teacher, student and room).
 */
export function plannerContext({ startDate, events = [], replacedIds = [], studentTimes = new Map(), teacherTimes = () => null, rooms = [], bookings = [], weeks = CHECK_WEEKS }) {
  const dates = patternDates(startDate);
  const replaced = new Set(replacedIds);
  const kept = events.filter((event) => !replaced.has(event.id) && event.status !== 'Tühistatud');
  const fixedByDate = new Map(dates.map((date) => [date, []]));
  dates.forEach((date) => {
    for (let week = 0; week < weeks; week += 1) {
      const day = shiftDate(date, week * 7);
      kept.forEach((event) => {
        if (!eventOccursOn(event, day) || event.occurrenceStatuses?.[day]?.status === 'Tühistatud') return;
        fixedByDate.get(date).push({
          id: event.id, date: day, ...spanOf(event.time, event.duration), teacherUid: event.teacherUid || '', teacher: event.teacher || '',
          studentIds: event.isGroup ? (event.studentIds || []) : [event.studentId].filter(Boolean),
          label: event.isGroup ? `grupp ${event.studentName || ''}`.trim() : event.studentName || 'tund',
        });
      });
    }
  });
  const activeRooms = rooms.filter((room) => room.active !== false);
  const roomBusy = new Map();
  if (activeRooms.length) {
    const held = bookings.filter((booking) => holdsRoom(booking) && !replaced.has(booking.scheduleId));
    dates.forEach((date) => activeRooms.forEach((room) => {
      const spans = [];
      for (let week = 0; week < ROOM_WEEKS; week += 1) {
        const day = shiftDate(date, week * 7);
        held.filter((booking) => booking.roomId === room.id && eventOccursOn(booking, day)).forEach((booking) => spans.push(spanOf(booking.time, booking.duration)));
      }
      roomBusy.set(`${room.id}|${date}`, spans);
    }));
  }
  const timesCache = new Map();
  const teacherCache = new Map();
  const studentTimesOf = (id) => (studentTimes instanceof Map ? studentTimes.get(id) : studentTimes?.[id]) || null;
  return {
    startDate, dates, weeks, fixedByDate, rooms: activeRooms, roomBusy,
    studentTimes: (id) => { if (!timesCache.has(id)) timesCache.set(id, studentTimesOf(id)); return timesCache.get(id); },
    teacherTimes: (who) => {
      const key = who.teacherUid || who.teacher || '';
      if (!teacherCache.has(key)) {
        const availability = teacherTimes(who) || null;
        teacherCache.set(key, { availability, hasGreen: dates.some((date) => effectiveSlots(availability, date).some((slot) => slot.kind === 'free')) });
      }
      return teacherCache.get(key);
    },
  };
}

const LEARNED_TEXT = { ok: 'õpilane käis varem sel ajal (sobivaid aegu pole märgitud)', unknown: 'õpilane pole sel ajal käinud (sobivaid aegu pole märgitud)' };
const STUDENT_TEXT = { ok: 'sobib õpilasele (pole ★)', partial: 'osaliselt väljaspool õpilase sobivaid aegu', none: 'õpilasele see aeg ei sobi', unknown: 'õpilase sobivad ajad puuduvad' };

/**
 * How one lesson fits at date + time, next to the lessons that stay and the other draft lessons.
 * lesson: { id, studentId, teacherUid, teacher, duration, online }
 * → { colour: 'green' | 'yellow' | 'red', student, teacher, needsAgreement, overlaps: [{ label, kind }], noRoom, roomId,
 *     reasons: [text], penalty }
 * green: ★ time of the student, the teacher free (or the teacher marked no green time at all); yellow: the student
 * marked it suitable but not ★, the teacher gives only online lessons there (an online lesson), or it is outside the
 * teacher's green time; red: the student cannot, the teacher cannot (red, or yellow for a lesson on site), it overlaps
 * another lesson of the teacher or the student, or no room is free. Red can still be chosen: agree it with the student.
 */
export function judgeSlot(ctx, lesson, { date, time }, draft = []) {
  const duration = Number(lesson.duration) || 60;
  const span = spanOf(time, duration);
  const own = ctx.studentTimes(lesson.studentId);
  const learned = Boolean(own?.learned);
  // a learned time (from past lessons) only says when the student did come: another time is unknown, not „cannot”
  const marked = studentStateAt(own, { date, time, duration });
  const student = learned && (marked === 'none' || marked === 'partial') ? 'unknown' : marked;
  const { availability, hasGreen } = ctx.teacherTimes(lesson);
  const windows = Array.from({ length: ctx.weeks }, (_, week) => availabilityAt(availability, { date: shiftDate(date, week * 7), time, duration }));
  const teacher = windows.includes('busy') ? 'busy' : windows.includes('online') ? 'online' : windows.every((state) => state === 'free') ? 'free' : 'open';
  const fixed = (ctx.fixedByDate.get(date) || []).filter((entry) => overlaps(entry, span));
  const day = dayOfDate(date);
  const others = draft.filter((other) => other.id !== lesson.id && other.day === day && overlaps(spanOf(other.time, other.duration), span));
  const list = [];
  const seen = new Set();
  const add = (label, kind) => { const key = `${kind}|${label}`; if (!seen.has(key)) { seen.add(key); list.push({ label, kind }); } };
  fixed.forEach((entry) => {
    if (entry.studentIds.includes(lesson.studentId)) add(entry.label, 'student');
    else if (sameTeacher(entry, lesson)) add(entry.label, 'teacher');
  });
  others.forEach((other) => {
    if (other.studentId === lesson.studentId) add(other.studentName || 'tund', 'student');
    else if (sameTeacher(other, lesson)) add(other.studentName || 'tund', 'teacher-draft');
  });
  let roomId = '';
  let noRoom = false;
  if (!lesson.online && ctx.rooms.length) {
    const free = ctx.rooms.filter((room) => !(ctx.roomBusy.get(`${room.id}|${date}`) || []).some((taken) => overlaps(taken, span))
      && !others.some((other) => !other.online && other.roomId === room.id));
    const own = free.find((room) => room.id === lesson.roomId);
    roomId = (own || free[0])?.id || '';
    noRoom = !roomId;
  }
  const studentOk = student === 'best' || student === 'ok';
  const teacherBad = teacher === 'busy' || (teacher === 'online' && !lesson.online);
  const needsAgreement = !studentOk || teacherBad;
  const teacherGreen = teacher === 'free' || (teacher === 'open' && !hasGreen);
  const colour = needsAgreement || list.length || noRoom ? 'red' : student === 'best' && teacherGreen ? 'green' : 'yellow';
  const reasons = [];
  if (student === 'best') reasons.push('★ õpilase eelistatud aeg');
  else reasons.push(learned ? LEARNED_TEXT[student] : STUDENT_TEXT[student]);
  if (teacher === 'busy') reasons.push('õpetaja ei saa (punane aeg)');
  else if (teacher === 'online') reasons.push(lesson.online ? 'õpetajal ainult veebitunnid (veebitund sobib)' : 'õpetajal ainult veebitunnid, tund on kohapeal');
  else if (teacher === 'open' && hasGreen) reasons.push('väljaspool õpetaja vaba aega');
  if (list.length) reasons.push(`Kattub: ${list.map((entry) => entry.label).join(', ')}`);
  if (noRoom) reasons.push('vaba kabinetti pole');
  const penalty = ({ best: 0, ok: 10, partial: 100, none: 200, unknown: 150 })[student]
    + (teacher === 'busy' ? 150 : teacher === 'online' ? (lesson.online ? 3 : 120) : teacher === 'open' && hasGreen ? 5 : 0)
    + list.reduce((sum, entry) => sum + (entry.kind === 'student' ? 1000 : entry.kind === 'teacher' || learned ? 300 : 80), 0)
    + (noRoom ? 90 : 0);
  return { colour, student, teacher, needsAgreement, overlaps: list, noRoom, roomId, reasons, penalty };
}

// the start times one lesson is tried at on one date: every half hour where the whole lesson fits the day
const startsOn = (duration) => {
  const out = [];
  for (let start = PLAN_FROM; start + duration <= PLAN_TO; start += STEP) out.push(toClock(start));
  return out;
};

// the student's own half hours of a date (a lesson that starts there touches the student's time at least)
const studentStarts = (availability, date, duration) => {
  if (!hasTimes(availability)) return [];
  const day = dayOfDate(date);
  return startsOn(duration).filter((time) => availability.slots.includes(`${day}-${time}`));
};

const dateIndex = (ctx, date) => ctx.dates.indexOf(date);

// the placed lesson of a request
function placed(request, ctx, slot, judged, index) {
  return {
    id: `${request.key}#${index}`,
    key: request.key,
    studentId: request.studentId,
    studentName: request.studentName,
    subject: request.subject,
    teacherUid: request.teacherUid,
    teacher: request.teacher,
    duration: Number(request.duration) || 60,
    online: Boolean(request.online),
    date: slot.date,
    day: dayOfDate(slot.date),
    time: slot.time,
    roomId: judged.roomId || '',
  };
}

// a student's lessons on the same weekday (any direction) cost a little: spread a student's lessons over the week
const spreadCost = (lesson, date, draft) => draft.filter((other) => other.studentId === lesson.studentId && other.id !== lesson.id && other.day === dayOfDate(date)).length * 20;

// the best good (green / yellow) time for a lesson, or null
function bestGood(ctx, lesson, draft) {
  const availability = ctx.studentTimes(lesson.studentId);
  let best = null;
  ctx.dates.forEach((date) => studentStarts(availability, date, Number(lesson.duration) || 60).forEach((time) => {
    const judged = judgeSlot(ctx, lesson, { date, time }, draft);
    if (judged.colour === 'red') return;
    const cost = judged.penalty + spreadCost(lesson, date, draft);
    if (!best || cost < best.cost) best = { date, time, judged, cost };
  }));
  return best;
}

// One step of backtracking: a good time where only one or two other draft lessons of the same teacher are in the way
// (never lessons that stay, never ones moved by hand), and each of them can go to another good time of its own.
function repair(ctx, lesson, draft, limit = 40) {
  const availability = ctx.studentTimes(lesson.studentId);
  const tries = [];
  ctx.dates.forEach((date) => studentStarts(availability, date, Number(lesson.duration) || 60).forEach((time) => {
    const alone = judgeSlot(ctx, lesson, { date, time }, []);
    if (alone.colour !== 'red') tries.push({ date, time, cost: alone.penalty + spreadCost(lesson, date, draft) });
  }));
  tries.sort((a, b) => a.cost - b.cost || dateIndex(ctx, a.date) - dateIndex(ctx, b.date) || a.time.localeCompare(b.time));
  for (const slot of tries.slice(0, limit)) {
    const span = spanOf(slot.time, lesson.duration);
    const day = dayOfDate(slot.date);
    const blockers = draft.filter((other) => other.day === day && overlaps(spanOf(other.time, other.duration), span)
      && (other.studentId === lesson.studentId || sameTeacher(other, lesson)));
    if (!blockers.length || blockers.length > 2 || blockers.some((other) => other.pinned || other.studentId === lesson.studentId)) continue;
    let next = draft.filter((other) => !blockers.includes(other));
    const here = { ...lesson, date: slot.date, day, time: slot.time };
    const judged = judgeSlot(ctx, here, slot, next);
    if (judged.colour === 'red') continue;
    next = [...next, { ...here, roomId: judged.roomId }];
    let ok = true;
    for (const blocker of blockers) {
      const moved = bestGood(ctx, blocker, next);
      if (!moved) { ok = false; break; }
      next = [...next, { ...blocker, date: moved.date, day: dayOfDate(moved.date), time: moved.time, roomId: moved.judged.roomId }];
    }
    if (ok) return next;
  }
  return null;
}

// the least bad time when no good one is left: the student's own times first (an overlap with another student of the
// same teacher is allowed — the owner wants it), else any time of the day
function fallback(ctx, lesson, draft) {
  const availability = ctx.studentTimes(lesson.studentId);
  const duration = Number(lesson.duration) || 60;
  let best = null;
  const tryAt = (date, time, extra = 0) => {
    const judged = judgeSlot(ctx, lesson, { date, time }, draft);
    const cost = judged.penalty + spreadCost(lesson, date, draft) + extra;
    if (!best || cost < best.cost) best = { date, time, judged, cost };
  };
  ctx.dates.forEach((date) => studentStarts(availability, date, duration).forEach((time) => tryAt(date, time)));
  // any time of the day: usual lesson hours first — not 7:00, not late evening, weekdays before the weekend
  const unusual = (date, time) => { const hour = Number(time.slice(0, 2)); return (hour < 9 ? 60 : hour < 12 ? 15 : hour >= 20 ? 30 : 0) + (['Sat', 'Sun'].includes(dayOfDate(date)) ? 30 : 0); };
  if (!best || best.judged.overlaps.length) ctx.dates.forEach((date) => startsOn(duration).forEach((time) => tryAt(date, time, 50 + unusual(date, time))));
  return best;
}

/**
 * „Jaota”: place every request's lessons on the weekly pattern. Deterministic: the hardest first (fewest good times),
 * then more lessons per week, then by name. Each lesson takes its best good time (★ before suitable, the teacher's
 * green before the rest, a student's lessons on different days); when none is left one step of backtracking moves a
 * draft lesson in the way to another good time; else the least bad time is taken (an overlap or a time to agree on).
 * A request without a teacher, or a student without any „Sobivad ajad”, goes to `unplaced` with its reason.
 * kept: draft lessons moved by hand (pinned) — they stay where they are and count.
 * → { lessons: [...kept, ...placed], unplaced: [{ key, reason: 'no-teacher' | 'no-times' | 'no-slot' }] }
 */
export function distribute(ctx, requests = [], kept = []) {
  const unplaced = [];
  let lessons = [...kept];
  const keptCount = (key) => kept.filter((lesson) => lesson.key === key).length;
  const ready = [];
  requests.forEach((request) => {
    if (!request.teacherUid && !request.teacher) { unplaced.push({ key: request.key, reason: 'no-teacher' }); return; }
    if (!hasTimes(ctx.studentTimes(request.studentId))) { unplaced.push({ key: request.key, reason: 'no-times' }); return; }
    const availability = ctx.studentTimes(request.studentId);
    const probe = { ...request, id: `${request.key}#probe` };
    const options = ctx.dates.reduce((sum, date) => sum + studentStarts(availability, date, Number(request.duration) || 60)
      .filter((time) => judgeSlot(ctx, probe, { date, time }, []).colour !== 'red').length, 0);
    ready.push({ request, options });
  });
  ready.sort((a, b) => a.options - b.options || (b.request.perWeek || 1) - (a.request.perWeek || 1)
    || a.request.studentName.localeCompare(b.request.studentName, 'et') || a.request.key.localeCompare(b.request.key));
  ready.forEach(({ request }) => {
    const need = Math.max(0, Math.min(MAX_PER_WEEK, Number(request.perWeek) || 1) - keptCount(request.key));
    for (let index = 0; index < need; index += 1) {
      let number = index;
      while (lessons.some((lesson) => lesson.id === `${request.key}#${number}`)) number += 1;
      const lesson = { ...placed(request, ctx, { date: ctx.dates[0], time: '08:00' }, {}, number), day: '', date: '', time: '' };
      const good = bestGood(ctx, lesson, lessons);
      if (good) { lessons = [...lessons, placed(request, ctx, good, good.judged, number)]; continue; }
      const repaired = repair(ctx, lesson, lessons);
      if (repaired) { lessons = repaired; continue; }
      const least = fallback(ctx, lesson, lessons);
      if (least) lessons = [...lessons, placed(request, ctx, least, least.judged, number)];
      else unplaced.push({ key: request.key, reason: 'no-slot' });
    }
  });
  return { lessons: sortLessons(ctx, lessons), unplaced };
}

export const sortLessons = (ctx, lessons) => [...lessons].sort((a, b) => dateIndex(ctx, a.date) - dateIndex(ctx, b.date) || a.time.localeCompare(b.time) || a.studentName.localeCompare(b.studentName, 'et') || a.id.localeCompare(b.id));

// every draft lesson with its fit; status: 'best' (★, all fine) | 'ok' (suitable) | 'agree' (agree with the student)
// | 'overlap' (overlaps another lesson, or no room)
export function judgeAll(ctx, lessons = []) {
  return lessons.map((lesson) => {
    const fit = judgeSlot(ctx, lesson, { date: lesson.date, time: lesson.time }, lessons);
    const status = fit.overlaps.length || fit.noRoom ? 'overlap' : fit.needsAgreement ? 'agree' : fit.colour === 'green' ? 'best' : 'ok';
    return { lesson, fit, status, flagged: status === 'overlap' || status === 'agree' };
  });
}

export function planSummary(judged = [], unplaced = []) {
  const count = (status) => judged.filter((entry) => entry.status === status).length;
  return { best: count('best'), ok: count('ok'), agree: count('agree'), overlap: count('overlap'), unplaced: unplaced.length, total: judged.length };
}

/**
 * Colours for dragging one lesson (or placing an unplaced student): per half hour of a date the colour a lesson
 * starting there would get. → [{ kind: 'plan-green' | 'plan-yellow' | 'plan-red', start, end, title }] joined.
 */
export function dragMarks(ctx, lesson, date, draft = [], { from = 8 * 60, to = 21 * 60 } = {}) {
  if (!lesson || !ctx.dates.includes(date)) return [];
  const duration = Number(lesson.duration) || 60;
  const marks = [];
  for (let start = Math.max(PLAN_FROM, from); start < Math.min(PLAN_TO, to); start += STEP) {
    const judged = judgeSlot(ctx, lesson, { date, time: toClock(start) }, draft);
    marks.push({ kind: `plan-${judged.colour}`, start, end: start + STEP, title: `${toClock(start)}–${toClock(start + duration)}: ${judged.reasons.join(' · ')}` });
  }
  return marks;
}

/**
 * The weekly lessons „Kinnita ajakava” creates: the same fields as the „Uus tund” form (date = the lesson's first
 * date on or after the start date, weekly). Rooms are assigned again when saving. Every lesson of one „Kinnita” carries
 * `source: 'planner'` and the same `plannerBatchId` (the schedule e-mail of agent/learner-emails groups by it).
 */
export function lessonPayload(lesson, { batchId = '' } = {}) {
  return {
    studentId: lesson.studentId,
    studentName: lesson.studentName,
    teacher: lesson.teacher,
    teacherUid: lesson.teacherUid,
    ...(lesson.subject ? { subject: lesson.subject } : {}),
    date: lesson.date,
    time: lesson.time,
    duration: Number(lesson.duration) || 60,
    recurring: true,
    online: Boolean(lesson.online),
    roomId: lesson.online ? '' : lesson.roomId || '',
    status: 'Planeeritud',
    source: 'planner',
    ...(batchId ? { plannerBatchId: batchId } : {}),
  };
}

// moving a draft lesson to another date / time: it is pinned (a new „Jaota” keeps it)
export function moveDraft(ctx, lessons, id, { date, time, duration }) {
  return sortLessons(ctx, lessons.map((lesson) => {
    if (lesson.id !== id) return lesson;
    const next = { ...lesson, date, day: dayOfDate(date), time, duration: Number(duration) || lesson.duration, pinned: true };
    return { ...next, roomId: judgeSlot(ctx, next, { date, time }, lessons).roomId };
  }));
}

// an unplaced request put at a date / time by hand
export function placeRequest(ctx, lessons, request, { date, time }) {
  let number = 0;
  while (lessons.some((lesson) => lesson.id === `${request.key}#${number}`)) number += 1;
  const lesson = { ...placed(request, ctx, { date, time }, {}, number), pinned: true };
  return sortLessons(ctx, [...lessons, { ...lesson, roomId: judgeSlot(ctx, lesson, { date, time }, lessons).roomId }]);
}

export const UNPLACED_TEXT = {
  'no-times': 'Sobivad ajad puuduvad',
  'no-teacher': 'Õpetaja määramata',
  'no-slot': 'Aega ei leitud',
  missing: 'Paigutamata',
};

// requests with fewer lessons in the draft than they need (the ones „Jaota” could not place, or removed by hand)
export function openRequests(requests = [], lessons = [], unplaced = []) {
  const reasons = new Map(unplaced.map((entry) => [entry.key, entry.reason]));
  return requests.map((request) => ({ request, missing: Math.max(0, (Number(request.perWeek) || 1) - lessons.filter((lesson) => lesson.key === request.key).length), reason: reasons.get(request.key) || 'missing' }))
    .filter((entry) => entry.missing > 0);
}
