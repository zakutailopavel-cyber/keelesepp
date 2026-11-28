"use strict";

// liveInvitationApi in the emulators: the server writes liveLessonInvitations with the checks the rules used to make.
const test = require("node:test");
const assert = require("node:assert/strict");
const admin = require("firebase-admin");

const PROJECT_ID = "demo-keelesepp-finance";
const AUTH_EMULATOR = process.env.FIREBASE_AUTH_EMULATOR_HOST;
const FIRESTORE_EMULATOR = process.env.FIRESTORE_EMULATOR_HOST;
const FUNCTIONS_EMULATOR = process.env.FUNCTIONS_EMULATOR_HOST || "127.0.0.1:5001";

function requireSafeEmulatorEnvironment() {
  const activeProject = process.env.GCLOUD_PROJECT || process.env.GOOGLE_CLOUD_PROJECT || "";
  if (activeProject !== PROJECT_ID) throw new Error(`Refusing invitation API test for non-demo project: ${activeProject || "missing"}`);
  for (const host of [AUTH_EMULATOR, FIRESTORE_EMULATOR, FUNCTIONS_EMULATOR]) {
    if (!/^(127\.0\.0\.1|localhost):\d+$/.test(host || "")) throw new Error(`Unsafe emulator host: ${host || "missing"}`);
  }
}

function db() {
  if (!admin.apps.length) admin.initializeApp({ projectId: PROJECT_ID });
  return admin.firestore();
}

const tokenUid = (token) => { const payload = JSON.parse(Buffer.from(token.split(".")[1], "base64url").toString("utf8")); return payload.user_id || payload.sub; };

async function account(email, profile) {
  const response = await fetch(`http://${AUTH_EMULATOR}/identitytoolkit.googleapis.com/v1/accounts:signUp?key=demo-key`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password: "emulator-only-password", returnSecureToken: true }),
  });
  const body = await response.json();
  if (!response.ok || !body.idToken) throw new Error(`Unable to create emulator user: ${response.status} ${JSON.stringify(body)}`);
  await db().collection("users").doc(tokenUid(body.idToken)).set({ email, ...profile });
  return body.idToken;
}

async function api(token, path, payload = {}) {
  const response = await fetch(`http://${FUNCTIONS_EMULATOR}/${PROJECT_ID}/us-central1/liveInvitationApi${path}`, {
    method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, body: JSON.stringify(payload),
  });
  return { status: response.status, body: await response.json().catch(() => ({})) };
}

test("the server creates an invitation only for a teacher of the card and the card's own account", async () => {
  requireSafeEmulatorEnvironment();
  const stamp = Date.now();
  const teacher = await account(`inv-api-teacher-${stamp}@example.com`, { role: "teacher", roles: ["teacher"], displayName: "Kati Kask" });
  const other = await account(`inv-api-other-${stamp}@example.com`, { role: "teacher", roles: ["teacher"], displayName: "Rein Tamm" });
  const student = await account(`inv-api-student-${stamp}@example.com`, { role: "student", roles: ["student"], displayName: "Mari Mets" });
  const parent = await account(`inv-api-parent-${stamp}@example.com`, { role: "parent", roles: ["parent"], displayName: "Tiina Mets" });
  const teacherUid = tokenUid(teacher);
  const studentUid = tokenUid(student);
  const cardId = `inv-api-card-${stamp}`;
  await db().collection("students").doc(cardId).set({ name: "Mari Mets", active: true, teacherUid, teacherUids: [teacherUid], studentUid, linkedUserId: studentUid, linkedUserIds: [studentUid] });
  const body = { studentId: cardId, studentUid, studentName: "Mari Mets", teacherName: "Kati Kask", title: "Eesti keel", scheduleId: "sch-1", occurrenceDate: "2026-11-30" };

  assert.equal((await api(other, "/create", body)).status, 403);
  assert.equal((await api(student, "/create", body)).status, 403);
  assert.equal((await api(teacher, "/create", { ...body, studentUid: tokenUid(parent) })).status, 409);
  assert.equal((await api(teacher, "/create", { ...body, title: "" })).status, 400);
  assert.equal((await api(teacher, "/create", { ...body, roomKey: "no-such-room" })).status, 403);

  const id = `inv-api-${stamp}`;
  const created = await api(teacher, "/create", { ...body, id });
  assert.equal(created.status, 200, JSON.stringify(created.body));
  assert.equal(created.body.id, id);
  const stored = (await db().collection("liveLessonInvitations").doc(id).get()).data();
  assert.deepEqual(
    [stored.teacherUid, stored.studentUid, stored.studentId, stored.status, stored.roomKey, stored.scheduleId, stored.occurrenceDate, stored.respondedAt, stored.cancelledAt, stored.closedAt],
    [teacherUid, studentUid, cardId, "pending", id, "sch-1", "2026-11-30", null, null, null],
  );
  const lifetime = stored.expiresAt.toMillis() - stored.createdAt.toMillis();
  assert.ok(lifetime > 60_000 && lifetime <= 5 * 60_000, `expires in ${lifetime} ms`);
  const log = await db().collection("activityLog").where("meta.invitationId", "==", id).get();
  assert.equal(log.size, 1);
  assert.equal(log.docs[0].data().type, "live_lesson.invited");
  // the same id again (the browser's retry) makes no second invitation
  assert.equal((await api(teacher, "/create", { ...body, id })).status, 409);

  // status changes
  assert.equal((await api(parent, "/respond", { invitationId: id, decision: "accepted" })).status, 403);
  assert.equal((await api(student, "/cancel", { invitationId: id })).status, 403);
  assert.equal((await api(teacher, "/accept-test", { invitationId: id })).status, 403); // not a test student card
  assert.equal((await api(teacher, "/close", { invitationId: id })).status, 409); // not accepted yet
  const accepted = await api(student, "/respond", { invitationId: id, decision: "accepted" });
  assert.deepEqual([accepted.status, accepted.body.status], [200, "accepted"]);
  assert.equal((await api(student, "/respond", { invitationId: id, decision: "declined" })).status, 409);
  assert.equal((await api(other, "/close", { invitationId: id })).status, 403);
  const closed = await api(teacher, "/close", { invitationId: id, endMark: "skip" });
  assert.deepEqual([closed.status, closed.body.status], [200, "closed"]);
  const after = (await db().collection("liveLessonInvitations").doc(id).get()).data();
  assert.deepEqual([after.status, after.endMark, Boolean(after.respondedAt), Boolean(after.closedAt)], ["closed", "skip", true, true]);

  // an expired invitation is not answered; a pending one is cancelled by its teacher
  const expiredId = `inv-api-expired-${stamp}`;
  await db().collection("liveLessonInvitations").doc(expiredId).set({ ...stored, status: "pending", roomKey: expiredId, expiresAt: new Date(Date.now() - 1000) });
  assert.equal((await api(student, "/respond", { invitationId: expiredId, decision: "accepted" })).status, 409);
  assert.equal((await api(teacher, "/cancel", { invitationId: expiredId })).status, 200);
  assert.equal((await api(teacher, "/cancel", { invitationId: "no-such-invitation" })).status, 404);
  assert.equal((await fetch(`http://${FUNCTIONS_EMULATOR}/${PROJECT_ID}/us-central1/liveInvitationApi/create`, { method: "POST" })).status, 401);
});

test("the teacher accepts for a test student through the server", async () => {
  requireSafeEmulatorEnvironment();
  const stamp = Date.now();
  const teacher = await account(`inv-api-test-teacher-${stamp}@example.com`, { role: "teacher", roles: ["teacher"], displayName: "Kati Kask" });
  const teacherUid = tokenUid(teacher);
  const cardId = `inv-api-test-card-${stamp}`;
  await db().collection("students").doc(cardId).set({ name: "Proov Õpilane", active: true, testStudent: true, teacherUid, teacherUids: [teacherUid], studentUid: teacherUid });
  const created = await api(teacher, "/create", { studentId: cardId, studentUid: teacherUid, studentName: "Proov Õpilane", teacherName: "Kati Kask", title: "Proov" });
  assert.equal(created.status, 200, JSON.stringify(created.body));
  const accepted = await api(teacher, "/accept-test", { invitationId: created.body.id });
  assert.deepEqual([accepted.status, accepted.body.status], [200, "accepted"]);
});
