'use strict';
// Oleksiy 2026-11-06 („Невозможно добавить родителю архивированного ученика”): an administrator links a parent account
// to an ARCHIVED card through /accounts/link and /accounts/invite-parent (staffOperationsApi); the card stays archived.
// A card in the „Prügikast” (#1124) or a merged-away card is refused, and a student's own login still needs an active
// card. Runs on the auth + firestore + functions emulators (demo project).
const { test } = require('node:test');
const assert = require('node:assert/strict');
const admin = require('firebase-admin');

const PROJECT = 'demo-keelesepp-finance';
const authHost = process.env.FIREBASE_AUTH_EMULATOR_HOST;
const functionsHost = process.env.FUNCTIONS_EMULATOR_HOST || '127.0.0.1:5001';
const stamp = () => `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

async function signUp(prefix) {
  const r = await fetch(`http://${authHost}/identitytoolkit.googleapis.com/v1/accounts:signUp?key=demo`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: `${prefix}-${stamp()}@example.com`, password: 'emulator-only-password', returnSecureToken: true }),
  });
  const b = await r.json();
  return { token: b.idToken, uid: JSON.parse(Buffer.from(b.idToken.split('.')[1], 'base64url')).sub, email: b.email };
}
async function api(who, path, body = {}) {
  const r = await fetch(`http://${functionsHost}/${PROJECT}/us-central1/staffOperationsApi${path}`, {
    method: 'POST', headers: { Authorization: `Bearer ${who.token}`, 'Content-Type': 'application/json' }, body: JSON.stringify(body),
  });
  return { status: r.status, body: await r.json().catch(() => ({})) };
}
function db() {
  assert.match(authHost || '', /^(127\.0\.0\.1|localhost):\d+$/);
  if (!admin.apps.length) admin.initializeApp({ projectId: PROJECT });
  return admin.firestore();
}

test('/accounts/link: a parent is linked to an archived card, the card stays archived; trash and merged are refused', async () => {
  const store = db();
  const owner = await signUp('arch-admin');
  await store.doc(`users/${owner.uid}`).set({ role: 'admin', roles: ['admin'] });
  const parent = await signUp('arch-parent');
  await store.doc(`users/${parent.uid}`).set({ role: 'parent', roles: ['parent'], displayName: 'Olga Test', email: parent.email });
  const id = stamp();
  await store.doc(`students/arch-${id}`).set({ name: 'Liisa Arhiiv', active: false, archivedAt: '2026-09-01T10:00:00Z' });
  await store.doc(`students/trash-${id}`).set({ name: 'Mari Prügi', active: false, deletedAt: '2026-11-05T10:00:00Z', purgeAfter: '2026-11-12T10:00:00Z' });
  await store.doc(`students/merged-${id}`).set({ name: 'Vana Kaart', active: false, mergedInto: `arch-${id}`, mergedIntoStudentId: `arch-${id}` });

  const linked = await api(owner, '/accounts/link', { uid: parent.uid, studentId: `arch-${id}`, relationship: 'parent', requestId: `arch-link-${id}` });
  assert.equal(linked.status, 201, JSON.stringify(linked.body));
  const card = (await store.doc(`students/arch-${id}`).get()).data();
  assert.equal(card.active, false, 'the card stays archived');
  assert.deepEqual(card.linkedParentIds, [parent.uid]);
  assert.equal(card.linkedParentId, parent.uid);
  assert.ok((await store.doc(`users/${parent.uid}`).get()).data().linkedStudentIds.includes(`arch-${id}`));

  const trashed = await api(owner, '/accounts/link', { uid: parent.uid, studentId: `trash-${id}`, relationship: 'parent', requestId: `trash-link-${id}` });
  assert.equal(trashed.status, 409, JSON.stringify(trashed.body));
  assert.match(trashed.body.error || JSON.stringify(trashed.body), /prügikastis/);
  assert.equal((await store.doc(`students/trash-${id}`).get()).data().linkedParentIds, undefined, 'nothing written on the trashed card');

  const merged = await api(owner, '/accounts/link', { uid: parent.uid, studentId: `merged-${id}`, relationship: 'parent', requestId: `merged-link-${id}` });
  assert.equal(merged.status, 409, JSON.stringify(merged.body));

  // a student's own login: the old rule (active card only)
  const kid = await signUp('arch-kid');
  const asStudent = await api(owner, '/accounts/link', { uid: kid.uid, studentId: `arch-${id}`, relationship: 'student', requestId: `arch-kid-${id}` });
  assert.equal(asStudent.status, 404, JSON.stringify(asStudent.body));
});

test('/accounts/invite-parent: an existing parent login is linked to an archived card; a trashed card refuses the whole invite', async () => {
  const store = db();
  const owner = await signUp('inv-admin');
  await store.doc(`users/${owner.uid}`).set({ role: 'admin', roles: ['admin'] });
  const parent = await signUp('inv-parent');
  await store.doc(`users/${parent.uid}`).set({ role: 'parent', roles: ['parent'], displayName: 'Igor Test', email: parent.email });
  const id = stamp();
  await store.doc(`students/inv-arch-${id}`).set({ name: 'Anna Arhiiv', active: false });
  await store.doc(`students/inv-trash-${id}`).set({ name: 'Peeter Prügi', active: false, deletedAt: '2026-11-05T10:00:00Z' });

  const refused = await api(owner, '/accounts/invite-parent', { email: parent.email, displayName: 'Igor Test', studentIds: [`inv-arch-${id}`, `inv-trash-${id}`], requestId: `inv-refused-${id}` });
  assert.equal(refused.status, 409, JSON.stringify(refused.body));
  assert.equal((await store.doc(`students/inv-arch-${id}`).get()).data().linkedParentIds, undefined, 'a refused invite links nothing');

  const invited = await api(owner, '/accounts/invite-parent', { email: parent.email, displayName: 'Igor Test', studentIds: [`inv-arch-${id}`], requestId: `inv-ok-${id}` });
  assert.ok([200, 201].includes(invited.status), JSON.stringify(invited.body));
  assert.equal(invited.body.created, false);
  assert.deepEqual(invited.body.linkedStudentIds, [`inv-arch-${id}`]);
  const card = (await store.doc(`students/inv-arch-${id}`).get()).data();
  assert.equal(card.active, false, 'the card stays archived');
  assert.ok(card.linkedParentIds.includes(parent.uid));
  assert.equal(card.parentEmail, parent.email);
});
