'use strict';
// Merging two cards of one learner moves the account and the learner's records, keeps finance and schedule unless
// asked, and closes the other card (functions/student-merge.js).
const { test } = require('node:test');
const assert = require('node:assert/strict');
const admin = require('firebase-admin');
const { FieldValue } = require('firebase-admin/firestore');
const { mergeStudentCards } = require('./student-merge');

test('merge two student cards', async () => {
  if (!admin.apps.length) admin.initializeApp({ projectId: 'demo-keelesepp-finance' });
  const db = admin.firestore();
  const keepId = `keep-${Date.now()}`;
  const sourceId = `self_src-${Date.now()}`;
  await db.doc(`students/${keepId}`).set({ name: 'Vlad', active: true, teacher: 'Pavel' });
  await db.doc(`students/${sourceId}`).set({ name: 'Влад Повжик', active: true, email: 'v@example.com', linkedUserId: 'uid-v', studentUid: 'uid-v', linkedUserIds: ['uid-v'] });
  await db.doc('users/uid-v').set({ linkedStudentIds: [sourceId] });
  await db.collection('worksheetAssignments').add({ studentId: sourceId, lessonTitle: 'B1 test' });
  await db.collection('petProfiles').add({ studentId: sourceId, kind: 'rebane' });
  await db.collection('invoices').add({ studentId: sourceId, total: 100 });
  await db.collection('schedule').add({ studentId: keepId, time: '10:00' });
  await db.collection('groups').add({ name: 'G', studentIds: [sourceId, 'other'] });

  const preview = await mergeStudentCards(db, { FieldValue, keepId, sourceId });
  assert.equal(preview.applied, false);
  assert.deepEqual(preview.move.map((m) => m.collection).sort(), ['groups', 'petProfiles', 'worksheetAssignments']);
  assert.deepEqual(preview.waiting.map((m) => m.collection), ['invoices']);
  assert.equal((await db.doc(`students/${sourceId}`).get()).data().active, true);

  const done = await mergeStudentCards(db, { FieldValue, keepId, sourceId, apply: true, actor: { uid: 'admin' } });
  assert.equal(done.applied, true);
  const keep = (await db.doc(`students/${keepId}`).get()).data();
  const source = (await db.doc(`students/${sourceId}`).get()).data();
  assert.deepEqual(keep.linkedUserIds, ['uid-v']);
  assert.equal(keep.linkedUserId, 'uid-v');
  assert.equal(keep.email, 'v@example.com');
  assert.equal(source.active, false);
  assert.equal(source.mergedInto, keepId);
  assert.deepEqual(source.linkedUserIds, []);
  assert.equal((await db.collection('worksheetAssignments').where('studentId', '==', keepId).get()).size, 1);
  assert.equal((await db.collection('invoices').where('studentId', '==', sourceId).get()).size, 1);
  const group = (await db.collection('groups').where('studentIds', 'array-contains', keepId).get()).docs[0].data();
  assert.ok(!group.studentIds.includes(sourceId));
  assert.deepEqual((await db.doc('users/uid-v').get()).data().linkedStudentIds, [keepId]);
  await assert.rejects(() => mergeStudentCards(db, { FieldValue, keepId, sourceId, apply: true }), /already merged/);
});
