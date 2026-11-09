"use strict";
// „Kuu monoloog” (`studentMonologues/{studentId}_{YYYY-MM}`, `studentMonologueNotes/{monologueId}`) against the real
// Firestore rules: only the student's own account writes its monologue, in the current month, and may replace the take;
// the card's teacher and admins read it; a parent, another teacher and another student have no access. The teacher's
// note lives in its own collection that the student cannot read.
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
    body: JSON.stringify({ email: `monologue-${role}-${Date.now()}-${Math.random().toString(36).slice(2)}@example.com`, password: "emulator-only-password", returnSecureToken: true }),
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
const fieldsOf = (data) => Object.fromEntries(Object.entries(data).map(([k, v]) => [k, encode(v)]));
const create = (path, data) => ({ update: { name: name(path), fields: fieldsOf(data) }, currentDocument: { exists: false } });
const patch = (path, data) => ({ update: { name: name(path), fields: fieldsOf(data) }, updateMask: { fieldPaths: Object.keys(data) }, currentDocument: { exists: true } });
const remove = (path) => ({ delete: name(path) });
async function commit(who, writes) {
  const response = await fetch(`http://${DB}/v1/projects/${PROJECT_ID}/databases/(default)/documents:commit`, {
    method: "POST", headers: { Authorization: `Bearer ${who.token}`, "Content-Type": "application/json" }, body: JSON.stringify({ writes }),
  });
  return response.status;
}
async function read(who, path) {
  return (await fetch(`http://${DB}/v1/projects/${PROJECT_ID}/databases/(default)/documents/${path}`, { headers: { Authorization: `Bearer ${who.token}` } })).status;
}
// a list query by studentId, the way the app reads (student: own card; staff: the card's monologues / notes)
async function list(who, collection, studentId) {
  const response = await fetch(`http://${DB}/v1/projects/${PROJECT_ID}/databases/(default)/documents:runQuery`, {
    method: "POST", headers: { Authorization: `Bearer ${who.token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ structuredQuery: { from: [{ collectionId: collection }], where: { fieldFilter: { field: { fieldPath: "studentId" }, op: "EQUAL", value: { stringValue: studentId } } } } }),
  });
  return response.status;
}
const pad = (n) => String(n).padStart(2, "0");
const monthOf = (date) => `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}`;

test("the student records its own monthly monologue; the card's teacher and admins read it and keep a private note", async () => {
  safe();
  if (!admin.apps.length) admin.initializeApp({ projectId: PROJECT_ID });
  const db = admin.firestore();
  const [student, otherStudent, parent, teacher, otherTeacher, adminUser] = await Promise.all([
    account("student", db), account("student", db), account("parent", db), account("teacher", db), account("teacher", db), account("admin", db),
  ]);
  const suffix = Math.random().toString(36).slice(2, 10);
  const sid = `smono${suffix}`;
  await db.doc(`students/${sid}`).set({ name: "Mari", linkedUserId: student.uid, linkedParentId: parent.uid, teacherUid: teacher.uid, teacher: "Kati", level: "B1", subject: "Eesti keel" });
  const month = monthOf(new Date());
  const id = `${sid}_${month}`;
  const now = new Date().toISOString();
  const take = (extra = {}) => ({
    studentId: sid, studentUid: student.uid, month, promptId: "et-self-v1", level: "B1",
    audioPath: `homework/${sid}/monologues/${month}.webm`, contentType: "audio/webm", seconds: 118, createdAt: now, updatedAt: now, ...extra,
  });

  // refused creates
  assert.equal(await commit(parent, [create(`studentMonologues/${id}`, take({ studentUid: parent.uid }))]), 403, "a parent");
  assert.equal(await commit(teacher, [create(`studentMonologues/${id}`, take({ studentUid: teacher.uid }))]), 403, "the teacher");
  assert.equal(await commit(otherStudent, [create(`studentMonologues/${id}`, take({ studentUid: otherStudent.uid }))]), 403, "another student");
  assert.equal(await commit(student, [create(`studentMonologues/${id}`, take({ studentUid: otherStudent.uid }))]), 403, "studentUid = the writer");
  assert.equal(await commit(student, [create(`studentMonologues/${sid}_2020-01`, take({ month: "2020-01", audioPath: `homework/${sid}/monologues/2020-01.webm` }))]), 403, "a past month");
  assert.equal(await commit(student, [create(`studentMonologues/${sid}_x`, take())]), 403, "the id is studentId_month");
  assert.equal(await commit(student, [create(`studentMonologues/${id}`, take({ audioPath: `homework/other/monologues/${month}.webm` }))]), 403, "audio of another card");
  assert.equal(await commit(student, [create(`studentMonologues/${id}`, take({ seconds: 600 }))]), 403, "at most ~2 minutes");
  assert.equal(await commit(student, [create(`studentMonologues/${id}`, take({ level: "A1" }))]), 403, "A2–C1 only");
  assert.equal(await commit(student, [create(`studentMonologues/${id}`, take({ teacherNote: "hea" }))]), 403, "no teacher note on the record");

  // the student's own monologue
  assert.equal(await commit(student, [create(`studentMonologues/${id}`, take())]), 200, "the student records");
  assert.equal(await read(student, `studentMonologues/${id}`), 200, "the student reads its own");
  assert.equal(await list(student, "studentMonologues", sid), 200, "the student lists its card");
  assert.equal(await read(teacher, `studentMonologues/${id}`), 200, "the card's teacher");
  assert.equal(await list(teacher, "studentMonologues", sid), 200, "the teacher lists the card");
  assert.equal(await read(adminUser, `studentMonologues/${id}`), 200, "an admin");
  assert.equal(await read(parent, `studentMonologues/${id}`), 403, "a parent: no access");
  assert.equal(await list(parent, "studentMonologues", sid), 403, "a parent cannot list");
  assert.equal(await read(otherTeacher, `studentMonologues/${id}`), 403, "another teacher");
  assert.equal(await read(otherStudent, `studentMonologues/${id}`), 403, "another student");

  // a new take in the same month
  assert.equal(await commit(student, [patch(`studentMonologues/${id}`, { audioPath: `homework/${sid}/monologues/${month}.m4a`, contentType: "audio/mp4", seconds: 95, updatedAt: new Date().toISOString() })]), 200, "re-record");
  assert.equal(await commit(student, [patch(`studentMonologues/${id}`, { createdAt: "2020-01-01T00:00:00.000Z" })]), 403, "not createdAt");
  assert.equal(await commit(student, [patch(`studentMonologues/${id}`, { teacherNote: "ise" })]), 403, "the student cannot write a teacher note");
  assert.equal(await commit(teacher, [patch(`studentMonologues/${id}`, { seconds: 10 })]), 403, "the teacher does not change the take");
  assert.equal(await commit(parent, [patch(`studentMonologues/${id}`, { seconds: 10 })]), 403, "a parent");

  // the teacher's note: staff only
  const note = (who, extra = {}) => ({ studentId: sid, monologueId: id, text: "Räägib vabamalt kui oktoobris.", byUid: who.uid, byName: "Kati", updatedAt: now, ...extra });
  assert.equal(await commit(student, [create(`studentMonologueNotes/${id}`, note(student))]), 403, "the student");
  assert.equal(await commit(otherTeacher, [create(`studentMonologueNotes/${id}`, note(otherTeacher))]), 403, "another teacher");
  assert.equal(await commit(teacher, [create(`studentMonologueNotes/${id}`, note(adminUser))]), 403, "byUid = the writer");
  assert.equal(await commit(teacher, [create(`studentMonologueNotes/${id}`, note(teacher, { text: "x".repeat(501) }))]), 403, "at most 500");
  assert.equal(await commit(teacher, [create(`studentMonologueNotes/${sid}_2020-01`, note(teacher, { monologueId: `${sid}_2020-01` }))]), 403, "no such monologue");
  assert.equal(await commit(teacher, [create(`studentMonologueNotes/${id}`, note(teacher))]), 200, "the card's teacher");
  assert.equal(await read(teacher, `studentMonologueNotes/${id}`), 200);
  assert.equal(await list(teacher, "studentMonologueNotes", sid), 200, "the teacher lists the notes");
  assert.equal(await read(adminUser, `studentMonologueNotes/${id}`), 200);
  assert.equal(await read(student, `studentMonologueNotes/${id}`), 403, "the student never reads the note");
  assert.equal(await list(student, "studentMonologueNotes", sid), 403, "nor lists them");
  assert.equal(await read(parent, `studentMonologueNotes/${id}`), 403, "a parent");
  assert.equal(await commit(adminUser, [patch(`studentMonologueNotes/${id}`, { text: "Admin lisas.", byUid: adminUser.uid, updatedAt: now })]), 200, "an admin edits");
  assert.equal(await commit(student, [remove(`studentMonologueNotes/${id}`)]), 403, "the student cannot delete it");
  assert.equal(await commit(teacher, [remove(`studentMonologueNotes/${id}`)]), 200, "the teacher deletes it");

  // the transcriber's fields (school Mac, Admin SDK): no app user sets them, not even the student on its own doc
  assert.equal(await commit(student, [patch(`studentMonologues/${id}`, { transcript: "Ise kirjutatud.", words: 2 })]), 403, "the student cannot write the text");
  assert.equal(await commit(teacher, [patch(`studentMonologues/${id}`, { wpm: 200 })]), 403, "nor the teacher");
  assert.equal(await commit(adminUser, [patch(`studentMonologues/${id}`, { transcribedTake: "x" })]), 403, "nor an admin through the app");
  await db.doc(`studentMonologues/${id}`).update({ transcript: "Mina olen Mari.", words: 3, wpm: 2, transcribedTake: now, transcribedAt: now, transcriber: "kool-mac" });
  assert.equal(await read(student, `studentMonologues/${id}`), 200, "the student reads its own text");
  assert.equal(await commit(student, [patch(`studentMonologues/${id}`, { audioPath: `homework/${sid}/monologues/${month}.webm`, contentType: "audio/webm", seconds: 100, updatedAt: new Date().toISOString() })]), 200, "a new take next to the text");

  // the error check: staff only, written only by the transcriber
  const analysis = { studentId: sid, monologueId: id, month, take: now, errors: [{ said: "ma läksin pood", corrected: "ma läksin poodi", kind: "vorm" }], checked: 3, focus: [], analyzedAt: now };
  assert.equal(await commit(teacher, [create(`studentMonologueAnalysis/${id}`, analysis)]), 403, "the teacher cannot write it");
  assert.equal(await commit(adminUser, [create(`studentMonologueAnalysis/${id}`, analysis)]), 403, "nor an admin through the app");
  assert.equal(await commit(student, [create(`studentMonologueAnalysis/${id}`, analysis)]), 403, "nor the student");
  await db.doc(`studentMonologueAnalysis/${id}`).set(analysis);
  assert.equal(await read(teacher, `studentMonologueAnalysis/${id}`), 200, "the card's teacher reads it");
  assert.equal(await list(teacher, "studentMonologueAnalysis", sid), 200, "and lists the card's");
  assert.equal(await read(adminUser, `studentMonologueAnalysis/${id}`), 200, "an admin");
  assert.equal(await read(student, `studentMonologueAnalysis/${id}`), 403, "the student never reads it");
  assert.equal(await list(student, "studentMonologueAnalysis", sid), 403, "nor lists it");
  assert.equal(await read(parent, `studentMonologueAnalysis/${id}`), 403, "a parent");
  assert.equal(await read(otherTeacher, `studentMonologueAnalysis/${id}`), 403, "another teacher");
  assert.equal(await commit(teacher, [remove(`studentMonologueAnalysis/${id}`)]), 403, "the teacher cannot delete it");

  // deleting a monologue: admins only
  assert.equal(await commit(student, [remove(`studentMonologues/${id}`)]), 403, "the student");
  assert.equal(await commit(teacher, [remove(`studentMonologues/${id}`)]), 403, "the teacher");
  assert.equal((await db.doc(`studentMonologues/${id}`).get()).get("seconds"), 100);
  assert.equal(await commit(adminUser, [remove(`studentMonologues/${id}`)]), 200, "an admin");
});
