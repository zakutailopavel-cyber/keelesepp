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

// parents without an account are also kept in parentContacts (student card „Lapsevanemad”, 2026-10-24)
function parentEmails(student = {}) {
  const contacts = Array.isArray(student.parentContacts) ? student.parentContacts.map(contact => contact?.email) : [];
  return unique([student.parentEmail, student.guardianEmail, ...contacts]).map(normalizeEmail).filter(Boolean);
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

// `decidedChildNames`: child names whose review the administrator already decided (see decidedReviewChildNames). Such a
// name gets no new card and no new review: linking „Mark Ivanov” for the typed „Markus” must not make a card „Markus” at
// the next sign-in, when the linked card no longer counts as a possible match.
function planParentChildBootstrap({ uid, email, emailVerified = false, childNames = [], students = [], decidedChildNames = [] } = {}) {
  const cleanUid = String(uid || "").trim();
  const cleanEmail = normalizeEmail(email);
  const available = activeStudents(students);
  const plans = [];
  const names = unique(childNames.map(name => String(name || "").trim())).filter(name => normalizeName(name));
  const requestedKeys = names.map(normalizeName);
  const decidedKeys = decidedChildNames.map(normalizeName);
  // Cards with this parent's e-mail that are not linked to the account: never linked or duplicated automatically,
  // the administrator decides in „Uued kontod” → „Vajab otsust”.
  const emailOnlyCards = cleanEmail
    ? available.filter(student => parentEmails(student).includes(cleanEmail) && !studentParentIds(student).includes(cleanUid))
    : [];
  if (!names.length) {
    if (emailOnlyCards.length) plans.push({ childName: "", status: "review", reason: "parent_email_without_child_name", candidates: emailOnlyCards.map(candidateSummary) });
    return plans;
  }
  names.forEach(childName => {
    const nameKey = normalizeName(childName);
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
    if (decidedKeys.includes(nameKey)) return;
    // a sibling typed in the same registration has its own plan and is no reason to stop this child
    const otherEmailCards = emailOnlyCards.filter(student => !requestedKeys.includes(normalizeName(student.name)));
    if (otherEmailCards.length) {
      plans.push({ childName, status: "review", reason: "parent_email_other_child_name", candidates: otherEmailCards.map(candidateSummary) });
      return;
    }
    plans.push({ childName, status: "create", source: "no_exact_match", student: { name: childName, parentEmail: cleanEmail } });
  });
  return plans;
}

// Reviews come back on every sign-in. One the administrator decided (resolvedBy) stays decided: „Jäta vahele” is not asked
// again unless a new card appears. The one exception is a parent without a child's name: linking one card leaves
// the other cards with the parent's e-mail still undecided.
function reviewAlreadyDecided(existing, plan = {}) {
  if (!existing?.resolvedBy) return false;
  if (existing.status === "dismissed") {
    const known = existing.candidateStudentIds || [];
    return (plan.candidates || []).every(candidate => known.includes(candidate.id));
  }
  return existing.status === "resolved" && plan.reason !== "parent_email_without_child_name";
}

function decidedReviewChildNames(reviews = []) {
  return unique(reviews
    .filter(review => review?.resolvedBy && ["dismissed", "resolved"].includes(review.status) && review.relationship === "parent")
    .map(review => review.childName));
}

// Teacher of a card created while linking an account: only the one the administrator assigned on approval. The registering
// person chooses no teacher (owner's decision), and `preferredTeacher` of older accounts is the person's own field.
// Without an assignment the new card stays unassigned for the administrator.
function accountCardTeacher(profile = {}) {
  const uid = String(profile.assignedTeacherUid || "").trim();
  return uid ? { name: String(profile.assignedTeacher || "").trim(), uid } : { name: "", uid: "" };
}

// What the signing-in learner / parent gets back from /accounts/bootstrap: their own card ids and counts only. The
// review candidates (other people's names, e-mails and card ids) stay for the administrator („Uued kontod”,
// /accounts/reviews, /accounts/bootstrap-admin). Allow-list: a new field in the bootstrap result is not passed on.
function publicBootstrapResult(result = {}) {
  const ids = value => (Array.isArray(value) ? value.map(id => String(id || "")).filter(Boolean) : []);
  return {
    status: typeof result.status === "string" ? result.status : "",
    linkedStudentIds: ids(result.linkedStudentIds),
    createdStudentIds: ids(result.createdStudentIds),
    reviewCount: Array.isArray(result.reviews) ? result.reviews.length : 0,
  };
}

module.exports = {
  publicBootstrapResult,
  accountCardTeacher,
  decidedReviewChildNames,
  reviewAlreadyDecided,
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
