'use strict';
// „Seadme kontroll” (users/{uid}.deviceCheck, owner 2026-11-04) against the real Firestore rules: a student writes the
// small result on the own account only ({ at, status, issues ≤ 12 known codes, browser ≤ 40 }); others cannot write it,
// it opens no other field, wrong shapes are denied, and the teacher can read it.
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
    body: JSON.stringify({ email: `device-${role}-${Date.now()}-${Math.random().toString(36).slice(2)}@example.com`, password: 'emulator-only-password', returnSecureToken: true }),
  });
  const b = await r.json();
  const uid = JSON.parse(Buffer.from(b.idToken.split('.')[1], 'base64url')).sub;
  await admin.firestore().doc(`users/${uid}`).set({ role, displayName: 'Mari' });
  return { token: b.idToken, uid };
}
const enc = (v) => (Array.isArray(v) ? { arrayValue: { values: v.map(enc) } }
  : typeof v === 'object' && v !== null
    ? { mapValue: { fields: Object.fromEntries(Object.entries(v).map(([k, x]) => [k, enc(x)])) } }
    : typeof v === 'boolean' ? { booleanValue: v }
      : typeof v === 'number' ? { integerValue: String(v) } : { stringValue: String(v) });
async function patch(who, uid, fields) {
  const mask = Object.keys(fields).map((k) => `updateMask.fieldPaths=${encodeURIComponent(k)}`).join('&');
  const r = await fetch(`${base}/users/${uid}?${mask}`, {
    method: 'PATCH', headers: { Authorization: `Bearer ${who.token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ fields: Object.fromEntries(Object.entries(fields).map(([k, v]) => [k, enc(v)])) }),
  });
  return r.status;
}
async function read(who, uid) {
  const r = await fetch(`${base}/users/${uid}`, { headers: { Authorization: `Bearer ${who.token}` } });
  return r.status;
}

const good = { at: '2026-11-04T10:15:30.123Z', status: 'warn', issues: ['mic-silent', 'slow'], browser: 'Safari 17 iPad' };

test('device check: own account, small known shape, readable by staff', async () => {
  if (!admin.apps.length) admin.initializeApp({ projectId: PROJECT });
  const student = await account('student');
  const other = await account('student');
  const teacher = await account('teacher');

  assert.equal(await patch(student, student.uid, { deviceCheck: good }), 200);
  assert.deepEqual((await admin.firestore().doc(`users/${student.uid}`).get()).data().deviceCheck, good);
  assert.equal(await patch(student, student.uid, { deviceCheck: { ...good, status: 'ok', issues: [], at: '2026-11-04T10:16:00Z' } }), 200);
  assert.equal(await patch(student, student.uid, { deviceCheck: { ...good, status: 'fail', issues: ['mic-denied', 'camera-denied', 'in-app'] } }), 200);

  // nobody writes another account's result — not another student, not a teacher through the self rule
  assert.equal(await patch(other, student.uid, { deviceCheck: good }), 403);
  assert.equal(await patch(teacher, student.uid, { deviceCheck: good }), 403);

  // the field opens nothing else: role, approval and unknown fields stay closed
  assert.equal(await patch(student, student.uid, { deviceCheck: good, role: 'admin' }), 403);
  assert.equal(await patch(student, student.uid, { deviceCheck: good, approvalStatus: 'approved' }), 403);
  assert.equal(await patch(student, student.uid, { deviceCheck: good, notes: 'x' }), 403);

  // wrong shapes
  const bad = [
    { ...good, status: 'green' },
    { ...good, issues: ['not-a-code'] },
    { ...good, issues: Array.from({ length: 13 }, () => 'slow') },
    { ...good, issues: 'slow' },
    { ...good, browser: 'x'.repeat(41) },
    { ...good, at: 'eile' },
    { ...good, at: 1730715330 },
    { ...good, deviceId: 'abc123' },
    { at: good.at, status: 'ok', issues: [] },
    'ok',
  ];
  for (const value of bad) assert.equal(await patch(student, student.uid, { deviceCheck: value }), 403, JSON.stringify(value));

  // staff read the student's account (the teacher's warning); another student does not
  assert.equal(await read(teacher, student.uid), 200);
  assert.equal(await read(other, student.uid), 403);
});
