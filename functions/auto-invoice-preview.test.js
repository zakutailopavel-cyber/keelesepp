const test = require('node:test');
const assert = require('node:assert/strict');

const {
  lessonIsBillable,
  normalizedAutomaticInvoiceSettings,
  previousBillingMonth,
  selectBillableLessons,
} = require('./auto-invoice-preview');

test('automatic invoice settings are disabled and preview-only by default', () => {
  assert.deepEqual(normalizedAutomaticInvoiceSettings({}), {
    enabled: false,
    invoiceDay: 1,
    dueDay: 10,
    mode: 'preview_only',
  });
});

test('automatic mode is accepted only when explicitly enabled', () => {
  assert.equal(normalizedAutomaticInvoiceSettings({ mode: 'automatic' }).mode, 'preview_only');
  assert.deepEqual(normalizedAutomaticInvoiceSettings({
    enabled: true,
    mode: 'automatic',
    invoiceDay: 3,
    dueDay: 10,
  }), {
    enabled: true,
    invoiceDay: 3,
    dueDay: 10,
    mode: 'automatic',
  });
});

test('automatic invoice day settings are clamped to safe calendar days', () => {
  assert.deepEqual(normalizedAutomaticInvoiceSettings({
    enabled: true,
    invoiceDay: 31,
    dueDay: 0,
  }), {
    enabled: true,
    invoiceDay: 28,
    dueDay: 10,
    mode: 'preview_only',
  });
});

test('previous billing month crosses year boundary', () => {
  assert.equal(previousBillingMonth(new Date(2026, 0, 15, 12)), '2025-12');
  assert.equal(previousBillingMonth(new Date(2026, 7, 7, 12)), '2026-07');
});

test('only unbilled completed or explicitly billable lessons are eligible', () => {
  assert.equal(lessonIsBillable({ status: 'Toimunud' }), true);
  assert.equal(lessonIsBillable({ status: 'Toimunud', billingStatus: 'unbilled' }), true);
  assert.equal(lessonIsBillable({ status: 'Puudus_p', billingStatus: 'late_cancel_billable' }), true);
  assert.equal(lessonIsBillable({ status: 'Toimunud', invoiceId: 'invoice-1' }), false);
  assert.equal(lessonIsBillable({ status: 'Toimunud', billingStatus: 'invoiced' }), false);
  assert.equal(lessonIsBillable({ status: 'Toimunud', packageConsumptionStatus: 'consumed' }), false);
  assert.equal(lessonIsBillable({ status: 'Planeeritud' }), false);
});

test('student lesson selection does not duplicate lessons and respects legacy counter', () => {
  const student = { id: 's1', lessonsSinceInvoice: 2 };
  const lessons = [
    { id: 'legacy-1', studentId: 's1', date: '2026-07-01', status: 'Toimunud' },
    { id: 'legacy-2', studentId: 's1', date: '2026-07-08', status: 'Toimunud' },
    { id: 'legacy-3', studentId: 's1', date: '2026-07-15', status: 'Toimunud' },
    { id: 'explicit', studentId: 's1', date: '2026-07-22', status: 'Toimunud', billingStatus: 'unbilled' },
    { id: 'other', studentId: 's2', date: '2026-07-22', status: 'Toimunud' },
  ];

  assert.deepEqual(
    selectBillableLessons(lessons, student).map((lesson) => lesson.id),
    ['legacy-3', 'explicit'],
  );
});
