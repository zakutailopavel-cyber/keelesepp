"use strict";

// Live Classroom guest link (owner, 2026-10-11): a student without a login of their own (a child registered by a
// parent, a new learner) joins a one-to-one lesson by a link. The teacher's „Loo tunnilink” creates a pending
// invitation for the card plus a secret token; whoever opens the link gets a short-lived sign-in (custom token, uid
// `guest_…`) that the server writes into the invitation as its studentUid and into liveGuestGrants/{uid}. The rules
// then allow exactly this lesson: the invitation's room (signals, presence, strokes), the card's board and the
// worksheets opened in this room — nothing else of the card. The link dies with the invitation (cancelled, closed)
// and at the end of the lesson day (Europe/Tallinn).

const crypto = require("crypto");

const TOKEN_BYTES = 24;
const MIN_LIFETIME_MS = 3 * 3600_000;
const USABLE = new Set(["pending", "accepted"]);

const newToken = () => crypto.randomBytes(TOKEN_BYTES).toString("base64url");
const tokenHash = (token) => crypto.createHash("sha256").update(String(token || "")).digest("hex");
const validTokenShape = (token) => /^[A-Za-z0-9_-]{24,64}$/.test(String(token || ""));

// end of the lesson day in Tallinn, but at least a few hours (a link made late in the evening still works)
function guestExpiry(nowMs) {
  const parts = Object.fromEntries(new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Tallinn", hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit",
  }).formatToParts(new Date(nowMs)).filter((part) => part.type !== "literal").map((part) => [part.type, Number(part.value)]));
  const sinceMidnight = ((parts.hour % 24) * 3600 + parts.minute * 60 + parts.second) * 1000;
  return Math.max(nowMs + (86_400_000 - sinceMidnight), nowMs + MIN_LIFETIME_MS);
}

const accountIds = (s = {}) => [s.linkedUserId, s.studentUid, ...(Array.isArray(s.linkedUserIds) ? s.linkedUserIds : [])]
  .map((value) => String(value || "").trim()).filter(Boolean);

function teacherMayInvite(student = {}, actor = {}) {
  if (actor.isAdmin) return true;
  const uid = actor.uid;
  return Boolean(uid) && (student.teacherUid === uid || (Array.isArray(student.teacherUids) && student.teacherUids.includes(uid)));
}

function cleanText(value, max = 160) {
  return String(value || "").replace(/\s+/g, " ").trim().slice(0, max);
}

// the link the teacher copies; only the CRM's own origins
function guestUrl(origin, token, allowed) {
  const base = allowed(origin) ? String(origin).replace(/\/$/, "") : "https://crm.epkoolitus.ee";
  return `${base}/tund/${token}`;
}

async function createGuestLink({ db, Timestamp, FieldValue, actor, studentId, title, origin, originAllowed, nowMs = Date.now() }) {
  const id = cleanText(studentId, 200);
  if (!id) throw Object.assign(new Error("Vali õpilane."), { status: 400 });
  const snap = await db.collection("students").doc(id).get();
  if (!snap.exists) throw Object.assign(new Error("Õpilast ei leitud."), { status: 404 });
  const student = snap.data();
  if (student.active === false) throw Object.assign(new Error("Õpilane on arhiveeritud."), { status: 409 });
  if (!teacherMayInvite(student, actor)) throw Object.assign(new Error("Õpilane ei ole sulle määratud."), { status: 403 });
  const token = newToken();
  const expiresAt = Timestamp.fromMillis(guestExpiry(nowMs));
  const reference = db.collection("liveLessonInvitations").doc();
  const url = guestUrl(origin, token, originAllowed);
  const batch = db.batch();
  batch.set(reference, {
    teacherUid: actor.uid,
    teacherName: cleanText(actor.name) || "Õpetaja",
    studentId: id,
    studentUid: "",
    studentName: cleanText(student.name) || "Õpilane",
    title: cleanText(title) || cleanText(student.subject) || "Tund",
    status: "pending",
    roomKey: reference.id,
    createdAt: FieldValue.serverTimestamp(),
    createdAtIso: new Date(nowMs).toISOString(),
    expiresAt,
    respondedAt: null,
    cancelledAt: null,
    closedAt: null,
    guestLink: true,
    guestUrl: url,
  });
  batch.set(db.collection("liveGuestLinks").doc(tokenHash(token)), {
    invitationId: reference.id,
    studentId: id,
    teacherUid: actor.uid,
    expiresAt,
    createdAt: FieldValue.serverTimestamp(),
  });
  await batch.commit();
  return { invitationId: reference.id, url, expiresAt: expiresAt.toMillis() };
}

// `guestUid`: the uid of an earlier guest sign-in on this browser (verified ID token) — the same browser keeps its uid
async function joinGuestLink({ db, Timestamp, FieldValue, auth, token, guestUid = "", nowMs = Date.now() }) {
  if (!validTokenShape(token)) throw Object.assign(new Error("Tunnilink ei ole õige."), { status: 400 });
  const linkRef = db.collection("liveGuestLinks").doc(tokenHash(token));
  const link = await linkRef.get();
  if (!link.exists) throw Object.assign(new Error("Tunnilinki ei leitud. Palu õpetajalt uus link."), { status: 404 });
  const data = link.data();
  if (data.expiresAt.toMillis() <= nowMs) throw Object.assign(new Error("Tunnilink on aegunud. Palu õpetajalt uus link."), { status: 410 });
  const invitationRef = db.collection("liveLessonInvitations").doc(data.invitationId);
  const uid = /^guest_[A-Za-z0-9_-]{8,60}$/.test(guestUid) ? guestUid : `guest_${crypto.randomBytes(12).toString("hex")}`;
  const invitation = await db.runTransaction(async (tx) => {
    const snap = await tx.get(invitationRef);
    if (!snap.exists) throw Object.assign(new Error("Tundi ei leitud."), { status: 404 });
    const current = snap.data();
    if (!USABLE.has(current.status)) throw Object.assign(new Error(current.status === "closed" ? "Tund on lõppenud." : "Õpetaja tühistas selle tunni."), { status: 410 });
    const previous = String(current.studentUid || "");
    const patch = { studentUid: uid };
    if (current.status === "pending") Object.assign(patch, { status: "accepted", respondedAt: FieldValue.serverTimestamp() });
    tx.update(invitationRef, patch);
    tx.set(db.collection("liveGuestGrants").doc(uid), {
      invitationId: invitationRef.id,
      studentId: current.studentId,
      teacherUid: current.teacherUid,
      expiresAt: data.expiresAt,
      grantedAt: FieldValue.serverTimestamp(),
    });
    // another device took the link over: the earlier guest loses the lesson
    if (previous && previous !== uid && previous.startsWith("guest_")) tx.delete(db.collection("liveGuestGrants").doc(previous));
    return { ...current, ...patch };
  });
  const signInToken = await auth.createCustomToken(uid, { liveGuest: true, liveInvitationId: invitationRef.id });
  return {
    token: signInToken,
    uid,
    invitationId: invitationRef.id,
    studentName: cleanText(invitation.studentName) || "Õpilane",
    teacherName: cleanText(invitation.teacherName) || "Õpetaja",
    title: cleanText(invitation.title) || "Tund",
    expiresAt: data.expiresAt.toMillis(),
  };
}

module.exports = { accountIds, createGuestLink, guestExpiry, guestUrl, joinGuestLink, newToken, teacherMayInvite, tokenHash, validTokenShape };
