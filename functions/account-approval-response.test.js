'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const rewire = require('rewire');
const api = rewire('./index.js');

function deferred() {
  let resolve, reject;
  const promise = new Promise((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
}

function approvalHarness(t, { status = 'pending', decision = 'approve', mail } = {}) {
  const events = [];
  const response = deferred();
  const profile = { email: 'student@example.com', displayName: 'Mari', role: 'student', approvalStatus: status };
  const restore = api.__set__({
    requireAdminUser: async () => ({ decoded: { uid: 'admin', email: 'admin@example.com' }, profile: { displayName: 'Admin', role: 'admin' }, roles: new Set(['admin']) }),
    db: { collection(name) {
      if (name === 'users') return { doc: () => ({ get: async () => ({ exists: true, data: () => profile }), update: async () => { events.push('profile'); } }) };
      if (name === 'activityLog') return { add: async () => { events.push('audit'); } };
      throw new Error(`unexpected collection ${name}`);
    } },
    admin: { auth: () => ({ getUser: async () => ({ uid: 'student', email: profile.email }) }) },
    bootstrapCurrentAccount: async () => { events.push('bootstrap'); return { linkedStudentIds: ['card-1'], createdStudentIds: [] }; },
    deliverEmail: async () => { events.push('mail'); return mail ? mail() : { status: 'sent' }; },
    console: { error: (...args) => { events.push('mail-error'); assert.equal(args[0], 'approval e-mail failed'); } },
  });
  t.after(restore);
  const res = { headers: {}, set(k, v) { this.headers[k] = v; return this; }, status(code) { this.statusCode = code; return this; }, json(value) { events.push('response'); response.resolve(value); } };
  const req = { method: 'POST', path: '/accounts/approval', body: { uid: 'student', decision }, get: () => 'https://crm.epkoolitus.ee' };
  const completion = api.staffOperationsApi(req, res);
  return { response: response.promise, completion, events, res };
}

test('approval response precedes a stalled SMTP delivery and includes CORS', { timeout: 2000 }, async t => {
  const smtp = deferred();
  const h = approvalHarness(t, { mail: () => smtp.promise });
  const result = await h.response;
  assert.deepEqual(h.events, ['profile', 'bootstrap', 'audit', 'response', 'mail']);
  assert.equal(result.approvalStatus, 'approved');
  assert.deepEqual(result.linkedStudentIds, ['card-1']);
  assert.equal(result.mailed, false);
  assert.equal(result.mailPending, true);
  assert.equal(h.res.headers['Access-Control-Allow-Origin'], 'https://crm.epkoolitus.ee');
  smtp.resolve({ status: 'sent' });
  await h.completion;
  assert.equal(h.events.filter(e => e === 'response').length, 1);
});

test('SMTP failure is logged after the successful approval response, without a second response', async t => {
  const h = approvalHarness(t, { mail: async () => { throw new Error('SMTP timeout'); } });
  const result = await h.response;
  await h.completion;
  assert.equal(result.mailed, false);
  assert.equal(result.approvalStatus, 'approved');
  assert.ok(h.events.includes('mail-error'));
  assert.equal(h.events.filter(e => e === 'response').length, 1);
});

test('rejected or already approved accounts do not send another approval email', async t => {
  for (const options of [{ decision: 'reject' }, { status: 'approved' }]) {
    await t.test(JSON.stringify(options), async sub => {
      const h = approvalHarness(sub, options);
      const result = await h.response;
      await h.completion;
      assert.equal(result.mailPending, false);
      assert.ok(!h.events.includes('mail'));
      assert.equal(result.approvalStatus, options.decision === 'reject' ? 'rejected' : 'approved');
    });
  }
});

test('deliverEmail configures bounded SMTP timeouts and persists failures', async t => {
  const options = [];
  const writes = [];
  const restore = api.__set__({
    process: { env: { SMTP_HOST: 'smtp.example.com', SMTP_USER: 'test', SMTP_PASS: 'test-only' } },
    db: { collection: () => ({ doc: () => ({ id: 'queue-1', set: async v => writes.push(v), update: async v => writes.push(v) }) }) },
    nodemailer: { createTransport(value) { options.push(value); return { sendMail: async () => { throw new Error('socket timeout'); } }; } },
  });
  t.after(restore);
  await assert.rejects(api.__get__('deliverEmail')({ to: 'student@example.com', subject: 'Approved', html: 'Hi', text: 'Hi' }), /Email provider error/);
  assert.equal(options[0].connectionTimeout, 10000);
  assert.equal(options[0].greetingTimeout, 10000);
  assert.equal(options[0].socketTimeout, 20000);
  assert.equal(writes[0].status, 'sending');
  assert.equal(writes.at(-1).status, 'failed');
  assert.equal(writes.at(-1).error, 'socket timeout');
});
