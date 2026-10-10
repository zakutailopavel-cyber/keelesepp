"use strict";

// Security review 2026-10-10 (access): a student cannot grade their own work, write as the teacher, create homework
// (each one e-mails the family) or log staff events; a teacher deletes only their own lessons and schedule.
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


async function student(email, studentId) {
  const token = await account(email, { role: "student", roles: ["student"] });
  const uid = tokenUid(token);
  await db().collection("students").doc(studentId).set({ name: "Sec Student", studentUid: uid, linkedUserId: uid, email, active: true });
  return { token, uid };
}

test("a student cannot grade their own exercise result but can submit it", async () => {
  requireSafeEmulatorEnvironment();
  const { token } = await student("sec-learner@example.com", "sec-learner");
  const submit = await documentRequest(token, "PATCH", "exerciseResults/sec-result-1", {
    fields: { studentId: str("sec-learner"), exerciseId: str("e1"), reviewStatus: str("pending"), completedAt: str("2026-10-10T10:00:00Z") },
  });
  assert.equal(submit.status, 200, JSON.stringify(submit.body));
  const grade = await documentRequest(token, "PATCH", "exerciseResults/sec-result-1?updateMask.fieldPaths=teacherGrade&updateMask.fieldPaths=reviewStatus", {
    fields: { teacherGrade: { integerValue: "5" }, reviewStatus: str("reviewed") },
  });
  assert.equal(grade.status, 403, JSON.stringify(grade.body));
  const deltas = await documentRequest(token, "PATCH", "exerciseResults/sec-result-1?updateMask.fieldPaths=skillDeltas", {
    fields: { skillDeltas: { mapValue: { fields: { reading: { integerValue: "3" } } } } },
  });
  assert.equal(deltas.status, 403, JSON.stringify(deltas.body));
  const forged = await documentRequest(token, "PATCH", "exerciseResults/sec-result-2", {
    fields: { studentId: str("sec-learner"), teacherGrade: { integerValue: "5" } },
  });
  assert.equal(forged.status, 403, JSON.stringify(forged.body));
});

test("a student writes messages only as themselves", async () => {
  requireSafeEmulatorEnvironment();
  const { token, uid } = await student("sec-writer@example.com", "sec-writer");
  const own = await documentRequest(token, "PATCH", "messages/sec-msg-own", {
    fields: { studentId: str("sec-writer"), fromUid: str(uid), fromRole: str("student"), text: str("Tere!") },
  });
  assert.equal(own.status, 200, JSON.stringify(own.body));
  const spoofUid = await documentRequest(token, "PATCH", "messages/sec-msg-spoof", {
    fields: { studentId: str("sec-writer"), fromUid: str("teacher-uid"), fromRole: str("teacher"), fromName: str("Pavel"), text: str("Homme tundi pole") },
  });
  assert.equal(spoofUid.status, 403, JSON.stringify(spoofUid.body));
  const spoofRole = await documentRequest(token, "PATCH", "messages/sec-msg-role", {
    fields: { studentId: str("sec-writer"), fromUid: str(uid), fromRole: str("teacher"), text: str("Homme tundi pole") },
  });
  assert.equal(spoofRole.status, 403, JSON.stringify(spoofRole.body));
});

test("a student cannot create homework or log a staff event", async () => {
  requireSafeEmulatorEnvironment();
  const { token, uid } = await student("sec-hw@example.com", "sec-hw");
  const homework = await documentRequest(token, "PATCH", "homework/sec-hw-1", { fields: { studentId: str("sec-hw"), task: str("x"), status: str("Ootel") } });
  assert.equal(homework.status, 403, JSON.stringify(homework.body));
  const entry = (type) => ({ fields: { byUid: str(uid), type: str(type), label: str("x"), createdAt: str("2026-10-10T10:00:00Z"), date: str("2026-10-10") } });
  const fake = await documentRequest(token, "PATCH", "activityLog/sec-act-fake", entry("lesson.completed"));
  assert.equal(fake.status, 403, JSON.stringify(fake.body));
  const own = await documentRequest(token, "PATCH", "activityLog/sec-act-own", entry("message.sent"));
  assert.equal(own.status, 200, JSON.stringify(own.body));
});

test("a teacher deletes only their own schedule entries and lessons", async () => {
  requireSafeEmulatorEnvironment();
  await db().collection("securityMigrations").doc("teacherUidV1").set({ readEnforced: true }, { merge: true });
  const token = await account("sec-deleter@example.com", { role: "teacher", roles: ["teacher"], displayName: "Sec Deleter" });
  const uid = tokenUid(token);
  await Promise.all([
    db().collection("schedule").doc("sec-own-slot").set({ studentId: "s1", teacherUid: uid, teacher: "Sec Deleter", date: "2026-10-12" }),
    db().collection("schedule").doc("sec-other-slot").set({ studentId: "s2", teacherUid: "other-teacher", teacher: "Other", date: "2026-10-12" }),
  ]);
  assert.equal((await documentRequest(token, "DELETE", "schedule/sec-other-slot")).status, 403);
  assert.equal((await documentRequest(token, "DELETE", "schedule/sec-own-slot")).status, 200);
});
