"use strict";

// „Õpi ise” (owner 2026-10-12): a student may open a course sheet as his own worksheet assignment — only for his own
// card, unscored, and only with the sheet exactly as published; never someone else's card or his own content.
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
async function student(email, studentId) {
  let token;
  try { token = await auth("signUp", email); } catch { token = await auth("signInWithPassword", email); }
  const uid = tokenUid(token);
  await db().collection("users").doc(uid).set({ email, role: "student", roles: ["student"] });
  await db().collection("students").doc(studentId).set({ name: "Self Learner", studentUid: uid, linkedUserId: uid, email, active: true });
  return { token, uid };
}
// JS value → Firestore REST value
function value(v) {
  if (v === null) return { nullValue: null };
  if (Array.isArray(v)) return { arrayValue: { values: v.map(value) } };
  if (typeof v === "object") return { mapValue: { fields: Object.fromEntries(Object.entries(v).map(([k, x]) => [k, value(x)])) } };
  if (typeof v === "number") return { integerValue: String(v) };
  return { stringValue: String(v) };
}
async function create(token, path, data) {
  const response = await fetch(`http://${FIRESTORE_EMULATOR}/v1/projects/${PROJECT_ID}/databases/(default)/documents/${path}`, {
    method: "PATCH", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ fields: Object.fromEntries(Object.entries(data).map(([k, x]) => [k, value(x)])) }),
  });
  return { status: response.status, body: await response.json().catch(() => ({})) };
}

const SHEET = { meta: { phase: "practice", title: "Harjuta" }, blocks: [{ id: "b1", type: "text", data: { heading: "Tere", text: "Tekst" } }] };

test("a student opens a published course sheet as his own self-study worksheet, nothing more", async () => {
  requireSafeEmulatorEnvironment();
  await db().doc("curriculumLessons/ss-lesson").set({ title: "Pood", level: "B1" });
  await db().doc("curriculumLessons/ss-lesson/worksheets/practice").set({ worksheetId: "practice", publishedWorksheetDoc: SHEET });
  const { token, uid } = await student("self-learner@example.com", "ss-learner");
  await student("other-learner@example.com", "ss-other");
  const base = { lessonId: "ss-lesson", lessonTitle: "Pood", phase: "practice", subject: "Eesti keel", level: "B1", topic: "Pood",
    worksheetDoc: SHEET, files: [], studentId: "ss-learner", studentName: "Self Learner", assignedBy: uid, assignedByName: "",
    assignedAt: "2026-10-12T10:00:00Z", dueDate: "", note: "", status: "new", score: null, completedAt: "", answers: {}, source: "self_study" };

  const ok = await create(token, "worksheetAssignments/ss-1", base);
  assert.equal(ok.status, 200, JSON.stringify(ok.body));

  const forged = await create(token, "worksheetAssignments/ss-2", { ...base, worksheetDoc: { ...SHEET, blocks: [{ id: "x", type: "text", data: { heading: "Minu", text: "Oma" } }] } });
  assert.equal(forged.status, 403, "own content instead of the published sheet");
  const scored = await create(token, "worksheetAssignments/ss-3", { ...base, status: "done", score: { pct: 100 } });
  assert.equal(scored.status, 403, "a ready score");
  const other = await create(token, "worksheetAssignments/ss-4", { ...base, studentId: "ss-other" });
  assert.equal(other.status, 403, "someone else's card");
  const teacherSource = await create(token, "worksheetAssignments/ss-5", { ...base, source: "learning_library" });
  assert.equal(teacherSource.status, 403, "not marked as self-study");
});
