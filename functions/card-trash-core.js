"use strict";

// „Prügikast” for student and teacher cards (administrator Oleksiy 2026-11-03: „удалять карточки учителей и учеников …
// мусорка временем в неделю, через неделю удаляется окончательно”). Pure rules, no Firestore: functions/card-trash.js
// reads and writes, this file decides. ARCHITECTURE.md „Card trash” is the contract.
//
// 1. „Kustuta” puts a card in the trash: it is hidden everywhere (students: active: false; teachers: disabled: true —
//    the old value is kept in trashState so „Taasta” brings back exactly what was there) and gets
//    deletedAt / deletedBy / purgeAfter (= deletedAt + 7 days). Nothing else on the card changes.
//    Refused while the card still has lessons ahead (or an active group): those must be moved or cancelled first.
// 2. After purgeAfter the scheduled purge decides per card:
//    - „delete”: nothing anywhere refers to the card (no lesson, invoice, payment, homework, result, pay record …):
//      the card document and its own disposable documents are deleted;
//    - „anonymise”: something refers to it: the id and every history record stay, the card keeps only non-personal
//      fields, its name becomes „Kustutatud õpilane #abc123” and it is marked purgedAt;
//    - „block”: lessons ahead appeared meanwhile — nothing is changed, the card stays in the trash with the reason.
//    Audit collections (activityLog …) do not count as references: they keep the old id on purpose.

const { futureRecordInScope } = require("./schedule-clear-core");

const TRASH_DAYS = 7;
const DAY_MS = 24 * 60 * 60 * 1000;
const KINDS = new Set(["student", "teacher"]);
const TRASH_FIELDS = ["deletedAt", "deletedBy", "purgeAfter", "trashState", "purgeBlocked", "purgeBlockedAt"];

// audit / outbox collections: they keep the old id and never stop a delete
const IGNORED_COLLECTIONS = new Set([
  "activityLog", "financialAudit", "emailQueue", "emailLog", "calendarSyncOutbox", "studentMergeOperations",
  "studentCardMerges", "parentMergeOperations", "assistantAlerts", "learnerEmailJobs", "learnerEmailRuns",
]);
// documents whose id is the card id and that hold no history: removed with the card
const DISPOSABLE = {
  student: { delete: ["studentAvailability", "studentRevenuePlans"], anonymise: ["studentAvailability"] },
  teacher: { delete: ["teacherAvailability"], anonymise: ["teacherAvailability"] },
};
// documents whose id is the card id and that are history (tax data, first assessment, the board): keep the card
const HISTORY_DOCS = { student: ["taxIdentities", "studentInitialAssessments", "whiteboards"], teacher: [] };

// what an anonymised card keeps: ids, the learning / teaching meaning, the lifecycle — nothing that names a person
const KEEP_FIELDS = {
  student: [
    "subject", "level", "targetLevel", "grade", "teacher", "teacherUid", "teacherUids", "enrollments", "skillMap",
    "curriculumPlan", "studyPlan", "personId", "payerMethod", "createdAt", "archivedAt", "restoredAt",
    "mergedInto", "mergedIntoStudentId", "mergedStudentIds", "testStudent", "convertedToParent",
    "deletedAt", "deletedBy",
  ],
  teacher: ["role", "approvalStatus", "createdAt", "calendarTone", "hourlyRate", "hourlyRateCents", "deletedAt", "deletedBy"],
};

const KIND_LABEL = { student: "õpilane", teacher: "õpetaja" };

function cardError(status, message, extra = {}) {
  const error = new Error(message);
  error.status = status;
  Object.assign(error, extra);
  return error;
}

function cleanKind(kind) {
  const value = String(kind || "").trim();
  if (!KINDS.has(value)) throw cardError(400, "Kaardi liik peab olema student või teacher.");
  return value;
}

function cleanId(id) {
  const value = String(id || "").trim();
  if (!value || value.length > 180 || value.includes("/")) throw cardError(400, "Kaardi ID puudub või on vigane.");
  return value;
}

function addDays(iso, days) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) throw new Error("Invalid date");
  return new Date(date.getTime() + days * DAY_MS).toISOString();
}

const shortId = (id) => String(id || "").replace(/[^A-Za-z0-9]/g, "").slice(0, 6) || "000000";
const deletedName = (kind, id) => `Kustutatud ${KIND_LABEL[kind]} #${shortId(id)}`;
const isTrashed = (card = {}) => Boolean(card.deletedAt) && !card.purgedAt;
const cardName = (kind, card = {}) => String((kind === "teacher" ? card.displayName || card.name || card.email : card.name) || "").trim();

// the lessons ahead of a card: schedule records still planned from today on (single, recurring, not cancelled)
function futureLessons(schedule = [], today) {
  return (schedule || []).filter((record) => record && futureRecordInScope(record, today));
}

/**
 * Why a card cannot go to the trash now: [{ code, message }]; empty = it can.
 * schedule: the card's schedule records; groups: the groups it is in (student) or teaches (teacher).
 */
function trashBlockers(kind, { id, card, schedule = [], groups = [], today, actorUid = "" } = {}) {
  const blockers = [];
  if (!card) return [{ code: "missing", message: "Kaarti ei leitud." }];
  if (card.purgedAt) blockers.push({ code: "purged", message: "Kaart on juba lõplikult kustutatud." });
  else if (card.deletedAt) blockers.push({ code: "trashed", message: "Kaart on juba prügikastis." });
  if (kind === "teacher") {
    if (id && id === actorUid) blockers.push({ code: "self", message: "Oma kontot ei saa kustutada." });
    if (String(card.role || "") !== "teacher") blockers.push({ code: "not-teacher", message: "Kustutada saab ainult õpetaja kaarti. Administraatori puhul muuda enne roll õpetajaks." });
  }
  const ahead = futureLessons(schedule, today);
  if (ahead.length) {
    blockers.push({
      code: "future-lessons",
      count: ahead.length,
      message: kind === "teacher"
        ? `Õpetajal on ${ahead.length} eesootavat tundi või tunnisarja. Anna need enne teisele õpetajale või tühista (Kalender).`
        : `Õpilasel on ${ahead.length} eesootavat tundi või tunnisarja. Tühista need enne või lõpeta sari (Kalender).`,
    });
  }
  const activeGroups = (groups || []).filter((group) => group && group.active !== false);
  if (activeGroups.length) {
    const names = activeGroups.map((group) => group.name || group.id).filter(Boolean).slice(0, 5).join(", ");
    blockers.push({
      code: "active-group",
      count: activeGroups.length,
      message: kind === "teacher"
        ? `Õpetaja juhendab aktiivset gruppi (${names}). Määra grupile teine õpetaja või arhiveeri grupp.`
        : `Õpilane on aktiivses grupis (${names}). Eemalda ta enne grupist.`,
    });
  }
  return blockers;
}

// „Kustuta”: the fields set on the card (merge write)
function trashPatch(kind, card = {}, { actor = {}, nowIso = new Date().toISOString() } = {}) {
  const base = {
    deletedAt: nowIso,
    deletedBy: { uid: String(actor.uid || ""), name: String(actor.name || "").slice(0, 160) },
    purgeAfter: addDays(nowIso, TRASH_DAYS),
    updatedAt: nowIso,
  };
  if (kind === "teacher") return { ...base, disabled: true, trashState: { disabled: card.disabled === true } };
  return { ...base, active: false, trashState: { active: card.active !== false } };
}

// „Taasta”: { set, remove } — the old active / disabled value comes back, the trash fields go
function restoreChange(kind, card = {}, { nowIso = new Date().toISOString() } = {}) {
  if (!card || !card.deletedAt) throw cardError(409, "Kaart ei ole prügikastis.");
  if (card.purgedAt) throw cardError(409, "Kaart on juba lõplikult kustutatud; seda ei saa taastada.");
  const state = card.trashState && typeof card.trashState === "object" ? card.trashState : {};
  const set = kind === "teacher"
    ? { disabled: state.disabled === true, restoredFromTrashAt: nowIso, updatedAt: nowIso }
    : { active: state.active !== false, restoredFromTrashAt: nowIso, updatedAt: nowIso };
  return { set, remove: TRASH_FIELDS };
}

/**
 * The purge decision for one card in the trash.
 * references: [{ collection, field, count }] — every record outside the audit collections that points at the card
 * (historyDocs included as { collection, field: "id" }); schedule: the card's schedule records (for lessons ahead);
 * groups: the groups it is in / teaches. Returns { action: "skip" | "wait" | "block" | "delete" | "anonymise", reason,
 * references }.
 */
function purgeDecision({ card, references = [], schedule = [], groups = [], now = new Date().toISOString(), today } = {}) {
  if (!card || !card.deletedAt) return { action: "skip", reason: "not-in-trash", references: [] };
  if (card.purgedAt) return { action: "skip", reason: "already-purged", references: [] };
  if (!card.purgeAfter || String(card.purgeAfter) > String(now)) return { action: "wait", reason: "not-due", references: [] };
  const ahead = futureLessons(schedule, today || String(now).slice(0, 10));
  if (ahead.length) return { action: "block", reason: "future-lessons", count: ahead.length, references: [] };
  const activeGroups = (groups || []).filter((group) => group && group.active !== false);
  if (activeGroups.length) return { action: "block", reason: "active-group", count: activeGroups.length, references: [] };
  const kept = (references || []).filter((ref) => ref && ref.count > 0 && !IGNORED_COLLECTIONS.has(ref.collection));
  if (kept.length) return { action: "anonymise", reason: "history", references: kept };
  return { action: "delete", reason: "no-history", references: [] };
}

// the card after anonymising: kept fields only (set without merge), the deleted name, no contact, no account link
function anonymisedCard(kind, id, card = {}, { nowIso = new Date().toISOString() } = {}) {
  const kept = Object.fromEntries(KEEP_FIELDS[kind].filter((key) => card[key] !== undefined).map((key) => [key, card[key]]));
  const label = deletedName(kind, id);
  if (kind === "teacher") {
    return { ...kept, displayName: label, name: label, email: "", disabled: true, purgedAt: nowIso, anonymised: true, updatedAt: nowIso };
  }
  return {
    ...kept, name: label, email: "", phone: "", parentName: "", parentEmail: "", active: false,
    linkedUserId: "", studentUid: "", linkedUserIds: [], linkedParentId: "", parentUid: "", guardianUid: "", linkedParentIds: [],
    purgedAt: nowIso, anonymised: true, updatedAt: nowIso,
  };
}

// the accounts a student card is linked to (their users.linkedStudentIds lose the card id at purge)
function linkedAccountIds(card = {}) {
  const ids = [card.linkedUserId, card.studentUid, card.linkedParentId, card.parentUid, card.guardianUid, ...(card.linkedUserIds || []), ...(card.linkedParentIds || [])];
  return [...new Set(ids.map((value) => String(value || "").trim()).filter(Boolean))];
}

// the fields a card is found by in other collections
function referenceQueries(kind, id, card = {}) {
  if (kind === "student") {
    return [
      { field: "studentId", op: "==", value: id },
      { field: "studentIds", op: "array-contains", value: id },
      { field: "students", op: "array-contains", value: id },
      { field: "mergedInto", op: "==", value: id },
    ];
  }
  const name = cardName("teacher", card);
  return [
    { field: "teacherUid", op: "==", value: id },
    { field: "teacherUids", op: "array-contains", value: id },
    { field: "staffUid", op: "==", value: id },
    { field: "assignedBy", op: "==", value: id },
    { field: "createdByUid", op: "==", value: id },
    ...(name ? [{ field: "teacher", op: "==", value: name }, { field: "teacherFull", op: "==", value: name }] : []),
  ];
}

// collections never searched for references: accounts (`users` — a learner's account link is removed at purge, it is
// not history), the audit collections and the disposable per-card documents. `students` is searched (a teacher's
// assigned cards, a tombstone merged into this card); the card's own document is left out by the caller.
function skipCollection(kind, collection) {
  if (IGNORED_COLLECTIONS.has(collection) || collection === "users") return true;
  return DISPOSABLE[kind].delete.includes(collection);
}

module.exports = {
  TRASH_DAYS,
  TRASH_FIELDS,
  IGNORED_COLLECTIONS,
  DISPOSABLE,
  HISTORY_DOCS,
  KEEP_FIELDS,
  addDays,
  anonymisedCard,
  cardError,
  cardName,
  cleanId,
  cleanKind,
  deletedName,
  futureLessons,
  isTrashed,
  linkedAccountIds,
  purgeDecision,
  referenceQueries,
  restoreChange,
  shortId,
  skipCollection,
  trashBlockers,
  trashPatch,
};
