"use strict";

// Sõnavara (2026-10-10): a student keeps words from a course deck in their own word list — only for themselves,
// in the first box, without a lesson link.
const test = require("node:test");
const assert = require("node:assert/strict");
const admin = require("firebase-admin");

const PROJECT_ID = "demo-keelesepp-finance";
const AUTH_EMULATOR = process.env.FIREBASE_AUTH_EMULATOR_HOST;
const FIRESTORE_EMULATOR = process.env.FIRESTORE_EMULATOR_HOST;
const FUNCTIONS_EMULATOR = process.env.FUNCTIONS_EMULATOR_HOST || "127.0.0.1:5001";

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

async function signUp(email) {
  const response = await fetch(`http://${AUTH_EMULATOR}/identitytoolkit.googleapis.com/v1/accounts:signUp?key=demo-key`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password: "emulator-only-password", returnSecureToken: true }),
  });
  const body = await response.json();
  if (!response.ok || !body.idToken) throw new Error(`signUp failed: ${JSON.stringify(body)}`);
  return body.idToken;
}

async function signIn(email) {
  const response = await fetch(`http://${AUTH_EMULATOR}/identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=demo-key`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password: "emulator-only-password", returnSecureToken: true }),
  });
  const body = await response.json();
  if (!response.ok || !body.idToken) throw new Error(`signIn failed: ${JSON.stringify(body)}`);
  return body.idToken;
}

async function account(email, profile) {
  let token;
  try { token = await signUp(email); } catch { token = await signIn(email); }
  await db().collection("users").doc(tokenUid(token)).set({ email, displayName: profile.displayName || email, ...profile });
  return token;
}

const adminToken = () => account("zakutailo.pavel@gmail.com", { role: "admin", roles: ["admin"], displayName: "Pavel Zakutailo" });

async function documentRequest(token, method, path, body) {
  const response = await fetch(`http://${FIRESTORE_EMULATOR}/v1/projects/${PROJECT_ID}/databases/(default)/documents/${path}`, {
    method, headers: { Authorization: `Bearer ${token}`, ...(body ? { "Content-Type": "application/json" } : {}) },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  return { status: response.status, body: await response.json().catch(() => ({})) };
}

async function api(fn, token, path, payload = {}) {
  const response = await fetch(`http://${FUNCTIONS_EMULATOR}/${PROJECT_ID}/us-central1/${fn}${path}`, {
    method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, body: JSON.stringify(payload),
  });
  return { status: response.status, body: await response.json().catch(() => ({})) };
}

const str = (value) => ({ stringValue: value });


test("a student adds words only to their own list, new and without a lesson link", async () => {
  requireSafeEmulatorEnvironment();
  const token = await account("words-own@example.com", { role: "student", roles: ["student"] });
  const uid = tokenUid(token);
  await Promise.all([
    db().collection("students").doc("words-own").set({ name: "Own Words", studentUid: uid, linkedUserId: uid, active: true }),
    db().collection("students").doc("words-other").set({ name: "Other", studentUid: "someone-else", active: true }),
  ]);
  const word = (studentId, extra = {}) => ({ fields: {
    studentId: str(studentId), invitationId: str(""), word: str("eelarve"), translation: str("бюджет"), example: str(""), forms: str(""),
    createdByUid: str(uid), createdByName: str("Own Words"), createdAt: str("2026-10-10T10:00:00Z"), updatedAt: str("2026-10-10T10:00:00Z"),
    box: { integerValue: "0" }, dueAt: str("2026-10-10T10:00:00Z"), ...extra,
  } });
  assert.equal((await documentRequest(token, "PATCH", "studentWords/own-1", word("words-own"))).status, 200);
  assert.equal((await documentRequest(token, "PATCH", "studentWords/own-2", word("words-other"))).status, 403);
  assert.equal((await documentRequest(token, "PATCH", "studentWords/own-3", word("words-own", { box: { integerValue: "5" } }))).status, 403);
  assert.equal((await documentRequest(token, "PATCH", "studentWords/own-4", word("words-own", { createdByUid: str("teacher-uid") }))).status, 403);
});
