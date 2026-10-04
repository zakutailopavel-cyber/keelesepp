"use strict";

// Esmane hindamine (studentInitialAssessments/{studentId}) against the emulator with the exact document CRM v2 writes
// (crm-v2/src/features/initial-assessment/assessmentModel.js): the student's teacher creates and updates it, creation
// fields are immutable, another teacher and the student cannot write it.

const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const { pathToFileURL } = require("node:url");
const admin = require("firebase-admin");

const PROJECT_ID = "demo-keelesepp-finance";
const AUTH_EMULATOR = process.env.FIREBASE_AUTH_EMULATOR_HOST;
const FIRESTORE_EMULATOR = process.env.FIRESTORE_EMULATOR_HOST;

function requireSafeEmulatorEnvironment() {
  const activeProject = process.env.GCLOUD_PROJECT || process.env.GOOGLE_CLOUD_PROJECT || "";
  if (activeProject !== PROJECT_ID) throw new Error(`Refusing assessment rules test for non-demo project: ${activeProject || "missing"}`);
  if (!/^(127\.0\.0\.1|localhost):\d+$/.test(AUTH_EMULATOR || "")) throw new Error(`Unsafe Auth emulator host: ${AUTH_EMULATOR}`);
  if (!/^(127\.0\.0\.1|localhost):\d+$/.test(FIRESTORE_EMULATOR || "")) throw new Error(`Unsafe Firestore emulator host: ${FIRESTORE_EMULATOR}`);
}

const tokenUid = (token) => JSON.parse(Buffer.from(token.split(".")[1], "base64url").toString("utf8")).user_id;

async function createUserToken(email) {
  const response = await fetch(`http://${AUTH_EMULATOR}/identitytoolkit.googleapis.com/v1/accounts:signUp?key=demo-key`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password: "emulator-only-password", returnSecureToken: true }),
  });
  const body = await response.json();
  if (!response.ok || !body.idToken) throw new Error(`Unable to create emulator user token: ${response.status}`);
  return body.idToken;
}

function encode(value) {
  if (value === null || value === undefined) return { nullValue: null };
  if (typeof value === "boolean") return { booleanValue: value };
  if (typeof value === "number") return Number.isInteger(value) ? { integerValue: String(value) } : { doubleValue: value };
  if (typeof value === "string") return { stringValue: value };
  if (Array.isArray(value)) return { arrayValue: { values: value.map(encode) } };
  return { mapValue: { fields: Object.fromEntries(Object.entries(value).map(([key, item]) => [key, encode(item)])) } };
}

async function write(token, studentId, data) {
  const name = `projects/${PROJECT_ID}/databases/(default)/documents/studentInitialAssessments/${studentId}`;
  const response = await fetch(`http://${FIRESTORE_EMULATOR}/v1/projects/${PROJECT_ID}/databases/(default)/documents:commit`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ writes: [{ update: { name, fields: encode(data).mapValue.fields } }] }),
  });
  return { status: response.status, body: await response.json().catch(() => ({})) };
}

test("CRM v2 initial assessment document passes the rules for the student's teacher only", async () => {
  requireSafeEmulatorEnvironment();
  const model = await import(pathToFileURL(path.join(__dirname, "../crm-v2/src/features/initial-assessment/assessmentModel.js")).href);
  if (!admin.apps.length) admin.initializeApp({ projectId: PROJECT_ID });
  const db = admin.firestore();
  const suffix = Date.now().toString(36);
  const teacherToken = await createUserToken(`ia-teacher-${suffix}@example.com`);
  const otherToken = await createUserToken(`ia-other-${suffix}@example.com`);
  const studentToken = await createUserToken(`ia-student-${suffix}@example.com`);
  const teacherUid = tokenUid(teacherToken);
  const studentId = `ia-student-${suffix}`;
  await Promise.all([
    db.collection("users").doc(teacherUid).set({ role: "teacher", displayName: "IA Teacher" }),
    db.collection("users").doc(tokenUid(otherToken)).set({ role: "teacher", displayName: "Other" }),
    db.collection("users").doc(tokenUid(studentToken)).set({ role: "student", displayName: "IA Student" }),
    db.collection("students").doc(studentId).set({ name: "IA Student", teacher: "IA Teacher", teacherUid, teacherUids: [teacherUid], linkedUserId: tokenUid(studentToken), active: true }),
  ]);
  const student = { id: studentId, level: "B1", targetLevel: "B2" };
  const teacher = { uid: teacherUid, displayName: "IA Teacher" };

  const draft = model.buildInitialAssessment(student, teacher);
  draft.grammarData[0].score = 0;
  draft.grammarData.push({ id: "custom_haaldus", name: "Hääldus", score: 40, status: "needs_work", priority: "high", comment: "" });
  const created = model.assessmentPayload({ ...draft, strengths: "Julge" }, student, teacher, null);
  const first = await write(teacherToken, studentId, created);
  assert.equal(first.status, 200, JSON.stringify(first.body));

  const updated = model.assessmentPayload({ ...created, overallStatus: "developing" }, student, teacher, created);
  const second = await write(teacherToken, studentId, updated);
  assert.equal(second.status, 200, JSON.stringify(second.body));

  const forged = await write(teacherToken, studentId, { ...updated, createdByUid: "someone-else" });
  assert.equal(forged.status, 403);
  // Another teacher is kept out once teacher scope is enforced (in legacy mode every teacher reads every student).
  const flag = db.doc("securityMigrations/teacherUidV1");
  const previous = await flag.get();
  await flag.set({ readEnforced: true }, { merge: true });
  try {
    const other = await write(otherToken, studentId, updated);
    assert.equal(other.status, 403);
    const stillTeacher = await write(teacherToken, studentId, updated);
    assert.equal(stillTeacher.status, 200, JSON.stringify(stillTeacher.body));
  } finally {
    if (previous.exists) await flag.set(previous.data());
    else await flag.delete();
  }
  const own = await write(studentToken, studentId, updated);
  assert.equal(own.status, 403);
  const extraKey = await write(teacherToken, studentId, { ...updated, secret: "x" });
  assert.equal(extraKey.status, 403);
});
