"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const {
  GOOGLE_SCOPE_EVENTS_OWNED,
  hasCalendarWriteScope,
  addLocalMinutes,
  googleRecurrenceExcludedDates,
  scheduleToGoogleEvent,
  scheduleSyncFingerprint,
  managedGoogleScheduleId,
  isKeeleSeppManagedGoogleEvent,
  isGoogleGoneError,
} = require("./calendar-sync-core");

test("write access is enabled only for Google Calendar write scopes", () => {
  assert.equal(hasCalendarWriteScope("https://www.googleapis.com/auth/calendar.readonly"), false);
  assert.equal(hasCalendarWriteScope(GOOGLE_SCOPE_EVENTS_OWNED), true);
  assert.equal(hasCalendarWriteScope([
    "openid",
    "https://www.googleapis.com/auth/calendar.events",
  ]), true);
});

test("local lesson end time can cross midnight without changing timezone semantics", () => {
  assert.equal(addLocalMinutes("2026-07-29", "23:30", 60), "2026-07-30T00:30:00");
});

test("one-time lesson becomes a private Google event with stable origin metadata", () => {
  const event = scheduleToGoogleEvent("schedule_1", {
    studentId: "student_1",
    studentName: "Anna Test",
    teacherUid: "teacher_1",
    date: "2026-08-03",
    time: "14:15",
    duration: 45,
    status: "Planeeritud",
    notes: "Korrata sõnavara",
  });
  assert.equal(event.summary, "KeeleSepp — Anna Test");
  assert.equal(event.start.dateTime, "2026-08-03T14:15:00");
  assert.equal(event.end.dateTime, "2026-08-03T15:00:00");
  assert.equal(event.visibility, "private");
  assert.deepEqual(event.extendedProperties.private, {
    keeleseppOrigin: "keelesepp",
    keeleseppScheduleId: "schedule_1",
    keeleseppStudentId: "student_1",
    keeleseppVersion: "1",
  });
});

test("weekly lesson keeps its recurrence and cancellation has no Google payload", () => {
  const event = scheduleToGoogleEvent("series_1", {
    studentId: "student_2",
    studentName: "Mark Test",
    startDate: "2026-08-05",
    day: "Wed",
    time: "10:00",
    duration: 60,
    recurring: true,
    status: "Planeeritud",
  });
  assert.deepEqual(event.recurrence, ["RRULE:FREQ=WEEKLY;BYDAY=WE"]);
  assert.equal(scheduleToGoogleEvent("series_1", {
    studentId: "student_2",
    status: "Tühistatud",
  }), null);
});

test("weekly lesson exports and reads occurrence exclusions as EXDATE lines", () => {
  const event = scheduleToGoogleEvent("series_exdates", {
    studentId: "student_2",
    studentName: "Mark Test",
    startDate: "2026-08-05",
    day: "Wed",
    time: "10:00",
    duration: 60,
    recurring: true,
    status: "Planeeritud",
    excludedDates: ["2026-08-12", "invalid", "2026-08-05", "2026-08-12"],
  }, "Europe/Tallinn");
  assert.deepEqual(event.recurrence, [
    "RRULE:FREQ=WEEKLY;BYDAY=WE",
    "EXDATE;TZID=Europe/Tallinn:20260805T100000",
    "EXDATE;TZID=Europe/Tallinn:20260812T100000",
  ]);
  assert.deepEqual(googleRecurrenceExcludedDates(event), [
    "2026-08-05",
    "2026-08-12",
  ]);
});

test("fingerprint changes only when Google-visible lesson data changes", () => {
  const schedule = {
    studentId: "student_3",
    studentName: "Liis Test",
    teacherUid: "teacher_3",
    date: "2026-08-06",
    time: "12:00",
    duration: 60,
    status: "Planeeritud",
  };
  const before = scheduleSyncFingerprint("schedule_3", schedule);
  const bookkeepingOnly = scheduleSyncFingerprint("schedule_3", {
    ...schedule,
    gcalSyncedAt: "later",
    gcalSyncStatus: "synced",
  });
  const moved = scheduleSyncFingerprint("schedule_3", { ...schedule, time: "12:15" });
  const excluded = scheduleSyncFingerprint("schedule_3", {
    ...schedule,
    recurring: true,
    startDate: schedule.date,
    date: "",
    day: "Thu",
    excludedDates: ["2026-08-13"],
  });
  assert.equal(before, bookkeepingOnly);
  assert.notEqual(before, moved);
  assert.notEqual(before, excluded);
});

test("managed origin ids are validated and Google deletion errors are idempotent", () => {
  const event = {
    extendedProperties: {
      private: {
        keeleseppOrigin: "keelesepp",
        keeleseppScheduleId: "schedule_4",
      },
    },
  };
  assert.equal(managedGoogleScheduleId(event), "schedule_4");
  assert.equal(isKeeleSeppManagedGoogleEvent(event), true);
  assert.equal(managedGoogleScheduleId({
    extendedProperties: { private: { keeleseppScheduleId: "../unsafe" } },
  }), "");
  assert.equal(isGoogleGoneError({ response: { status: 410 } }), true);
  assert.equal(isGoogleGoneError({ code: 403 }), false);
});
