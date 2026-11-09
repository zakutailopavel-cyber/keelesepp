'use strict';
// „Väljamaksed” (teacherPayouts/{YYYY-MM}_{teacherUid}, owner 2026-11-09) against the real Firestore rules: only the
// administrator marks a teacher-month paid or undoes it (fixed keys, own uid, id = month_teacherUid, append-only
// history); the bookkeeper reads; the teacher (even the paid one) never reads or writes; nobody deletes.
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
    body: JSON.stringify({ email: `tp-${role}-${Date.now()}-${Math.random().toString(36).slice(2)}@example.com`, password: 'emulator-only-password', returnSecureToken: true }),
  });
  const b = await r.json();
  assert.ok(b.idToken);
  const uid = JSON.parse(Buffer.from(b.idToken.split('.')[1], 'base64url')).sub;
  await admin.firestore().doc(`users/${uid}`).set({ role, displayName: role });
  return { token: b.idToken, uid };
}

function enc(v) {
  if (v === null) return { nullValue: null };
  if (Array.isArray(v)) return { arrayValue: { values: v.map(enc) } };
  if (typeof v === 'object') return { mapValue: { fields: Object.fromEntries(Object.entries(v).map(([k, x]) => [k, enc(x)])) } };
  if (typeof v === 'number') return Number.isInteger(v) ? { integerValue: String(v) } : { doubleValue: v };
  return { stringValue: String(v) };
}
const base = () => `http://${dbHost}/v1/projects/${PROJECT}/databases/(default)/documents`;
const body = (data) => JSON.stringify({ fields: Object.fromEntries(Object.entries(data).map(([k, v]) => [k, enc(v)])) });
const put = (who, id, data) => fetch(`${base()}/teacherPayouts/${id}`, { method: 'PATCH', headers: { Authorization: `Bearer ${who.token}`, 'Content-Type': 'application/json' }, body: body(data) }).then((r) => r.status);
const get = (who, id) => fetch(`${base()}/teacherPayouts/${id}`, { headers: { Authorization: `Bearer ${who.token}` } }).then((r) => r.status);
const del = (who, id) => fetch(`${base()}/teacherPayouts/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${who.token}` } }).then((r) => r.status);

const AT = '2026-11-09T10:00:00.000Z';
const line = (action, by, extra = {}) => ({ action, amountCents: 82000, paidAt: '2026-11-05', method: 'pank', note: '', byUid: by.uid, byName: 'Admin', atIso: AT, ...extra });
const mark = (month, teacherUid, by, history, extra = {}) => ({ teacherUid, teacherName: 'Õpetaja', month, status: 'paid', amountCents: 82000, paidAt: '2026-11-05', method: 'pank', note: '', markedBy: { uid: by.uid, name: 'Admin' }, markedAtIso: AT, history, ...extra });

test('teacher payouts: admin marks and undoes with an append-only history, bookkeeper reads, teacher never', async () => {
  safe();
  if (!admin.apps.length) admin.initializeApp({ projectId: PROJECT });
  const boss = await account('admin');
  const other = await account('admin');
  const books = await account('finance');
  const teacher = await account('teacher');
  const month = '2026-10';
  const id = `${month}_${teacher.uid}`;
  const paid = mark(month, teacher.uid, boss, [line('paid', boss)]);

  assert.equal(await put(teacher, id, mark(month, teacher.uid, teacher, [line('paid', teacher)])), 403, 'the teacher cannot mark own pay');
  assert.equal(await put(books, id, mark(month, teacher.uid, books, [line('paid', books)])), 403, 'the bookkeeper cannot mark');
  assert.equal(await put(boss, `2026-09_${teacher.uid}`, paid), 403, 'id is month_teacherUid');
  assert.equal(await put(boss, id, mark(month, teacher.uid, other, [line('paid', boss)])), 403, 'markedBy is the writer');
  assert.equal(await put(boss, id, mark(month, teacher.uid, boss, [line('paid', boss)], { amountCents: 0, history: [line('paid', boss, { amountCents: 0 })] })), 403, 'amount > 0');
  assert.equal(await put(boss, id, mark(month, teacher.uid, boss, [line('paid', boss)], { amountCents: 820.5 })), 403, 'amount in whole cents');
  assert.equal(await put(boss, id, mark(month, teacher.uid, boss, [line('paid', boss)], { iban: 'EE00' })), 403, 'fixed keys');
  assert.equal(await put(boss, id, mark(month, teacher.uid, boss, [line('paid', boss)], { method: 'krüpto' })), 403, 'known method');
  assert.equal(await put(boss, id, mark(month, teacher.uid, boss, [])), 403, 'history has the mark');
  assert.equal(await put(boss, id, mark(month, teacher.uid, boss, [line('paid', boss, { amountCents: 1 })])), 403, 'history line matches the amount');
  assert.equal(await put(boss, id, paid), 200, 'admin marks paid');
  assert.equal(await put(boss, id, mark(month, teacher.uid, boss, [line('paid', boss), line('paid', boss)])), 403, 'a paid month cannot be marked again');

  assert.equal(await get(boss, id), 200, 'admin reads');
  assert.equal(await get(books, id), 200, 'bookkeeper reads');
  assert.equal(await get(teacher, id), 403, 'the teacher does not read');

  const undo = (by, extra = {}) => ({ ...paid, status: 'cancelled', cancelledBy: { uid: by.uid, name: 'Admin 2' }, cancelledAtIso: AT, cancelReason: 'Vale summa', history: [line('paid', boss), line('cancelled', by, { note: 'Vale summa' })], ...extra });
  assert.equal(await put(books, id, undo(books)), 403, 'the bookkeeper cannot undo');
  assert.equal(await put(other, id, undo(other, { cancelReason: '' })), 403, 'undo needs a reason');
  assert.equal(await put(other, id, undo(other, { amountCents: 1 })), 403, 'undo keeps the mark itself');
  assert.equal(await put(other, id, undo(other, { history: [line('cancelled', other, { note: 'Vale summa' })] })), 403, 'history is never rewritten');
  assert.equal(await put(other, id, undo(other)), 200, 'another admin undoes with a reason');
  assert.equal(await put(other, id, undo(other)), 403, 'a cancelled mark is not cancelled again');

  const again = mark(month, teacher.uid, boss, [line('paid', boss), line('cancelled', other, { note: 'Vale summa' }), line('paid', boss, { amountCents: 80000 })], { amountCents: 80000 });
  assert.equal(await put(boss, id, again), 200, 'marked again after an undo, history kept');
  assert.equal(await del(boss, id), 403, 'never deleted');
  const stored = (await admin.firestore().doc(`teacherPayouts/${id}`).get()).data();
  assert.equal(stored.history.length, 3);
  assert.equal(stored.amountCents, 80000);
});
