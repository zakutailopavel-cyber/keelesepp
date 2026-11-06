'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { isPackageInvoice, runInvoiceReminderBatch } = require('./invoice-reminder-batch-core');

const monthly = { id: 'm1', billingMode: 'monthly_plan_v1', status: 'Ootel', due: '2026-11-10' };
const manual = { id: 'h1', billingMode: 'manual_charge_v1', status: 'Ootel', due: '2026-11-10' };
const lessonLines = { id: 'l1', billingMode: 'lesson_lines_v1', status: 'Ootel', due: '2026-11-10' };
const tokens = { id: 't1', billingMode: 'lesson_tokens_v1', tokenCredits: 8, tokenStatus: 'pending', status: 'Ootel', due: '2026-11-10' };
const combinedTokens = { id: 't2', billingMode: 'lesson_tokens_v1', tokenCredits: 16, tokenParts: [{ studentId: 'a' }, { studentId: 'b' }], status: 'Ootel', due: '2026-11-10' };

test('a lesson-package invoice is recognised by mode, lessons or lines; other kinds are not', () => {
  assert.equal(isPackageInvoice(tokens), true);
  assert.equal(isPackageInvoice(combinedTokens), true);
  assert.equal(isPackageInvoice({ billingMode: 'lesson_tokens_v2' }), true);
  assert.equal(isPackageInvoice({ tokenCredits: 4 }), true);
  assert.equal(isPackageInvoice({ lines: [{ type: 'lesson_tokens' }] }), true);
  [monthly, manual, lessonLines, {}, { lines: [{ type: 'lesson' }] }].forEach((invoice) => assert.equal(isPackageInvoice(invoice), false));
});

test('the reminder batch never e-mails a package invoice, even when forced; other kinds as before', async () => {
  const sentIds = [];
  const result = await runInvoiceReminderBatch({
    invoices: [monthly, tokens, manual, combinedTokens, lessonLines],
    shouldSend: () => true,
    send: async (id) => { sentIds.push(id); return { status: id === 'h1' ? 'queued' : 'sent' }; },
  });
  assert.deepEqual(sentIds, ['m1', 'h1', 'l1']);
  assert.deepEqual(result, { sent: 2, queued: 1, skipped: 2, skippedPackages: 2, failed: 0, errors: [] });
});

test('the batch keeps its skip and failure counts for the other kinds', async () => {
  const result = await runInvoiceReminderBatch({
    invoices: [monthly, manual, tokens],
    shouldSend: (invoice) => invoice.id !== 'm1',
    send: async () => { throw new Error('SMTP down'); },
  });
  assert.deepEqual(result, { sent: 0, queued: 0, skipped: 2, skippedPackages: 1, failed: 1, errors: [{ invoiceId: 'h1', error: 'SMTP down' }] });
});
