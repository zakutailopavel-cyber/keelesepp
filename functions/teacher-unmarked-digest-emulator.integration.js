"use strict";
// Weekly „Märkimata tunnid” markers (`teacherUnmarkedDigests/{uid}_{week}`) and the digest switch
// (`emailSettings/teacherDigest`) against the real Firestore rules: a teacher reads only his own marker, the admin
// reads all, nobody writes from a browser (the scheduled function and the admin route write with the Admin SDK).
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
    body: JSON.stringify({ email: `teacher-digest-${role}-${Date.now()}-${Math.random().toString(36).slice(2)}@example.com`, password: "emulator-only-password", returnSecureToken: true }),
  });
  const body = await response.json();
  const uid = JSON.parse(Buffer.from(body.idToken.split(".")[1], "base64url")).sub;
  await db.doc(`users/${uid}`).set({ role });
  return { token: body.idToken, uid };
}
const fields = (data) => Object.fromEntries(Object.entries(data).map(([k, v]) => [k, typeof v === "boolean" ? { booleanValue: v } : { stringValue: String(v) }]));
async function commit(who, writes) {
  const response = await fetch(`http://${DB}/v1/projects/${PROJECT_ID}/databases/(default)/documents:commit`, {
    method: "POST", headers: { ...(who ? { Authorization: `Bearer ${who.token}` } : {}), "Content-Type": "application/json" }, body: JSON.stringify({ writes }),
  });
  return response.status;
}
async function read(who, path) {
  return (await fetch(`http://${DB}/v1/projects/${PROJECT_ID}/databases/(default)/documents/${path}`, { headers: who ? { Authorization: `Bearer ${who.token}` } : {} })).status;
}
async function list(who, collection) {
  return (await fetch(`http://${DB}/v1/projects/${PROJECT_ID}/databases/(default)/documents/${collection}`, { headers: who ? { Authorization: `Bearer ${who.token}` } : {} })).status;
}

test("teacher digest markers: own marker for the teacher, all for the admin, no browser writes", async () => {
  safe();
  if (!admin.apps.length) admin.initializeApp({ projectId: PROJECT_ID });
  const db = admin.firestore();
  const [adminUser, teacher, otherTeacher, finance, student, parent] = await Promise.all(["admin", "teacher", "teacher", "finance", "student", "parent"].map((role) => account(role, db)));
  const own = `teacherUnmarkedDigests/${teacher.uid}_2026-W46`;
  const other = `teacherUnmarkedDigests/${otherTeacher.uid}_2026-W46`;
  await db.doc(own).set({ teacherUid: teacher.uid, week: "2026-W46", total: 3, status: "sent" });
  await db.doc(other).set({ teacherUid: otherTeacher.uid, week: "2026-W46", total: 5, status: "sent" });
  await db.doc("emailSettings/teacherDigest").set({ weeklyUnmarked: true });

  assert.equal(await read(teacher, own), 200, "a teacher reads his own marker");
  assert.equal(await read(teacher, other), 403, "a teacher does not read another teacher's marker");
  assert.equal(await read(adminUser, own), 200, "admin reads a marker");
  assert.equal(await list(adminUser, "teacherUnmarkedDigests"), 200, "admin lists markers");
  assert.equal(await list(teacher, "teacherUnmarkedDigests"), 403, "a teacher cannot list markers");
  for (const who of [finance, student, parent, null]) {
    assert.equal(await read(who, own), 403, "non-staff do not read markers");
  }
  for (const who of [adminUser, teacher, student]) {
    assert.equal(await commit(who, [{ update: { name: name(own), fields: fields({ teacherUid: teacher.uid, status: "failed" }) } }]), 403, "no browser updates a marker");
    assert.equal(await commit(who, [{ update: { name: name(`teacherUnmarkedDigests/${who.uid}_2026-W47`), fields: fields({ teacherUid: who.uid }) }, currentDocument: { exists: false } }]), 403, "no browser creates a marker");
    assert.equal(await commit(who, [{ delete: name(own) }]), 403, "no browser deletes a marker");
  }

  // the switch: the admin reads it (as the existing emailSettings rule), only the server route writes it
  assert.equal(await read(adminUser, "emailSettings/teacherDigest"), 200, "admin reads the switch");
  for (const who of [teacher, finance, student]) assert.equal(await read(who, "emailSettings/teacherDigest"), 403, "others do not read the switch");
  for (const who of [adminUser, teacher]) {
    assert.equal(await commit(who, [{ update: { name: name("emailSettings/teacherDigest"), fields: fields({ weeklyUnmarked: false }) } }]), 403, "no browser writes the switch");
  }
  assert.equal((await db.doc("emailSettings/teacherDigest").get()).data().weeklyUnmarked, true);
  assert.equal((await db.doc(own).get()).data().status, "sent");
});
