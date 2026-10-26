'use strict';
// The ChatGPT worksheet connector against the emulators: an administrator creates a key; the key reads the guide and the
// lessons, a bad sheet is refused with the constructor's errors, a good one is saved as the DRAFT (the published sheet
// stays), the version history and the lesson summary follow; a revoked key and the browser cannot get the keys.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const admin = require('firebase-admin');

const PROJECT = 'demo-keelesepp-finance';
const authHost = process.env.FIREBASE_AUTH_EMULATOR_HOST;
const dbHost = process.env.FIRESTORE_EMULATOR_HOST;
const fnBase = `http://127.0.0.1:5001/${PROJECT}/us-central1/sheetBuilderApi`;

async function account(role) {
  const r = await fetch(`http://${authHost}/identitytoolkit.googleapis.com/v1/accounts:signUp?key=demo`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: `sb-${role}-${Date.now()}-${Math.random().toString(36).slice(2)}@mail.ee`, password: 'emulator-only-password', returnSecureToken: true }),
  });
  const b = await r.json();
  const uid = JSON.parse(Buffer.from(b.idToken.split('.')[1], 'base64url')).sub;
  await admin.firestore().doc(`users/${uid}`).set({ role, roles: [role], displayName: 'Pavel', approvalStatus: 'approved' });
  return { token: b.idToken, uid };
}
const call = async (path, { token, method = 'GET', body } = {}) => {
  const r = await fetch(`${fnBase}${path}`, { method, headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}), 'Content-Type': 'application/json' }, ...(body ? { body: JSON.stringify(body) } : {}) });
  return { status: r.status, body: await r.json().catch(() => ({})) };
};

const goodSheet = {
  schema: 'keelesepp.worksheet/2',
  meta: { title: 'Minu nädal', level: 'A2', goals: { g_1: 'Ma oskan rääkida oma nädalast.' } },
  blocks: [{ type: 'gaps', goal: 'g_1', data: { title: 'Täienda laused.', instruction: 'Kirjuta sobiv sõna.', bank: 'esmaspäeval, reedel', showBank: 'yes', sentences: 'Ma lähen [esmaspäeval] tööle.\nMa puhkan [reedel].' } }],
};

test('ChatGPT connector: keys, guide, lessons, check and draft', async () => {
  if (!admin.apps.length) admin.initializeApp({ projectId: PROJECT });
  const db = admin.firestore();
  const boss = await account('admin');
  const teacher = await account('teacher');
  const lessonId = `sb-lesson-${Date.now()}`;
  const published = { schema: 'keelesepp.worksheet/2', meta: { title: 'Avaldatud' }, blocks: [] };
  await db.doc(`curriculumLessons/${lessonId}`).set({ title: 'Minu nädal', level: 'A2', roadmapManaged: true, roadmapModuleNumber: 1, roadmapModuleTitle: 'Igapäevaelu', roadmapLessonNumber: 3, goal: 'Räägin oma nädalast.' });
  await db.doc(`curriculumLessons/${lessonId}/worksheets/practice`).set({ worksheetDoc: published, publishedWorksheetDoc: published, publishedWorksheetDocVersion: 4, worksheetDocVersion: 4, worksheetDocStatus: 'published', createdAt: '2026-10-01', createdBy: 'human' });

  assert.equal((await call('/guide')).status, 401, 'no key');
  assert.equal((await call('/keys', { token: teacher.token, method: 'POST', body: { label: 'x' } })).status, 403, 'only an administrator makes keys');
  const made = await call('/keys', { token: boss.token, method: 'POST', body: { label: 'Pavel GPT' } });
  assert.equal(made.status, 200);
  assert.match(made.body.key, /^kss_/);
  const key = made.body.key;
  const stored = await db.doc(`sheetBuilderKeys/${made.body.id}`).get();
  assert.equal(stored.data().label, 'Pavel GPT');
  assert.equal(JSON.stringify(stored.data()).includes(key), false, 'only the hash is stored');

  // the browser cannot read the keys (rules catch-all)
  const rest = await fetch(`http://${dbHost}/v1/projects/${PROJECT}/databases/(default)/documents/sheetBuilderKeys/${made.body.id}`, { headers: { Authorization: `Bearer ${boss.token}` } });
  assert.equal(rest.status, 403);

  const g = await call('/guide', { token: key });
  assert.equal(g.status, 200);
  assert.ok(g.body.blocks.some((b) => b.type === 'gaps'));
  assert.equal((await call('/blocks/gaps', { token: key })).body.example.sentences.includes('['), true);
  const books = await call('/textbooks', { token: key });
  assert.ok(books.body.books.some((b) => b.id === 'e-nagu-eesti' && b.license === 'unconfirmed'));
  assert.equal((await call('/textbooks/e-nagu-eesti', { token: key })).body.chapters.find((c) => c.n === 1).pages[0], 10);
  const lessons = await call(`/lessons?level=A2&q=${encodeURIComponent('Minu nädal')}`, { token: key });
  assert.ok(lessons.body.lessons.some((l) => l.id === lessonId));
  const detail = await call(`/lessons/${lessonId}?phase=practice`, { token: key });
  assert.equal(detail.body.worksheetDoc.meta.title, 'Avaldatud');

  const bad = await call('/drafts', { token: key, method: 'POST', body: { lessonId, phase: 'practice', worksheetDoc: { meta: { title: 'x' }, blocks: [{ type: 'foo' }] } } });
  assert.equal(bad.status, 422);
  assert.ok(bad.body.details.errors.some((e) => e.includes('foo')));
  const checked = await call('/check', { token: key, method: 'POST', body: { worksheetDoc: goodSheet } });
  assert.equal(checked.body.ready, true, JSON.stringify(checked.body));

  const saved = await call('/drafts', { token: key, method: 'POST', body: { lessonId, phase: 'practice', worksheetDoc: goodSheet, note: 'õpik lk 38' } });
  assert.equal(saved.status, 200, JSON.stringify(saved.body));
  assert.equal(saved.body.version, 5);
  assert.match(saved.body.editorUrl, new RegExp(`/library/lessons/${lessonId}/worksheets/practice$`));
  const sheet = (await db.doc(`curriculumLessons/${lessonId}/worksheets/practice`).get()).data();
  assert.equal(sheet.worksheetDoc.meta.title, 'Minu nädal');
  assert.equal(sheet.worksheetDocStatus, 'draft');
  assert.equal(sheet.publishedWorksheetDoc.meta.title, 'Avaldatud', 'students still see the published sheet');
  assert.equal(sheet.createdBy, 'human');
  assert.equal(sheet.contentOrigin.kind, 'gpt-connector');
  assert.equal(sheet.contentOrigin.author, 'KeeleSepp AI');
  const v5 = (await db.doc(`worksheetVersions/${lessonId}_practice_studio_v5`).get()).data();
  assert.equal(v5.note, 'õpik lk 38');
  assert.equal(v5.createdByName, 'KeeleSepp AI (Pavel GPT)');
  assert.equal((await db.doc(`curriculumLessons/${lessonId}`).get()).data().worksheetPhases.practice.publishedVersion, 4);

  assert.equal((await call('/keys/revoke', { token: boss.token, method: 'POST', body: { id: made.body.id } })).status, 200);
  assert.equal((await call('/guide', { token: key })).status, 401, 'a revoked key stops working');
  assert.equal((await call('/openapi.json')).body.paths['/drafts'].post.operationId, 'saveDraft');
});
