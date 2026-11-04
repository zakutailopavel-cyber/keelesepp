"use strict";
// „Hetk” marks of live lessons (`lessonMoments/{id}`) against the real Firestore rules: only the lesson's teacher
// (the invitation's teacherUid) or an admin writes and reads them, only the label changes later; the student, a
// parent-like outsider and another teacher have no access.
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
    body: JSON.stringify({ email: `moments-${role}-${Date.now()}-${Math.random().toString(36).slice(2)}@example.com`, password: "emulator-only-password", returnSecureToken: true }),
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
const fieldsOf = (data) => Object.fromEntries(Object.entries(data).map(([k, v]) => [k, encode(v)]));
const create = (path, data) => ({ update: { name: name(path), fields: fieldsOf(data) }, currentDocument: { exists: false } });
const patch = (path, data) => ({ update: { name: name(path), fields: fieldsOf(data) }, updateMask: { fieldPaths: Object.keys(data) }, currentDocument: { exists: true } });
const remove = (path) => ({ delete: name(path) });
async function commit(who, writes) {
  const response = await fetch(`http://${DB}/v1/projects/${PROJECT_ID}/databases/(default)/documents:commit`, {
    method: "POST", headers: { Authorization: `Bearer ${who.token}`, "Content-Type": "application/json" }, body: JSON.stringify({ writes }),
  });
  return response.status;
}
async function read(who, path) {
  return (await fetch(`http://${DB}/v1/projects/${PROJECT_ID}/databases/(default)/documents/${path}`, { headers: { Authorization: `Bearer ${who.token}` } })).status;
}

test("only the lesson's teacher or an admin marks moments; the student has no access", async () => {
  safe();
  if (!admin.apps.length) admin.initializeApp({ projectId: PROJECT_ID });
  const db = admin.firestore();
  const [teacher, other, adminUser, student] = await Promise.all([account("teacher", db), account("teacher", db), account("admin", db), account("student", db)]);
  const suffix = Math.random().toString(36).slice(2);
  const inv = `inv-moments-${suffix}`;
  await db.doc(`liveLessonInvitations/${inv}`).set({ teacherUid: teacher.uid, studentUid: student.uid, studentId: "s-moments", roomKey: inv, status: "accepted", title: "Tund" });
  const at = "2026-11-04T10:15:00.000Z";
  const moment = (by, extra = {}) => ({
    invitationId: inv, recordingId: `${inv}_1762250000000`, teacherUid: teacher.uid, studentId: "s-moments",
    atMs: 754000, at, label: "", byUid: by.uid, byName: "Kati", createdAt: at, ...extra,
  });
  const id = (n) => `moment-${suffix}-${n}`;

  // the teacher, with and without a running recording
  assert.equal(await commit(teacher, [create(`lessonMoments/${id(1)}`, moment(teacher))]), 200, "the teacher marks a recorded moment");
  assert.equal(await commit(teacher, [create(`lessonMoments/${id(2)}`, moment(teacher, { recordingId: "", atMs: null }))]), 200, "no recording: clock time only");
  assert.equal(await commit(teacher, [create(`lessonMoments/${id(3)}`, moment(teacher, { label: "hea lause" }))]), 200, "with a label");
  // an admin marks in the teacher's lesson
  assert.equal(await commit(adminUser, [create(`lessonMoments/${id(4)}`, moment(adminUser))]), 200, "an admin");

  // what is refused
  assert.equal(await commit(other, [create(`lessonMoments/${id(5)}`, moment(other))]), 403, "another teacher");
  assert.equal(await commit(other, [create(`lessonMoments/${id(5)}`, moment(other, { teacherUid: other.uid }))]), 403, "another teacher as the lesson's teacher");
  assert.equal(await commit(student, [create(`lessonMoments/${id(5)}`, moment(student))]), 403, "the student");
  assert.equal(await commit(teacher, [create(`lessonMoments/${id(5)}`, moment(other))]), 403, "byUid = the writer");
  assert.equal(await commit(teacher, [create(`lessonMoments/${id(5)}`, moment(teacher, { studentId: "s-other" }))]), 403, "the invitation's student");
  assert.equal(await commit(teacher, [create(`lessonMoments/${id(5)}`, moment(teacher, { invitationId: `inv-none-${suffix}`, recordingId: "", atMs: null }))]), 403, "no such lesson");
  assert.equal(await commit(teacher, [create(`lessonMoments/${id(5)}`, moment(teacher, { recordingId: "other_1" }))]), 403, "a recording of another lesson");
  assert.equal(await commit(teacher, [create(`lessonMoments/${id(5)}`, moment(teacher, { recordingId: "" }))]), 403, "an offset needs its recording");
  assert.equal(await commit(teacher, [create(`lessonMoments/${id(5)}`, moment(teacher, { atMs: -1 }))]), 403, "no negative offset");
  assert.equal(await commit(teacher, [create(`lessonMoments/${id(5)}`, moment(teacher, { label: "x".repeat(81) }))]), 403, "label at most 80");
  assert.equal(await commit(teacher, [create(`lessonMoments/${id(5)}`, moment(teacher, { extra: 1 }))]), 403, "unknown key");

  // reading: the teacher and admins only
  assert.equal(await read(teacher, `lessonMoments/${id(1)}`), 200);
  assert.equal(await read(adminUser, `lessonMoments/${id(1)}`), 200);
  assert.equal(await read(student, `lessonMoments/${id(1)}`), 403, "the student never sees it");
  assert.equal(await read(other, `lessonMoments/${id(1)}`), 403, "another teacher");

  // only the label changes later
  assert.equal(await commit(teacher, [patch(`lessonMoments/${id(1)}`, { label: "vaata see üle" })]), 200, "the teacher labels it");
  assert.equal(await commit(adminUser, [patch(`lessonMoments/${id(1)}`, { label: "admin" })]), 200, "an admin labels it");
  assert.equal(await commit(teacher, [patch(`lessonMoments/${id(1)}`, { atMs: 1 })]), 403, "not the time");
  assert.equal(await commit(teacher, [patch(`lessonMoments/${id(1)}`, { label: "y".repeat(81) })]), 403, "label at most 80");
  assert.equal(await commit(student, [patch(`lessonMoments/${id(1)}`, { label: "õpilane" })]), 403, "the student");
  assert.equal(await commit(other, [patch(`lessonMoments/${id(1)}`, { label: "teine" })]), 403, "another teacher");

  // deleting a wrong mark
  assert.equal(await commit(student, [remove(`lessonMoments/${id(3)}`)]), 403, "the student");
  assert.equal(await commit(other, [remove(`lessonMoments/${id(3)}`)]), 403, "another teacher");
  assert.equal(await commit(teacher, [remove(`lessonMoments/${id(3)}`)]), 200, "the teacher");
  assert.equal(await commit(adminUser, [remove(`lessonMoments/${id(2)}`)]), 200, "an admin");
  assert.equal((await db.doc(`lessonMoments/${id(1)}`).get()).get("label"), "admin");
});

test("group room: one moment per student, keyed by the room; only the room's teacher or an admin", async () => {
  safe();
  if (!admin.apps.length) admin.initializeApp({ projectId: PROJECT_ID });
  const db = admin.firestore();
  const [teacher, other, adminUser, student] = await Promise.all([account("teacher", db), account("teacher", db), account("admin", db), account("student", db)]);
  const suffix = Math.random().toString(36).slice(2);
  const roomId = `room-moments-${suffix}`;
  const otherRoom = `room-other-${suffix}`;
  const invMari = `inv-gm-${suffix}`;
  const invJaan = `inv-gj-${suffix}`;
  const inv1to1 = `inv-g1-${suffix}`;
  await db.doc(`liveGroupRooms/${roomId}`).set({ teacherUid: teacher.uid, teacherName: "Kati", title: "Grupp", memberUids: [student.uid], members: [], status: "open", createdAt: new Date(), closedAt: null });
  await db.doc(`liveGroupRooms/${otherRoom}`).set({ teacherUid: other.uid, teacherName: "Teine", title: "Grupp", memberUids: [], members: [], status: "open", createdAt: new Date(), closedAt: null });
  await db.doc(`liveLessonInvitations/${invMari}`).set({ teacherUid: teacher.uid, studentUid: student.uid, studentId: "s-mari", roomKey: roomId, status: "accepted", title: "Grupp" });
  await db.doc(`liveLessonInvitations/${invJaan}`).set({ teacherUid: teacher.uid, studentUid: "u-jaan", studentId: "s-jaan", roomKey: roomId, status: "accepted", title: "Grupp" });
  await db.doc(`liveLessonInvitations/${inv1to1}`).set({ teacherUid: teacher.uid, studentUid: student.uid, studentId: "s-mari", roomKey: inv1to1, status: "accepted", title: "Tund" });
  const at = "2026-11-04T16:05:00.000Z";
  const moment = (by, inv, studentId, extra = {}) => ({
    invitationId: inv, recordingId: "", teacherUid: teacher.uid, studentId, atMs: null, at, label: "", byUid: by.uid, byName: "Kati", createdAt: at, groupRoomId: roomId, ...extra,
  });
  const id = (n) => `gmoment-${suffix}-${n}`;

  // one press = a batch of one moment per student (one with its recording)
  assert.equal(await commit(teacher, [
    create(`lessonMoments/${id(1)}`, moment(teacher, invMari, "s-mari", { recordingId: `${invMari}_1762272000000`, atMs: 300000 })),
    create(`lessonMoments/${id(2)}`, moment(teacher, invJaan, "s-jaan")),
  ]), 200, "the room's teacher marks both students at once");
  assert.equal(await commit(adminUser, [create(`lessonMoments/${id(3)}`, moment(adminUser, invMari, "s-mari"))]), 200, "an admin");

  // refused
  assert.equal(await commit(teacher, [create(`lessonMoments/${id(4)}`, moment(teacher, inv1to1, "s-mari"))]), 403, "a 1:1 invitation with a group room id");
  assert.equal(await commit(teacher, [create(`lessonMoments/${id(4)}`, moment(teacher, invMari, "s-mari", { groupRoomId: otherRoom }))]), 403, "another room");
  assert.equal(await commit(teacher, [create(`lessonMoments/${id(4)}`, moment(teacher, invMari, "s-mari", { groupRoomId: `room-none-${suffix}` }))]), 403, "no such room");
  assert.equal(await commit(teacher, [create(`lessonMoments/${id(4)}`, moment(teacher, invMari, "s-mari", { groupRoomId: 5 }))]), 403, "room id is a string");
  assert.equal(await commit(other, [create(`lessonMoments/${id(4)}`, moment(other, invMari, "s-mari", { teacherUid: other.uid }))]), 403, "another teacher");
  assert.equal(await commit(student, [create(`lessonMoments/${id(4)}`, moment(student, invMari, "s-mari"))]), 403, "a student of the room");
  assert.equal(await commit(teacher, [
    create(`lessonMoments/${id(5)}`, moment(teacher, invMari, "s-mari")),
    create(`lessonMoments/${id(6)}`, moment(teacher, invJaan, "s-mari")),
  ]), 403, "the batch is all or none (wrong student on one)");
  assert.equal((await db.doc(`lessonMoments/${id(5)}`).get()).exists, false);

  // a 1:1 moment still works without the field
  const plain = moment(teacher, inv1to1, "s-mari");
  delete plain.groupRoomId;
  assert.equal(await commit(teacher, [create(`lessonMoments/${id(7)}`, plain)]), 200, "1:1 unchanged");

  // reading / label / delete as before
  assert.equal(await read(teacher, `lessonMoments/${id(2)}`), 200);
  assert.equal(await read(student, `lessonMoments/${id(1)}`), 403, "the students never see them");
  assert.equal(await read(other, `lessonMoments/${id(1)}`), 403);
  assert.equal(await commit(teacher, [patch(`lessonMoments/${id(1)}`, { label: "hea dialoog" }), patch(`lessonMoments/${id(2)}`, { label: "hea dialoog" })]), 200, "label on all");
  assert.equal(await commit(teacher, [patch(`lessonMoments/${id(1)}`, { groupRoomId: otherRoom })]), 403, "the room never changes");
  assert.equal(await commit(teacher, [remove(`lessonMoments/${id(1)}`), remove(`lessonMoments/${id(2)}`)]), 200, "„Kustuta hetk” removes all");
});
