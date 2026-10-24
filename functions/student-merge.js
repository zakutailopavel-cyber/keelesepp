// „Liida kaardid”: two cards of one learner become one (owner 2026-10-10, rebuilt 2026-10-24 „нормальное
// объединение”). The administrator picks the card that stays and its name; everything of the other card moves to it:
// lessons, the weekly schedule, group membership, homework / worksheets / results, invitations, recordings, notes,
// change requests, finance references (invoices, payments, credits, packages — only the card id changes, never an
// amount or a number), the per-card documents (price plan, „Sobivad ajad”, first assessment, tax data, board) when
// the kept card has none, the accounts of the learner and the parents (union), the subjects with their teacher and
// level. The other card is never deleted: it stays archived as a tombstone (active: false, mergedInto) with an audit
// entry. History records (activityLog, financialAudit) keep the old id on purpose.
//
// Preview first (apply: false), then apply with confirmed: true. Idempotent: studentCardMerges/{sourceId} records the
// run; a repeated call after success returns the stored result, a call after a failure continues where it stopped
// (moved records no longer point at the old card). The record moves run in batches of 400 (a transaction cannot hold
// thousands of writes); the cards, the operation record and the audit entry are written in one final transaction.

const { mergeEnrollments, cardSubject } = require("./student-enrollments-core");
const { mergeGroupStudentReferences } = require("./student-merge-core");
const core = require("./student-card-merge-core");

const BATCH = 400;

// what the merge would move: [{ collection, field, count, kind, refs, docs }]
async function mergePlan(db, sourceId) {
  const out = [];
  for (const col of await db.listCollections()) {
    if (core.NEVER.has(col.id)) continue;
    const kind = core.kindOf(col.id);
    const single = await col.where("studentId", "==", sourceId).get().catch(() => null);
    if (single?.size) out.push({ collection: col.id, field: "studentId", count: single.size, kind, refs: single.docs.map((d) => d.ref), docs: single.docs });
    const many = await col.where("studentIds", "array-contains", sourceId).get().catch(() => null);
    if (many?.size) out.push({ collection: col.id, field: "studentIds", count: many.size, kind, refs: many.docs.map((d) => d.ref), docs: many.docs });
    // groups keep their members in `students` (+ studentLessonMap)
    const members = await col.where("students", "array-contains", sourceId).get().catch(() => null);
    if (members?.size) out.push({ collection: col.id, field: "students", count: members.size, kind, refs: members.docs.map((d) => d.ref), docs: members.docs });
  }
  return out;
}

// documents whose id is the card id: copy to the kept card when it has none
async function singletonPlan(db, keepId, sourceId) {
  const out = [];
  for (const collection of core.DOC_KEYED) {
    const [keepSnap, sourceSnap] = await Promise.all([db.collection(collection).doc(keepId).get(), db.collection(collection).doc(sourceId).get()]);
    if (!sourceSnap.exists) continue;
    const data = sourceSnap.data() || {};
    if (data.mergedInto === keepId && keepSnap.exists) continue;
    out.push({ collection, action: keepSnap.exists ? "keep" : "copy", keepData: keepSnap.exists ? keepSnap.data() : null, sourceData: data });
  }
  return out;
}

// copy a document with its subcollections (a board keeps its elements and pages); the source stays untouched
async function copyTree(db, fromRef, toRef, extra, counter) {
  const snap = await fromRef.get();
  if (snap.exists) { await toRef.set({ ...snap.data(), ...extra }, { merge: true }); counter.n += 1; }
  for (const sub of await fromRef.listCollections()) {
    const docs = await sub.get();
    for (let start = 0; start < docs.docs.length; start += BATCH) {
      const batch = db.batch();
      docs.docs.slice(start, start + BATCH).forEach((doc) => batch.set(toRef.collection(sub.id).doc(doc.id), doc.data(), { merge: true }));
      await batch.commit();
      counter.n += Math.min(BATCH, docs.docs.length - start);
    }
    // board pages hold their own elements; plain element lists have nothing below them
    if (sub.id === "elements") continue;
    for (const doc of docs.docs) {
      for (const deeper of await doc.ref.listCollections()) {
        const inner = await deeper.get();
        for (let start = 0; start < inner.docs.length; start += BATCH) {
          const batch = db.batch();
          inner.docs.slice(start, start + BATCH).forEach((d) => batch.set(toRef.collection(sub.id).doc(doc.id).collection(deeper.id).doc(d.id), d.data(), { merge: true }));
          await batch.commit();
          counter.n += Math.min(BATCH, inner.docs.length - start);
        }
      }
    }
  }
}

async function subcollectionCounts(ref) {
  const out = [];
  for (const sub of await ref.listCollections()) {
    const snap = await sub.get();
    if (snap.size) out.push({ collection: sub.id, count: snap.size });
  }
  return out;
}

function cardSummary(id, s = {}) {
  return {
    id,
    name: s.name || "",
    active: s.active !== false,
    accounts: core.accountIds(s),
    parents: core.parentIds(s),
    parentContacts: core.parentContactsOf(s),
    subjects: mergeEnrollments(s, {}).enrollments.map(({ subject, teacher, level, active, status }) => ({ subject, teacher, level, active, ...(status ? { status } : {}) })),
  };
}

async function mergeStudentCards(db, { FieldValue, keepId: rawKeep, sourceId: rawSource, keepName: rawName, actor = {}, apply = false, confirmed = false, includeFinance = true, includeSchedule = true, nowIso = new Date().toISOString() }) {
  const { keepId, sourceId, keepName } = core.normalizedInput({ keepId: rawKeep, sourceId: rawSource, keepName: rawName });
  const keepRef = db.collection("students").doc(keepId);
  const sourceRef = db.collection("students").doc(sourceId);
  const opRef = db.collection("studentCardMerges").doc(sourceId);
  const [keepSnap, sourceSnap, opSnap] = await Promise.all([keepRef.get(), sourceRef.get(), opRef.get()]);
  if (!keepSnap.exists || !sourceSnap.exists) throw Object.assign(new Error("Student card not found"), { status: 404 });
  const keep = keepSnap.data();
  const source = sourceSnap.data();
  const op = opSnap.exists ? opSnap.data() : null;
  if (op?.status === "complete" || source.mergedInto || source.mergedIntoStudentId) {
    const into = op?.keepId || source.mergedInto || source.mergedIntoStudentId;
    if (into === keepId && op?.status === "complete") return { ...(op.result || {}), applied: true, idempotent: true };
    throw Object.assign(new Error("This card is already merged"), { status: 409 });
  }
  if (keep.mergedInto || keep.mergedIntoStudentId) throw Object.assign(new Error("The kept card is itself merged into another card"), { status: 409 });
  const names = [...new Set([keep.name, source.name].map((n) => String(n || "").trim()).filter(Boolean))];
  if (keepName && !names.includes(keepName)) throw Object.assign(new Error("The name must be one of the two cards' names"), { status: 400 });

  const plan = await mergePlan(db, sourceId);
  const moving = plan.filter((p) => p.kind === "learner" || (p.kind === "finance" && includeFinance) || (p.kind === "schedule" && includeSchedule));
  // one pet per learner: the kept card's pet wins
  const [keepPet, sourcePet] = await Promise.all([
    db.collection("petProfiles").where("studentId", "==", keepId).limit(1).get().catch(() => null),
    db.collection("petProfiles").where("studentId", "==", sourceId).limit(1).get().catch(() => null),
  ]);
  const skipped = [];
  const steps = moving.filter((p) => {
    if (p.collection === "petProfiles" && keepPet?.size) { skipped.push({ ...p, reason: "sellel kaardil on juba lemmik" }); return false; }
    return true;
  });
  const singletons = await singletonPlan(db, keepId, sourceId);
  const planDoc = singletons.find((s) => s.collection === "studentRevenuePlans");
  const keepPlanSnap = planDoc ? null : await db.collection("studentRevenuePlans").doc(keepId).get();
  const price = core.revenuePlanMerge({ keep, source, keepPlan: planDoc ? planDoc.keepData : (keepPlanSnap?.exists ? keepPlanSnap.data() : null), sourcePlan: planDoc?.sourceData || null });
  const tracks = mergeEnrollments(keep, source);
  const parents = core.mergeParents(keep, source);
  const sourceSubject = cardSubject(source);
  const userLinks = await db.collection("users").where("linkedStudentIds", "array-contains", sourceId).get().catch(() => null);
  const subcollections = await subcollectionCounts(sourceRef);
  const conflicts = core.mergeConflicts({ keep, source, parents, plan: price, singletons, pets: { keep: Boolean(keepPet?.size), source: Boolean(sourcePet?.size) } });

  const summary = {
    keep: cardSummary(keepId, keep),
    source: cardSummary(sourceId, source),
    names,
    keepName: keepName || keep.name || source.name || "",
    move: steps.map(({ collection, field, count, kind }) => ({ collection, field, count, kind })),
    waiting: plan.filter((p) => !moving.includes(p)).map(({ collection, field, count, kind }) => ({ collection, field, count, kind })),
    skipped: skipped.map(({ collection, count, reason }) => ({ collection, count, reason })),
    documents: singletons.map(({ collection, action }) => ({ collection, action, label: core.DOC_LABELS[collection] || collection })),
    price: { action: price.action, subject: price.subject || "", keepCents: price.keepCents || 0, sourceCents: price.sourceCents || 0 },
    subcollections,
    accountLinks: userLinks?.size || 0,
    subjects: tracks.enrollments.map(({ subject, teacher, level }) => ({ subject, teacher, level })),
    addedSubjects: tracks.added.map(({ subject, teacher, level }) => ({ subject, teacher, level })),
    parents: { accounts: parents.linkedParentIds, contacts: parents.parentContacts },
    conflicts,
    totals: steps.reduce((acc, s) => ({ ...acc, [s.kind]: (acc[s.kind] || 0) + s.count }), {}),
  };
  if (!apply) return { ...summary, applied: false };
  if (confirmed !== true) throw Object.assign(new Error("Confirm the merge after the preview"), { status: 400 });

  await opRef.set({ status: "running", keepId, sourceId, startedAt: op?.startedAt || nowIso, updatedAt: nowIso, actor, preview: { move: summary.move, conflicts: summary.conflicts } }, { merge: true });
  try {
    // 1. re-point the records in batches
    let batch = db.batch();
    let n = 0;
    const flush = async () => { if (n) { await batch.commit(); batch = db.batch(); n = 0; } };
    const keepNameFinal = summary.keepName;
    for (const step of steps) {
      const learnerSide = step.kind !== "finance";
      for (const [index, ref] of step.refs.entries()) {
        const data = step.docs?.[index]?.data?.() || {};
        if (step.field === "studentId") {
          const subject = learnerSide && sourceSubject && !data.subject ? { subject: sourceSubject } : {};
          // a lesson's name follows the card; an invoice keeps the name it was issued with
          const name = learnerSide && data.studentName ? { studentName: keepNameFinal } : {};
          batch.update(ref, { studentId: keepId, mergedFromStudentId: sourceId, ...subject, ...name });
        } else if (step.field === "students") {
          batch.update(ref, { ...mergeGroupStudentReferences(data, keepId, [sourceId]), mergedStudentAt: nowIso });
        } else {
          batch.update(ref, { studentIds: FieldValue.arrayUnion(keepId) });
        }
        n += 1;
        if (n >= BATCH) await flush();
      }
    }
    await flush();
    for (const step of steps.filter((s) => s.field === "studentIds")) {
      for (const ref of step.refs) { batch.update(ref, { studentIds: FieldValue.arrayRemove(sourceId) }); n += 1; if (n >= BATCH) await flush(); }
    }
    await flush();

    // 2. the per-card documents: copied when the kept card has none; the old one is marked, never deleted
    const counter = { n: 0 };
    for (const item of singletons) {
      const fromRef = db.collection(item.collection).doc(sourceId);
      if (item.action === "copy") {
        const extra = { copiedFromStudentId: sourceId, mergedStudentAt: nowIso, ...(item.sourceData.studentId !== undefined ? { studentId: keepId } : {}), ...(item.collection === "studentRevenuePlans" ? { studentName: keepNameFinal } : {}) };
        await copyTree(db, fromRef, db.collection(item.collection).doc(keepId), extra, counter);
      }
      await fromRef.set({ mergedInto: keepId, mergedAt: nowIso, ...(item.collection === "studentRevenuePlans" ? { active: false } : {}) }, { merge: true });
    }
    if (price.action === "addSubjectPrice") await db.collection("studentRevenuePlans").doc(keepId).set({ ...price.patch, updatedAt: nowIso }, { merge: true });
    // subcollections of the old card (if any) are copied as they are
    for (const sub of subcollections) {
      const docs = await sourceRef.collection(sub.collection).get();
      for (const doc of docs.docs) await copyTree(db, doc.ref, keepRef.collection(sub.collection).doc(doc.id), { copiedFromStudentId: sourceId }, counter);
    }

    // 3. accounts that list the old card (the learner's and the parents') get the kept one
    const linkBatch = db.batch();
    for (const doc of userLinks?.docs || []) linkBatch.set(doc.ref, { linkedStudentIds: FieldValue.arrayUnion(keepId), updatedAt: nowIso }, { merge: true });
    for (const uid of core.accountIds(source)) linkBatch.set(db.collection("users").doc(uid), { linkedStudentIds: FieldValue.arrayUnion(keepId), updatedAt: nowIso }, { merge: true });
    await linkBatch.commit();

    // 4. the cards, the operation record and the audit entry together
    const accounts = core.ids(core.accountIds(keep), core.accountIds(source));
    const result = { ...summary, applied: true, copiedDocuments: counter.n, completedAt: nowIso };
    await db.runTransaction(async (tx) => {
      const [k, s] = await Promise.all([tx.get(keepRef), tx.get(sourceRef)]);
      const keepNow = k.data() || keep;
      const sourceNow = s.data() || source;
      const fresh = mergeEnrollments(keepNow, sourceNow);
      const freshParents = core.mergeParents(keepNow, sourceNow);
      const firstContact = freshParents.parentContacts[0] || {};
      tx.set(keepRef, {
        ...core.profilePatch(keepNow, sourceNow),
        ...(keepName && keepName !== keepNow.name ? { name: keepName } : {}),
        nameAliases: core.ids(keepNow.nameAliases || [], keepNow.name, sourceNow.name),
        linkedUserIds: accounts,
        ...(accounts.length ? { linkedUserId: keepNow.linkedUserId || sourceNow.linkedUserId || accounts[0], studentUid: keepNow.studentUid || sourceNow.studentUid || accounts[0] } : {}),
        ...(freshParents.linkedParentIds.length ? { linkedParentIds: freshParents.linkedParentIds, linkedParentId: freshParents.linkedParentId, ...(!keepNow.parentUid ? { parentUid: freshParents.linkedParentId } : {}) } : {}),
        ...(freshParents.parentContacts.length ? { parentContacts: freshParents.parentContacts } : {}),
        ...(!keepNow.parentName && firstContact.name ? { parentName: firstContact.name } : {}),
        ...(!keepNow.parentEmail && firstContact.email ? { parentEmail: firstContact.email } : {}),
        enrollments: fresh.enrollments,
        ...(fresh.teacherUids.length ? { teacherUids: fresh.teacherUids } : {}),
        ...(keepNow.active === false && sourceNow.active !== false ? { active: true } : {}),
        mergedStudentIds: FieldValue.arrayUnion(sourceId),
        updatedAt: nowIso,
      }, { merge: true });
      tx.set(sourceRef, {
        active: false, mergedInto: keepId, mergedIntoStudentId: keepId, mergedIntoStudentName: keepName || keepNow.name || "", mergedAt: nowIso, mergedBy: actor,
        linkedUserId: "", studentUid: "", linkedUserIds: [], linkedParentId: "", parentUid: "", guardianUid: "", linkedParentIds: [], updatedAt: nowIso,
      }, { merge: true });
      tx.set(opRef, { status: "complete", result, completedAt: nowIso, updatedAt: nowIso }, { merge: true });
      tx.set(db.collection("activityLog").doc(`student-card-merge-${sourceId}`), {
        type: "student.cards_merged", action: "student.cards_merged", studentId: keepId, mergedFromStudentId: sourceId,
        studentName: keepName || keepNow.name || "", mergedName: sourceNow.name || "", moved: summary.move, documents: summary.documents,
        conflicts: summary.conflicts.map((c) => c.code), price: summary.price, actor, createdAt: nowIso,
      });
    });
    // the closed card's id leaves the accounts' lists after the kept one is in
    const clean = db.batch();
    for (const doc of userLinks?.docs || []) clean.set(doc.ref, { linkedStudentIds: FieldValue.arrayRemove(sourceId) }, { merge: true });
    for (const uid of core.accountIds(source)) clean.set(db.collection("users").doc(uid), { linkedStudentIds: FieldValue.arrayRemove(sourceId) }, { merge: true });
    await clean.commit();
    return result;
  } catch (error) {
    await opRef.set({ status: "failed", error: String(error.message || error).slice(0, 500), updatedAt: new Date().toISOString() }, { merge: true });
    throw error;
  }
}

module.exports = { mergeStudentCards, mergePlan, FINANCE: core.FINANCE, SCHEDULE: core.SCHEDULE };
