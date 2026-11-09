'use strict';
// The student's notes from the board's „Järjehoidja / Kleebis” („Minu vead” → „Märkmed tunnist”) against the real
// Firestore rules: staff and the student / parent write them, the author or staff change and delete, outsiders see nothing.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const admin = require('firebase-admin');

const PROJECT = 'demo-keelesepp-finance';
const authHost = process.env.FIREBASE_AUTH_EMULATOR_HOST;
const dbHost = process.env.FIRESTORE_EMULATOR_HOST;
const base = `http://${dbHost}/v1/projects/${PROJECT}/databases/(default)/documents`;

async function account(role) {
  const r = await fetch(`http://${authHost}/identitytoolkit.googleapis.com/v1/accounts:signUp?key=demo`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: `notes-${role}-${Date.now()}-${Math.random().toString(36).slice(2)}@example.com`, password: 'emulator-only-password', returnSecureToken: true }),
  });
  const b = await r.json();
  const uid = JSON.parse(Buffer.from(b.idToken.split('.')[1], 'base64url')).sub;
  await admin.firestore().doc(`users/${uid}`).set({ role });
  return { token: b.idToken, uid };
}
const enc = (v) => (Array.isArray(v) ? { arrayValue: { values: v.map(enc) } }
  : typeof v === 'boolean' ? { booleanValue: v }
  : v && typeof v === 'object' ? { mapValue: { fields: Object.fromEntries(Object.entries(v).map(([k, x]) => [k, enc(x)])) } }
  : typeof v === 'number' ? { integerValue: String(v) } : { stringValue: String(v) });
const fields = (o) => Object.fromEntries(Object.entries(o).map(([k, v]) => [k, enc(v)]));
const headers = (who) => ({ Authorization: `Bearer ${who.token}`, 'Content-Type': 'application/json' });
const create = async (who, id, data) => (await fetch(`${base}/studentNotes?documentId=${id}`, { method: 'POST', headers: headers(who), body: JSON.stringify({ fields: fields(data) }) })).status;
const patch = async (who, id, data) => (await fetch(`${base}/studentNotes/${id}?${Object.keys(data).map((k) => `updateMask.fieldPaths=${k}`).join('&')}`, { method: 'PATCH', headers: headers(who), body: JSON.stringify({ fields: fields(data) }) })).status;
const read = async (who, id) => (await fetch(`${base}/studentNotes/${id}`, { headers: headers(who) })).status;
const remove = async (who, id) => (await fetch(`${base}/studentNotes/${id}`, { method: 'DELETE', headers: headers(who) })).status;

test('student notes: teacher and student write, the author or staff change, outsiders see nothing', async () => {
  assert.equal(process.env.GCLOUD_PROJECT || process.env.GOOGLE_CLOUD_PROJECT, PROJECT);
  if (!admin.apps.length) admin.initializeApp({ projectId: PROJECT });
  const teacher = await account('teacher');
  const learner = await account('student');
  const parent = await account('parent');
  const stranger = await account('student');
  await admin.firestore().doc('students/st-notes').set({ name: 'Mari', linkedUserId: learner.uid, linkedParentId: parent.uid });
  const now = '2026-11-04T10:00:00Z';
  const note = (who, extra = {}) => ({ studentId: 'st-notes', kind: 'board', text: 'Kordan: kass → kassi', ink: [{ d: 'M1 1L20 20', c: '#1C2B3A', w: 3 }], color: '#FEF3C7', pageId: '', pageTitle: 'Tahvel', byStaff: false, createdByUid: who.uid, createdByName: 'X', createdAt: now, updatedAt: now, ...extra });

  assert.equal(await create(teacher, 'n1', note(teacher, { byStaff: true })), 200, 'the teacher writes a note for the student');
  assert.equal(await create(learner, 'n2', note(learner)), 200, 'the student writes his own');
  assert.equal(await create(learner, 'n3', note(learner, { byStaff: true })), 403, 'a student cannot mark it as the teacher\'s');
  assert.equal(await create(learner, 'n3', note(teacher)), 403, 'author is the writer');
  assert.equal(await create(stranger, 'n3', note(stranger)), 403, 'not his student');
  assert.equal(await create(teacher, 'n3', note(teacher, { studentId: 'missing' })), 403, 'student must exist');
  assert.equal(await create(teacher, 'n3', note(teacher, { grade: 5 })), 403, 'no extra fields');
  assert.equal(await create(teacher, 'n3', note(teacher, { kind: 'word' })), 403, 'kind board');
  assert.equal(await create(teacher, 'n3', note(teacher, { text: 'x'.repeat(2001) })), 403, 'text ≤ 2000');
  assert.equal(await create(teacher, 'n3', note(teacher, { ink: Array.from({ length: 61 }, () => ({ d: 'M1 1' })) })), 403, 'ink ≤ 60 strokes');

  // an anchored bookmark (2026-11-09): the word / sentence of the page it belongs to
  const anchor = { kind: 'word', quote: 'kassi', before: 'Mari näeb ', after: ' aias.', sentence: 'Mari näeb kassi aias.', blockId: 'b-1', start: 10, end: 15 };
  assert.equal(await create(learner, 'na1', note(learner, { anchor })), 200, 'a note with its anchor');
  assert.equal(await create(learner, 'na2', note(learner, { anchor: { ...anchor, kind: 'page' } })), 403, 'known kinds only');
  assert.equal(await create(learner, 'na2', note(learner, { anchor: { ...anchor, quote: '' } })), 403, 'a quote is needed');
  assert.equal(await create(learner, 'na2', note(learner, { anchor: { ...anchor, quote: 'x'.repeat(301) } })), 403, 'quote ≤ 300');
  assert.equal(await create(learner, 'na2', note(learner, { anchor: { ...anchor, extra: 1 } })), 403, 'no extra anchor fields');
  assert.equal(await create(learner, 'na2', note(learner, { anchor: 'kassi' })), 403, 'the anchor is a map');
  assert.equal(await patch(learner, 'na1', { anchor: { ...anchor, quote: 'koera' } }), 403, 'the anchor is never changed');

  assert.equal(await read(learner, 'n1'), 200);
  assert.equal(await read(parent, 'n1'), 200);
  assert.equal(await read(stranger, 'n1'), 403);

  assert.equal(await patch(learner, 'n2', { text: 'Uus', updatedAt: '2026-11-04T11:00:00Z' }), 200, 'the author edits');
  assert.equal(await patch(learner, 'n1', { text: 'Uus', updatedAt: '2026-11-04T11:00:00Z' }), 403, 'not the teacher\'s note');
  assert.equal(await patch(teacher, 'n2', { text: 'Parandus', updatedAt: '2026-11-04T11:00:00Z' }), 200, 'staff edit');
  assert.equal(await patch(teacher, 'n2', { studentId: 'other' }), 403, 'student stays');
  assert.equal(await patch(teacher, 'n2', { createdByUid: teacher.uid }), 403, 'author stays');

  assert.equal(await remove(stranger, 'n2'), 403);
  assert.equal(await remove(learner, 'n1'), 403, 'the student does not delete the teacher\'s note');
  assert.equal(await remove(learner, 'n2'), 200, 'the author deletes his own');
  assert.equal(await remove(teacher, 'n1'), 200);
});
