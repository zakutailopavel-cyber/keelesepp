"use strict";
// Live Classroom lesson plan + in-room attendance (`liveLessonPlans/{roomKey}`) against the real Firestore rules:
// only the room's teacher writes, the student of the room never reads it, the shape is fixed.
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
    body: JSON.stringify({ email: `plan-${role}-${Date.now()}-${Math.random().toString(36).slice(2)}@example.com`, password: "emulator-only-password", returnSecureToken: true }),
  });
  const body = await response.json();
  const uid = JSON.parse(Buffer.from(body.idToken.split(".")[1], "base64url")).sub;
  await db.doc(`users/${uid}`).set({ role });
  return { token: body.idToken, uid };
}
function encode(value) {
  if (value === null) return { nullValue: null };
  if (Array.isArray(value)) return { arrayValue: { values: value.map(encode) } };
  if (typeof value === "boolean") return { booleanValue: value };
  if (typeof value === "number") return Number.isInteger(value) ? { integerValue: String(value) } : { doubleValue: value };
  if (typeof value === "object") return { mapValue: { fields: Object.fromEntries(Object.entries(value).map(([k, v]) => [k, encode(v)])) } };
  return { stringValue: String(value) };
}
const write = (path, data) => ({ update: { name: name(path), fields: Object.fromEntries(Object.entries(data).map(([k, v]) => [k, encode(v)])) } });
async function commit(who, writes) {
  const response = await fetch(`http://${DB}/v1/projects/${PROJECT_ID}/databases/(default)/documents:commit`, {
    method: "POST", headers: { Authorization: `Bearer ${who.token}`, "Content-Type": "application/json" }, body: JSON.stringify({ writes }),
  });
  return response.status;
}
async function read(who, path) {
  return (await fetch(`http://${DB}/v1/projects/${PROJECT_ID}/databases/(default)/documents/${path}`, { headers: { Authorization: `Bearer ${who.token}` } })).status;
}

const plan = (teacherUid, roomKey, extra = {}) => ({
  teacherUid, roomKey, kind: "lesson",
  steps: [{ id: "warmup", label: "Soojendus", minutes: 5, spentMs: 0 }, { id: "summary", label: "Kokkuvõte", minutes: 5, spentMs: 0 }],
  current: 0, startedAt: "2026-11-04T16:00:00.000Z", stepStartedAt: "2026-11-04T16:00:00.000Z", plannedStart: "",
  attendance: { s1: { name: "Mari", status: "late", lateMinutes: 7, joinedAt: "2026-11-04T16:07:00.000Z" } },
  updatedAt: "2026-11-04T16:08:00.000Z", ...extra,
});

test("only the room's teacher writes the lesson plan; the student cannot read it", async () => {
  safe();
  if (!admin.apps.length) admin.initializeApp({ projectId: PROJECT_ID });
  const db = admin.firestore();
  const [teacher, other, student, adminUser] = await Promise.all([account("teacher", db), account("teacher", db), account("student", db), account("admin", db)]);
  const suffix = Math.random().toString(36).slice(2);
  const inv = `inv-plan-${suffix}`;
  const group = `room-plan-${suffix}`;
  await db.doc(`liveLessonInvitations/${inv}`).set({ teacherUid: teacher.uid, studentUid: student.uid, studentId: "s1", roomKey: inv, status: "accepted" });
  await db.doc(`liveGroupRooms/${group}`).set({ teacherUid: teacher.uid, memberUids: [student.uid], members: [], status: "open" });

  assert.equal(await read(teacher, `liveLessonPlans/${inv}`), 404, "the teacher may look before a plan exists");
  assert.equal(await commit(teacher, [write(`liveLessonPlans/${inv}`, plan(teacher.uid, inv))]), 200);
  assert.equal(await commit(teacher, [write(`liveLessonPlans/${group}`, plan(teacher.uid, group, { kind: "group" }))]), 200, "a group room");
  assert.equal(await commit(other, [write(`liveLessonPlans/${inv}-x`, plan(other.uid, `${inv}-x`))]), 403, "no such room");
  assert.equal(await commit(other, [write(`liveLessonPlans/${inv}`, plan(other.uid, inv))]), 403, "another teacher's room");
  assert.equal(await commit(student, [write(`liveLessonPlans/${inv}`, plan(student.uid, inv))]), 403, "the student");
  assert.equal(await commit(teacher, [write(`liveLessonPlans/${inv}`, plan(teacher.uid, inv, { extra: 1 }))]), 403, "unknown field");
  assert.equal(await commit(teacher, [write(`liveLessonPlans/${inv}`, plan(teacher.uid, "other"))]), 403, "roomKey must match");
  assert.equal(await commit(teacher, [write(`liveLessonPlans/${inv}`, plan(teacher.uid, inv, { steps: Array.from({ length: 13 }, () => ({ id: "x", label: "x", minutes: 1, spentMs: 0 })) }))]), 403, "at most 12 steps");
  assert.equal(await commit(teacher, [write(`liveLessonPlans/${inv}`, plan(teacher.uid, inv, { current: 1 }))]), 200, "next step");

  assert.equal(await read(teacher, `liveLessonPlans/${inv}`), 200);
  assert.equal(await read(adminUser, `liveLessonPlans/${inv}`), 200);
  assert.equal(await read(student, `liveLessonPlans/${inv}`), 403, "the student never reads the plan or the marks");
  assert.equal(await read(other, `liveLessonPlans/${inv}`), 403);
});
