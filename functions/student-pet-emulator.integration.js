'use strict';
// Student cabinet pet against the real Firestore rules: a user may store only { kind, name, chosenAt } on
// their own account; growth fields, unknown kinds, long names and other users' documents are denied.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const admin = require('firebase-admin');

const PROJECT = 'demo-keelesepp-finance';
const authHost = process.env.FIREBASE_AUTH_EMULATOR_HOST;
const dbHost = process.env.FIRESTORE_EMULATOR_HOST;

async function account(role) {
  const r = await fetch(`http://${authHost}/identitytoolkit.googleapis.com/v1/accounts:signUp?key=demo`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: `pet-${role}-${Date.now()}-${Math.random().toString(36).slice(2)}@example.com`, password: 'emulator-only-password', returnSecureToken: true }),
  });
  const b = await r.json();
  const uid = JSON.parse(Buffer.from(b.idToken.split('.')[1], 'base64url')).sub;
  await admin.firestore().doc(`users/${uid}`).set({ role, displayName: 'Mari' });
  return { token: b.idToken, uid };
}
const enc = (v) => (typeof v === 'object' && v !== null
  ? { mapValue: { fields: Object.fromEntries(Object.entries(v).map(([k, x]) => [k, enc(x)])) } }
  : typeof v === 'boolean' ? { booleanValue: v }
  : typeof v === 'number' ? { integerValue: String(v) } : { stringValue: String(v) });
// update single flags the way the app does (updateDoc with 'pet.hidden' etc.)
async function setFlags(who, uid, flags) {
  const mask = Object.keys(flags).map((k) => `updateMask.fieldPaths=${encodeURIComponent(`pet.${k}`)}`).join('&');
  const r = await fetch(`http://${dbHost}/v1/projects/${PROJECT}/databases/(default)/documents/users/${uid}?${mask}`, {
    method: 'PATCH', headers: { Authorization: `Bearer ${who.token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ fields: { pet: enc(flags) } }),
  });
  return r.status;
}
async function setPet(who, uid, pet) {
  const r = await fetch(`http://${dbHost}/v1/projects/${PROJECT}/databases/(default)/documents/users/${uid}?updateMask.fieldPaths=pet`, {
    method: 'PATCH', headers: { Authorization: `Bearer ${who.token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ fields: { pet: enc(pet) } }),
  });
  return r.status;
}

test('student pet on the account document', async () => {
  assert.equal(process.env.GCLOUD_PROJECT || process.env.GOOGLE_CLOUD_PROJECT, PROJECT);
  if (!admin.apps.length) admin.initializeApp({ projectId: PROJECT });
  const learner = await account('student');
  const other = await account('student');
  assert.equal(await setPet(learner, learner.uid, { kind: 'siil', name: 'Okas', chosenAt: '2026-09-29T10:00:00Z' }), 200);
  assert.equal((await admin.firestore().doc(`users/${learner.uid}`).get()).data().pet.name, 'Okas');
  assert.equal(await setPet(learner, learner.uid, { kind: 'rebane', name: 'Rebu' }), 200);
  assert.equal(await setPet(learner, learner.uid, { kind: 'dinosaurus', name: 'Rex' }), 403);
  assert.equal(await setPet(learner, learner.uid, { kind: 'kakk', name: 'x'.repeat(25) }), 403);
  assert.equal(await setPet(learner, learner.uid, { kind: 'kakk', name: 'Tark', xp: 9999 }), 403);
  assert.equal(await setPet(other, learner.uid, { kind: 'kakk', name: 'Tark' }), 403);
  // own flags: tour done, hidden, opted out (also without a chosen pet)
  assert.equal(await setFlags(learner, learner.uid, { tourDoneAt: '2026-09-29T10:05:00Z', hidden: true }), 200);
  const stored = (await admin.firestore().doc(`users/${learner.uid}`).get()).data().pet;
  assert.equal(stored.kind, 'rebane');
  assert.equal(stored.hidden, true);
  assert.equal(await setFlags(learner, learner.uid, { hidden: 'yes' }), 403);
  assert.equal(await setFlags(other, other.uid, { optedOut: true }), 200);
  assert.equal(await setFlags(other, other.uid, { kind: 'siil' }), 403); // a kind always needs a name
  assert.equal(await setFlags(learner, other.uid, { optedOut: false }), 403);
});
