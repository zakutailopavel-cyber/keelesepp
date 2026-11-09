"use strict";

// Sõnavara (2026-10-10): a student keeps words from a course deck in their own word list — only for themselves,
// in the first box, without a lesson link.
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


test("a student adds words only to their own list, new and without a lesson link", async () => {
  requireSafeEmulatorEnvironment();
  const token = await account("words-own@example.com", { role: "student", roles: ["student"] });
  const uid = tokenUid(token);
  await Promise.all([
    db().collection("students").doc("words-own").set({ name: "Own Words", studentUid: uid, linkedUserId: uid, active: true }),
    db().collection("students").doc("words-other").set({ name: "Other", studentUid: "someone-else", active: true }),
  ]);
  const word = (studentId, extra = {}) => ({ fields: {
    studentId: str(studentId), invitationId: str(""), word: str("eelarve"), translation: str("бюджет"), example: str(""), forms: str(""),
    createdByUid: str(uid), createdByName: str("Own Words"), createdAt: str("2026-10-10T10:00:00Z"), updatedAt: str("2026-10-10T10:00:00Z"),
    box: { integerValue: "0" }, dueAt: str("2026-10-10T10:00:00Z"), ...extra,
  } });
  assert.equal((await documentRequest(token, "PATCH", "studentWords/own-1", word("words-own"))).status, 200);
  assert.equal((await documentRequest(token, "PATCH", "studentWords/own-2", word("words-other"))).status, 403);
  assert.equal((await documentRequest(token, "PATCH", "studentWords/own-3", word("words-own", { box: { integerValue: "5" } }))).status, 403);
  assert.equal((await documentRequest(token, "PATCH", "studentWords/own-4", word("words-own", { createdByUid: str("teacher-uid") }))).status, 403);
});

test("„Lisa oma sõna”: the student saves source + check verdict, edits the text of own words only", async () => {
  requireSafeEmulatorEnvironment();
  const token = await account("words-own-edit@example.com", { role: "student", roles: ["student"] });
  const uid = tokenUid(token);
  await db().collection("students").doc("words-own-edit").set({ name: "Own Edit", studentUid: uid, linkedUserId: uid, active: true });
  const fields = (extra = {}) => ({
    studentId: str("words-own-edit"), invitationId: str(""), word: str("raamatukogu"), translation: str("библиотека"), example: str(""), forms: str(""),
    createdByUid: str(uid), createdByName: str("Own Edit"), createdAt: str("2026-11-04T10:00:00Z"), updatedAt: str("2026-11-04T10:00:00Z"),
    box: { integerValue: "0" }, dueAt: str("2026-11-04T10:00:00Z"), source: str("student"), checked: str("ok"), ...extra,
  });
  assert.equal((await documentRequest(token, "PATCH", "studentWords/own-edit-1", { fields: fields() })).status, 200);
  assert.equal((await documentRequest(token, "PATCH", "studentWords/own-edit-2", { fields: fields({ checked: str("trust-me") }) })).status, 403);
  // own word: text editable
  const edited = await documentRequest(token, "PATCH", "studentWords/own-edit-1?updateMask.fieldPaths=translation&updateMask.fieldPaths=example&updateMask.fieldPaths=updatedAt&updateMask.fieldPaths=checked",
    { fields: { translation: str("библиотека (место)"), example: str("Ma käin raamatukogus."), updatedAt: str("2026-11-04T11:00:00Z"), checked: str("unchecked") } });
  assert.equal(edited.status, 200);
  // but not its practice box beyond the rules, nor the owner
  assert.equal((await documentRequest(token, "PATCH", "studentWords/own-edit-1?updateMask.fieldPaths=createdByUid", { fields: { createdByUid: str("someone") } })).status, 403);
  // a teacher's word: the student may not change its text
  await db().collection("studentWords").doc("own-edit-teacher").set({ studentId: "words-own-edit", invitationId: "", word: "kass", translation: "кот", example: "", forms: "",
    createdByUid: "teacher-uid", createdByName: "Õpetaja", createdAt: "2026-11-04T10:00:00Z", updatedAt: "2026-11-04T10:00:00Z", box: 0, dueAt: "2026-11-04T10:00:00Z" });
  assert.equal((await documentRequest(token, "PATCH", "studentWords/own-edit-teacher?updateMask.fieldPaths=translation", { fields: { translation: str("кошка") } })).status, 403);
  // nobody reads the quota collection from the client
  assert.equal((await documentRequest(token, "GET", `languageQuotas/${uid}`)).status, 403);
});

test("spaced repetition: the student writes `srs` with the practice fields; bad shapes and create-time srs are refused", async () => {
  requireSafeEmulatorEnvironment();
  const token = await account("words-srs@example.com", { role: "student", roles: ["student"] });
  const uid = tokenUid(token);
  await db().collection("students").doc("words-srs").set({ name: "Srs", studentUid: uid, linkedUserId: uid, active: true });
  await db().collection("studentWords").doc("srs-1").set({ studentId: "words-srs", invitationId: "", word: "kass", translation: "кот", example: "", forms: "",
    createdByUid: "teacher-uid", createdByName: "Õpetaja", createdAt: "2026-11-01T10:00:00Z", updatedAt: "2026-11-01T10:00:00Z", box: 2, dueAt: "2026-11-08T10:00:00Z", reviews: 3 });
  const int = (value) => ({ integerValue: String(value) });
  const num = (value) => ({ doubleValue: value });
  const side = (extra = {}) => ({ mapValue: { fields: {
    state: str("review"), s: num(5.17), d: num(5.12), due: str("2026-11-14T10:00:00.000Z"), last: str("2026-11-09T10:00:00.000Z"),
    reps: int(4), lapses: int(0), step: int(0), intro: str("2026-11-01"), ...extra,
  } } });
  const mask = ["box", "dueAt", "reviewedAt", "reviews", "srs"].map((key) => `updateMask.fieldPaths=${key}`).join("&");
  const patch = (srs, extra = {}) => documentRequest(token, "PATCH", `studentWords/srs-1?${mask}`, { fields: {
    box: int(2), dueAt: str("2026-11-09T10:01:00.000Z"), reviewedAt: str("2026-11-09T10:00:00.000Z"), reviews: int(4), srs, ...extra,
  } });
  const ok = await patch({ mapValue: { fields: { v: int(1), r: side(), p: side({ state: str("learning"), s: num(0.49), d: num(6.39), step: int(0), reps: int(1) }) } } });
  assert.equal(ok.status, 200, JSON.stringify(ok.body));
  assert.equal((await db().collection("studentWords").doc("srs-1").get()).data().srs.p.state, "learning");
  // an unknown key in a side, an unknown state, a third direction, a string as stability, not a map: refused
  assert.equal((await patch({ mapValue: { fields: { v: int(1), r: side({ hack: str("x") }) } } })).status, 403);
  assert.equal((await patch({ mapValue: { fields: { v: int(1), r: side({ state: str("mastered") }) } } })).status, 403);
  assert.equal((await patch({ mapValue: { fields: { v: int(1), r: side(), q: side() } } })).status, 403);
  assert.equal((await patch({ mapValue: { fields: { v: int(1), r: side({ s: str("5") }) } } })).status, 403);
  assert.equal((await patch(str("not a map"))).status, 403);
  // still no text change together with the practice fields
  assert.equal((await documentRequest(token, "PATCH", `studentWords/srs-1?${mask}&updateMask.fieldPaths=translation`, { fields: {
    box: int(2), dueAt: str("2026-11-09T10:01:00.000Z"), reviewedAt: str("2026-11-09T10:00:00.000Z"), reviews: int(4), translation: str("кошка"),
    srs: { mapValue: { fields: { v: int(1), r: side() } } },
  } })).status, 403);
  // a word is never created with a schedule (it starts new)
  assert.equal((await documentRequest(token, "PATCH", "studentWords/srs-2", { fields: {
    studentId: str("words-srs"), invitationId: str(""), word: str("koer"), translation: str("собака"), example: str(""), forms: str(""),
    createdByUid: str(uid), createdByName: str("Srs"), createdAt: str("2026-11-09T10:00:00Z"), updatedAt: str("2026-11-09T10:00:00Z"),
    box: int(0), dueAt: str("2026-11-09T10:00:00Z"), srs: { mapValue: { fields: { v: int(1), r: side() } } },
  } })).status, 403);
  // another student's word: refused
  await db().collection("studentWords").doc("srs-other").set({ studentId: "someone-else-card", word: "x", createdByUid: "t", createdAt: "2026-11-01", box: 0, dueAt: "" });
  assert.equal((await documentRequest(token, "PATCH", `studentWords/srs-other?${mask}`, { fields: {
    box: int(0), dueAt: str(""), reviewedAt: str(""), reviews: int(1), srs: { mapValue: { fields: { v: int(1), r: side() } } },
  } })).status, 403);
});
