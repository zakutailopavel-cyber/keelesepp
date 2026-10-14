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

// owner 2026-10-14: Olena Polishchuk (mother) was linked to her daughter Lana's card as the student, and a second card
// „Olena” was created next to the teacher's „Elena” card
test("a parent's e-mail on a child's card goes to review instead of linking the parent as the student", () => {
  const plan = planStudentAccountBootstrap({
    uid: "olena", email: "len.mur86@gmail.com", emailVerified: true, displayName: "Olena Polishchuk",
    students: [{ id: "lana", name: "Lana Polišuk", email: "len.mur86@gmail.com", grade: "1. klass", parentName: "Elena Polišuk" }],
  });
  assert.equal(plan.status, "review");
  assert.equal(plan.reason, "email_on_child_card");
  assert.deepEqual(plan.candidates.map(c => c.id), ["lana"]);

  // the same e-mail and a spelling of the same name is still the student herself (Uljana / Ulyana Kazak, 10. klass)
  const self = planStudentAccountBootstrap({
    uid: "u", email: "u@example.com", emailVerified: true, displayName: "Ulyana Kazak",
    students: [{ id: "uljana", name: "Uljana Kazak", email: "u@example.com", grade: "10. klass" }],
  });
  assert.equal(self.status, "link");
});

test("no silent duplicate: an inactive card, a child card with this e-mail or the same full name is reviewed", () => {
  const inactive = planStudentAccountBootstrap({
    uid: "olena", email: "len.mur86@gmail.com", emailVerified: true, displayName: "Olena Polishchuk",
    students: [{ id: "elena", name: "Elena Polischuk", email: "len.mur86@gmail.com", active: false }],
  });
  assert.equal(inactive.status, "review");
  assert.equal(inactive.reason, "possible_existing_card");

  const parentOfChild = planStudentAccountBootstrap({
    uid: "olena", email: "len.mur86@gmail.com", displayName: "Olena Polishchuk",
    students: [{ id: "lana", name: "Lana Polišuk", parentEmail: "len.mur86@gmail.com" }],
  });
  assert.equal(parentOfChild.reason, "possible_existing_card");

  const sameFullName = planStudentAccountBootstrap({
    uid: "x", email: "new@example.com", displayName: "Maksim Drozdov",
    students: [{ id: "m", name: "Maksim Drozdov", email: "old@example.com" }],
  });
  assert.equal(sameFullName.reason, "possible_existing_card");

  const oldLogin = planStudentAccountBootstrap({
    uid: "k", email: "k@example.com", displayName: "Konstantin",
    students: [{ id: "old", name: "Konstantin", active: false, studentUid: "k" }],
  });
  assert.equal(oldLogin.reason, "possible_existing_card");

  // a first name alone is too common to stop a registration
  const firstNameOnly = planStudentAccountBootstrap({
    uid: "y", email: "other@example.com", displayName: "Yana",
    students: [{ id: "student-1", name: "Yana", email: "yana@example.com" }],
  });
  assert.equal(firstNameOnly.status, "create");
});

test("a parent's inactive child card is reviewed instead of duplicated", () => {
  const plans = planParentChildBootstrap({
    uid: "p", email: "p@example.com", emailVerified: true, childNames: ["Lana Polišuk"],
    students: [{ id: "lana", name: "Lana Polišuk", parentEmail: "p@example.com", active: false }],
  });
  assert.equal(plans[0].status, "review");
  assert.equal(plans[0].reason, "possible_existing_card");
});
