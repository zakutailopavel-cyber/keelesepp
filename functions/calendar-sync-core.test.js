"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const {
  GOOGLE_SCOPE_EVENTS_OWNED,
  hasCalendarWriteScope,
  addLocalMinutes,
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

test("native Google occurrence keeps a deterministic child id and original date", () => {
  const event = {
    id: "series_google_20260812T070000Z",
    recurringEventId: "series_google",
    originalStartTime: {
      dateTime: "2026-08-12T10:00:00+03:00",
      timeZone: "Europe/Tallinn",
    },
  };
  assert.equal(googleOriginalOccurrenceDate(event), "2026-08-12");
  assert.equal(
    managedGoogleOccurrenceExceptionId("series_1", event.id),
    managedGoogleOccurrenceExceptionId("series_1", event.id),
  );
  assert.match(
    managedGoogleOccurrenceExceptionId("series_1", event.id),
    /^gcalx_[a-f0-9]{40}$/,
  );
});

test("moved Google occurrence becomes a student-owned schedule exception", () => {
  const exception = googleOccurrenceExceptionSchedule("series_1", {
    title: "KeeleSepp — Mark Test",
    studentId: "student_2",
    studentName: "Mark Test",
    teacher: "Pavel",
    teacherFull: "Pavel Zakutailo",
    teacherUid: "teacher_1",
    time: "10:00",
    duration: 60,
  }, {
    id: "google_instance_1",
    recurringEventId: "google_master_1",
    originalStartTime: { dateTime: "2026-08-12T10:00:00+03:00" },
    start: { dateTime: "2026-08-13T11:15:00+03:00", timeZone: "Europe/Tallinn" },
    end: { dateTime: "2026-08-13T12:00:00+03:00", timeZone: "Europe/Tallinn" },
    summary: "KeeleSepp — Mark Test",
    description: "Korrata sõnavara",
    etag: "\"etag-1\"",
    calendarId: "primary",
    status: "confirmed",
  }, "Europe/Tallinn", "2026-07-29T12:00:00.000Z");
  assert.deepEqual({
    date: exception.date,
    day: exception.day,
    time: exception.time,
    duration: exception.duration,
    studentId: exception.studentId,
    seriesId: exception.seriesId,
    originalOccurrenceDate: exception.originalOccurrenceDate,
    occurrenceKind: exception.occurrenceKind,
    source: exception.source,
    scheduleVersion: exception.scheduleVersion,
  }, {
    date: "2026-08-13",
    day: "Thu",
    time: "11:15",
    duration: 45,
    studentId: "student_2",
    seriesId: "series_1",
    originalOccurrenceDate: "2026-08-12",
    occurrenceKind: "moved",
    source: "gcal",
    scheduleVersion: 3,
  });
});

test("cancelled Google occurrence remains visible even when Google omits its details", () => {
  const exception = googleOccurrenceExceptionSchedule("series_2", {
    studentId: "student_3",
    studentName: "Anna Test",
    teacher: "Pavel",
    teacherUid: "teacher_1",
    time: "14:30",
    duration: 60,
  }, {
    id: "google_instance_cancelled",
    recurringEventId: "google_master_2",
    originalStartTime: { dateTime: "2026-08-14T14:30:00+03:00" },
    status: "cancelled",
  });
  assert.equal(exception.status, "Tühistatud");
  assert.equal(exception.date, "2026-08-14");
  assert.equal(exception.time, "14:30");
  assert.equal(exception.occurrenceKind, "cancelled");
  assert.equal(exception.gcalNativeException, true);
});

test("restoring a Google occurrence removes only its native exclusion", () => {
  assert.deepEqual(googleNativeExclusionState({
    previousExcludedDates: ["2026-08-12", "2026-08-19", "2027-10-01"],
    previousNativeDates: ["2026-08-12", "2027-10-01"],
    currentNativeDates: [],
    googleExcludedDates: ["2026-08-19"],
    windowStart: "2026-07-22",
    windowEnd: "2027-07-29",
  }), {
    nativeDates: ["2027-10-01"],
    excludedDates: ["2026-08-19", "2027-10-01"],
  });
});

test("current Google exceptions merge with KeeleSepp exclusions without duplicates", () => {
  assert.deepEqual(googleNativeExclusionState({
    previousExcludedDates: ["2026-08-19"],
    previousNativeDates: [],
    currentNativeDates: ["2026-08-12", "2026-08-12"],
    googleExcludedDates: ["2026-08-19", "invalid"],
    windowStart: "2026-07-22",
    windowEnd: "2027-07-29",
  }), {
    nativeDates: ["2026-08-12"],
    excludedDates: ["2026-08-12", "2026-08-19"],
  });
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
