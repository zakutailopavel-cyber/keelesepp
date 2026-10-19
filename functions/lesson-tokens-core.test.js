'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { tokenInvoiceInput, tokenInvoiceLines, invoicePaid, creditBlocker, tokenPackageId, tokenPackageRecord, lessonTakesToken } = require('./lesson-tokens-core');

test('an invoice for 1–100 lessons with a due date', () => {
  assert.deepEqual(tokenInvoiceInput({ studentId: ' k1 ', lessons: '9', due: '2026-11-10' }), { studentId: 'k1', lessons: 9, due: '2026-11-10', note: '' });
  assert.throws(() => tokenInvoiceInput({ studentId: 'k1', lessons: 0, due: '2026-11-10' }), { status: 400 });
  assert.throws(() => tokenInvoiceInput({ studentId: 'k1', lessons: 2.5, due: '2026-11-10' }), { status: 400 });
  assert.throws(() => tokenInvoiceInput({ studentId: '', lessons: 4, due: '2026-11-10' }), { status: 400 });
});

test('the price comes from the plan; no price, no invoice', () => {
  const priced = tokenInvoiceLines({ lessons: 9, plan: { lessonPriceCents: 2000, lessonMinutes: 45 }, subject: 'Eesti keel' });
  assert.equal(priced.amountCents, 18000);
  assert.equal(priced.lines[0].quantity, 9);
  assert.match(priced.lines[0].description, /Tunnipakett \(Eesti keel\): 9 × 45 min × 20,00 €/);
  assert.throws(() => tokenInvoiceLines({ lessons: 9, plan: {} }), /tunnihind/);
});

test('credited only when paid, never twice', () => {
  const invoice = { billingMode: 'lesson_tokens_v1', tokenCredits: 9, amountCents: 18000, status: 'Ootel', balanceDueCents: 18000 };
  assert.equal(creditBlocker(invoice), 'Arve ei ole veel makstud.');
  assert.equal(invoicePaid({ ...invoice, paidAmountCents: 18000, balanceDueCents: 0 }), true);
  assert.equal(invoicePaid({ ...invoice, status: 'Makstud' }), true);
  assert.equal(invoicePaid({ ...invoice, status: 'Tühistatud', paymentStatus: 'paid' }), false);
  assert.equal(creditBlocker({ ...invoice, status: 'Makstud' }), '');
  assert.equal(creditBlocker({ billingMode: 'manual_charge_v1' }), 'See ei ole tunnipaketi arve.');
  assert.equal(tokenPackageId('abc/def'), 'tokens_abc_def');
});

test('the package record: N credits from the invoice date, linked to the invoice', () => {
  const record = tokenPackageRecord({ invoice: { studentId: 'k1', tokenCredits: 9, amountCents: 18000, num: 'KS-2026-300', lessonPriceCents: 2000 }, invoiceId: 'inv1', student: { name: 'Kaarel' }, issuedAt: '2026-10-01', nowIso: '2026-10-05T10:00:00Z', actor: { uid: 'a' } });
  assert.equal(record.balanceCredits, 9);
  assert.equal(record.productType, 'lesson_package');
  assert.equal(record.status, 'active');
  assert.equal(record.sourceInvoiceNum, 'KS-2026-300');
  assert.equal(record.issuedAt, '2026-10-01');
});

test('a held lesson and a charged no-show take a credit; a notified absence or a waived no-show does not', () => {
  assert.equal(lessonTakesToken({ status: 'Toimunud' }), true);
  assert.equal(lessonTakesToken({ status: 'Puudus_eta' }), true);
  assert.equal(lessonTakesToken({ status: 'Puudus_eta' }, { chargeNoShow: false }), false);
  assert.equal(lessonTakesToken({ status: 'Puudus_eta', billingWaived: true }), false);
  assert.equal(lessonTakesToken({ status: 'Puudus_p' }), false);
});

test('„Kooli kulul”: a held lesson the school pays takes no credit', () => {
  assert.equal(lessonTakesToken({ status: 'Toimunud', billingStatus: 'school_covered' }), false);
  assert.equal(lessonTakesToken({ status: 'Toimunud', billingStatus: 'free' }), true);
});
