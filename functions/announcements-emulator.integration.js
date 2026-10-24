"use strict";

// „Teated” (owner 2026-10-24) against the real Firestore rules and staffOperationsApi (emulators): only the
// administrator reads / writes announcements and reads answers; a learner or parent gets only their own
// announcements through the server, answers once (again only when allowed), never for someone else.
const test = require("node:test");
const assert = require("node:assert/strict");
const admin = require("firebase-admin");
const { appToday } = require("./local-date-core");

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

const run = `${Date.now()}${Math.random().toString(36).slice(2, 6)}`;
async function account(role, name) {
  const response = await fetch(`http://${AUTH_EMULATOR}/identitytoolkit.googleapis.com/v1/accounts:signUp?key=demo-key`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: `ann-${role}-${name}-${run}@example.com`.toLowerCase(), password: "emulator-only-password", returnSecureToken: true }),
  });
  const body = await response.json();
  assert.ok(body.idToken, JSON.stringify(body));
  const uid = JSON.parse(Buffer.from(body.idToken.split(".")[1], "base64url").toString("utf8")).user_id;
  await db().collection("users").doc(uid).set({ role, displayName: name });
  return { token: body.idToken, uid };
}

function enc(v) {
  if (v === null) return { nullValue: null };
  if (Array.isArray(v)) return { arrayValue: { values: v.map(enc) } };
  if (typeof v === "object") return { mapValue: { fields: Object.fromEntries(Object.entries(v).map(([k, x]) => [k, enc(x)])) } };
  if (typeof v === "boolean") return { booleanValue: v };
  if (typeof v === "number") return Number.isInteger(v) ? { integerValue: String(v) } : { doubleValue: v };
  return { stringValue: String(v) };
}
const docUrl = (path) => `http://${FIRESTORE_EMULATOR}/v1/projects/${PROJECT_ID}/databases/(default)/documents/${path}`;
const put = (who, path, data) => fetch(docUrl(path), { method: "PATCH", headers: { Authorization: `Bearer ${who.token}`, "Content-Type": "application/json" }, body: JSON.stringify({ fields: Object.fromEntries(Object.entries(data).map(([k, v]) => [k, enc(v)])) }) }).then((r) => r.status);
const get = (who, path) => fetch(docUrl(path), { headers: { Authorization: `Bearer ${who.token}` } }).then((r) => r.status);
const del = (who, path) => fetch(docUrl(path), { method: "DELETE", headers: { Authorization: `Bearer ${who.token}` } }).then((r) => r.status);
const list = (who, collection) => fetch(docUrl(collection), { headers: { Authorization: `Bearer ${who.token}` } }).then((r) => r.status);

async function api(who, path, payload = {}) {
  const response = await fetch(`http://${FUNCTIONS_EMULATOR}/${PROJECT_ID}/us-central1/staffOperationsApi/announcements${path}`, {
    method: "POST", headers: { Authorization: `Bearer ${who.token}`, "Content-Type": "application/json" }, body: JSON.stringify(payload),
  });
  return { status: response.status, body: await response.json().catch(() => ({})) };
}

const today = appToday(new Date());
const announcement = (extra = {}) => ({
  title: "Teade", body: "Tere!\nhttps://epkoolitus.ee", audience: "both", subjects: [], levels: [], studentIds: [],
  activeFrom: today, activeTo: "", responseType: "read", question: { mode: "text", options: [], allowOther: false },
  allowChange: false, status: "published", ...extra,
});

test("Teated: rules, audience, answering once, parent per child, report", async () => {
  requireSafeEmulatorEnvironment();
  const boss = await account("admin", "Boss");
  const teacher = await account("teacher", "Opetaja");
  const mari = await account("student", "Mari");
  const other = await account("student", "Teine");
  const parent = await account("parent", "Ema");

  // cards: Mari (B1, own account + the parent), Jüri (math, the parent's other child), Teine (A2, someone else)
  const s1 = `ann-s1-${run}`; const s2 = `ann-s2-${run}`; const s3 = `ann-s3-${run}`;
  await db().collection("students").doc(s1).set({ name: "Mari", active: true, subject: "Eesti keel", level: "B1", linkedUserId: mari.uid, linkedParentId: parent.uid });
  await db().collection("students").doc(s2).set({ name: "Jüri", active: true, subject: "Matemaatika", level: "7", linkedParentIds: [parent.uid] });
  await db().collection("students").doc(s3).set({ name: "Teine", active: true, subject: "Eesti keel", level: "A2", linkedUserId: other.uid });

  // rules: only the administrator writes and reads announcements; nobody writes answers directly
  const a1 = `ann-a1-${run}`;
  assert.equal(await put(boss, `announcements/${a1}`, { ...announcement({ studentIds: [s1, s2] }), createdByUid: boss.uid }), 200, "admin creates");
  assert.equal(await put(boss, `announcements/ann-bad-${run}`, { ...announcement({ audience: "all" }), createdByUid: boss.uid }), 403, "invalid audience");
  assert.equal(await put(boss, `announcements/ann-bad2-${run}`, { ...announcement({ activeTo: "2000-01-01" }), createdByUid: boss.uid }), 403, "end before start");
  assert.equal(await put(boss, `announcements/ann-bad3-${run}`, { ...announcement(), createdByUid: boss.uid, extra: 1 }), 403, "fixed keys");
  assert.equal(await put(teacher, `announcements/ann-t-${run}`, { ...announcement(), createdByUid: teacher.uid }), 403, "teacher cannot");
  assert.equal(await put(mari, `announcements/ann-m-${run}`, { ...announcement(), createdByUid: mari.uid }), 403, "student cannot");
  assert.equal(await get(mari, `announcements/${a1}`), 403, "student cannot read even their own directly");
  assert.equal(await get(parent, `announcements/${a1}`), 403, "parent cannot read directly");
  assert.equal(await list(mari, "announcements"), 403, "student cannot list");
  assert.equal(await get(teacher, `announcements/${a1}`), 403, "teacher cannot read");
  assert.equal(await del(boss, `announcements/${a1}`), 403, "archived, never deleted");
  assert.equal(await put(mari, `announcementResponses/${a1}__u_${mari.uid}`, { announcementId: a1 }), 403, "no direct answer");
  assert.equal(await put(boss, `announcementResponses/${a1}__u_${mari.uid}`, { announcementId: a1 }), 403, "admin does not forge answers");

  // the server returns only the caller's announcements
  const a2 = `ann-a2-${run}`; const a3 = `ann-a3-${run}`; const a4 = `ann-a4-${run}`; const draft = `ann-d-${run}`;
  await db().collection("announcements").doc(a2).set({ ...announcement({ title: "Küsimus", responseType: "question", question: { mode: "single", options: ["Jah", "Ei"], allowOther: false }, studentIds: [s1, s2, s3], activeFrom: "2026-01-01" }), createdByUid: boss.uid, publishedAt: new Date() });
  await db().collection("announcements").doc(a3).set({ ...announcement({ title: "Ajad", responseType: "availability", audience: "parents", studentIds: [s1, s2] }), createdByUid: boss.uid, publishedAt: new Date(Date.now() - 1000) });
  await db().collection("announcements").doc(a4).set({ ...announcement({ title: "Ainult Teine", studentIds: [s3] }), createdByUid: boss.uid, publishedAt: new Date() });
  await db().collection("announcements").doc(draft).set({ ...announcement({ status: "draft", studentIds: [s1] }), createdByUid: boss.uid });

  const mine = await api(mari, "/mine");
  assert.equal(mine.status, 200, JSON.stringify(mine.body));
  assert.deepEqual(mine.body.pending.map((item) => item.announcement.id), [a2, a1], "oldest first, no draft, not Teine's, not parents-only");
  assert.equal(JSON.stringify(mine.body).includes(s3), false, "nothing about other learners");
  assert.equal(JSON.stringify(mine.body).includes("studentIds"), false);

  const parentMine = await api(parent, "/mine");
  assert.deepEqual(parentMine.body.pending.map((item) => [item.announcement.id, item.target.key]).sort(), [
    [a1, `p_${parent.uid}`], [a2, `c_${s1}`], [a2, `c_${s2}`], [a3, `c_${s1}`], [a3, `c_${s2}`],
  ].sort());
  assert.deepEqual((await api(teacher, "/mine")).body, { pending: [], past: [] }, "staff are never gated");

  // answering: own target only, valid answer, once
  assert.equal((await api(mari, "/respond", { announcementId: a4, targetKey: `u_${mari.uid}` })).status, 403, "not addressed to her");
  assert.equal((await api(mari, "/respond", { announcementId: a1, targetKey: `u_${other.uid}` })).status, 403, "not for someone else");
  assert.equal((await api(mari, "/respond", { announcementId: draft, targetKey: `u_${mari.uid}` })).status, 404, "draft");
  assert.equal((await api(mari, "/respond", { announcementId: a2, targetKey: `u_${mari.uid}`, answer: { choices: ["Hack"] } })).status, 400);
  assert.equal((await api(mari, "/respond", { announcementId: a2, targetKey: `u_${mari.uid}`, answer: { choices: ["Jah"] } })).status, 200);
  assert.equal((await api(mari, "/respond", { announcementId: a2, targetKey: `u_${mari.uid}`, answer: { choices: ["Ei"] } })).status, 409, "once");
  assert.equal((await api(mari, "/respond", { announcementId: a1, targetKey: `u_${mari.uid}` })).status, 200);
  const after = await api(mari, "/mine");
  assert.deepEqual(after.body.pending, []);
  assert.deepEqual(after.body.past.map((item) => item.announcement.id).sort(), [a1, a2].sort());
  assert.equal(await get(mari, `announcementResponses/${a2}__u_${mari.uid}`), 403, "her answer is not readable directly either");
  assert.equal(await get(boss, `announcementResponses/${a2}__u_${mari.uid}`), 200, "admin reads answers");

  // a change is allowed only when the administrator allowed it
  await db().collection("announcements").doc(a2).update({ allowChange: true });
  assert.equal((await api(mari, "/respond", { announcementId: a2, targetKey: `u_${mari.uid}`, answer: { choices: ["Ei"] } })).status, 200, "changed");
  const changed = (await db().collection("announcementResponses").doc(`${a2}__u_${mari.uid}`).get()).data();
  assert.deepEqual(changed.answer.choices, ["Ei"]);
  assert.deepEqual(changed.history[0].answer.choices, ["Jah"], "previous answer kept");

  // parent: suitable times per child; must save the times first
  assert.equal((await api(parent, "/respond", { announcementId: a3, targetKey: `c_${s1}` })).status, 400, "times not marked");
  assert.equal(await put(parent, `studentAvailability/${s1}`, { studentId: s1, slots: ["Mon-17:00", "Mon-17:30"], preferred: [], changedAt: new Date().toISOString(), changedByUid: parent.uid, changedByName: "Ema", changedByRole: "parent" }), 200);
  assert.equal((await api(parent, "/respond", { announcementId: a3, targetKey: `c_${s1}` })).status, 200);
  assert.equal((await api(parent, "/respond", { announcementId: a3, targetKey: `c_${s3}` })).status, 403, "not her child");
  assert.equal((await api(other, "/respond", { announcementId: a3, targetKey: `c_${s1}` })).status, 403, "students cannot answer parents-only");
  assert.deepEqual((await api(parent, "/mine")).body.pending.filter((item) => item.announcement.id === a3).map((item) => item.target.key), [`c_${s2}`]);

  // report: administrator only
  assert.equal((await api(mari, "/report", { announcementId: a3 })).status, 403);
  assert.equal((await api(teacher, "/report", { announcementId: a3 })).status, 403);
  const reportA3 = await api(boss, "/report", { announcementId: a3 });
  assert.equal(reportA3.status, 200, JSON.stringify(reportA3.body));
  assert.equal(reportA3.body.total, 2);
  assert.equal(reportA3.body.answered, 1);
  const rowS1 = reportA3.body.rows.find((row) => row.key === `c_${s1}`);
  assert.deepEqual(rowS1.slots, ["Mon-17:00", "Mon-17:30"]);
  assert.equal(rowS1.answeredByName, "Ema");
  const reportA2 = await api(boss, "/report", { announcementId: a2 });
  assert.deepEqual(reportA2.body.rows.map((row) => [row.key, row.answered]).sort(), [
    [`c_${s1}`, false], [`c_${s2}`, false], [`u_${mari.uid}`, true], [`u_${other.uid}`, false],
  ].sort());
});
