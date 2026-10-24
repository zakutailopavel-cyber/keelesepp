'use strict';
// „Õppesuunad” (studyDirections) against the real Firestore rules: the administrator writes, staff and finance read,
// learners and parents neither; fixed keys; nobody deletes.
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
    body: JSON.stringify({ email: `sd-${role}-${Date.now()}-${Math.random().toString(36).slice(2)}@example.com`, password: 'emulator-only-password', returnSecureToken: true }),
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
const body = (data) => JSON.stringify({ fields: Object.fromEntries(Object.entries(data).map(([k, v]) => [k, enc(v)])) });
const put = (who, id, data) => fetch(`${base()}/studyDirections/${id}`, { method: 'PATCH', headers: { Authorization: `Bearer ${who.token}`, 'Content-Type': 'application/json' }, body: body(data) }).then((r) => r.status);
const get = (who, id) => fetch(`${base()}/studyDirections/${id}`, { headers: { Authorization: `Bearer ${who.token}` } }).then((r) => r.status);
const del = (who, id) => fetch(`${base()}/studyDirections/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${who.token}` } }).then((r) => r.status);
const direction = (uid, extra = {}) => ({ name: 'Matemaatika', shortLabel: 'MA', color: '#2f80ed', levels: ['1. klass', '2. klass'], aliases: ['Muu'], status: 'active', order: 3, updatedAt: new Date().toISOString(), updatedByUid: uid, updatedByName: 'Admin', ...extra });

test('study directions: admin writes, staff and finance read, learners do not', async () => {
  safe();
  if (!admin.apps.length) admin.initializeApp({ projectId: PROJECT });
  const boss = await account('admin');
  const teacher = await account('teacher');
  const finance = await account('finance');
  const learner = await account('student');
  const parent = await account('parent');
  const id = `math-${Date.now()}`;

  assert.equal(await put(teacher, id, direction(teacher.uid)), 403, 'teacher cannot write');
  assert.equal(await put(boss, id, direction(boss.uid)), 200, 'admin writes');
  assert.equal(await put(boss, id, direction(boss.uid, { status: 'archived' })), 200, 'admin archives');
  assert.equal(await put(boss, id, direction(teacher.uid)), 403, 'signed by the writer');
  assert.equal(await put(boss, id, direction(boss.uid, { extra: true })), 403, 'fixed keys');
  assert.equal(await put(boss, id, direction(boss.uid, { status: 'deleted' })), 403, 'known status');
  assert.equal(await put(boss, id, direction(boss.uid, { color: 'red' })), 403, 'hex colour');
  assert.equal(await put(boss, id, direction(boss.uid, { name: '' })), 403, 'name required');
  assert.equal(await get(teacher, id), 200, 'teacher reads');
  assert.equal(await get(finance, id), 200, 'finance reads');
  assert.equal(await get(learner, id), 403, 'student does not read');
  assert.equal(await get(parent, id), 403, 'parent does not read');
  assert.equal(await del(boss, id), 403, 'never deleted');
});
