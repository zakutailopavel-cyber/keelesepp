"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const {
  lessonCompletionCounterDelta,
  lessonMutationSignature,
  lessonRemovalPlan,
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

test("one-click completion details participate in idempotency signature", () => {
  const base={lessonId:"lesson-1",scheduleId:"schedule-1",lesson:{studentId:"student-1",date:"2026-09-23",status:"Toimunud",duration:60,topic:"Teema"}};
  const first=lessonMutationSignature({...base,completion:{attendanceStatus:"coming",homeworkTask:"Harjutus 4"}});
  const retry=lessonMutationSignature({...base,completion:{attendanceStatus:"coming",homeworkTask:"Harjutus 4"}});
  const changed=lessonMutationSignature({...base,completion:{attendanceStatus:"absent",homeworkTask:"Harjutus 4"}});
  assert.equal(first,retry);
  assert.notEqual(first,changed);
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

 test("dated v2 weekly schedules are still recurring", () => {
  const { isRecurringSchedule } = require("./lesson-record-core");
  assert.equal(isRecurringSchedule({ recurring: true, date: "2026-10-05" }), true);
  assert.equal(isRecurringSchedule({ recurring: true }), true);
  assert.equal(isRecurringSchedule({ recurring: false, date: "2026-10-05" }), false);
});

test("removing a mark that took a package credit is allowed; the credit goes back through the ledger (Fable T2)", () => {
  const held = { status: "Toimunud", accountingSource: "crm_v2", packageAccountingSource: "package_ledger_v1", packageConsumptionStatus: "consumed" };
  assert.deepEqual(lessonRemovalPlan(held, { status: "consumed" }, { recurring: false }), { refusal: null, packageMovement: true, counterDelta: 0, touchSchedule: true });
  // the server credit landed after the client read the lesson: the state decides, not the lesson copy
  assert.equal(lessonRemovalPlan({ status: "Toimunud", accountingSource: "crm_v2" }, { status: "consumed" }).packageMovement, true);
  // owed (no credits when held): the owed state is cleared
  assert.equal(lessonRemovalPlan({ status: "Toimunud", packageConsumptionStatus: "needs_attention" }, {}).packageMovement, true);
  // credit already given back: nothing to move
  assert.equal(lessonRemovalPlan({ status: "Puudus_eta", accountingSource: "crm_v2" }, { status: "restored" }).packageMovement, false);
});

test("removing a mark: invoiced and cash-paid lessons are refused, counters move only for old journal marks", () => {
  assert.match(lessonRemovalPlan({ status: "Toimunud", invoiceId: "A-1" }).refusal.message, /financial status/);
  assert.match(lessonRemovalPlan({ status: "Toimunud", billingStatus: "invoiced" }).refusal.message, /financial status/);
  assert.match(lessonRemovalPlan({ status: "Toimunud", cashPaid: { receiptId: "r1" } }).refusal.message, /paid in cash/);
  assert.equal(lessonRemovalPlan({ status: "Toimunud" }).counterDelta, -1);
  assert.equal(lessonRemovalPlan({ status: "Toimunud", accountingSource: "crm_v2" }).counterDelta, 0);
  assert.equal(lessonRemovalPlan({ status: "Toimunud", packageAccountingSource: "package_ledger_v1" }).counterDelta, 0);
  assert.equal(lessonRemovalPlan({ status: "Puudus_p" }).counterDelta, 0);
});

test("removing a CRM v2 mark of a weekly series leaves the series alone", () => {
  assert.equal(lessonRemovalPlan({ status: "Toimunud", accountingSource: "crm_v2" }, {}, { recurring: true }).touchSchedule, false);
  assert.equal(lessonRemovalPlan({ status: "Toimunud" }, {}, { recurring: true }).touchSchedule, true);
  assert.equal(lessonRemovalPlan({ status: "Toimunud", accountingSource: "crm_v2" }, {}, null).touchSchedule, false);
});
