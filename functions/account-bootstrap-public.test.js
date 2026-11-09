"use strict";

// /accounts/bootstrap answers the signing-in learner / parent: never other people's names, e-mails, phones or card ids
// (the review candidates). Staff routes (/accounts/reviews, /accounts/bootstrap-admin) keep the full detail.
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { planStudentAccountBootstrap, planParentChildBootstrap, publicBootstrapResult } = require("./account-bootstrap-core");

const others = [
  { id: "card-other-child", name: "Lana Polišuk", email: "secret.child@example.test", parentEmail: "parent@example.test", parentName: "Olena Polishchuk", phone: "+372 5555 0001" },
  { id: "card-sibling", name: "Viktoria Tamm", parentEmail: "parent@example.test", parentPhone: "+372 5555 0002" },
];
const personal = ["card-other-child", "card-sibling", "Lana", "Polišuk", "Polishchuk", "Viktoria", "secret.child@example.test", "5555"];

function assertNoPersonalData(response) {
  const text = JSON.stringify(response);
  personal.forEach(value => assert.ok(!text.includes(value), `response leaks ${value}: ${text}`));
}

test("a learner's response carries no review candidates", () => {
  // the e-mail is on a child's card: a review with that card as the candidate
  const plan = planStudentAccountBootstrap({ uid: "kid", email: "parent@example.test", emailVerified: true, displayName: "Mari Ema", students: others });
  assert.equal(plan.status, "review");
  assert.ok(plan.candidates.length > 0);
  const result = { status: "pending_review", linkedStudentIds: [], createdStudentIds: [], reviews: [{ id: "r1", relationship: "student", reason: plan.reason, candidates: plan.candidates }], resolvedReviewCount: 0 };
  const response = publicBootstrapResult(result);
  assert.deepEqual(response, { status: "pending_review", linkedStudentIds: [], createdStudentIds: [], reviewCount: 1 });
  assertNoPersonalData(response);
});

test("a parent's response carries no candidates, only the own cards and a count", () => {
  const plans = planParentChildBootstrap({ uid: "parent-uid", email: "parent@example.test", emailVerified: true, childNames: ["Mark"], students: others });
  const reviews = plans.filter(plan => plan.status === "review").map((plan, index) => ({ id: `r${index}`, candidates: plan.candidates, childName: plan.childName }));
  assert.ok(reviews.length > 0);
  const response = publicBootstrapResult({ status: "pending_review", linkedStudentIds: ["parent_parent-uid_abc"], createdStudentIds: [], reviews, possibleExistingCount: 2, extra: { candidates: others } });
  assert.deepEqual(response, { status: "pending_review", linkedStudentIds: ["parent_parent-uid_abc"], createdStudentIds: [], reviewCount: reviews.length });
  assertNoPersonalData(response);
});

test("an empty or odd result gives a safe empty answer", () => {
  assert.deepEqual(publicBootstrapResult(), { status: "", linkedStudentIds: [], createdStudentIds: [], reviewCount: 0 });
  assert.deepEqual(publicBootstrapResult({ status: 5, linkedStudentIds: "x", reviews: "y" }), { status: "", linkedStudentIds: [], createdStudentIds: [], reviewCount: 0 });
});

test("the learner route sends the public result, the admin route keeps the full one", () => {
  const source = fs.readFileSync(path.join(__dirname, "index.js"), "utf8");
  const routeOf = marker => { const start = source.indexOf(marker); return source.slice(start, source.indexOf("return;", start)); };
  const learner = routeOf('req.path === "/accounts/bootstrap")');
  assert.match(learner, /\.json\(publicBootstrapResult\(result\)\)/);
  assert.doesNotMatch(learner, /\.json\(result\)/);
  assert.match(routeOf('req.path === "/accounts/bootstrap-admin")'), /\.json\(result\)/);
});
