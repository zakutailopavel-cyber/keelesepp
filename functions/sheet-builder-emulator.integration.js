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

test('KeeleSepp AI plugin: OAuth (register → admin consent → PKCE token) and MCP tools', async () => {
  if (!admin.apps.length) admin.initializeApp({ projectId: PROJECT });
  const crypto = require('crypto');
  const boss = await account('admin');
  const teacher = await account('teacher');
  const redirect = 'https://chatgpt.com/connector_platform_oauth_redirect';
  assert.equal((await call('/oauth/protected-resource')).body.authorization_servers[0], 'https://crm.epkoolitus.ee');
  assert.equal((await call('/oauth/authorization-server')).body.code_challenge_methods_supported[0], 'S256');
  assert.equal((await call('/oauth/register', { method: 'POST', body: { redirect_uris: ['https://evil.example/cb'] } })).status, 400, 'only ChatGPT callbacks');
  const reg = await call('/oauth/register', { method: 'POST', body: { client_name: 'ChatGPT', redirect_uris: [redirect] } });
  assert.equal(reg.status, 201);
  const clientId = reg.body.client_id;
  const verifier = crypto.randomBytes(40).toString('base64url');
  const challenge = crypto.createHash('sha256').update(verifier).digest('base64url');
  const ask = { response_type: 'code', client_id: clientId, redirect_uri: redirect, state: 'st-1', code_challenge: challenge, code_challenge_method: 'S256', scope: 'sheets' };
  assert.equal((await call('/oauth/approve', { token: teacher.token, method: 'POST', body: ask })).status, 403, 'only an administrator consents');
  assert.equal((await call(`/oauth/describe?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirect)}`, { token: boss.token })).body.clientName, 'ChatGPT');
  const approved = await call('/oauth/approve', { token: boss.token, method: 'POST', body: ask });
  assert.equal(approved.status, 200, JSON.stringify(approved.body));
  const back = new URL(approved.body.redirect);
  assert.equal(back.origin + back.pathname, redirect);
  assert.equal(back.searchParams.get('state'), 'st-1');
  const code = back.searchParams.get('code');
  const tokenCall = (body) => fetch(`${fnBase}/oauth/token`, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams(body).toString() }).then(async (r) => ({ status: r.status, body: await r.json() }));
  assert.equal((await tokenCall({ grant_type: 'authorization_code', code, client_id: clientId, redirect_uri: redirect, code_verifier: 'wrong-verifier-wrong-verifier-wrong-verifier' })).status, 400, 'PKCE');
  // the failed try used the code up: get a fresh one
  const again = new URL((await call('/oauth/approve', { token: boss.token, method: 'POST', body: ask })).body.redirect).searchParams.get('code');
  const issued = await tokenCall({ grant_type: 'authorization_code', code: again, client_id: clientId, redirect_uri: redirect, code_verifier: verifier });
  assert.equal(issued.status, 200, JSON.stringify(issued.body));
  assert.equal(issued.body.token_type, 'Bearer');
  assert.equal((await tokenCall({ grant_type: 'authorization_code', code: again, client_id: clientId, redirect_uri: redirect, code_verifier: verifier })).status, 400, 'a code works once');
  const access = issued.body.access_token;

  const mcp = async (message, token = access) => {
    const r = await fetch(`${fnBase}/mcp`, { method: 'POST', headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}), 'Content-Type': 'application/json', Accept: 'application/json, text/event-stream' }, body: JSON.stringify(message) });
    return { status: r.status, header: r.headers.get('www-authenticate'), body: r.status === 202 ? null : await r.json() };
  };
  const anon = await mcp({ jsonrpc: '2.0', id: 1, method: 'initialize', params: {} }, '');
  assert.equal(anon.status, 401);
  assert.match(anon.header, /resource_metadata="https:\/\/crm\.epkoolitus\.ee\/\.well-known\/oauth-protected-resource\/ai\/mcp"/);
  const init = await mcp({ jsonrpc: '2.0', id: 1, method: 'initialize', params: { protocolVersion: '2025-06-18', capabilities: {}, clientInfo: { name: 'test' } } });
  assert.equal(init.body.result.serverInfo.name, 'KeeleSepp AI');
  assert.equal((await mcp({ jsonrpc: '2.0', method: 'notifications/initialized' })).status, 202);
  const tools = await mcp({ jsonrpc: '2.0', id: 2, method: 'tools/list' });
  assert.ok(tools.body.result.tools.some((t) => t.name === 'save_draft'));
  const g = await mcp({ jsonrpc: '2.0', id: 3, method: 'tools/call', params: { name: 'get_guide', arguments: {} } });
  assert.ok(g.body.result.structuredContent.blocks.length > 10);
  const bad = await mcp({ jsonrpc: '2.0', id: 4, method: 'tools/call', params: { name: 'save_draft', arguments: { lessonId: 'nope', phase: 'practice', worksheetDoc: { meta: { title: 'x' }, blocks: [{ type: 'foo' }] } } } });
  assert.equal(bad.body.result.isError, true);
  const keys = (await admin.firestore().collection('sheetBuilderKeys').where('clientId', '==', clientId).get()).docs;
  assert.equal(keys.length, 1);
  assert.equal(keys[0].data().kind, 'oauth');
  assert.equal(keys[0].data().createdByUid, boss.uid);
});
