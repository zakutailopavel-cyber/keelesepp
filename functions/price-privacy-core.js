"use strict";

// Finance v2 §1: the lesson price must not live on the student card (teachers and parents can read it).
// One-time move: every price found on a student card goes to studentRevenuePlans/{id} (admin / finance only),
// then the fields are deleted from the card.

const PRIVATE_STUDENT_FIELDS = ["lessonPrice", "weeklyLessons", "revenuePlanUpdatedAt"];

const cents = value => {
  const number = Number(String(value ?? "").replace(",", "."));
  return Number.isFinite(number) && number > 0 ? Math.round(number * 100) : 0;
};

// students: [{ id, ...data }], plans: [{ id, ...data }]
function planPricePrivacy(students = [], plans = []) {
  const planById = new Map(plans.map(plan => [plan.id, plan]));
  const actions = [];
  for (const student of students) {
    const fields = PRIVATE_STUDENT_FIELDS.filter(field => Object.prototype.hasOwnProperty.call(student, field));
    if (!fields.length) continue;
    const plan = planById.get(student.id);
    const studentPriceCents = cents(student.lessonPrice);
    const planPriceCents = Math.max(0, Math.round(Number(plan?.lessonPriceCents) || 0));
    const weekly = Number(student.weeklyLessons);
    actions.push({
      studentId: student.id,
      studentName: String(student.name || student.studentName || "").trim() || "Nimetu õpilane",
      fields,
      studentPriceCents,
      planPriceCents,
      // the plan wins when both exist; the card's price is copied only when the plan has none
      createPlan: !planPriceCents && studentPriceCents > 0,
      weeklyLessons: Number.isFinite(weekly) && weekly >= 0.5 && weekly <= 50 ? weekly : 1,
      conflict: Boolean(planPriceCents && studentPriceCents && planPriceCents !== studentPriceCents),
    });
  }
  return {
    actions,
    summary: {
      students: actions.length,
      plansToCreate: actions.filter(action => action.createPlan).length,
      conflicts: actions.filter(action => action.conflict).length,
    },
  };
}

// Price used by the invoice API: the private plan first, the old card field only until the move is done.
function lessonPriceFor(student = {}, plan = null) {
  const planCents = Math.max(0, Math.round(Number(plan?.lessonPriceCents) || 0));
  if (planCents) return planCents / 100;
  return Number(student.lessonPrice) || 0;
}

module.exports = { PRIVATE_STUDENT_FIELDS, planPricePrivacy, lessonPriceFor };
