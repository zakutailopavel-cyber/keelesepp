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

module.exports = {
  GOOGLE_SCOPE_EVENTS,
  GOOGLE_SCOPE_EVENTS_OWNED,
  GOOGLE_SCOPE_CALENDAR,
  scopeList,
  hasCalendarWriteScope,
  localDateTime,
  addLocalMinutes,
  recurrenceExcludedDates,
  googleRecurrenceExcludedDates,
  scheduleToGoogleEvent,
  scheduleSyncFingerprint,
  managedGoogleScheduleId,
  isKeeleSeppManagedGoogleEvent,
  isGoogleGoneError,
};
