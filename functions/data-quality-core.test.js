const test = require("node:test");
const assert = require("node:assert/strict");
const { classifyLessonDataQuality } = require("./data-quality-core");

test("legacy ext lessons with one exact group name are separated from orphan student lessons", () => {
  const result = classifyLessonDataQuality({
    students: [{ id: "student-1", name: "Mari" }],
    groups: [{ id: "group-1", name: "Grupp 6-7 hommik", active: true }],
    lessons: [
      { id: "legacy-group", studentId: "ext", studentName: "Grupp 6-7 hommik" },
      { id: "missing-student", studentId: "deleted", studentName: "Jaan" },
    ],
  });

  assert.deepEqual(result.orphanLessons.map(lesson => lesson.id), ["missing-student"]);
  assert.equal(result.groupLessonsNeedingLink.length, 1);
  assert.equal(result.groupLessonsNeedingLink[0].suggestedGroupId, "group-1");
  assert.equal(result.groupLessonsNeedingLink[0].exactGroupMatch, true);
});

test("a valid groupId is accepted even when legacy studentId is not a student profile", () => {
  const result = classifyLessonDataQuality({
    groups: [{ id: "group-1", name: "Hommik" }],
    lessons: [{ id: "linked", studentId: "ext", groupId: "group-1", studentName: "Hommik" }],
  });

  assert.equal(result.linkedGroupLessonCount, 1);
  assert.equal(result.groupLessonsNeedingLink.length, 0);
  assert.equal(result.orphanLessons.length, 0);
});

test("similar names are not guessed and duplicate exact group names remain unresolved", () => {
  const result = classifyLessonDataQuality({
    groups: [
      { id: "group-a", name: "Grupp A" },
      { id: "group-b", name: "Grupp A" },
      { id: "group-c", name: "Grupp B" },
    ],
    lessons: [
      { id: "ambiguous", studentId: "ext", studentName: "Grupp A" },
      { id: "similar-only", studentId: "ext", studentName: "Grupp B hommik" },
    ],
  });

  assert.equal(result.groupLessonsNeedingLink.length, 1);
  assert.equal(result.groupLessonsNeedingLink[0].id, "ambiguous");
  assert.equal(result.groupLessonsNeedingLink[0].suggestedGroupId, "");
  assert.deepEqual(result.orphanLessons.map(lesson => lesson.id), ["similar-only"]);
});
