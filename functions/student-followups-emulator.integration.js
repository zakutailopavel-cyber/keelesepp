"use strict";
// „Täna” → „Vajab kõnet” → „Helistasin” (`studentFollowups/{id}`) against the real Firestore rules: only an admin
// writes and reads the call log, with the server's time and the writer's own uid; a teacher, a finance user and a
// student have no access; a log entry is never edited. Also the admin's narrow „Täna” reads the dashboard uses.
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
    body: JSON.stringify({ email: `followups-${role}-${Date.now()}-${Math.random().toString(36).slice(2)}@example.com`, password: "emulator-only-password", returnSecureToken: true }),
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
// `at` = the server's time (as serverTimestamp() in the CRM), unless the test gives its own
const create = (path, data, serverAt = true) => ({
  update: { name: name(path), fields: fieldsOf(data) },
  currentDocument: { exists: false },
  ...(serverAt ? { updateTransforms: [{ fieldPath: "at", setToServerValue: "REQUEST_TIME" }] } : {}),
});
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
async function runQuery(who, structuredQuery) {
  const response = await fetch(`http://${DB}/v1/projects/${PROJECT_ID}/databases/(default)/documents:runQuery`, {
    method: "POST", headers: { Authorization: `Bearer ${who.token}`, "Content-Type": "application/json" }, body: JSON.stringify({ structuredQuery }),
  });
  return response.status;
}
const where = (collectionId, field, op, value) => ({ from: [{ collectionId }], where: { fieldFilter: { field: { fieldPath: field }, op, value: encode(value) } } });

test("only an admin logs „Helistasin” and reads the log", async () => {
  safe();
  if (!admin.apps.length) admin.initializeApp({ projectId: PROJECT_ID });
  const db = admin.firestore();
  const [adminUser, teacher, finance, student] = await Promise.all([account("admin", db), account("teacher", db), account("finance", db), account("student", db)]);
  const suffix = Math.random().toString(36).slice(2);
  const id = (n) => `followup-${suffix}-${n}`;
  const entry = (by, extra = {}) => ({ studentId: "s-followup", studentName: "Mari", note: "ema helistab reedel", reasons: ["2 puudumist 3 nädalaga"], byUid: by.uid, byName: "Pavel", ...extra });

  assert.equal(await commit(adminUser, [create(`studentFollowups/${id(1)}`, entry(adminUser))]), 200, "the admin logs a call");
  assert.equal(await commit(adminUser, [create(`studentFollowups/${id(2)}`, entry(adminUser, { note: "", reasons: [] }))]), 200, "without a note");

  assert.equal(await commit(teacher, [create(`studentFollowups/${id(3)}`, entry(teacher))]), 403, "a teacher");
  assert.equal(await commit(finance, [create(`studentFollowups/${id(3)}`, entry(finance))]), 403, "finance");
  assert.equal(await commit(student, [create(`studentFollowups/${id(3)}`, entry(student))]), 403, "the student");
  assert.equal(await commit(adminUser, [create(`studentFollowups/${id(3)}`, entry(teacher))]), 403, "byUid = the writer");
  assert.equal(await commit(adminUser, [create(`studentFollowups/${id(3)}`, { ...entry(adminUser), at: "2026-01-01" }, false)]), 403, "the server's time only");
  assert.equal(await commit(adminUser, [create(`studentFollowups/${id(3)}`, entry(adminUser, { note: "x".repeat(301) }))]), 403, "note at most 300");
  assert.equal(await commit(adminUser, [create(`studentFollowups/${id(3)}`, entry(adminUser, { reasons: Array(7).fill("r") }))]), 403, "at most 6 reasons");
  assert.equal(await commit(adminUser, [create(`studentFollowups/${id(3)}`, entry(adminUser, { studentId: "" }))]), 403, "a student is needed");
  assert.equal(await commit(adminUser, [create(`studentFollowups/${id(3)}`, entry(adminUser, { phone: "+372" }))]), 403, "unknown key");

  assert.equal(await read(adminUser, `studentFollowups/${id(1)}`), 200);
  assert.equal(await read(teacher, `studentFollowups/${id(1)}`), 403, "a teacher never reads it");
  assert.equal(await read(finance, `studentFollowups/${id(1)}`), 403, "finance never reads it");
  assert.equal(await read(student, `studentFollowups/${id(1)}`), 403, "the student never reads it");
  const since = { timestampValue: "2020-01-01T00:00:00Z" };
  const sinceQuery = { from: [{ collectionId: "studentFollowups" }], where: { fieldFilter: { field: { fieldPath: "at" }, op: "GREATER_THAN_OR_EQUAL", value: since } } };
  assert.equal(await runQuery(adminUser, sinceQuery), 200, "the admin's „since” query");
  assert.equal(await runQuery(teacher, sinceQuery), 403, "a teacher's query");

  assert.equal(await commit(adminUser, [patch(`studentFollowups/${id(1)}`, { note: "muudetud" })]), 403, "never edited");
  assert.equal(await commit(teacher, [remove(`studentFollowups/${id(2)}`)]), 403, "a teacher cannot delete");
  assert.equal(await commit(adminUser, [remove(`studentFollowups/${id(2)}`)]), 200, "the admin deletes a wrong entry");
  assert.equal((await db.doc(`studentFollowups/${id(1)}`).get()).get("note"), "ema helistab reedel");
});

test("„Täna” narrow reads: the admin's queries are allowed, the packages also for finance", async () => {
  safe();
  if (!admin.apps.length) admin.initializeApp({ projectId: PROJECT_ID });
  const db = admin.firestore();
  const [adminUser, finance, teacher] = await Promise.all([account("admin", db), account("finance", db), account("teacher", db)]);
  const dueQuery = { from: [{ collectionId: "worksheetAssignments" }], where: { compositeFilter: { op: "AND", filters: [
    { fieldFilter: { field: { fieldPath: "dueDate" }, op: "GREATER_THAN_OR_EQUAL", value: encode("2026-10-05") } },
    { fieldFilter: { field: { fieldPath: "dueDate" }, op: "LESS_THAN_OR_EQUAL", value: encode("2026-11-03") } },
  ] } } };
  assert.equal(await runQuery(adminUser, dueQuery), 200, "worksheets by deadline");
  assert.equal(await runQuery(adminUser, where("websiteLeads", "status", "EQUAL", "new")), 200, "new website leads");
  const packages = { from: [{ collectionId: "studentPackages" }], where: { fieldFilter: { field: { fieldPath: "status" }, op: "IN", value: encode(["active", "depleted"]) } } };
  assert.equal(await runQuery(adminUser, packages), 200, "packages (admin)");
  assert.equal(await runQuery(finance, packages), 200, "packages (finance)");
  assert.equal(await runQuery(finance, where("lessonPackageStates", "status", "EQUAL", "needs_attention")), 200, "owed lessons (finance)");
  assert.equal(await runQuery(teacher, packages), 403, "a teacher never sees lessons left");
});
