'use strict';
// Route tests for the parent's „Konto” block (staffOperationsApi): /accounts/invite with { parentUid } and
// /accounts/auth-info. Firebase, Firestore and the mail delivery are replaced; no e-mail is ever sent.
const test = require('node:test');
const assert = require('node:assert/strict');
const rewire = require('rewire');
const api = rewire('./index.js');

const ADMIN = { decoded: { uid: 'admin', email: 'admin@example.com' }, profile: { displayName: 'Admin', role: 'admin' }, roles: new Set(['admin']) };

function harness(t, { profile = { role: 'parent', displayName: 'Mari Tamm' }, authUser = { uid: 'p1', email: 'mari@example.ee' }, requireAdminUser, users = [] } = {}) {
  const events = { mails: [], audit: [], links: [] };
  const cards = [{ id: 's1', data: () => ({ name: 'Anna', active: true }) }, { id: 's2', data: () => ({ name: 'Old', active: false }) }];
  const restore = api.__set__({
    requireAdminUser: requireAdminUser || (async () => ADMIN),
    db: { collection(name) {
      if (name === 'users') return { doc: () => ({ get: async () => ({ exists: true, data: () => profile }) }) };
      if (name === 'students') return { where: () => ({ get: async () => ({ docs: cards }) }) };
      if (name === 'activityLog') return { add: async (entry) => { events.audit.push(entry); } };
      throw new Error(`unexpected collection ${name}`);
    } },
    admin: { auth: () => ({
      getUser: async (uid) => { if (!authUser || authUser.uid !== uid) throw new Error('not found'); return authUser; },
      getUsers: async (ids) => ({ users: users.filter(user => ids.some(id => id.uid === user.uid)), notFound: [] }),
      generatePasswordResetLink: async (email) => { events.links.push(email); return `https://reset.example/${email}`; },
    }) },
    deliverEmail: async (message) => { events.mails.push(message); return { status: 'sent' }; },
    FieldValue: { serverTimestamp: () => 'now' },
  });
  t.after(restore);
  const call = (path, body) => new Promise((resolve, reject) => {
    const res = { headers: {}, set(k, v) { this.headers[k] = v; return this; }, status(code) { this.statusCode = code; return this; }, json(value) { resolve({ status: this.statusCode || 200, body: value, headers: this.headers }); } };
    api.staffOperationsApi({ method: 'POST', path, body, get: () => 'https://crm.epkoolitus.ee', headers: {} }, res).catch(reject);
  });
  return { call, events };
}

test('„Saada parooli link” for a parent: own login e-mail, the invite e-mail and the same audit action', async t => {
  const h = harness(t);
  const result = await h.call('/accounts/invite', { parentUid: 'p1', email: 'someone-else@example.ee' });
  assert.equal(result.status, 200);
  assert.deepEqual(result.body, { uid: 'p1', email: 'mari@example.ee', created: false, mailed: true, mailStatus: 'sent', link: 'https://reset.example/mari@example.ee' });
  assert.deepEqual(h.events.links, ['mari@example.ee']);
  assert.equal(h.events.mails.length, 1);
  assert.equal(h.events.mails[0].to, 'mari@example.ee');
  assert.match(h.events.mails[0].text, /Lapsed: Anna\n/);
  assert.equal(h.events.audit[0].action, 'account_password_link');
  assert.equal(h.events.audit[0].targetUid, 'p1');
  assert.equal(h.events.audit[0].relationship, 'parent');
  assert.equal(h.events.audit[0].actor.uid, 'admin');
});

test('a student or staff account gets no link through the parent path', async t => {
  for (const profile of [{ role: 'student' }, { role: 'parent', roles: ['parent', 'teacher'] }]) {
    await t.test(JSON.stringify(profile), async sub => {
      const h = harness(sub, { profile });
      const result = await h.call('/accounts/invite', { parentUid: 'p1' });
      assert.equal(result.status, 409);
      assert.equal(h.events.mails.length, 0);
      assert.equal(h.events.links.length, 0);
      assert.equal(h.events.audit.length, 0);
    });
  }
});

test('an unknown parent account: 404, nothing sent', async t => {
  const h = harness(t, { authUser: null });
  const result = await h.call('/accounts/invite', { parentUid: 'nobody' });
  assert.equal(result.status, 404);
  assert.equal(h.events.mails.length, 0);
});

test('only an administrator reaches either route', async t => {
  const h = harness(t, { requireAdminUser: async () => { throw Object.assign(new Error('Administrator access required'), { status: 403 }); } });
  for (const [path, body] of [['/accounts/invite', { parentUid: 'p1' }], ['/accounts/auth-info', { uids: ['p1'] }]]) {
    const result = await h.call(path, body);
    assert.equal(result.status, 403);
  }
  assert.equal(h.events.mails.length, 0);
});

test('auth-info: only the sign-in facts, missing accounts marked, no caching', async t => {
  const h = harness(t, { users: [{ uid: 'p1', email: 'mari@example.ee', emailVerified: false, passwordHash: 'x', providerData: [{ providerId: 'google.com' }], metadata: { lastSignInTime: 'Tue, 03 Nov 2026 08:00:00 GMT', creationTime: 'Mon, 01 Jan 2024 00:00:00 GMT' } }] });
  const result = await h.call('/accounts/auth-info', { uids: ['p1', 'gone'] });
  assert.equal(result.status, 200);
  assert.equal(result.headers['Cache-Control'], 'no-store');
  assert.deepEqual(result.body.accounts, [
    { uid: 'p1', found: true, email: 'mari@example.ee', methods: ['password', 'google'], emailVerified: false, disabled: false, createdAt: '2024-01-01T00:00:00.000Z', lastSignInAt: '2026-11-03T08:00:00.000Z', lastActiveAt: '' },
    { uid: 'gone', found: false },
  ]);
  assert.equal(JSON.stringify(result.body).includes('passwordHash'), false);
  const bad = await h.call('/accounts/auth-info', { uids: [] });
  assert.equal(bad.status, 400);
});
