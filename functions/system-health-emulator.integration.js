"use strict";
// „Süsteemi olek” (`systemHealth/{current|digest}`) against the real Firestore rules: only an admin reads, nobody
// writes from a browser (the scheduled functions write with the Admin SDK).
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
    body: JSON.stringify({ email: `system-health-${role}-${Date.now()}-${Math.random().toString(36).slice(2)}@example.com`, password: "emulator-only-password", returnSecureToken: true }),
  });
  const body = await response.json();
  const uid = JSON.parse(Buffer.from(body.idToken.split(".")[1], "base64url")).sub;
  await db.doc(`users/${uid}`).set({ role });
  return { token: body.idToken, uid };
}
const fields = (data) => Object.fromEntries(Object.entries(data).map(([k, v]) => [k, { stringValue: String(v) }]));
async function commit(who, writes) {
  const response = await fetch(`http://${DB}/v1/projects/${PROJECT_ID}/databases/(default)/documents:commit`, {
    method: "POST", headers: { ...(who ? { Authorization: `Bearer ${who.token}` } : {}), "Content-Type": "application/json" }, body: JSON.stringify({ writes }),
  });
  return response.status;
}
async function read(who, path) {
  return (await fetch(`http://${DB}/v1/projects/${PROJECT_ID}/databases/(default)/documents/${path}`, { headers: who ? { Authorization: `Bearer ${who.token}` } : {} })).status;
}

test("system health: admin reads, nobody writes from a browser", async () => {
  safe();
  if (!admin.apps.length) admin.initializeApp({ projectId: PROJECT_ID });
  const db = admin.firestore();
  await db.doc("systemHealth/current").set({ status: "ok", checkedAt: new Date().toISOString() });
  await db.doc("systemHealth/digest").set({ date: "2026-11-09", total: 0 });
  const [adminUser, teacher, finance, student, parent] = await Promise.all(["admin", "teacher", "finance", "student", "parent"].map((role) => account(role, db)));

  assert.equal(await read(adminUser, "systemHealth/current"), 200, "admin reads current");
  assert.equal(await read(adminUser, "systemHealth/digest"), 200, "admin reads digest");
  for (const who of [teacher, finance, student, parent, null]) {
    assert.equal(await read(who, "systemHealth/current"), 403, "others do not read current");
    assert.equal(await read(who, "systemHealth/digest"), 403, "others do not read digest");
  }
  for (const who of [adminUser, teacher, student]) {
    assert.equal(await commit(who, [{ update: { name: name("systemHealth/current"), fields: fields({ status: "ok" }) } }]), 403, "no browser writes current");
    assert.equal(await commit(who, [{ update: { name: name("systemHealth/fake"), fields: fields({ status: "down" }) }, currentDocument: { exists: false } }]), 403, "no browser creates");
    assert.equal(await commit(who, [{ delete: name("systemHealth/digest") }]), 403, "no browser deletes");
  }
  assert.equal((await db.doc("systemHealth/current").get()).data().status, "ok");
});
