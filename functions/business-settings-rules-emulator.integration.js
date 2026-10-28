'use strict';
// „Ärinäitajad” settings (businessSettings/current) against the real Firestore rules: only the administrator reads and
// writes the one document (fixed keys, own uid, limits); nobody deletes it.
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
    body: JSON.stringify({ email: `bs-${role}-${Date.now()}-${Math.random().toString(36).slice(2)}@example.com`, password: 'emulator-only-password', returnSecureToken: true }),
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
const put = (who, id, data) => fetch(`${base()}/businessSettings/${id}`, { method: 'PATCH', headers: { Authorization: `Bearer ${who.token}`, 'Content-Type': 'application/json' }, body: body(data) }).then((r) => r.status);
const get = (who, id) => fetch(`${base()}/businessSettings/${id}`, { headers: { Authorization: `Bearer ${who.token}` } }).then((r) => r.status);
const del = (who, id) => fetch(`${base()}/businessSettings/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${who.token}` } }).then((r) => r.status);

const settings = (uid, extra = {}) => ({ fixedCosts: [{ label: 'Ruum', cents: 40000 }, { label: 'Administraator', cents: 75000 }], ownerTeacher: 'Pavel Zakutailo', ownerRateCents: 0, updatedAt: '2026-10-27T20:00:00.000Z', updatedByUid: uid, ...extra });

test('business settings: only the administrator reads and writes businessSettings/current', async () => {
  safe();
  if (!admin.apps.length) admin.initializeApp({ projectId: PROJECT });
  const boss = await account('admin');
  const teacher = await account('teacher');
  const learner = await account('student');

  assert.equal(await put(teacher, 'current', settings(teacher.uid)), 403, 'teacher cannot write');
  assert.equal(await put(learner, 'current', settings(learner.uid)), 403, 'student cannot write');
  assert.equal(await put(boss, 'other', settings(boss.uid)), 403, 'only the current document');
  assert.equal(await put(boss, 'current', settings(teacher.uid)), 403, 'updatedByUid is the writer');
  assert.equal(await put(boss, 'current', settings(boss.uid, { note: 'x' })), 403, 'fixed keys');
  assert.equal(await put(boss, 'current', settings(boss.uid, { ownerRateCents: -1 })), 403, 'rate not negative');
  assert.equal(await put(boss, 'current', settings(boss.uid, { fixedCosts: Array.from({ length: 21 }, () => ({ label: 'x', cents: 1 })) })), 403, 'at most 20 costs');
  assert.equal(await put(boss, 'current', settings(boss.uid)), 200, 'admin writes');
  assert.equal(await get(boss, 'current'), 200, 'admin reads');
  assert.equal(await get(teacher, 'current'), 403, 'teacher does not read');
  assert.equal(await get(learner, 'current'), 403, 'student does not read');
  assert.equal(await del(boss, 'current'), 403, 'never deleted');
});
