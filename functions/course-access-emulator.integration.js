"use strict";

// Course material (owner 2026-10-12): readable only by staff and approved students linked to a card. An account made
// straight through the Auth API without a profile, an unlinked student or a parent cannot download the course.
const test = require("node:test");
const assert = require("node:assert/strict");
const admin = require("firebase-admin");

const PROJECT_ID = "demo-keelesepp-finance";
const AUTH_EMULATOR = process.env.FIREBASE_AUTH_EMULATOR_HOST;
const FIRESTORE_EMULATOR = process.env.FIRESTORE_EMULATOR_HOST;

function requireSafeEmulatorEnvironment() {
  const activeProject = process.env.GCLOUD_PROJECT || process.env.GOOGLE_CLOUD_PROJECT || "";
  if (activeProject !== PROJECT_ID) throw new Error(`Refusing integration test for non-demo project: ${activeProject || "missing"}`);
  if (!/^(127\.0\.0\.1|localhost):\d+$/.test(AUTH_EMULATOR || "") || !/^(127\.0\.0\.1|localhost):\d+$/.test(FIRESTORE_EMULATOR || "")) {
    throw new Error("Auth and Firestore emulator hosts are required");
  }
}
function db() {
  if (!admin.apps.length) admin.initializeApp({ projectId: PROJECT_ID });
  return admin.firestore();
}
const tokenUid = (token) => JSON.parse(Buffer.from(token.split(".")[1], "base64url").toString("utf8")).user_id;
async function auth(kind, email) {
  const response = await fetch(`http://${AUTH_EMULATOR}/identitytoolkit.googleapis.com/v1/accounts:${kind}?key=demo-key`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password: "emulator-only-password", returnSecureToken: true }),
  });
  const body = await response.json();
  if (!response.ok || !body.idToken) throw new Error(`${kind} failed`);
  return body.idToken;
}
async function token(email, profile) {
  let t;
  try { t = await auth("signUp", email); } catch { t = await auth("signInWithPassword", email); }
  if (profile) await db().collection("users").doc(tokenUid(t)).set({ email, ...profile });
  return t;
}
async function read(t, path) {
  const response = await fetch(`http://${FIRESTORE_EMULATOR}/v1/projects/${PROJECT_ID}/databases/(default)/documents/${path}`, { headers: { Authorization: `Bearer ${t}` } });
  return response.status;
}
async function list(t, path) {
  const response = await fetch(`http://${FIRESTORE_EMULATOR}/v1/projects/${PROJECT_ID}/databases/(default)/documents/${path}`, { headers: { Authorization: `Bearer ${t}` } });
  return response.status;
}

test("only staff and linked students read the course", async () => {
  requireSafeEmulatorEnvironment();
  await db().doc("curriculumLessons/ca-lesson").set({ title: "Pood", level: "B1" });
  await db().doc("curriculumLessons/ca-lesson/worksheets/discover").set({ publishedWorksheetDoc: { blocks: [] } });

  const orphan = await token("ca-orphan@example.com", null);
  const unlinked = await token("ca-unlinked@example.com", { role: "student", roles: ["student"] });
  const parent = await token("ca-parent@example.com", { role: "parent", roles: ["parent"] });
  const linked = await token("ca-linked@example.com", { role: "student", roles: ["student"], linkedStudentIds: ["ca-card"] });
  const teacher = await token("ca-teacher@example.com", { role: "teacher", roles: ["teacher"] });

  for (const [who, t] of [["no profile", orphan], ["unlinked student", unlinked], ["parent", parent]]) {
    assert.equal(await read(t, "curriculumLessons/ca-lesson"), 403, `${who}: lesson`);
    assert.equal(await read(t, "curriculumLessons/ca-lesson/worksheets/discover"), 403, `${who}: sheet`);
    assert.equal(await list(t, "curriculumLessons"), 403, `${who}: list`);
  }
  for (const [who, t] of [["linked student", linked], ["teacher", teacher]]) {
    assert.equal(await read(t, "curriculumLessons/ca-lesson"), 200, `${who}: lesson`);
    assert.equal(await read(t, "curriculumLessons/ca-lesson/worksheets/discover"), 200, `${who}: sheet`);
  }
});
