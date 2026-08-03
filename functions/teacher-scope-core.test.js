"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const {
  buildTeacherDirectory,
  canonicalTeacherKey,
  planTeacherScopeBackfill,
} = require("./teacher-scope-core");

test("teacher aliases resolve to stable canonical keys", () => {
  assert.equal(canonicalTeacherKey("Pavel Zakutailo"), "pavel");
  assert.equal(canonicalTeacherKey("Jelena"), "elena");
  assert.equal(canonicalTeacherKey("Yelyzaveta Lukiianchuk"), "yelyzaveta");
  assert.equal(canonicalTeacherKey("Angelina"), "anhelina");
});

test("teacher directory rejects ambiguous staff identities", () => {
  const result = buildTeacherDirectory([
    { id: "one", role: "teacher", displayName: "Pavel" },
    { id: "two", role: "admin", displayName: "Pavel Zakutailo" },
  ]);
  assert.equal(result.byKey.has("pavel"), false);
  assert.deepEqual(result.conflicts, [{ key: "pavel", uids: ["one", "two"] }]);
});

test("backfill derives related ownership from the authoritative student", () => {
  const plan = planTeacherScopeBackfill({
    users: [
      { id: "teacher-pavel", role: "teacher", displayName: "Pavel Zakutailo" },
      { id: "teacher-elena", role: "teacher", displayName: "Elena Zakutailo" },
    ],
    students: [
      { id: "student-one", teacher: "Pavel" },
      { id: "student-two", teacher: "Jelena", teacherUid: "teacher-elena" },
    ],
    lessons: [
      { id: "lesson-one", studentId: "student-one", teacher: "Wrong Legacy Label" },
      { id: "lesson-two", studentId: "student-two" },
    ],
    schedule: [{ id: "schedule-one", teacher: "Pavel Zakutailo" }],
  });

  assert.equal(plan.readyToApply, true);
  assert.deepEqual(plan.teacherDirectory, { elena: "teacher-elena", pavel: "teacher-pavel" });
  assert.deepEqual(plan.patches.students, [
    { id: "student-one", data: { teacherUid: "teacher-pavel" } },
  ]);
  assert.deepEqual(plan.patches.lessons, [
    { id: "lesson-one", data: { teacherUid: "teacher-pavel" } },
    { id: "lesson-two", data: { teacherUid: "teacher-elena" } },
  ]);
  assert.deepEqual(plan.patches.schedule, [
    { id: "schedule-one", data: { teacherUid: "teacher-pavel" } },
  ]);
});

test("backfill leaves genuinely unassigned records admin-only", () => {
  const plan = planTeacherScopeBackfill({
    users: [{ id: "teacher-pavel", role: "teacher", displayName: "Pavel" }],
    students: [{ id: "unknown", teacher: "Unknown Teacher" }, { id: "missing", name: "No teacher" }],
    lessons: [{ id: "orphan", studentId: "missing-student" }],
  });
  assert.equal(plan.readyToApply, false);
  assert.equal(plan.summary.students.unresolvedCount, 1);
  assert.equal(plan.summary.students.unassignedCount, 1);
  assert.equal(plan.summary.lessons.unresolvedCount, 0);
  assert.equal(plan.summary.lessons.unassignedCount, 1);
  assert.equal(plan.patches.students.length, 0);
});

test("backfill blocks an existing teacher UID that is not in the staff directory", () => {
  const plan = planTeacherScopeBackfill({
    users: [{ id: "teacher-pavel", role: "teacher", displayName: "Pavel" }],
    students: [{ id: "stale", teacher: "Pavel", teacherUid: "deleted-user" }],
  });
  assert.equal(plan.readyToApply, false);
  assert.deepEqual(plan.unresolved.students, [{
    id: "stale",
    reason: "invalid_teacher_uid",
    teacher: "Pavel",
    teacherUid: "deleted-user",
  }]);
});
