'use strict';
// „Arve väljastaja” (owner 2026-11-09) against the real Firestore rules: an FIE invoice (issuer: 'fie') is read only by
// the owner (super admin e-mail) and the family it belongs to — another administrator and the bookkeeper get 403 even
// for a single get; their list query must be constrained to issuer == 'company'. The FIE requisites, the cards' default
// issuer, FIE payments / audit / e-mail log are the owner's only and never written from the browser. Company invoices
// (with or without the field) stay readable by the administrator and the bookkeeper as before.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const admin = require('firebase-admin');

const PROJECT = 'demo-keelesepp-finance';
const OWNER_EMAIL = 'zakutailo.pavel@gmail.com';
const authHost = process.env.FIREBASE_AUTH_EMULATOR_HOST;
const dbHost = process.env.FIRESTORE_EMULATOR_HOST;

function safe() {
  assert.equal(process.env.GCLOUD_PROJECT || process.env.GOOGLE_CLOUD_PROJECT, PROJECT);
  for (const h of [authHost, dbHost]) assert.match(h || '', /^(127\.0\.0\.1|localhost):\d+$/);
}

async function signIn(email, role) {
  const body = JSON.stringify({ email, password: 'emulator-only-password', returnSecureToken: true });
  const opts = { method: 'POST', headers: { 'Content-Type': 'application/json' }, body };
  let r = await fetch(`http://${authHost}/identitytoolkit.googleapis.com/v1/accounts:signUp?key=demo`, opts);
  let b = await r.json();
  if (!b.idToken) {
    r = await fetch(`http://${authHost}/identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=demo`, opts);
    b = await r.json();
  }
  assert.ok(b.idToken, JSON.stringify(b));
  const uid = JSON.parse(Buffer.from(b.idToken.split('.')[1], 'base64url')).sub;
  if (role) await admin.firestore().doc(`users/${uid}`).set({ role });
  return { token: b.idToken, uid };
}
const account = (role) => signIn(`fie-${role}-${Date.now()}-${Math.random().toString(36).slice(2)}@example.com`, role);

const base = () => `http://${dbHost}/v1/projects/${PROJECT}/databases/(default)/documents`;
const auth = (who) => ({ Authorization: `Bearer ${who.token}`, 'Content-Type': 'application/json' });
const get = (who, path) => fetch(`${base()}/${path}`, { headers: auth(who) }).then((r) => r.status);
// a structured query on invoices, optionally constrained to one field value
function list(who, filter = null) {
  const structuredQuery = { from: [{ collectionId: 'invoices' }], limit: 200 };
  if (filter) structuredQuery.where = { fieldFilter: { field: { fieldPath: filter[0] }, op: 'EQUAL', value: { stringValue: filter[1] } } };
  return fetch(`${base()}:runQuery`, { method: 'POST', headers: auth(who), body: JSON.stringify({ structuredQuery }) })
    .then(async (r) => ({ status: r.status, ids: r.ok ? (await r.json()).filter((row) => row.document).map((row) => row.document.name.split('/').pop()) : [] }));
}
function patch(who, path, data) {
  const fields = Object.fromEntries(Object.entries(data).map(([k, v]) => [k, { stringValue: String(v) }]));
  const mask = Object.keys(data).map((k) => `updateMask.fieldPaths=${encodeURIComponent(k)}`).join('&');
  return fetch(`${base()}/${path}?${mask}`, { method: 'PATCH', headers: auth(who), body: JSON.stringify({ fields }) }).then((r) => r.status);
}

test('FIE invoices: owner and family only; company invoices unchanged for staff', async (t) => {
  safe();
  if (!admin.apps.length) admin.initializeApp({ projectId: PROJECT });
  const store = admin.firestore();
  const owner = await signIn(OWNER_EMAIL, null);
  // other emulator files create the owner's account themselves (signUp): leave none behind
  t.after(() => admin.auth().deleteUser(owner.uid).catch(() => {}));
  const otherAdmin = await account('admin');
  const books = await account('finance');
  const teacher = await account('teacher');
  const parent = await account('parent');
  const stranger = await account('parent');
  const stamp = Date.now();
  const studentId = `stu-fie-${stamp}`;
  await store.doc(`students/${studentId}`).set({ name: 'Mari', linkedParentIds: [parent.uid] });
  const fieId = `inv-fie-${stamp}`;
  const legacyId = `inv-legacy-${stamp}`;
  const companyId = `inv-company-${stamp}`;
  const invoice = { status: 'Ootel', date: '2026-11-09', amountCents: 24000, paidAmountCents: 0, studentId };
  await store.doc(`invoices/${fieId}`).set({ ...invoice, num: 'FIE-2026-001', issuer: 'fie', issuerDetails: { name: 'Pavel Zakutailo', iban: 'EE382200221020145685' } });
  await store.doc(`invoices/${legacyId}`).set({ ...invoice, num: 'KS-2026-990' });
  await store.doc(`invoices/${companyId}`).set({ ...invoice, num: 'KS-2026-991', issuer: 'company' });
  await store.doc('invoiceIssuers/fie').set({ name: 'Pavel Zakutailo', iban: 'EE382200221020145685', ownerUid: owner.uid });
  await store.doc(`studentInvoiceIssuers/${studentId}`).set({ issuer: 'fie' });
  await store.doc(`fiePayments/pay-${stamp}`).set({ invoiceId: fieId, amountCents: 24000, issuer: 'fie' });
  await store.doc(`fieAudit/audit-${stamp}`).set({ invoiceId: fieId, action: 'invoice.created_manual' });
  await store.doc(`fieEmailQueue/mail-${stamp}`).set({ invoiceId: fieId, subject: 'arve FIE-2026-001' });

  // single reads of the FIE invoice
  assert.equal(await get(owner, `invoices/${fieId}`), 200, 'the owner reads the FIE invoice');
  assert.equal(await get(parent, `invoices/${fieId}`), 200, 'the family reads its own FIE invoice');
  assert.equal(await get(otherAdmin, `invoices/${fieId}`), 403, 'another administrator cannot read an FIE invoice');
  assert.equal(await get(books, `invoices/${fieId}`), 403, 'the bookkeeper cannot read an FIE invoice');
  assert.equal(await get(teacher, `invoices/${fieId}`), 403, 'a teacher cannot read it');
  assert.equal(await get(stranger, `invoices/${fieId}`), 403, 'another family cannot read it');
  // company invoices: as before
  for (const who of [otherAdmin, books, owner]) {
    assert.equal(await get(who, `invoices/${legacyId}`), 200, 'an invoice without issuer is the company\'s');
    assert.equal(await get(who, `invoices/${companyId}`), 200, 'a company invoice');
  }

  // lists: the owner reads all; staff must constrain to company; the unconstrained query is refused for them
  const ownerAll = await list(owner);
  assert.equal(ownerAll.status, 200);
  assert.ok(ownerAll.ids.includes(fieId) && ownerAll.ids.includes(companyId), 'the owner lists FIE and company invoices');
  for (const who of [otherAdmin, books]) {
    assert.equal((await list(who)).status, 403, 'an unconstrained list would include FIE invoices: refused');
    const company = await list(who, ['issuer', 'company']);
    assert.equal(company.status, 200, 'the company-only list is allowed');
    assert.ok(company.ids.includes(companyId) && !company.ids.includes(fieId), 'only company invoices');
    assert.equal((await list(who, ['issuer', 'fie'])).status, 403, 'asking for FIE invoices is refused');
  }
  const family = await list(parent, ['studentId', studentId]);
  assert.equal(family.status, 200);
  assert.ok(family.ids.includes(fieId), 'the family lists its FIE invoice with its own card');

  // the issuer cannot be changed from the browser, and another administrator cannot touch an FIE invoice
  assert.equal(await patch(owner, `invoices/${companyId}`, { issuer: 'fie' }), 403, 'issuer is set only by the functions');
  assert.equal(await patch(otherAdmin, `invoices/${fieId}`, { desc: 'x' }), 403, 'another administrator cannot edit an FIE invoice');
  assert.equal(await patch(otherAdmin, `invoices/${companyId}`, { desc: 'Keeletunnid' }), 200, 'company invoice edit unchanged');

  // owner-only collections
  for (const path of ['invoiceIssuers/fie', `studentInvoiceIssuers/${studentId}`, `fiePayments/pay-${stamp}`, `fieAudit/audit-${stamp}`, `fieEmailQueue/mail-${stamp}`]) {
    assert.equal(await get(owner, path), 200, `the owner reads ${path}`);
    for (const who of [otherAdmin, books, teacher, parent]) assert.equal(await get(who, path), 403, `${path} is the owner's only`);
    assert.equal(await patch(owner, path, { x: '1' }), 403, `${path} is written only by the functions`);
  }

  // no internal note on an FIE invoice (invoiceNotes is read by every administrator and the bookkeeper)
  const note = (id) => ({ invoiceId: id, text: 'märkus', updatedAt: '2026-11-09T10:00:00Z', updatedByUid: otherAdmin.uid, updatedByName: 'Admin' });
  assert.equal(await patch(otherAdmin, `invoiceNotes/${fieId}`, note(fieId)), 403, 'no note on an FIE invoice');
  assert.equal(await patch(otherAdmin, `invoiceNotes/${companyId}`, note(companyId)), 200, 'notes on company invoices as before');
});
