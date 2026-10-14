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

// words of a name (≥ 3 letters): two names belong to the same person only if they share one (Uljana / Ulyana Kazak do,
// Lana Polišuk / Olena Polishchuk do not)
function nameTokens(value) {
  return normalizeName(value).split(" ").filter(token => token.length >= 3);
}

function namesOverlap(left, right) {
  const a = nameTokens(left);
  const b = nameTokens(right);
  if (!a.length || !b.length) return true;
  return a.some(x => b.some(y => x === y || (x.length >= 4 && y.length >= 4 && (x.startsWith(y) || y.startsWith(x)))));
}

// a child's card: a parent is named on it or the grade is a school class / kindergarten
function looksLikeChildCard(student = {}, email = "") {
  return Boolean(String(student.parentName || "").trim())
    || (email && parentEmails(student).includes(email))
    || /klass|lasteaed|kindergarten/i.test(String(student.grade || ""));
}

// a card that may already be this person although it is not active or not linked: same login, same e-mail (also as the
// parent's e-mail) or the same full name (two words or more — a first name alone is too common)
function possibleExistingCards(students = [], { uid = "", email = "", displayName = "" } = {}) {
  const fullName = nameTokens(displayName).length >= 2 ? normalizeName(displayName) : "";
  return students.filter(student => student?.id && !student.mergedIntoStudentId && (
    (uid && studentUserIds(student).includes(uid))
    || (email && (studentEmails(student).includes(email) || parentEmails(student).includes(email)))
    || (fullName && normalizeName(student.name) === fullName)
  ));
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
    // the parent's e-mail written on a child's card: the parent's own account must not become the child's login
    // (owner 2026-10-14: a mother was linked to her daughter's card as the student)
    const accountName = String(displayName || "").includes("@") ? "" : displayName;
    if (accountName && looksLikeChildCard(candidate, cleanEmail) && !namesOverlap(accountName, candidate.name)) return {
      status: "review",
      reason: "email_on_child_card",
      candidates: [candidateSummary(candidate)],
    };
    return { status: "link", studentId: candidate.id, source: "exact_email" };
  }
  // never a silent duplicate: an inactive card, a child card with this e-mail or the same full name goes to the
  // administrator first (owner 2026-10-14: „Elena” and a new „Olena” card for the same person)
  const existing = possibleExistingCards(students, { uid: cleanUid, email: cleanEmail, displayName });
  if (existing.length) return {
    status: "review",
    reason: "possible_existing_card",
    candidates: existing.map(candidateSummary),
  };
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
    // an inactive card of this child with this parent's e-mail or login: the administrator decides, no duplicate
    const inactive = students.filter(student => student?.id && student.active === false && !student.mergedIntoStudentId
      && normalizeName(student.name) === nameKey
      && (parentEmails(student).includes(cleanEmail) || studentParentIds(student).includes(cleanUid)));
    if (inactive.length) {
      plans.push({ childName, status: "review", reason: "possible_existing_card", candidates: inactive.map(candidateSummary) });
      return;
    }
    plans.push({ childName, status: "create", source: "no_exact_match", student: { name: childName, parentEmail: cleanEmail } });
  });
  return plans;
}

module.exports = {
  looksLikeChildCard,
  namesOverlap,
  possibleExistingCards,
  normalizeEmail,
  normalizeName,
  namesAreShortAndFullVariants,
  planParentChildBootstrap,
  planStudentAccountBootstrap,
  studentParentIds,
  studentUserIds,
};
