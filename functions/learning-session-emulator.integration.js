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
  if (activeProject !== PROJECT_ID) throw new Error(`Refusing learning integration test for non-demo project: ${activeProject || "missing"}`);
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

async function postLearning(token, body) {
  const response = await fetch(
    `http://${FUNCTIONS_EMULATOR}/${PROJECT_ID}/us-central1/learningSessionApi`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json", Origin: "http://localhost:8080" },
      body: JSON.stringify(body),
    },
  );
  return { status: response.status, body: await response.json().catch(() => ({})) };
}

async function directFirestoreWrite(token, documentPath, fields) {
  const response = await fetch(
    `http://${FIRESTORE_EMULATOR}/v1/projects/${PROJECT_ID}/databases/(default)/documents/${documentPath}`,
    {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ fields }),
    },
  );
  return { status: response.status, body: await response.json().catch(() => ({})) };
}

function actionBase(sessionId, requestId) {
  return {
    sessionId,
    requestId,
    currentIndex: 0,
    phaseId: "diagnostic",
    activityId: "d1",
    skillIds: ["vocabulary"],
    route: "core",
    nextRoute: "support",
  };
}

test("Learning Session API persists append-only evidence without changing skillMap", async () => {
  requireSafeEmulatorEnvironment();
  if (!admin.apps.length) admin.initializeApp({ projectId: PROJECT_ID });
  const db = admin.firestore();

  const teacherToken = await createUserToken("learning-teacher@example.com");
  const outsiderToken = await createUserToken("learning-outsider@example.com");
  const teacherUid = tokenUid(teacherToken);
  const outsiderUid = tokenUid(outsiderToken);
  const studentId = "learning-student-001";

  await Promise.all([
    db.collection("users").doc(teacherUid).set({ role: "teacher", displayName: "Pavel", email: "learning-teacher@example.com" }),
    db.collection("users").doc(outsiderUid).set({ role: "teacher", displayName: "Other Teacher", email: "learning-outsider@example.com" }),
    db.collection("students").doc(studentId).set({
      name: "Learning Student",
      active: true,
      teacher: "Pavel",
      teacherUid,
      level: "B1",
      skillMap: { vocabulary: 64, speaking: 58 },
    }),
  ]);

  const outsiderStart = await postLearning(outsiderToken, {
    action: "start_or_resume",
    studentId,
    lessonBlueprintId: "est-b1-city-problem-solving-01",
    lessonTitle: "Probleemi lahendamine linnas",
    cefrLevel: "B1",
    currentIndex: 0,
    currentPhaseId: "diagnostic",
    currentActivityId: "d1",
    currentRoute: "core",
    skillIds: ["vocabulary"],
  });
  assert.equal(outsiderStart.status, 403, JSON.stringify(outsiderStart.body));

  const started = await postLearning(teacherToken, {
    action: "start_or_resume",
    studentId,
    lessonBlueprintId: "est-b1-city-problem-solving-01",
    lessonTitle: "Probleemi lahendamine linnas",
    cefrLevel: "B1",
    currentIndex: 0,
    currentPhaseId: "diagnostic",
    currentActivityId: "d1",
    currentRoute: "core",
    skillIds: ["vocabulary"],
  });
  assert.equal(started.status, 200, JSON.stringify(started.body));
  assert.equal(started.body.resumed, false);
  const sessionId = started.body.session.id;
  assert.equal(started.body.session.status, "active");
  assert.equal(started.body.session.evidenceCount, 0);

  const resumed = await postLearning(teacherToken, {
    action: "start_or_resume",
    studentId,
    lessonBlueprintId: "est-b1-city-problem-solving-01",
    lessonTitle: "Probleemi lahendamine linnas",
    cefrLevel: "B1",
    currentIndex: 0,
    currentPhaseId: "diagnostic",
    currentActivityId: "d1",
    currentRoute: "core",
    skillIds: ["vocabulary"],
  });
  assert.equal(resumed.status, 200, JSON.stringify(resumed.body));
  assert.equal(resumed.body.resumed, true);
  assert.equal(resumed.body.session.id, sessionId);

  const progress = await postLearning(teacherToken, {
    action: "progress",
    sessionId,
    currentIndex: 1,
    currentPhaseId: "diagnostic",
    currentActivityId: "d2",
    currentRoute: "core",
    skillIds: ["speaking"],
  });
  assert.equal(progress.status, 200, JSON.stringify(progress.body));
  assert.equal(progress.body.session.currentIndex, 1);
  assert.equal(progress.body.session.evidenceCount, 0);

  const judgeBody = {
    action: "judge",
    ...actionBase(sessionId, "judge_learning_0001"),
    teacherJudgement: "needs_help",
  };
  const judged = await postLearning(teacherToken, judgeBody);
  assert.equal(judged.status, 200, JSON.stringify(judged.body));
  assert.equal(judged.body.idempotent, false);
  assert.equal(judged.body.session.evidenceCount, 1);
  assert.equal(judged.body.session.currentRoute, "support");
  assert.ok(judged.body.session.assessedSkillIds.includes("vocabulary"));

  const judgedRetry = await postLearning(teacherToken, judgeBody);
  assert.equal(judgedRetry.status, 200, JSON.stringify(judgedRetry.body));
  assert.equal(judgedRetry.body.idempotent, true);
  assert.equal(judgedRetry.body.session.evidenceCount, 1);

  const vocabulary = await postLearning(teacherToken, {
    action: "vocabulary",
    ...actionBase(sessionId, "vocab_learning_0001"),
    nextRoute: "support",
    wordId: "rike",
    mark: "weak",
  });
  assert.equal(vocabulary.status, 200, JSON.stringify(vocabulary.body));
  assert.equal(vocabulary.body.session.evidenceCount, 2);

  const directWrite = await directFirestoreWrite(teacherToken, "learningEvidence/direct-client-write", {
    sessionId: { stringValue: sessionId },
    studentId: { stringValue: studentId },
  });
  assert.equal(directWrite.status, 403, JSON.stringify(directWrite.body));

  const beforeCompleteStudent = (await db.collection("students").doc(studentId).get()).data();
  const completed = await postLearning(teacherToken, {
    action: "complete",
    sessionId,
    requestId: "complete_learning_0001",
    route: "support",
    scores: { vocabulary: 72, grammar: "", speaking: 61 },
    teacherNote: "Korda viisakat abipalvet.",
    handoffText: "Vocabulary 72, speaking 61. Start next lesson with targeted review.",
  });
  assert.equal(completed.status, 200, JSON.stringify(completed.body));
  assert.equal(completed.body.session.status, "completed");
  assert.equal(completed.body.session.evidenceCount, 4);
  assert.ok(completed.body.session.assessedSkillIds.includes("speaking"));

  const evidenceSnap = await db.collection("learningEvidence").where("sessionId", "==", sessionId).get();
  assert.equal(evidenceSnap.size, 4);
  const evidence = evidenceSnap.docs.map((doc) => doc.data());
  assert.equal(evidence.filter((item) => item.kind === "teacher_judgement").length, 1);
  assert.equal(evidence.filter((item) => item.kind === "vocabulary_mark").length, 1);
  assert.equal(evidence.filter((item) => item.kind === "summary_score").length, 2);
  assert.ok(evidence.every((item) => item.source === "teacher"));

  const afterCompleteStudent = (await db.collection("students").doc(studentId).get()).data();
  assert.deepEqual(afterCompleteStudent.skillMap, beforeCompleteStudent.skillMap, "Learning Session must not mutate canonical skillMap in this slice");

  const afterCompleteJudge = await postLearning(teacherToken, {
    action: "judge",
    ...actionBase(sessionId, "judge_learning_after_complete"),
    teacherJudgement: "managed",
  });
  assert.equal(afterCompleteJudge.status, 409, JSON.stringify(afterCompleteJudge.body));
});