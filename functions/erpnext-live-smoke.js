'use strict';

const assert = require('node:assert/strict');
const { createErpNextFinanceProvider } = require('./erpnext-finance-provider');

function required(name, value) {
  const clean = String(value || '').trim();
  if (!clean) throw new Error(`${name} is required`);
  return clean;
}

function envConfig(env = process.env) {
  return {
    company: required('ERPNEXT_COMPANY', env.ERPNEXT_COMPANY),
    payerId: env.ERPNEXT_SMOKE_PAYER_ID || `smoke-payer-${Date.now()}`,
    studentId: env.ERPNEXT_SMOKE_STUDENT_ID || `smoke-student-${Date.now()}`,
    amount: Number(env.ERPNEXT_SMOKE_AMOUNT || 5),
    dueDate: env.ERPNEXT_SMOKE_DUE_DATE || new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
  };
}

async function run(env = process.env) {
  const cfg = envConfig(env);
  assert.ok(Number.isFinite(cfg.amount) && cfg.amount > 0, 'ERPNEXT_SMOKE_AMOUNT must be positive');

  const provider = createErpNextFinanceProvider({ env });
  const status = await provider.status();
  assert.equal(status.provider, 'erpnext');
  assert.equal(status.connected, true, 'ERPNext API connection failed');

  const requestId = `smoke_${Date.now()}`;
  const month = new Date().toISOString().slice(0, 7);
  const payer = {
    id: cfg.payerId,
    name: 'KeeleSepp ERPNext Smoke Test',
    email: 'smoke-test@example.invalid',
    isCompany: false,
  };
  const common = {
    payer,
    studentId: cfg.studentId,
    month,
    manualRequestId: requestId,
    lessonIds: [],
    dueDate: cfg.dueDate,
    lines: [{ description: 'KeeleSepp ERPNext integration smoke test', amount: cfg.amount }],
    note: `Disposable integration smoke test ${requestId}`,
  };

  const first = await provider.createInvoiceDraft(common);
  assert.ok(first.invoice?.id, 'Invoice draft was not created');
  assert.equal(first.idempotent, false, 'First invoice creation unexpectedly reported idempotent');

  const submitted = await provider.submitInvoice(first.invoice.id);
  assert.equal(submitted.invoice.docstatus, 1, 'Sales Invoice was not submitted');

  const paid = await provider.createPaymentForInvoice({
    invoiceName: first.invoice.id,
    amount: cfg.amount,
    referenceNo: `KS-SMOKE-${Date.now()}`,
  });
  assert.ok(paid.invoice, 'Invoice was not reloaded after payment');
  assert.equal(Number(paid.invoice.outstandingAmount), 0, 'Outstanding amount is not zero after full payment');

  const repeated = await provider.createInvoiceDraft(common);
  assert.equal(repeated.idempotent, true, 'Repeated request did not resolve to existing invoice');
  assert.equal(repeated.invoice.id, first.invoice.id, 'Repeated request resolved to a different invoice');

  const repeatedPayment = await provider.createPaymentForInvoice({
    invoiceName: first.invoice.id,
    amount: cfg.amount,
    referenceNo: `KS-SMOKE-RETRY-${Date.now()}`,
  });
  assert.equal(repeatedPayment.idempotent, true, 'Repeated payment against a fully paid invoice should be idempotent');
  assert.equal(Number(repeatedPayment.invoice.outstandingAmount), 0);

  const result = {
    ok: true,
    user: status.user,
    company: cfg.company,
    invoiceId: first.invoice.id,
    billingKey: first.billingKey,
    paymentId: paid.payment?.id || null,
    outstandingAmount: paid.invoice.outstandingAmount,
    duplicatePrevented: repeated.invoice.id === first.invoice.id,
    duplicatePaymentPrevented: repeatedPayment.idempotent === true,
  };
  console.log(JSON.stringify(result, null, 2));
  return result;
}

if (require.main === module) {
  run().catch((error) => {
    console.error(error.stack || error.message || error);
    process.exitCode = 1;
  });
}

module.exports = { envConfig, run };
