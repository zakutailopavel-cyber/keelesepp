"use strict";

// Homework rules: the student marks their own task done with an answer; only staff close a task („Suletud”).

const test = require("node:test");
const assert = require("node:assert/strict");
const admin = require("firebase-admin");

const PROJECT_ID = "demo-keelesepp-finance";
const AUTH_EMULATOR = process.env.FIREBASE_AUTH_EMULATOR_HOST;
const FIRESTORE_EMULATOR = process.env.FIRESTORE_EMULATOR_HOST;

function requireSafeEmulatorEnvironment() {
  const activeProject = process.env.GCLOUD_PROJECT || process.env.GOOGLE_CLOUD_PROJECT || "";
  if (activeProject !== PROJECT_ID) throw new Error(`Refusing homework rules test for non-demo project: ${activeProject || "missing"}`);
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

const documentName = (path) => `projects/${PROJECT_ID}/databases/(default)/documents/${path}`;

function encode(value) {
  if (value === null) return { nullValue: null };
  if (typeof value === "boolean") return { booleanValue: value };
  if (typeof value === "number") return Number.isInteger(value) ? { integerValue: String(value) } : { doubleValue: value };
  if (typeof value === "string") return { stringValue: value };
  if (Array.isArray(value)) return { arrayValue: { values: value.map(encode) } };
  if (typeof value === "object") return { mapValue: { fields: Object.fromEntries(Object.entries(value).map(([key, item]) => [key, encode(item)])) } };
  throw new Error(`Unsupported value ${value}`);
}

async function commit(token, writes) {
  const response = await fetch(`http://${FIRESTORE_EMULATOR}/v1/projects/${PROJECT_ID}/databases/(default)/documents:commit`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ writes }),
  });
  return { status: response.status, body: await response.json().catch(() => ({})) };
}

function createElement(path, uid, data) {
  return {
    update: {
      name: documentName(path),
      fields: Object.fromEntries(Object.entries({ ...data, updatedByUid: uid, updatedByName: "Emulator", lastClientId: "c1", revision: 1 }).map(([key, value]) => [key, encode(value)])),
    },
    currentDocument: { exists: false },
    updateTransforms: [{ fieldPath: "updatedAt", setToServerValue: "REQUEST_TIME" }],
  };
}

// the same write on an existing element (move / resize)
function updateElement(path, uid, data) {
  return { ...createElement(path, uid, data), currentDocument: { exists: true } };
}


async function seed() {
  if (!admin.apps.length) admin.initializeApp({ projectId: PROJECT_ID });
  const db = admin.firestore();
  const suffix = Date.now().toString(36);
  const teacherToken = await createUserToken(`hw-teacher-${suffix}@example.com`);
  const studentToken = await createUserToken(`hw-student-${suffix}@example.com`);
  const teacherUid = tokenUid(teacherToken);
  const studentUid = tokenUid(studentToken);
  const studentId = `hw-student-${suffix}`;
  await Promise.all([
    db.collection("users").doc(teacherUid).set({ role: "teacher", displayName: "Hw Teacher" }),
    db.collection("users").doc(studentUid).set({ role: "student", displayName: "Hw Student" }),
    db.collection("students").doc(studentId).set({ name: "Hw Student", teacher: "Hw Teacher", teacherUid, teacherUids: [teacherUid], linkedUserId: studentUid, studentUid, active: true }),
    db.collection("homework").doc(`hw-${suffix}`).set({ studentId, studentName: "Hw Student", task: "Kirjuta 5 lauset", status: "Ootel", due: "2026-10-20" }),
  ]);
  return { teacherToken, studentToken, homeworkId: `hw-${suffix}` };
}

function patch(path, fields) {
  return {
    update: { name: documentName(path), fields: Object.fromEntries(Object.entries(fields).map(([key, value]) => [key, encode(value)])) },
    updateMask: { fieldPaths: Object.keys(fields) },
  };
}

test("the student finishes their task with an answer; closing is for staff", async () => {
  requireSafeEmulatorEnvironment();
  const ctx = await seed();
  const path = `homework/${ctx.homeworkId}`;
  assert.ok((await admin.firestore().doc(path).get()).exists, "seeded task exists");
  const done = await commit(ctx.studentToken, [patch(path, { status: "Tehtud", studentAnswer: "Ma käisin poes.", submittedAt: "2026-10-09T10:00:00Z", updatedAt: "2026-10-09T10:00:00Z" })]);
  assert.equal(done.status, 200, JSON.stringify(done.body));
  const files = await commit(ctx.studentToken, [patch(path, { studentFiles: [{ name: "vihik.jpg", url: "https://x/vihik.jpg" }] })]);
  assert.equal(files.status, 200, JSON.stringify(files.body));
  const closed = await commit(ctx.studentToken, [patch(path, { status: "Suletud" })]);
  assert.equal(closed.status, 403, "a student cannot close a task");
  const long = await commit(ctx.studentToken, [patch(path, { studentAnswer: "x".repeat(4001) })]);
  assert.equal(long.status, 403);
  const task = await commit(ctx.studentToken, [patch(path, { task: "Muudetud" })]);
  assert.equal(task.status, 403, "the task text stays the teacher's");
  const staff = await commit(ctx.teacherToken, [patch(path, { status: "Suletud" })]);
  assert.equal(staff.status, 200, JSON.stringify(staff.body));
});
