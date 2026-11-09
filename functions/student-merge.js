// „Liida kaardid”: two cards of one learner become one (owner 2026-10-10, rebuilt 2026-10-24 „нормальное
// объединение”). The administrator picks the card that stays and its name; everything of the other card moves to it:
// lessons, the weekly schedule, group membership, homework / worksheets / results, invitations, recordings, notes,
// change requests, finance references (invoices, payments, credits, packages — only the card id changes, never an
// amount or a number), the per-card documents (price plan, „Sobivad ajad”, first assessment, tax data, board) when
// the kept card has none, the accounts of the learner and the parents (union), the subjects with their teacher and
// level. The other card is never deleted: it stays archived as a tombstone (active: false, mergedInto) with an audit
// entry. History records (activityLog, financialAudit) keep the old id on purpose.
// Archived cards merge like active ones (2026-11-03): the merged card is active when either card was (keepActive
// overrides it), and the tracks of an archived other card come over as „Lõpetanud”.
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

async function mergeStudentCards(db, { FieldValue, keepId: rawKeep, sourceId: rawSource, keepName: rawName, keepActive, actor = {}, apply = false, confirmed = false, confirmedDifferences = false, includeFinance = true, includeSchedule = true, nowIso = new Date().toISOString() }) {
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
  // a card in the „Prügikast” (or purged after it) takes no part: its purge would anonymise the merged history
  // (2026-11-06). Archived cards merge as usual.
  const trashed = [keep, source].find((card) => card.deletedAt || card.purgedAt);
  if (trashed) throw Object.assign(new Error(`Kaart „${trashed.name || ""}” on prügikastis. Taasta see enne liitmist (Inimesed → Prügikast).`), { status: 409 });
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
  // archived cards merge too (2026-11-03); the merged card's archive state is explicit in the preview
  const activeAfter = core.resultActive(keep, source, keepActive);
  const tracks = mergeEnrollments(keep, core.sourceForTracks(source, activeAfter));
  const parents = core.mergeParents(keep, source);
  // a moved lesson keeps its own subject; one without a subject gets the other card's (never the kept card's)
  const sourceSubject = core.sourceLessonSubject(source) || cardSubject(source);
  const userLinks = await db.collection("users").where("linkedStudentIds", "array-contains", sourceId).get().catch(() => null);
  const subcollections = await subcollectionCounts(sourceRef);
  const conflicts = core.mergeConflicts({ keep, source, parents, plan: price, singletons, pets: { keep: Boolean(keepPet?.size), source: Boolean(sourcePet?.size) }, activeAfter });

  const summary = {
    keep: cardSummary(keepId, keep),
    source: cardSummary(sourceId, source),
    names,
    keepName: keepName || keep.name || source.name || "",
    activeAfter,
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
    // „Need võivad olla erinevad lapsed” (2026-11-09): any signal needs confirmedDifferences: true
    differentPerson: core.differentPersonSignals(keep, source),
    totals: steps.reduce((acc, s) => ({ ...acc, [s.kind]: (acc[s.kind] || 0) + s.count }), {}),
  };
  if (!apply) return { ...summary, applied: false };
  if (confirmed !== true) throw Object.assign(new Error("Confirm the merge after the preview"), { status: 400 });
  if (summary.differentPerson.length && confirmedDifferences !== true) {
    throw Object.assign(new Error(`Need võivad olla erinevad lapsed (${summary.differentPerson.map((s) => s.label).join("; ")}). Liitmiseks kinnita, et see on sama laps.`), { status: 409, code: "different_person" });
  }

  // a run continued after a failure keeps its id (its undo records are already written); a new merge gets a new one
  const resumed = Boolean(op && ["running", "failed"].includes(op.status) && op.runId);
  const runId = resumed ? op.runId : `${Date.parse(nowIso) || Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  await opRef.set({
    status: "running", keepId, sourceId, runId, undoVersion: core.UNDO_VERSION, startedAt: (resumed && op.startedAt) || nowIso, updatedAt: nowIso, actor,
    preview: { move: summary.move, conflicts: summary.conflicts, differentPerson: summary.differentPerson.map((s) => s.code) },
    confirmedDifferences: summary.differentPerson.length > 0,
  }, { merge: true });
  const undoCol = opRef.collection("undo");
  try {
    // 1. re-point the records in batches
    // every moved record writes what it was before in the same batch (studentCardMerges/{sourceId}/undo), so
    // „Võta ühendamine tagasi” can restore it (2026-11-09)
    let batch = db.batch();
    let n = 0;
    let entries = [];
    let entryBytes = 0;
    const flush = async () => {
      if (entries.length) batch.set(undoCol.doc(), { runId, entries, createdAt: nowIso });
      if (n || entries.length) { await batch.commit(); batch = db.batch(); n = 0; entries = []; entryBytes = 0; }
    };
    const record = (entry) => { entries.push(entry); entryBytes += JSON.stringify(entry).length; };
    const keepNameFinal = summary.keepName;
    for (const step of steps) {
      const learnerSide = step.kind !== "finance";
      for (const [index, ref] of step.refs.entries()) {
        const data = step.docs?.[index]?.data?.() || {};
        if (step.field === "studentId") {
          const subject = learnerSide && sourceSubject && !data.subject ? { subject: sourceSubject } : {};
          // a lesson's name follows the card; an invoice keeps the name it was issued with
          const name = learnerSide && data.studentName ? { studentName: keepNameFinal } : {};
          const after = { studentId: keepId, mergedFromStudentId: sourceId, ...subject, ...name };
          record(core.undoEntry(ref.path, data, after, "studentId"));
          batch.update(ref, after);
        } else if (step.field === "students") {
          const after = { ...mergeGroupStudentReferences(data, keepId, [sourceId]), mergedStudentAt: nowIso };
          record(core.undoEntry(ref.path, data, after, "students"));
          batch.update(ref, after);
        } else {
          record({ kind: "ids", path: ref.path, field: "studentIds", keepId, sourceId, hadKeep: Array.isArray(data.studentIds) && data.studentIds.includes(keepId) });
          batch.update(ref, { studentIds: FieldValue.arrayUnion(keepId) });
        }
        n += 1;
        if (n >= BATCH || entryBytes > 600000) await flush();
      }
    }
    await flush();
    for (const step of steps.filter((s) => s.field === "studentIds")) {
      for (const ref of step.refs) { batch.update(ref, { studentIds: FieldValue.arrayRemove(sourceId) }); n += 1; if (n >= BATCH) await flush(); }
    }
    await flush();

    // 2. the per-card documents: copied when the kept card has none; the old one is marked, never deleted
    const counter = { n: 0 };
    const cardDocs = [];
    const copies = [];
    for (const item of singletons) {
      const fromRef = db.collection(item.collection).doc(sourceId);
      if (item.action === "copy") {
        const extra = { copiedFromStudentId: sourceId, mergedStudentAt: nowIso, ...(item.sourceData.studentId !== undefined ? { studentId: keepId } : {}), ...(item.collection === "studentRevenuePlans" ? { studentName: keepNameFinal } : {}) };
        await copyTree(db, fromRef, db.collection(item.collection).doc(keepId), extra, counter);
        copies.push({ path: `${item.collection}/${keepId}`, collection: item.collection, label: core.DOC_LABELS[item.collection] || item.collection });
      }
      const mark = { mergedInto: keepId, mergedAt: nowIso, ...(item.collection === "studentRevenuePlans" ? { active: false } : {}) };
      cardDocs.push(core.undoEntry(fromRef.path, item.sourceData, mark));
      await fromRef.set(mark, { merge: true });
    }
    if (price.action === "addSubjectPrice") {
      const planRef = db.collection("studentRevenuePlans").doc(keepId);
      const planNow = await planRef.get();
      cardDocs.push(core.undoEntry(planRef.path, planNow.exists ? planNow.data() : {}, price.patch));
      await planRef.set({ ...price.patch, updatedAt: nowIso }, { merge: true });
    }
    // subcollections of the old card (if any) are copied as they are
    for (const sub of subcollections) {
      const docs = await sourceRef.collection(sub.collection).get();
      for (const doc of docs.docs) await copyTree(db, doc.ref, keepRef.collection(sub.collection).doc(doc.id), { copiedFromStudentId: sourceId }, counter);
      copies.push({ path: `students/${keepId}/${sub.collection}`, collection: sub.collection, label: sub.collection });
    }

    // 3. accounts that list the old card (the learner's and the parents') get the kept one; what each account listed
    // before is recorded for the reversal
    const linkedDocs = new Map((userLinks?.docs || []).map((doc) => [doc.id, doc.data() || {}]));
    for (const uid of core.accountIds(source)) {
      if (linkedDocs.has(uid)) continue;
      const snap = await db.collection("users").doc(uid).get();
      linkedDocs.set(uid, snap.exists ? snap.data() || {} : {});
    }
    const users = [...linkedDocs.entries()].map(([uid, data]) => {
      const list = Array.isArray(data.linkedStudentIds) ? data.linkedStudentIds : [];
      return { uid, hadKeep: list.includes(keepId), hadSource: list.includes(sourceId) };
    });
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
      const keepWasActive = keepNow.active !== false;
      const fresh = mergeEnrollments(keepNow, core.sourceForTracks(sourceNow, activeAfter));
      const freshParents = core.mergeParents(keepNow, sourceNow);
      const firstContact = freshParents.parentContacts[0] || {};
      const keepPatch = {
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
        ...(activeAfter !== keepWasActive ? { active: activeAfter, ...(activeAfter ? { restoredAt: nowIso } : { archivedAt: nowIso }) } : {}),
        mergedStudentIds: core.ids(keepNow.mergedStudentIds || [], sourceId),
      };
      // the tombstone says the merge can be reversed (mergeUndoVersion; older merges have no record)
      const sourcePatch = {
        active: false, mergedInto: keepId, mergedIntoStudentId: keepId, mergedIntoStudentName: keepName || keepNow.name || "", mergedAt: nowIso, mergedBy: actor,
        linkedUserId: "", studentUid: "", linkedUserIds: [], linkedParentId: "", parentUid: "", guardianUid: "", linkedParentIds: [], mergeUndoVersion: core.UNDO_VERSION,
      };
      tx.set(keepRef, { ...keepPatch, updatedAt: nowIso }, { merge: true });
      tx.set(sourceRef, { ...sourcePatch, updatedAt: nowIso }, { merge: true });
      const undo = {
        version: core.UNDO_VERSION, runId, keepId, sourceId,
        cards: [core.undoEntry(keepRef.path, keepNow, keepPatch), core.undoEntry(sourceRef.path, sourceNow, sourcePatch)],
        docs: cardDocs, users, copies,
      };
      tx.set(opRef, { status: "complete", result, undo, completedAt: nowIso, updatedAt: nowIso }, { merge: true });
      tx.set(db.collection("activityLog").doc(`student-card-merge-${sourceId}`), {
        type: "student.cards_merged", action: "student.cards_merged", studentId: keepId, mergedFromStudentId: sourceId,
        studentName: keepName || keepNow.name || "", mergedName: sourceNow.name || "", moved: summary.move, documents: summary.documents,
        conflicts: summary.conflicts.map((c) => c.code), price: summary.price, actor, createdAt: nowIso,
        activeBefore: { keep: keepWasActive, source: sourceNow.active !== false }, activeAfter,
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

// „Võta ühendamine tagasi” (incident 2026-11-09: two different girls named Stefania were merged). Reverses a merge
// from its record (studentCardMerges/{sourceId}.undo + the undo subcollection written in the same batches as the
// moves): every moved record gets its old card id and fields back, the accounts their old card lists, both cards their
// old fields, the other card is active again. Nothing is deleted. A field someone changed after the merge is left as
// it is and reported; documents copied to the kept card (price plan, „Sobivad ajad”, board …) stay and are listed for
// a manual check; records created on the kept card after the merge stay there. Preview first, then confirmed: true.
// Merges made before 2026-11-09 have no record: they are refused with code "legacy".
const UNMERGE_LEGACY = "Vana ühendamine — tagasi võtmiseks pöördu administraatori poole";

function patchFor(FieldValue, revert, extra = {}) {
  return { ...revert.set, ...Object.fromEntries(revert.remove.map((field) => [field, FieldValue.delete()])), ...extra };
}

// all the revert results of one document together (a group may have both a `students` and a `studentIds` record)
function combineReverts(results) {
  const out = { status: "done", set: {}, remove: [], skipped: [] };
  for (const r of results) {
    Object.assign(out.set, r.set);
    out.remove.push(...r.remove);
    out.skipped.push(...r.skipped);
  }
  if (results.some((r) => r.status === "missing")) out.status = "missing";
  else if (Object.keys(out.set).length || out.remove.length) out.status = "revert";
  else if (results.some((r) => r.status === "conflict")) out.status = "conflict";
  return out;
}

async function readAll(db, paths) {
  const out = new Map();
  for (let start = 0; start < paths.length; start += 300) {
    const refs = paths.slice(start, start + 300).map((path) => db.doc(path));
    const snaps = refs.length ? await db.getAll(...refs) : [];
    snaps.forEach((snap, i) => out.set(refs[i].path, snap));
  }
  return out;
}

function cardRevert(snap, entry, sourceId) {
  const revert = core.revertFields(snap?.exists ? snap.data() : null, entry);
  const data = snap?.exists ? snap.data() : {};
  // the kept card always lets go of the merged card id, even when another merge added ids since
  if (revert.skipped.includes("mergedStudentIds") && Array.isArray(data.mergedStudentIds)) {
    revert.skipped = revert.skipped.filter((f) => f !== "mergedStudentIds");
    revert.set.mergedStudentIds = data.mergedStudentIds.filter((id) => id !== sourceId);
    revert.status = "revert";
  }
  return revert;
}

async function unmergeStudentCards(db, { FieldValue, sourceId: rawSource, keepId: rawKeep = "", actor = {}, apply = false, confirmed = false, nowIso = new Date().toISOString() }) {
  const sourceId = String(rawSource || "").trim();
  if (!sourceId) throw Object.assign(new Error("Student card required"), { status: 400 });
  const opRef = db.collection("studentCardMerges").doc(sourceId);
  const sourceRef = db.collection("students").doc(sourceId);
  const [opSnap, sourceSnap] = await Promise.all([opRef.get(), sourceRef.get()]);
  if (!sourceSnap.exists) throw Object.assign(new Error("Student card not found"), { status: 404 });
  const source = sourceSnap.data() || {};
  const op = opSnap.exists ? opSnap.data() : null;
  if (op?.status === "unmerged") {
    if (apply) return { applied: true, idempotent: true, keepId: op.keepId, sourceId, unmergedAt: op.unmergedAt };
    throw Object.assign(new Error("See ühendamine on juba tagasi võetud"), { status: 409, code: "already_unmerged" });
  }
  const mergedInto = source.mergedInto || source.mergedIntoStudentId || "";
  if (!mergedInto && op?.status !== "complete") throw Object.assign(new Error("See kaart ei ole ühendatud"), { status: 404, code: "not_merged" });
  const undo = op?.status === "complete" ? op.undo : null;
  if (!undo || undo.version !== core.UNDO_VERSION) throw Object.assign(new Error(UNMERGE_LEGACY), { status: 409, code: "legacy" });
  const keepId = undo.keepId;
  if (rawKeep && String(rawKeep).trim() !== keepId) throw Object.assign(new Error("Kaart ei ole ühendatud selle kaardiga"), { status: 400 });
  if (mergedInto !== keepId) throw Object.assign(new Error("Kaart on vahepeal ühendatud muul viisil — võta see tagasi käsitsi"), { status: 409, code: "changed" });
  const keepRef = db.collection("students").doc(keepId);
  const keepSnap = await keepRef.get();
  if (!keepSnap.exists) throw Object.assign(new Error("Alles jäänud kaarti ei leitud"), { status: 404 });
  const keep = keepSnap.data() || {};
  if (keep.mergedInto || keep.mergedIntoStudentId) throw Object.assign(new Error(`„${keep.name || ""}” on hiljem ühendatud veel ühe kaardiga — võta esmalt see ühendamine tagasi`), { status: 409, code: "keep_merged" });
  const trashed = [keep, source].find((card) => card.deletedAt || card.purgedAt);
  if (trashed) throw Object.assign(new Error(`Kaart „${trashed.name || ""}” on prügikastis. Taasta see enne.`), { status: 409 });

  // the moved records, grouped by document
  const chunks = await opRef.collection("undo").where("runId", "==", undo.runId).get();
  const byPath = new Map();
  for (const chunk of chunks.docs) for (const entry of chunk.data().entries || []) byPath.set(entry.path, [...(byPath.get(entry.path) || []), entry]);
  for (const entry of undo.docs || []) byPath.set(entry.path, [...(byPath.get(entry.path) || []), entry]);
  const snaps = await readAll(db, [...byPath.keys()]);
  const items = [...byPath.entries()].map(([path, list]) => {
    const snap = snaps.get(path);
    const data = snap?.exists ? snap.data() : null;
    return { path, snap, revert: combineReverts(list.map((entry) => core.revertFields(data, entry))) };
  });
  const userSnaps = await readAll(db, (undo.users || []).map((u) => `users/${u.uid}`));
  const users = (undo.users || []).map((u) => {
    const snap = userSnaps.get(`users/${u.uid}`);
    if (!snap?.exists) return { ...u, status: "missing" };
    const list = Array.isArray(snap.data().linkedStudentIds) ? snap.data().linkedStudentIds : [];
    const next = [...list.filter((id) => u.hadKeep || id !== keepId), ...(u.hadSource && !list.includes(sourceId) ? [sourceId] : [])];
    return { ...u, snap, next, status: core.sameValue(next, list) ? "done" : "revert" };
  });
  const [keepEntry, sourceEntry] = undo.cards || [];
  const keepRevert = cardRevert(keepSnap, keepEntry, sourceId);
  const sourceRevert = cardRevert(sourceSnap, sourceEntry, sourceId);

  const collectionOf = (path) => path.split("/")[0];
  const count = (status) => items.filter((i) => i.revert.status === status).reduce((acc, i) => ({ ...acc, [collectionOf(i.path)]: (acc[collectionOf(i.path)] || 0) + 1 }), {});
  const summary = {
    keep: { id: keepId, name: keep.name || "" },
    source: { id: sourceId, name: source.name || "" },
    mergedAt: source.mergedAt || op.completedAt || "",
    revert: count("revert"),
    alreadyBack: items.filter((i) => i.revert.status === "done").length,
    conflicts: items.filter((i) => i.revert.skipped.length).map((i) => ({ path: i.path, fields: [...new Set(i.revert.skipped)] })),
    missing: items.filter((i) => i.revert.status === "missing").map((i) => i.path),
    accounts: users.filter((u) => u.status === "revert").length,
    keepFields: { restored: [...Object.keys(keepRevert.set), ...keepRevert.remove], changedSince: keepRevert.skipped },
    sourceFields: { restored: [...Object.keys(sourceRevert.set), ...sourceRevert.remove], changedSince: sourceRevert.skipped },
    copies: undo.copies || [],
  };
  summary.totalRevert = Object.values(summary.revert).reduce((a, b) => a + b, 0);
  if (!apply) return { ...summary, applied: false };
  if (confirmed !== true) throw Object.assign(new Error("Confirm the reversal after the preview"), { status: 400 });

  // 1. the records, in batches; each write only if the document did not change since it was read
  let batch = db.batch();
  let n = 0;
  const flush = async () => { if (n) { await batch.commit(); batch = db.batch(); n = 0; } };
  for (const item of items.filter((i) => i.revert.status === "revert")) {
    batch.update(item.snap.ref, patchFor(FieldValue, item.revert, { unmergedAt: nowIso }), { lastUpdateTime: item.snap.updateTime });
    n += 1;
    if (n >= BATCH) await flush();
  }
  for (const u of users.filter((x) => x.status === "revert")) {
    batch.update(u.snap.ref, { linkedStudentIds: u.next, updatedAt: nowIso }, { lastUpdateTime: u.snap.updateTime });
    n += 1;
    if (n >= BATCH) await flush();
  }
  await flush();

  // 2. both cards, the operation record and the audit entry together
  const result = { ...summary, applied: true, unmergedAt: nowIso };
  await db.runTransaction(async (tx) => {
    const [k, s, o] = await Promise.all([tx.get(keepRef), tx.get(sourceRef), tx.get(opRef)]);
    if (o.data()?.status !== "complete") throw Object.assign(new Error("See ühendamine on juba tagasi võetud"), { status: 409 });
    const kr = cardRevert(k, keepEntry, sourceId);
    const sr = cardRevert(s, sourceEntry, sourceId);
    tx.update(keepRef, patchFor(FieldValue, kr, { updatedAt: nowIso, unmergedStudentIds: core.ids(k.data()?.unmergedStudentIds || [], sourceId) }));
    tx.update(sourceRef, patchFor(FieldValue, sr, { updatedAt: nowIso, unmergedAt: nowIso, unmergedBy: actor, unmergedFromStudentId: keepId }));
    tx.set(opRef, { status: "unmerged", unmergedAt: nowIso, unmergedBy: actor, unmergeResult: { revert: summary.revert, conflicts: summary.conflicts.length, missing: summary.missing.length, accounts: summary.accounts }, updatedAt: nowIso }, { merge: true });
    tx.set(db.collection("activityLog").doc(`student-card-unmerge-${sourceId}-${undo.runId}`), {
      type: "student.cards_unmerged", action: "student.cards_unmerged", studentId: sourceId, unmergedFromStudentId: keepId,
      studentName: source.name || "", keepName: keep.name || "", revert: summary.revert, conflicts: summary.conflicts, missing: summary.missing,
      copies: summary.copies.map((c) => c.path), keepChangedSince: kr.skipped, actor, createdAt: nowIso,
    });
  });
  return result;
}

module.exports = { mergeStudentCards, unmergeStudentCards, UNMERGE_LEGACY, mergePlan, FINANCE: core.FINANCE, SCHEDULE: core.SCHEDULE };
