"use strict";

// Media bank rules (mediaAssets): staff read and add pictures / texts with a known shape; students see nothing.

const test = require("node:test");
const assert = require("node:assert/strict");
const admin = require("firebase-admin");

const PROJECT_ID = "demo-keelesepp-finance";
const AUTH_EMULATOR = process.env.FIREBASE_AUTH_EMULATOR_HOST;
const FIRESTORE_EMULATOR = process.env.FIRESTORE_EMULATOR_HOST;

function requireSafeEmulatorEnvironment() {
  const activeProject = process.env.GCLOUD_PROJECT || process.env.GOOGLE_CLOUD_PROJECT || "";
  if (activeProject !== PROJECT_ID) throw new Error(`Refusing media bank rules test for non-demo project: ${activeProject || "missing"}`);
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


async function tokens() {
  if (!admin.apps.length) admin.initializeApp({ projectId: PROJECT_ID });
  const db = admin.firestore();
  const suffix = Date.now().toString(36);
  const teacherToken = await createUserToken(`mb-teacher-${suffix}@example.com`);
  const studentToken = await createUserToken(`mb-student-${suffix}@example.com`);
  await Promise.all([
    db.collection("users").doc(tokenUid(teacherToken)).set({ role: "teacher", displayName: "Mb Teacher" }),
    db.collection("users").doc(tokenUid(studentToken)).set({ role: "student", displayName: "Mb Student" }),
  ]);
  return { teacherToken, studentToken, suffix };
}

const write = (path, fields) => ({ update: { name: documentName(path), fields: Object.fromEntries(Object.entries(fields).map(([key, value]) => [key, encode(value)])) } });

test("staff add pictures and texts to the bank; a student cannot", async () => {
  requireSafeEmulatorEnvironment();
  const ctx = await tokens();
  const image = { kind: "image", level: "A2", topic: "Minu päev", tags: ["kass"], source: "upload", src: "https://cdn.example/kass.jpg", caption: "Kass", createdBy: tokenUid(ctx.teacherToken), createdAt: "2026-10-09" };
  const ok = await commit(ctx.teacherToken, [write(`mediaAssets/img_${ctx.suffix}`, image)]);
  assert.equal(ok.status, 200, JSON.stringify(ok.body));
  const text = { kind: "text", level: "B1", topic: "Töö", tags: ["töö"], source: "curriculum", title: "Minu töö", text: "Ma töötan kontoris.", words: 3, textType: "reading" };
  assert.equal((await commit(ctx.teacherToken, [write(`mediaAssets/txt_${ctx.suffix}`, text)])).status, 200);
  assert.equal((await commit(ctx.teacherToken, [write(`mediaAssets/bad_${ctx.suffix}`, { ...image, level: "Z9" })])).status, 403);
  assert.equal((await commit(ctx.teacherToken, [write(`mediaAssets/bad2_${ctx.suffix}`, { ...image, secret: "x" })])).status, 403);
  assert.equal((await commit(ctx.studentToken, [write(`mediaAssets/st_${ctx.suffix}`, image)])).status, 403);
});
