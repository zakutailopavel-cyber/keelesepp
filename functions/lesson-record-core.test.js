"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const {
  lessonCompletionCounterDelta,
  scheduleStatusForLesson,
  stableLessonDocumentId,
} = require("./lesson-record-core");

test("scheduled lesson id is stable for retries and unique per occurrence", () => {
  const first = stableLessonDocumentId({
    scheduleId: "schedule-1",
    occurrenceDate: "2026-08-26",
    studentId: "student-1",
  });
  const retry = stableLessonDocumentId({
    scheduleId: "schedule-1",
    occurrenceDate: "2026-08-26",
    studentId: "student-1",
  });
  const nextWeek = stableLessonDocumentId({
    scheduleId: "schedule-1",
    occurrenceDate: "2026-09-02",
    studentId: "student-1",
  });
  assert.equal(first, retry);
  assert.notEqual(first, nextWeek);
});

test("absence remains an explicit processed calendar status", () => {
  assert.equal(scheduleStatusForLesson("Toimunud"), "Toimunud");
  assert.equal(scheduleStatusForLesson("Puudus_p"), "Puudus_p");
  assert.equal(scheduleStatusForLesson("Puudus_eta"), "Puudus_eta");
});

test("legacy lesson counter changes only on completion transitions", () => {
  assert.equal(lessonCompletionCounterDelta("", "Toimunud"), 1);
  assert.equal(lessonCompletionCounterDelta("Toimunud", "Toimunud"), 0);
  assert.equal(lessonCompletionCounterDelta("Toimunud", "Puudus_p"), -1);
  assert.equal(lessonCompletionCounterDelta("Puudus_eta", "Puudus_p"), 0);
});
