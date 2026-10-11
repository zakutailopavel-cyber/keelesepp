"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const {
  planParentChildBootstrap,
  planStudentAccountBootstrap,
} = require("./account-bootstrap-core");

test("student bootstrap is idempotent by exact uid", () => {
  const result = planStudentAccountBootstrap({
    uid: "auth-1",
    email: "new@example.com",
    students: [{ id: "student-1", name: "Yana", linkedUserIds: ["auth-1"] }],
  });
  assert.deepEqual(result, { status: "linked", studentId: "student-1", source: "uid" });
});

test("student bootstrap links one exact normalized email but never guesses a name", () => {
  const linked = planStudentAccountBootstrap({
    uid: "auth-1",
    email: " YANA@EXAMPLE.COM ",
    emailVerified: true,
    displayName: "Different spelling",
    students: [{ id: "student-1", name: "Yana", email: "yana@example.com" }],
  });
  assert.equal(linked.status, "link");
  assert.equal(linked.studentId, "student-1");

  const created = planStudentAccountBootstrap({
    uid: "auth-2",
    email: "other@example.com",
    displayName: "Yana",
    students: [{ id: "student-1", name: "Yana", email: "yana@example.com" }],
  });
  assert.equal(created.status, "create");
});

test("ambiguous email or an existing different login requires review", () => {
  const duplicateEmail = planStudentAccountBootstrap({
    uid: "auth-1",
    email: "milan@example.com",
    emailVerified: true,
    students: [
      { id: "a", name: "Milan", email: "milan@example.com" },
      { id: "b", name: "Milan Grozovski", contactEmail: "milan@example.com" },
    ],
  });
  assert.equal(duplicateEmail.status, "review");
  assert.equal(duplicateEmail.candidates.length, 2);

  const occupied = planStudentAccountBootstrap({
    uid: "new-auth",
    email: "yana@example.com",
    emailVerified: true,
    students: [{ id: "yana", email: "yana@example.com", studentUid: "old-auth" }],
  });
  assert.equal(occupied.reason, "student_has_another_login");
});

test("parent can own multiple children without duplicate cards", () => {
  const result = planParentChildBootstrap({
    uid: "parent-1",
    email: "parent@example.com",
    emailVerified: true,
    childNames: ["Nicole Smirnova", "Maksim Smirnov"],
    students: [
      { id: "nicole", name: "Nicole Smirnova", linkedParentIds: ["parent-1"] },
      { id: "maksim", name: "Maksim Smirnov", parentEmail: "PARENT@example.com" },
    ],
  });
  assert.deepEqual(result.map(item => item.status), ["linked", "link"]);
  assert.deepEqual(result.map(item => item.studentId), ["nicole", "maksim"]);
});

test("parent child name supports non-latin text and ambiguous exact matches require review", () => {
  const result = planParentChildBootstrap({
    uid: "parent-1",
    email: "parent@example.com",
    emailVerified: true,
    childNames: ["Милана"],
    students: [
      { id: "a", name: "Милана", parentEmail: "parent@example.com" },
      { id: "b", name: "Милана", guardianEmail: "parent@example.com" },
    ],
  });
  assert.equal(result[0].status, "review");
  assert.equal(result[0].candidates.length, 2);
});

test("unverified email never takes over an existing card automatically", () => {
  const result = planStudentAccountBootstrap({
    uid: "new-auth",
    email: "yana@example.com",
    emailVerified: false,
    students: [{ id: "yana", email: "yana@example.com" }],
  });
  assert.equal(result.status, "review");
  assert.equal(result.reason, "email_not_verified");
});

test("parent short and full child name variants are reviewed instead of duplicated", () => {
  const result = planParentChildBootstrap({
    uid: "parent-1",
    email: "parent@example.com",
    childNames: ["Milan Grozovski"],
    students: [{ id: "milan", name: "Milan", linkedParentId: "parent-1" }],
  });
  assert.equal(result[0].status, "review");
  assert.equal(result[0].reason, "parent_child_name_variant");
});

test("parent without a child name gets a review of the cards that carry the parent's e-mail", () => {
  const result = planParentChildBootstrap({
    uid: "parent-1",
    email: "olga@example.com",
    emailVerified: false,
    childNames: [],
    students: [
      { id: "mark", name: "Mark Ivanov", parentEmail: "OLGA@example.com" },
      { id: "sofia", name: "Sofia Ivanova", parentEmail: "olga@example.com" },
      { id: "linked", name: "Juba seotud", parentEmail: "olga@example.com", linkedParentIds: ["parent-1"] },
      { id: "other", name: "Karl", parentEmail: "liis@example.com" },
    ],
  });
  assert.equal(result.length, 1);
  assert.equal(result[0].status, "review");
  assert.equal(result[0].reason, "parent_email_without_child_name");
  assert.deepEqual(result[0].candidates.map(item => item.id), ["mark", "sofia"]);
  assert.deepEqual(planParentChildBootstrap({ uid: "parent-2", email: "new@example.com", childNames: [], students: [] }), []);
});

test("a new child name never creates a duplicate next to an unlinked card with the parent's e-mail", () => {
  const result = planParentChildBootstrap({
    uid: "parent-1",
    email: "olga@example.com",
    emailVerified: true,
    childNames: ["Markus"],
    students: [{ id: "mark", name: "Mark Ivanov", parentEmail: "olga@example.com" }],
  });
  assert.equal(result[0].status, "review");
  assert.equal(result[0].reason, "parent_email_other_child_name");
  const fresh = planParentChildBootstrap({ uid: "parent-1", email: "olga@example.com", emailVerified: true, childNames: ["Lena"], students: [] });
  assert.equal(fresh[0].status, "create");
});
