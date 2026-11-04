"use strict";
// „Keeleoskus” curve (crm-v2/src/services/firebase/progressPoints.js) against the real rules: `progressPoints/{id}` is
// written only by an admin or the student's teacher (a teacher changes / deletes his own), read by them, the student
// and a linked parent; another teacher and an outsider neither read nor write; the parent and the student never write.
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
    body: JSON.stringify({ email: `pp-${role}-${Date.now()}-${Math.random().toString(36).slice(2)}@example.com`, password: "emulator-only-password", returnSecureToken: true }),
  });
  const body = await response.json();
  const uid = JSON.parse(Buffer.from(body.idToken.split(".")[1], "base64url")).sub;
  await db.doc(`users/${uid}`).set({ role, displayName: `PP ${role}` });
  return { token: body.idToken, uid };
}
function encode(value) {
  if (value === null) return { nullValue: null };
  if (typeof value === "boolean") return { booleanValue: value };
  if (typeof value === "number") return Number.isInteger(value) ? { integerValue: String(value) } : { doubleValue: value };
  return { stringValue: String(value) };
}
const fields = (data) => Object.fromEntries(Object.entries(data).map(([k, v]) => [k, encode(v)]));
async function commit(who, writes) {
  const response = await fetch(`http://${DB}/v1/projects/${PROJECT_ID}/databases/(default)/documents:commit`, {
    method: "POST", headers: { Authorization: `Bearer ${who.token}`, "Content-Type": "application/json" }, body: JSON.stringify({ writes }),
  });
  return response.status;
}
const create = (path, data) => ({ update: { name: name(path), fields: fields(data) }, currentDocument: { exists: false } });
const change = (path, data) => ({ update: { name: name(path), fields: fields(data) }, updateMask: { fieldPaths: Object.keys(data) }, currentDocument: { exists: true } });
const remove = (path) => ({ delete: name(path) });
async function read(who, path) {
  return (await fetch(`http://${DB}/v1/projects/${PROJECT_ID}/databases/(default)/documents/${path}`, { headers: { Authorization: `Bearer ${who.token}` } })).status;
}
async function list(who, studentId) {
  const response = await fetch(`http://${DB}/v1/projects/${PROJECT_ID}/databases/(default)/documents:runQuery`, {
    method: "POST", headers: { Authorization: `Bearer ${who.token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ structuredQuery: { from: [{ collectionId: "progressPoints" }], where: { fieldFilter: { field: { fieldPath: "studentId" }, op: "EQUAL", value: { stringValue: studentId } } } } }),
  });
  const body = await response.json().catch(() => []);
  return { status: response.status, count: Array.isArray(body) ? body.filter((row) => row.document).length : 0 };
}

const point = (who, studentId, extra = {}) => ({ studentId, date: "2026-11-04", level: "B1", percent: 62, kind: "teacher", label: "", createdBy: who.uid, createdByName: "Õpetaja", createdAt: "2026-11-04T10:00:00.000Z", updatedAt: "2026-11-04T10:00:00.000Z", ...extra });

test("progressPoints: admin and the student's teacher write; student and linked parent read; others nothing", async () => {
  safe();
  if (!admin.apps.length) admin.initializeApp({ projectId: PROJECT_ID });
  const db = admin.firestore();
  const [boss, teacher, otherTeacher, student, parent, otherParent] = await Promise.all([
    account("admin", db), account("teacher", db), account("teacher", db), account("student", db), account("parent", db), account("parent", db),
  ]);
  const studentId = `pp-student-${Math.random().toString(36).slice(2)}`;
  await db.doc(`students/${studentId}`).set({ name: "Aleksandr", teacherUid: teacher.uid, teacherUids: [teacher.uid], linkedUserId: student.uid, studentUid: student.uid, linkedParentIds: [parent.uid], active: true });
  const mine = `progressPoints/pp-t-${studentId}`;
  const exam = `progressPoints/pp-a-${studentId}`;

  // writing
  assert.equal(await commit(teacher, [create(mine, point(teacher, studentId))]), 200, "the student's teacher adds a point");
  assert.equal(await commit(boss, [create(exam, point(boss, studentId, { kind: "exam", label: "Proovieksam", percent: 64.5, date: "2026-11-02" }))]), 200, "the admin adds a mock exam");
  assert.equal(await commit(otherTeacher, [create(`progressPoints/x-${studentId}`, point(otherTeacher, studentId))]), 403, "another teacher cannot");
  assert.equal(await commit(parent, [create(`progressPoints/p-${studentId}`, point(parent, studentId))]), 403, "a linked parent cannot write");
  assert.equal(await commit(student, [create(`progressPoints/s-${studentId}`, point(student, studentId))]), 403, "the student cannot write");
  assert.equal(await commit(teacher, [create(`progressPoints/f-${studentId}`, point(boss, studentId))]), 403, "createdBy must be the writer");
  assert.equal(await commit(teacher, [create(`progressPoints/b-${studentId}`, point(teacher, studentId, { percent: 101 }))]), 403, "percent 0–100");
  assert.equal(await commit(teacher, [create(`progressPoints/k-${studentId}`, point(teacher, studentId, { kind: "guess" }))]), 403, "kind is checked");
  assert.equal(await commit(teacher, [create(`progressPoints/e-${studentId}`, point(teacher, studentId, { extra: "x" }))]), 403, "no extra fields");

  // changing and deleting
  assert.equal(await commit(teacher, [change(mine, { percent: 63, updatedAt: "2026-11-04T11:00:00.000Z" })]), 200, "the teacher changes his own point");
  assert.equal(await commit(teacher, [change(exam, { percent: 70, updatedAt: "2026-11-04T11:00:00.000Z" })]), 403, "but not the admin's");
  assert.equal(await commit(otherTeacher, [change(mine, { percent: 10 })]), 403);
  assert.equal(await commit(parent, [change(mine, { percent: 99 })]), 403, "a parent never changes a point");
  assert.equal(await commit(teacher, [change(mine, { createdBy: otherTeacher.uid })]), 403, "the author stays");
  assert.equal(await commit(boss, [change(mine, { percent: 61, updatedAt: "2026-11-04T12:00:00.000Z" })]), 200, "the admin changes any point");
  assert.equal(await commit(parent, [remove(mine)]), 403);
  assert.equal(await commit(teacher, [remove(exam)]), 403, "a teacher does not delete the admin's point");

  // reading
  for (const who of [boss, teacher, student, parent]) assert.equal(await read(who, mine), 200);
  assert.equal(await read(otherTeacher, mine), 403);
  assert.equal(await read(otherParent, mine), 403, "another family's parent cannot read");
  assert.deepEqual(await list(parent, studentId), { status: 200, count: 2 }, "the parent lists his child's points");
  assert.deepEqual(await list(student, studentId), { status: 200, count: 2 });
  assert.equal((await list(otherParent, studentId)).status, 403);

  assert.equal(await commit(teacher, [remove(mine)]), 200, "the teacher deletes his own point");
});
