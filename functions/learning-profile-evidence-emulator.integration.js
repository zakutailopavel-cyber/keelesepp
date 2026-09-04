"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const admin = require("firebase-admin");

const PROJECT_ID = "demo-keelesepp-finance";
const AUTH_EMULATOR = process.env.FIREBASE_AUTH_EMULATOR_HOST;
const FIRESTORE_EMULATOR = process.env.FIRESTORE_EMULATOR_HOST;
const FUNCTIONS_EMULATOR = process.env.FUNCTIONS_EMULATOR_HOST || "127.0.0.1:5001";

function requireSafeEmulatorEnvironment() {
  const activeProject = process.env.GCLOUD_PROJECT || process.env.GOOGLE_CLOUD_PROJECT || "";
  if (activeProject !== PROJECT_ID) throw new Error(`Refusing profile evidence integration test for non-demo project: ${activeProject || "missing"}`);
  for (const [name, host] of [["Auth", AUTH_EMULATOR], ["Firestore", FIRESTORE_EMULATOR], ["Functions", FUNCTIONS_EMULATOR]]) {
    if (!host || !/^(127\.0\.0\.1|localhost):\d+$/.test(host)) throw new Error(`Unsafe ${name} emulator host: ${host || "missing"}`);
  }
}

function tokenUid(token) {
  const payload = JSON.parse(Buffer.from(token.split(".")[1], "base64url").toString("utf8"));
  return payload.user_id || payload.sub;
}

async function createUserToken(email) {
  const response = await fetch(
    `http://${AUTH_EMULATOR}/identitytoolkit.googleapis.com/v1/accounts:signUp?key=demo-key`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password: "emulator-only-password", returnSecureToken: true }),
    },
  );
  const body = await response.json();
  if (!response.ok || !body.idToken) throw new Error(`Unable to create emulator user token: ${response.status} ${JSON.stringify(body)}`);
  return body.idToken;
}

async function postProfileEvidence(token, body) {
  const headers = { "Content-Type": "application/json", Origin: "http://localhost:8080" };
  if (token) headers.Authorization = `Bearer ${token}`;
  const response = await fetch(
    `http://${FUNCTIONS_EMULATOR}/${PROJECT_ID}/us-central1/learningProfileEvidenceApi`,
    { method: "POST", headers, body: JSON.stringify(body) },
  );
  return { status: response.status, body: await response.json().catch(() => ({})) };
}

async function directFirestoreRead(token, documentPath) {
  const response = await fetch(
    `http://${FIRESTORE_EMULATOR}/v1/projects/${PROJECT_ID}/databases/(default)/documents/${documentPath}`,
    { headers: { Authorization: `Bearer ${token}` } },
  );
  return { status: response.status, body: await response.json().catch(() => ({})) };
}

test("Learning Profile evidence API exposes scoped adaptive evidence without changing skillMap", async () => {
  requireSafeEmulatorEnvironment();
  if (!admin.apps.length) admin.initializeApp({ projectId: PROJECT_ID });
  const db = admin.firestore();

  const teacherToken = await createUserToken("profile-evidence-teacher@example.com");
  const outsiderToken = await createUserToken("profile-evidence-outsider@example.com");
  const teacherUid = tokenUid(teacherToken);
  const outsiderUid = tokenUid(outsiderToken);
  const studentId = "profile-evidence-student-001";
  const sessionId = "profile-evidence-session-001";
  const beforeSkillMap = { vocabulary: 64, speaking: 58 };

  await Promise.all([
    db.collection("users").doc(teacherUid).set({ role: "teacher", displayName: "Pavel" }),
    db.collection("users").doc(outsiderUid).set({ role: "teacher", displayName: "Other Teacher" }),
    db.collection("students").doc(studentId).set({
      id: "shadowed-student-id-must-not-win",
      name: "Profile Evidence Student",
      active: true,
      teacher: "Pavel",
      teacherUid,
      level: "B1",
      skillMap: beforeSkillMap,
    }),
    db.collection("learningSessions").doc(sessionId).set({
      studentId,
      teacherUid,
      teacherName: "Pavel",
      lessonBlueprintId: "est-b1-city-problem-solving-01",
      lessonTitle: "Probleemi lahendamine linnas",
      curriculumGoalIds: ["goal-city-help"],
      cefrLevel: "B1",
      status: "completed",
      teacherNote: "Repeat vocabulary before transfer.",
      handoff: { text: "Start with rike, then speaking transfer." },
      completedAt: admin.firestore.Timestamp.fromDate(new Date("2026-09-04T10:05:00Z")),
    }),
    db.collection("learningEvidence").doc("profile_ev_old").set({
      sessionId, studentId, teacherUid,
      lessonBlueprintId: "est-b1-city-problem-solving-01",
      phaseId: "vocabulary", activityId: "word-rike",
      skillIds: ["vocabulary"], vocabularyIds: ["rike"],
      route: "support", teacherJudgement: "needs_help", source: "teacher", kind: "vocabulary_mark", note: "",
      createdAt: admin.firestore.Timestamp.fromDate(new Date("2026-09-04T10:00:00Z")),
    }),
    db.collection("learningEvidence").doc("profile_ev_new").set({
      sessionId, studentId, teacherUid,
      lessonBlueprintId: "est-b1-city-problem-solving-01",
      phaseId: "stage-4-exit", activityId: "summary-speaking",
      skillIds: ["speaking"], vocabularyIds: [],
      route: "support", taskResult: 61, source: "teacher", kind: "summary_score", note: "",
      createdAt: admin.firestore.Timestamp.fromDate(new Date("2026-09-04T10:04:00Z")),
    }),
  ]);

  const unauthenticated = await postProfileEvidence("", { studentId });
  assert.equal(unauthenticated.status, 401, JSON.stringify(unauthenticated.body));

  const outsider = await postProfileEvidence(outsiderToken, { studentId });
  assert.equal(outsider.status, 403, JSON.stringify(outsider.body));

  const response = await postProfileEvidence(teacherToken, { studentId, limit: 10 });
  assert.equal(response.status, 200, JSON.stringify(response.body));
  assert.equal(response.body.student.id, studentId, "Firestore document id must override any stored id field");
  assert.deepEqual(response.body.evidence.map((item) => item.id), ["profile_ev_new", "profile_ev_old"]);
  assert.equal(response.body.sessions.length, 1);
  assert.equal(response.body.sessions[0].id, sessionId);
  assert.equal(response.body.sessions[0].lessonTitle, "Probleemi lahendamine linnas");
  assert.equal(response.body.sessions[0].handoffText, "Start with rike, then speaking transfer.");

  const limited = await postProfileEvidence(teacherToken, { studentId, limit: 1 });
  assert.equal(limited.status, 200, JSON.stringify(limited.body));
  assert.deepEqual(limited.body.evidence.map((item) => item.id), ["profile_ev_new"]);

  const directRead = await directFirestoreRead(teacherToken, `learningEvidence/profile_ev_new`);
  assert.equal(directRead.status, 403, JSON.stringify(directRead.body));

  const afterStudent = (await db.collection("students").doc(studentId).get()).data();
  assert.deepEqual(afterStudent.skillMap, beforeSkillMap, "profile evidence projection must not mutate canonical skillMap");
});
