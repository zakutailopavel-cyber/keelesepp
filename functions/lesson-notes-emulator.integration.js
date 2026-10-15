'use strict';
// The administrator's lesson notes (Oleksiy 2026-10-15) against the real Firestore rules: the admin writes; the admin and
// the lesson's teacher read; another teacher, a student and a parent never.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const admin = require('firebase-admin');

const PROJECT = 'demo-keelesepp-finance';
const authHost = process.env.FIREBASE_AUTH_EMULATOR_HOST;
const dbHost = process.env.FIRESTORE_EMULATOR_HOST;

function safe() {
  assert.equal(process.env.GCLOUD_PROJECT || process.env.GOOGLE_CLOUD_PROJECT, PROJECT);
  for (const h of [authHost, dbHost]) assert.match(h || '', /^(127\.0\.0\.1|localhost):\d+$/);
}

async function account(role) {
  const r = await fetch(`http://${authHost}/identitytoolkit.googleapis.com/v1/accounts:signUp?key=demo`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: `ln-${role}-${Date.now()}-${Math.random().toString(36).slice(2)}@example.com`, password: 'emulator-only-password', returnSecureToken: true }),
  });
  const b = await r.json();
  assert.ok(b.idToken);
  const uid = JSON.parse(Buffer.from(b.idToken.split('.')[1], 'base64url')).sub;
  await admin.firestore().doc(`users/${uid}`).set({ role });
  return { token: b.idToken, uid };
}

function enc(v) {
  if (v === null) return { nullValue: null };
  if (Array.isArray(v)) return { arrayValue: { values: v.map(enc) } };
  if (typeof v === 'object') return { mapValue: { fields: Object.fromEntries(Object.entries(v).map(([k, x]) => [k, enc(x)])) } };
  if (typeof v === 'boolean') return { booleanValue: v };
  if (typeof v === 'number') return Number.isInteger(v) ? { integerValue: String(v) } : { doubleValue: v };
  return { stringValue: String(v) };
}
const base = () => `http://${dbHost}/v1/projects/${PROJECT}/databases/(default)/documents`;
const fields = (data) => JSON.stringify({ fields: Object.fromEntries(Object.entries(data).map(([k, v]) => [k, enc(v)])) });
const headers = (who) => ({ Authorization: `Bearer ${who.token}`, 'Content-Type': 'application/json' });
const write = async (who, id, data) => (await fetch(`${base()}/lessonNotes/${id}`, { method: 'PATCH', headers: headers(who), body: fields(data) })).status;
const read = async (who, id) => (await fetch(`${base()}/lessonNotes/${id}`, { headers: headers(who) })).status;
async function listOwn(who) {
  const r = await fetch(`${base()}:runQuery`, { method: 'POST', headers: headers(who), body: JSON.stringify({ structuredQuery: { from: [{ collectionId: 'lessonNotes' }], where: { fieldFilter: { field: { fieldPath: 'teacherUid' }, op: 'EQUAL', value: { stringValue: who.uid } } } } }) });
  return r.status;
}

test('lesson notes: the admin writes, the admin and the lesson teacher read, nobody else', async () => {
  safe();
  if (!admin.apps.length) admin.initializeApp({ projectId: PROJECT });
  const boss = await account('admin');
  const teacher = await account('teacher');
  const other = await account('teacher');
  const student = await account('student');
  const parent = await account('parent');
  const id = `sch_${Date.now()}`;
  const note = { scheduleId: id, date: '', teacherUid: teacher.uid, studentName: 'Mari', text: 'Maksab isa', updatedAt: new Date().toISOString(), updatedBy: boss.uid, updatedByName: 'Admin' };

  assert.equal(await write(teacher, id, { ...note, updatedBy: teacher.uid }), 403, 'a teacher cannot write a note');
  assert.equal(await write(boss, id, { ...note, extra: 'x' }), 403, 'only the known fields');
  assert.equal(await write(boss, id, { ...note, text: '' }), 403, 'an empty note is deleted, never stored');
  assert.equal(await write(boss, id, note), 200, 'the admin writes');
  assert.equal(await read(boss, id), 200, 'the admin reads');
  assert.equal(await read(teacher, id), 200, 'the lesson teacher reads');
  assert.equal(await listOwn(teacher), 200, 'the teacher lists the notes of own lessons');
  assert.equal(await read(other, id), 403, 'another teacher does not');
  assert.equal(await read(student, id), 403, 'a student does not');
  assert.equal(await read(parent, id), 403, 'a parent does not');
  const del = await fetch(`${base()}/lessonNotes/${id}`, { method: 'DELETE', headers: headers(teacher) });
  assert.equal(del.status, 403, 'a teacher cannot delete it');
});
