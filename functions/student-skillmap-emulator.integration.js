'use strict';
// The student's skill map against the real Firestore rules (emulators): the linked student and parent keep editing
// their contact fields, but only staff change the skill map (it is the teacher's assessment).
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
    body: JSON.stringify({ email: `sk-${role}-${Date.now()}-${Math.random().toString(36).slice(2)}@example.com`, password: 'emulator-only-password', returnSecureToken: true }),
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
async function patch(who, id, data) {
  const mask = Object.keys(data).map((k) => `updateMask.fieldPaths=${encodeURIComponent(k)}`).join('&');
  const r = await fetch(`${base()}/students/${id}?${mask}`, { method: 'PATCH', headers: { Authorization: `Bearer ${who.token}`, 'Content-Type': 'application/json' }, body: fields(data) });
  return r.status;
}

test('students: only staff change the skill map', async () => {
  safe();
  if (!admin.apps.length) admin.initializeApp({ projectId: PROJECT });
  const learner = await account('student');
  const parent = await account('parent');
  const boss = await account('admin');
  const id = `sk_${Date.now()}`;
  await admin.firestore().doc(`students/${id}`).set({ name: 'Mari', linkedUserId: learner.uid, linkedParentId: parent.uid, skillMap: { Grammatika: 40 } });

  assert.equal(await patch(learner, id, { phone: '5551234' }), 200, 'student still edits own contact');
  assert.equal(await patch(learner, id, { skillMap: { Grammatika: 100 } }), 403, 'student cannot raise own skills');
  assert.equal(await patch(parent, id, { skillMap: { Grammatika: 100 }, skillMapUpdatedAt: 'x' }), 403, 'parent cannot either');
  assert.equal(await patch(boss, id, { skillMap: { Grammatika: 45 } }), 200, 'staff sets skills');
});
