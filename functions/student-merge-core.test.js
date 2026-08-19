"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const {
  mergeGroupStudentReferences,
  normalizedStudentMergeInput,
  studentMergeOwnership,
} = require("./student-merge-core");

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
