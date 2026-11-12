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

function isRecurringSchedule(schedule) {
  return schedule?.recurring === true;
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

function lessonMutationSignature({ lessonId, scheduleId, lesson, completion }) {
  return crypto.createHash("sha256").update(JSON.stringify({
    lessonId: String(lessonId || "").trim(),
    scheduleId: String(scheduleId || "").trim(),
    studentId: String(lesson?.studentId || "").trim(),
    date: String(lesson?.date || "").trim(),
    status: String(lesson?.status || "").trim(),
    duration: Number(lesson?.duration) || 0,
    topic: String(lesson?.topic || "").trim(),
    completion: completion || null,
  })).digest("hex");
}

// What removing a lesson mark does (deleteLessonJournal, Fable review T2 2026-11-12). → { refusal, packageMovement,
// counterDelta, touchSchedule }. `refusal` (status + message) when it may not be removed; `packageMovement` when the
// lesson took a package credit (or is owed one): the credit comes back through the package ledger after the delete
// (syncLessonPackageConsumption), never by editing a balance here. CRM v2 marks never moved the card's legacy counters
// (counterDelta 0), and a CRM v2 mark of a weekly series lives only in the lesson (the series is left alone).
const PACKAGE_MOVED = new Set(["consumed", "needs_attention"]);
function lessonRemovalPlan(lesson = {}, packageState = {}, schedule = null) {
  if (lesson.invoiceId || lesson.billingStatus) {
    return { refusal: { status: 409, message: "Lesson has a financial status and cannot be deleted" } };
  }
  if (lesson.cashPaid && lesson.cashPaid.receiptId) {
    return { refusal: { status: 409, message: "Lesson is paid in cash: take back the cash mark first" } };
  }
  const crmV2 = lesson.accountingSource === "crm_v2";
  return {
    refusal: null,
    packageMovement: PACKAGE_MOVED.has(packageState?.status) || PACKAGE_MOVED.has(lesson.packageConsumptionStatus),
    counterDelta: lesson.status === "Toimunud" && lesson.packageAccountingSource !== "package_ledger_v1" && !crmV2 ? -1 : 0,
    touchSchedule: Boolean(schedule) && !(crmV2 && isRecurringSchedule(schedule)),
  };
}

module.exports = {
  LESSON_STATUSES,
  isRecurringSchedule,
  lessonRemovalPlan,
  lessonCompletionCounterDelta,
  lessonMutationSignature,
  normalizedLessonStatus,
  scheduleStatusForLesson,
  stableLessonDocumentId,
};
