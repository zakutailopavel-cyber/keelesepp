'use strict';
// „Viimati sees” and the „Minu vead” result on the account document against the real Firestore rules: the visit
// time can only be the server's time, the practice map is small and checked, and nobody writes another account.
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
    body: JSON.stringify({ email: `seen-${role}-${Date.now()}-${Math.random().toString(36).slice(2)}@example.com`, password: 'emulator-only-password', returnSecureToken: true }),
  });
  const b = await r.json();
  const uid = JSON.parse(Buffer.from(b.idToken.split('.')[1], 'base64url')).sub;
  await admin.firestore().doc(`users/${uid}`).set({ role, displayName: 'Mari' });
  return { token: b.idToken, uid };
}
const enc = (v) => (Array.isArray(v) ? { arrayValue: { values: v.map(enc) } }
  : typeof v === 'object' && v !== null
  ? { mapValue: { fields: Object.fromEntries(Object.entries(v).map(([k, x]) => [k, enc(x)])) } }
  : typeof v === 'number' ? { integerValue: String(v) } : { stringValue: String(v) });
// lastSeenAt as the app writes it: serverTimestamp()
async function touch(who, uid) {
  const r = await fetch(`${base}:commit`, {
    method: 'POST', headers: { Authorization: `Bearer ${who.token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ writes: [{ transform: { document: `projects/${PROJECT}/databases/(default)/documents/users/${uid}`, fieldTransforms: [{ fieldPath: 'lastSeenAt', setToServerValue: 'REQUEST_TIME' }] } }] }),
  });
  return r.status;
}
async function patch(who, uid, field, value) {
  const r = await fetch(`${base}/users/${uid}?updateMask.fieldPaths=${field}`, {
    method: 'PATCH', headers: { Authorization: `Bearer ${who.token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ fields: { [field]: value } }),
  });
  return r.status;
}

test('last visit and the practice result on the own account only', async () => {
  if (!admin.apps.length) admin.initializeApp({ projectId: PROJECT });
  const learner = await account('student');
  const other = await account('student');
  assert.equal(await touch(learner, learner.uid), 200);
  assert.ok((await admin.firestore().doc(`users/${learner.uid}`).get()).data().lastSeenAt.toMillis() > Date.now() - 60000);
  assert.equal(await touch(other, learner.uid), 403);
  // a made-up time is refused
  assert.equal(await patch(learner, learner.uid, 'lastSeenAt', { timestampValue: '2030-01-01T00:00:00Z' }), 403);
  assert.equal(await patch(learner, learner.uid, 'practice', enc({ errorsDate: '2026-10-23', errorsPct: 80, days: ['2026-10-22', '2026-10-23'] })), 200);
  assert.equal((await admin.firestore().doc(`users/${learner.uid}`).get()).data().practice.errorsPct, 80);
  assert.equal(await patch(learner, learner.uid, 'practice', enc({ errorsDate: '2026-10-23', errorsPct: 101 })), 403);
  assert.equal(await patch(learner, learner.uid, 'practice', enc({ errorsDate: 'eile', errorsPct: 50 })), 403);
  assert.equal(await patch(learner, learner.uid, 'practice', enc({ errorsDate: '2026-10-23', stars: 5 })), 403);
  assert.equal(await patch(learner, learner.uid, 'practice', enc({ days: Array.from({ length: 61 }, () => '2026-10-23') })), 403);
  assert.equal(await patch(other, learner.uid, 'practice', enc({ errorsDate: '2026-10-23', errorsPct: 10 })), 403);
});

test('staff read many accounts at once (the students list), a student cannot', async () => {
  if (!admin.apps.length) admin.initializeApp({ projectId: PROJECT });
  const teacher = await account('teacher');
  const a = await account('student');
  const b = await account('student');
  const list = (who) => fetch(`${base}:runQuery`, {
    method: 'POST', headers: { Authorization: `Bearer ${who.token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ structuredQuery: { from: [{ collectionId: 'users' }], where: { fieldFilter: { field: { fieldPath: '__name__' }, op: 'IN', value: { arrayValue: { values: [a, b].map((x) => ({ referenceValue: `projects/${PROJECT}/databases/(default)/documents/users/${x.uid}` })) } } } } } }),
  }).then((r) => r.status);
  assert.equal(await list(teacher), 200);
  assert.equal(await list(a), 403);
});
