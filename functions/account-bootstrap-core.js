"use strict";

function normalizeEmail(value) {
  return String(value || "").trim().toLowerCase();
}

function normalizeName(value) {
  return String(value || "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function unique(values) {
  return [...new Set(values.flatMap(value => Array.isArray(value) ? value : [value])
    .map(value => String(value || "").trim())
    .filter(Boolean))];
}

function studentUserIds(student = {}) {
  return unique([student.linkedUserIds, student.linkedUserId, student.studentUid]);
}

function studentParentIds(student = {}) {
  return unique([student.linkedParentIds, student.linkedParentId, student.parentUid, student.guardianUid]);
}

function studentEmails(student = {}) {
  return unique([student.email, student.contactEmail, student.studentEmail]).map(normalizeEmail).filter(Boolean);
}

function parentEmails(student = {}) {
  return unique([student.parentEmail, student.guardianEmail]).map(normalizeEmail).filter(Boolean);
}

function activeStudents(students = []) {
  return students.filter(student => student?.id && student.active !== false && !student.mergedIntoStudentId);
}

function namesAreShortAndFullVariants(left, right) {
  const a = normalizeName(left);
  const b = normalizeName(right);
  if (!a || !b || a === b) return false;
  return a.startsWith(`${b} `) || b.startsWith(`${a} `);
}

function candidateSummary(student) {
  return {
    id: student.id,
    name: student.name || "",
    email: student.email || student.contactEmail || "",
    parentEmail: student.parentEmail || student.guardianEmail || "",
  };
}

function planStudentAccountBootstrap({ uid, email, emailVerified = false, displayName, students = [] } = {}) {
  const cleanUid = String(uid || "").trim();
  const cleanEmail = normalizeEmail(email);
  const available = activeStudents(students);
  const linked = available.filter(student => studentUserIds(student).includes(cleanUid));
  if (linked.length === 1) return { status: "linked", studentId: linked[0].id, source: "uid" };
  if (linked.length > 1) return {
    status: "review",
    reason: "uid_multiple_students",
    candidates: linked.map(candidateSummary),
  };

  const emailMatches = cleanEmail
    ? available.filter(student => studentEmails(student).includes(cleanEmail))
    : [];
  if (emailMatches.length > 1) return {
    status: "review",
    reason: "email_multiple_students",
    candidates: emailMatches.map(candidateSummary),
  };
  if (emailMatches.length === 1) {
    const candidate = emailMatches[0];
    if (!emailVerified) return {
      status: "review",
      reason: "email_not_verified",
      candidates: [candidateSummary(candidate)],
    };
    const otherUserIds = studentUserIds(candidate).filter(id => id !== cleanUid);
    if (otherUserIds.length) return {
      status: "review",
      reason: "student_has_another_login",
      candidates: [candidateSummary(candidate)],
    };
    return { status: "link", studentId: candidate.id, source: "exact_email" };
  }
  return {
    status: "create",
    source: "no_exact_match",
    student: { name: String(displayName || email || "Õpilane").trim(), email: cleanEmail },
  };
}

function planParentChildBootstrap({ uid, email, emailVerified = false, childNames = [], students = [] } = {}) {
  const cleanUid = String(uid || "").trim();
  const cleanEmail = normalizeEmail(email);
  const available = activeStudents(students);
  const plans = [];
  unique(childNames.map(name => String(name || "").trim())).forEach(childName => {
    const nameKey = normalizeName(childName);
    if (!nameKey) return;
    const linkedByParent = available.filter(student =>
      studentParentIds(student).includes(cleanUid) && normalizeName(student.name) === nameKey
    );
    if (linkedByParent.length === 1) {
      plans.push({ childName, status: "linked", studentId: linkedByParent[0].id, source: "parent_uid_and_name" });
      return;
    }
    if (linkedByParent.length > 1) {
      plans.push({ childName, status: "review", reason: "parent_uid_multiple_children_with_same_name", candidates: linkedByParent.map(candidateSummary) });
      return;
    }
    const possibleLinkedVariants = available.filter(student =>
      studentParentIds(student).includes(cleanUid) && namesAreShortAndFullVariants(student.name, childName)
    );
    if (possibleLinkedVariants.length) {
      plans.push({ childName, status: "review", reason: "parent_child_name_variant", candidates: possibleLinkedVariants.map(candidateSummary) });
      return;
    }
    const exactMatches = cleanEmail ? available.filter(student =>
      normalizeName(student.name) === nameKey && parentEmails(student).includes(cleanEmail)
    ) : [];
    if (exactMatches.length === 1) {
      if (!emailVerified) {
        plans.push({ childName, status: "review", reason: "parent_email_not_verified", candidates: exactMatches.map(candidateSummary) });
        return;
      }
      plans.push({ childName, status: "link", studentId: exactMatches[0].id, source: "exact_parent_email_and_child_name" });
      return;
    }
    if (exactMatches.length > 1) {
      plans.push({ childName, status: "review", reason: "parent_email_and_name_multiple_students", candidates: exactMatches.map(candidateSummary) });
      return;
    }
    plans.push({ childName, status: "create", source: "no_exact_match", student: { name: childName, parentEmail: cleanEmail } });
  });
  return plans;
}

module.exports = {
  normalizeEmail,
  normalizeName,
  namesAreShortAndFullVariants,
  planParentChildBootstrap,
  planStudentAccountBootstrap,
  studentParentIds,
  studentUserIds,
};
