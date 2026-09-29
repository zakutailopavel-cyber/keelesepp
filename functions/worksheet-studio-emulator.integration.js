'use strict';
// Worksheet Studio end to end against the real Firestore rules (emulators):
// teacher saves a structured worksheet, assigns it, the student autosaves and submits with a per-goal score,
// the teacher points at a task live; other learners and forged fields are denied.
// Storage uploads are not covered: in CI the Storage emulator denied every rules-checked upload, even the super
// admin's (rule without Firestore reads), while the same paths work in production.
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
    body: JSON.stringify({ email: `ws-${role}-${Date.now()}-${Math.random().toString(36).slice(2)}@example.com`, password: 'emulator-only-password', returnSecureToken: true }),
  });
  const b = await r.json();
  assert.ok(b.idToken);
  const uid = JSON.parse(Buffer.from(b.idToken.split('.')[1], 'base64url')).sub;
  await admin.firestore().doc(`users/${uid}`).set({ role });
  return { token: b.idToken, uid };
}

// Firestore REST value encoding for plain JSON
function enc(v) {
  if (v === null) return { nullValue: null };
  if (Array.isArray(v)) return { arrayValue: { values: v.map(enc) } };
  if (typeof v === 'object') return { mapValue: { fields: Object.fromEntries(Object.entries(v).map(([k, x]) => [k, enc(x)])) } };
  if (typeof v === 'boolean') return { booleanValue: v };
  if (typeof v === 'number') return Number.isInteger(v) ? { integerValue: String(v) } : { doubleValue: v };
  return { stringValue: String(v) };
}
const docUrl = (path) => `http://${dbHost}/v1/projects/${PROJECT}/databases/(default)/documents/${path}`;
async function patch(who, path, data) {
  const mask = Object.keys(data).map((k) => `updateMask.fieldPaths=${encodeURIComponent(k)}`).join('&');
  const r = await fetch(`${docUrl(path)}?${mask}`, {
    method: 'PATCH', headers: { Authorization: `Bearer ${who.token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ fields: Object.fromEntries(Object.entries(data).map(([k, v]) => [k, enc(v)])) }),
  });
  return r.status;
}
async function create(who, collection, data) {
  const r = await fetch(`http://${dbHost}/v1/projects/${PROJECT}/databases/(default)/documents/${collection}`, {
    method: 'POST', headers: { Authorization: `Bearer ${who.token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ fields: Object.fromEntries(Object.entries(data).map(([k, v]) => [k, enc(v)])) }),
  });
  const b = await r.json();
  return { status: r.status, id: b.name ? b.name.split('/').pop() : '' };
}
async function roomQuery(who, studentId, roomKey) {
  const r = await fetch(`http://${dbHost}/v1/projects/${PROJECT}/databases/(default)/documents:runQuery`, {
    method: 'POST', headers: { Authorization: `Bearer ${who.token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ structuredQuery: { from: [{ collectionId: 'worksheetAssignments' }], where: { compositeFilter: { op: 'AND', filters: [
      { fieldFilter: { field: { fieldPath: 'studentId' }, op: 'EQUAL', value: { stringValue: studentId } } },
      { fieldFilter: { field: { fieldPath: 'liveRoomKey' }, op: 'EQUAL', value: { stringValue: roomKey } } },
    ] } } } }),
  });
  const b = await r.json();
  return { status: r.status, ids: Array.isArray(b) ? b.filter((x) => x.document).map((x) => x.document.name.split('/').pop()) : [] };
}
async function read(who, path) {
  return (await fetch(docUrl(path), { headers: { Authorization: `Bearer ${who.token}` } })).status;
}

const worksheetDoc = {
  schema: 'keelesepp.worksheet/2', id: 'doc-1',
  meta: { title: 'Minu päev', level: 'A2', goals: { g1: 'Saan aru väidetest.' } },
  blocks: [{ id: 'tf', type: 'truefalse', width: 'half', tone: 'green', goal: 'g1', data: { statements: [{ text: 'Päeval on pime.', answer: 'false' }] } }],
};

test('Worksheet Studio flow against the real rules', async (t) => {
  safe();
  if (!admin.apps.length) admin.initializeApp({ projectId: PROJECT });
  const db = admin.firestore();
  const teacher = await account('teacher');
  const learner = await account('student');
  const stranger = await account('student');
  await db.doc('students/st-ws-1').set({ name: 'Mari', linkedUserId: learner.uid, teacherUid: teacher.uid });
  await db.doc('students/st-ws-2').set({ name: 'Jaan', linkedUserId: stranger.uid });
  let assignmentId;


  await t.test('teacher saves the structured worksheet on a curriculum lesson; students cannot', async () => {
    const lesson = await create(teacher, 'curriculumLessons', { title: 'Minu päev', type: 'material', worksheetDoc, worksheetDocSchema: worksheetDoc.schema });
    assert.equal(lesson.status, 200);
    assert.equal(await patch(learner, `curriculumLessons/${lesson.id}`, { worksheetDoc: { ...worksheetDoc, meta: { title: 'forged' } } }), 403);
    assert.equal(await read(learner, `curriculumLessons/${lesson.id}`), 200);
  });

  await t.test('teacher assigns a snapshot; only the owning learner can read it', async () => {
    const a = await create(teacher, 'worksheetAssignments', { studentId: 'st-ws-1', studentName: 'Mari', lessonTitle: 'Minu päev', worksheetDoc, status: 'new', answers: {}, source: 'learning_library' });
    assert.equal(a.status, 200);
    assignmentId = a.id;
    assert.equal((await create(learner, 'worksheetAssignments', { studentId: 'st-ws-1', worksheetDoc, status: 'new' })).status, 403);
    assert.equal(await read(learner, `worksheetAssignments/${assignmentId}`), 200);
    assert.equal(await read(stranger, `worksheetAssignments/${assignmentId}`), 403);
  });

  await t.test('learner autosaves and submits', async () => {
    assert.equal(await patch(learner, `worksheetAssignments/${assignmentId}`, { status: 'in_progress', answers: { 'tf:0': 'false' }, updatedAt: '2026-09-29T10:00:00Z' }), 200);
    assert.equal(await patch(learner, `worksheetAssignments/${assignmentId}`, {
      status: 'done', answers: { 'tf:0': 'false', 'sp:audioUrl': 'https://files.example/rec.webm', 'sp:seconds': 42 },
      score: { correct: 1, total: 1, pct: 100, perGoal: { g1: { ok: 1, total: 1 } } }, errorLog: [], completedAt: '2026-09-29T10:05:00Z', seenByTeacher: false, updatedAt: '2026-09-29T10:05:00Z',
    }), 200);
    const stored = (await db.doc(`worksheetAssignments/${assignmentId}`).get()).data();
    assert.equal(stored.status, 'done');
    assert.equal(stored.score.perGoal.g1.ok, 1);
  });

  await t.test('teacher opens the worksheet in a live room; the learner finds it by room, strangers cannot', async () => {
    assert.equal(await patch(learner, `worksheetAssignments/${assignmentId}`, { liveRoomKey: 'inv-1' }), 403);
    assert.equal(await patch(teacher, `worksheetAssignments/${assignmentId}`, { liveRoomKey: 'inv-1', liveOpenedAt: '2026-09-29T10:02:00Z' }), 200);
    const mine = await roomQuery(learner, 'st-ws-1', 'inv-1');
    assert.equal(mine.status, 200);
    assert.deepEqual(mine.ids, [assignmentId]);
    assert.equal((await roomQuery(stranger, 'st-ws-1', 'inv-1')).status, 403);
  });

  await t.test('only staff can point at a task or change the worksheet snapshot', async () => {
    assert.equal(await patch(learner, `worksheetAssignments/${assignmentId}`, { liveFocus: { blockId: 'tf', at: 'x' } }), 403);
    assert.equal(await patch(learner, `worksheetAssignments/${assignmentId}`, { worksheetDoc: { ...worksheetDoc, blocks: [] } }), 403);
    assert.equal(await patch(stranger, `worksheetAssignments/${assignmentId}`, { answers: {} }), 403);
    assert.equal(await patch(teacher, `worksheetAssignments/${assignmentId}`, { liveFocus: { blockId: 'tf', at: '2026-09-29T10:01:00Z' } }), 200);
  });

});
