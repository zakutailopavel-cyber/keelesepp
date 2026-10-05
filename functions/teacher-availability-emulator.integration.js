'use strict';
// Teacher windows (teacherAvailability) against the real Firestore rules (emulators): a teacher writes their own
// green/red windows, the admin anyone's; staff read them, students do not.
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
    body: JSON.stringify({ email: `av-${role}-${Date.now()}-${Math.random().toString(36).slice(2)}@example.com`, password: 'emulator-only-password', returnSecureToken: true }),
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
async function put(who, id, data) {
  const r = await fetch(`${base()}/teacherAvailability/${id}`, { method: 'PATCH', headers: { Authorization: `Bearer ${who.token}`, 'Content-Type': 'application/json' }, body: fields(data) });
  return r.status;
}
const get = (who, id) => fetch(`${base()}/teacherAvailability/${id}`, { headers: { Authorization: `Bearer ${who.token}` } }).then((r) => r.status);
const windows = (teacherUid, updatedBy) => ({ teacherUid, teacherName: 'Õpetaja', slots: [{ id: 'a', kind: 'busy', day: 'Mon', start: '18:00', end: '20:00' }], updatedAt: new Date().toISOString(), updatedBy });

test('teacher windows: own for teachers, any for the admin, hidden from students', async () => {
  safe();
  if (!admin.apps.length) admin.initializeApp({ projectId: PROJECT });
  const teacher = await account('teacher');
  const other = await account('teacher');
  const boss = await account('admin');
  const learner = await account('student');

  assert.equal(await put(teacher, teacher.uid, windows(teacher.uid, teacher.uid)), 200, 'teacher marks own windows');
  assert.equal(await put(teacher, other.uid, windows(other.uid, teacher.uid)), 403, 'not another teacher\'s');
  assert.equal(await put(teacher, teacher.uid, { ...windows(teacher.uid, teacher.uid), extra: 1 }), 403, 'fixed keys');
  assert.equal(await put(boss, other.uid, windows(other.uid, boss.uid)), 200, 'admin marks anyone\'s');
  assert.equal(await get(other, teacher.uid), 200, 'staff read');
  assert.equal(await get(learner, teacher.uid), 403, 'students do not');
});
