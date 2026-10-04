'use strict';
// Student word list against the real Firestore rules: staff add words, the student/parent read their own and write
// only the practice fields, outsiders see nothing.
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
    body: JSON.stringify({ email: `words-${role}-${Date.now()}-${Math.random().toString(36).slice(2)}@example.com`, password: 'emulator-only-password', returnSecureToken: true }),
  });
  const b = await r.json();
  const uid = JSON.parse(Buffer.from(b.idToken.split('.')[1], 'base64url')).sub;
  await admin.firestore().doc(`users/${uid}`).set({ role });
  return { token: b.idToken, uid };
}
const enc = (v) => (typeof v === 'number' ? { integerValue: String(v) } : { stringValue: String(v) });
const fields = (o) => Object.fromEntries(Object.entries(o).map(([k, v]) => [k, enc(v)]));
const headers = (who) => ({ Authorization: `Bearer ${who.token}`, 'Content-Type': 'application/json' });
const create = async (who, id, data) => (await fetch(`${base}/studentWords?documentId=${id}`, { method: 'POST', headers: headers(who), body: JSON.stringify({ fields: fields(data) }) })).status;
const patch = async (who, id, data) => (await fetch(`${base}/studentWords/${id}?${Object.keys(data).map((k) => `updateMask.fieldPaths=${k}`).join('&')}`, { method: 'PATCH', headers: headers(who), body: JSON.stringify({ fields: fields(data) }) })).status;
const read = async (who, id) => (await fetch(`${base}/studentWords/${id}`, { headers: headers(who) })).status;
const remove = async (who, id) => (await fetch(`${base}/studentWords/${id}`, { method: 'DELETE', headers: headers(who) })).status;

test('student words: staff write, owner practises, outsiders see nothing', async () => {
  assert.equal(process.env.GCLOUD_PROJECT || process.env.GOOGLE_CLOUD_PROJECT, PROJECT);
  if (!admin.apps.length) admin.initializeApp({ projectId: PROJECT });
  const teacher = await account('teacher');
  const learner = await account('student');
  const parent = await account('parent');
  const stranger = await account('student');
  await admin.firestore().doc('students/st-words').set({ name: 'Mari', linkedUserId: learner.uid, linkedParentId: parent.uid });
  const word = (extra = {}) => ({ studentId: 'st-words', invitationId: 'inv-1', word: 'kass', translation: 'кошка', example: 'Kass magab.', createdByUid: teacher.uid, createdByName: 'Kati', createdAt: '2026-10-04T10:00:00Z', updatedAt: '2026-10-04T10:00:00Z', box: 0, dueAt: '2026-10-04T10:00:00Z', ...extra });

  assert.equal(await create(learner, 'w0', { ...word(), createdByUid: learner.uid }), 403, 'students do not add words');
  assert.equal(await create(teacher, 'w0', word({ createdByUid: learner.uid })), 403, 'author is the writer');
  assert.equal(await create(teacher, 'w0', word({ box: 3 })), 403, 'starts in box 0');
  assert.equal(await create(teacher, 'w0', word({ word: '' })), 403, 'word required');
  assert.equal(await create(teacher, 'w0', word({ studentId: 'missing' })), 403, 'student must exist');
  assert.equal(await create(teacher, 'w0', word({ grade: 5 })), 403, 'no extra fields');
  assert.equal(await create(teacher, 'w1', word()), 200);

  assert.equal(await read(learner, 'w1'), 200);
  assert.equal(await read(parent, 'w1'), 200);
  assert.equal(await read(stranger, 'w1'), 403);

  assert.equal(await patch(learner, 'w1', { box: 1, dueAt: '2026-10-05T10:00:00Z', reviewedAt: '2026-10-04T11:00:00Z', reviews: 1 }), 200);
  assert.equal(await patch(learner, 'w1', { box: 9 }), 403, 'box 0–5');
  assert.equal(await patch(learner, 'w1', { word: 'koer' }), 403, 'the student does not change the word');
  assert.equal(await patch(stranger, 'w1', { box: 2 }), 403);
  assert.equal(await patch(teacher, 'w1', { translation: 'кот', updatedAt: '2026-10-04T12:00:00Z' }), 200);
  assert.equal(await patch(teacher, 'w1', { createdByUid: learner.uid }), 403);

  assert.equal(await remove(learner, 'w1'), 403);
  assert.equal(await remove(teacher, 'w1'), 200);
});
