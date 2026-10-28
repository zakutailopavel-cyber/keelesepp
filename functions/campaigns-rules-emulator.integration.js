'use strict';
// „Kampaaniad” (campaigns) against the real Firestore rules: only the administrator creates (fixed keys, own uid, valid
// kind and status), reads and updates (author and creation time kept); nobody deletes.
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
    body: JSON.stringify({ email: `cp-${role}-${Date.now()}-${Math.random().toString(36).slice(2)}@example.com`, password: 'emulator-only-password', returnSecureToken: true }),
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
const put = (who, id, data) => fetch(`${base()}/campaigns/${id}`, { method: 'PATCH', headers: { Authorization: `Bearer ${who.token}`, 'Content-Type': 'application/json' }, body: body(data) }).then((r) => r.status);
const get = (who, id) => fetch(`${base()}/campaigns/${id}`, { headers: { Authorization: `Bearer ${who.token}` } }).then((r) => r.status);
const del = (who, id) => fetch(`${base()}/campaigns/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${who.token}` } }).then((r) => r.status);

const campaign = (uid, extra = {}) => ({ title: 'Eelkool', kind: 'offer', status: 'preparing', startDate: '2026-11-08', endDate: '', audience: '5–6 a', offer: 'pühapäeviti', goal: '5 last',
  targetSignups: 5, signups: 0, budgetCents: 0, spentCents: 0, groupId: '', channels: ['facebook'], posts: [{ channel: 'facebook', lang: 'et', text: 'Tere', imageNote: '', postDate: '', posted: false }],
  checklist: [{ text: 'Hind', done: false }], notes: '', createdAt: '2026-10-27T20:00:00.000Z', createdByUid: uid, createdByName: 'Admin', updatedAt: '2026-10-27T20:00:00.000Z', ...extra });

test('campaigns: only the administrator creates, reads and updates; never deleted', async () => {
  safe();
  if (!admin.apps.length) admin.initializeApp({ projectId: PROJECT });
  const boss = await account('admin');
  const teacher = await account('teacher');
  const learner = await account('student');
  const id = `cp-${Date.now()}`;

  assert.equal(await put(teacher, `${id}-t`, campaign(teacher.uid)), 403, 'teacher cannot create');
  assert.equal(await put(learner, `${id}-s`, campaign(learner.uid)), 403, 'student cannot create');
  assert.equal(await put(boss, `${id}-u`, campaign(teacher.uid)), 403, 'author is the writer');
  assert.equal(await put(boss, `${id}-k`, campaign(boss.uid, { secret: 'x' })), 403, 'fixed keys');
  assert.equal(await put(boss, `${id}-n`, campaign(boss.uid, { title: '' })), 403, 'a title');
  assert.equal(await put(boss, `${id}-st`, campaign(boss.uid, { status: 'posted' })), 403, 'known status');
  assert.equal(await put(boss, `${id}-c`, campaign(boss.uid, { signups: -1 })), 403, 'counts not negative');
  assert.equal(await put(boss, id, campaign(boss.uid)), 200, 'admin creates');
  assert.equal(await get(boss, id), 200, 'admin reads');
  assert.equal(await get(teacher, id), 403, 'teacher does not read');
  assert.equal(await get(learner, id), 403, 'student does not read');
  assert.equal(await put(boss, id, campaign(boss.uid, { status: 'ready', signups: 2 })), 200, 'admin updates');
  assert.equal(await put(boss, id, campaign(boss.uid, { createdAt: '2020-01-01' })), 403, 'creation time kept');
  assert.equal(await put(teacher, id, campaign(boss.uid, { status: 'done' })), 403, 'teacher cannot update');
  assert.equal(await del(boss, id), 403, 'never deleted');
});
