'use strict';
// TSD data (tsdPayees, tsdMonths, tsdSettings) against the real Firestore rules: personal ID codes and pay, so only
// admin and finance read or write; a teacher or a student gets nothing; keys and limits hold; nobody deletes.
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
    body: JSON.stringify({ email: `tsd-${role}-${Date.now()}-${Math.random().toString(36).slice(2)}@example.com`, password: 'emulator-only-password', returnSecureToken: true }),
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
const url = (path) => `http://${dbHost}/v1/projects/${PROJECT}/databases/(default)/documents/${path}`;
const auth = (who) => ({ Authorization: `Bearer ${who.token}` });
const put = (who, path, data) => fetch(url(path), { method: 'PATCH', headers: { ...auth(who), 'Content-Type': 'application/json' }, body: JSON.stringify({ fields: Object.fromEntries(Object.entries(data).map(([k, v]) => [k, enc(v)])) }) }).then((r) => r.status);
const get = (who, path) => fetch(url(path), { headers: auth(who) }).then((r) => r.status);
const del = (who, path) => fetch(url(path), { method: 'DELETE', headers: auth(who) }).then((r) => r.status);

const payee = (uid, extra = {}) => ({ name: 'Mari Maasikas', idCode: '48203109990', code: '10', exemptionApplied: true, exemptionCents: 70000, pensionAge: false, pensionRate: 2, minimumExempt: false, staffUid: '', active: true, note: '', history: [], updatedAt: '2026-10-30T10:00:00Z', updatedByUid: uid, ...extra });
const monthDoc = (uid, extra = {}) => ({ sourceMonth: '2026-09', lines: [{ id: 'l', payeeId: 'p', code: '10', grossCents: 100000, minimumIncreaseCents: null }], history: [], updatedAt: '2026-10-30T10:00:00Z', updatedByUid: uid, ...extra });
const ratesDoc = (uid, extra = {}) => ({ incomeTaxBps: 2200, socialTaxBps: 3300, socialMinBaseCents: 88600, unemploymentEmployeeBps: 160, unemploymentEmployerBps: 80, exemptionGeneralCents: 70000, exemptionPensionAgeCents: 77600, updatedAt: '2026-10-30T10:00:00Z', updatedByUid: uid, ...extra });

test('TSD: only admin and finance read or write the ID codes and pay', async () => {
  safe();
  if (!admin.apps.length) admin.initializeApp({ projectId: PROJECT });
  const boss = await account('admin');
  const finance = await account('finance');
  const teacher = await account('teacher');
  const learner = await account('student');

  assert.equal(await put(boss, 'tsdPayees/p', payee(boss.uid)), 200);
  assert.equal(await put(finance, 'tsdPayees/p', payee(finance.uid, { pensionRate: null, exemptionApplied: null })), 200, 'unknown exemption and pension may be saved');
  assert.equal(await put(boss, 'tsdMonths/2026-10', monthDoc(boss.uid)), 200);
  assert.equal(await put(boss, 'tsdSettings/2027', ratesDoc(boss.uid)), 200);
  for (const path of ['tsdPayees/p', 'tsdMonths/2026-10', 'tsdSettings/2027']) {
    assert.equal(await get(boss, path), 200);
    assert.equal(await get(finance, path), 200);
    for (const other of [teacher, learner]) {
      assert.equal(await get(other, path), 403, `${path} readable`);
      assert.equal(await del(other, path), 403);
    }
    assert.equal(await del(boss, path), 403, `${path} deletable`);
  }
  assert.equal(await put(teacher, 'tsdPayees/q', payee(teacher.uid)), 403);
  assert.equal(await put(learner, 'tsdMonths/2026-11', monthDoc(learner.uid)), 403);
  assert.equal(await put(teacher, 'tsdSettings/2028', ratesDoc(teacher.uid)), 403);
});

test('TSD: keys, own uid and limits hold', async () => {
  safe();
  if (!admin.apps.length) admin.initializeApp({ projectId: PROJECT });
  const boss = await account('admin');
  assert.equal(await put(boss, 'tsdPayees/a', payee('someone-else')), 403);
  assert.equal(await put(boss, 'tsdPayees/b', payee(boss.uid, { extra: 1 })), 403);
  assert.equal(await put(boss, 'tsdPayees/c', payee(boss.uid, { name: '' })), 403);
  assert.equal(await put(boss, 'tsdPayees/d', payee(boss.uid, { pensionRate: 3 })), 403);
  assert.equal(await put(boss, 'tsdMonths/2026-13', monthDoc(boss.uid)), 403);
  assert.equal(await put(boss, 'tsdMonths/2026-11', monthDoc(boss.uid, { sourceMonth: 'eile' })), 403);
  assert.equal(await put(boss, 'tsdSettings/nope', ratesDoc(boss.uid)), 403);
  assert.equal(await put(boss, 'tsdSettings/2029', ratesDoc(boss.uid, { incomeTaxBps: 22.5 })), 403);
  assert.equal(await put(boss, 'tsdSettings/2029', ratesDoc(boss.uid, { incomeTaxBps: 20000 })), 403);
});
