"use strict";

// Live Classroom → server-side „Tund toimus” (owner 2026-11-09: marks failed silently when the teacher's tab closed or
// the calendar was opened on another device — the old path only handed the mark to the same browser's calendar,
// crm-v2/src/features/live-classroom/lessonHandoff.js, which stays as the fallback).
//
// When a 1:1 room is closed with the teacher's „märgi toimunuks” (invitation `endMark: 'held'`), the server writes the
// very record the calendar's „Tund toimus” writes (crm-v2 services/firebase/lessons.js completeFromSchedule): the same
// document id `schedule_<scheduleId>_<date>_<studentId>`, `accountingSource: 'crm_v2'`, status „Toimunud”, the schedule
// status of a one-off lesson, an activityLog entry — so syncLessonTokens, invoices and payroll see it like a manual mark.
// Never for a group room, never without a calendar occurrence, never in a closed financial period, never twice, never
// „Puudus_eta” (an absence stays the teacher's own mark in the calendar).
// Pure: the trigger (live-auto-mark.js) reads Firestore and hands the data in.

const TIME_ZONE = "Europe/Tallinn";
const WINDOW_MINUTES = 180;
const DAY_IDS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const RESULT_STATUSES = new Set(["Toimunud", "Puudus_eta", "Puudus_p"]);
const isoDate = (value) => /^\d{4}-\d{2}-\d{2}$/.test(String(value || ""));

// the same id as the client's accountingLessonId(`schedule_${id}`, date, studentId)
function lessonDocumentId(scheduleId, occurrenceDate, studentId) {
  return `schedule_${scheduleId}_${occurrenceDate}_${studentId}`.replace(/[^A-Za-z0-9_-]/g, "_").slice(0, 240);
}

// UTC instant → the school's local { date, time }
function tallinnLocal(value) {
  const at = value instanceof Date ? value : new Date(value || "");
  if (Number.isNaN(at.getTime())) return null;
  const parts = Object.fromEntries(new Intl.DateTimeFormat("en-CA", { timeZone: TIME_ZONE, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23" })
    .formatToParts(at).map((part) => [part.type, part.value]));
  return { date: `${parts.year}-${parts.month}-${parts.day}`, time: `${parts.hour === "24" ? "00" : parts.hour}:${parts.minute}` };
}
const minutesOf = (time) => {
  const match = /^(\d{1,2}):(\d{2})/.exec(String(time || ""));
  return match ? Number(match[1]) * 60 + Number(match[2]) : null;
};

// crm-v2 features/calendar/calendarView.js eventOccursOn + occurrenceStatus, for one entry and one date
function occursOn(event, date) {
  if (!event || event.status === "Tühistatud") return false;
  if (!event.recurring) return (event.date || "") === date;
  const start = event.startDate || event.date;
  if (!start || date < start || (event.endDate && date > event.endDate)) return false;
  if ((event.excludedDates || []).includes(date)) return false;
  const weekday = (value) => new Date(`${value}T12:00:00Z`).getUTCDay();
  return (event.day || DAY_IDS[weekday(start)]) === DAY_IDS[weekday(date)];
}
function statusOn(event, date) {
  const occurrence = event.occurrenceStatuses?.[date];
  if (occurrence?.status) return occurrence.status;
  if (!event.recurring || !RESULT_STATUSES.has(event.status)) return event.status || "Planeeritud";
  return (event.lessonOccurrenceDate || event.date) === date ? event.status : "Planeeritud";
}
const plannedOn = (event, date) => occursOn(event, date) && statusOn(event, date) === "Planeeritud";

// a timestamp-like value (Firestore Timestamp, Date, ISO string, millis) → Date or null
function toDate(value) {
  if (!value) return null;
  if (typeof value.toDate === "function") return value.toDate();
  if (typeof value === "object" && Number.isFinite(value.seconds)) return new Date(value.seconds * 1000);
  const at = new Date(value);
  return Number.isNaN(at.getTime()) ? null : at;
}

/**
 * Which calendar occurrence the closed room belongs to, or why none.
 * → { ok: true, entry, occurrenceDate } | { ok: false, reason }
 * `entries`: the student's schedule entries (id + data).
 */
function resolveOccurrence({ invitationId, before = {}, after = {}, entries = [] }) {
  if (after.status !== "closed" || before.status === "closed") return { ok: false, reason: "not-closing" };
  if (after.endMark !== "held") return { ok: false, reason: after.endMark === "skip" ? "teacher-skipped" : "no-end-mark" };
  if (after.roomKey && after.roomKey !== invitationId) return { ok: false, reason: "group" };
  if (!after.studentId || !after.teacherUid) return { ok: false, reason: "no-link" };
  const own = (entry) => entry && !entry.isGroup && entry.studentId === after.studentId;
  // the lesson the room was started from (calendar „Alusta tundi”)
  if (after.scheduleId) {
    const entry = entries.find((item) => item.id === after.scheduleId);
    if (!own(entry) || !isoDate(after.occurrenceDate)) return { ok: false, reason: "no-link" };
    if (!plannedOn(entry, after.occurrenceDate)) return { ok: false, reason: "not-planned" };
    return { ok: true, entry, occurrenceDate: after.occurrenceDate };
  }
  // a room started from the Live Classroom page: the student's one planned lesson with this teacher within ±3 h
  const started = tallinnLocal(toDate(after.respondedAt) || toDate(after.createdAt) || after.createdAtIso);
  if (!started) return { ok: false, reason: "no-link" };
  const startMinutes = minutesOf(started.time);
  const matches = entries.filter((entry) => own(entry) && entry.teacherUid === after.teacherUid && plannedOn(entry, started.date))
    .filter((entry) => {
      const lessonMinutes = minutesOf(entry.time);
      return lessonMinutes === null || startMinutes === null || Math.abs(lessonMinutes - startMinutes) <= WINDOW_MINUTES;
    });
  if (matches.length !== 1) return { ok: false, reason: matches.length ? "ambiguous" : "no-link" };
  return { ok: true, entry: matches[0], occurrenceDate: started.date };
}

// another record already says what happened to this lesson (any id: an older journal entry of that student that day
// with this schedule id, or with this teacher at about this time)
function alreadyMarked({ entry, occurrenceDate, records = [] }) {
  const lessonMinutes = minutesOf(entry.time);
  return records.some((record) => {
    const date = record.occurrenceDate || record.date;
    if (date !== occurrenceDate || record.studentId !== entry.studentId) return false;
    if (record.scheduleId) return record.scheduleId === entry.id;
    if (record.teacherUid && entry.teacherUid && record.teacherUid !== entry.teacherUid) return false;
    const recordMinutes = minutesOf(record.time);
    return recordMinutes === null || lessonMinutes === null || Math.abs(recordMinutes - lessonMinutes) <= 15;
  });
}

const clean = (value, max) => String(value ?? "").trim().slice(0, max);

/**
 * The lesson record, exactly the fields of completeFromSchedule's „Tund toimus” (+ liveAutoMarked / liveInvitationId).
 */
function lessonRecord({ entry, occurrenceDate, invitationId, invitation = {}, note = "", nowIso }) {
  return {
    scheduleId: entry.id,
    occurrenceDate,
    studentId: entry.studentId,
    studentName: clean(entry.studentName || invitation.studentName, 160),
    teacher: clean(entry.teacher || invitation.teacherName, 160),
    teacherUid: entry.teacherUid || invitation.teacherUid || "",
    subject: entry.subject || "Eesti keel",
    topic: "",
    topicLevel: "",
    topicModule: "",
    topicLessonId: "",
    notes: clean(note, 1000),
    date: occurrenceDate,
    time: entry.time || "",
    duration: Math.max(5, Number(entry.duration) || 60),
    status: "Toimunud",
    accountingSource: "crm_v2",
    createdAt: nowIso,
    createdByUid: invitation.teacherUid || "",
    createdByName: clean(invitation.teacherName, 160),
    liveAutoMarked: true,
    liveInvitationId: invitationId,
  };
}

function activityRecord({ record, lessonId, nowIso }) {
  return {
    type: "lesson.completed",
    label: `${record.studentName || "Õpilane"} tund märgitud toimunuks (Live Classroom)`,
    studentId: record.studentId,
    studentName: record.studentName || "",
    byUid: record.createdByUid,
    byName: record.createdByName,
    byRole: "system",
    createdAt: nowIso,
    date: record.date,
    meta: { lessonId, scheduleId: record.scheduleId, invitationId: record.liveInvitationId, auto: true },
  };
}

module.exports = { WINDOW_MINUTES, lessonDocumentId, tallinnLocal, occursOn, statusOn, plannedOn, resolveOccurrence, alreadyMarked, lessonRecord, activityRecord };
