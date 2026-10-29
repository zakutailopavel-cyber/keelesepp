'use strict';
// The viewer's own teacher colours in the calendar (users/{uid}.calendarColors, owner 2026-10-29) against the real
// Firestore rules: a user writes the map on the own account only, with known colours (0–11) and at most 80 teachers.
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
    body: JSON.stringify({ email: `colors-${role}-${Date.now()}-${Math.random().toString(36).slice(2)}@example.com`, password: 'emulator-only-password', returnSecureToken: true }),
  });
  const b = await r.json();
  const uid = JSON.parse(Buffer.from(b.idToken.split('.')[1], 'base64url')).sub;
  await admin.firestore().doc(`users/${uid}`).set({ role, displayName: 'Õpetaja' });
  return { token: b.idToken, uid };
}
const colors = (entries) => ({ mapValue: { fields: Object.fromEntries(Object.entries(entries).map(([k, v]) => [k, typeof v === 'number' ? { integerValue: String(v) } : { stringValue: String(v) }])) } });
async function patch(who, uid, field, value) {
  const r = await fetch(`${base}/users/${uid}?updateMask.fieldPaths=${field}`, {
    method: 'PATCH', headers: { Authorization: `Bearer ${who.token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ fields: { [field]: value } }),
  });
  return r.status;
}

test('own calendar colours: own account, known colours, small map', async () => {
  if (!admin.apps.length) admin.initializeApp({ projectId: PROJECT });
  const teacher = await account('teacher');
  const other = await account('teacher');
  assert.equal(await patch(teacher, teacher.uid, 'calendarColors', colors({ [other.uid]: 4, 'Mari Maasikas': 11 })), 200);
  assert.deepEqual((await admin.firestore().doc(`users/${teacher.uid}`).get()).data().calendarColors, { [other.uid]: 4, 'Mari Maasikas': 11 });
  assert.equal(await patch(teacher, teacher.uid, 'calendarColors', colors({})), 200);
  assert.equal(await patch(teacher, teacher.uid, 'calendarColors', colors({ a: 12 })), 403);
  assert.equal(await patch(teacher, teacher.uid, 'calendarColors', colors({ a: 'punane' })), 403);
  assert.equal(await patch(teacher, teacher.uid, 'calendarColors', { stringValue: 'sinine' }), 403);
  assert.equal(await patch(teacher, teacher.uid, 'calendarColors', colors(Object.fromEntries(Array.from({ length: 81 }, (_, i) => [`t${i}`, 1])))), 403);
  // nobody writes another account's colours, and the administrator's school colour stays the administrator's
  assert.equal(await patch(other, teacher.uid, 'calendarColors', colors({ a: 1 })), 403);
  assert.equal(await patch(teacher, teacher.uid, 'calendarTone', { integerValue: '3' }), 403);
});
