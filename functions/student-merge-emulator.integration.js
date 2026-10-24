'use strict';
// „Liida kaardid” against the Firestore emulator (functions/student-merge.js): everything of the other card moves to
// the kept card, amounts never change, nothing is deleted, the other card stays as an archived tombstone, a repeated
// call is harmless.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const admin = require('firebase-admin');
const { FieldValue } = require('firebase-admin/firestore');
const { mergeStudentCards } = require('./student-merge');

const PROJECT = 'demo-keelesepp-finance';
function db() {
  assert.match(process.env.FIRESTORE_EMULATOR_HOST || '', /^(127\.0\.0\.1|localhost):\d+$/);
  if (!admin.apps.length) admin.initializeApp({ projectId: PROJECT });
  return admin.firestore();
}

test('merge two student cards: accounts, learner records and finance references move; the other card is a tombstone', async () => {
  const store = db();
  const keepId = `keep-${Date.now()}`;
  const sourceId = `self_src-${Date.now()}`;
  await store.doc(`students/${keepId}`).set({ name: 'Vlad', active: true, teacher: 'Pavel' });
  await store.doc(`students/${sourceId}`).set({ name: 'Влад Повжик', active: true, email: 'v@example.com', linkedUserId: 'uid-v', studentUid: 'uid-v', linkedUserIds: ['uid-v'] });
  await store.doc('users/uid-v').set({ linkedStudentIds: [sourceId] });
  await store.collection('worksheetAssignments').add({ studentId: sourceId, lessonTitle: 'B1 test' });
  await store.collection('petProfiles').add({ studentId: sourceId, kind: 'rebane' });
  const invoice = await store.collection('invoices').add({ studentId: sourceId, studentName: 'Влад Повжик', total: 100, number: 'KS-1' });
  await store.collection('schedule').add({ studentId: keepId, time: '10:00' });
  await store.collection('groups').add({ name: 'G', studentIds: [sourceId, 'other'] });

  const preview = await mergeStudentCards(store, { FieldValue, keepId, sourceId });
  assert.equal(preview.applied, false);
  assert.deepEqual(preview.move.map((m) => m.collection).sort(), ['groups', 'invoices', 'petProfiles', 'worksheetAssignments']);
  assert.equal((await store.doc(`students/${sourceId}`).get()).data().active, true, 'preview writes nothing');
  await assert.rejects(() => mergeStudentCards(store, { FieldValue, keepId, sourceId, apply: true }), /Confirm/);

  const done = await mergeStudentCards(store, { FieldValue, keepId, sourceId, apply: true, confirmed: true, actor: { uid: 'admin' } });
  assert.equal(done.applied, true);
  const keep = (await store.doc(`students/${keepId}`).get()).data();
  const source = (await store.doc(`students/${sourceId}`).get()).data();
  assert.deepEqual(keep.linkedUserIds, ['uid-v']);
  assert.equal(keep.linkedUserId, 'uid-v');
  assert.equal(keep.email, 'v@example.com');
  assert.deepEqual([...keep.nameAliases].sort(), ['Vlad', 'Влад Повжик'].sort());
  assert.equal(source.active, false);
  assert.equal(source.mergedInto, keepId);
  assert.equal(source.mergedIntoStudentId, keepId);
  assert.deepEqual(source.linkedUserIds, []);
  assert.equal((await store.collection('worksheetAssignments').where('studentId', '==', keepId).get()).size, 1);
  const moved = (await invoice.get()).data();
  assert.equal(moved.studentId, keepId);
  assert.equal(moved.total, 100);
  assert.equal(moved.number, 'KS-1');
  assert.equal(moved.studentName, 'Влад Повжик', 'an invoice keeps the name it was issued with');
  const group = (await store.collection('groups').where('studentIds', 'array-contains', keepId).get()).docs[0].data();
  assert.ok(!group.studentIds.includes(sourceId));
  assert.deepEqual((await store.doc('users/uid-v').get()).data().linkedStudentIds, [keepId]);
  assert.equal((await store.doc(`activityLog/student-card-merge-${sourceId}`).get()).data().type, 'student.cards_merged');
  // a repeated call returns the stored result; another target is refused
  const again = await mergeStudentCards(store, { FieldValue, keepId, sourceId, apply: true, confirmed: true });
  assert.equal(again.idempotent, true);
  await assert.rejects(() => mergeStudentCards(store, { FieldValue, keepId: 'someone-else', sourceId, apply: true, confirmed: true }), /not found|already merged/);
});

test('merging a maths card into an Estonian card keeps both subjects in one card', async () => {
  const store = db();
  const keepId = `est-${Date.now()}`;
  const sourceId = `math-${Date.now()}`;
  await store.doc(`students/${keepId}`).set({ name: 'Milan', active: true, subject: 'Eesti keel', teacher: 'Pavel', teacherUid: 'p1', teacherUids: ['p1'] });
  await store.doc(`students/${sourceId}`).set({ name: 'Milan', active: true, subject: 'Matemaatika', teacher: 'Yelyzaveta', teacherUid: 'y1' });
  const lesson = await store.collection('lessons').add({ studentId: sourceId, studentName: 'Milan', date: '2026-10-01', status: 'Toimunud' });
  const tagged = await store.collection('lessons').add({ studentId: sourceId, date: '2026-10-02', status: 'Toimunud', subject: 'Matemaatika' });
  const plan = await store.collection('schedule').add({ studentId: sourceId, time: '15:00' });

  const preview = await mergeStudentCards(store, { FieldValue, keepId, sourceId });
  assert.deepEqual(preview.addedSubjects.map((t) => [t.subject, t.teacher]), [['Matemaatika', 'Yelyzaveta']]);

  await mergeStudentCards(store, { FieldValue, keepId, sourceId, apply: true, confirmed: true, actor: { uid: 'admin' } });
  const keep = (await store.doc(`students/${keepId}`).get()).data();
  assert.deepEqual(keep.enrollments.map((item) => [item.subject, item.teacherUid]), [['Eesti keel', 'p1'], ['Matemaatika', 'y1']]);
  assert.deepEqual([...keep.teacherUids].sort(), ['p1', 'y1']);
  assert.equal((await lesson.get()).data().subject, 'Matemaatika');
  assert.equal((await lesson.get()).data().studentId, keepId);
  assert.equal((await tagged.get()).data().subject, 'Matemaatika');
  assert.equal((await plan.get()).data().subject, 'Matemaatika');
  assert.equal((await plan.get()).data().studentId, keepId, 'the weekly schedule moves too');
});

test('full merge: groups, per-card documents, board, parents union, chosen name, price per subject, nothing deleted', async () => {
  const store = db();
  const t = Date.now();
  const keepId = `full-keep-${t}`;
  const sourceId = `full-src-${t}`;
  await store.doc(`students/${keepId}`).set({ name: 'Milan', active: true, subject: 'Inglise keel', teacher: 'Anna', teacherUid: 'a1', level: 'A2',
    linkedParentId: 'par-1', parentUid: 'par-1', parentName: 'Ema', parentEmail: 'ema@example.com', contactNotes: 'esmaspäeviti', grade: '' });
  await store.doc(`students/${sourceId}`).set({ name: 'Milan Grozovski', active: true, subject: 'Eesti keel', teacher: 'Pavel', teacherUid: 'p1', level: 'B1', grade: '7',
    linkedParentIds: ['par-2'], parentName: 'Isa', parentEmail: 'isa@example.com', parentPhone: '5550000', contactNotes: 'teisipäeviti', skillMap: { reading: 3 } });
  await store.doc('users/par-2').set({ role: 'parent', linkedStudentIds: [sourceId] });
  await store.doc(`studentRevenuePlans/${keepId}`).set({ studentId: keepId, lessonPriceCents: 2000, lessonMinutes: 60, active: true });
  await store.doc(`studentRevenuePlans/${sourceId}`).set({ studentId: sourceId, lessonPriceCents: 2500, lessonMinutes: 45, active: true });
  await store.doc(`studentAvailability/${sourceId}`).set({ studentId: sourceId, slots: ['Mon-18:00'] });
  await store.doc(`whiteboards/${sourceId}`).set({ schemaVersion: 2 });
  await store.doc(`whiteboards/${sourceId}/elements/e1`).set({ kind: 'line' });
  await store.doc(`whiteboards/${sourceId}/lessonPages/p1`).set({ title: 'Leht' });
  await store.doc(`whiteboards/${sourceId}/lessonPages/p1/elements/e2`).set({ kind: 'text' });
  const group = await store.collection('groups').add({ name: 'Rühm', students: [sourceId, 'x'], studentLessonMap: { [sourceId]: ['l1'], x: ['l2'] } });
  const homework = await store.collection('homework').add({ studentId: sourceId, title: 'Töö' });
  const note = await store.collection('lessonNotes').add({ studentId: sourceId, text: 'märge' });
  const change = await store.collection('lessonChangeRequests').add({ studentId: sourceId, status: 'open' });
  const payment = await store.collection('payments').add({ studentId: sourceId, amountCents: 5000 });
  const log = await store.collection('activityLog').add({ studentId: sourceId, type: 'old.history' });

  const preview = await mergeStudentCards(store, { FieldValue, keepId, sourceId, keepName: 'Milan Grozovski' });
  assert.ok(preview.conflicts.some((c) => c.code === 'parents'), 'different parents are shown');
  assert.ok(preview.conflicts.some((c) => c.code === 'name'));
  assert.equal(preview.price.action, 'addSubjectPrice');
  assert.deepEqual(preview.documents.map((d) => [d.collection, d.action]).sort(), [['studentAvailability', 'copy'], ['studentRevenuePlans', 'keep'], ['whiteboards', 'copy']]);
  assert.ok(preview.move.some((m) => m.collection === 'groups' && m.field === 'students'));
  await assert.rejects(() => mergeStudentCards(store, { FieldValue, keepId, sourceId, keepName: 'Someone' }), /name/);

  await mergeStudentCards(store, { FieldValue, keepId, sourceId, keepName: 'Milan Grozovski', apply: true, confirmed: true, actor: { uid: 'admin' } });
  const keep = (await store.doc(`students/${keepId}`).get()).data();
  assert.equal(keep.name, 'Milan Grozovski');
  assert.deepEqual([...keep.linkedParentIds].sort(), ['par-1', 'par-2']);
  assert.equal(keep.linkedParentId, 'par-1');
  assert.deepEqual(keep.parentContacts.map((c) => c.email).sort(), ['ema@example.com', 'isa@example.com']);
  assert.equal(keep.grade, '7');
  assert.match(keep.contactNotes, /esmaspäeviti[\s\S]*teisipäeviti/);
  assert.deepEqual(keep.skillMap, { reading: 3 });
  assert.deepEqual(keep.enrollments.map((e) => [e.subject, e.level]), [['Inglise keel', 'A2'], ['Eesti keel', 'B1']]);
  // price: the kept card's amount untouched, the other card's price becomes the price of its subject
  const plan = (await store.doc(`studentRevenuePlans/${keepId}`).get()).data();
  assert.equal(plan.lessonPriceCents, 2000);
  assert.deepEqual(plan.subjectPrices['Eesti keel'], { lessonPriceCents: 2500, lessonMinutes: 45 });
  const oldPlan = (await store.doc(`studentRevenuePlans/${sourceId}`).get()).data();
  assert.equal(oldPlan.lessonPriceCents, 2500, 'old plan kept, amount unchanged');
  assert.equal(oldPlan.active, false);
  assert.equal(oldPlan.mergedInto, keepId);
  // per-card documents copied, the board with its elements and pages
  assert.deepEqual((await store.doc(`studentAvailability/${keepId}`).get()).data().slots, ['Mon-18:00']);
  assert.equal((await store.doc(`studentAvailability/${keepId}`).get()).data().studentId, keepId);
  assert.equal((await store.doc(`whiteboards/${keepId}/elements/e1`).get()).exists, true);
  assert.equal((await store.doc(`whiteboards/${keepId}/lessonPages/p1/elements/e2`).get()).exists, true);
  assert.equal((await store.doc(`whiteboards/${sourceId}/elements/e1`).get()).exists, true, 'old board not deleted');
  // records
  const g = (await group.get()).data();
  assert.deepEqual(g.students, [keepId, 'x']);
  assert.deepEqual(g.studentLessonMap[keepId], ['l1']);
  assert.equal(g.studentLessonMap[sourceId], undefined);
  for (const ref of [homework, note, change, payment]) assert.equal((await ref.get()).data().studentId, keepId);
  assert.equal((await payment.get()).data().amountCents, 5000);
  assert.equal((await log.get()).data().studentId, sourceId, 'history keeps the old id');
  assert.deepEqual((await store.doc('users/par-2').get()).data().linkedStudentIds, [keepId]);
  const source = (await store.doc(`students/${sourceId}`).get()).data();
  assert.equal(source.active, false);
  assert.equal(source.mergedInto, keepId);
  assert.deepEqual(source.linkedParentIds, []);
  assert.equal(source.name, 'Milan Grozovski', 'tombstone keeps its own data');
  const operation = (await store.doc(`studentCardMerges/${sourceId}`).get()).data();
  assert.equal(operation.status, 'complete');
});
