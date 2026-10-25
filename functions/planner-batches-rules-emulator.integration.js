'use strict';
// „Planeerija” batch records (plannerBatches) against the real Firestore rules: only the administrator creates one
// (fixed keys, own uid, server time, status confirmed) and reads it; nobody updates or deletes it from the app.
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
    body: JSON.stringify({ email: `pb-${role}-${Date.now()}-${Math.random().toString(36).slice(2)}@example.com`, password: 'emulator-only-password', returnSecureToken: true }),
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
const putPlain = (who, id, data) => fetch(`${base()}/plannerBatches/${id}`, { method: 'PATCH', headers: { Authorization: `Bearer ${who.token}`, 'Content-Type': 'application/json' }, body: body(data) }).then((r) => r.status);
const get = (who, id) => fetch(`${base()}/plannerBatches/${id}`, { headers: { Authorization: `Bearer ${who.token}` } }).then((r) => r.status);
const del = (who, id) => fetch(`${base()}/plannerBatches/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${who.token}` } }).then((r) => r.status);

// a create with createdAt = request.time (server timestamp transform), like the app's serverTimestamp()
const create = (who, id, data, { serverTime = true } = {}) => fetch(`${base().replace('/documents', '/documents:commit')}`, {
  method: 'POST', headers: { Authorization: `Bearer ${who.token}`, 'Content-Type': 'application/json' },
  body: JSON.stringify({ writes: [{
    update: { name: `projects/${PROJECT}/databases/(default)/documents/plannerBatches/${id}`, fields: JSON.parse(body(data)).fields },
    ...(serverTime ? { updateTransforms: [{ fieldPath: 'createdAt', setToServerValue: 'REQUEST_TIME' }] } : {}),
  }] }),
}).then((r) => r.status);
const batch = (uid, extra = {}) => ({ createdBy: uid, lessonIds: ['l1', 'l2'], studentIds: ['s1'], status: 'confirmed', ...extra });

test('planner batches: only the administrator creates (fixed keys, own uid, server time) and reads; never changed', async () => {
  safe();
  if (!admin.apps.length) admin.initializeApp({ projectId: PROJECT });
  const boss = await account('admin');
  const teacher = await account('teacher');
  const learner = await account('student');
  const id = `pb-${Date.now()}`;

  assert.equal(await create(teacher, `${id}-t`, batch(teacher.uid)), 403, 'teacher cannot create');
  assert.equal(await create(learner, `${id}-s`, batch(learner.uid)), 403, 'student cannot create');
  assert.equal(await create(boss, `${id}-u`, batch(teacher.uid)), 403, 'createdBy is the writer');
  assert.equal(await create(boss, `${id}-k`, batch(boss.uid, { note: 'x' })), 403, 'fixed keys');
  assert.equal(await create(boss, `${id}-e`, batch(boss.uid, { lessonIds: [] })), 403, 'at least one lesson');
  assert.equal(await create(boss, `${id}-st`, batch(boss.uid, { status: 'sent' })), 403, 'status confirmed');
  assert.equal(await create(boss, `${id}-c`, { ...batch(boss.uid), createdAt: '2026-01-01' }, { serverTime: false }), 403, 'server time only');
  assert.equal(await create(boss, id, batch(boss.uid)), 200, 'admin creates');
  assert.equal(await get(boss, id), 200, 'admin reads');
  assert.equal(await get(teacher, id), 403, 'teacher does not read');
  assert.equal(await get(learner, id), 403, 'student does not read');
  assert.equal(await putPlain(boss, id, { ...batch(boss.uid), createdAt: 'x' }), 403, 'never updated');
  assert.equal(await del(boss, id), 403, 'never deleted');
});
