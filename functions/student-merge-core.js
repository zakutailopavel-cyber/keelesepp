"use strict";

const cleanId = value => String(value || "").trim();
const cleanValue = value => String(value ?? "").trim();

function normalizedIdentity(value) {
  return cleanValue(value)
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}@+]+/gu, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function normalizedEmail(value) {
  const email = cleanValue(value).toLowerCase();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : "";
}

function normalizedPhone(value) {
  const digits = cleanValue(value).replace(/\D/g, "");
  return digits.length >= 7 ? digits.slice(-8) : "";
}

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

const uniqueValues = values => [...new Set(values.flatMap(value => Array.isArray(value) ? value : [value])
  .map(cleanValue)
  .filter(Boolean))];

const intersect = (left, right) => left.some(value => right.includes(value));

function studentIdentitySignals(student = {}) {
  const name = normalizedIdentity(student.name);
  const nameTokens = name.split(" ").filter(Boolean);
  return {
    name,
    nameTokens,
    firstName: nameTokens[0] || "",
    emails: uniqueValues([
      student.email,
      student.contactEmail,
      student.studentEmail,
    ]).map(normalizedEmail).filter(Boolean),
    parentEmails: uniqueValues([
      student.parentEmail,
      student.guardianEmail,
    ]).map(normalizedEmail).filter(Boolean),
    phones: uniqueValues([
      student.phone,
      student.studentPhone,
    ]).map(normalizedPhone).filter(Boolean),
    parentPhones: uniqueValues([
      student.parentPhone,
      student.guardianPhone,
    ]).map(normalizedPhone).filter(Boolean),
    studentUids: studentAccountIds(student),
    parentUids: parentAccountIds(student),
    parentName: normalizedIdentity(student.parentName || student.guardianName),
    teacher: normalizedIdentity(student.teacher),
    subject: normalizedIdentity(student.subject || "Eesti keel"),
    level: normalizedIdentity(student.level),
    groupId: cleanId(student.groupId),
  };
}

function studentDuplicatePair(left = {}, right = {}) {
  if (!left.id || !right.id || left.id === right.id) return null;
  if (left.active === false || right.active === false || left.mergedIntoStudentId || right.mergedIntoStudentId) return null;
  const a = studentIdentitySignals(left);
  const b = studentIdentitySignals(right);
  if (a.groupId && a.groupId === b.groupId) return null;
  let score = 0;
  const reasons = [];
  const add = (points, code, label) => {
    score += points;
    reasons.push({ code, label });
  };
  if (intersect(a.studentUids, b.studentUids)) add(120, "student_account", "Sama õpilase sisselogimiskonto");
  if (intersect(a.emails, b.emails)) add(90, "student_email", "Sama õpilase e-post");
  if (intersect(a.phones, b.phones)) add(75, "student_phone", "Sama telefon");

  const exactName = Boolean(a.name) && a.name === b.name;
  const nameVariant = Boolean(a.firstName) && a.firstName === b.firstName
    && (a.nameTokens.length === 1 || b.nameTokens.length === 1)
    && a.name !== b.name;
  if (exactName) add(45, "name", "Sama nimi");
  else if (nameVariant) add(25, "name_variant", "Lühike ja täielik nimekuju");

  const sameParentUid = intersect(a.parentUids, b.parentUids);
  const sameParentEmail = intersect(a.parentEmails, b.parentEmails);
  if ((exactName || nameVariant) && sameParentUid) add(55, "parent_account", "Sama lapsevanema konto");
  if ((exactName || nameVariant) && sameParentEmail) add(45, "parent_email", "Sama lapsevanema e-post");
  if ((exactName || nameVariant) && a.parentName && a.parentName === b.parentName) add(15, "parent_name", "Sama lapsevanema nimi");
  if ((exactName || nameVariant) && intersect(a.parentPhones, b.parentPhones)) add(35, "parent_phone", "Sama lapsevanema telefon");

  if ((exactName || nameVariant) && a.teacher && a.teacher === b.teacher) add(6, "teacher", "Sama õpetaja");
  if ((exactName || nameVariant) && a.subject && a.subject === b.subject) add(6, "subject", "Sama õppeaine");
  if ((exactName || nameVariant) && a.level && a.level === b.level) add(3, "level", "Sama tase");

  const strongIdentity = reasons.some(reason => ["student_account", "student_email", "student_phone"].includes(reason.code));
  if (!strongIdentity && !exactName && !nameVariant) return null;
  if (score < 35) return null;
  return {
    leftId: left.id,
    rightId: right.id,
    score,
    confidence: score >= 90 ? "high" : score >= 55 ? "medium" : "review",
    reasons,
  };
}

function findStudentDuplicateGroups(students = []) {
  const active = (students || []).filter(student => student?.id && student.active !== false && !student.mergedIntoStudentId);
  const pairs = [];
  for (let leftIndex = 0; leftIndex < active.length; leftIndex += 1) {
    for (let rightIndex = leftIndex + 1; rightIndex < active.length; rightIndex += 1) {
      const pair = studentDuplicatePair(active[leftIndex], active[rightIndex]);
      if (pair) pairs.push(pair);
    }
  }
  const parent = new Map(active.map(student => [student.id, student.id]));
  const find = id => {
    let current = id;
    while (parent.get(current) !== current) current = parent.get(current);
    return current;
  };
  const unite = (leftId, rightId) => {
    const leftRoot = find(leftId);
    const rightRoot = find(rightId);
    if (leftRoot !== rightRoot) parent.set(rightRoot, leftRoot);
  };
  pairs.forEach(pair => unite(pair.leftId, pair.rightId));
  const components = new Map();
  pairs.forEach(pair => {
    const key = find(pair.leftId);
    if (!components.has(key)) components.set(key, { ids: new Set(), pairs: [] });
    components.get(key).ids.add(pair.leftId);
    components.get(key).ids.add(pair.rightId);
    components.get(key).pairs.push(pair);
  });
  const byId = new Map(active.map(student => [student.id, student]));
  return [...components.values()].map((component, index) => {
    const sortedPairs = component.pairs.sort((left, right) => right.score - left.score);
    const reasonMap = new Map();
    sortedPairs.flatMap(pair => pair.reasons).forEach(reason => reasonMap.set(reason.code, reason));
    const best = sortedPairs[0];
    return {
      kind: "identity",
      key: `student-duplicate-${index + 1}-${[...component.ids].sort().join("-")}`,
      confidence: best.confidence,
      score: best.score,
      reasons: [...reasonMap.values()],
      students: [...component.ids].map(id => {
        const student = byId.get(id) || {};
        return {
          id,
          name: student.name || "",
          email: student.email || student.contactEmail || "",
          parentEmail: student.parentEmail || student.guardianEmail || "",
          phone: student.phone || "",
          teacher: student.teacher || "",
          subject: student.subject || "",
          level: student.level || "",
        };
      }),
    };
  }).sort((left, right) => right.score - left.score || left.key.localeCompare(right.key));
}

function mergeStudentProfileData(primary = {}, duplicates = []) {
  const all = [primary, ...(duplicates || [])];
  const first = field => cleanValue(primary[field]) || all.map(student => cleanValue(student[field])).find(Boolean) || "";
  const aliases = field => uniqueValues(all.map(student => student[field]));
  const snapshotFields = [
    "name", "email", "contactEmail", "phone", "parentName", "parentEmail",
    "level", "targetLevel", "teacher", "subject", "grade", "group",
    "contactNotes", "packageTotal", "packageUsed", "createdAt",
  ];
  const newSnapshots = duplicates.map(student => Object.fromEntries([
    ["id", cleanId(student.id)],
    ...snapshotFields.map(field => [field, student[field] ?? ""]),
  ]));
  const snapshotsById = new Map((Array.isArray(primary.mergedProfileSnapshots) ? primary.mergedProfileSnapshots : [])
    .filter(snapshot => snapshot?.id)
    .map(snapshot => [cleanId(snapshot.id), snapshot]));
  newSnapshots.forEach(snapshot => snapshotsById.set(snapshot.id, snapshot));
  const snapshots = [...snapshotsById.values()];
  const conflictFields = ["name", "email", "phone", "parentName", "parentEmail", "level", "targetLevel", "teacher", "subject", "grade", "packageTotal", "packageUsed"];
  const conflicts = conflictFields.map(field => ({ field, values: aliases(field) })).filter(item => item.values.length > 1);
  const contactNotes = uniqueValues(all.map(student => student.contactNotes));
  return {
    patch: {
      email: first("email"),
      contactEmail: first("contactEmail"),
      phone: first("phone"),
      parentName: first("parentName"),
      parentEmail: first("parentEmail"),
      grade: first("grade"),
      nameAliases: uniqueValues([primary.nameAliases, aliases("name")]),
      emailAliases: uniqueValues([primary.emailAliases, all.flatMap(student => [student.email, student.contactEmail, student.parentEmail])]),
      phoneAliases: uniqueValues([primary.phoneAliases, all.flatMap(student => [student.phone, student.parentPhone, student.guardianPhone])]),
      teacherAliases: uniqueValues([primary.teacherAliases, aliases("teacher")]),
      subjectAliases: uniqueValues([primary.subjectAliases, aliases("subject")]),
      mergedContactNotes: uniqueValues([primary.mergedContactNotes, contactNotes]),
      mergedProfileSnapshots: snapshots,
    },
    conflicts,
    snapshots,
  };
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
  findStudentDuplicateGroups,
  mergeStudentProfileData,
  mergeGroupStudentReferences,
  normalizedIdentity,
  normalizedStudentMergeInput,
  parentAccountIds,
  studentAccountIds,
  studentMergeOwnership,
  studentDuplicatePair,
  uniqueIds,
};
