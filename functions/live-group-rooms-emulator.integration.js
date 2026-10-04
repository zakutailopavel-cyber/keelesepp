"use strict";
// Group lessons against the real Firestore rules: a teacher's room for up to 4 students, invitations into it,
// participant-only signals/presence and the group board (teacher materials stay staff-only).
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
    body: JSON.stringify({ email: `group-${role}-${Date.now()}-${Math.random().toString(36).slice(2)}@example.com`, password: "emulator-only-password", returnSecureToken: true }),
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
const write = (path, data, { exists = false, mask = null, now = [] } = {}) => ({
  update: { name: name(path), fields: Object.fromEntries(Object.entries(data).map(([k, v]) => [k, encode(v)])) },
  ...(mask ? { updateMask: { fieldPaths: mask } } : {}),
  currentDocument: { exists },
  updateTransforms: now.map((fieldPath) => ({ fieldPath, setToServerValue: "REQUEST_TIME" })),
});
async function commit(who, writes) {
  const response = await fetch(`http://${DB}/v1/projects/${PROJECT_ID}/databases/(default)/documents:commit`, {
    method: "POST", headers: { Authorization: `Bearer ${who.token}`, "Content-Type": "application/json" }, body: JSON.stringify({ writes }),
  });
  return response.status;
}
async function read(who, path) {
  return (await fetch(`http://${DB}/v1/projects/${PROJECT_ID}/databases/(default)/documents/${path}`, { headers: { Authorization: `Bearer ${who.token}` } })).status;
}

async function seed() {
  if (!admin.apps.length) admin.initializeApp({ projectId: PROJECT_ID });
  const db = admin.firestore();
  const teacher = await account("teacher", db);
  const mari = await account("student", db);
  const jaan = await account("student", db);
  const outsider = await account("student", db);
  const suffix = Math.random().toString(36).slice(2);
  await Promise.all([
    db.doc(`students/g-mari-${suffix}`).set({ name: "Mari", teacherUid: teacher.uid, teacherUids: [teacher.uid], linkedUserId: mari.uid, studentUid: mari.uid, active: true }),
    db.doc(`students/g-jaan-${suffix}`).set({ name: "Jaan", teacherUid: teacher.uid, teacherUids: [teacher.uid], linkedUserId: jaan.uid, studentUid: jaan.uid, active: true }),
    db.doc(`students/g-out-${suffix}`).set({ name: "Out", teacherUid: teacher.uid, teacherUids: [teacher.uid], linkedUserId: outsider.uid, studentUid: outsider.uid, active: true }),
  ]);
  return { db, teacher, mari, jaan, outsider, suffix, mariId: `g-mari-${suffix}`, outId: `g-out-${suffix}` };
}
const room = (ctx, members, extra = {}) => ({
  teacherUid: ctx.teacher.uid, teacherName: "Kati", title: "Grupitund",
  memberUids: members.map((m) => m.uid), members: members.map((m, i) => ({ studentId: `s${i}`, studentUid: m.uid, studentName: `S${i}` })),
  status: "open", closedAt: null, ...extra,
});

test("a teacher opens a group room for up to four students and invites only its members", async () => {
  safe();
  const ctx = await seed();
  const id = `room-${ctx.suffix}`;
  assert.equal(await commit(ctx.teacher, [write(`liveGroupRooms/${id}`, room(ctx, [ctx.mari, ctx.jaan]), { now: ["createdAt"] })]), 200);
  const five = Array.from({ length: 5 }, () => ctx.mari);
  assert.equal(await commit(ctx.teacher, [write(`liveGroupRooms/${id}-big`, room(ctx, five), { now: ["createdAt"] })]), 403, "at most four");
  assert.equal(await commit(ctx.mari, [write(`liveGroupRooms/${id}-student`, { ...room(ctx, [ctx.mari]), teacherUid: ctx.mari.uid }, { now: ["createdAt"] })]), 403, "students cannot open rooms");

  const invite = (studentId, studentUid, roomKey, inviteId) => write(`liveLessonInvitations/${inviteId}`, {
    teacherUid: ctx.teacher.uid, teacherName: "Kati", studentId, studentUid, studentName: "S", title: "Grupitund", status: "pending",
    roomKey, createdAtIso: new Date().toISOString(), expiresAt: null, respondedAt: null, cancelledAt: null, closedAt: null,
  }, { now: ["createdAt"] });
  const withExpiry = (w) => { w.update.fields.expiresAt = { timestampValue: new Date(Date.now() + 120000).toISOString() }; return w; };
  assert.equal(await commit(ctx.teacher, [withExpiry(invite(ctx.mariId, ctx.mari.uid, id, `inv-m-${ctx.suffix}`))]), 200, "member invited into the group room");
  assert.equal(await commit(ctx.teacher, [withExpiry(invite(ctx.outId, ctx.outsider.uid, id, `inv-o-${ctx.suffix}`))]), 403, "not a member of that room");
  assert.equal(await commit(ctx.teacher, [withExpiry(invite(ctx.mariId, ctx.mari.uid, "someone-elses-room", `inv-x-${ctx.suffix}`))]), 403, "unknown room key");

  assert.equal(await read(ctx.mari, `liveGroupRooms/${id}`), 200);
  assert.equal(await read(ctx.outsider, `liveGroupRooms/${id}`), 403);
});

test("only participants signal, report presence and use the group board; the teacher closes the room", async () => {
  safe();
  const ctx = await seed();
  const id = `room2-${ctx.suffix}`;
  await ctx.db.doc(`liveGroupRooms/${id}`).set({ ...room(ctx, [ctx.mari, ctx.jaan]), createdAt: admin.firestore.FieldValue.serverTimestamp() });
  const presence = (who, role) => write(`liveGroupRooms/${id}/presence/${who.uid}`, { uid: who.uid, role, displayName: "X", online: true, lastSeenIso: new Date().toISOString() }, { exists: false, now: ["lastSeen"] });
  assert.equal(await commit(ctx.mari, [presence(ctx.mari, "student")]), 200);
  assert.equal(await commit(ctx.jaan, [presence(ctx.jaan, "teacher")]), 403, "a student is not the teacher");
  assert.equal(await commit(ctx.outsider, [presence(ctx.outsider, "student")]), 403);

  const signal = (who, fromUid, toUid, sid) => write(`liveGroupRooms/${id}/signals/${sid}`, { type: "offer", sessionId: "s1", fromUid, toUid, payload: "{}", createdAtIso: new Date().toISOString() }, { now: ["createdAt"] });
  assert.equal(await commit(ctx.mari, [signal(ctx.mari, ctx.mari.uid, ctx.jaan.uid, `sg1-${ctx.suffix}`)]), 200, "student to student (mesh)");
  assert.equal(await commit(ctx.mari, [signal(ctx.mari, ctx.jaan.uid, ctx.teacher.uid, `sg2-${ctx.suffix}`)]), 403, "forged sender");
  assert.equal(await commit(ctx.outsider, [signal(ctx.outsider, ctx.outsider.uid, ctx.teacher.uid, `sg3-${ctx.suffix}`)]), 403);
  assert.equal(await read(ctx.jaan, `liveGroupRooms/${id}/signals/sg1-${ctx.suffix}`), 200);

  const element = (who, eid, data) => write(`groupBoards/${id}/elements/${eid}`, { ...data, updatedByUid: who.uid, updatedByName: "X", lastClientId: "c", revision: 1 }, { now: ["updatedAt"] });
  const note = { type: "note", x: 1, y: 1, w: 100, h: 80, text: "Tere", color: "#FEF3C7" };
  const image = { type: "image", x: 0, y: 0, w: 400, h: 300, url: "https://files.example/a.png", locked: false };
  assert.equal(await commit(ctx.mari, [element(ctx.mari, "n1", note)]), 200);
  assert.equal(await commit(ctx.mari, [element(ctx.mari, "i0", image)]), 403, "students add no materials");
  assert.equal(await commit(ctx.teacher, [element(ctx.teacher, "i1", image)]), 200);
  assert.equal(await commit(ctx.jaan, [{ delete: name(`groupBoards/${id}/elements/i1`) }]), 403, "a student cannot erase the teacher's image");
  assert.equal(await commit(ctx.jaan, [{ delete: name(`groupBoards/${id}/elements/n1`) }]), 200, "students erase ordinary elements");
  assert.equal(await read(ctx.outsider, `groupBoards/${id}/elements/i1`), 403);

  const message = (who, mid, data) => write(`liveGroupRooms/${id}/messages/${mid}`, { fromUid: who.uid, fromName: "X", text: "Tere!", createdAtIso: new Date().toISOString(), ...data }, { now: ["createdAt"] });
  assert.equal(await commit(ctx.mari, [message(ctx.mari, "m1", {})]), 200, "a member writes in the group chat");
  assert.equal(await commit(ctx.mari, [message(ctx.mari, "m2", { fromUid: ctx.jaan.uid })]), 403, "as someone else");
  assert.equal(await commit(ctx.outsider, [message(ctx.outsider, "m3", {})]), 403);
  assert.equal(await read(ctx.jaan, `liveGroupRooms/${id}/messages/m1`), 200);
  assert.equal(await read(ctx.outsider, `liveGroupRooms/${id}/messages/m1`), 403);

  assert.equal(await commit(ctx.mari, [write(`liveGroupRooms/${id}`, { status: "closed" }, { exists: true, mask: ["status"], now: ["closedAt"] })]), 403, "only the teacher closes");
  assert.equal(await commit(ctx.teacher, [write(`liveGroupRooms/${id}`, { status: "closed" }, { exists: true, mask: ["status"], now: ["closedAt"] })]), 200);
  assert.equal(await commit(ctx.mari, [write(`liveGroupRooms/${id}/presence/${ctx.mari.uid}`, { uid: ctx.mari.uid, role: "student", displayName: "X", online: false, lastSeenIso: "x" }, { exists: true, now: ["lastSeen"] })]), 403, "closed room");
  assert.equal(await read(ctx.mari, `groupBoards/${id}/elements/i1`), 200, "the group board stays readable after the lesson");
  assert.equal(await commit(ctx.mari, [message(ctx.mari, "m4", {})]), 403, "no new messages after the lesson");
  assert.equal(await read(ctx.mari, `liveGroupRooms/${id}/messages/m1`), 200, "the chat stays readable");
});
