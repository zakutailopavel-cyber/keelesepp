"use strict";
// „Kiirküsimus” (livePolls/{kind}_{roomId}, key/current, answers/{uid}) against the real Firestore rules: only the room's
// teacher asks while the room is live and only to its students; the right option stays teacher-only until it is
// revealed (and must match the key); a student writes only his own answer to the open round; reads are limited to the
// room's people.
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
    body: JSON.stringify({ email: `poll-${role}-${Date.now()}-${Math.random().toString(36).slice(2)}@example.com`, password: "emulator-only-password", returnSecureToken: true }),
  });
  const body = await response.json();
  const uid = JSON.parse(Buffer.from(body.idToken.split(".")[1], "base64url")).sub;
  await db.doc(`users/${uid}`).set({ role, displayName: `Poll ${role}` });
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
// a whole-document write (setDoc); `stamps` = fields set to the server time; `mask` = update only those fields
function put(path, fields, { stamps = [], mask = null, exists } = {}) {
  return {
    update: { name: name(path), fields: Object.fromEntries(Object.entries(fields).map(([k, v]) => [k, encode(v)])) },
    ...(mask ? { updateMask: { fieldPaths: mask } } : {}),
    ...(exists === undefined ? {} : { currentDocument: { exists } }),
    ...(stamps.length ? { updateTransforms: stamps.map((fieldPath) => ({ fieldPath, setToServerValue: "REQUEST_TIME" })) } : {}),
  };
}
async function commit(who, writes) {
  const response = await fetch(`http://${DB}/v1/projects/${PROJECT_ID}/databases/(default)/documents:commit`, {
    method: "POST", headers: { Authorization: `Bearer ${who.token}`, "Content-Type": "application/json" }, body: JSON.stringify({ writes }),
  });
  return response.status;
}
async function read(who, path) {
  return (await fetch(`http://${DB}/v1/projects/${PROJECT_ID}/databases/(default)/documents/${path}`, { headers: { Authorization: `Bearer ${who.token}` } })).status;
}

const question = (teacherUid, participantUids, roomId, extra = {}) => ({
  kind: "lesson", roomId, teacherUid, participantUids, round: 1, mode: "gap", question: "Vali õige vorm", sentence: "Ma elan ___ (Tallinn).",
  options: ["Tallinnas", "Tallinnasse", "Tallinnast"], timeLimitSec: 30, status: "open", correctIndex: -1, ...extra,
});
// the client's start(): the poll and its key in one batch
const ask = (pollId, data, correctIndex = 0) => [
  put(`livePolls/${pollId}`, data, { stamps: ["startedAt", "updatedAt"] }),
  put(`livePolls/${pollId}/key/current`, { teacherUid: data.teacherUid, round: data.round, correctIndex }),
];
const answer = (pollId, who, round, choice, extra = {}) => put(`livePolls/${pollId}/answers/${who.uid}`, { uid: who.uid, name: "Mari", round, choice, ...extra }, { stamps: ["answeredAt"] });
const reveal = (pollId, correctIndex, status = "revealed") => put(`livePolls/${pollId}`, { status, correctIndex }, { stamps: ["updatedAt"], mask: ["status", "correctIndex", "updatedAt"], exists: true });

test("1:1 room: the teacher asks, the student answers only his own, the key stays hidden until the reveal", async () => {
  safe();
  if (!admin.apps.length) admin.initializeApp({ projectId: PROJECT_ID });
  const db = admin.firestore();
  const [teacher, other, student, outsider] = await Promise.all([account("teacher", db), account("teacher", db), account("student", db), account("student", db)]);
  const suffix = Math.random().toString(36).slice(2);
  const inv = `inv-poll-${suffix}`;
  const closedInv = `inv-poll-closed-${suffix}`;
  const pollId = `lesson_${inv}`;
  await db.doc(`liveLessonInvitations/${inv}`).set({ teacherUid: teacher.uid, studentUid: student.uid, studentId: "s1", roomKey: inv, status: "accepted", title: "Tund" });
  await db.doc(`liveLessonInvitations/${closedInv}`).set({ teacherUid: teacher.uid, studentUid: student.uid, studentId: "s1", roomKey: closedInv, status: "closed", title: "Tund" });
  const q = (extra) => question(teacher.uid, [student.uid], inv, extra);

  assert.equal(await read(student, `livePolls/${pollId}`), 404, "before the first question the room may listen (nothing there)");
  // refused questions
  assert.equal(await commit(other, ask(pollId, question(other.uid, [student.uid], inv))), 403, "another teacher");
  assert.equal(await commit(student, ask(pollId, question(student.uid, [student.uid], inv))), 403, "the student");
  assert.equal(await commit(teacher, ask(pollId, q({ participantUids: [outsider.uid] }))), 403, "only the room's student");
  assert.equal(await commit(teacher, ask(`lesson_${closedInv}`, question(teacher.uid, [student.uid], closedInv))), 403, "a closed lesson");
  assert.equal(await commit(teacher, ask(`group_${inv}`, q())), 403, "the id is kind_roomId");
  assert.equal(await commit(teacher, ask(pollId, q({ correctIndex: 0 }))), 403, "the right option is not on the question");
  assert.equal(await commit(teacher, ask(pollId, q({ options: ["a", "b", "c", "d", "e"] }))), 403, "at most four options");
  assert.equal(await commit(teacher, ask(pollId, q({ options: ["a", ""] }))), 403, "no empty option");
  assert.equal(await commit(teacher, ask(pollId, q({ extra: 1 }))), 403, "unknown field");
  assert.equal(await commit(teacher, [put(`livePolls/${pollId}`, { ...q(), startedAt: "2026-11-04T10:00:00Z" }, { stamps: ["updatedAt"] })]), 403, "server time only");
  assert.equal(await commit(teacher, ask(pollId, q(), 5)), 403, "the key points at an option");

  assert.equal(await commit(teacher, ask(pollId, q(), 0)), 200, "the teacher asks");
  assert.equal(await read(student, `livePolls/${pollId}`), 200, "the student reads the question");
  assert.equal(await read(outsider, `livePolls/${pollId}`), 403, "an outsider does not");
  assert.equal(await read(student, `livePolls/${pollId}/key/current`), 403, "the student never reads the key");
  assert.equal(await read(teacher, `livePolls/${pollId}/key/current`), 200);
  assert.equal(await commit(student, [put(`livePolls/${pollId}/key/current`, { teacherUid: student.uid, round: 1, correctIndex: 1 })]), 403);

  // answers
  assert.equal(await commit(student, [answer(pollId, student, 1, 1)]), 200, "the student answers");
  assert.equal(await commit(student, [answer(pollId, student, 1, 0)]), 200, "and changes his answer");
  assert.equal(await commit(student, [put(`livePolls/${pollId}/answers/${outsider.uid}`, { uid: outsider.uid, name: "X", round: 1, choice: 0 }, { stamps: ["answeredAt"] })]), 403, "only his own");
  assert.equal(await commit(student, [answer(pollId, student, 2, 0)]), 403, "only the open round");
  assert.equal(await commit(student, [answer(pollId, student, 1, 3)]), 403, "an existing option");
  assert.equal(await commit(student, [answer(pollId, student, 1, 0, { correct: true })]), 403, "no extra fields");
  assert.equal(await commit(student, [put(`livePolls/${pollId}/answers/${student.uid}`, { uid: student.uid, name: "Mari", round: 1, choice: 0, answeredAt: "2026-11-04T10:00:00Z" })]), 403, "server time");
  assert.equal(await commit(outsider, [answer(pollId, outsider, 1, 0)]), 403, "not in the room");
  assert.equal(await read(student, `livePolls/${pollId}/answers/${student.uid}`), 200);
  assert.equal(await read(outsider, `livePolls/${pollId}/answers/${student.uid}`), 403);
  assert.equal(await read(teacher, `livePolls/${pollId}/answers`), 200, "the teacher lists the answers");
  assert.equal(await read(student, `livePolls/${pollId}/answers`), 403, "a student does not list them");
  assert.equal(await commit(student, [reveal(pollId, 0)]), 403, "only the teacher reveals");

  // reveal and close
  assert.equal(await commit(teacher, [reveal(pollId, 1)]), 403, "the shown option must be the key's");
  assert.equal(await commit(teacher, [put(`livePolls/${pollId}`, { status: "revealed", correctIndex: 0, question: "Muu" }, { stamps: ["updatedAt"], mask: ["status", "correctIndex", "question", "updatedAt"], exists: true })]), 403, "only status + right option");
  assert.equal(await commit(teacher, [reveal(pollId, 0)]), 200, "„Näita vastust”");
  assert.equal(await commit(student, [answer(pollId, student, 1, 1)]), 403, "no answers after the reveal");
  assert.equal(await commit(teacher, [reveal(pollId, 0, "closed")]), 200, "„Lõpeta”");

  // the next question
  assert.equal(await commit(teacher, ask(pollId, q({ round: 3 }))), 403, "rounds go one by one");
  assert.equal(await commit(teacher, ask(pollId, q({ round: 2, mode: "choice", question: "Kas „maja” on nimisõna?", sentence: "", options: ["jah", "ei"] }), 0)), 200);
  assert.equal(await commit(student, [answer(pollId, student, 2, 1)]), 200, "answers the new round");
  await db.doc(`liveLessonInvitations/${inv}`).update({ status: "closed" });
  assert.equal(await commit(teacher, ask(pollId, q({ round: 3 }))), 403, "no question after the lesson");
  assert.equal(await commit(teacher, [reveal(pollId, 0)]), 200, "the open one can still be revealed");
});

test("group room: only the group's teacher asks its members; a member answers, others cannot read his answer", async () => {
  safe();
  if (!admin.apps.length) admin.initializeApp({ projectId: PROJECT_ID });
  const db = admin.firestore();
  const [teacher, mari, jaan, outsider] = await Promise.all([account("teacher", db), account("student", db), account("student", db), account("student", db)]);
  const room = `room-poll-${Math.random().toString(36).slice(2)}`;
  const pollId = `group_${room}`;
  await db.doc(`liveGroupRooms/${room}`).set({ teacherUid: teacher.uid, memberUids: [mari.uid, jaan.uid], members: [{ studentUid: mari.uid, studentId: "s1" }, { studentUid: jaan.uid, studentId: "s2" }], status: "open", title: "Grupp", createdAt: admin.firestore.Timestamp.now(), closedAt: null });
  const q = (extra) => question(teacher.uid, [mari.uid, jaan.uid], room, { kind: "group", ...extra });
  assert.equal(await commit(teacher, ask(pollId, q({ participantUids: [mari.uid] }))), 403, "all members, as in the room");
  assert.equal(await commit(teacher, ask(pollId, q(), 2)), 200);
  assert.equal(await read(jaan, `livePolls/${pollId}`), 200);
  assert.equal(await read(outsider, `livePolls/${pollId}`), 403);
  assert.equal(await commit(mari, [answer(pollId, mari, 1, 2)]), 200);
  assert.equal(await commit(jaan, [answer(pollId, jaan, 1, 0)]), 200);
  assert.equal(await commit(outsider, [answer(pollId, outsider, 1, 0)]), 403);
  assert.equal(await read(jaan, `livePolls/${pollId}/answers/${mari.uid}`), 403, "a member does not see another's answer");
  assert.equal(await read(teacher, `livePolls/${pollId}/answers/${mari.uid}`), 200);
  assert.equal(await commit(teacher, [reveal(pollId, 2)]), 200);
  const stored = (await db.doc(`livePolls/${pollId}`).get()).data();
  assert.equal(stored.correctIndex, 2);
  assert.ok(stored.updatedAt.toMillis() > Date.now() - 60000, "server time");
});
