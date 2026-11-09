"use strict";

// The trigger of live-auto-mark-core.js: a Live Classroom invitation goes accepted → closed with `endMark: 'held'` →
// the calendar lesson is marked held on the server, in one transaction, idempotent (the lesson document id is the
// calendar's own; an existing record, a record of that student that day, a closed financial day or an archived card
// stops it). The result is written back to the invitation as `autoMark` (status + reason) for support.
const functions = require("firebase-functions/v1");
const admin = require("firebase-admin");
const core = require("./live-auto-mark-core");

const LOCKED = "financialLockedDates";

/**
 * One closed room. `db` is injectable for tests. → { status: 'marked' | 'skipped', reason, lessonId? }
 */
async function autoMarkClosedRoom({ db, invitationId, before, after, now = new Date() }) {
  if (after?.status !== "closed" || before?.status === "closed") return { status: "skipped", reason: "not-closing" };
  const entriesSnap = after.studentId ? await db.collection("schedule").where("studentId", "==", after.studentId).get() : { docs: [] };
  const entries = entriesSnap.docs.map((item) => ({ id: item.id, ...item.data() }));
  const found = core.resolveOccurrence({ invitationId, before, after, entries });
  if (!found.ok) return { status: "skipped", reason: found.reason };
  const { entry, occurrenceDate } = found;
  const lessonId = core.lessonDocumentId(entry.id, occurrenceDate, entry.studentId);
  const nowIso = now.toISOString();
  return db.runTransaction(async (transaction) => {
    const lessonRef = db.collection("lessons").doc(lessonId);
    const [lessonSnap, lockSnap, studentSnap, sameDaySnap, summarySnap] = await Promise.all([
      transaction.get(lessonRef),
      transaction.get(db.collection(LOCKED).doc(occurrenceDate)),
      transaction.get(db.collection("students").doc(entry.studentId)),
      transaction.get(db.collection("lessons").where("studentId", "==", entry.studentId).where("date", "==", occurrenceDate)),
      transaction.get(db.collection("lessonSummaries").doc(invitationId)),
    ]);
    if (lessonSnap.exists) return { status: "skipped", reason: "already-marked", lessonId };
    if (lockSnap.exists) return { status: "skipped", reason: "period-closed" };
    const student = studentSnap.exists ? studentSnap.data() : null;
    if (!student || student.active === false || student.deletedAt || student.purgedAt) return { status: "skipped", reason: "student-archived" };
    if (core.alreadyMarked({ entry, occurrenceDate, records: sameDaySnap.docs.map((item) => item.data()) })) return { status: "skipped", reason: "already-marked" };
    const record = core.lessonRecord({ entry, occurrenceDate, invitationId, invitation: after, note: summarySnap.exists ? summarySnap.data().note : "", nowIso });
    transaction.set(lessonRef, record);
    if (!entry.recurring) transaction.set(db.collection("schedule").doc(entry.id), { status: record.status, updatedAtIso: nowIso }, { merge: true });
    transaction.set(db.collection("activityLog").doc(), core.activityRecord({ record, lessonId, nowIso }));
    return { status: "marked", reason: "", lessonId };
  });
}

exports.autoMarkClosedRoom = autoMarkClosedRoom;

exports.autoMarkLiveLesson = functions.firestore
  .document("liveLessonInvitations/{invitationId}")
  .onUpdate(async (change, context) => {
    const before = change.before.data() || {};
    const after = change.after.data() || {};
    // only the moment the room closes (our own `autoMark` write below does not re-run it)
    if (after.status !== "closed" || before.status === "closed") return null;
    const db = admin.firestore();
    try {
      const result = await autoMarkClosedRoom({ db, invitationId: context.params.invitationId, before, after });
      await change.after.ref.set({ autoMark: { ...result, at: new Date().toISOString() } }, { merge: true });
    } catch (error) {
      console.error(`Live auto-mark failed for ${context.params.invitationId}:`, error.message);
      await change.after.ref.set({ autoMark: { status: "failed", reason: String(error.message || error).slice(0, 200), at: new Date().toISOString() } }, { merge: true }).catch(() => {});
    }
    return null;
  });
