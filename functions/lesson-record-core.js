"use strict";

const crypto = require("crypto");

const LESSON_STATUSES = new Set(["Toimunud", "Puudus_p", "Puudus_eta"]);

function normalizedLessonStatus(value) {
  const status = String(value || "").trim();
  if (!LESSON_STATUSES.has(status)) {
    const error = new Error("Unsupported lesson status");
    error.status = 400;
    throw error;
  }
  return status;
}

function scheduleStatusForLesson(status) {
  return normalizedLessonStatus(status);
}

function lessonCompletionCounterDelta(previousStatus, nextStatus) {
  const wasCompleted = previousStatus === "Toimunud";
  const isCompleted = normalizedLessonStatus(nextStatus) === "Toimunud";
  return Number(isCompleted) - Number(wasCompleted);
}

function stableLessonDocumentId({ scheduleId, occurrenceDate, studentId }) {
  const cleanScheduleId = String(scheduleId || "").trim();
  const cleanDate = String(occurrenceDate || "").trim();
  const cleanStudentId = String(studentId || "").trim();
  if (!cleanScheduleId || !/^\d{4}-\d{2}-\d{2}$/.test(cleanDate) || !cleanStudentId) {
    const error = new Error("scheduleId, occurrenceDate and studentId are required");
    error.status = 400;
    throw error;
  }
  const hash = crypto.createHash("sha256")
    .update(`${cleanScheduleId}:${cleanDate}:${cleanStudentId}`)
    .digest("hex")
    .slice(0, 48);
  return `scheduled_${hash}`;
}

function lessonMutationSignature({ lessonId, scheduleId, lesson }) {
  return crypto.createHash("sha256").update(JSON.stringify({
    lessonId: String(lessonId || "").trim(),
    scheduleId: String(scheduleId || "").trim(),
    studentId: String(lesson?.studentId || "").trim(),
    date: String(lesson?.date || "").trim(),
    status: String(lesson?.status || "").trim(),
    duration: Number(lesson?.duration) || 0,
    topic: String(lesson?.topic || "").trim(),
  })).digest("hex");
}

module.exports = {
  LESSON_STATUSES,
  lessonCompletionCounterDelta,
  lessonMutationSignature,
  normalizedLessonStatus,
  scheduleStatusForLesson,
  stableLessonDocumentId,
};
