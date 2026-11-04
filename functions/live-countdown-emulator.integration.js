"use strict";
// Live Classroom countdown timer (`countdown` on liveLessonInvitations / liveGroupRooms) against the real Firestore
// rules: only the room's teacher writes, only that one field, only while the room is live, `updatedAt` = server time;
// the student of the room reads it.
const test = require("node:test");
const assert = require("node:assert/strict");
const admin = require("firebase-admin");

const PROJECT_ID = "demo-keelesepp-finance";
const AUTH = process.env.FIREBASE_AUTH_EMULATOR_HOST;
const DB = process.env.FIRESTORE_EMULATOR_HOST;
const name = (path) => `projects/${PROJECT_ID}/databases/(default)/documents/${path}`;

function safe() {
  assert.equal(process.env.GCLOUD_PROJECT || process.env.GOOGLE_CLOUD_PROJECT, PROJECT_ID);
  assert.match(AUTH || "", /^(127\.0\.0\.1|localhost):\d+$/);
  assert.match(DB || "", /^(127\.0\.0\.1|localhost):\d+$/);
}
async function account(role, db) {
  const response = await fetch(`http://${AUTH}/identitytoolkit.googleapis.com/v1/accounts:signUp?key=demo`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: `countdown-${role}-${Date.now()}-${Math.random().toString(36).slice(2)}@example.com`, password: "emulator-only-password", returnSecureToken: true }),
  });
  const body = await response.json();
  const uid = JSON.parse(Buffer.from(body.idToken.split(".")[1], "base64url")).sub;
  await db.doc(`users/${uid}`).set({ role });
  return { token: body.idToken, uid };
}
function encode(value) {
  if (value === null) return { nullValue: null };
  if (Array.isArray(value)) return { arrayValue: { values: value.map(encode) } };
  if (typeof value === "boolean") return { booleanValue: value };
  if (typeof value === "number") return Number.isInteger(value) ? { integerValue: String(value) } : { doubleValue: value };
  if (typeof value === "object") return { mapValue: { fields: Object.fromEntries(Object.entries(value).map(([k, v]) => [k, encode(v)])) } };
  return { stringValue: String(value) };
}
// an update of the given fields only (like the client's updateDoc); `countdown.updatedAt` = server time unless `stamp: false`
function patch(path, fields, { stamp = true } = {}) {
  return {
    update: { name: name(path), fields: Object.fromEntries(Object.entries(fields).map(([k, v]) => [k, encode(v)])) },
    updateMask: { fieldPaths: Object.keys(fields) },
    currentDocument: { exists: true },
    ...(stamp && fields.countdown ? { updateTransforms: [{ fieldPath: "countdown.updatedAt", setToServerValue: "REQUEST_TIME" }] } : {}),
  };
}
async function commit(who, writes) {
  const response = await fetch(`http://${DB}/v1/projects/${PROJECT_ID}/databases/(default)/documents:commit`, {
    method: "POST", headers: { Authorization: `Bearer ${who.token}`, "Content-Type": "application/json" }, body: JSON.stringify({ writes }),
  });
  return response.status;
}
async function read(who, path) {
  return (await fetch(`http://${DB}/v1/projects/${PROJECT_ID}/databases/(default)/documents/${path}`, { headers: { Authorization: `Bearer ${who.token}` } })).status;
}
const timer = (by, extra = {}) => ({ running: true, remainingMs: 180000, durationMs: 180000, label: "Loe tekst", by, ...extra });

test("only the room's teacher sets the countdown, only that field; the students read it", async () => {
  safe();
  if (!admin.apps.length) admin.initializeApp({ projectId: PROJECT_ID });
  const db = admin.firestore();
  const [teacher, other, student, outsider] = await Promise.all([account("teacher", db), account("teacher", db), account("student", db), account("student", db)]);
  const suffix = Math.random().toString(36).slice(2);
  const inv = `inv-countdown-${suffix}`;
  const closedInv = `inv-countdown-closed-${suffix}`;
  const group = `room-countdown-${suffix}`;
  const closedGroup = `room-countdown-closed-${suffix}`;
  await db.doc(`liveLessonInvitations/${inv}`).set({ teacherUid: teacher.uid, studentUid: student.uid, studentId: "s1", roomKey: inv, status: "accepted", title: "Tund" });
  await db.doc(`liveLessonInvitations/${closedInv}`).set({ teacherUid: teacher.uid, studentUid: student.uid, studentId: "s1", roomKey: closedInv, status: "closed", title: "Tund" });
  await db.doc(`liveGroupRooms/${group}`).set({ teacherUid: teacher.uid, memberUids: [student.uid], members: [{ studentUid: student.uid }], status: "open", title: "Grupp", createdAt: admin.firestore.Timestamp.now(), closedAt: null });
  await db.doc(`liveGroupRooms/${closedGroup}`).set({ teacherUid: teacher.uid, memberUids: [student.uid], members: [{ studentUid: student.uid }], status: "closed", title: "Grupp" });

  // 1:1 room
  assert.equal(await commit(teacher, [patch(`liveLessonInvitations/${inv}`, { countdown: timer(teacher.uid) })]), 200, "the teacher starts");
  assert.equal(await commit(teacher, [patch(`liveLessonInvitations/${inv}`, { countdown: timer(teacher.uid, { running: false, remainingMs: 95000 }) })]), 200, "pause");
  assert.equal(await commit(teacher, [patch(`liveLessonInvitations/${inv}`, { countdown: null })]), 200, "stop");
  assert.equal(await commit(teacher, [patch(`liveLessonInvitations/${inv}`, { countdown: timer(teacher.uid) }, { stamp: false })]), 403, "updatedAt must be the server time");
  assert.equal(await commit(teacher, [patch(`liveLessonInvitations/${inv}`, { countdown: { ...timer(teacher.uid), updatedAt: "2026-11-04T16:00:00Z" } }, { stamp: false })]), 403, "no client time");
  assert.equal(await commit(teacher, [patch(`liveLessonInvitations/${inv}`, { countdown: timer(other.uid) })]), 403, "by = the writer");
  assert.equal(await commit(teacher, [patch(`liveLessonInvitations/${inv}`, { countdown: timer(teacher.uid, { remainingMs: 7200001 }) })]), 403, "at most two hours");
  assert.equal(await commit(teacher, [patch(`liveLessonInvitations/${inv}`, { countdown: timer(teacher.uid, { remainingMs: 1.5 }) })]), 403, "whole ms");
  assert.equal(await commit(teacher, [patch(`liveLessonInvitations/${inv}`, { countdown: timer(teacher.uid, { extra: 1 }) })]), 403, "unknown key");
  assert.equal(await commit(teacher, [patch(`liveLessonInvitations/${inv}`, { countdown: timer(teacher.uid), title: "Muu" })]), 403, "only the countdown field");
  assert.equal(await commit(teacher, [patch(`liveLessonInvitations/${inv}`, { status: "closed", countdown: timer(teacher.uid) })]), 403, "not with the status");
  assert.equal(await commit(other, [patch(`liveLessonInvitations/${inv}`, { countdown: timer(other.uid) })]), 403, "another teacher");
  assert.equal(await commit(student, [patch(`liveLessonInvitations/${inv}`, { countdown: timer(student.uid) })]), 403, "the student");
  assert.equal(await commit(teacher, [patch(`liveLessonInvitations/${closedInv}`, { countdown: timer(teacher.uid) })]), 403, "a closed lesson");
  assert.equal(await commit(teacher, [patch(`liveLessonInvitations/${inv}`, { countdown: timer(teacher.uid) })]), 200);
  assert.equal(await read(student, `liveLessonInvitations/${inv}`), 200, "the student reads the timer with the invitation");
  assert.equal(await read(outsider, `liveLessonInvitations/${inv}`), 403);
  const stored = (await db.doc(`liveLessonInvitations/${inv}`).get()).get("countdown");
  assert.equal(stored.remainingMs, 180000);
  assert.ok(stored.updatedAt.toMillis() > Date.now() - 60000, "server time");

  // group room
  assert.equal(await commit(teacher, [patch(`liveGroupRooms/${group}`, { countdown: timer(teacher.uid) })]), 200, "the group's teacher");
  assert.equal(await commit(teacher, [patch(`liveGroupRooms/${group}`, { countdown: timer(teacher.uid), title: "Muu" })]), 403, "only the countdown field");
  assert.equal(await commit(student, [patch(`liveGroupRooms/${group}`, { countdown: timer(student.uid) })]), 403, "a member");
  assert.equal(await commit(other, [patch(`liveGroupRooms/${group}`, { countdown: timer(other.uid) })]), 403, "another teacher");
  assert.equal(await commit(teacher, [patch(`liveGroupRooms/${closedGroup}`, { countdown: timer(teacher.uid) })]), 403, "a closed group room");
  assert.equal(await read(student, `liveGroupRooms/${group}`), 200, "members read it");
  // the old updates still work with a countdown on the doc
  assert.equal(await commit(teacher, [patch(`liveGroupRooms/${group}`, { title: "Grupp 2" })]), 200, "the teacher renames the room");
});
