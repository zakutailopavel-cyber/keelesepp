'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { tokenInvoiceInput, tokenInvoiceLines, invoicePaid, creditBlocker, tokenPackageId, tokenPackageRecord, lessonTakesToken, packageForOwedLesson, tokenBacklogLessonIds, TOKENS_PER_LESSON, OWED_LESSONS_TAKE_NEXT_PACKAGE } = require('./lesson-tokens-core');

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
  assert.match(creditBlocker({ ...invoice, tokenStatus: 'voided' }), /krediteeritud/, 'a credited or corrected package invoice gives no lessons');
  assert.match(creditBlocker({ ...invoice, status: 'Krediteeritud' }), /krediteeritud/);
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

test('an owed lesson is paid by the oldest paid token package with credits (FIFO), whatever its date', () => {
  const token = (id, issuedAt, balanceCredits, extra = {}) => ({ id, studentId: 'k1', productType: 'lesson_package', sourceType: 'invoice_payment', status: balanceCredits ? 'active' : 'depleted', issuedAt, createdAt: `${issuedAt}T10:00:00Z`, balanceCredits, ...extra });
  const packages = [token('tokens_b', '2026-11-01', 8), token('tokens_a', '2026-10-01', 0), token('tokens_c', '2026-12-01', 4)];
  assert.equal(packageForOwedLesson(packages).id, 'tokens_b');
  // a catalogue package (not bought with a token invoice) is never used for an owed lesson
  assert.equal(packageForOwedLesson([{ ...token('cat', '2026-11-01', 5), sourceType: 'package_issue' }]), null);
  assert.equal(packageForOwedLesson([]), null);
  assert.equal(packageForOwedLesson(packages, { enabled: false }), null);
  assert.equal(OWED_LESSONS_TAKE_NEXT_PACKAGE, true);
  assert.equal(TOKENS_PER_LESSON, 1);
});

test('a credited package takes the owed lessons first, then the lessons since its invoice date, oldest first', () => {
  const lessons = [
    { id: 'l4', date: '2026-11-03' }, { id: 'l1', date: '2026-10-20' }, { id: 'l2', date: '2026-10-27' }, { id: 'l0', date: '2026-10-13' }, { id: 'l3', date: '2026-11-01' },
  ];
  assert.deepEqual(tokenBacklogLessonIds({ lessons, issuedAt: '2026-11-01', owedLessonIds: ['l2', 'l1'] }), ['l1', 'l2', 'l3', 'l4']);
  assert.deepEqual(tokenBacklogLessonIds({ lessons, issuedAt: '2026-11-01', owedLessonIds: ['l2'], owedFirst: false }), ['l3', 'l4']);
});
