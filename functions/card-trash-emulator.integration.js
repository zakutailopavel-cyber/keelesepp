'use strict';
// „Prügikast” against the Firestore + Auth emulators (functions/card-trash.js and firestore.rules): a card with lessons
// ahead is refused, a trashed card comes back with „Taasta”, after the week a card without history is deleted, a card
// with history is anonymised and keeps its id, and only an administrator writes the trash fields.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const admin = require('firebase-admin');
const { FieldValue } = require('firebase-admin/firestore');
const { trashCard, restoreCard, purgeDueCards } = require('./card-trash');

const PROJECT = 'demo-keelesepp-finance';
function db() {
  assert.match(process.env.FIRESTORE_EMULATOR_HOST || '', /^(127\.0\.0\.1|localhost):\d+$/);
  if (!admin.apps.length) admin.initializeApp({ projectId: PROJECT });
  return admin.firestore();
}
const actor = { uid: 'admin-trash', name: 'Oleksiy' };
const stamp = () => `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
const weekLater = (date) => new Date(date.getTime() + 7 * 24 * 60 * 60 * 1000 + 1000);

test('student: blocked by lessons ahead, trashed, restored, then purged (no history → deleted)', async () => {
  const store = db();
  const id = `trash-s-${stamp()}`;
  await store.doc(`students/${id}`).set({ name: 'Mari Maasikas', active: true, email: 'mari@example.com', linkedUserId: `acc-${id}` });
  await store.doc(`users/acc-${id}`).set({ role: 'student', linkedStudentIds: [id, 'other'] });
  await store.doc(`studentAvailability/${id}`).set({ slots: [] });
  const lesson = await store.collection('schedule').add({ studentId: id, date: '2999-01-01', status: 'Planeeritud' });

  await assert.rejects(() => trashCard(store, { kind: 'student', id, actor }), (error) => error.status === 409 && /eesootavat/.test(error.message));
  await lesson.update({ status: 'Tühistatud' });

  const now = new Date();
  const trashed = await trashCard(store, { kind: 'student', id, actor, now });
  const card = (await store.doc(`students/${id}`).get()).data();
  assert.equal(card.active, false);
  assert.equal(card.deletedAt, now.toISOString());
  assert.equal(card.purgeAfter, trashed.purgeAfter);
  assert.equal(card.name, 'Mari Maasikas', 'nothing else changes in the trash');
  await assert.rejects(() => trashCard(store, { kind: 'student', id, actor }), /juba prügikastis/);

  await restoreCard(store, { kind: 'student', id, actor, FieldValue });
  const back = (await store.doc(`students/${id}`).get()).data();
  assert.equal(back.active, true);
  assert.equal('deletedAt' in back, false);
  assert.equal('purgeAfter' in back, false);

  // the cancelled lesson is a schedule record of the card: history → anonymise. A fresh card without anything:
  const lonely = `trash-l-${stamp()}`;
  await store.doc(`students/${lonely}`).set({ name: 'Viga Kaart', active: true, linkedUserId: `acc-${lonely}` });
  await store.doc(`users/acc-${lonely}`).set({ role: 'student', linkedStudentIds: [lonely] });
  await store.doc(`studentRevenuePlans/${lonely}`).set({ price: 25 });
  await store.collection('activityLog').add({ studentId: lonely, type: 'student.created' });
  const at = new Date();
  await trashCard(store, { kind: 'student', id: lonely, actor, now: at });
  const early = await purgeDueCards(store, { FieldValue, now: at });
  assert.equal(early.results.some((item) => item.id === lonely), false, 'not due before the week is over');
  const result = await purgeDueCards(store, { FieldValue, now: weekLater(at) });
  const mine = result.results.find((item) => item.id === lonely);
  assert.equal(mine.action, 'delete');
  assert.equal((await store.doc(`students/${lonely}`).get()).exists, false);
  assert.equal((await store.doc(`studentRevenuePlans/${lonely}`).get()).exists, false);
  assert.deepEqual((await store.doc(`users/acc-${lonely}`).get()).data().linkedStudentIds, [], 'the account stays, only the link goes');
  const log = (await store.doc(`activityLog/card-purge-student-${lonely}`).get()).data();
  assert.equal(log.decision, 'delete');
  assert.equal(log.studentName.startsWith('Kustutatud õpilane #'), true);
});

test('student with invoices and held lessons: anonymised, id and history stay; restore is then refused', async () => {
  const store = db();
  const id = `trash-h-${stamp()}`;
  await store.doc(`students/${id}`).set({ name: 'Jaan Tamm', active: true, phone: '+372 5', parentEmail: 'ema@example.com', linkedParentIds: [`par-${id}`], subject: 'Eesti keel', level: 'B1' });
  await store.doc(`users/par-${id}`).set({ role: 'parent', linkedStudentIds: [id] });
  const invoice = await store.collection('invoices').add({ studentId: id, studentName: 'Jaan Tamm', total: 100, number: 'KS-9' });
  await store.collection('lessons').add({ studentId: id, date: '2026-10-01', status: 'Toimunud' });
  const at = new Date();
  await trashCard(store, { kind: 'student', id, actor, now: at });
  const result = await purgeDueCards(store, { FieldValue, now: weekLater(at) });
  assert.equal(result.results.find((item) => item.id === id).action, 'anonymise');
  const card = (await store.doc(`students/${id}`).get()).data();
  assert.match(card.name, /^Kustutatud õpilane #/);
  assert.equal(card.phone, '');
  assert.equal(card.parentEmail, '');
  assert.deepEqual(card.linkedParentIds, []);
  assert.equal(card.level, 'B1');
  assert.ok(card.purgedAt);
  assert.equal('purgeAfter' in card, false);
  const kept = (await invoice.get()).data();
  assert.equal(kept.studentId, id);
  assert.equal(kept.total, 100);
  assert.equal(kept.studentName, 'Jaan Tamm', 'an issued invoice is never changed');
  assert.deepEqual((await store.doc(`users/par-${id}`).get()).data().linkedStudentIds, []);
  await assert.rejects(() => restoreCard(store, { kind: 'student', id, actor, FieldValue }), /lõplikult/);
  const again = await purgeDueCards(store, { FieldValue, now: weekLater(weekLater(at)) });
  assert.equal(again.results.some((item) => item.id === id), false, 'a purged card is not processed again');
});

test('a lesson planned during the week blocks the purge; the card stays in the trash', async () => {
  const store = db();
  const id = `trash-b-${stamp()}`;
  await store.doc(`students/${id}`).set({ name: 'Kati', active: true });
  const at = new Date();
  await trashCard(store, { kind: 'student', id, actor, now: at });
  await store.collection('schedule').add({ studentId: id, date: '2999-02-02', status: 'Planeeritud' });
  const result = await purgeDueCards(store, { FieldValue, now: weekLater(at) });
  assert.equal(result.results.find((item) => item.id === id).action, 'block');
  const card = (await store.doc(`students/${id}`).get()).data();
  assert.equal(card.name, 'Kati');
  assert.equal(card.purgeBlocked, 'future-lessons');
  assert.ok(card.deletedAt);
});

test('teacher: refused with lessons ahead, disabled in the trash, anonymised with work history', async () => {
  const store = db();
  const uid = `trash-t-${stamp()}`;
  await store.doc(`users/${uid}`).set({ role: 'teacher', displayName: `Õpetaja ${uid}`, email: 't@example.com', staffNotes: 'märkus' });
  const lesson = await store.collection('schedule').add({ teacherUid: uid, day: 'E', time: '10:00', studentId: 'x' });
  await assert.rejects(() => trashCard(store, { kind: 'teacher', id: uid, actor }), /teisele õpetajale/);
  await lesson.update({ endDate: '2020-01-01' });
  await assert.rejects(() => trashCard(store, { kind: 'teacher', id: 'admin-trash', actor }), (error) => error.status === 404 || /Oma kontot/.test(error.message));
  await store.collection('workSessions').add({ staffUid: uid, durationMinutes: 60 });
  const at = new Date();
  await trashCard(store, { kind: 'teacher', id: uid, actor, now: at });
  assert.equal((await store.doc(`users/${uid}`).get()).data().disabled, true);
  const result = await purgeDueCards(store, { FieldValue, now: weekLater(at) });
  assert.equal(result.results.find((item) => item.id === uid).action, 'anonymise');
  const profile = (await store.doc(`users/${uid}`).get()).data();
  assert.match(profile.displayName, /^Kustutatud õpetaja #/);
  assert.equal(profile.email, '');
  assert.equal(profile.disabled, true);
  assert.equal(profile.role, 'teacher');
  assert.equal('staffNotes' in profile, false);
});

// the rules: a teacher cannot put a card in the trash or change a trashed card; an administrator can
const authHost = process.env.FIREBASE_AUTH_EMULATOR_HOST;
const base = () => `http://${process.env.FIRESTORE_EMULATOR_HOST}/v1/projects/${PROJECT}/databases/(default)/documents`;
async function account(role) {
  const r = await fetch(`http://${authHost}/identitytoolkit.googleapis.com/v1/accounts:signUp?key=demo`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: `trash-${role}-${stamp()}@example.com`, password: 'emulator-only-password', returnSecureToken: true }),
  });
  const b = await r.json();
  const uid = JSON.parse(Buffer.from(b.idToken.split('.')[1], 'base64url')).sub;
  await db().doc(`users/${uid}`).set({ role, displayName: `Õpetaja ${uid}` });
  return { token: b.idToken, uid };
}
async function patch(who, path, field, value) {
  const r = await fetch(`${base()}/${path}?updateMask.fieldPaths=${field}`, {
    method: 'PATCH', headers: { Authorization: `Bearer ${who.token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ fields: { [field]: value } }),
  });
  return r.status;
}

test('rules: only the administrator writes the trash fields; a trashed card is closed to the teacher', async () => {
  const store = db();
  const teacher = await account('teacher');
  const administrator = await account('admin');
  const id = `trash-r-${stamp()}`;
  await store.doc(`students/${id}`).set({ name: 'Reegel', active: true, teacherUid: teacher.uid, teacher: `Õpetaja ${teacher.uid}` });
  assert.equal(await patch(teacher, `students/${id}`, 'level', { stringValue: 'A2' }), 200);
  assert.equal(await patch(teacher, `students/${id}`, 'deletedAt', { stringValue: new Date().toISOString() }), 403);
  assert.equal(await patch(teacher, `students/${id}`, 'purgeAfter', { stringValue: '2000-01-01T00:00:00.000Z' }), 403);
  assert.equal(await patch(administrator, `students/${id}`, 'deletedAt', { stringValue: new Date().toISOString() }), 200);
  assert.equal(await patch(teacher, `students/${id}`, 'level', { stringValue: 'B1' }), 403);
  assert.equal(await patch(teacher, `users/${teacher.uid}`, 'deletedAt', { stringValue: new Date().toISOString() }), 403);
  assert.equal(await patch(teacher, `users/${teacher.uid}`, 'trashState', { mapValue: { fields: {} } }), 403);
});
