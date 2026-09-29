"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const { planPricePrivacy, lessonPriceFor } = require("./price-privacy-core");

test("moves card prices to plans only where the plan has none", () => {
  const { actions, summary } = planPricePrivacy([
    { id: "a", name: "Mari", lessonPrice: 25, weeklyLessons: 2 },
    { id: "b", name: "Jaan", lessonPrice: "27,5" },
    { id: "c", name: "Kati", revenuePlanUpdatedAt: "2026-09-01" },
    { id: "d", name: "Puhas" },
  ], [{ id: "b", lessonPriceCents: 3000 }]);
  assert.deepEqual(actions.map(action => action.studentId), ["a", "b", "c"]);
  assert.equal(actions[0].createPlan, true);
  assert.equal(actions[0].studentPriceCents, 2500);
  assert.equal(actions[0].weeklyLessons, 2);
  assert.equal(actions[1].createPlan, false);
  assert.equal(actions[1].conflict, true);
  assert.deepEqual(actions[2].fields, ["revenuePlanUpdatedAt"]);
  assert.equal(actions[2].createPlan, false);
  assert.deepEqual(summary, { students: 3, plansToCreate: 1, conflicts: 1 });
});

test("invoice price prefers the private plan", () => {
  assert.equal(lessonPriceFor({ lessonPrice: 20 }, { lessonPriceCents: 2750 }), 27.5);
  assert.equal(lessonPriceFor({ lessonPrice: 20 }, null), 20);
  assert.equal(lessonPriceFor({}, null), 0);
});
