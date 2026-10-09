'use strict';
// Lesson recordings against the real Firestore rules: only the room's teacher, only with the student's consent,
// only segments/status from the browser; the transcript is the worker's (Admin SDK). Student reads their own.
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
    body: JSON.stringify({ email: `rec-${role}-${Date.now()}-${Math.random().toString(36).slice(2)}@example.com`, password: 'emulator-only-password', returnSecureToken: true }),
  });
  const b = await r.json();
  const uid = JSON.parse(Buffer.from(b.idToken.split('.')[1], 'base64url')).sub;
  await admin.firestore().doc(`users/${uid}`).set({ role });
  return { token: b.idToken, uid };
}
const enc = (v) => (Array.isArray(v) ? { arrayValue: { values: v.map(enc) } }
  : v && typeof v === 'object' ? { mapValue: { fields: Object.fromEntries(Object.entries(v).map(([k, x]) => [k, enc(x)])) } }
  : typeof v === 'number' ? { integerValue: String(v) } : { stringValue: String(v) });
const fields = (o) => Object.fromEntries(Object.entries(o).map(([k, v]) => [k, enc(v)]));
async function create(who, id, data) {
  const r = await fetch(`${base}/lessonRecordings?documentId=${encodeURIComponent(id)}`, { method: 'POST', headers: { Authorization: `Bearer ${who.token}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ fields: fields(data) }) });
  return r.status;
}
async function patch(who, id, data) {
  const mask = Object.keys(data).map((k) => `updateMask.fieldPaths=${k}`).join('&');
  const r = await fetch(`${base}/lessonRecordings/${id}?${mask}`, { method: 'PATCH', headers: { Authorization: `Bearer ${who.token}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ fields: fields(data) }) });
  return r.status;
}
const read = async (who, id) => (await fetch(`${base}/lessonRecordings/${id}`, { headers: { Authorization: `Bearer ${who.token}` } })).status;

test('lesson recordings follow consent and roles', async () => {
  assert.equal(process.env.GCLOUD_PROJECT || process.env.GOOGLE_CLOUD_PROJECT, PROJECT);
  if (!admin.apps.length) admin.initializeApp({ projectId: PROJECT });
  const db = admin.firestore();
  const teacher = await account('teacher');
  const other = await account('teacher');
  const learner = await account('student');
  const stranger = await account('student');
  await db.doc('students/st-rec').set({ name: 'Mari', linkedUserId: learner.uid, teacherUid: teacher.uid, recordingConsent: true });
  await db.doc('students/st-norec').set({ name: 'Jaan', linkedUserId: stranger.uid, teacherUid: teacher.uid });
  await db.doc('liveLessonInvitations/inv-ok').set({ teacherUid: teacher.uid, studentId: 'st-rec', studentUid: learner.uid, status: 'accepted' });
  await db.doc('liveLessonInvitations/inv-no').set({ teacherUid: teacher.uid, studentId: 'st-norec', studentUid: stranger.uid, status: 'accepted' });
  const rec = (inv, sid, suid, extra = {}) => ({ invitationId: inv, teacherUid: teacher.uid, teacherName: 'Kati', studentId: sid, studentUid: suid, studentName: 'Mari', title: 'Eesti keel', language: 'et', status: 'recording', segments: [], startedAt: '2026-09-29T10:00:00Z', updatedAt: '2026-09-29T10:00:00Z', ...extra });

  assert.equal(await create(teacher, 'inv-no_1', rec('inv-no', 'st-norec', stranger.uid)), 403, 'no consent');
  assert.equal(await create(other, 'inv-ok_1', { ...rec('inv-ok', 'st-rec', learner.uid), teacherUid: other.uid }), 403, 'not the room teacher');
  assert.equal(await create(teacher, 'something_1', rec('inv-ok', 'st-rec', learner.uid)), 403, 'id must belong to the invitation');
  assert.equal(await create(teacher, 'inv-ok_1', rec('inv-ok', 'st-rec', learner.uid, { status: 'done' })), 403, 'starts as recording');
  assert.equal(await create(teacher, 'inv-ok_1', rec('inv-ok', 'st-rec', learner.uid)), 200);

  assert.equal(await patch(teacher, 'inv-ok_1', { segments: [{ track: 'teacher', seq: 0, path: 'lessonRecordings/inv-ok_1/teacher_000.webm', startMs: 0, durationMs: 300000 }], updatedAt: '2026-09-29T10:05:00Z' }), 200);
  assert.equal(await patch(teacher, 'inv-ok_1', { transcript: [{ speaker: 'student', text: 'forged' }] }), 403, 'transcript is the worker\'s');
  assert.equal(await patch(learner, 'inv-ok_1', { status: 'uploaded' }), 403);
  assert.equal(await read(learner, 'inv-ok_1'), 200);
  assert.equal(await read(stranger, 'inv-ok_1'), 403);
  assert.equal(await read(other, 'inv-ok_1'), 403);
  assert.equal(await patch(teacher, 'inv-ok_1', { status: 'uploaded', endedAt: '2026-09-29T11:00:00Z' }), 200);
  assert.equal(await read(learner, 'inv-ok_1'), 403, 'a finished recording (and later its transcript) is the teacher\'s');
  assert.equal(await read(teacher, 'inv-ok_1'), 200);
  assert.equal(await patch(teacher, 'inv-ok_1', { status: 'recording' }), 403, 'finished recordings are closed');
  // the student (or linked parent) answers the consent question themselves, signed with their own uid
  const consentPatch = async (who, studentId, data) => {
    const mask = Object.keys(data).map((k) => `updateMask.fieldPaths=${k}`).join('&');
    const body = { fields: Object.fromEntries(Object.entries(data).map(([k, v]) => [k, typeof v === 'boolean' ? { booleanValue: v } : { stringValue: String(v) }])) };
    const r = await fetch(`${base}/students/${studentId}?${mask}`, { method: 'PATCH', headers: { Authorization: `Bearer ${who.token}`, 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    return r.status;
  };
  const own = (who, value) => ({ recordingConsent: value, recordingConsentAt: '2026-10-04T10:00:00Z', recordingConsentBy: 'Jaan', recordingConsentByUid: who.uid });
  assert.equal(await consentPatch(stranger, 'st-norec', { recordingConsent: true }), 403, 'unsigned consent');
  assert.equal(await consentPatch(stranger, 'st-norec', { ...own(stranger, true), recordingConsentByUid: teacher.uid }), 403, 'signed as someone else');
  assert.equal(await consentPatch(stranger, 'st-norec', { ...own(stranger, true), level: 'C1' }), 403, 'other fields stay closed');
  assert.equal(await consentPatch(stranger, 'st-norec', { ...own(stranger, 'yes') }), 403, 'boolean only');
  assert.equal(await consentPatch(stranger, 'st-rec', own(stranger, false)), 403, 'not their card');
  assert.equal(await consentPatch(stranger, 'st-norec', own(stranger, true)), 200, 'own card, own answer');
  assert.equal(await consentPatch(stranger, 'st-norec', own(stranger, false)), 200, 'can withdraw');
});

test('transcriber heartbeat: staff read, nobody writes from the browser', async () => {
  if (!admin.apps.length) admin.initializeApp({ projectId: PROJECT });
  const teacher = await account('teacher');
  const learner = await account('student');
  await admin.firestore().doc('transcriberStatus/kooli-mac').set({ host: 'Kooli-Mac', state: 'idle', lastSeenAt: '2026-10-04T10:00:00Z' });
  const get = async (who) => (await fetch(`${base}/transcriberStatus/kooli-mac`, { headers: { Authorization: `Bearer ${who.token}` } })).status;
  assert.equal(await get(teacher), 200);
  assert.equal(await get(learner), 403);
  const r = await fetch(`${base}/transcriberStatus/kooli-mac?updateMask.fieldPaths=lastSeenAt`, { method: 'PATCH', headers: { Authorization: `Bearer ${teacher.token}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ fields: fields({ lastSeenAt: '2030-01-01T00:00:00Z' }) }) });
  assert.equal(r.status, 403, 'only the worker writes the heartbeat');
});

test('a teacher asks the school Mac for sentences; only the asker reads the answer', async () => {
  if (!admin.apps.length) admin.initializeApp({ projectId: PROJECT });
  const teacher = await account('teacher');
  const other = await account('teacher');
  const learner = await account('student');
  const ask = (who, data) => fetch(`${base}/aiRequests`, { method: 'POST', headers: { Authorization: `Bearer ${who.token}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ fields: data }) });
  const ok = { kind: { stringValue: 'sentences' }, topic: { stringValue: 'Minu pere' }, level: { stringValue: 'A2' }, grammar: { stringValue: 'osastav' }, count: { integerValue: '8' }, createdBy: { stringValue: teacher.uid }, createdAt: { stringValue: '2026-10-10T10:00:00Z' }, status: { stringValue: 'new' } };
  const res = await ask(teacher, ok);
  assert.equal(res.status, 200);
  const id = (await res.json()).name.split('/').pop();
  assert.equal((await ask(learner, { ...ok, createdBy: { stringValue: learner.uid } })).status, 403, 'students cannot ask');
  assert.equal((await ask(teacher, { ...ok, createdBy: { stringValue: other.uid } })).status, 403, 'only for oneself');
  assert.equal((await ask(teacher, { ...ok, status: { stringValue: 'done' } })).status, 403, 'starts as new');
  assert.equal((await ask(teacher, { ...ok, count: { integerValue: '50' } })).status, 403, 'at most 12');
  assert.equal((await ask(teacher, { ...ok, result: { stringValue: 'forged' } })).status, 403, 'the answer is the Mac\'s');
  const get = (who) => fetch(`${base}/aiRequests/${id}`, { headers: { Authorization: `Bearer ${who.token}` } }).then((r) => r.status);
  assert.equal(await get(teacher), 200);
  assert.equal(await get(other), 403);
  assert.equal(await get(learner), 403);
  const patchRes = await fetch(`${base}/aiRequests/${id}?updateMask.fieldPaths=status`, { method: 'PATCH', headers: { Authorization: `Bearer ${teacher.token}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ fields: { status: { stringValue: 'done' } } }) });
  assert.equal(patchRes.status, 403, 'the browser does not answer');
});

test('the pet lesson numbers: the learner reads his own, nobody writes from the browser', async () => {
  if (!admin.apps.length) admin.initializeApp({ projectId: PROJECT });
  const teacher = await account('teacher');
  const learner = await account('student');
  const other = await account('student');
  await admin.firestore().doc('petLessonStats/les-1').set({ studentId: 's1', studentUid: learner.uid, share: 70, practice: [] });
  const get = (who) => fetch(`${base}/petLessonStats/les-1`, { headers: { Authorization: `Bearer ${who.token}` } }).then((r) => r.status);
  assert.equal(await get(learner), 200);
  assert.equal(await get(teacher), 200);
  assert.equal(await get(other), 403);
  const forged = await fetch(`${base}/petLessonStats?documentId=les-2`, { method: 'POST', headers: { Authorization: `Bearer ${learner.token}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ fields: { studentUid: { stringValue: learner.uid }, share: { integerValue: '100' } } }) });
  assert.equal(forged.status, 403);
  const list = await fetch(`${base}:runQuery`, { method: 'POST', headers: { Authorization: `Bearer ${learner.token}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ structuredQuery: { from: [{ collectionId: 'petLessonStats' }], where: { fieldFilter: { field: { fieldPath: 'studentUid' }, op: 'EQUAL', value: { stringValue: learner.uid } } } } }) });
  assert.equal(list.status, 200);
});
