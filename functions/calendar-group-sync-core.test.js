"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const {
  firstWeekdayOnOrAfter,
  groupLessonLinkId,
  eligibleGroupLessons,
  groupLessonToGoogleEvent,
  groupLessonSyncFingerprint,
  isKeeleSeppGroupGoogleEvent,
  isKeeleSeppManagedGoogleEvent,
  safeCalendarReturnUrl,
  calendarReturnUrlWithStatus,
} = require("./calendar-sync-core");

const group = {
  name: "A2 õhtune",
  subject: "Eesti keel",
  level: "A2",
  teacherUid: "teacher-1",
  active: true,
  lessons: [
    { id: "l1", day: "Wed", time: "18:00", duration: 90, recurring: true, startDate: "2026-10-05", excludedDates: ["2026-10-14"] },
    { id: "l2", date: "2026-10-10", day: "Sat", time: "10:00", duration: 60, recurring: false },
    { id: "l3", day: "Mon", time: "17:00", duration: 60, recurring: true, status: "Tühistatud", startDate: "2026-10-05" },
  ],
};

test("a weekly group series starts on its weekday and carries its exclusions", () => {
  assert.equal(firstWeekdayOnOrAfter("2026-10-05", "Wed"), "2026-10-07");
  assert.equal(firstWeekdayOnOrAfter("2026-10-07", "Wed"), "2026-10-07");
  const event = groupLessonToGoogleEvent("g1", group, group.lessons[0]);
  assert.equal(event.start.dateTime, "2026-10-07T18:00:00");
  assert.equal(event.end.dateTime, "2026-10-07T19:30:00");
  assert.deepEqual(event.recurrence, [
    "RRULE:FREQ=WEEKLY;BYDAY=WE",
    "EXDATE;TZID=Europe/Tallinn:20261014T180000",
  ]);
  assert.equal(event.summary, "KeeleSepp — Grupp: A2 õhtune");
  assert.equal(event.visibility, "private");
});

test("a one-off group lesson has no recurrence", () => {
  const event = groupLessonToGoogleEvent("g1", group, group.lessons[1]);
  assert.equal(event.start.dateTime, "2026-10-10T10:00:00");
  assert.equal(event.recurrence, undefined);
});

test("an old series without a start date uses the stored anchor, and none means no event", () => {
  const lesson = { id: "old", day: "Tue", time: "16:00", duration: 60 };
  assert.equal(groupLessonToGoogleEvent("g1", group, lesson), null);
  assert.equal(groupLessonToGoogleEvent("g1", group, lesson, { anchorDate: "2026-10-01" }).start.dateTime, "2026-10-06T16:00:00");
});

test("group events are never taken for student lessons by the import", () => {
  const event = groupLessonToGoogleEvent("g1", group, group.lessons[0]);
  assert.equal(isKeeleSeppGroupGoogleEvent(event), true);
  assert.equal(isKeeleSeppManagedGoogleEvent(event), false);
  assert.doesNotMatch(event.description, /student[:\s]/i);
});

test("only active, owned, not cancelled lessons are eligible", () => {
  assert.deepEqual([...eligibleGroupLessons(group).keys()], ["l1", "l2"]);
  assert.equal(eligibleGroupLessons({ ...group, active: false }).size, 0);
  assert.equal(eligibleGroupLessons({ ...group, teacherUid: "" }).size, 0);
  assert.equal(eligibleGroupLessons(null).size, 0);
});

test("the fingerprint changes with the event and ignores attendance", () => {
  const first = groupLessonToGoogleEvent("g1", group, group.lessons[0]);
  const withAttendance = groupLessonToGoogleEvent("g1", group, { ...group.lessons[0], attendance: { s1_2026_10_07: { status: "coming" } } });
  const moved = groupLessonToGoogleEvent("g1", group, { ...group.lessons[0], time: "18:30" });
  assert.equal(groupLessonSyncFingerprint(first), groupLessonSyncFingerprint(withAttendance));
  assert.notEqual(groupLessonSyncFingerprint(first), groupLessonSyncFingerprint(moved));
});

test("link ids are stable and reject path characters", () => {
  assert.equal(groupLessonLinkId("g1", "l1"), "g1__l1");
  assert.equal(groupLessonLinkId("g/1", "l1"), "");
  assert.equal(groupLessonLinkId("g1", ""), "");
});

test("the OAuth return address accepts only known origins", () => {
  const allowed = ["https://crm.epkoolitus.ee", "http://localhost:5173"];
  const fallback = "https://www.epkoolitus.ee/haldus/";
  assert.equal(safeCalendarReturnUrl("https://crm.epkoolitus.ee/settings?gcal=old#x", allowed, fallback), "https://crm.epkoolitus.ee/settings");
  assert.equal(safeCalendarReturnUrl("http://localhost:5173/calendar", allowed, fallback), "http://localhost:5173/calendar");
  assert.equal(safeCalendarReturnUrl("https://evil.example/settings", allowed, fallback), fallback);
  assert.equal(safeCalendarReturnUrl("javascript:alert(1)", allowed, fallback), fallback);
  assert.equal(safeCalendarReturnUrl("", allowed, fallback), fallback);
  assert.equal(calendarReturnUrlWithStatus("https://crm.epkoolitus.ee/settings", "connected"), "https://crm.epkoolitus.ee/settings?gcal=connected");
  assert.equal(calendarReturnUrlWithStatus(fallback, "error"), "https://www.epkoolitus.ee/haldus/?gcal=error");
});
