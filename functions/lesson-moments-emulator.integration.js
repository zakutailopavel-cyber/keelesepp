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
