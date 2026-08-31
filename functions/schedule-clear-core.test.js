const test = require("node:test");
const assert = require("node:assert/strict");
const {
  futureScheduleClearPatch,
  planTeacherFutureScheduleClear,
  previousIsoDate,
} = require("./schedule-clear-core");

test("future clear preserves history by ending an active recurring series before the selected week", () => {
  const result = futureScheduleClearPatch({
    recurring: true,
    day: "Mon",
    startDate: "2026-08-03",
    status: "Planeeritud",
  }, "2026-08-31", {
    nowIso: "2026-08-30T10:00:00.000Z",
    teacherUid: "teacher-1",
    operationId: "clear-1",
  });
  assert.equal(previousIsoDate("2026-08-31"), "2026-08-30");
  assert.equal(result.kind, "truncate_series");
  assert.equal(result.patch.endDate, "2026-08-30");
  assert.equal(result.patch.status, undefined);
});

test("future clear cancels only future one-time lessons and new series", () => {
  const oldLesson = futureScheduleClearPatch({
    date: "2026-08-30",
    status: "Planeeritud",
  }, "2026-08-31");
  const completedLesson = futureScheduleClearPatch({
    date: "2026-09-01",
    status: "Toimunud",
  }, "2026-08-31");
  const futureLesson = futureScheduleClearPatch({
    date: "2026-09-01",
    status: "Planeeritud",
  }, "2026-08-31", { nowIso: "2026-08-30T10:00:00.000Z" });
  const futureSeries = futureScheduleClearPatch({
    recurring: true,
    day: "Tue",
    startDate: "2026-09-01",
    status: "Planeeritud",
  }, "2026-08-31", { nowIso: "2026-08-30T10:00:00.000Z" });
  assert.equal(oldLesson, null);
  assert.equal(completedLesson, null);
  assert.equal(futureLesson.kind, "cancel_single");
  assert.equal(futureLesson.patch.status, "Tühistatud");
  assert.equal(futureSeries.kind, "cancel_series");
  assert.equal(futureSeries.patch.status, "Tühistatud");
});

test("teacher clear plan includes owned individual and group lessons without touching another teacher", () => {
  const plan = planTeacherFutureScheduleClear({
    teacherUid: "teacher-pavel",
    teacherName: "Pavel Zakutailo",
    fromDate: "2026-08-31",
    nowIso: "2026-08-30T10:00:00.000Z",
    operationId: "clear-2",
    schedule: [
      { id: "own-series", teacherUid: "teacher-pavel", recurring: true, day: "Mon", startDate: "2026-08-01" },
      { id: "legacy-own", teacher: "Pavel", date: "2026-09-02" },
      { id: "other", teacherUid: "teacher-elena", teacher: "Elena", date: "2026-09-02" },
      { id: "google-own", teacherUid: "teacher-pavel", source: "gcal", date: "2026-09-03" },
    ],
    groups: [
      {
        id: "group-one",
        teacher: "Pavel",
        lessons: [
          { id: "group-past", date: "2026-08-20" },
          { id: "group-series", recurring: true, day: "Fri", startDate: "2026-08-01" },
        ],
      },
      { id: "group-other", teacher: "Elena", lessons: [{ id: "other-series", recurring: true, day: "Fri" }] },
    ],
  });
  assert.deepEqual(plan.schedulePatches.map(item => item.id), ["own-series", "legacy-own"]);
  assert.equal(plan.groupPatches.length, 1);
  assert.equal(plan.groupPatches[0].changedLessonCount, 1);
  assert.equal(plan.groupPatches[0].lessons[1].endDate, "2026-08-30");
  assert.deepEqual(plan.summary, {
    scheduleCount: 2,
    groupLessonCount: 1,
    groupDocumentCount: 1,
    totalCount: 3,
    externalGoogleCount: 1,
    cancelledSingleCount: 1,
    cancelledSeriesCount: 0,
    truncatedSeriesCount: 1,
    cancelledExternalGoogleCount: 0,
  });
});

test("future clear can explicitly suppress and remove owned Google events", () => {
  const plan = planTeacherFutureScheduleClear({
    teacherUid: "teacher-pavel",
    teacherName: "Pavel Zakutailo",
    fromDate: "2026-08-31",
    includeExternalGoogle: true,
    schedule: [{
      id: "google-own",
      teacherUid: "teacher-pavel",
      source: "gcal",
      gcalEventId: "google-event-1",
      date: "2026-09-03",
      status: "Planeeritud",
    }],
  });
  assert.equal(plan.schedulePatches.length, 1);
  assert.equal(plan.schedulePatches[0].kind, "cancel_external_google");
  assert.equal(plan.schedulePatches[0].patch.gcalImportSuppressed, true);
  assert.equal(plan.summary.totalCount, 1);
  assert.equal(plan.summary.externalGoogleCount, 1);
  assert.equal(plan.summary.cancelledExternalGoogleCount, 1);
});
