'use strict';
// Self-registration waits for an administrator, checked against the real Firestore rules:
// a new account may only create itself as "pending", can read nothing but its own profile,
// cannot approve itself, and gets its student data only after an administrator approves it.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const admin = require('firebase-admin');

const PROJECT = 'demo-keelesepp-finance';
const authHost = process.env.FIREBASE_AUTH_EMULATOR_HOST;
const dbHost = process.env.FIRESTORE_EMULATOR_HOST;
const base = `http://${dbHost}/v1/projects/${PROJECT}/databases/(default)/documents`;

async function signUp() {
  const r = await fetch(`http://${authHost}/identitytoolkit.googleapis.com/v1/accounts:signUp?key=demo`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: `approval-${Date.now()}-${Math.random().toString(36).slice(2)}@example.com`, password: 'emulator-only-password', returnSecureToken: true }),
  });
  const b = await r.json();
  return { token: b.idToken, uid: JSON.parse(Buffer.from(b.idToken.split('.')[1], 'base64url')).sub, email: b.email };
}
const enc = (v) => (typeof v === 'boolean' ? { booleanValue: v } : { stringValue: String(v) });
const fields = (obj) => ({ fields: Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, enc(v)])) });

async function createProfile(who, profile) {
  const r = await fetch(`${base}/users?documentId=${who.uid}`, {
    method: 'POST', headers: { Authorization: `Bearer ${who.token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(fields(profile)),
  });
  return r.status;
}
async function read(who, path) {
  const r = await fetch(`${base}/${path}`, { headers: { Authorization: `Bearer ${who.token}` } });
  return r.status;
}
async function patch(who, path, data) {
  const mask = Object.keys(data).map((k) => `updateMask.fieldPaths=${k}`).join('&');
  const r = await fetch(`${base}/${path}?${mask}`, {
    method: 'PATCH', headers: { Authorization: `Bearer ${who.token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(fields(data)),
  });
  return r.status;
}

test('self-registered accounts wait for administrator approval', async () => {
  assert.equal(process.env.GCLOUD_PROJECT || process.env.GOOGLE_CLOUD_PROJECT, PROJECT);
  if (!admin.apps.length) admin.initializeApp({ projectId: PROJECT });
  const db = admin.firestore();
  const profile = (who, extra = {}) => ({ role: 'parent', displayName: 'Mari', email: who.email, createdAt: '2026-09-29', ...extra });

  // registration must mark itself as pending
  const sneaky = await signUp();
  assert.equal(await createProfile(sneaky, profile(sneaky)), 403, 'no approvalStatus');
  assert.equal(await createProfile(sneaky, profile(sneaky, { approvalStatus: 'approved' })), 403, 'self-approved');
  assert.equal(await createProfile(sneaky, profile(sneaky, { role: 'teacher', approvalStatus: 'pending' })), 403, 'staff role');

  const parent = await signUp();
  assert.equal(await createProfile(parent, profile(parent, { approvalStatus: 'pending' })), 200);

  // a child card linked to the waiting parent stays closed; the own profile is readable
  const studentId = `approval-child-${parent.uid}`;
  await db.doc(`students/${studentId}`).set({ name: 'Kati', linkedParentId: parent.uid, linkedParentIds: [parent.uid] });
  assert.equal(await read(parent, `users/${parent.uid}`), 200);
  assert.equal(await read(parent, `students/${studentId}`), 403);
  assert.equal(await patch(parent, `users/${parent.uid}`, { approvalStatus: 'approved' }), 403, 'cannot approve itself');
  assert.equal(await patch(parent, `users/${parent.uid}`, { displayName: 'Mari M' }), 403, 'waiting account cannot edit');

  // administrator approves -> access opens
  await db.doc(`users/${parent.uid}`).update({ approvalStatus: 'approved' });
  assert.equal(await read(parent, `students/${studentId}`), 200);

  // rejected accounts are closed again
  await db.doc(`users/${parent.uid}`).update({ approvalStatus: 'rejected' });
  assert.equal(await read(parent, `students/${studentId}`), 403);

  // accounts from before the approval step (no field) keep working
  const old = await signUp();
  await db.doc(`users/${old.uid}`).set({ role: 'parent', displayName: 'Vana', email: old.email });
  const oldChild = `approval-old-child-${old.uid}`;
  await db.doc(`students/${oldChild}`).set({ name: 'Juku', linkedParentId: old.uid, linkedParentIds: [old.uid] });
  assert.equal(await read(old, `students/${oldChild}`), 200);
});
