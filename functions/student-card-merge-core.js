"use strict";

// Pure rules of „Liida kaardid” (owner 2026-10-24: „нормальное объединение”): what the kept card gets from the
// other card, which collections move, and what the administrator must see before confirming. The database work is in
// functions/student-merge.js; nothing here reads or writes Firestore.

const { subjectName, enrollmentsOf, cardSubject } = require("./student-enrollments-core");

const clean = (value) => String(value ?? "").trim();
const lower = (value) => clean(value).toLocaleLowerCase("et");
const ids = (...lists) => [...new Set(lists.flat(2).map(clean).filter(Boolean))];

// records that are history, not the learner's data: they keep pointing at the old card (its tombstone says where it went)
const AUDIT = new Set(["activityLog", "financialAudit", "studentMergeOperations", "studentCardMerges", "parentMergeOperations", "emailQueue", "calendarSyncOutbox"]);
const FINANCE = new Set(["invoices", "payments", "creditNotes", "bankTransactions", "expenses", "manualInvoices", "financialPeriods", "refunds", "payerCredits", "creditApplications", "paymentLineAllocations", "overpaymentResolutions", "studentPackages", "packageLedger", "studentTariffAssignments", "cashLedger", "lessonPackageStates"]);
const SCHEDULE = new Set(["schedule", "roomBookings", "lessonChangeRequests"]);
// one document per card, its id is the card id: copied to the kept card when it has none, else the kept one stays
const DOC_KEYED = ["studentRevenuePlans", "studentInitialAssessments", "studentAvailability", "taxIdentities", "whiteboards"];
const NEVER = new Set(["students", "users", ...AUDIT, ...DOC_KEYED]);

function kindOf(collection) {
  if (FINANCE.has(collection)) return "finance";
  if (SCHEDULE.has(collection)) return "schedule";
  return "learner";
}

const accountIds = (s = {}) => ids(s.linkedUserId, s.studentUid, s.linkedUserIds || []);
const parentIds = (s = {}) => ids(s.linkedParentId, s.parentUid, s.guardianUid, s.linkedParentIds || []);

// parents without a KeeleSepp account: the old single fields and the list „parentContacts”
function parentContactsOf(student = {}) {
  const list = Array.isArray(student.parentContacts) ? student.parentContacts : [];
  const legacy = clean(student.parentName) || clean(student.parentEmail) || clean(student.parentPhone)
    ? [{ name: student.parentName, email: student.parentEmail || student.guardianEmail, phone: student.parentPhone || student.guardianPhone }]
    : [];
  const seen = new Map();
  for (const item of [...legacy, ...list]) {
    const contact = { name: clean(item?.name), email: lower(item?.email), phone: clean(item?.phone), ...(item?.relation ? { relation: clean(item.relation) } : {}) };
    if (!contact.name && !contact.email && !contact.phone) continue;
    const key = contact.email || contact.phone.replace(/\D/g, "").slice(-8) || lower(contact.name);
    const twin = seen.get(key);
    if (twin) { for (const field of ["name", "email", "phone", "relation"]) if (!twin[field] && contact[field]) twin[field] = contact[field]; continue; }
    seen.set(key, contact);
  }
  return [...seen.values()];
}

// the parents of both cards together (owner: a merge unions the parents); `differ` when both cards had parents and
// they are not the same people — shown as a conflict before merging (both stay linked)
function mergeParents(keep = {}, source = {}) {
  const uids = ids(parentIds(keep), parentIds(source));
  const contacts = parentContactsOf({ ...keep, parentContacts: [...(keep.parentContacts || []), ...parentContactsOf(source)] });
  const keepUids = parentIds(keep);
  const sourceUids = parentIds(source);
  const keepMails = parentContactsOf(keep).map((c) => c.email).filter(Boolean);
  const sourceMails = parentContactsOf(source).map((c) => c.email).filter(Boolean);
  const uidDiffer = keepUids.length && sourceUids.length && !sourceUids.every((id) => keepUids.includes(id));
  const mailDiffer = keepMails.length && sourceMails.length && !sourceMails.every((mail) => keepMails.includes(mail));
  return {
    linkedParentIds: uids,
    linkedParentId: clean(keep.linkedParentId) || clean(source.linkedParentId) || uids[0] || "",
    parentContacts: contacts,
    differ: Boolean(uidDiffer || mailDiffer),
  };
}

// fields of the card that are not copied as they are (accounts, ownership, the subject tracks, the merge itself)
const PROFILE_SKIP = new Set([
  "id", "name", "active", "createdAt", "updatedAt", "archivedAt", "restoredAt",
  "linkedUserId", "studentUid", "linkedUserIds", "linkedParentId", "parentUid", "guardianUid", "linkedParentIds", "parentContacts",
  "subject", "teacher", "teacherUid", "teacherUids", "level", "targetLevel", "enrollments",
  "mergedInto", "mergedIntoStudentId", "mergedIntoStudentName", "mergedAt", "mergedBy", "mergedStudentIds", "mergedDuplicateIds",
  "mergedFromStudentId", "nameAliases", "notDuplicateOf", "contactNotes", "skillMap", "personId",
  // a parent's name, e-mail and phone belong together: they travel in parentContacts
  "parentName", "parentEmail", "parentPhone", "guardianName", "guardianEmail", "guardianPhone",
]);
const empty = (value) => value === undefined || value === null || value === "" || (Array.isArray(value) && !value.length)
  || (typeof value === "object" && !Array.isArray(value) && !Object.keys(value).length);

// everything the kept card lacks comes from the other card; notes are joined; the skill map keeps the kept card's
// assessment and adds skills only the other card has
function profilePatch(keep = {}, source = {}) {
  const patch = {};
  for (const [field, value] of Object.entries(source)) {
    if (PROFILE_SKIP.has(field) || empty(value)) continue;
    if (empty(keep[field])) patch[field] = value;
  }
  const notes = [clean(keep.contactNotes), clean(source.contactNotes)].filter(Boolean);
  if (notes.length === 2 && notes[0] !== notes[1]) patch.contactNotes = `${notes[0]}\n— ${clean(source.name) || "liidetud kaart"}: ${notes[1]}`;
  else if (!notes[0] && notes[1]) patch.contactNotes = notes[1];
  const keepSkills = keep.skillMap && typeof keep.skillMap === "object" ? keep.skillMap : {};
  const sourceSkills = source.skillMap && typeof source.skillMap === "object" ? source.skillMap : {};
  const added = Object.keys(sourceSkills).filter((key) => !(key in keepSkills));
  if (added.length) patch.skillMap = { ...keepSkills, ...Object.fromEntries(added.map((key) => [key, sourceSkills[key]])) };
  return patch;
}

// the card's own price is its main subject's; further subjects may have their own in subjectPrices
function mainSubjectOf(student = {}) {
  const subjects = enrollmentsOf(student).filter((t) => t.active).map((t) => t.subject);
  const own = subjectName(student.subject);
  return subjects.includes(own) ? own : subjects[0] || own || "Eesti keel";
}

// the other card's price joins the kept card's plan as the price of its subject; amounts are never changed. Returns
// { action: 'none' | 'copy' | 'addSubjectPrice' | 'same' | 'conflict', patch, subject, keepCents, sourceCents }
function revenuePlanMerge({ keep = {}, source = {}, keepPlan = null, sourcePlan = null }) {
  if (!sourcePlan || sourcePlan.active === false && !sourcePlan.lessonPriceCents) return { action: "none" };
  const subject = cardSubject(source) || mainSubjectOf(source);
  if (!keepPlan) return { action: "copy", subject };
  const keepMain = mainSubjectOf(keep);
  const sourcePrice = { lessonPriceCents: Number(sourcePlan.lessonPriceCents) || 0, lessonMinutes: Number(sourcePlan.lessonMinutes) || 60 };
  const existing = lower(subject) === lower(keepMain)
    ? { lessonPriceCents: Number(keepPlan.lessonPriceCents) || 0, lessonMinutes: Number(keepPlan.lessonMinutes) || 60 }
    : keepPlan.subjectPrices?.[subject] || null;
  if (!existing) {
    if (!sourcePrice.lessonPriceCents) return { action: "none", subject };
    return { action: "addSubjectPrice", subject, sourceCents: sourcePrice.lessonPriceCents, patch: { subjectPrices: { ...(keepPlan.subjectPrices || {}), [subject]: sourcePrice } } };
  }
  if (existing.lessonPriceCents === sourcePrice.lessonPriceCents || !sourcePrice.lessonPriceCents) return { action: "same", subject };
  return { action: "conflict", subject, keepCents: existing.lessonPriceCents, sourceCents: sourcePrice.lessonPriceCents };
}

// what the administrator must decide or know before merging
function mergeConflicts({ keep = {}, source = {}, parents, plan, singletons = [], pets = {} }) {
  const out = [];
  const euro = (cents) => `${(Number(cents) / 100).toFixed(2).replace(".", ",")} €`;
  if (clean(keep.name) && clean(source.name) && lower(keep.name) !== lower(source.name)) out.push({ code: "name", label: `Erinevad nimed: „${clean(keep.name)}” ja „${clean(source.name)}” — vali, kumb jääb` });
  if (parents?.differ) out.push({ code: "parents", label: "Kaartidel on erinevad lapsevanemad — mõlemad jäävad lapsega seotuks" });
  if (plan?.action === "conflict") out.push({ code: "price", label: `${plan.subject}: kaks hinda (${euro(plan.keepCents)} jääb, ${euro(plan.sourceCents)} teiselt kaardilt ei tule üle)` });
  const keepTracks = enrollmentsOf(keep);
  for (const track of enrollmentsOf(source)) {
    const twin = keepTracks.find((t) => lower(t.subject) === lower(track.subject));
    if (!twin) continue;
    if (twin.teacher && track.teacher && lower(twin.teacher).split(/\s+/)[0] !== lower(track.teacher).split(/\s+/)[0]) out.push({ code: "teacher", label: `${track.subject}: kaks õpetajat (${twin.teacher} ja ${track.teacher}) — jäävad kaks õppesuunda` });
    else if (twin.level && track.level && twin.level !== track.level) out.push({ code: "level", label: `${track.subject}: tase ${twin.level} jääb (teisel kaardil ${track.level})` });
  }
  for (const item of singletons.filter((s) => s.action === "keep" && s.collection !== "studentRevenuePlans")) out.push({ code: `doc:${item.collection}`, label: `${DOC_LABELS[item.collection] || item.collection}: mõlemal kaardil olemas — jääb selle kaardi oma, teise oma jääb vanale kaardile alles` });
  if (pets.keep && pets.source) out.push({ code: "pet", label: "Mõlemal kaardil on lemmik — jääb selle kaardi oma" });
  if (accountIds(keep).length && accountIds(source).length && !accountIds(source).every((id) => accountIds(keep).includes(id))) out.push({ code: "accounts", label: "Mõlemal kaardil on õpilase konto — mõlemad kontod näevad pärast liitmist seda kaarti" });
  return out;
}

const DOC_LABELS = {
  studentRevenuePlans: "Hind ja arveldus",
  studentInitialAssessments: "Esmane hindamine",
  studentAvailability: "Sobivad ajad",
  taxIdentities: "Maksuandmed",
  whiteboards: "Tahvel",
};

// one stored track per subject + teacher; the status (paused / ended) stays as the card had it
function normalizedInput({ keepId, sourceId, keepName } = {}) {
  const keep = clean(keepId);
  const source = clean(sourceId);
  if (!keep || !source || keep === source) throw Object.assign(new Error("Two different student cards required"), { status: 400 });
  return { keepId: keep, sourceId: source, keepName: clean(keepName) };
}

module.exports = {
  AUDIT, FINANCE, SCHEDULE, DOC_KEYED, NEVER, DOC_LABELS,
  kindOf, accountIds, parentIds, parentContactsOf, mergeParents, profilePatch, mainSubjectOf, revenuePlanMerge, mergeConflicts, normalizedInput, ids,
};
