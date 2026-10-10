// Merge two cards of the same learner (owner 2026-10-10): a teacher made card „Vlad” holds the schedule and history,
// the learner's self-registration made a second card „Влад Повжик” with the account. Assigned work went to the first
// card and the learner did not see it.
//
// The kept card gets the account and the learner's records; the other card is closed (active: false, mergedInto) and
// loses its account links, so the learner sees one card. Every collection is searched for `studentId` (and
// `studentIds` arrays). Finance and the calendar schedule move only when asked for explicitly: invoices carry their
// own client data and the Google Calendar sync finds the student by id. Preview first, then apply.

const FINANCE = new Set(["invoices", "payments", "creditNotes", "bankTransactions", "studentRevenuePlans", "expenses", "manualInvoices", "financialAudit", "financialPeriods", "refunds"]);
const SCHEDULE = new Set(["schedule"]);
const NEVER = new Set(["students", "users"]);
const BATCH = 400;

const ids = (...lists) => [...new Set(lists.flat().map((x) => String(x || "").trim()).filter(Boolean))];
const accountIds = (s = {}) => ids(s.linkedUserId, s.studentUid, s.linkedUserIds || []);
const parentIds = (s = {}) => ids(s.linkedParentId, s.parentUid, s.guardianUid, s.linkedParentIds || []);

// what the merge would move: [{ collection, field, count, kind: 'learner' | 'finance' | 'schedule' }]
async function mergePlan(db, sourceId) {
  const out = [];
  for (const col of await db.listCollections()) {
    if (NEVER.has(col.id)) continue;
    const kind = FINANCE.has(col.id) ? "finance" : SCHEDULE.has(col.id) ? "schedule" : "learner";
    const single = await col.where("studentId", "==", sourceId).get().catch(() => null);
    if (single?.size) out.push({ collection: col.id, field: "studentId", count: single.size, kind, refs: single.docs.map((d) => d.ref) });
    const many = await col.where("studentIds", "array-contains", sourceId).get().catch(() => null);
    if (many?.size) out.push({ collection: col.id, field: "studentIds", count: many.size, kind, refs: many.docs.map((d) => d.ref) });
  }
  return out;
}

async function mergeStudentCards(db, { FieldValue, keepId, sourceId, actor = {}, apply = false, includeFinance = false, includeSchedule = false, nowIso = new Date().toISOString() }) {
  const keepRef = db.collection("students").doc(String(keepId || ""));
  const sourceRef = db.collection("students").doc(String(sourceId || ""));
  if (!keepId || !sourceId || keepId === sourceId) throw Object.assign(new Error("Two different student cards required"), { status: 400 });
  const [keepSnap, sourceSnap] = await Promise.all([keepRef.get(), sourceRef.get()]);
  if (!keepSnap.exists || !sourceSnap.exists) throw Object.assign(new Error("Student card not found"), { status: 404 });
  const keep = keepSnap.data();
  const source = sourceSnap.data();
  if (source.mergedInto) throw Object.assign(new Error("This card is already merged"), { status: 409 });

  const plan = await mergePlan(db, sourceId);
  const moving = plan.filter((p) => p.kind === "learner" || (p.kind === "finance" && includeFinance) || (p.kind === "schedule" && includeSchedule));
  // one pet per learner: the kept card's pet wins
  const keepPet = await db.collection("petProfiles").where("studentId", "==", keepId).limit(1).get().catch(() => null);
  const skipped = [];
  const steps = moving.map((p) => {
    if (p.collection === "petProfiles" && keepPet?.size) { skipped.push({ ...p, reason: "kept card already has a pet" }); return null; }
    return p;
  }).filter(Boolean);
  const summary = {
    keep: { id: keepId, name: keep.name || "", accounts: accountIds(keep) },
    source: { id: sourceId, name: source.name || "", accounts: accountIds(source) },
    move: steps.map(({ collection, field, count, kind }) => ({ collection, field, count, kind })),
    waiting: plan.filter((p) => !moving.includes(p)).map(({ collection, field, count, kind }) => ({ collection, field, count, kind })),
    skipped: skipped.map(({ collection, count, reason }) => ({ collection, count, reason })),
  };
  if (!apply) return { ...summary, applied: false };

  // re-point the records in batches
  let batch = db.batch();
  let n = 0;
  const flush = async () => { if (n) { await batch.commit(); batch = db.batch(); n = 0; } };
  for (const step of steps) {
    for (const ref of step.refs) {
      if (step.field === "studentId") batch.update(ref, { studentId: keepId, mergedFromStudentId: sourceId });
      else batch.update(ref, { studentIds: FieldValue.arrayUnion(keepId) });
      n += 1;
      if (n >= BATCH) await flush();
    }
  }
  await flush();
  for (const step of steps.filter((s) => s.field === "studentIds")) {
    for (const ref of step.refs) { batch.update(ref, { studentIds: FieldValue.arrayRemove(sourceId) }); n += 1; if (n >= BATCH) await flush(); }
  }
  await flush();

  // the account and contacts go to the kept card; the other card is closed
  const accounts = ids(accountIds(keep), accountIds(source));
  const parents = ids(parentIds(keep), parentIds(source));
  const keepPatch = {
    linkedUserIds: accounts,
    ...(accounts.length ? { linkedUserId: keep.linkedUserId || source.linkedUserId || accounts[0], studentUid: keep.studentUid || source.studentUid || accounts[0] } : {}),
    ...(parents.length ? { linkedParentIds: parents, linkedParentId: keep.linkedParentId || source.linkedParentId || parents[0] } : {}),
    ...(!keep.email && source.email ? { email: source.email } : {}),
    ...(!keep.phone && source.phone ? { phone: source.phone } : {}),
    mergedStudentIds: FieldValue.arrayUnion(sourceId),
    updatedAt: nowIso,
  };
  const write = db.batch();
  write.set(keepRef, keepPatch, { merge: true });
  write.set(sourceRef, {
    active: false, mergedInto: keepId, mergedAt: nowIso, mergedBy: actor,
    linkedUserId: "", studentUid: "", linkedUserIds: [], linkedParentId: "", linkedParentIds: [], updatedAt: nowIso,
  }, { merge: true });
  for (const uid of accountIds(source)) {
    write.set(db.collection("users").doc(uid), { linkedStudentIds: FieldValue.arrayUnion(keepId), updatedAt: nowIso }, { merge: true });
  }
  write.set(db.collection("activityLog").doc(), {
    type: "student.cards_merged", action: "student.cards_merged", studentId: keepId, mergedFromStudentId: sourceId,
    studentName: keep.name || "", mergedName: source.name || "", moved: summary.move, actor, createdAt: nowIso,
  });
  await write.commit();
  // the closed card's id leaves the accounts' lists after the kept one is in
  const clean = db.batch();
  for (const uid of accountIds(source)) clean.set(db.collection("users").doc(uid), { linkedStudentIds: FieldValue.arrayRemove(sourceId) }, { merge: true });
  await clean.commit();
  return { ...summary, applied: true };
}

module.exports = { mergeStudentCards, mergePlan, FINANCE, SCHEDULE };
