'use strict';
// „Liida kaardid” against the Firestore emulator (functions/student-merge.js): everything of the other card moves to
// the kept card, amounts never change, nothing is deleted, the other card stays as an archived tombstone, a repeated
// call is harmless.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const admin = require('firebase-admin');
const { FieldValue } = require('firebase-admin/firestore');
const { mergeStudentCards, unmergeStudentCards, UNMERGE_LEGACY } = require('./student-merge');

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

test('an archived card merges into an active one: history moves, its tracks end, the card stays active', async () => {
  const store = db();
  const t = Date.now();
  const keepId = `arch-keep-${t}`;
  const sourceId = `arch-src-${t}`;
  await store.doc(`students/${keepId}`).set({ name: 'Mia', active: true, subject: 'Eesti keel', teacher: 'Pavel', teacherUid: 'p1', teacherUids: ['p1'] });
  await store.doc(`students/${sourceId}`).set({ name: 'Mia', active: false, archivedAt: '2026-06-01T00:00:00.000Z', subject: 'Eesti keel', teacher: 'Anna', teacherUid: 'a1', teacherUids: ['a1'], linkedParentId: 'par-a', linkedParentIds: ['par-a'] });
  await store.doc('users/par-a').set({ role: 'parent', linkedStudentIds: [sourceId] });
  const lesson = await store.collection('lessons').add({ studentId: sourceId, studentName: 'Mia', date: '2026-05-01', status: 'Toimunud' });
  const invoice = await store.collection('invoices').add({ studentId: sourceId, studentName: 'Mia', total: 80, number: 'KS-9' });
  const payment = await store.collection('payments').add({ studentId: sourceId, amountCents: 8000 });
  const homework = await store.collection('homework').add({ studentId: sourceId, title: 'Töö' });

  const preview = await mergeStudentCards(store, { FieldValue, keepId, sourceId });
  assert.equal(preview.source.active, false);
  assert.equal(preview.activeAfter, true);
  assert.ok(preview.conflicts.some((c) => c.code === 'archived_source'));
  assert.deepEqual(preview.move.map((m) => m.collection).sort(), ['homework', 'invoices', 'lessons', 'payments']);

  await mergeStudentCards(store, { FieldValue, keepId, sourceId, apply: true, confirmed: true, actor: { uid: 'admin' } });
  const keep = (await store.doc(`students/${keepId}`).get()).data();
  assert.equal(keep.active, true);
  assert.deepEqual(keep.enrollments.map((e) => [e.teacherUid, e.active, e.status || '']), [['p1', true, ''], ['a1', false, 'ended']]);
  assert.deepEqual(keep.teacherUids, ['p1'], 'the archived card\'s teacher gets no access');
  assert.deepEqual(keep.linkedParentIds, ['par-a']);
  for (const ref of [lesson, invoice, payment, homework]) assert.equal((await ref.get()).data().studentId, keepId);
  assert.equal((await invoice.get()).data().total, 80);
  assert.deepEqual((await store.doc('users/par-a').get()).data().linkedStudentIds, [keepId]);
  const source = (await store.doc(`students/${sourceId}`).get()).data();
  assert.equal(source.active, false);
  assert.equal(source.mergedInto, keepId);
  assert.equal(source.archivedAt, '2026-06-01T00:00:00.000Z', 'the tombstone keeps its archive date');
  const audit = (await store.doc(`activityLog/student-card-merge-${sourceId}`).get()).data();
  assert.deepEqual(audit.activeBefore, { keep: true, source: false });
  assert.equal(audit.activeAfter, true);
});

test('an active card merges into an archived kept card: restored by default, or kept archived on request', async () => {
  const store = db();
  const t = Date.now();
  for (const [suffix, keepActive, expected] of [['default', undefined, true], ['archived', false, false]]) {
    const keepId = `arch2-keep-${suffix}-${t}`;
    const sourceId = `arch2-src-${suffix}-${t}`;
    await store.doc(`students/${keepId}`).set({ name: 'Leo', active: false, subject: 'Eesti keel', teacher: 'Pavel', teacherUid: 'p1' });
    await store.doc(`students/${sourceId}`).set({ name: 'Leo', active: true, subject: 'Matemaatika', teacher: 'Yelyzaveta', teacherUid: 'y1' });
    const lesson = await store.collection('lessons').add({ studentId: sourceId, date: '2026-10-01', status: 'Toimunud' });
    const input = { FieldValue, keepId, sourceId, ...(keepActive === undefined ? {} : { keepActive }) };
    const preview = await mergeStudentCards(store, input);
    assert.equal(preview.activeAfter, expected);
    assert.ok(preview.conflicts.some((c) => c.code === (expected ? 'archived_keep' : 'archived_result')));
    await mergeStudentCards(store, { ...input, apply: true, confirmed: true, confirmedDifferences: true, actor: { uid: 'admin' } });
    const keep = (await store.doc(`students/${keepId}`).get()).data();
    assert.equal(keep.active, expected);
    assert.equal(Boolean(keep.restoredAt), expected);
    assert.equal((await lesson.get()).data().studentId, keepId);
    assert.equal((await store.doc(`students/${sourceId}`).get()).data().active, false);
  }
});

test('an active kept card can be archived by the merge when the administrator chooses so', async () => {
  const store = db();
  const t = Date.now();
  const keepId = `arch3-keep-${t}`;
  const sourceId = `arch3-src-${t}`;
  await store.doc(`students/${keepId}`).set({ name: 'Ott', active: true });
  await store.doc(`students/${sourceId}`).set({ name: 'Ott', active: false });
  await mergeStudentCards(store, { FieldValue, keepId, sourceId, keepActive: false, apply: true, confirmed: true, actor: { uid: 'admin' } });
  const keep = (await store.doc(`students/${keepId}`).get()).data();
  assert.equal(keep.active, false);
  assert.ok(keep.archivedAt);
});

test('two archived cards merge both ways: history and finance move, the result stays archived unless chosen (2026-11-06)', async () => {
  const store = db();
  const t = Date.now();
  for (const [suffix, keepActive] of [['a', undefined], ['b', true]]) {
    const keepId = `arch4-keep-${suffix}-${t}`;
    const sourceId = `arch4-src-${suffix}-${t}`;
    await store.doc(`students/${keepId}`).set({ name: 'Mia Saar', active: false, archivedAt: '2026-05-01T00:00:00.000Z' });
    await store.doc(`students/${sourceId}`).set({ name: 'Mia Saar', active: false, archivedAt: '2026-06-01T00:00:00.000Z', email: 'mia@example.com' });
    const invoice = await store.collection('invoices').add({ studentId: sourceId, studentName: 'Mia Saar', amountCents: 4000, number: `KS-A${suffix}` });
    const lesson = await store.collection('lessons').add({ studentId: sourceId, date: '2026-05-10', status: 'Toimunud' });
    const input = { FieldValue, keepId, sourceId, ...(keepActive === undefined ? {} : { keepActive }) };
    const preview = await mergeStudentCards(store, input);
    assert.equal(preview.activeAfter, keepActive === true);
    assert.deepEqual(preview.move.map((m) => m.collection).sort(), ['invoices', 'lessons']);
    await mergeStudentCards(store, { ...input, apply: true, confirmed: true, actor: { uid: 'admin' } });
    const keep = (await store.doc(`students/${keepId}`).get()).data();
    assert.equal(keep.active, keepActive === true);
    assert.equal(keep.email, 'mia@example.com');
    const moved = (await invoice.get()).data();
    assert.equal(moved.studentId, keepId);
    assert.equal(moved.amountCents, 4000);
    assert.equal((await lesson.get()).data().studentId, keepId);
    const source = (await store.doc(`students/${sourceId}`).get()).data();
    assert.equal(source.mergedInto, keepId);
    assert.equal(source.archivedAt, '2026-06-01T00:00:00.000Z');
  }
  // the other direction: the older card kept, the newer one merged into it
  const older = `arch5-old-${t}`;
  const newer = `arch5-new-${t}`;
  await store.doc(`students/${older}`).set({ name: 'Ats', active: false });
  await store.doc(`students/${newer}`).set({ name: 'Ats', active: false });
  await mergeStudentCards(store, { FieldValue, keepId: newer, sourceId: older, apply: true, confirmed: true, actor: { uid: 'admin' } });
  assert.equal((await store.doc(`students/${older}`).get()).data().mergedInto, newer);
});

test('a card in the „Prügikast” is refused by the merge (either side); nothing moves', async () => {
  const store = db();
  const t = Date.now();
  const keepId = `trashm-keep-${t}`;
  const sourceId = `trashm-src-${t}`;
  await store.doc(`students/${keepId}`).set({ name: 'Eva', active: true });
  await store.doc(`students/${sourceId}`).set({ name: 'Eva', active: false, deletedAt: '2026-11-05T10:00:00.000Z', purgeAfter: '2026-11-12T10:00:00.000Z' });
  const lesson = await store.collection('lessons').add({ studentId: sourceId, date: '2026-10-01' });
  await assert.rejects(() => mergeStudentCards(store, { FieldValue, keepId, sourceId }), (error) => error.status === 409 && /prügikastis/.test(error.message));
  await assert.rejects(() => mergeStudentCards(store, { FieldValue, keepId: sourceId, sourceId: keepId, apply: true, confirmed: true }), /prügikastis/);
  assert.equal((await lesson.get()).data().studentId, sourceId);
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

  await mergeStudentCards(store, { FieldValue, keepId, sourceId, apply: true, confirmed: true, confirmedDifferences: true, actor: { uid: 'admin' } });
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

  await mergeStudentCards(store, { FieldValue, keepId, sourceId, keepName: 'Milan Grozovski', apply: true, confirmed: true, confirmedDifferences: true, actor: { uid: 'admin' } });
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

// incident 2026-11-09: two different girls named Stefania were merged; the merge is refused without the explicit
// confirmation, a moved lesson keeps its subject, and „Võta ühendamine tagasi” restores both cards
test('two Stefanias: refused without confirmedDifferences, lessons keep their subject, the unmerge restores everything', async () => {
  const store = db();
  const t = Date.now();
  const keepId = `stef-est-${t}`;
  const sourceId = `stef-mat-${t}`;
  const keepCard = { name: 'Stefania', active: true, grade: '12', subject: 'Eesti keel', teacher: 'Pavel', teacherUid: 'p1', teacherUids: ['p1'], level: 'C1', parentName: 'Jelena Shabanova', parentEmail: 'jelena@example.com', linkedParentId: 'par-jel', linkedParentIds: ['par-jel'] };
  const sourceCard = { name: 'Stefania', active: true, grade: '10', subject: 'Matemaatika', teacher: 'Yelyzaveta Lukiianchuk', teacherUid: 'y1', teacherUids: ['y1'], level: '10. klass', linkedUserId: `uid-stef-${t}`, studentUid: `uid-stef-${t}`, linkedUserIds: [`uid-stef-${t}`] };
  await store.doc(`students/${keepId}`).set(keepCard);
  await store.doc(`students/${sourceId}`).set(sourceCard);
  await store.doc('users/par-jel').set({ role: 'parent', linkedStudentIds: [keepId] });
  await store.doc(`users/uid-stef-${t}`).set({ role: 'student', linkedStudentIds: [sourceId, 'other-card'] });
  const lesson = await store.collection('lessons').add({ studentId: sourceId, studentName: 'Stefania', subject: 'Matemaatika', date: '2026-11-02', status: 'Toimunud' });
  const bare = await store.collection('lessons').add({ studentId: sourceId, date: '2026-11-03', status: 'Planeeritud' });
  const slot = await store.collection('schedule').add({ studentId: sourceId, weekday: 2, time: '16:00' });
  const invoice = await store.collection('invoices').add({ studentId: sourceId, studentName: 'Stefania', total: 50, number: 'KS-77' });
  const group = await store.collection('groups').add({ name: 'Mat', studentIds: [sourceId, 'x'] });
  const roster = await store.collection('groups').add({ name: 'Mat 2', students: [sourceId], studentLessonMap: { [sourceId]: ['l9'] } });
  await store.doc(`studentAvailability/${sourceId}`).set({ studentId: sourceId, slots: ['Tue-16:00'] });

  const preview = await mergeStudentCards(store, { FieldValue, keepId, sourceId });
  assert.deepEqual(preview.differentPerson.map((s) => s.code), ['grade', 'subject_teacher']);
  await assert.rejects(() => mergeStudentCards(store, { FieldValue, keepId, sourceId, apply: true, confirmed: true }), (error) => error.status === 409 && error.code === 'different_person' && /erinevad lapsed/.test(error.message));
  assert.equal((await store.doc(`students/${sourceId}`).get()).data().active, true, 'refused: nothing written');
  assert.equal((await lesson.get()).data().studentId, sourceId);

  await mergeStudentCards(store, { FieldValue, keepId, sourceId, apply: true, confirmed: true, confirmedDifferences: true, actor: { uid: 'admin' } });
  assert.equal((await lesson.get()).data().subject, 'Matemaatika', 'a lesson keeps its own subject');
  assert.equal((await bare.get()).data().subject, 'Matemaatika', 'a lesson without a subject gets the other card\'s, not the kept card\'s');
  assert.equal((await slot.get()).data().studentId, keepId);
  const op = (await store.doc(`studentCardMerges/${sourceId}`).get()).data();
  assert.equal(op.undo.version, 1);
  assert.equal(op.confirmedDifferences, true);
  assert.equal((await store.doc(`students/${sourceId}`).get()).data().mergeUndoVersion, 1);
  assert.equal((await store.collection(`studentCardMerges/${sourceId}/undo`).get()).size >= 1, true);

  // a teacher renames one moved lesson after the merge: that one field stays, the rest goes back
  await lesson.update({ studentName: 'Stefania M.' });
  const back = await unmergeStudentCards(store, { FieldValue, sourceId });
  assert.equal(back.applied, false);
  assert.equal(back.keep.id, keepId);
  assert.equal(back.totalRevert >= 6, true);
  assert.deepEqual(back.copies.map((c) => c.collection), ['studentAvailability']);
  assert.equal((await lesson.get()).data().studentId, keepId, 'the preview writes nothing');
  await assert.rejects(() => unmergeStudentCards(store, { FieldValue, sourceId, apply: true }), /Confirm/);

  const done = await unmergeStudentCards(store, { FieldValue, sourceId, apply: true, confirmed: true, actor: { uid: 'admin' } });
  assert.equal(done.applied, true);
  const l = (await lesson.get()).data();
  assert.equal(l.studentId, sourceId);
  assert.equal(l.subject, 'Matemaatika');
  assert.equal(l.mergedFromStudentId, undefined);
  assert.equal(l.studentName, 'Stefania M.', 'a field changed after the merge stays');
  const b = (await bare.get()).data();
  assert.equal(b.studentId, sourceId);
  assert.equal(b.subject, undefined, 'the subject the merge added is removed again');
  assert.equal((await slot.get()).data().studentId, sourceId);
  const inv = (await invoice.get()).data();
  assert.equal(inv.studentId, sourceId);
  assert.equal(inv.total, 50);
  assert.deepEqual((await group.get()).data().studentIds, ['x', sourceId]);
  const r = (await roster.get()).data();
  assert.deepEqual(r.students, [sourceId]);
  assert.deepEqual(r.studentLessonMap, { [sourceId]: ['l9'] });
  assert.equal(r.mergedStudentAt, undefined);
  const keep = (await store.doc(`students/${keepId}`).get()).data();
  for (const [field, value] of Object.entries(keepCard)) assert.deepEqual(keep[field], value, `kept card ${field}`);
  assert.equal(keep.mergedStudentIds, undefined);
  assert.equal(keep.nameAliases, undefined);
  assert.equal(keep.enrollments, undefined);
  assert.deepEqual(keep.unmergedStudentIds, [sourceId]);
  const source = (await store.doc(`students/${sourceId}`).get()).data();
  for (const [field, value] of Object.entries(sourceCard)) assert.deepEqual(source[field], value, `other card ${field}`);
  assert.equal(source.mergedInto, undefined);
  assert.equal(source.mergeUndoVersion, undefined);
  assert.deepEqual([...(await store.doc(`users/uid-stef-${t}`).get()).data().linkedStudentIds].sort(), [sourceId, 'other-card'].sort());
  assert.deepEqual((await store.doc('users/par-jel').get()).data().linkedStudentIds, [keepId]);
  assert.equal((await store.doc(`studentAvailability/${sourceId}`).get()).data().mergedInto, undefined);
  assert.equal((await store.doc(`studentAvailability/${keepId}`).get()).exists, true, 'a copied document is never deleted');
  assert.equal((await store.doc(`studentCardMerges/${sourceId}`).get()).data().status, 'unmerged');
  const audit = (await store.doc(`activityLog/student-card-unmerge-${sourceId}-${op.runId}`).get()).data();
  assert.equal(audit.type, 'student.cards_unmerged');
  assert.equal(audit.conflicts.length, 1);
  // repeated: harmless; the cards can be merged again later
  assert.equal((await unmergeStudentCards(store, { FieldValue, sourceId, apply: true, confirmed: true })).idempotent, true);
  const again = await mergeStudentCards(store, { FieldValue, keepId, sourceId });
  assert.equal(again.applied, false);
});

test('a merge made before the undo record cannot be reversed automatically', async () => {
  const store = db();
  const t = Date.now();
  const keepId = `legacy-keep-${t}`;
  const sourceId = `legacy-src-${t}`;
  await store.doc(`students/${keepId}`).set({ name: 'Eva', active: true, mergedStudentIds: [sourceId] });
  await store.doc(`students/${sourceId}`).set({ name: 'Eva', active: false, mergedInto: keepId, mergedIntoStudentId: keepId });
  await store.doc(`studentCardMerges/${sourceId}`).set({ status: 'complete', keepId, sourceId, result: {} });
  await assert.rejects(() => unmergeStudentCards(store, { FieldValue, sourceId }), (error) => error.code === 'legacy' && error.message === UNMERGE_LEGACY);
});
