"use strict";
// „Vead” (`clientErrors/{id}`, crm-v2 clientErrorReporter.js) against the real Firestore rules: any signed-in user
// creates one record with exactly the reporter's fields and sizes, his own uid, status „new” and the server's time;
// a lesson-link guest only while his grant is valid and only as role „guest”; nobody but an admin reads, sets the
// status or deletes; nobody writes without signing in.
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
    body: JSON.stringify({ email: `client-errors-${role}-${Date.now()}-${Math.random().toString(36).slice(2)}@example.com`, password: "emulator-only-password", returnSecureToken: true }),
  });
  const body = await response.json();
  const uid = JSON.parse(Buffer.from(body.idToken.split(".")[1], "base64url")).sub;
  await db.doc(`users/${uid}`).set({ role });
  return { token: body.idToken, uid };
}
async function guest(uid, claims) {
  const custom = await admin.auth().createCustomToken(uid, claims);
  const response = await fetch(`http://${AUTH}/identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=demo-key`, {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token: custom, returnSecureToken: true }),
  });
  const body = await response.json();
  assert.ok(body.idToken, "guest sign-in");
  return { token: body.idToken, uid };
}
function encode(value) {
  if (value === null) return { nullValue: null };
  if (value instanceof Date) return { timestampValue: value.toISOString() };
  if (Array.isArray(value)) return { arrayValue: { values: value.map(encode) } };
  if (typeof value === "boolean") return { booleanValue: value };
  if (typeof value === "number") return Number.isInteger(value) ? { integerValue: String(value) } : { doubleValue: value };
  if (typeof value === "object") return { mapValue: { fields: Object.fromEntries(Object.entries(value).map(([k, v]) => [k, encode(v)])) } };
  return { stringValue: String(value) };
}
const fieldsOf = (data) => Object.fromEntries(Object.entries(data).map(([k, v]) => [k, encode(v)]));
// `lastAt` = the server's time (serverTimestamp() in the CRM), unless the test gives its own
const create = (path, data, serverAt = true) => ({
  update: { name: name(path), fields: fieldsOf(data) },
  currentDocument: { exists: false },
  ...(serverAt ? { updateTransforms: [{ fieldPath: "lastAt", setToServerValue: "REQUEST_TIME" }] } : {}),
});
const patch = (path, data) => ({ update: { name: name(path), fields: fieldsOf(data) }, updateMask: { fieldPaths: Object.keys(data) }, currentDocument: { exists: true } });
const remove = (path) => ({ delete: name(path) });
async function commit(who, writes) {
  const response = await fetch(`http://${DB}/v1/projects/${PROJECT_ID}/databases/(default)/documents:commit`, {
    method: "POST", headers: { ...(who ? { Authorization: `Bearer ${who.token}` } : {}), "Content-Type": "application/json" }, body: JSON.stringify({ writes }),
  });
  return response.status;
}
async function read(who, path) {
  return (await fetch(`http://${DB}/v1/projects/${PROJECT_ID}/databases/(default)/documents/${path}`, { headers: { Authorization: `Bearer ${who.token}` } })).status;
}
async function listRecent(who) {
  const response = await fetch(`http://${DB}/v1/projects/${PROJECT_ID}/databases/(default)/documents:runQuery`, {
    method: "POST", headers: { Authorization: `Bearer ${who.token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ structuredQuery: { from: [{ collectionId: "clientErrors" }], where: { fieldFilter: { field: { fieldPath: "lastAt" }, op: "GREATER_THAN_OR_EQUAL", value: encode(new Date(Date.now() - 86400000)) } }, orderBy: [{ field: { fieldPath: "lastAt" }, direction: "DESCENDING" }] } }),
  });
  return response.status;
}

test("signed-in users report errors, only an admin reads and manages them", async () => {
  safe();
  if (!admin.apps.length) admin.initializeApp({ projectId: PROJECT_ID });
  const db = admin.firestore();
  const [adminUser, teacher, student, finance] = await Promise.all([account("admin", db), account("teacher", db), account("student", db), account("finance", db)]);
  const suffix = Math.random().toString(36).slice(2);
  const id = (n) => `clienterr-${suffix}-${n}`;
  const record = (who, extra = {}) => ({
    message: "TypeError: Cannot read properties of undefined (reading 'map')",
    kind: "error", route: "/students/:id", build: "abc1234", role: "student", uid: who.uid,
    browser: "Chrome 130 · macOS", frame: "/assets/index-abc.js:1:2345", count: 2,
    fingerprint: "0123456789abcdef", status: "new", firstAt: new Date(Date.now() - 60000), ...extra,
  });

  assert.equal(await commit(student, [create(`clientErrors/${id(1)}`, record(student))]), 200, "a student reports");
  assert.equal(await commit(teacher, [create(`clientErrors/${id(2)}`, record(teacher, { role: "teacher", kind: "permission" }))]), 200, "a teacher reports");
  assert.equal(await commit(finance, [create(`clientErrors/${id(3)}`, record(finance, { role: "finance", kind: "call" }))]), 200, "finance reports");
  assert.equal(await commit(adminUser, [create(`clientErrors/${id(4)}`, record(adminUser, { role: "admin", build: "" }))]), 200, "an admin reports");

  const refused = [
    [null, record(student), "signed out"],
    [student, record(teacher), "someone else's uid"],
    [student, record(student, { email: "a@b.ee" }), "an extra field"],
    [student, (() => { const r = record(student); delete r.frame; return r; })(), "a missing field"],
    [student, record(student, { message: "x".repeat(501) }), "message over 500"],
    [student, record(student, { message: "" }), "empty message"],
    [student, record(student, { kind: "other" }), "unknown kind"],
    [student, record(student, { route: "/students?email=a@b.ee" }), "route with a query string"],
    [student, record(student, { route: "x".repeat(201) }), "route not a path"],
    [student, record(student, { build: "x".repeat(41) }), "build over 40"],
    [student, record(student, { role: "superuser" }), "unknown role"],
    [student, record(student, { role: "guest" }), "guest role without a guest sign-in"],
    [student, record(student, { browser: "x".repeat(61) }), "browser over 60"],
    [student, record(student, { frame: "x".repeat(201) }), "frame over 200"],
    [student, record(student, { count: 0 }), "count 0"],
    [student, record(student, { count: 1001 }), "count over 1000"],
    [student, record(student, { count: 1.5 }), "count not an integer"],
    [student, record(student, { fingerprint: "XYZ" }), "fingerprint not 16 hex"],
    [student, record(student, { status: "fixed" }), "status other than new"],
    [student, record(student, { firstAt: "2026-01-01" }), "firstAt not a timestamp"],
  ];
  for (const [index, [who, data, label]] of refused.entries()) {
    assert.equal(await commit(who, [create(`clientErrors/${id(`r${index}`)}`, data)]), 403, label);
  }
  assert.equal(await commit(student, [create(`clientErrors/${id(5)}`, { ...record(student), lastAt: new Date("2026-01-01") }, false)]), 403, "the server's time only");

  // reading: admin only (one document and the page's query)
  assert.equal(await read(adminUser, `clientErrors/${id(1)}`), 200, "admin reads");
  assert.equal(await listRecent(adminUser), 200, "admin lists the last day");
  for (const who of [student, teacher, finance]) {
    assert.equal(await read(who, `clientErrors/${id(1)}`), 403, "not readable by others");
    assert.equal(await listRecent(who), 403, "not listable by others");
  }

  // status: admin only, only the status field, only the three values
  assert.equal(await commit(adminUser, [patch(`clientErrors/${id(1)}`, { status: "ack" })]), 200, "admin: ack");
  assert.equal(await commit(adminUser, [patch(`clientErrors/${id(1)}`, { status: "fixed" })]), 200, "admin: fixed");
  assert.equal(await commit(adminUser, [patch(`clientErrors/${id(1)}`, { status: "deleted" })]), 403, "unknown status");
  assert.equal(await commit(adminUser, [patch(`clientErrors/${id(1)}`, { message: "edited" })]), 403, "no other field");
  assert.equal(await commit(student, [patch(`clientErrors/${id(1)}`, { status: "new" })]), 403, "the reporter cannot change it");
  assert.equal(await commit(teacher, [patch(`clientErrors/${id(2)}`, { status: "fixed" })]), 403, "a teacher cannot change it");

  // delete: admin only
  assert.equal(await commit(student, [remove(`clientErrors/${id(1)}`)]), 403, "the reporter cannot delete");
  assert.equal(await commit(adminUser, [remove(`clientErrors/${id(1)}`)]), 200, "admin deletes");
});

test("a lesson-link guest reports only while the grant is valid, as role guest", async () => {
  safe();
  if (!admin.apps.length) admin.initializeApp({ projectId: PROJECT_ID });
  const db = admin.firestore();
  const suffix = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
  const live = `guest_ce_${suffix}`;
  const expired = `guest_ce_old_${suffix}`;
  await Promise.all([
    db.doc(`liveGuestGrants/${live}`).set({ studentId: "s-x", invitationId: "inv-x", teacherUid: "t-x", expiresAt: admin.firestore.Timestamp.fromMillis(Date.now() + 3600_000) }),
    db.doc(`liveGuestGrants/${expired}`).set({ studentId: "s-x", invitationId: "inv-x", teacherUid: "t-x", expiresAt: admin.firestore.Timestamp.fromMillis(Date.now() - 1000) }),
  ]);
  const [guestUser, oldGuest, noGrant] = await Promise.all([guest(live, { liveGuest: true }), guest(expired, { liveGuest: true }), guest(`guest_ce_none_${suffix}`, { liveGuest: true })]);
  const record = (who, extra = {}) => ({
    message: "NotAllowedError: Permission denied · 1:1 call join", kind: "media", route: "/tund/:id", build: "abc1234", role: "guest", uid: who.uid,
    browser: "Safari 17 · iPhone", frame: "", count: 1, fingerprint: "fedcba9876543210", status: "new", firstAt: new Date(), ...extra,
  });
  assert.equal(await commit(guestUser, [create(`clientErrors/g1-${suffix}`, record(guestUser))]), 200, "a guest with a valid grant");
  assert.equal(await commit(guestUser, [create(`clientErrors/g2-${suffix}`, record(guestUser, { role: "student" }))]), 403, "a guest must say guest");
  assert.equal(await commit(oldGuest, [create(`clientErrors/g3-${suffix}`, record(oldGuest))]), 403, "an expired grant");
  assert.equal(await commit(noGrant, [create(`clientErrors/g4-${suffix}`, record(noGrant))]), 403, "no grant");
  assert.equal(await read(guestUser, `clientErrors/g1-${suffix}`), 403, "a guest cannot read");
});
