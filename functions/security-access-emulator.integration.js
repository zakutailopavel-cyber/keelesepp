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

async function runQuery(token, collectionId, where) {
  const response = await fetch(`http://${FIRESTORE_EMULATOR}/v1/projects/${PROJECT_ID}/databases/(default)/documents:runQuery`, {
    method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ structuredQuery: { from: [{ collectionId }], ...(where ? { where } : {}) } }),
  });
  const body = await response.json().catch(() => ({}));
  return { status: response.status, count: Array.isArray(body) ? body.filter(item => item.document).length : 0 };
}

// Owner decision 2026-10-11: a teacher sees homework, submissions and messages only of their own students.
test("a teacher reads and writes homework, submissions and messages only of their own students", async () => {
  requireSafeEmulatorEnvironment();
  const teacher = await account("sec-own-teacher@example.com", { role: "teacher", roles: ["teacher"], displayName: "Own Teacher" });
  const uid = tokenUid(teacher);
  await Promise.all([
    db().collection("students").doc("sec-own-card").set({ name: "Own Card", teacher: "Own Teacher", teacherUid: uid, teacherUids: [uid], active: true }),
    db().collection("students").doc("sec-second-card").set({ name: "Second Teacher Card", teacher: "Main Teacher", teacherUid: "main-teacher", teacherUids: ["main-teacher", uid], active: true }),
    db().collection("students").doc("sec-name-card").set({ name: "Name Only Card", teacher: "Own Teacher", active: true }),
    db().collection("students").doc("sec-foreign-card").set({ name: "Foreign Card", teacher: "Other Teacher", teacherUid: "other-teacher", teacherUids: ["other-teacher"], active: true }),
  ]);
  const collections = ["homework", "messages", "worksheetAssignments", "exerciseResults"];
  await Promise.all(collections.flatMap(name => ["sec-own-card", "sec-second-card", "sec-name-card", "sec-foreign-card"].map(studentId =>
    db().collection(name).doc(`${name}-${studentId}`).set({ studentId, text: "x", task: "x", read: false, status: "Ootel" }))));
  const inFilter = ids => ({ fieldFilter: { field: { fieldPath: "studentId" }, op: "IN", value: { arrayValue: { values: ids.map(str) } } } });

  for (const enforced of [true, false]) {
    await db().collection("securityMigrations").doc("teacherUidV1").set({ readEnforced: enforced }, { merge: true });
    for (const name of collections) {
      assert.equal((await documentRequest(teacher, "GET", `${name}/${name}-sec-own-card`)).status, 200, `${name} own ${enforced}`);
      assert.equal((await documentRequest(teacher, "GET", `${name}/${name}-sec-second-card`)).status, 200, `${name} second teacher ${enforced}`);
      assert.equal((await documentRequest(teacher, "GET", `${name}/${name}-sec-foreign-card`)).status, 403, `${name} foreign ${enforced}`);
      // a name-only card counts only until teacher scope is enforced
      assert.equal((await documentRequest(teacher, "GET", `${name}/${name}-sec-name-card`)).status, enforced ? 403 : 200, `${name} name-only ${enforced}`);
      const own = await runQuery(teacher, name, inFilter(["sec-own-card", "sec-second-card"]));
      assert.deepEqual([own.status, own.count], [200, 2], `${name} own query ${enforced}`);
      assert.equal((await runQuery(teacher, name, inFilter(["sec-own-card", "sec-foreign-card"]))).status, 403, `${name} mixed query ${enforced}`);
      assert.equal((await runQuery(teacher, name)).status, 403, `${name} whole collection ${enforced}`);
    }
  }

  const create = (studentId) => documentRequest(teacher, "PATCH", `homework/sec-new-${studentId}`, { fields: { studentId: str(studentId), task: str("Uus"), status: str("Ootel") } });
  assert.equal((await create("sec-foreign-card")).status, 403);
  assert.equal((await create("sec-own-card")).status, 200);
  const message = (studentId) => documentRequest(teacher, "PATCH", `messages/sec-new-${studentId}`, { fields: { studentId: str(studentId), text: str("Tere"), fromUid: str(uid), fromRole: str("teacher") } });
  assert.equal((await message("sec-foreign-card")).status, 403);
  assert.equal((await message("sec-own-card")).status, 200);
  // moving an own homework to a foreign student is not a way around it
  assert.equal((await documentRequest(teacher, "PATCH", "homework/homework-sec-own-card?updateMask.fieldPaths=studentId", { fields: { studentId: str("sec-foreign-card") } })).status, 403);
  assert.equal((await documentRequest(teacher, "DELETE", "homework/homework-sec-foreign-card")).status, 403);

  const adminQuery = await runQuery(await adminToken(), "homework");
  assert.equal(adminQuery.status, 200);
  assert.equal((await documentRequest(await adminToken(), "GET", "messages/messages-sec-foreign-card")).status, 200);
});

// Owner decision 2026-10-20: a teacher of one subject of a shared child reads only their own lessons and schedule.
test("two teachers of one child: each reads only their own subject's lessons and schedule", async () => {
  requireSafeEmulatorEnvironment();
  const maths = await account("sec-maths-teacher@example.com", { role: "teacher", roles: ["teacher"], displayName: "Maths Teacher" });
  const mathsUid = tokenUid(maths);
  await db().collection("securityMigrations").doc("teacherUidV1").set({ readEnforced: true }, { merge: true });
  await Promise.all([
    db().collection("students").doc("sec-shared-child").set({ name: "Shared Child", teacher: "Estonian Teacher", teacherUid: "est-teacher", teacherUids: ["est-teacher", mathsUid], active: true,
      enrollments: [{ subject: "Eesti keel", teacher: "Estonian Teacher", teacherUid: "est-teacher" }, { subject: "Matemaatika", teacher: "Maths Teacher", teacherUid: mathsUid }] }),
    db().collection("lessons").doc("sec-shared-est").set({ studentId: "sec-shared-child", teacherUid: "est-teacher", subject: "Eesti keel", date: "2026-10-12", status: "Toimunud" }),
    db().collection("lessons").doc("sec-shared-math").set({ studentId: "sec-shared-child", teacherUid: mathsUid, subject: "Matemaatika", date: "2026-10-13", status: "Toimunud" }),
    db().collection("schedule").doc("sec-shared-est-slot").set({ studentId: "sec-shared-child", teacherUid: "est-teacher", date: "2026-10-20" }),
    db().collection("schedule").doc("sec-shared-math-slot").set({ studentId: "sec-shared-child", teacherUid: mathsUid, date: "2026-10-21" }),
  ]);
  const eq = (field, value) => ({ fieldFilter: { field: { fieldPath: field }, op: "EQUAL", value: str(value) } });
  const both = (a, b) => ({ compositeFilter: { op: "AND", filters: [a, b] } });
  assert.equal((await documentRequest(maths, "GET", "students/sec-shared-child")).status, 200);
  for (const name of ["lessons", "schedule"]) {
    const own = await runQuery(maths, name, both(eq("studentId", "sec-shared-child"), eq("teacherUid", mathsUid)));
    assert.deepEqual([own.status, own.count], [200, 1], `${name} own subject`);
    assert.equal((await runQuery(maths, name, eq("studentId", "sec-shared-child"))).status, 403, `${name} whole child`);
  }
  assert.equal((await documentRequest(maths, "GET", "lessons/sec-shared-est")).status, 403);
  assert.equal((await documentRequest(maths, "GET", "lessons/sec-shared-math")).status, 200);
  await db().collection("securityMigrations").doc("teacherUidV1").set({ readEnforced: false }, { merge: true });
});
