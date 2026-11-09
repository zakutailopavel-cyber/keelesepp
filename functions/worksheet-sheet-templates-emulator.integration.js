'use strict';
// Worksheet constructor whole-sheet / whole-lesson templates (`worksheetTemplates`) against the real Firestore rules
// (emulators): staff read and create their own, the author or an admin renames or archives, nobody deletes, students
// and forged fields are denied.
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
    body: JSON.stringify({ email: `stpl-${role}-${Date.now()}-${Math.random().toString(36).slice(2)}@example.com`, password: 'emulator-only-password', returnSecureToken: true }),
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
  const r = await fetch(`${base()}/worksheetTemplates`, { method: 'POST', headers: { Authorization: `Bearer ${who.token}`, 'Content-Type': 'application/json' }, body: fields(data) });
  const b = await r.json();
  return { status: r.status, id: b.name ? b.name.split('/').pop() : '' };
}
const call = (who, method, id, body, mask = []) => fetch(`${base()}/worksheetTemplates/${id}${mask.length ? `?${mask.map((m) => `updateMask.fieldPaths=${m}`).join('&')}` : ''}`, { method, headers: { Authorization: `Bearer ${who.token}`, 'Content-Type': 'application/json' }, ...(body ? { body } : {}) }).then((r) => r.status);

const sheet = { phase: 'discover', label: 'Avasta', doc: { schema: 'keelesepp.worksheet/2', id: 'ws_1', meta: { title: 'Pere', level: 'A2' }, blocks: [{ id: 'b1', type: 'gaps', data: { title: 'Lünktekst' } }] } };
const now = () => new Date().toISOString();
const template = (ownerUid, patch = {}) => ({ kind: 'sheet', title: 'Pere leht', level: 'A2', sheets: [sheet], ownerUid, ownerName: 'Õpetaja', createdAt: now(), updatedAt: now(), archived: false, ...patch });
const archive = (by) => fields({ archived: true, archivedAt: now(), archivedBy: by.uid, updatedAt: now() });
const ARCHIVE_MASK = ['archived', 'archivedAt', 'archivedBy', 'updatedAt'];

test('worksheet sheet / lesson templates: staff share them, the author or an admin archives, nobody deletes', async () => {
  safe();
  if (!admin.apps.length) admin.initializeApp({ projectId: PROJECT });
  const teacher = await account('teacher');
  const colleague = await account('teacher');
  const boss = await account('admin');
  const student = await account('student');

  const mine = await create(teacher, template(teacher.uid));
  assert.equal(mine.status, 200);
  assert.equal((await create(teacher, template(teacher.uid, { kind: 'lesson', sheets: [sheet, { ...sheet, phase: 'practice' }] }))).status, 200, 'lesson template');
  assert.equal((await create(teacher, template(colleague.uid))).status, 403, 'cannot create in someone else\'s name');
  assert.equal((await create(teacher, template(teacher.uid, { extra: true }))).status, 403, 'no extra fields');
  assert.equal((await create(teacher, template(teacher.uid, { title: '' }))).status, 403, 'needs a title');
  assert.equal((await create(teacher, template(teacher.uid, { kind: 'course' }))).status, 403, 'kind is sheet or lesson');
  assert.equal((await create(teacher, template(teacher.uid, { sheets: [] }))).status, 403, 'needs a sheet');
  assert.equal((await create(teacher, template(teacher.uid, { archived: true }))).status, 403, 'not created archived');
  assert.equal((await create(student, template(student.uid))).status, 403, 'students cannot create');

  assert.equal(await call(colleague, 'GET', mine.id), 200, 'colleague reads it');
  assert.equal(await call(student, 'GET', mine.id), 403, 'student cannot read');
  assert.equal(await call(teacher, 'PATCH', mine.id, fields({ sheets: [] }), ['sheets']), 403, 'content is not edited in place');
  assert.equal(await call(teacher, 'PATCH', mine.id, fields({ ownerUid: colleague.uid }), ['ownerUid']), 403, 'owner does not change');
  assert.equal(await call(colleague, 'PATCH', mine.id, archive(colleague), ARCHIVE_MASK), 403, 'colleague cannot archive');
  assert.equal(await call(teacher, 'PATCH', mine.id, fields({ title: 'Uus nimi', updatedAt: now() }), ['title', 'updatedAt']), 200, 'author renames');
  assert.equal(await call(teacher, 'DELETE', mine.id), 403, 'author cannot delete');
  assert.equal(await call(teacher, 'PATCH', mine.id, archive(teacher), ARCHIVE_MASK), 200, 'author archives');

  const other = await create(colleague, template(colleague.uid));
  assert.equal(await call(boss, 'PATCH', other.id, archive(boss), ARCHIVE_MASK), 200, 'admin archives');
  assert.equal(await call(boss, 'DELETE', other.id), 403, 'admin does not delete either');
});
