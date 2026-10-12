'use strict';
// „Ei saa tulla?” (owner 2026-10-12): a student asks to move a lesson of his own card; only the lesson's teacher (or an
// admin) answers; another student neither reads nor creates; the asker may only withdraw a pending request.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const admin = require('firebase-admin');

const PROJECT = 'demo-keelesepp-finance';
const authHost = process.env.FIREBASE_AUTH_EMULATOR_HOST;
const dbHost = process.env.FIRESTORE_EMULATOR_HOST;

async function account(role, extra = {}) {
  const r = await fetch(`http://${authHost}/identitytoolkit.googleapis.com/v1/accounts:signUp?key=demo`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: `lc-${role}-${Date.now()}-${Math.random().toString(36).slice(2)}@example.com`, password: 'emulator-only-password', returnSecureToken: true }),
  });
  const b = await r.json();
  assert.ok(b.idToken);
  const uid = JSON.parse(Buffer.from(b.idToken.split('.')[1], 'base64url')).sub;
  await admin.firestore().doc(`users/${uid}`).set({ role, ...extra });
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
const body = (data) => JSON.stringify({ fields: Object.fromEntries(Object.entries(data).map(([k, v]) => [k, enc(v)])) });
const headers = (who) => ({ Authorization: `Bearer ${who.token}`, 'Content-Type': 'application/json' });
const create = (who, id, data) => fetch(`${base()}/lessonChangeRequests?documentId=${id}`, { method: 'POST', headers: headers(who), body: body(data) }).then((r) => r.status);
const patch = (who, id, data) => fetch(`${base()}/lessonChangeRequests/${id}?${Object.keys(data).map((k) => `updateMask.fieldPaths=${k}`).join('&')}`, { method: 'PATCH', headers: headers(who), body: body(data) }).then((r) => r.status);
const read = (who, id) => fetch(`${base()}/lessonChangeRequests/${id}`, { headers: headers(who) }).then((r) => r.status);

test('lesson change requests obey the real rules', async () => {
  assert.equal(process.env.GCLOUD_PROJECT || process.env.GOOGLE_CLOUD_PROJECT, PROJECT);
  if (!admin.apps.length) admin.initializeApp({ projectId: PROJECT });
  const db = admin.firestore();
  const teacher = await account('teacher');
  const otherTeacher = await account('teacher');
  const learner = await account('student');
  const stranger = await account('student');
  await db.doc('students/lc-card').set({ name: 'Polina', linkedUserId: learner.uid, teacherUid: teacher.uid, active: true });
  await db.doc('students/lc-other').set({ name: 'Other', linkedUserId: stranger.uid, active: true });
  await db.doc('schedule/lc-lesson').set({ studentId: 'lc-card', teacherUid: teacher.uid, teacher: 'Pavel', date: '2030-01-10', time: '16:00', duration: 60, recurring: false });
  const request = (extra = {}) => ({
    scheduleId: 'lc-lesson', occurrenceDate: '2030-01-10', occurrenceTime: '16:00', duration: 60, studentId: 'lc-card', studentName: 'Polina',
    teacherUid: teacher.uid, teacherName: 'Pavel', requestedByUid: learner.uid, requestedByName: 'Polina', requestedByRole: 'student',
    proposals: [{ date: '2030-01-11', time: '15:00' }], other: '', reason: 'kunstikool', late: false, status: 'pending', createdAt: '2030-01-01T10:00:00Z', ...extra,
  });

  assert.equal(await create(learner, 'lc-1', request()), 200, 'own lesson');
  assert.equal(await create(learner, 'lc-2', request({ status: 'accepted' })), 403, 'only pending');
  assert.equal(await create(learner, 'lc-3', request({ teacherUid: otherTeacher.uid })), 403, 'the lesson\'s own teacher');
  assert.equal(await create(stranger, 'lc-4', request({ requestedByUid: stranger.uid })), 403, 'not another student\'s card');
  assert.equal(await create(learner, 'lc-5', request({ extra: 1 })), 403, 'fixed keys');

  assert.equal(await read(learner, 'lc-1'), 200);
  assert.equal(await read(teacher, 'lc-1'), 200);
  assert.equal(await read(stranger, 'lc-1'), 403);
  assert.equal(await read(otherTeacher, 'lc-1'), 403);

  assert.equal(await patch(learner, 'lc-1', { status: 'accepted' }), 403, 'the student cannot accept');
  assert.equal(await patch(otherTeacher, 'lc-1', { status: 'accepted', decidedByUid: otherTeacher.uid }), 403, 'not another teacher');
  assert.equal(await patch(teacher, 'lc-1', { status: 'accepted', chosen: { date: '2030-01-11', time: '15:00' }, decidedAt: '2030-01-02T10:00:00Z', decidedByUid: teacher.uid }), 200, 'teacher confirms');
  assert.equal(await patch(teacher, 'lc-1', { status: 'declined' }), 403, 'answered once');

  assert.equal(await create(learner, 'lc-6', request()), 200);
  assert.equal(await patch(learner, 'lc-6', { status: 'cancelled', cancelledAt: '2030-01-02T10:00:00Z' }), 200, 'the asker withdraws');
});
