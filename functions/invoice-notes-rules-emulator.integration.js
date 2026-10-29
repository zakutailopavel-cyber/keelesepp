'use strict';
// „Sisemine märkus” of an invoice (invoiceNotes/{invoiceId}) against the real Firestore rules: the administrator and
// the bookkeeper read and write it (fixed keys, own uid, ≤ 1000 characters, only for an existing invoice, also on a
// paid invoice); the teacher, the student and the parent who owns the invoice never read it; nobody deletes it.
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
    body: JSON.stringify({ email: `in-${role}-${Date.now()}-${Math.random().toString(36).slice(2)}@example.com`, password: 'emulator-only-password', returnSecureToken: true }),
  });
  const b = await r.json();
  assert.ok(b.idToken);
  const uid = JSON.parse(Buffer.from(b.idToken.split('.')[1], 'base64url')).sub;
  await admin.firestore().doc(`users/${uid}`).set({ role });
  return { token: b.idToken, uid };
}

function enc(v) {
  if (v === null) return { nullValue: null };
  if (typeof v === 'number') return Number.isInteger(v) ? { integerValue: String(v) } : { doubleValue: v };
  return { stringValue: String(v) };
}
const base = () => `http://${dbHost}/v1/projects/${PROJECT}/databases/(default)/documents`;
const body = (data) => JSON.stringify({ fields: Object.fromEntries(Object.entries(data).map(([k, v]) => [k, enc(v)])) });
const put = (who, id, data) => fetch(`${base()}/invoiceNotes/${id}`, { method: 'PATCH', headers: { Authorization: `Bearer ${who.token}`, 'Content-Type': 'application/json' }, body: body(data) }).then((r) => r.status);
const get = (who, path) => fetch(`${base()}/${path}`, { headers: { Authorization: `Bearer ${who.token}` } }).then((r) => r.status);
const del = (who, id) => fetch(`${base()}/invoiceNotes/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${who.token}` } }).then((r) => r.status);

const note = (id, uid, extra = {}) => ({ invoiceId: id, text: 'Oktoobri 8 tundi + õpik', updatedAt: '2026-10-29T10:00:00.000Z', updatedByUid: uid, updatedByName: 'Admin', ...extra });

test('invoice notes: staff only, never the student or the parent who owns the invoice', async () => {
  safe();
  if (!admin.apps.length) admin.initializeApp({ projectId: PROJECT });
  const boss = await account('admin');
  const books = await account('finance');
  const teacher = await account('teacher');
  const parent = await account('parent');
  const id = `inv-note-${Date.now()}`;
  // a paid invoice the parent owns (ownsInvoice: parentUid)
  await admin.firestore().doc(`invoices/${id}`).set({ num: 'KS-2026-900', status: 'Makstud', date: '2026-10-01', parentUid: parent.uid, amountCents: 10000, paidAmountCents: 10000 });

  assert.equal(await get(parent, `invoices/${id}`), 200, 'the parent reads own invoice');
  assert.equal(await put(teacher, id, note(id, teacher.uid)), 403, 'teacher cannot write');
  assert.equal(await put(parent, id, note(id, parent.uid)), 403, 'the invoice owner cannot write');
  assert.equal(await put(boss, 'no-such-invoice', note('no-such-invoice', boss.uid)), 403, 'only for an existing invoice');
  assert.equal(await put(boss, id, note('other', boss.uid)), 403, 'invoiceId is the document id');
  assert.equal(await put(boss, id, note(id, books.uid)), 403, 'updatedByUid is the writer');
  assert.equal(await put(boss, id, note(id, boss.uid, { amountCents: 1 })), 403, 'fixed keys');
  assert.equal(await put(boss, id, note(id, boss.uid, { text: 'x'.repeat(1001) })), 403, 'at most 1000 characters');
  assert.equal(await put(boss, id, note(id, boss.uid)), 200, 'admin writes on a paid invoice');
  assert.equal(await put(books, id, note(id, books.uid, { text: '', updatedByName: 'Raamatupidaja' })), 200, 'bookkeeper edits (and may clear it)');
  assert.equal(await get(boss, `invoiceNotes/${id}`), 200, 'admin reads');
  assert.equal(await get(books, `invoiceNotes/${id}`), 200, 'bookkeeper reads');
  assert.equal(await get(teacher, `invoiceNotes/${id}`), 403, 'teacher does not read');
  assert.equal(await get(parent, `invoiceNotes/${id}`), 403, 'the parent who owns the invoice does not read the note');
  assert.equal(await del(boss, id), 403, 'never deleted');
  const invoice = (await admin.firestore().doc(`invoices/${id}`).get()).data();
  assert.ok(!('internalNote' in invoice) && !('text' in invoice), 'the invoice itself is untouched');
});
