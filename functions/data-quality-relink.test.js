'use strict';
// relinkDataQualityRecord (POST /data-quality/relink): a lesson / invoice / homework record moves to an active card only.
// Regression: since 2026-11-06 the card check referenced an undefined `cleanRelationship` and every real relink threw
// a ReferenceError (500). Firestore is replaced by an in-memory transaction; nothing is written anywhere.
const test = require('node:test');
const assert = require('node:assert/strict');
const rewire = require('rewire');
const api = rewire('./index.js');
const relink = api.__get__('relinkDataQualityRecord');

const ADMIN = { decoded: { uid: 'admin', email: 'admin@example.com' }, profile: { displayName: 'Admin', role: 'admin' }, roles: new Set(['admin']) };

function harness(t, { student = { name: 'Anna', active: true } } = {}) {
  const docs = {
    'lessons/l1': { studentId: 'old', date: '2026-11-03' },
    'students/s1': student,
  };
  const writes = [];
  const ref = (path) => ({ path, id: path.split('/').pop() });
  const restore = api.__set__({
    db: {
      collection: (name) => ({ doc: (id) => ref(`${name}/${id}`) }),
      runTransaction: async (fn) => fn({
        get: async (r) => ({ id: r.id, exists: docs[r.path] != null, data: () => docs[r.path] }),
        set: (r, data) => writes.push({ op: 'set', path: r.path, data }),
        create: (r, data) => writes.push({ op: 'create', path: r.path, data }),
      }),
    },
    assertFinancialDateOpen: async () => {},
  });
  t.after(restore);
  const call = () => relink({ actor: ADMIN, entityType: 'lesson', entityId: 'l1', studentId: 's1', requestId: 'relink-test-0001' });
  return { call, writes };
}

test('relink moves a lesson to an active card and writes the audit entry', async t => {
  const h = harness(t);
  const result = await h.call();
  assert.deepEqual(result, { idempotent: false, entityId: 'l1', studentId: 's1' });
  assert.equal(h.writes.find(w => w.path === 'lessons/l1').data.studentId, 's1');
  assert.equal(h.writes.find(w => w.op === 'create').data.action, 'lesson.student_link_corrected');
});

test('relink refuses an archived, trashed or merged card and writes nothing', async t => {
  for (const [student, status] of [
    [{ name: 'Anna', active: false }, 404],
    [{ name: 'Anna', active: true, deletedAt: '2026-11-01' }, 409],
    [{ name: 'Anna', active: true, mergedIntoStudentId: 's2' }, 409],
    [null, 404],
  ]) {
    const h = harness(t, { student });
    await assert.rejects(h.call(), (error) => error.status === status);
    assert.equal(h.writes.length, 0);
  }
});
