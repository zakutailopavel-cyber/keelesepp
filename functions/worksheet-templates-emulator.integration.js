'use strict';
// Worksheet constructor block templates against the real Firestore rules (emulators): staff read and create their own,
// only the author or an admin deletes, nobody edits in place, students and forged fields are denied.
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
    body: JSON.stringify({ email: `tpl-${role}-${Date.now()}-${Math.random().toString(36).slice(2)}@example.com`, password: 'emulator-only-password', returnSecureToken: true }),
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
const base = () => `http://${dbHost}/v1/projects/${PROJECT}/databases/(default)/documents`;
const fields = (data) => JSON.stringify({ fields: Object.fromEntries(Object.entries(data).map(([k, v]) => [k, enc(v)])) });
async function create(who, data) {
  const r = await fetch(`${base()}/worksheetBlockTemplates`, { method: 'POST', headers: { Authorization: `Bearer ${who.token}`, 'Content-Type': 'application/json' }, body: fields(data) });
  const b = await r.json();
  return { status: r.status, id: b.name ? b.name.split('/').pop() : '' };
}
const call = (who, method, id, body) => fetch(`${base()}/worksheetBlockTemplates/${id}`, { method, headers: { Authorization: `Bearer ${who.token}`, 'Content-Type': 'application/json' }, ...(body ? { body } : {}) }).then((r) => r.status);

const template = (ownerUid) => ({ title: 'Õige või vale', block: { type: 'truefalse', data: { title: 'Õige või vale?' } }, ownerUid, ownerName: 'Õpetaja', createdAt: new Date().toISOString() });

test('worksheet block templates: staff share them, only the author or an admin removes one', async () => {
  safe();
  if (!admin.apps.length) admin.initializeApp({ projectId: PROJECT });
  const teacher = await account('teacher');
  const colleague = await account('teacher');
  const boss = await account('admin');
  const student = await account('student');

  const mine = await create(teacher, template(teacher.uid));
  assert.equal(mine.status, 200);
  assert.equal((await create(teacher, template(colleague.uid))).status, 403, 'cannot create in someone else\'s name');
  assert.equal((await create(teacher, { ...template(teacher.uid), extra: true })).status, 403, 'no extra fields');
  assert.equal((await create(teacher, { ...template(teacher.uid), title: '' })).status, 403, 'needs a title');
  assert.equal((await create(student, template(student.uid))).status, 403, 'students cannot create');

  assert.equal(await call(colleague, 'GET', mine.id), 200, 'colleague reads it');
  assert.equal(await call(student, 'GET', mine.id), 403, 'student cannot read');
  assert.equal(await call(teacher, 'PATCH', mine.id, fields(template(teacher.uid))), 403, 'no edits in place');
  assert.equal(await call(colleague, 'DELETE', mine.id), 403, 'colleague cannot delete');
  assert.equal(await call(teacher, 'DELETE', mine.id), 200, 'author deletes');

  const other = await create(colleague, template(colleague.uid));
  assert.equal(await call(boss, 'DELETE', other.id), 200, 'admin deletes');
});
