"use strict";
// „Tunni tahvlid” (crm-v2/src/services/firebase/studentBoard.js lessonCopiesService) against the real rules: the teacher
// makes a snapshot page `whiteboards/{studentId}/lessonPages/lb-<lesson>-<n>` on the student's board, copies the
// elements into it in a batch and marks it completed; then nobody changes or deletes it, and the student and a linked
// parent read it (and list the copies). Uses the snapshot rules that were already there — no rule change needed.
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
    body: JSON.stringify({ email: `copy-${role}-${Date.now()}-${Math.random().toString(36).slice(2)}@example.com`, password: "emulator-only-password", returnSecureToken: true }),
  });
  const body = await response.json();
  const uid = JSON.parse(Buffer.from(body.idToken.split(".")[1], "base64url")).sub;
  await db.doc(`users/${uid}`).set({ role, displayName: `Copy ${role}` });
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
function put(path, fields, { stamps = [], mask = null, exists } = {}) {
  return {
    update: { name: name(path), fields: Object.fromEntries(Object.entries(fields).map(([k, v]) => [k, encode(v)])) },
    ...(mask ? { updateMask: { fieldPaths: mask } } : {}),
    ...(exists === undefined ? {} : { currentDocument: { exists } }),
    ...(stamps.length ? { updateTransforms: stamps.map((fieldPath) => ({ fieldPath, setToServerValue: "REQUEST_TIME" })) } : {}),
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
// the „Tunni tahvlid” list: lessonPages where isSnapshot == true
async function listCopies(who, studentId) {
  const response = await fetch(`http://${DB}/v1/projects/${PROJECT_ID}/databases/(default)/documents/whiteboards/${studentId}:runQuery`, {
    method: "POST", headers: { Authorization: `Bearer ${who.token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ structuredQuery: { from: [{ collectionId: "lessonPages" }], where: { fieldFilter: { field: { fieldPath: "isSnapshot" }, op: "EQUAL", value: { booleanValue: true } } } } }),
  });
  const body = await response.json().catch(() => []);
  return { status: response.status, ids: Array.isArray(body) ? body.filter((row) => row.document).map((row) => row.document.name.split("/").pop()) : [] };
}

const page = (who, extra = {}) => ({ title: "Tund 4.11.2026", order: 1, status: "active", isSnapshot: true, snapshotOf: "p1", updatedByUid: who.uid, updatedByName: "Õpetaja", ...extra });
const element = (who, data, revision) => ({ ...data, updatedByUid: who.uid, updatedByName: "Mari", revision });
const stroke = { type: "stroke", points: [{ x: 1, y: 2 }, { x: 30, y: 40 }], color: "#1C2B3A", strokeWidth: 4 };
const text = { type: "text", x: 10, y: 10, w: 200, h: 30, text: "Ma elan Tallinnas", spans: [{ t: "Ma elan " }, { t: "Tallinnas", b: true }], color: "#1C2B3A", fontSize: 18 };
const note = { type: "note", x: 0, y: 80, w: 180, h: 140, text: "kordame", color: "#FEF3C7", bookmark: true, ink: [{ d: "M0 0 L10 10", c: "#000", w: 2 }], noteId: "n1" };

test("the teacher keeps a read-only copy of the lesson board for the student; the student and the parent read it", async () => {
  safe();
  if (!admin.apps.length) admin.initializeApp({ projectId: PROJECT_ID });
  const db = admin.firestore();
  const [teacher, student, parent, outsider] = await Promise.all([account("teacher", db), account("student", db), account("parent", db), account("student", db)]);
  const studentId = `copy-student-${Math.random().toString(36).slice(2)}`;
  await db.doc(`students/${studentId}`).set({ name: "Mari", teacherUid: teacher.uid, teacherUids: [teacher.uid], linkedUserId: student.uid, studentUid: student.uid, linkedParentIds: [parent.uid], active: true });
  const copy = `whiteboards/${studentId}/lessonPages/lb-inv-1-1`;

  assert.equal(await commit(student, [put(copy, page(student), { stamps: ["createdAt", "updatedAt"] })]), 403, "a student cannot make a copy");
  assert.equal(await commit(teacher, [put(copy, page(teacher), { stamps: ["createdAt", "updatedAt"] })]), 200, "the teacher makes the copy page");
  // the elements, in one batch (as lessonCopiesService does, ≤ 100 per batch)
  const elements = [stroke, text, note].map((data, index) => put(`${copy}/elements/e${index}`, element(teacher, data, index + 1), { stamps: ["updatedAt"] }));
  assert.equal(await commit(teacher, elements), 200, "the teacher copies the elements");
  assert.equal(await commit(student, [put(`${copy}/elements/s1`, element(student, stroke, 9), { stamps: ["updatedAt"] })]), 403, "the student cannot add to a copy");
  // completed: read-only from now on
  assert.equal(await commit(teacher, [put(copy, { status: "completed", updatedByUid: teacher.uid, updatedByName: "Õpetaja" }, { stamps: ["updatedAt"], mask: ["status", "updatedAt", "updatedByUid", "updatedByName"], exists: true })]), 200, "the teacher completes it");
  assert.equal(await commit(teacher, [put(`${copy}/elements/late`, element(teacher, stroke, 4), { stamps: ["updatedAt"] })]), 403, "nobody adds to a completed copy");
  assert.equal(await commit(teacher, [put(`${copy}/elements/e0`, element(teacher, { ...stroke, color: "#B42318" }, 1), { stamps: ["updatedAt"], exists: true })]), 403, "nobody changes it");
  assert.equal(await commit(student, [{ delete: name(`${copy}/elements/e0`) }]), 403, "the student cannot erase in it");
  assert.equal(await commit(teacher, [{ delete: name(`${copy}/elements/e0`) }]), 403, "nor the teacher");
  assert.equal(await commit(teacher, [{ delete: name(copy) }]), 403, "a completed copy is not deleted");
  assert.equal(await commit(student, [put(copy, { title: "Muu", updatedByUid: student.uid, updatedByName: "Mari" }, { stamps: ["updatedAt"], mask: ["title", "updatedAt", "updatedByUid", "updatedByName"], exists: true })]), 403, "nor renamed by the student");

  // reading
  assert.equal(await read(student, copy), 200);
  assert.equal(await read(student, `${copy}/elements/e1`), 200);
  assert.equal(await read(parent, `${copy}/elements/e2`), 200, "a linked parent reads it");
  assert.equal(await read(outsider, copy), 403);
  const listed = await listCopies(student, studentId);
  assert.equal(listed.status, 200);
  assert.deepEqual(listed.ids, ["lb-inv-1-1"]);
  assert.equal((await listCopies(parent, studentId)).status, 200, "the parent lists them too");
  assert.equal((await listCopies(outsider, studentId)).status, 403);
});
