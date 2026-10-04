'use strict';
// Lesson summaries against the real Firestore rules: only the lesson's teacher writes, for the invitation's student;
// the student and parent read, outsiders do not.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const admin = require('firebase-admin');

const PROJECT = 'demo-keelesepp-finance';
const authHost = process.env.FIREBASE_AUTH_EMULATOR_HOST;
const dbHost = process.env.FIRESTORE_EMULATOR_HOST;
const base = `http://${dbHost}/v1/projects/${PROJECT}/databases/(default)/documents`;

async function account(role) {
  const r = await fetch(`http://${authHost}/identitytoolkit.googleapis.com/v1/accounts:signUp?key=demo`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: `sum-${role}-${Date.now()}-${Math.random().toString(36).slice(2)}@example.com`, password: 'emulator-only-password', returnSecureToken: true }),
  });
  const b = await r.json();
  const uid = JSON.parse(Buffer.from(b.idToken.split('.')[1], 'base64url')).sub;
  await admin.firestore().doc(`users/${uid}`).set({ role });
  return { token: b.idToken, uid };
}
const enc = (v) => (Array.isArray(v) ? { arrayValue: { values: v.map(enc) } }
  : v && typeof v === 'object' ? { mapValue: { fields: Object.fromEntries(Object.entries(v).map(([k, x]) => [k, enc(x)])) } }
  : { stringValue: String(v) });
const fields = (o) => Object.fromEntries(Object.entries(o).map(([k, v]) => [k, enc(v)]));
const headers = (who) => ({ Authorization: `Bearer ${who.token}`, 'Content-Type': 'application/json' });
const write = async (who, id, data) => (await fetch(`${base}/lessonSummaries/${id}`, { method: 'PATCH', headers: headers(who), body: JSON.stringify({ fields: fields(data) }) })).status;
const read = async (who, id) => (await fetch(`${base}/lessonSummaries/${id}`, { headers: headers(who) })).status;

test('lesson summaries: the lesson teacher writes, the family reads', async () => {
  assert.equal(process.env.GCLOUD_PROJECT || process.env.GOOGLE_CLOUD_PROJECT, PROJECT);
  if (!admin.apps.length) admin.initializeApp({ projectId: PROJECT });
  const db = admin.firestore();
  const teacher = await account('teacher');
  const other = await account('teacher');
  const learner = await account('student');
  const parent = await account('parent');
  const stranger = await account('student');
  await db.doc('students/st-sum').set({ name: 'Mari', linkedUserId: learner.uid, linkedParentId: parent.uid });
  await db.doc('liveLessonInvitations/inv-sum').set({ teacherUid: teacher.uid, studentId: 'st-sum', studentUid: learner.uid, status: 'accepted' });
  const summary = (extra = {}) => ({ invitationId: 'inv-sum', studentId: 'st-sum', teacherUid: teacher.uid, teacherName: 'Kati', title: 'Eesti keel', subject: 'Eesti keel', startedAt: '2026-10-04T10:00:00Z', endedAt: '2026-10-04T11:00:00Z', note: 'Tubli!', pages: [{ id: 'p1', title: 'Tund 1' }], updatedAt: '2026-10-04T11:00:00Z', ...extra });

  assert.equal(await write(other, 'inv-sum', summary({ teacherUid: other.uid })), 403, 'not the lesson teacher');
  assert.equal(await write(learner, 'inv-sum', summary({ teacherUid: learner.uid })), 403, 'students do not write');
  assert.equal(await write(teacher, 'inv-sum', summary({ studentId: 'someone-else' })), 403, 'the invitation student only');
  assert.equal(await write(teacher, 'inv-missing', summary({ invitationId: 'inv-missing' })), 403, 'invitation must exist');
  assert.equal(await write(teacher, 'inv-sum', summary({ grade: '5' })), 403, 'no extra fields');
  assert.equal(await write(teacher, 'inv-sum', summary()), 200);
  assert.equal(await write(teacher, 'inv-sum', summary({ note: 'Parandatud' })), 200, 'the teacher may update');

  assert.equal(await read(learner, 'inv-sum'), 200);
  assert.equal(await read(parent, 'inv-sum'), 200);
  assert.equal(await read(stranger, 'inv-sum'), 403);
  assert.equal(await read(other, 'inv-sum'), 200, 'staff read');
});
