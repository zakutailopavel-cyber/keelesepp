"use strict";
// „Kuu kokkuvõte vanemale” marked as sent (`parentReports/{id}`) against the real Firestore rules: admins only read and
// create (byUid = the writer, known keys and sizes), nobody changes it, admins may delete; teachers, students and
// parents have no access.
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
    body: JSON.stringify({ email: `parent-reports-${role}-${Date.now()}-${Math.random().toString(36).slice(2)}@example.com`, password: "emulator-only-password", returnSecureToken: true }),
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

test("only an admin records a parent month summary; nobody else reads or writes it", async () => {
  safe();
  if (!admin.apps.length) admin.initializeApp({ projectId: PROJECT_ID });
  const db = admin.firestore();
  const [adminUser, teacher, student, parent] = await Promise.all([account("admin", db), account("teacher", db), account("student", db), account("parent", db)]);
  const suffix = Math.random().toString(36).slice(2);
  const id = (n) => `report-${suffix}-${n}`;
  const report = (by, extra = {}) => ({
    studentId: "s-report", month: "2026-10", language: "ru", text: "Здравствуйте! Уроков за месяц: 4.", channel: "copy",
    sentAt: "2026-11-04T10:00:00.000Z", byUid: by.uid, byName: "Anna", ...extra,
  });

  assert.equal(await commit(adminUser, [create(`parentReports/${id(1)}`, report(adminUser))]), 200, "an admin marks it sent");
  assert.equal(await commit(adminUser, [create(`parentReports/${id(2)}`, report(adminUser, { channel: "conversation", language: "uk" }))]), 200, "sent to the conversation");

  assert.equal(await commit(teacher, [create(`parentReports/${id(3)}`, report(teacher))]), 403, "a teacher");
  assert.equal(await commit(student, [create(`parentReports/${id(3)}`, report(student))]), 403, "the student");
  assert.equal(await commit(parent, [create(`parentReports/${id(3)}`, report(parent))]), 403, "a parent");
  assert.equal(await commit(adminUser, [create(`parentReports/${id(3)}`, report(teacher))]), 403, "byUid = the writer");
  assert.equal(await commit(adminUser, [create(`parentReports/${id(3)}`, report(adminUser, { month: "2026-1" }))]), 403, "month YYYY-MM");
  assert.equal(await commit(adminUser, [create(`parentReports/${id(3)}`, report(adminUser, { language: "de" }))]), 403, "known language");
  assert.equal(await commit(adminUser, [create(`parentReports/${id(3)}`, report(adminUser, { channel: "email" }))]), 403, "known channel");
  assert.equal(await commit(adminUser, [create(`parentReports/${id(3)}`, report(adminUser, { text: "" }))]), 403, "not empty");
  assert.equal(await commit(adminUser, [create(`parentReports/${id(3)}`, report(adminUser, { text: "x".repeat(4001) }))]), 403, "text at most 4000");
  assert.equal(await commit(adminUser, [create(`parentReports/${id(3)}`, report(adminUser, { lessonsLeft: 3 }))]), 403, "unknown key");

  assert.equal(await read(adminUser, `parentReports/${id(1)}`), 200);
  assert.equal(await read(teacher, `parentReports/${id(1)}`), 403, "a teacher");
  assert.equal(await read(student, `parentReports/${id(1)}`), 403, "the student");
  assert.equal(await read(parent, `parentReports/${id(1)}`), 403, "a parent");

  assert.equal(await commit(adminUser, [patch(`parentReports/${id(1)}`, { text: "muudetud" })]), 403, "never changed");
  assert.equal(await commit(teacher, [remove(`parentReports/${id(2)}`)]), 403, "a teacher cannot delete");
  assert.equal(await commit(adminUser, [remove(`parentReports/${id(2)}`)]), 200, "an admin deletes a wrong mark");
  assert.equal((await db.doc(`parentReports/${id(1)}`).get()).get("language"), "ru");
});
