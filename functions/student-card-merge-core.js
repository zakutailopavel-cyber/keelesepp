"use strict";

// Pure rules of „Liida kaardid” (owner 2026-10-24: „нормальное объединение”): what the kept card gets from the
// other card, which collections move, and what the administrator must see before confirming. The database work is in
// functions/student-merge.js; nothing here reads or writes Firestore.

const { subjectName, enrollmentsOf, cardSubject, mainSubject } = require("./student-enrollments-core");
const { SUBJECT_BILLING_FIELDS, cardBilling } = require("./subject-billing-core");

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
  "mergedFromStudentId", "mergeUndoVersion", "unmergedAt", "unmergedBy", "unmergedFromStudentId", "unmergedStudentIds", "nameAliases", "notDuplicateOf", "contactNotes", "skillMap", "personId",
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
const mainSubjectOf = mainSubject;

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
    // the other card's billing comes with its subject when it differs from the kept card's (owner 2026-11-06: e.g. the
    // English card paid by lesson packages stays on packages after the merge); the kept card's own values stay
    const keepBilling = cardBilling(keepPlan);
    const sourceBilling = cardBilling(sourcePlan);
    const own = Object.fromEntries(SUBJECT_BILLING_FIELDS.filter((field) => sourceBilling[field] !== keepBilling[field] && !(field === "weeklyLessons" && !sourceBilling[field])).map((field) => [field, sourceBilling[field]]));
    const billing = Object.keys(own).length ? { subjectBilling: { ...(keepPlan.subjectBilling || {}), [subject]: own } } : {};
    return { action: "addSubjectPrice", subject, sourceCents: sourcePrice.lessonPriceCents, patch: { subjectPrices: { ...(keepPlan.subjectPrices || {}), [subject]: sourcePrice }, ...billing } };
  }
  if (existing.lessonPriceCents === sourcePrice.lessonPriceCents || !sourcePrice.lessonPriceCents) return { action: "same", subject };
  return { action: "conflict", subject, keepCents: existing.lessonPriceCents, sourceCents: sourcePrice.lessonPriceCents };
}

// Archived cards (2026-11-03, Oleksiy: „Объединение карточек не работает с архивированными учениками”). Either card may
// be archived. The merged card is active when either card was active (one child, one card in use); the administrator
// can choose otherwise (keepActive true / false). The archive state is part of the preview, never a silent side effect.
const isActive = (student = {}) => student.active !== false;
function resultActive(keep = {}, source = {}, keepActive) {
  if (typeof keepActive === "boolean") return keepActive;
  return isActive(keep) || isActive(source);
}

// the subject tracks of an archived other card come over as „Lõpetanud” when the merged card is active: its old
// teacher does not get the child back and the card shows no second running track. A track the kept card also has
// stays as the kept card has it. Lessons, invoices and the rest of the history move as for an active card.
function sourceForTracks(source = {}, activeAfter) {
  if (isActive(source) || !activeAfter) return source;
  return { ...source, teacherUids: [], enrollments: enrollmentsOf(source).map((track) => ({ ...track, active: false, status: "ended" })) };
}

// what the administrator must decide or know before merging
function mergeConflicts({ keep = {}, source = {}, parents, plan, singletons = [], pets = {}, activeAfter = isActive(keep) || isActive(source) }) {
  const out = [];
  const euro = (cents) => `${(Number(cents) / 100).toFixed(2).replace(".", ",")} €`;
  if (!isActive(source) && activeAfter) out.push({ code: "archived_source", label: `„${clean(source.name) || "Teine kaart"}” on arhiveeritud — tunnid, arved, maksed ja ajalugu tulevad üle, tema õppesuunad märgitakse „Lõpetanud”` });
  if (!isActive(keep) && activeAfter) out.push({ code: "archived_keep", label: `Alles jääv kaart „${clean(keep.name) || "kaart"}” on arhiveeritud — pärast liitmist on see aktiivne` });
  if (!activeAfter) out.push({ code: "archived_result", label: "Pärast liitmist on kaart arhiveeritud" });
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

// „Need võivad olla erinevad lapsed” (incident 2026-11-09: two different girls named Stefania were merged — one
// Matemaatika, 10. klass, Yelyzaveta, no parent; the other Eesti keel C1, 12. klass, Pavel, parent Jelena). Each signal
// alone is not proof, but any of them makes the administrator confirm explicitly („Kinnitan, et see on sama laps”) and
// the server refuses the merge without confirmedDifferences: true.
const fold = (value) => lower(value).normalize("NFD").replace(/[̀-ͯ]/g, "");
const NAME_TAG = /^(?:[abc][12][+-]?|en|eng|ing|inglise|est|ee|eesti|ru|rus|vene|mat|math|matemaatika|kl|klass)$/;
function nameWords(name) {
  return fold(name).replace(/\([^)]*\)/g, " ").split(/[^\p{L}'-]+/u).map((w) => w.replace(/^[-']+|[-']+$/g, "")).filter((w) => w && !NAME_TAG.test(w));
}
const isCyrillic = (word) => /[Ѐ-ӿ]/.test(word);
// the last word of a name with at least two words; null when the card has only a first name
function surnameOf(name) {
  const words = nameWords(name);
  return words.length >= 2 ? words[words.length - 1] : null;
}
function surnames(card = {}) {
  return ids([card.name, ...(Array.isArray(card.nameAliases) ? card.nameAliases : [])].map(surnameOf).filter(Boolean));
}

// school grades (1–12) the card names: the field „Klass” (`grade`) and track levels like „10. klass”
function gradesOf(card = {}) {
  const out = new Set();
  const grade = clean(card.grade);
  const plain = grade.match(/^(\d{1,2})\s*\.?\s*(?:kl|klass|class|grade)?\b/i);
  if (plain && Number(plain[1]) >= 1 && Number(plain[1]) <= 12) out.add(Number(plain[1]));
  for (const track of [card, ...(Array.isArray(card.enrollments) ? card.enrollments : [])]) {
    const level = clean(track?.level).match(/^(\d{1,2})\s*\.?\s*(?:kl|klass)\b/i);
    if (level && Number(level[1]) >= 1 && Number(level[1]) <= 12) out.add(Number(level[1]));
  }
  return [...out].sort((a, b) => a - b);
}

// birth year from a stored date / year or an Estonian personal code (isikukood: century digit + YYMMDD…)
function birthYearOf(card = {}) {
  const year = Number(card.birthYear);
  if (year >= 1900 && year <= 2100) return year;
  for (const field of ["birthDate", "dateOfBirth", "birthday"]) {
    const match = clean(card[field]).match(/(19|20)\d{2}/);
    if (match) return Number(match[0]);
  }
  const code = clean(card.personalCode || card.isikukood).replace(/\D/g, "");
  if (code.length === 11 && /^[1-6]/.test(code)) return 1800 + Math.floor((Number(code[0]) - 1) / 2) * 100 + Number(code.slice(1, 3));
  return null;
}

// the card's own tracks only (a card with no subject at all names none; enrollmentsOf would default to Eesti keel)
function namedTracks(card = {}) {
  const hasOwn = clean(card.subject) || (Array.isArray(card.enrollments) && card.enrollments.some((t) => clean(t?.subject)));
  return hasOwn ? enrollmentsOf(card).filter((t) => t.subject) : [];
}
const teacherKey = (track) => clean(track.teacherUid) || lower(track.teacher).split(/\s+/)[0] || "";
const listText = (items) => items.join(", ");

function differentPersonSignals(keep = {}, source = {}) {
  const out = [];
  const keepName = clean(keep.name) || "see kaart";
  const sourceName = clean(source.name) || "teine kaart";
  // 1. surname: only when both cards have one, in the same alphabet (Влад Повжик / Vlad Povzhik is one child)
  const ks = surnames(keep);
  const ss = surnames(source);
  if (ks.length && ss.length && !ks.some((a) => ss.includes(a))) {
    const comparable = ks.some((a) => ss.some((b) => isCyrillic(a) === isCyrillic(b)));
    if (comparable) out.push({ code: "surname", label: `Erinev perekonnanimi: „${keepName}” ja „${sourceName}”` });
  }
  // 2. school grade
  const kg = gradesOf(keep);
  const sg = gradesOf(source);
  if (kg.length && sg.length && !kg.some((g) => sg.includes(g))) out.push({ code: "grade", label: `Erinev klass: ${listText(kg.map((g) => `${g}. klass`))} ja ${listText(sg.map((g) => `${g}. klass`))}` });
  // 3. parents: accounts, e-mails or names with nothing in common
  const kp = parentIds(keep);
  const sp = parentIds(source);
  const kc = parentContactsOf(keep);
  const sc = parentContactsOf(source);
  const kMails = kc.map((c) => c.email).filter(Boolean);
  const sMails = sc.map((c) => c.email).filter(Boolean);
  const kNames = kc.map((c) => fold(c.name)).filter(Boolean);
  const sNames = sc.map((c) => fold(c.name)).filter(Boolean);
  const disjoint = (a, b) => a.length && b.length && !a.some((x) => b.includes(x));
  if (disjoint(kp, sp) || disjoint(kMails, sMails) || disjoint(kNames, sNames)) {
    const who = (contacts, uids) => listText(contacts.map((c) => c.name || c.email).filter(Boolean)) || (uids.length ? "lapsevanema konto" : "—");
    out.push({ code: "parent", label: `Erinevad lapsevanemad: ${who(kc, kp)} ja ${who(sc, sp)}` });
  }
  // 4. subjects and teachers with no overlap at all
  const kt = namedTracks(keep);
  const st = namedTracks(source);
  if (kt.length && st.length) {
    const sameSubject = kt.some((a) => st.some((b) => lower(a.subject) === lower(b.subject)));
    const kTeachers = kt.map(teacherKey).filter(Boolean);
    const sTeachers = st.map(teacherKey).filter(Boolean);
    const sameTeacher = kTeachers.some((t) => sTeachers.includes(t));
    const teacherDiffer = kTeachers.length && sTeachers.length ? !sameTeacher : true;
    if (!sameSubject && teacherDiffer) {
      const text = (tracks) => listText(tracks.map((t) => `${t.subject}${t.teacher ? ` (${t.teacher})` : ""}`));
      out.push({ code: "subject_teacher", label: `Erinevad ained ja õpetajad: ${text(kt)} ja ${text(st)}` });
    }
  }
  // 5. birth year
  const ky = birthYearOf(keep);
  const sy = birthYearOf(source);
  if (ky && sy && ky !== sy) out.push({ code: "birth_year", label: `Erinev sünniaasta: ${ky} ja ${sy}` });
  return out;
}

// the subject a moved lesson keeps when it has none of its own: the other card's subject. A lesson that has its own
// subject is never changed (incident 2026-11-09). An archived or multi-subject card still names its main subject.
function sourceLessonSubject(source = {}) {
  const tracks = namedTracks(source);
  if (!tracks.length) return "";
  const active = [...new Set(tracks.filter((t) => t.active).map((t) => t.subject))];
  if (active.length === 1) return active[0];
  const own = subjectName(source.subject);
  if (own) return own;
  return active[0] || tracks[0].subject || "";
}

// ---- „Võta ühendamine tagasi” (2026-11-09): what a merge changed, so that it can be reversed field by field ----
// A record says, for one document, which fields the merge wrote (`after`), their values before (`before`) and which
// fields did not exist before (`absent`). Reversal restores a field only while it still holds the merge's value; a
// field changed by someone after the merge is left alone and reported. `anchor` is the field that ties the document to
// the card (studentId / students): when it no longer holds the merge's value the document is not touched at all.
const UNDO_VERSION = 1;

function fieldsBefore(data = {}, fields = []) {
  const before = {};
  const absent = [];
  for (const field of fields) {
    if (data[field] === undefined) absent.push(field);
    else before[field] = data[field];
  }
  return { before, absent };
}

function undoEntry(path, data, after, anchor = null) {
  return { path, ...(anchor ? { anchor } : {}), after, ...fieldsBefore(data, Object.keys(after)) };
}

function sameValue(a, b) {
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (typeof a?.isEqual === "function") return a.isEqual(b);
  if (Array.isArray(a) || Array.isArray(b)) return Array.isArray(a) && Array.isArray(b) && a.length === b.length && a.every((item, i) => sameValue(item, b[i]));
  if (typeof a === "object" && typeof b === "object") {
    const ka = Object.keys(a).sort();
    const kb = Object.keys(b).sort();
    return sameValue(ka, kb) && ka.every((key) => sameValue(a[key], b[key]));
  }
  return false;
}

const beforeOf = (entry, field) => ((entry.absent || []).includes(field) ? undefined : entry.before?.[field]);

// → { status: 'revert' | 'done' | 'conflict' | 'missing', set: {field: value}, remove: [field], skipped: [field] }
function revertFields(current, entry) {
  const result = { status: "revert", set: {}, remove: [], skipped: [] };
  if (!current) return { ...result, status: "missing" };
  if (entry.kind === "ids") {
    const list = Array.isArray(current[entry.field]) ? current[entry.field] : [];
    if (list.includes(entry.sourceId) && (entry.hadKeep || !list.includes(entry.keepId))) return { ...result, status: "done" };
    if (!list.includes(entry.keepId)) return { ...result, status: "conflict", skipped: [entry.field] };
    result.set[entry.field] = [...list.filter((id) => entry.hadKeep || id !== entry.keepId), ...(list.includes(entry.sourceId) ? [] : [entry.sourceId])];
    return result;
  }
  if (entry.anchor) {
    const now = current[entry.anchor];
    if (!sameValue(now, entry.after[entry.anchor])) {
      return { ...result, status: sameValue(now, beforeOf(entry, entry.anchor)) ? "done" : "conflict", skipped: sameValue(now, beforeOf(entry, entry.anchor)) ? [] : [entry.anchor] };
    }
  }
  for (const [field, value] of Object.entries(entry.after || {})) {
    const was = beforeOf(entry, field);
    if (sameValue(current[field], value)) {
      if (was === undefined) result.remove.push(field);
      else result.set[field] = was;
    } else if (!sameValue(current[field], was)) result.skipped.push(field);
  }
  if (!Object.keys(result.set).length && !result.remove.length) result.status = result.skipped.length ? "conflict" : "done";
  return result;
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
  resultActive, sourceForTracks,
  differentPersonSignals, sourceLessonSubject, surnameOf, gradesOf, birthYearOf,
  undoEntry, fieldsBefore, sameValue, revertFields, UNDO_VERSION,
};
