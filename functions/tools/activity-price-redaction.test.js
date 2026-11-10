"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const { redactionPlan, redactionUpdate } = require("./activity-price-redaction");

test("only finance.revenue_plan_updated entries with price keys are planned; kept keys stay", () => {
  const plan = redactionPlan([
    { id: "a", type: "finance.revenue_plan_updated", meta: { studentId: "s1", studentName: "Mari", lessonPriceCents: 2500, weeklyLessons: 2, billingMode: "advance", priceTerms: "discount" } },
    { id: "b", type: "finance.revenue_plan_updated", meta: { studentId: "s2", weeklyLessons: 1, billingMode: "advance", subjectPrices: { Inglise: 3000 }, subjectBilling: { Inglise: { lessonPriceCents: 3000 } } } },
    { id: "c", type: "finance.revenue_plan_updated", meta: { studentId: "s3", weeklyLessons: 1, billingMode: "advance" } },
    { id: "d", type: "lesson.completed", meta: { lessonPriceCents: 2500 } },
    { id: "e", type: "finance.revenue_plan_updated" },
  ]);
  assert.deepEqual(plan, [
    { id: "a", remove: ["lessonPriceCents", "priceTerms"], subjectPricesChanged: false },
    { id: "b", remove: ["subjectBilling", "subjectPrices"], subjectPricesChanged: true },
  ]);
});

test("the update deletes only the planned keys and records the redaction", () => {
  const DEL = Symbol("delete");
  assert.deepEqual(redactionUpdate({ id: "b", remove: ["subjectBilling", "subjectPrices"], subjectPricesChanged: true }, DEL, "2026-11-11T00:00:00.000Z"), {
    "meta.redactedAt": "2026-11-11T00:00:00.000Z",
    "meta.redactedBy": "tools/activity-price-redaction.js",
    "meta.subjectBilling": DEL,
    "meta.subjectPrices": DEL,
    "meta.subjectPricesChanged": true,
  });
});
