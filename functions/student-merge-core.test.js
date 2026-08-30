"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const {
  findStudentDuplicateGroups,
  mergeStudentProfileData,
  mergeGroupStudentReferences,
  normalizedStudentMergeInput,
  studentMergeOwnership,
} = require("./student-merge-core");

test("duplicate finder explains strong account matches and short/full name variants", () => {
  const groups = findStudentDuplicateGroups([
    { id: "milan-short", name: "Milan", teacher: "Pavel", subject: "Eesti keel", level: "A1" },
    { id: "milan-full", name: "Milan Grozovski", teacher: "Pavel", subject: "Eesti keel", level: "A1" },
    { id: "milan-full-2", name: "Milan Grozovski", linkedUserId: "auth-milan" },
    { id: "milan-account", name: "M. Grozovski", linkedUserId: "auth-milan" },
    { id: "another", name: "Milan Petrov", teacher: "Elena", subject: "Inglise keel", level: "B1" },
  ]);
  assert.equal(groups.length, 1);
  assert.deepEqual(groups[0].students.map(student => student.id).sort(), [
    "milan-account", "milan-full", "milan-full-2", "milan-short",
  ]);
  assert.equal(groups[0].confidence, "high");
  assert.ok(groups[0].reasons.some(reason => reason.code === "student_account"));
  assert.ok(groups[0].reasons.some(reason => reason.code === "name_variant"));
});

test("siblings sharing only a parent are never proposed as duplicates", () => {
  assert.deepEqual(findStudentDuplicateGroups([
    { id: "child-a", name: "Anna Smirnova", linkedParentId: "parent-one" },
    { id: "child-b", name: "Nicole Smirnova", linkedParentId: "parent-one" },
  ]), []);
});

test("duplicate finder keeps Cyrillic names searchable", () => {
  const groups = findStudentDuplicateGroups([
    { id: "short", name: "Милан", teacher: "Pavel", subject: "Eesti keel", level: "A1" },
    { id: "full", name: "Милан Грозовский", teacher: "Pavel", subject: "Eesti keel", level: "A1" },
  ]);
  assert.equal(groups.length, 1);
  assert.ok(groups[0].reasons.some(reason => reason.code === "name_variant"));
});

test("profile merge fills blank contacts and preserves every differing value as history", () => {
  const merged = mergeStudentProfileData({
    id: "primary",
    name: "Milan Grozovski",
    email: "",
    phone: "+372 500 0001",
    level: "A1",
    contactNotes: "Põhikaardi märkus",
  }, [{
    id: "duplicate",
    name: "Milan",
    email: "milan@example.com",
    phone: "+372 500 0002",
    level: "A2",
    packageTotal: 10,
    packageUsed: 3,
    contactNotes: "Duplikaadi märkus",
  }]);
  assert.equal(merged.patch.email, "milan@example.com");
  assert.deepEqual(merged.patch.nameAliases, ["Milan Grozovski", "Milan"]);
  assert.deepEqual(merged.patch.phoneAliases, ["+372 500 0001", "+372 500 0002"]);
  assert.deepEqual(merged.patch.mergedContactNotes, ["Põhikaardi märkus", "Duplikaadi märkus"]);
  assert.equal(merged.patch.mergedProfileSnapshots[0].packageTotal, 10);
  assert.ok(merged.conflicts.some(conflict => conflict.field === "level"));
  assert.ok(merged.conflicts.some(conflict => conflict.field === "phone"));
});

test("student merge preserves every explicitly linked student and parent account", () => {
  assert.deepEqual(studentMergeOwnership([
    { linkedUserId: "student-a", linkedParentIds: ["parent-a", "parent-b"] },
    { studentUid: "student-b", linkedUserIds: ["student-c"], parentUid: "parent-c" },
  ], ["document-id-auth-user"]), {
    linkedUserIds: ["student-a", "student-c", "student-b", "document-id-auth-user"],
    linkedParentIds: ["parent-a", "parent-b", "parent-c"],
  });
});

test("student merge input removes the primary and repeated duplicate ids", () => {
  assert.deepEqual(normalizedStudentMergeInput({
    primaryStudentId: "student-a",
    duplicateStudentIds: ["student-b", "student-a", "student-b"],
  }), {
    primaryStudentId: "student-a",
    duplicateStudentIds: ["student-b"],
  });
});

test("group references are moved by id and lesson assignments are combined", () => {
  assert.deepEqual(mergeGroupStudentReferences({
    students: ["student-a", "student-b", "student-c"],
    studentLessonMap: {
      "student-a": ["lesson-1"],
      "student-b": ["lesson-2", "lesson-1"],
      "student-c": ["lesson-3"],
    },
  }, "student-a", ["student-b"]), {
    students: ["student-a", "student-c"],
    studentLessonMap: {
      "student-a": ["lesson-1", "lesson-2"],
      "student-c": ["lesson-3"],
    },
  });
});
