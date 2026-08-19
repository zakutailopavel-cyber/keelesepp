"use strict";

const cleanId = value => String(value || "").trim();

function uniqueIds(values = []) {
  return [...new Set(values.flatMap(value => Array.isArray(value) ? value : [value])
    .map(cleanId)
    .filter(Boolean))];
}

function studentAccountIds(student = {}) {
  return uniqueIds([
    student.linkedUserIds,
    student.linkedUserId,
    student.studentUid,
  ]);
}

function parentAccountIds(student = {}) {
  return uniqueIds([
    student.linkedParentIds,
    student.linkedParentId,
    student.parentUid,
    student.guardianUid,
  ]);
}

function normalizedStudentMergeInput({ primaryStudentId, duplicateStudentIds } = {}) {
  const primaryId = cleanId(primaryStudentId);
  const duplicateIds = uniqueIds(duplicateStudentIds).filter(id => id !== primaryId);
  if (!primaryId) throw new Error("primaryStudentId required");
  if (!duplicateIds.length) throw new Error("At least one duplicateStudentId required");
  if (duplicateIds.length > 20) throw new Error("At most 20 duplicates can be merged at once");
  return { primaryStudentId: primaryId, duplicateStudentIds: duplicateIds };
}

function studentMergeOwnership(students = [], userDocumentIds = []) {
  return {
    linkedUserIds: uniqueIds([
      ...students.flatMap(studentAccountIds),
      userDocumentIds,
    ]),
    linkedParentIds: uniqueIds(students.flatMap(parentAccountIds)),
  };
}

function mergeGroupStudentReferences(group = {}, primaryStudentId, duplicateStudentIds = []) {
  const primaryId = cleanId(primaryStudentId);
  const duplicateSet = new Set(uniqueIds(duplicateStudentIds));
  const students = uniqueIds(group.students).map(id => duplicateSet.has(id) ? primaryId : id);
  const sourceMap = group.studentLessonMap && typeof group.studentLessonMap === "object"
    ? group.studentLessonMap
    : {};
  const studentLessonMap = { ...sourceMap };
  const mergedLessonIds = uniqueIds([
    sourceMap[primaryId],
    ...[...duplicateSet].map(id => sourceMap[id]),
  ]);
  duplicateSet.forEach(id => { delete studentLessonMap[id]; });
  if (mergedLessonIds.length) studentLessonMap[primaryId] = mergedLessonIds;
  return {
    students: uniqueIds(students),
    studentLessonMap,
  };
}

module.exports = {
  mergeGroupStudentReferences,
  normalizedStudentMergeInput,
  parentAccountIds,
  studentAccountIds,
  studentMergeOwnership,
  uniqueIds,
};
