"use strict";

// A „parent” account that is really the learner (an adult registered as „lapsevanem” and named herself as the child,
// owner 2026-10-17: Вероника Быстрова): the card links the account as the learner's own login, not as a parent.
const { uniqueIds, studentAccountIds, parentAccountIds } = require("./student-merge-core");

function planError(message, status = 409) {
  return Object.assign(new Error(message), { status });
}

/**
 * Patches for students/{id} and users/{uid}. null means „delete the field”; otherChildren = active cards (besides
 * this one) where the same account is still a parent — then the account keeps the parent role as well.
 */
function parentToStudentPlan({ uid, student = {}, profile = {}, email = "", otherChildren = 0, staffRoles = [] }) {
  if (!uid) throw planError("Konto puudub.", 400);
  if (student.active === false || student.mergedInto) throw planError("Õpilase kaart ei ole aktiivne.");
  const role = String(profile.role || "").toLowerCase();
  if (staffRoles.includes(role)) throw planError("Töötaja kontot siin ei muudeta.");
  const parents = parentAccountIds(student);
  if (!parents.includes(uid)) throw planError("See konto ei ole selle kaardi lapsevanem.");
  const restParents = parents.filter(id => id !== uid);
  const firstParent = restParents[0] || null;
  const studentPatch = {
    linkedParentIds: restParents,
    linkedParentId: firstParent,
    parentUid: firstParent,
    linkedUserIds: uniqueIds([studentAccountIds(student), uid]),
    linkedUserId: student.linkedUserId || uid,
    studentUid: student.studentUid || uid,
  };
  if (student.guardianUid === uid) studentPatch.guardianUid = firstParent;
  const lowerEmail = String(email || "").trim().toLowerCase();
  if (lowerEmail && !student.email) studentPatch.email = lowerEmail;
  const keepParent = otherChildren > 0;
  const roles = uniqueIds([Array.isArray(profile.roles) ? profile.roles : [], role, "student"])
    .filter(item => keepParent || item !== "parent");
  const userPatch = {
    role: keepParent ? (role || "parent") : "student",
    roles,
    linkedStudentIds: uniqueIds([Array.isArray(profile.linkedStudentIds) ? profile.linkedStudentIds : [], student.id || ""]),
    childName: keepParent ? (profile.childName || null) : null,
  };
  return { studentPatch, userPatch, keepParent };
}

module.exports = { parentToStudentPlan };
