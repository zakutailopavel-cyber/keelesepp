"use strict";

const crypto = require("crypto");

const GOOGLE_SCOPE_EVENTS = "https://www.googleapis.com/auth/calendar.events";
const GOOGLE_SCOPE_EVENTS_OWNED = "https://www.googleapis.com/auth/calendar.events.owned";
const GOOGLE_SCOPE_CALENDAR = "https://www.googleapis.com/auth/calendar";
const DAY_TO_RRULE = {
  Mon: "MO",
  Tue: "TU",
  Wed: "WE",
  Thu: "TH",
  Fri: "FR",
  Sat: "SA",
  Sun: "SU",
};

function scopeList(value) {
  if (Array.isArray(value)) return value.map(String).map(item => item.trim()).filter(Boolean);
  return String(value || "").split(/\s+/).map(item => item.trim()).filter(Boolean);
}

function normalizeCalendarName(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function extractCalendarStudentName(title) {
  if (!title) return null;
  const word = "[\\p{L}][\\p{L}\\p{M}'’.-]*";
  const name = `${word}(?:\\s+${word}){0,3}`;
  const dashMatch = String(title).match(new RegExp(`[—–-]\\s*(${name})`, "u"));
  if (dashMatch) return dashMatch[1].trim();
  const lessonMatch = String(title).match(new RegExp(`(?:Занятие|Урок|Tund|Õppetund|Lesson)\\s+(${name})`, "iu"));
  if (lessonMatch) return lessonMatch[1].trim();
  const plainMatch = String(title).trim().match(new RegExp(`^(${name})$`, "u"));
  return plainMatch ? plainMatch[1].trim() : null;
}

function hasCalendarWriteScope(value) {
  const scopes = new Set(scopeList(value));
  return scopes.has(GOOGLE_SCOPE_EVENTS)
    || scopes.has(GOOGLE_SCOPE_EVENTS_OWNED)
    || scopes.has(GOOGLE_SCOPE_CALENDAR);
}

function localDateTime(date, time) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(date || ""))) return "";
  if (!/^\d{2}:\d{2}$/.test(String(time || ""))) return "";
  return `${date}T${time}:00`;
}

function addLocalMinutes(date, time, duration) {
  const stamp = localDateTime(date, time);
  if (!stamp) return "";
  const [year, month, day] = date.split("-").map(Number);
  const [hour, minute] = time.split(":").map(Number);
  const value = new Date(Date.UTC(year, month - 1, day, hour, minute));
  value.setUTCMinutes(value.getUTCMinutes() + Math.max(5, Number(duration) || 60));
  return [
    value.getUTCFullYear(),
    String(value.getUTCMonth() + 1).padStart(2, "0"),
    String(value.getUTCDate()).padStart(2, "0"),
  ].join("-") + `T${String(value.getUTCHours()).padStart(2, "0")}:${String(value.getUTCMinutes()).padStart(2, "0")}:00`;
}

function recurrenceStartDate(schedule) {
  return String(schedule.date || schedule.startDate || "").trim();
}

function recurrenceExcludedDates(schedule) {
  return [...new Set((Array.isArray(schedule?.excludedDates) ? schedule.excludedDates : [])
    .map(value => String(value || "").trim())
    .filter(value => /^\d{4}-\d{2}-\d{2}$/.test(value)))].sort();
}

function googleRecurrenceExcludedDates(event) {
  const dates = [];
  (Array.isArray(event?.recurrence) ? event.recurrence : []).forEach(line => {
    if (!/^EXDATE(?:;|:)/i.test(String(line || ""))) return;
    const values = String(line).split(":").slice(1).join(":").split(",");
    values.forEach(value => {
      const match = value.trim().match(/^(\d{4})(\d{2})(\d{2})/);
      if (match) dates.push(`${match[1]}-${match[2]}-${match[3]}`);
    });
  });
  return [...new Set(dates)].sort();
}

function googleDateTimePart(value, timeZone, part) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date).reduce((result, item) => {
    result[item.type] = item.value;
    return result;
  }, {});
  if (part === "date") return `${parts.year}-${parts.month}-${parts.day}`;
  if (part === "time") return `${parts.hour}:${parts.minute}`;
  return "";
}

function googleOriginalOccurrenceDate(event, timeZone = "Europe/Tallinn") {
  const original = event?.originalStartTime || {};
  if (/^\d{4}-\d{2}-\d{2}$/.test(String(original.date || ""))) {
    return String(original.date);
  }
  return googleDateTimePart(original.dateTime, original.timeZone || timeZone, "date");
}

function managedGoogleOccurrenceExceptionId(seriesId, eventId) {
  const parent = String(seriesId || "").trim();
  const instance = String(eventId || "").trim();
  if (!parent || !instance) return "";
  const digest = crypto.createHash("sha256")
    .update(`${parent}:${instance}`)
    .digest("hex")
    .slice(0, 40);
  return `gcalx_${digest}`;
}

function dayFromIsoDate(date) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(date || ""))) return "";
  return ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][
    new Date(`${date}T12:00:00Z`).getUTCDay()
  ];
}

function googleOccurrenceExceptionSchedule(
  seriesId,
  parent,
  event,
  timeZone = "Europe/Tallinn",
  nowIso = new Date().toISOString(),
) {
  if (!seriesId || !parent?.studentId || !event?.id || !event?.recurringEventId) return null;
  const originalDate = googleOriginalOccurrenceDate(event, timeZone);
  if (!originalDate) return null;

  const cancelled = event.status === "cancelled";
  const startValue = event.start?.dateTime || event.start?.date || "";
  const actualTimeZone = event.start?.timeZone || event.end?.timeZone || timeZone;
  const actualDate = event.start?.date
    || googleDateTimePart(startValue, actualTimeZone, "date")
    || originalDate;
  const actualTime = event.start?.dateTime
    ? googleDateTimePart(startValue, actualTimeZone, "time")
    : String(parent.time || "");
  let duration = Math.max(5, Number(parent.duration) || 60);
  if (event.start?.dateTime && event.end?.dateTime) {
    const calculated = Math.round(
      (new Date(event.end.dateTime).getTime() - new Date(event.start.dateTime).getTime()) / 60000,
    );
    if (Number.isFinite(calculated) && calculated >= 5) duration = calculated;
  }
  const moved = !cancelled && (
    actualDate !== originalDate || actualTime !== String(parent.time || "")
  );
  const occurrenceKind = cancelled ? "cancelled" : moved ? "moved" : "override";

  return {
    title: String(event.summary || parent.title || "").slice(0, 300),
    studentId: String(parent.studentId),
    studentName: String(parent.studentName || ""),
    teacher: String(parent.teacher || ""),
    teacherFull: String(parent.teacherFull || parent.teacher || ""),
    teacherUid: String(parent.teacherUid || ""),
    date: actualDate,
    startDate: "",
    day: dayFromIsoDate(actualDate),
    time: actualTime,
    duration,
    recurring: false,
    status: cancelled ? "Tühistatud" : "Planeeritud",
    notes: String(event.description || parent.notes || "").slice(0, 2000),
    source: "gcal",
    scheduleVersion: 3,
    seriesId: String(seriesId),
    originalOccurrenceDate: originalDate,
    originalDate,
    originalTime: String(parent.time || ""),
    occurrenceKind,
    gcalNativeException: true,
    gcalEventId: String(event.id),
    gcalRecurringEventId: String(event.recurringEventId),
    gcalCalId: String(event.calendarId || "primary"),
    gcalEtag: String(event.etag || ""),
    gcalSyncStatus: "synced",
    gcalSyncedAt: nowIso,
    gcalLastImportedAt: nowIso,
    updatedAt: nowIso,
    updatedAtIso: nowIso,
  };
}

function googleNativeExclusionState({
  previousExcludedDates = [],
  previousNativeDates = [],
  currentNativeDates = [],
  googleExcludedDates = [],
  windowStart = "",
  windowEnd = "",
} = {}) {
  const validDates = values => [...new Set((Array.isArray(values) ? values : [])
    .map(value => String(value || "").trim())
    .filter(value => /^\d{4}-\d{2}-\d{2}$/.test(value)))];
  const previousNative = new Set(validDates(previousNativeDates));
  const preserved = validDates(previousExcludedDates)
    .filter(date => !previousNative.has(date));
  const retainedNative = [...previousNative].filter(date =>
    !windowStart || !windowEnd || date < windowStart || date > windowEnd
  );
  const nativeDates = [...new Set([
    ...retainedNative,
    ...validDates(currentNativeDates),
  ])].sort();
  return {
    nativeDates,
    excludedDates: [...new Set([
      ...preserved,
      ...validDates(googleExcludedDates),
      ...nativeDates,
    ])].sort(),
  };
}

function scheduleToGoogleEvent(scheduleId, schedule, timeZone = "Europe/Tallinn") {
  if (!schedule || schedule.status === "Tühistatud") return null;
  const date = recurrenceStartDate(schedule);
  const time = String(schedule.time || "").trim();
  const startDateTime = localDateTime(date, time);
  const endDateTime = addLocalMinutes(date, time, schedule.duration);
  if (!scheduleId || !startDateTime || !endDateTime || !schedule.studentId) return null;

  const privateProperties = {
    keeleseppOrigin: "keelesepp",
    keeleseppScheduleId: String(scheduleId),
    keeleseppStudentId: String(schedule.studentId),
    keeleseppVersion: "1",
  };
  const description = [
    `student:${schedule.studentId}`,
    `KeeleSepp schedule:${scheduleId}`,
    schedule.notes || schedule.comment || "",
  ].filter(Boolean).join("\n");
  const event = {
    summary: `KeeleSepp — ${String(schedule.studentName || "Õpilane").trim()}`,
    description,
    start: { dateTime: startDateTime, timeZone },
    end: { dateTime: endDateTime, timeZone },
    visibility: "private",
    extendedProperties: { private: privateProperties },
  };

  if (schedule.recurring || (!schedule.date && schedule.day)) {
    const recurrenceDay = DAY_TO_RRULE[schedule.day];
    if (!recurrenceDay) return null;
    const parts = [`RRULE:FREQ=WEEKLY`, `BYDAY=${recurrenceDay}`];
    if (/^\d{4}-\d{2}-\d{2}$/.test(String(schedule.endDate || ""))) {
      parts.push(`UNTIL=${String(schedule.endDate).replaceAll("-", "")}T215959Z`);
    }
    const excludedTime = String(time).replace(":", "");
    event.recurrence = [
      parts.join(";"),
      ...recurrenceExcludedDates(schedule).map(excludedDate =>
        `EXDATE;TZID=${timeZone}:${excludedDate.replaceAll("-", "")}T${excludedTime}00`
      ),
    ];
  }
  return event;
}

function scheduleSyncFingerprint(scheduleId, schedule, timeZone = "Europe/Tallinn") {
  const event = scheduleToGoogleEvent(scheduleId, schedule, timeZone);
  const source = event || {
    cancelled: schedule?.status === "Tühistatud",
    teacherUid: String(schedule?.teacherUid || ""),
    scheduleId: String(scheduleId || ""),
  };
  return crypto.createHash("sha256").update(JSON.stringify(source)).digest("hex");
}

function managedGoogleScheduleId(event) {
  const value = String(event?.extendedProperties?.private?.keeleseppScheduleId || "").trim();
  if (!/^[A-Za-z0-9_-]{1,128}$/.test(value)) return "";
  return value;
}

function isKeeleSeppManagedGoogleEvent(event) {
  return event?.extendedProperties?.private?.keeleseppOrigin === "keelesepp"
    && Boolean(managedGoogleScheduleId(event));
}

function isGoogleGoneError(error) {
  const status = Number(error?.code || error?.response?.status || 0);
  return status === 404 || status === 410;
}

function explicitlyDeletedGoogleEventIds(events = []) {
  return new Set((Array.isArray(events) ? events : [])
    .filter(event => event?.status === "cancelled" && event?.id && !event?.recurringEventId)
    .map(event => String(event.id)));
}

function shouldApplyExplicitGoogleDeletion(schedule = {}, deletedIds = new Set(), {
  windowStart = "",
  windowEnd = "",
  nativeWindowStart = "",
  nativeWindowEnd = "",
} = {}) {
  const eventId = String(schedule.gcalEventId || "").trim();
  if (!eventId || !deletedIds?.has(eventId)) return false;
  const date = schedule.gcalNativeException
    ? String(schedule.originalOccurrenceDate || "")
    : String(schedule.date || schedule.startDate || "");
  const start = schedule.gcalNativeException ? nativeWindowStart : windowStart;
  const end = schedule.gcalNativeException ? nativeWindowEnd : windowEnd;
  if (!date || !start || !end) return false;
  return date >= start && date <= end;
}

module.exports = {
  GOOGLE_SCOPE_EVENTS,
  GOOGLE_SCOPE_EVENTS_OWNED,
  GOOGLE_SCOPE_CALENDAR,
  scopeList,
  normalizeCalendarName,
  extractCalendarStudentName,
  hasCalendarWriteScope,
  localDateTime,
  addLocalMinutes,
  recurrenceExcludedDates,
  googleRecurrenceExcludedDates,
  googleOriginalOccurrenceDate,
  managedGoogleOccurrenceExceptionId,
  googleOccurrenceExceptionSchedule,
  googleNativeExclusionState,
  scheduleToGoogleEvent,
  scheduleSyncFingerprint,
  managedGoogleScheduleId,
  isKeeleSeppManagedGoogleEvent,
  isGoogleGoneError,
  explicitlyDeletedGoogleEventIds,
  shouldApplyExplicitGoogleDeletion,
};
