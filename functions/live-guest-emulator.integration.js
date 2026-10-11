"use strict";

// Live Classroom guest link rules (firestore.rules liveGuestFor / liveGuestRoomSheet) against the emulator: a guest
// who opened the teacher's link (custom token with liveGuest, grant written by the server) reaches the card's board
// and the worksheets of that lesson room — not the card, other worksheets, another student's board or the link store.

const test = require("node:test");
const assert = require("node:assert/strict");
const admin = require("firebase-admin");

const PROJECT_ID = "demo-keelesepp-finance";
const AUTH_EMULATOR = process.env.FIREBASE_AUTH_EMULATOR_HOST;
const FIRESTORE_EMULATOR = process.env.FIRESTORE_EMULATOR_HOST;

function requireSafeEmulatorEnvironment() {
  const activeProject = process.env.GCLOUD_PROJECT || process.env.GOOGLE_CLOUD_PROJECT || "";
  if (activeProject !== PROJECT_ID) throw new Error(`Refusing guest rules test for non-demo project: ${activeProject || "missing"}`);
  if (!/^(127\.0\.0\.1|localhost):\d+$/.test(AUTH_EMULATOR || "")) throw new Error(`Unsafe Auth emulator host: ${AUTH_EMULATOR}`);
  if (!/^(127\.0\.0\.1|localhost):\d+$/.test(FIRESTORE_EMULATOR || "")) throw new Error(`Unsafe Firestore emulator host: ${FIRESTORE_EMULATOR}`);
}

async function guestToken(uid, claims) {
  const custom = await admin.auth().createCustomToken(uid, claims);
  const response = await fetch(`http://${AUTH_EMULATOR}/identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=demo-key`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token: custom, returnSecureToken: true }),
  });
  const body = await response.json();
  if (!response.ok || !body.idToken) throw new Error(`Unable to sign in with a custom token: ${response.status}`);
  return body.idToken;
}

async function read(token, path) {
  const response = await fetch(`http://${FIRESTORE_EMULATOR}/v1/projects/${PROJECT_ID}/databases/(default)/documents/${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.status;
}

async function seed({ expiresInMs = 3600_000 } = {}) {
  if (!admin.apps.length) admin.initializeApp({ projectId: PROJECT_ID });
  const db = admin.firestore();
  const suffix = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
  const studentId = `guest-card-${suffix}`;
  const otherId = `guest-other-${suffix}`;
  const invitationId = `guest-inv-${suffix}`;
  const uid = `guest_${suffix}`;
  const expiresAt = admin.firestore.Timestamp.fromMillis(Date.now() + expiresInMs);
  await Promise.all([
    db.doc(`students/${studentId}`).set({ name: "Mykyta", teacherUid: "teacher-x", teacherUids: ["teacher-x"], active: true }),
    db.doc(`students/${otherId}`).set({ name: "Other", teacherUid: "teacher-x", active: true }),
    db.doc(`whiteboards/${studentId}`).set({ schemaVersion: 2, updatedByUid: "teacher-x" }),
    db.doc(`whiteboards/${otherId}`).set({ schemaVersion: 2, updatedByUid: "teacher-x" }),
    db.doc(`worksheetAssignments/room-${suffix}`).set({ studentId, liveRoomKey: invitationId, status: "assigned" }),
    db.doc(`worksheetAssignments/home-${suffix}`).set({ studentId, liveRoomKey: "", status: "assigned" }),
    db.doc(`liveGuestGrants/${uid}`).set({ studentId, invitationId, teacherUid: "teacher-x", expiresAt }),
    db.doc(`liveGuestLinks/hash-${suffix}`).set({ studentId, invitationId, expiresAt }),
  ]);
  return { suffix, studentId, otherId, invitationId, uid };
}

test("a guest reaches the card's board and this room's worksheets, nothing else", async () => {
  requireSafeEmulatorEnvironment();
  const ctx = await seed();
  const token = await guestToken(ctx.uid, { liveGuest: true, liveInvitationId: ctx.invitationId });
  assert.equal(await read(token, `whiteboards/${ctx.studentId}`), 200, "own board");
  assert.equal(await read(token, `worksheetAssignments/room-${ctx.suffix}`), 200, "room worksheet");
  assert.equal(await read(token, `liveGuestGrants/${ctx.uid}`), 200, "own grant");
  assert.equal(await read(token, `whiteboards/${ctx.otherId}`), 403, "another student's board");
  assert.equal(await read(token, `worksheetAssignments/home-${ctx.suffix}`), 403, "homework outside the room");
  assert.equal(await read(token, `students/${ctx.studentId}`), 403, "the student card");
  assert.equal(await read(token, `liveGuestLinks/hash-${ctx.suffix}`), 403, "the link store");
});

test("without the guest claim or after the grant expires, the board stays closed", async () => {
  requireSafeEmulatorEnvironment();
  const ctx = await seed();
  const plain = await guestToken(ctx.uid, {});
  assert.equal(await read(plain, `whiteboards/${ctx.studentId}`), 403, "no liveGuest claim");
  const expired = await seed({ expiresInMs: -60_000 });
  const token = await guestToken(expired.uid, { liveGuest: true });
  assert.equal(await read(token, `whiteboards/${expired.studentId}`), 403, "expired grant");
});
