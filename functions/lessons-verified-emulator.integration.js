'use strict';
// „Toimunud ja kontrollitud” against the real Firestore rules (emulators): only an admin sets or clears the check on a
// lesson; the lesson's own teacher may still change other fields but not the check.
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
    body: JSON.stringify({ email: `lv-${role}-${Date.now()}-${Math.random().toString(36).slice(2)}@example.com`, password: 'emulator-only-password', returnSecureToken: true }),
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
  const r = await fetch(`${base()}/lessons/${id}?${mask}`, { method: 'PATCH', headers: { Authorization: `Bearer ${who.token}`, 'Content-Type': 'application/json' }, body: fields(data) });
  return r.status;
}

test('lessons: only an admin marks a held lesson checked', async () => {
  safe();
  if (!admin.apps.length) admin.initializeApp({ projectId: PROJECT });
  const teacher = await account('teacher');
  const boss = await account('admin');
  const id = `lv_${Date.now()}`;
  await admin.firestore().doc(`lessons/${id}`).set({ studentId: 'st-lv', studentName: 'Mari', teacherUid: teacher.uid, teacher: 'Õpetaja', date: '2026-09-04', status: 'Toimunud', duration: 60 });
  const check = { verified: true, verifiedAt: new Date().toISOString(), verifiedByUid: teacher.uid, verifiedByName: 'Õpetaja' };

  assert.equal(await patch(teacher, id, { notes: 'Hea tund' }), 200, 'teacher still edits own lesson notes');
  assert.equal(await patch(teacher, id, check), 403, 'teacher cannot mark it checked');
  assert.equal(await patch(boss, id, { ...check, verifiedByUid: boss.uid }), 200, 'admin marks it checked');
  assert.equal(await patch(teacher, id, { verified: false }), 403, 'teacher cannot clear the check');
  assert.equal(await patch(boss, id, { verified: false }), 200, 'admin clears the check');
});
