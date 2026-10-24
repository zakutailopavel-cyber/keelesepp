"use strict";

// „Teated” on the server (staffOperationsApi /announcements/*): loads the caller's cards, the published announcements
// and the answers, and writes an answer once (or again only when the administrator allowed changing it).
// Pure rules live in announcements-core.js.

const core = require("./announcements-core");
const { appToday } = require("./local-date-core");

const STUDENT_FIELDS = [["linkedUserId", "=="], ["studentUid", "=="], ["linkedUserIds", "array-contains"]];
const PARENT_FIELDS = [["linkedParentId", "=="], ["parentUid", "=="], ["guardianUid", "=="], ["linkedParentIds", "array-contains"]];
const STAFF_ROLES = ["admin", "teacher", "finance"];
const ID = /^[A-Za-z0-9_-]{1,128}$/;
const clean = (value, max = 200) => String(value ?? "").trim().slice(0, max);

async function cardsFor(db, uid, fields, withOwnDoc = false) {
  const snapshots = await Promise.all(fields.map(([field, op]) => db.collection("students").where(field, op, uid).get()));
  const cards = new Map();
  snapshots.forEach((snapshot) => snapshot.docs.forEach((doc) => cards.set(doc.id, { id: doc.id, ...doc.data() })));
  if (withOwnDoc) {
    const own = await db.collection("students").doc(uid).get();
    if (own.exists) cards.set(own.id, { id: own.id, ...own.data() });
  }
  return [...cards.values()];
}

// the caller as a learner: { uid, name, roles: [{ role, cards }] } (staff accounts get no announcements)
async function callerContext(db, { decoded, profile, roles }) {
  const uid = decoded.uid;
  const name = clean(profile.displayName || decoded.name || decoded.email);
  if (STAFF_ROLES.some((role) => roles.has(role))) return { uid, name, roles: [] };
  const out = [];
  if (roles.has("student")) out.push({ role: "student", cards: await cardsFor(db, uid, STUDENT_FIELDS, true) });
  if (roles.has("parent")) out.push({ role: "parent", cards: await cardsFor(db, uid, PARENT_FIELDS) });
  return { uid, name, roles: out };
}

async function publishedAnnouncements(db) {
  const snapshot = await db.collection("announcements").where("status", "==", "published").get();
  return snapshot.docs.map((doc) => core.normalizeAnnouncement(doc.id, doc.data()));
}

function callerTargets(announcement, caller) {
  return caller.roles.flatMap(({ role, cards }) => core.targetsForCaller(announcement, { uid: caller.uid, role, cards, name: caller.name }));
}

async function responsesFor(db, pairs) {
  if (!pairs.length) return new Map();
  const refs = pairs.map(({ announcementId, key }) => db.collection("announcementResponses").doc(core.responseId(announcementId, key)));
  const snaps = await db.getAll(...refs);
  return new Map(snaps.filter((snap) => snap.exists).map((snap) => [snap.id, snap.data()]));
}

// POST /announcements/mine → { pending, past } for the caller only
async function mine(db, actor, now = new Date()) {
  const caller = await callerContext(db, actor);
  if (!caller.roles.length) return { pending: [], past: [] };
  const today = appToday(now);
  const announcements = (await publishedAnnouncements(db)).filter((item) => core.isVisible(item, today));
  const entries = announcements.flatMap((announcement) => callerTargets(announcement, caller).map((target) => ({ announcement, target })));
  const responses = await responsesFor(db, entries.map(({ announcement, target }) => ({ announcementId: announcement.id, key: target.key })));
  return core.learnerView(entries.map((entry) => ({ ...entry, response: responses.get(core.responseId(entry.announcement.id, entry.target.key)) || null })), today);
}

// POST /announcements/respond { announcementId, targetKey, answer } → the stored answer
async function respond(db, actor, body = {}, { FieldValue, now = new Date() } = {}) {
  const announcementId = clean(body.announcementId, 128);
  const targetKey = clean(body.targetKey, 140);
  if (!ID.test(announcementId) || !/^[upc]_[A-Za-z0-9_-]{1,128}$/.test(targetKey)) throw core.statusError(400, "announcementId and targetKey required");
  const snap = await db.collection("announcements").doc(announcementId).get();
  if (!snap.exists) throw core.statusError(404, "Teadet ei leitud.");
  const announcement = core.normalizeAnnouncement(snap.id, snap.data());
  if (!core.isVisible(announcement, appToday(now))) throw core.statusError(404, "Teadet ei leitud.");
  const caller = await callerContext(db, actor);
  const target = callerTargets(announcement, caller).find((item) => item.key === targetKey);
  if (!target) throw core.statusError(403, "See teade ei ole sulle.");
  const answer = core.validateAnswer(announcement, body.answer);
  let times = {};
  if (announcement.responseType === "availability") {
    const availability = await db.collection("studentAvailability").doc(target.studentId).get();
    times = core.availabilitySnapshot(announcement, availability.exists ? availability.data() : null);
  }
  const ref = db.collection("announcementResponses").doc(core.responseId(announcementId, targetKey));
  return db.runTransaction(async (tx) => {
    const current = await tx.get(ref);
    if (current.exists && !announcement.allowChange) throw core.statusError(409, "Vastus on juba saadetud.");
    const value = {
      announcementId,
      targetKey,
      kind: target.kind,
      studentId: target.studentId,
      studentName: target.studentName,
      responseType: announcement.responseType,
      answer,
      slots: times.slots || [],
      preferred: times.preferred || [],
      answeredByUid: caller.uid,
      answeredByName: caller.name,
      updatedAt: FieldValue.serverTimestamp(),
    };
    if (current.exists) {
      const before = current.data();
      const history = [...(Array.isArray(before.history) ? before.history : []), { answer: before.answer || {}, slots: before.slots || [], answeredByUid: before.answeredByUid || "", at: before.updatedAt || before.answeredAt || null }].slice(-10);
      tx.update(ref, { ...value, history });
    } else {
      tx.create(ref, { ...value, answeredAt: FieldValue.serverTimestamp(), history: [] });
    }
    return { ok: true, announcementId, targetKey, changed: current.exists };
  });
}

// POST /announcements/report { announcementId } (administrator) → who must answer, who answered and what
async function report(db, body = {}) {
  const announcementId = clean(body.announcementId, 128);
  if (!ID.test(announcementId)) throw core.statusError(400, "announcementId required");
  const snap = await db.collection("announcements").doc(announcementId).get();
  if (!snap.exists) throw core.statusError(404, "Teadet ei leitud.");
  const announcement = core.normalizeAnnouncement(snap.id, snap.data());
  const studentsSnap = await db.collection("students").get();
  const students = studentsSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  const uids = [...new Set(students.filter((card) => core.cardMatches(announcement, card)).flatMap((card) => [...core.studentUidsOf(card), ...core.parentUidsOf(card)]))];
  const users = new Map();
  for (let index = 0; index < uids.length; index += 300) {
    const snaps = await db.getAll(...uids.slice(index, index + 300).map((uid) => db.collection("users").doc(uid)));
    snaps.filter((item) => item.exists).forEach((item) => users.set(item.id, item.data()));
  }
  const targets = core.allTargets(announcement, students, users);
  const responsesSnap = await db.collection("announcementResponses").where("announcementId", "==", announcementId).get();
  const responses = new Map(responsesSnap.docs.map((doc) => [doc.data().targetKey, doc.data()]));
  const rows = core.reportRows(announcement, targets, responses);
  // answers from accounts that are no longer in the audience stay visible (the audience was narrowed later)
  const known = new Set(rows.map((row) => row.key));
  const extra = core.reportRows(announcement, [...responses.entries()].filter(([key]) => !known.has(key)).map(([key, data]) => ({
    key, kind: data.kind || "", names: [clean(data.answeredByName)], studentId: clean(data.studentId), studentName: clean(data.studentName), outside: true,
  })), responses).map((row) => ({ ...row, outside: true }));
  const all = [...rows, ...extra];
  return { announcementId, total: rows.length, answered: rows.filter((row) => row.answered).length, rows: all };
}

module.exports = { mine, respond, report, callerContext };
