"use strict";

// Student board rules (whiteboards/{studentId}/elements and lessonPages/{pageId}/elements) against the emulator.
// Regression: a teacher's image/PDF write used to evaluate board access several times and hit Firestore's
// 1000-expression limit, so it was denied (Live Classroom „Materjalid” → „Tahvlile”, notes on lesson pages).

const test = require("node:test");
const assert = require("node:assert/strict");
const admin = require("firebase-admin");

const PROJECT_ID = "demo-keelesepp-finance";
const AUTH_EMULATOR = process.env.FIREBASE_AUTH_EMULATOR_HOST;
const FIRESTORE_EMULATOR = process.env.FIRESTORE_EMULATOR_HOST;

function requireSafeEmulatorEnvironment() {
  const activeProject = process.env.GCLOUD_PROJECT || process.env.GOOGLE_CLOUD_PROJECT || "";
  if (activeProject !== PROJECT_ID) throw new Error(`Refusing whiteboard rules test for non-demo project: ${activeProject || "missing"}`);
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

const note = { type: "note", x: 10, y: 10, w: 180, h: 140, text: "Tere", color: "#FEF3C7" };
const image = { type: "image", x: 0, y: 0, w: 800, h: 560, url: "https://files.example/leht.png", locked: false };
const pdf = { type: "pdf", x: 0, y: 0, w: 1000, h: 1414, url: "https://files.example/leht.pdf", name: "Leht.pdf", locked: false };

async function seed() {
  if (!admin.apps.length) admin.initializeApp({ projectId: PROJECT_ID });
  const db = admin.firestore();
  const suffix = Date.now().toString(36);
  const teacherToken = await createUserToken(`board-teacher-${suffix}@example.com`);
  const studentToken = await createUserToken(`board-student-${suffix}@example.com`);
  const teacherUid = tokenUid(teacherToken);
  const studentUid = tokenUid(studentToken);
  const studentId = `board-student-${suffix}`;
  await Promise.all([
    db.collection("users").doc(teacherUid).set({ role: "teacher", displayName: "Board Teacher" }),
    db.collection("users").doc(studentUid).set({ role: "student", displayName: "Board Student" }),
    db.collection("students").doc(studentId).set({ name: "Board Student", teacher: "Board Teacher", teacherUid, teacherUids: [teacherUid], linkedUserId: studentUid, studentUid, active: true }),
  ]);
  const page = (id, extra = {}) => db.doc(`whiteboards/${studentId}/lessonPages/${id}`).set({
    title: "Tund", order: 1, status: "active", isSnapshot: false, snapshotOf: null,
    createdAt: admin.firestore.FieldValue.serverTimestamp(), updatedAt: admin.firestore.FieldValue.serverTimestamp(), updatedByUid: teacherUid, updatedByName: "Board Teacher", ...extra,
  });
  await Promise.all([page("live"), page("snap", { isSnapshot: true, snapshotOf: "live" }), page("done", { isSnapshot: true, snapshotOf: "live", status: "completed" })]);
  await db.doc(`whiteboards/${studentId}/elements/locked-1`).set({ ...image, locked: true, updatedByUid: teacherUid });
  return { db, teacherToken, studentToken, teacherUid, studentUid, studentId };
}

test("a teacher can put images and PDFs on the student's board and on a live lesson page", async () => {
  requireSafeEmulatorEnvironment();
  const ctx = await seed();
  for (const [path, data] of [
    [`whiteboards/${ctx.studentId}/elements/t-image`, image],
    [`whiteboards/${ctx.studentId}/elements/t-pdf`, pdf],
    [`whiteboards/${ctx.studentId}/lessonPages/live/elements/t-note`, note],
    [`whiteboards/${ctx.studentId}/lessonPages/live/elements/t-image`, image],
    [`whiteboards/${ctx.studentId}/lessonPages/snap/elements/t-copy`, image],
  ]) {
    const result = await commit(ctx.teacherToken, [createElement(path, ctx.teacherUid, data)]);
    assert.equal(result.status, 200, `${path}: ${JSON.stringify(result.body)}`);
  }
});

test("a student draws and writes on their board but cannot add materials or touch locked/snapshot content", async () => {
  requireSafeEmulatorEnvironment();
  const ctx = await seed();
  const ok = await commit(ctx.studentToken, [createElement(`whiteboards/${ctx.studentId}/lessonPages/live/elements/s-note`, ctx.studentUid, note)]);
  assert.equal(ok.status, 200, JSON.stringify(ok.body));
  const ownBoard = await commit(ctx.studentToken, [createElement(`whiteboards/${ctx.studentId}/elements/s-note`, ctx.studentUid, note)]);
  assert.equal(ownBoard.status, 200, JSON.stringify(ownBoard.body));
  for (const path of [`whiteboards/${ctx.studentId}/elements/s-image`, `whiteboards/${ctx.studentId}/lessonPages/live/elements/s-image`]) {
    const denied = await commit(ctx.studentToken, [createElement(path, ctx.studentUid, image)]);
    assert.equal(denied.status, 403, path);
  }
  const snapshot = await commit(ctx.studentToken, [createElement(`whiteboards/${ctx.studentId}/lessonPages/snap/elements/s-note`, ctx.studentUid, note)]);
  assert.equal(snapshot.status, 403);
  const lockedDelete = await commit(ctx.studentToken, [{ delete: documentName(`whiteboards/${ctx.studentId}/elements/locked-1`) }]);
  assert.equal(lockedDelete.status, 403);
});

test("a student's eraser or drag cannot remove or move the teacher's image or PDF; the teacher can", async () => {
  requireSafeEmulatorEnvironment();
  const ctx = await seed();
  const paths = [`whiteboards/${ctx.studentId}/elements/m-image`, `whiteboards/${ctx.studentId}/lessonPages/live/elements/m-pdf`];
  await ctx.db.doc(paths[0]).set({ ...image, updatedByUid: ctx.teacherUid });
  await ctx.db.doc(paths[1]).set({ ...pdf, updatedByUid: ctx.teacherUid });
  for (const path of paths) {
    const erased = await commit(ctx.studentToken, [{ delete: documentName(path) }]);
    assert.equal(erased.status, 403, `student delete ${path}`);
    const data = path.endsWith("m-image") ? image : pdf;
    const moved = await commit(ctx.studentToken, [updateElement(path, ctx.studentUid, { ...data, x: 300 })]);
    assert.equal(moved.status, 403, `student move ${path}`);
  }
  const studentNote = `whiteboards/${ctx.studentId}/elements/own-note`;
  await ctx.db.doc(studentNote).set({ ...note, updatedByUid: ctx.studentUid });
  const ownDelete = await commit(ctx.studentToken, [{ delete: documentName(studentNote) }]);
  assert.equal(ownDelete.status, 200, "student still erases ordinary elements");
  const teacherMove = await commit(ctx.teacherToken, [updateElement(paths[0], ctx.teacherUid, { ...image, x: 300 })]);
  assert.equal(teacherMove.status, 200, JSON.stringify(teacherMove.body));
  for (const path of paths) {
    const removed = await commit(ctx.teacherToken, [{ delete: documentName(path) }]);
    assert.equal(removed.status, 200, `teacher delete ${path}`);
  }
});

test("board text may carry one of the four fonts and nothing else", async () => {
  requireSafeEmulatorEnvironment();
  const ctx = await seed();
  const text = { type: "text", x: 0, y: 0, w: 260, h: 44, text: "Tere", color: "#111827", fontSize: 18 };
  const plain = await commit(ctx.studentToken, [createElement(`whiteboards/${ctx.studentId}/elements/txt-plain`, ctx.studentUid, text)]);
  assert.equal(plain.status, 200, JSON.stringify(plain.body));
  const hand = await commit(ctx.studentToken, [createElement(`whiteboards/${ctx.studentId}/elements/txt-hand`, ctx.studentUid, { ...text, fontFamily: "hand" })]);
  assert.equal(hand.status, 200, JSON.stringify(hand.body));
  const odd = await commit(ctx.studentToken, [createElement(`whiteboards/${ctx.studentId}/elements/txt-odd`, ctx.studentUid, { ...text, fontFamily: "Comic Sans" })]);
  assert.equal(odd.status, 403);
});

function pageWrite(path, uid, data, exists) {
  return {
    update: { name: documentName(path), fields: Object.fromEntries(Object.entries({ updatedByUid: uid, updatedByName: "Emulator", ...data }).map(([key, value]) => [key, encode(value)])) },
    ...(exists ? { updateMask: { fieldPaths: [...Object.keys(data), "updatedByUid", "updatedByName", "updatedAt"] } } : {}),
    currentDocument: { exists },
    updateTransforms: [{ fieldPath: "updatedAt", setToServerValue: "REQUEST_TIME" }, ...(exists ? [] : [{ fieldPath: "createdAt", setToServerValue: "REQUEST_TIME" }])],
  };
}

test("the student adds and renames ordinary sheets but not snapshots, order or status", async () => {
  requireSafeEmulatorEnvironment();
  const ctx = await seed();
  const base = `whiteboards/${ctx.studentId}/lessonPages`;
  const sheet = { title: "Kodutöö", order: 2, status: "active", isSnapshot: false, snapshotOf: null };
  const created = await commit(ctx.studentToken, [pageWrite(`${base}/mine`, ctx.studentUid, sheet, false)]);
  assert.equal(created.status, 200, JSON.stringify(created.body));
  const fakeSnapshot = await commit(ctx.studentToken, [pageWrite(`${base}/fake`, ctx.studentUid, { ...sheet, isSnapshot: true, snapshotOf: "live" }, false)]);
  assert.equal(fakeSnapshot.status, 403);
  const renamed = await commit(ctx.studentToken, [pageWrite(`${base}/live`, ctx.studentUid, { title: "Minu tund" }, true)]);
  assert.equal(renamed.status, 200, JSON.stringify(renamed.body));
  const reordered = await commit(ctx.studentToken, [pageWrite(`${base}/live`, ctx.studentUid, { order: 9 }, true)]);
  assert.equal(reordered.status, 403);
  const snapRename = await commit(ctx.studentToken, [pageWrite(`${base}/snap`, ctx.studentUid, { title: "x" }, true)]);
  assert.equal(snapRename.status, 403);
  const teacherRename = await commit(ctx.teacherToken, [pageWrite(`${base}/mine`, ctx.teacherUid, { title: "Selgitus" }, true)]);
  assert.equal(teacherRename.status, 200, JSON.stringify(teacherRename.body));
});

test("nobody writes to a completed lesson snapshot", async () => {
  requireSafeEmulatorEnvironment();
  const ctx = await seed();
  const result = await commit(ctx.teacherToken, [createElement(`whiteboards/${ctx.studentId}/lessonPages/done/elements/t-late`, ctx.teacherUid, note)]);
  assert.equal(result.status, 403);
});
