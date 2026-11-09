'use strict';
// „Maksin ära” (invoicePaymentClaims/{invoiceId}, owner 2026-11-09) against the real Firestore rules: the parent who
// owns the invoice (own parentUid or linked on the student card) writes it once with the own uid and the server time,
// never edits or deletes it; another family, a teacher and a cancelled invoice are refused; the administrator and the
// bookkeeper read every claim but cannot write one; the invoice itself is untouched.
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
    body: JSON.stringify({ email: `pc-${role}-${Date.now()}-${Math.random().toString(36).slice(2)}@example.com`, password: 'emulator-only-password', returnSecureToken: true }),
  });
  const b = await r.json();
  assert.ok(b.idToken);
  const uid = JSON.parse(Buffer.from(b.idToken.split('.')[1], 'base64url')).sub;
  await admin.firestore().doc(`users/${uid}`).set({ role });
  return { token: b.idToken, uid };
}

const base = () => `http://${dbHost}/v1/projects/${PROJECT}/databases/(default)/documents`;
const fields = (data) => Object.fromEntries(Object.entries(data).map(([k, v]) => [k, { stringValue: String(v) }]));
const headers = (who) => ({ Authorization: `Bearer ${who.token}`, 'Content-Type': 'application/json' });
// one commit: the claim's fields plus claimedAt = the server's time (as serverTimestamp() in the browser)
function write(who, id, data, { serverTime = true, exists } = {}) {
  const name = `projects/${PROJECT}/databases/(default)/documents/invoicePaymentClaims/${id}`;
  const writeOp = { update: { name, fields: fields(data) } };
  if (serverTime) writeOp.updateTransforms = [{ fieldPath: 'claimedAt', setToServerValue: 'REQUEST_TIME' }];
  if (exists !== undefined) writeOp.currentDocument = { exists };
  return fetch(`${base()}:commit`, { method: 'POST', headers: headers(who), body: JSON.stringify({ writes: [writeOp] }) }).then((r) => r.status);
}
const get = (who, path) => fetch(`${base()}/${path}`, { headers: { Authorization: `Bearer ${who.token}` } }).then((r) => r.status);
const del = (who, id) => fetch(`${base()}/invoicePaymentClaims/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${who.token}` } }).then((r) => r.status);

test('payment claims: the invoice owner writes once, staff read, nobody edits or deletes', async () => {
  safe();
  if (!admin.apps.length) admin.initializeApp({ projectId: PROJECT });
  const store = admin.firestore();
  const boss = await account('admin');
  const books = await account('finance');
  const teacher = await account('teacher');
  const parent = await account('parent');
  const cardParent = await account('parent');
  const stranger = await account('parent');
  const stamp = Date.now();
  const id = `inv-claim-${stamp}`;
  const viaCard = `inv-claim-card-${stamp}`;
  const cancelled = `inv-claim-x-${stamp}`;
  const studentId = `stu-claim-${stamp}`;
  await store.doc(`students/${studentId}`).set({ name: 'Mari', linkedParentIds: [cardParent.uid] });
  const invoice = { num: 'KS-2026-950', status: 'Ootel', date: '2026-11-01', amountCents: 24000, paidAmountCents: 0 };
  await store.doc(`invoices/${id}`).set({ ...invoice, parentUid: parent.uid });
  await store.doc(`invoices/${viaCard}`).set({ ...invoice, num: 'KS-2026-951', studentId });
  await store.doc(`invoices/${cancelled}`).set({ ...invoice, num: 'KS-2026-952', status: 'Tühistatud', parentUid: parent.uid });
  const claim = (invoiceId, uid, extra = {}) => ({ invoiceId, claimedByUid: uid, claimedByName: 'Mari Ema', note: 'Maksin 08.11 LHV kaudu', ...extra });

  assert.equal(await write(stranger, id, claim(id, stranger.uid)), 403, 'another family cannot claim');
  assert.equal(await write(teacher, id, claim(id, teacher.uid)), 403, 'a teacher cannot claim');
  assert.equal(await write(boss, id, claim(id, boss.uid)), 403, 'the administrator does not write claims');
  assert.equal(await write(parent, id, claim(id, stranger.uid)), 403, 'claimedByUid is the writer');
  assert.equal(await write(parent, id, claim('other', parent.uid)), 403, 'invoiceId is the document id');
  assert.equal(await write(parent, id, claim(id, parent.uid), { serverTime: false }), 403, 'claimedAt is required');
  assert.equal(await write(parent, id, claim(id, parent.uid, { status: 'Makstud' })), 403, 'fixed keys only');
  assert.equal(await write(parent, id, claim(id, parent.uid, { note: 'x'.repeat(301) })), 403, 'note at most 300 characters');
  assert.equal(await write(parent, cancelled, claim(cancelled, parent.uid)), 403, 'not on a cancelled invoice');
  assert.equal(await write(parent, 'no-such-invoice', claim('no-such-invoice', parent.uid)), 403, 'only for an existing invoice');
  assert.equal(await write(parent, id, claim(id, parent.uid)), 200, 'the invoice owner claims');
  assert.equal(await write(parent, id, claim(id, parent.uid, { note: 'muudetud' })), 403, 'never edited afterwards');
  assert.equal(await write(cardParent, viaCard, claim(viaCard, cardParent.uid, { note: '' })), 200, 'a parent linked on the student card claims');

  assert.equal(await get(parent, `invoicePaymentClaims/${id}`), 200, 'the owner reads the own claim');
  assert.equal(await get(stranger, `invoicePaymentClaims/${id}`), 403, 'another family does not read it');
  assert.equal(await get(teacher, `invoicePaymentClaims/${id}`), 403, 'a teacher does not read it');
  assert.equal(await get(boss, `invoicePaymentClaims/${id}`), 200, 'admin reads');
  assert.equal(await get(books, `invoicePaymentClaims/${viaCard}`), 200, 'bookkeeper reads');
  assert.equal(await get(cardParent, `invoicePaymentClaims/${id}`), 403, 'the card parent of another invoice does not read it');
  assert.equal(await del(parent, id), 403, 'the owner cannot delete');
  assert.equal(await del(boss, id), 403, 'nobody deletes in the browser');

  const saved = (await store.doc(`invoicePaymentClaims/${id}`).get()).data();
  assert.equal(saved.claimedByUid, parent.uid);
  assert.ok(saved.claimedAt && typeof saved.claimedAt.toDate === 'function', 'claimedAt is the server time');
  const after = (await store.doc(`invoices/${id}`).get()).data();
  assert.equal(after.status, 'Ootel', 'the invoice stays unpaid');
  assert.equal(after.paidAmountCents, 0);
});
