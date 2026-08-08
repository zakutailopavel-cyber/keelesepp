'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {
  erpNextConfiguration,
  erpNextManualInvoiceView,
  financeProviderName,
  payerIdentity,
} = require('./finance-provider-router');

test('financeProviderName defaults safely to firebase', () => {
  assert.equal(financeProviderName({}), 'firebase');
  assert.equal(financeProviderName({ FINANCE_PROVIDER: ' ERPNext ' }), 'erpnext');
  assert.throws(() => financeProviderName({ FINANCE_PROVIDER: 'mystery' }), /Unsupported FINANCE_PROVIDER/);
});

test('erpNextConfiguration names missing server-side settings', () => {
  assert.deepEqual(erpNextConfiguration({}), {
    configured: false,
    missing: ['FRAPPE_BASE_URL', 'FRAPPE_API_KEY', 'FRAPPE_API_SECRET', 'ERPNEXT_COMPANY'],
  });
  assert.equal(erpNextConfiguration({
    FRAPPE_BASE_URL: 'https://erp.example.test',
    FRAPPE_API_KEY: 'key',
    FRAPPE_API_SECRET: 'secret',
    ERPNEXT_COMPANY: 'E&P Koolitus OÜ',
  }).configured, true);
});

test('payerIdentity keeps legal payer separate from student', () => {
  const payer = payerIdentity('student-1', {
    name: 'Student One',
    payerId: 'payer-1',
    payerName: 'Parent One',
    payerEmail: 'parent@example.test',
  });
  assert.equal(payer.id, 'payer-1');
  assert.equal(payer.name, 'Parent One');
  assert.equal(payer.isCompany, false);
});

test('payerIdentity falls back deterministically when payer mapping is absent', () => {
  const payer = payerIdentity('student-42', { name: 'Student 42' });
  assert.equal(payer.id, 'student:student-42');
  assert.equal(payer.name, 'Student 42');
});

test('erpNextManualInvoiceView preserves KeeleSepp invoice shape', () => {
  const result = erpNextManualInvoiceView({
    invoice: { id: 'ACC-SINV-2026-0001', status: 'Unpaid', grandTotal: 80, outstandingAmount: 30, dueDate: '2026-08-10' },
    input: { amount: 80, due: '2026-08-10', description: 'August lessons', note: '' },
    studentId: 'student-1',
    student: { name: 'Student One' },
    payer: { name: 'Parent One', email: 'parent@example.test', regCode: '' },
    actor: { uid: 'admin-1' },
    billingKey: 'ks_test',
    requestId: 'request_123456',
    nowIso: '2026-08-08T07:00:00.000Z',
  });
  assert.equal(result.backend, 'erpnext');
  assert.equal(result.num, 'ACC-SINV-2026-0001');
  assert.equal(result.amountCents, 8000);
  assert.equal(result.paidAmountCents, 5000);
  assert.equal(result.balanceDueCents, 3000);
  assert.equal(result.paymentStatus, 'unpaid');
});
