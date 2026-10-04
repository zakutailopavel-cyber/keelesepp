'use strict';
// Child lesson worksheets against the real Firestore rules. The test keeps the
// legacy curriculum lesson document intact and verifies immutable history.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const admin = require('firebase-admin');

const PROJECT = 'demo-keelesepp-finance';
const authHost = process.env.FIREBASE_AUTH_EMULATOR_HOST;
const dbHost = process.env.FIRESTORE_EMULATOR_HOST;

function safe() {
  assert.equal(process.env.GCLOUD_PROJECT || process.env.GOOGLE_CLOUD_PROJECT, PROJECT);
  for (const host of [authHost, dbHost]) assert.match(host || '', /^(127\.0\.0\.1|localhost):\d+$/);
}

async function account(role) {
  const response = await fetch(`http://${authHost}/identitytoolkit.googleapis.com/v1/accounts:signUp?key=demo`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: `lesson-ws-${role}-${Date.now()}-${Math.random().toString(36).slice(2)}@example.com`, password: 'emulator-only-password', returnSecureToken: true }),
  });
  const body = await response.json();
  assert.ok(body.idToken);
  const uid = JSON.parse(Buffer.from(body.idToken.split('.')[1], 'base64url')).sub;
  await admin.firestore().doc(`users/${uid}`).set({ role });
  return { token: body.idToken, uid };
}

function enc(value) {
  if (value === null) return { nullValue: null };
  if (Array.isArray(value)) return { arrayValue: { values: value.map(enc) } };
  if (typeof value === 'object') return { mapValue: { fields: Object.fromEntries(Object.entries(value).map(([key, item]) => [key, enc(item)])) } };
  if (typeof value === 'boolean') return { booleanValue: value };
  if (typeof value === 'number') return Number.isInteger(value) ? { integerValue: String(value) } : { doubleValue: value };
  return { stringValue: String(value) };
}

const docUrl = (path) => `http://${dbHost}/v1/projects/${PROJECT}/databases/(default)/documents/${path}`;
const headers = (who) => ({ ...(who ? { Authorization: `Bearer ${who.token}` } : {}), 'Content-Type': 'application/json' });

async function patch(who, path, data) {
  const mask = Object.keys(data).map((key) => `updateMask.fieldPaths=${encodeURIComponent(key)}`).join('&');
  return (await fetch(`${docUrl(path)}?${mask}`, {
    method: 'PATCH',
    headers: headers(who),
    body: JSON.stringify({ fields: Object.fromEntries(Object.entries(data).map(([key, value]) => [key, enc(value)])) }),
  })).status;
}

async function read(who, path) {
  return (await fetch(docUrl(path), { headers: headers(who) })).status;
}

async function remove(who, path) {
  return (await fetch(docUrl(path), { method: 'DELETE', headers: headers(who) })).status;
}

const worksheetDoc = {
  schema: 'keelesepp.worksheet/2',
  id: 'generated-practice',
  meta: { title: 'Harjuta', level: 'A2', goals: { time: 'Kasutan ajamäärusi.' } },
  blocks: [{ id: 'gap-1', type: 'gaps', width: 'full', tone: 'green', goal: 'time', data: { title: 'Täida', instruction: 'Kirjuta.', sentences: 'Ma tulen [pärast] tööd.' } }],
};

test('lesson worksheet child records and versions obey the real rules', async (t) => {
  safe();
  if (!admin.apps.length) admin.initializeApp({ projectId: PROJECT });
  const db = admin.firestore();
  const teacher = await account('teacher');
  const learner = await account('student');
  const lessonId = `lesson-ws-${Date.now()}`;
  await db.doc(`curriculumLessons/${lessonId}`).set({ title: 'Ajamäärused', worksheetDoc: { legacy: true } });
  const childPath = `curriculumLessons/${lessonId}/worksheets/practice`;
  const record = {
    schema: 'keelesepp.lesson-worksheet/1', lessonId, worksheetId: 'practice', role: 'practice', slot: 2,
    title: 'Harjuta', displayLabel: '2 Harjuta', source: 'generated', worksheetDoc,
    worksheetDocStatus: 'draft', worksheetDocVersion: 1, worksheetDocUpdatedAt: '2026-10-02T12:00:00Z',
    createdAt: '2026-10-02T12:00:00Z', createdBy: teacher.uid, updatedAt: '2026-10-02T12:00:00Z', updatedBy: teacher.uid,
  };

  await t.test('staff creates and updates; signed-in learner reads but cannot write or delete', async () => {
    assert.equal(await patch(teacher, childPath, record), 200);
    assert.equal(await read(teacher, childPath), 200);
    assert.equal(await read(learner, childPath), 200);
    assert.equal(await patch(teacher, childPath, { title: 'Harjuta uuesti' }), 200);
    assert.equal(await patch(learner, childPath, { title: 'Võltsitud' }), 403);
    assert.equal(await remove(learner, childPath), 403);
  });

  await t.test('anonymous users cannot read or write child worksheets', async () => {
    assert.equal(await read(null, childPath), 403);
    assert.equal(await patch(null, `${childPath}-anonymous`, record), 403);
  });

  await t.test('version records are staff-created and immutable', async () => {
    const versionPath = `worksheetVersions/${lessonId}_practice_studio_v1`;
    assert.equal(await patch(teacher, versionPath, { lessonId, worksheetId: 'practice', role: 'practice', version: 1, status: 'draft', worksheetDoc }), 200);
    assert.equal(await read(teacher, versionPath), 200);
    assert.equal(await patch(teacher, versionPath, { status: 'published' }), 403);
    assert.equal(await remove(teacher, versionPath), 403);
    assert.equal(await patch(learner, `${versionPath}_learner`, { lessonId, worksheetId: 'practice', version: 1 }), 403);
  });

  await t.test('legacy lesson fields were not changed by child writes', async () => {
    const lesson = (await db.doc(`curriculumLessons/${lessonId}`).get()).data();
    assert.deepEqual(lesson.worksheetDoc, { legacy: true });
  });
});
