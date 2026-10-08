const { test } = require('node:test');
const assert = require('node:assert/strict');
const { invoiceCancellationError } = require('./invoice-cancellation-core');

const invoice = { billingMode: 'monthly_plan_v1', status: 'Ootel', lines: [{ description: 'Keeletunnid', amountCents: 8000 }] };

test('a newly prepared unpaid monthly invoice can be cancelled', () => {
  assert.equal(invoiceCancellationError(invoice), '');
});

test('sent, paid, credited and lesson-linked invoices need their own correction flows', () => {
  assert.match(invoiceCancellationError({ ...invoice, emailStatus: 'sent' }), /Sent/);
  assert.match(invoiceCancellationError({ ...invoice, emailStatus: 'sending' }), /Sent/);
  assert.match(invoiceCancellationError({ ...invoice, invoiceEmailSentAt: '2026-10-08' }), /Sent/);
  assert.match(invoiceCancellationError(invoice, [{ status: 'active', amountCents: 1000 }]), /Paid/);
  assert.match(invoiceCancellationError({ ...invoice, status: 'Makstud' }), /Paid/);
  assert.match(invoiceCancellationError({ ...invoice, paidAmountCents: 1000 }), /Paid/);
  assert.match(invoiceCancellationError(invoice, [], [{ id: 'credit-1' }]), /Credited/);
  assert.match(invoiceCancellationError({ ...invoice, lines: [{ lessonId: 'lesson-1' }] }), /Lesson-linked/);
});
