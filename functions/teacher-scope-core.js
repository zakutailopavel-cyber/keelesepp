"use strict";

const TEACHER_KEY_ALIASES = Object.freeze({
  pavel: "pavel",
  jelena: "elena",
  elena: "elena",
  elizaveta: "yelyzaveta",
  yelyzaveta: "yelyzaveta",
  angelina: "anhelina",
  anhelina: "anhelina",
});

function normalizeText(value) {
  return String(value || "").trim().toLowerCase();
}

function canonicalTeacherKey(value) {
  const first = normalizeText(value).split(/\s+/)[0] || "";
  return TEACHER_KEY_ALIASES[first] || first;
}

function recordData(record = {}) {
  return record.data && typeof record.data === "object" ? record.data : record;
}

function recordId(record = {}) {
  return String(record.id || "").trim();
}

function buildTeacherDirectory(users = []) {
  const candidatesByKey = new Map();
  users.forEach(record => {
    const data = recordData(record);
    const uid = recordId(record) || String(data.uid || "").trim();
    const role = normalizeText(data.role);
    const key = canonicalTeacherKey(data.displayName || data.name);
    if (!uid || !key || !["teacher", "admin"].includes(role)) return;
    if (!candidatesByKey.has(key)) candidatesByKey.set(key, new Set());
    candidatesByKey.get(key).add(uid);
  });

  const byKey = new Map();
  const conflicts = [];
  candidatesByKey.forEach((uids, key) => {
    const values = [...uids].sort();
    if (values.length === 1) byKey.set(key, values[0]);
    else conflicts.push({ key, uids: values });
  });
  return { byKey, conflicts };
}

function resolveTeacherUid(data, directory) {
  const existing = String(data.teacherUid || "").trim();
  if (existing) {
    const knownUids = new Set(directory.byKey.values());
    return knownUids.has(existing)
      ? { uid: existing, source: "existing" }
      : { uid: "", source: "invalid_teacher_uid", teacherUid: existing };
  }
  const key = canonicalTeacherKey(data.teacherFull || data.teacher);
  if (!key) return { uid: "", source: "missing_teacher" };
  const uid = directory.byKey.get(key) || "";
  return uid ? { uid, source: "teacher_name" } : { uid: "", source: "unresolved_teacher", key };
}

function collectionPlan(records, resolver) {
  const patches = [];
  const unresolved = [];
  const unassigned = [];
  let alreadyMapped = 0;
  records.forEach(record => {
    const id = recordId(record);
    const data = recordData(record);
    if (!id) return;
    const resolution = resolver(data);
    if (resolution.source === "existing") {
      alreadyMapped += 1;
      return;
    }
    if (resolution.uid) {
      patches.push({ id, data: { teacherUid: resolution.uid } });
      return;
    }
    const issue = {
      id,
      reason: resolution.source,
      teacher: String(data.teacherFull || data.teacher || ""),
      teacherUid: String(resolution.teacherUid || ""),
    };
    if (resolution.source === "missing_teacher") unassigned.push(issue);
    else unresolved.push(issue);
  });
  return { patches, unresolved, unassigned, alreadyMapped, total: records.length };
}

function planTeacherScopeBackfill({ users = [], students = [], lessons = [], schedule = [] } = {}) {
  const directory = buildTeacherDirectory(users);
  const studentPlan = collectionPlan(students, data => resolveTeacherUid(data, directory));
  const studentUidById = new Map();
  students.forEach(record => {
    const id = recordId(record);
    const data = recordData(record);
    const resolution = resolveTeacherUid(data, directory);
    if (id && resolution.uid) studentUidById.set(id, resolution.uid);
  });

  const relatedResolver = data => {
    const existing = String(data.teacherUid || "").trim();
    if (existing) return { uid: existing, source: "existing" };
    const studentUid = studentUidById.get(String(data.studentId || "").trim());
    if (studentUid) return { uid: studentUid, source: "student" };
    return resolveTeacherUid(data, directory);
  };
  const lessonPlan = collectionPlan(lessons, relatedResolver);
  const schedulePlan = collectionPlan(schedule, relatedResolver);
  const plans = { students: studentPlan, lessons: lessonPlan, schedule: schedulePlan };
  const summary = Object.fromEntries(Object.entries(plans).map(([name, plan]) => [name, {
    total: plan.total,
    patchCount: plan.patches.length,
    alreadyMapped: plan.alreadyMapped,
    unresolvedCount: plan.unresolved.length,
    unassignedCount: plan.unassigned.length,
  }]));
  const unresolvedCount = Object.values(plans).reduce((sum, plan) => sum + plan.unresolved.length, 0);
  return {
    teacherDirectory: Object.fromEntries([...directory.byKey.entries()].sort(([left], [right]) => left.localeCompare(right))),
    directoryConflicts: directory.conflicts,
    readyToApply: directory.conflicts.length === 0 && unresolvedCount === 0,
    summary,
    patches: Object.fromEntries(Object.entries(plans).map(([name, plan]) => [name, plan.patches])),
    unresolved: Object.fromEntries(Object.entries(plans).map(([name, plan]) => [name, plan.unresolved])),
    unassigned: Object.fromEntries(Object.entries(plans).map(([name, plan]) => [name, plan.unassigned])),
  };
}

module.exports = {
  buildTeacherDirectory,
  canonicalTeacherKey,
  planTeacherScopeBackfill,
};
