"use strict";

// „Prügikast” for student and teacher cards: Firestore reads and writes. The rules are in card-trash-core.js; the
// contract is ARCHITECTURE.md „Card trash”. Only staffOperationsApi (administrator) and the scheduled purge call this.
// Firebase Auth users are never deleted or changed here: a learner's account loses the link to a purged card, a
// teacher's profile is disabled (the rules treat a disabled profile as signed out everywhere).

const { appToday } = require("./local-date-core");
const core = require("./card-trash-core");

const COLLECTION = { student: "students", teacher: "users" };

async function docsOf(query) {
  const snap = await query.get().catch(() => null);
  return snap ? snap.docs : [];
}

function uniqueDocs(lists) {
  const map = new Map();
  lists.flat().forEach((doc) => map.set(doc.ref.path, doc));
  return [...map.values()];
}

// the card's schedule records and its groups (members for a student, taught groups for a teacher)
async function cardLessons(db, kind, id, card) {
  const schedule = db.collection("schedule");
  const groups = db.collection("groups");
  if (kind === "student") {
    const [single, many, members, memberIds] = await Promise.all([
      docsOf(schedule.where("studentId", "==", id)),
      docsOf(schedule.where("studentIds", "array-contains", id)),
      docsOf(groups.where("students", "array-contains", id)),
      docsOf(groups.where("studentIds", "array-contains", id)),
    ]);
    return {
      schedule: uniqueDocs([single, many]).map((doc) => ({ id: doc.id, ...doc.data() })),
      groups: uniqueDocs([members, memberIds]).map((doc) => ({ id: doc.id, ...doc.data() })),
    };
  }
  const name = core.cardName("teacher", card);
  const [byUid, byName, byFullName, taught] = await Promise.all([
    docsOf(schedule.where("teacherUid", "==", id)),
    name ? docsOf(schedule.where("teacher", "==", name)) : [],
    name ? docsOf(schedule.where("teacherFull", "==", name)) : [],
    docsOf(groups.where("teacherUid", "==", id)),
  ]);
  return {
    // a record of another teacher with the same display name is not this teacher's
    schedule: uniqueDocs([byUid, byName, byFullName]).map((doc) => ({ id: doc.id, ...doc.data() })).filter((item) => !item.teacherUid || item.teacherUid === id),
    groups: taught.map((doc) => ({ id: doc.id, ...doc.data() })),
  };
}

// a student card's invoices (an unpaid one stops the delete); a teacher has none
async function cardInvoices(db, kind, id) {
  if (kind !== "student") return [];
  return (await docsOf(db.collection("invoices").where("studentId", "==", id))).map((doc) => ({ id: doc.id, ...doc.data() }));
}

// every record outside the audit collections that points at the card: [{ collection, field, count }]
async function cardReferences(db, kind, id, card) {
  const out = [];
  const ownPath = `${COLLECTION[kind]}/${id}`;
  const queries = core.referenceQueries(kind, id, card);
  for (const col of await db.listCollections()) {
    if (core.skipCollection(kind, col.id)) continue;
    for (const q of queries) {
      const docs = (await docsOf(col.where(q.field, q.op, q.value).limit(20))).filter((doc) => doc.ref.path !== ownPath);
      if (docs.length) out.push({ collection: col.id, field: q.field, count: docs.length });
    }
  }
  for (const collection of core.HISTORY_DOCS[kind]) {
    const snap = await db.collection(collection).doc(id).get();
    if (snap.exists) out.push({ collection, field: "id", count: 1 });
  }
  return out;
}

function audit(db, tx, docId, entry) {
  tx.set(db.collection("activityLog").doc(docId), entry);
}

/**
 * The „Kustuta” window before anything is written (2026-11-06): why it is refused (with the lessons and groups to move
 * first), what is linked to the card and whether the purge will delete or anonymise it. Reads only.
 */
async function previewTrash(db, { kind: rawKind, id: rawId, actor = {}, now = new Date() }) {
  const kind = core.cleanKind(rawKind);
  const id = core.cleanId(rawId);
  const snap = await db.collection(COLLECTION[kind]).doc(id).get();
  if (!snap.exists) throw core.cardError(404, "Kaarti ei leitud.");
  const card = snap.data() || {};
  const [lessons, invoices, references] = await Promise.all([cardLessons(db, kind, id, card), cardInvoices(db, kind, id), cardReferences(db, kind, id, card)]);
  return core.trashPreview(kind, { id, card, ...lessons, invoices, references, today: appToday(now), actorUid: actor.uid, nowIso: now.toISOString() });
}

/** „Kustuta”: the card goes to the trash for 7 days (refused with the reasons while lessons are ahead). */
async function trashCard(db, { kind: rawKind, id: rawId, actor = {}, now = new Date() }) {
  const kind = core.cleanKind(rawKind);
  const id = core.cleanId(rawId);
  const nowIso = now.toISOString();
  const ref = db.collection(COLLECTION[kind]).doc(id);
  const first = await ref.get();
  if (!first.exists) throw core.cardError(404, "Kaarti ei leitud.");
  const card = first.data() || {};
  const [lessons, invoices] = await Promise.all([cardLessons(db, kind, id, card), cardInvoices(db, kind, id)]);
  const blockers = core.trashBlockers(kind, { id, card, ...lessons, invoices, today: appToday(now), actorUid: actor.uid });
  if (blockers.length) throw core.cardError(409, blockers.map((item) => item.message).join(" "), { blockers });
  return db.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    const current = snap.exists ? snap.data() : null;
    if (!current) throw core.cardError(404, "Kaarti ei leitud.");
    if (current.deletedAt) throw core.cardError(409, "Kaart on juba prügikastis.");
    const patch = core.trashPatch(kind, current, { actor, nowIso });
    tx.set(ref, patch, { merge: true });
    audit(db, tx, `card-trash-${kind}-${id}-${Date.parse(nowIso)}`, {
      type: `${kind}.card_trashed`, action: `${kind}.card_trashed`, cardKind: kind, cardId: id,
      ...(kind === "student" ? { studentId: id, studentName: current.name || "" } : { teacherUid: id, teacherName: core.cardName("teacher", current) }),
      purgeAfter: patch.purgeAfter, actor, createdAt: nowIso,
    });
    return { kind, id, deletedAt: nowIso, purgeAfter: patch.purgeAfter };
  });
}

/** „Taasta”: back from the trash with the old active / disabled value. */
async function restoreCard(db, { kind: rawKind, id: rawId, actor = {}, FieldValue, now = new Date() }) {
  const kind = core.cleanKind(rawKind);
  const id = core.cleanId(rawId);
  const nowIso = now.toISOString();
  const ref = db.collection(COLLECTION[kind]).doc(id);
  return db.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists) throw core.cardError(404, "Kaarti ei leitud (võib olla juba lõplikult kustutatud).");
    const card = snap.data() || {};
    const change = core.restoreChange(kind, card, { nowIso });
    tx.set(ref, { ...change.set, ...Object.fromEntries(change.remove.map((key) => [key, FieldValue.delete()])) }, { merge: true });
    audit(db, tx, `card-restore-${kind}-${id}-${Date.parse(nowIso)}`, {
      type: `${kind}.card_restored`, action: `${kind}.card_restored`, cardKind: kind, cardId: id,
      ...(kind === "student" ? { studentId: id, studentName: card.name || "" } : { teacherUid: id, teacherName: core.cardName("teacher", card) }),
      deletedAt: card.deletedAt || "", actor, createdAt: nowIso,
    });
    return { kind, id, restored: true, ...change.set };
  });
}

/** One card past purgeAfter: delete, anonymise or leave it (block). Returns { kind, id, action, reason }. */
async function purgeCard(db, { kind, id, FieldValue, now = new Date(), actor = { uid: "system", name: "Prügikast (automaatne)" } }) {
  const nowIso = now.toISOString();
  const ref = db.collection(COLLECTION[kind]).doc(id);
  const first = await ref.get();
  if (!first.exists) return { kind, id, action: "skip", reason: "missing" };
  const card = first.data() || {};
  const early = core.purgeDecision({ card, now: nowIso, today: appToday(now) });
  if (early.action === "skip" || early.action === "wait") return { kind, id, ...early };
  const [{ schedule, groups }, references, invoices] = await Promise.all([cardLessons(db, kind, id, card), cardReferences(db, kind, id, card), cardInvoices(db, kind, id)]);
  const decision = core.purgeDecision({ card, references, schedule, groups, invoices, now: nowIso, today: appToday(now) });
  const accounts = kind === "student"
    ? uniqueDocs([await docsOf(db.collection("users").where("linkedStudentIds", "array-contains", id))]).map((doc) => doc.id)
    : [];
  return db.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    const current = snap.exists ? snap.data() : null;
    // restored or postponed meanwhile: leave it
    if (!current || !current.deletedAt || current.purgedAt || current.purgeAfter !== card.purgeAfter) return { kind, id, action: "skip", reason: "changed" };
    const label = core.deletedName(kind, id);
    const entry = {
      type: `${kind}.card_purged`, action: `${kind}.card_purged`, cardKind: kind, cardId: id, decision: decision.action, reason: decision.reason,
      references: decision.references.map(({ collection, field, count }) => ({ collection, field, count })),
      ...(kind === "student" ? { studentId: id, studentName: label } : { teacherUid: id, teacherName: label }),
      actor, createdAt: nowIso,
    };
    if (decision.action === "block") {
      tx.set(ref, { purgeBlocked: decision.reason, purgeBlockedAt: nowIso }, { merge: true });
      return { kind, id, action: "block", reason: decision.reason, count: decision.count };
    }
    const accountIds = [...new Set([...accounts, ...(kind === "student" ? core.linkedAccountIds(current) : [])])];
    if (decision.action === "delete") {
      tx.delete(ref);
      for (const collection of core.DISPOSABLE[kind].delete) tx.delete(db.collection(collection).doc(id));
    } else {
      tx.set(ref, core.anonymisedCard(kind, id, current, { nowIso }));
      for (const collection of core.DISPOSABLE[kind].anonymise) tx.delete(db.collection(collection).doc(id));
    }
    // learner and parent accounts stay (Firebase Auth is not touched); they only lose the card id
    for (const uid of accountIds) tx.set(db.collection("users").doc(uid), { linkedStudentIds: FieldValue.arrayRemove(id) }, { merge: true });
    audit(db, tx, `card-purge-${kind}-${id}`, { ...entry, unlinkedAccounts: accountIds.length });
    return { kind, id, action: decision.action, reason: decision.reason, references: entry.references };
  });
}

/** The scheduled purge (and the administrator's „Puhasta kohe”): every card whose week in the trash is over. */
async function purgeDueCards(db, { FieldValue, now = new Date(), max = 50 } = {}) {
  const nowIso = now.toISOString();
  const results = [];
  for (const kind of ["student", "teacher"]) {
    const due = await db.collection(COLLECTION[kind]).where("purgeAfter", "<=", nowIso).limit(max).get();
    for (const doc of due.docs) {
      try {
        results.push(await purgeCard(db, { kind, id: doc.id, FieldValue, now }));
      } catch (error) {
        results.push({ kind, id: doc.id, action: "error", reason: String(error.message || error).slice(0, 300) });
      }
    }
  }
  const count = (action) => results.filter((item) => item.action === action).length;
  return { checkedAt: nowIso, deleted: count("delete"), anonymised: count("anonymise"), blocked: count("block"), errors: count("error"), results };
}

module.exports = { previewTrash, trashCard, restoreCard, purgeCard, purgeDueCards, cardReferences, cardLessons };
