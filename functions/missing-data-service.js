"use strict";

// „Puuduvad andmed” on the server (staffOperationsApi /missing-data/*). A student or parent gets the questions for
// their OWN cards only and fills ONLY fields that are missing now; every change is written with an audit record
// (missingDataSubmissions: who, when, before → after). The administrator gets the list of cards and what they miss.
// Pure rules: missing-data-core.js. The caller's cards are found as for „Teated” (announcements-service.js).

const core = require("./missing-data-core");
const { callerContext } = require("./announcements-service");

const SETTINGS_DOC = ["missingDataSettings", "current"];
const clean = (value, max = 200) => String(value ?? "").trim().slice(0, max);
const ID = /^[A-Za-z0-9_-]{1,128}$/;
// card fields this flow may write — never anything else
const CARD_FIELDS = ["email", "phone", "parentName", "parentEmail", "parentPhone", "grade", "birthYear", "preferredLanguage"];
const PROFILE_FIELDS = ["phone", "preferredLanguage"];
const empty = (value) => value === undefined || value === null || String(value).trim() === "";

async function loadSettings(db) {
  const snap = await db.collection(SETTINGS_DOC[0]).doc(SETTINGS_DOC[1]).get();
  return core.normalizeSettings(snap.exists ? snap.data() : {});
}

async function getAll(db, refs) {
  const out = [];
  for (let index = 0; index < refs.length; index += 300) out.push(...await db.getAll(...refs.slice(index, index + 300)));
  return out;
}

// card id → { card, availability, parents } for the given cards
async function factsFor(db, cards) {
  const ids = cards.map((card) => card.id);
  const availability = ids.length ? await getAll(db, ids.map((id) => db.collection("studentAvailability").doc(id))) : [];
  const parentUids = [...new Set(cards.flatMap((card) => core.parentUidsOf(card)))];
  const profiles = parentUids.length ? await getAll(db, parentUids.map((uid) => db.collection("users").doc(uid))) : [];
  const users = new Map(profiles.filter((snap) => snap.exists).map((snap) => [snap.id, snap.data()]));
  const ownById = new Map(cards.map((card, index) => [card.id, availability[index]?.exists ? availability[index].data() : null]));
  // an /ajad answer or another card of the same person counts: the learner is not asked for times twice
  const leads = cards.length ? (await db.collection("websiteLeads").where("source", "==", "availability").get().catch(() => ({ docs: [] }))).docs.map((doc) => doc.data()) : [];
  const facts = new Map();
  cards.forEach((card) => facts.set(card.id, {
    card,
    availability: core.knownTimes(card, { own: ownById.get(card.id), cards, ownById, leads }),
    parents: core.parentUidsOf(card).map((uid) => ({ uid, ...(users.get(uid) || {}) })).filter((profile) => core.accountOk(profile, "parent")),
  }));
  return facts;
}

async function questionsOf(db, actor, now = new Date()) {
  const caller = await callerContext(db, actor);
  const settings = await loadSettings(db);
  if (!caller.roles.length || core.ITEMS.every((item) => settings[item] === "off")) return { caller, questions: { cards: [], profile: { ask: [], required: [] }, settings } };
  const cards = [...new Map(caller.roles.flatMap(({ cards: list }) => list).map((card) => [card.id, card])).values()];
  const facts = await factsFor(db, cards);
  const profile = { ...actor.profile, email: clean(actor.profile.email || actor.decoded.email) };
  const questions = core.questionsFor({ uid: caller.uid, roles: caller.roles, profile, email: actor.decoded.email }, facts, settings, now.getFullYear());
  return { caller, questions };
}

// POST /missing-data/mine → { blocks, cards, profile, settings } for the caller only
async function mine(db, actor, now = new Date()) {
  const { questions } = await questionsOf(db, actor, now);
  return { blocks: core.blocks(questions), ...questions };
}

const roleOf = (caller) => (caller.roles.some((item) => item.role === "parent") ? "parent" : "student");

// POST /missing-data/save { cards: { [studentId]: answer }, profile: { language } } → { ok, changed }
async function save(db, actor, body = {}, { FieldValue, now = new Date() } = {}) {
  const { caller, questions } = await questionsOf(db, actor, now);
  const answers = body && typeof body.cards === "object" && body.cards ? body.cards : {};
  const own = new Set(caller.roles.flatMap(({ cards }) => cards.map((card) => card.id)));
  for (const id of Object.keys(answers)) {
    if (!ID.test(id) || !own.has(id)) throw core.statusError(403, "See kaart ei ole sinu oma.");
  }
  const errors = {};
  const plans = questions.cards.map((question) => {
    const plan = core.cardPatch(question, answers[question.studentId] || {}, now.getFullYear());
    if (Object.keys(plan.errors).length) errors[question.studentId] = plan.errors;
    return { question, ...plan };
  });
  const { profile: profilePatch, errors: profileErrors } = core.profilePatch(questions.profile, body.profile || {});
  if (Object.keys(profileErrors).length) errors.profile = profileErrors;
  if (Object.keys(errors).length) throw core.statusError(400, "Mõni vastus on puudu või vigane.", { details: errors });

  const uid = caller.uid;
  const name = caller.name;
  const role = roleOf(caller);
  const nowIso = now.toISOString();
  const userRef = db.collection("users").doc(uid);
  const submissionRef = db.collection("missingDataSubmissions").doc();
  return db.runTransaction(async (tx) => {
    const studentRefs = plans.map((plan) => db.collection("students").doc(plan.question.studentId));
    const availabilityRefs = plans.map((plan) => db.collection("studentAvailability").doc(plan.question.studentId));
    const [studentSnaps, availabilitySnaps, userSnap] = await Promise.all([
      plans.length ? tx.getAll(...studentRefs) : [],
      plans.length ? tx.getAll(...availabilityRefs) : [],
      tx.get(userRef),
    ]);
    const log = [];
    const writes = [];
    plans.forEach((plan, index) => {
      const card = studentSnaps[index].exists ? studentSnaps[index].data() : null;
      if (!card) return;
      // fill only what is still empty (someone else may have filled it meanwhile); never other fields
      const patch = Object.fromEntries(Object.entries(plan.student).filter(([field]) => CARD_FIELDS.includes(field) && empty(card[field])));
      if (Object.keys(patch).length) {
        writes.push(() => tx.update(studentRefs[index], { ...patch, updatedAt: nowIso }));
        log.push(...core.changes("student", plan.question.studentId, card, patch));
      }
      const current = availabilitySnaps[index].exists ? availabilitySnaps[index].data() : null;
      if (plan.availability && !core.hasSlots(current)) {
        writes.push(() => tx.set(availabilityRefs[index], {
          studentId: plan.question.studentId,
          slots: plan.availability.slots,
          preferred: plan.availability.preferred,
          message: clean(current?.message, 1000),
          changedAt: nowIso,
          changedByUid: uid,
          changedByName: name,
          changedByRole: role,
          previousSlots: [],
          previousPreferred: [],
          updatedAt: FieldValue.serverTimestamp(),
        }, { merge: true }));
        log.push({ target: "availability", id: plan.question.studentId, field: "slots", before: "", after: `${plan.availability.slots.length / 2} h` });
      }
    });
    const profile = userSnap.exists ? userSnap.data() : {};
    const ownPatch = Object.fromEntries(Object.entries(profilePatch).filter(([field]) => PROFILE_FIELDS.includes(field) && empty(field === "phone" ? (profile.phone || profile.parentPhone) : profile[field])));
    if (Object.keys(ownPatch).length) {
      writes.push(() => tx.set(userRef, { ...ownPatch, updatedAt: nowIso }, { merge: true }));
      log.push(...core.changes("profile", uid, profile, ownPatch));
    }
    if (!log.length) return { ok: true, changed: 0 };
    writes.forEach((write) => write());
    const studentIds = [...new Set(plans.map((plan) => plan.question.studentId))];
    tx.create(submissionRef, {
      byUid: uid,
      byName: name,
      byRole: role,
      at: FieldValue.serverTimestamp(),
      atIso: nowIso,
      studentIds,
      studentNames: plans.map((plan) => plan.question.studentName),
      changes: log.slice(0, 100),
      reviewedAt: "",
      reviewedByUid: "",
      reviewedByName: "",
    });
    return { ok: true, changed: log.length, submissionId: submissionRef.id };
  });
}

// POST /missing-data/report (administrator) → { settings, totals, rows }
async function report(db, now = new Date()) {
  const settings = await loadSettings(db);
  const [studentsSnap, availabilitySnap] = await Promise.all([db.collection("students").get(), db.collection("studentAvailability").get()]);
  const students = studentsSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  const own = new Map(availabilitySnap.docs.map((doc) => [doc.id, doc.data()]));
  const live = students.filter(core.isLiveCard);
  const uids = [...new Set(live.flatMap((card) => [...core.studentUidsOf(card), ...core.parentUidsOf(card)]))];
  const snaps = uids.length ? await getAll(db, uids.map((uid) => db.collection("users").doc(uid))) : [];
  const users = new Map(snaps.filter((snap) => snap.exists).map((snap) => [snap.id, snap.data()]));
  const leads = (await db.collection("websiteLeads").where("source", "==", "availability").get().catch(() => ({ docs: [] }))).docs.map((doc) => doc.data());
  const availability = new Map(live.map((card) => [card.id, core.knownTimes(card, { own: own.get(card.id) || null, cards: live, ownById: own, leads })]));
  const rows = core.reportRows(live, availability, users, settings, now.getFullYear());
  return { settings, totals: core.reportTotals(rows), rows };
}

module.exports = { mine, save, report, loadSettings };
