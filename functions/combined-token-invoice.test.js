'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { combinedTokenRecord } = require('./combined-invoice-core');
const { combinedTokenInput, tokenInvoiceParts, tokenPartPackageId, tokenPackageId, isCombinedTokenInvoice, tokenPackageRecord, creditBlocker, tokenBacklogLessonIds } = require('./lesson-tokens-core');

// „Ühine tunnipakett” (owner 2026-11-04): one lesson package invoice for a family, a package per line after payment
const actor = { uid: 'admin', name: 'Admin' };
const mari = { id: 'mari', name: 'Mari Tamm', subject: 'Eesti keel', parentName: 'Kati Tamm', parentEmail: 'kati@example.ee', linkedParentId: 'parent-kati' };
const jaan = { id: 'jaan', name: 'Jaan Tamm', parentName: 'Kati Tamm', parentEmail: 'kati@example.ee', linkedParentId: 'parent-kati', enrollments: [{ subject: 'Eesti keel', teacher: 'Pavel' }, { subject: 'Matemaatika', teacher: 'Liza' }] };
const other = { id: 'other', name: 'Peeter Kask', subject: 'Eesti keel', parentEmail: 'kask@example.ee' };
const plans = {
  mari: { lessonPriceCents: 2000, lessonMinutes: 60 },
  jaan: { lessonPriceCents: 2200, lessonMinutes: 60, subjectPrices: { Matemaatika: { lessonPriceCents: 2500, lessonMinutes: 45 } } },
  other: { lessonPriceCents: 1800, lessonMinutes: 60 },
};
const record = (parts) => combinedTokenRecord({ due: '2031-12-10', parts, invoiceNum: 'KS-2031-100', nowIso: '2031-11-04T10:00:00.000Z', actor, requestId: 'tokens_combined_0001', signature: 'sig' });

test('2–12 lines, each like a one-card package; a card and subject only once', () => {
  assert.throws(() => combinedTokenInput({ due: '2031-12-10', items: [{ studentId: 'mari', lessons: 8 }] }), /2–12 rida/);
  assert.throws(() => combinedTokenInput({ due: '2031-12-10', items: Array.from({ length: 13 }, (_, i) => ({ studentId: `s${i}`, lessons: 4 })) }), /2–12 rida/);
  assert.throws(() => combinedTokenInput({ due: '2031-12-10', items: [{ studentId: 'mari', lessons: 8 }, { studentId: 'jaan', lessons: 0 }] }), /1–100/);
  assert.throws(() => combinedTokenInput({ due: '', items: [{ studentId: 'mari', lessons: 8 }, { studentId: 'jaan', lessons: 4 }] }), /maksetähtaeg/i);
  assert.throws(() => combinedTokenInput({ due: '2031-12-10', items: [{ studentId: 'jaan', lessons: 8, subject: 'Matemaatika' }, { studentId: 'jaan', lessons: 4, subject: 'matemaatika' }] }), /üks kord/);
  const input = combinedTokenInput({ due: '2031-12-10', note: ' x ', items: [{ studentId: 'mari', lessons: 8, lessonPriceCents: 1 }, { studentId: 'jaan', lessons: 4, subject: 'Matemaatika' }, { studentId: 'jaan', lessons: 6, subject: 'Eesti keel' }] });
  assert.deepEqual(input, { due: '2031-12-10', note: 'x', items: [{ studentId: 'mari', lessons: 8 }, { studentId: 'jaan', lessons: 4, subject: 'Matemaatika' }, { studentId: 'jaan', lessons: 6, subject: 'Eesti keel' }] });
});

test('every line is priced from its own card and subject; one invoice, a line per card and subject', () => {
  const invoice = record([
    { card: mari, plan: plans.mari, subject: '', lessons: 8 },
    { card: jaan, plan: plans.jaan, subject: 'Matemaatika', lessons: 4 },
    { card: jaan, plan: plans.jaan, subject: 'Eesti keel', lessons: 6 },
  ]);
  assert.equal(invoice.billingMode, 'lesson_tokens_v1');
  assert.equal(invoice.tokenStatus, 'pending');
  assert.equal(invoice.combined, true);
  assert.deepEqual(invoice.studentIds, ['mari', 'jaan']);
  assert.equal(invoice.studentId, 'mari');
  assert.equal(invoice.invoiceTargetType, 'parent');
  assert.equal(invoice.payerEmail, 'kati@example.ee');
  assert.equal(invoice.tokenCredits, 18);
  assert.equal(invoice.amountCents, 8 * 2000 + 4 * 2500 + 6 * 2200);
  assert.equal(invoice.balanceDueCents, invoice.amountCents);
  assert.equal(invoice.planMonth, undefined);
  assert.deepEqual(invoice.cardParts.map((part) => [part.studentId, part.subject, part.tokenCredits, part.priceCents, part.amountCents]), [
    ['mari', 'Eesti keel', 8, 2000, 16000],
    ['jaan', 'Matemaatika', 4, 2500, 10000],
    ['jaan', 'Eesti keel', 6, 2200, 13200],
  ]);
  assert.match(invoice.lines[1].description, /^Jaan Tamm · Tunnipakett \(Matemaatika\): 4 × 45 min × 25,00 €$/);
  assert.equal(invoice.lines[1].studentId, 'jaan');
  assert.equal(invoice.lines[1].tokenCredits, 4);
});

test('cards of different payers are refused; a card without a price names its line', () => {
  assert.throws(() => record([{ card: mari, plan: plans.mari, lessons: 8 }, { card: other, plan: plans.other, lessons: 4 }]), (error) => error.status === 409 && /erinev maksja/.test(error.message));
  assert.throws(() => record([{ card: mari, plan: plans.mari, lessons: 8 }, { card: jaan, plan: {}, subject: 'Eesti keel', lessons: 4 }]), /Jaan Tamm · Eesti keel: Õpilasel puudub tunnihind/);
  // a card with two subjects has to name one; a subject it does not have is refused
  assert.throws(() => record([{ card: mari, plan: plans.mari, lessons: 8 }, { card: jaan, plan: plans.jaan, lessons: 4 }]), /Vali aine/);
  assert.throws(() => record([{ card: mari, plan: plans.mari, lessons: 8 }, { card: jaan, plan: plans.jaan, subject: 'Vene keel', lessons: 4 }]), /ei ole seda ainet/);
  // the same subject twice after the card's subject is resolved
  assert.throws(() => record([{ card: mari, plan: plans.mari, lessons: 8 }, { card: mari, plan: plans.mari, subject: 'Eesti keel', lessons: 4 }]), /üks kord/);
});

test('crediting: one package per line on its own card, deterministic ids; a one-card invoice keeps its single package', () => {
  const invoice = { ...record([{ card: mari, plan: plans.mari, lessons: 8 }, { card: jaan, plan: plans.jaan, subject: 'Matemaatika', lessons: 4 }]), date: '2031-11-04' };
  assert.equal(isCombinedTokenInvoice(invoice), true);
  const parts = tokenInvoiceParts('tokens_combined_0001', invoice);
  assert.deepEqual(parts.map((part) => [part.packageId, part.studentId, part.subject, part.tokenCredits]), [
    ['tokens_tokens_combined_0001_0', 'mari', 'Eesti keel', 8],
    ['tokens_tokens_combined_0001_1', 'jaan', 'Matemaatika', 4],
  ]);
  assert.equal(tokenPartPackageId('a'.repeat(120), 11).endsWith('_11'), true);
  const pkg = tokenPackageRecord({ invoice, invoiceId: 'tokens_combined_0001', student: jaan, issuedAt: '2031-11-04', nowIso: 'now', actor, part: parts[1] });
  assert.equal(pkg.studentId, 'jaan');
  assert.equal(pkg.grantedCredits, 4);
  assert.equal(pkg.balanceCredits, 4);
  assert.equal(pkg.priceCents, 10000);
  assert.equal(pkg.lessonPriceCents, 2500);
  assert.equal(pkg.tokenSubject, 'Matemaatika');
  assert.equal(pkg.sourceInvoiceId, 'tokens_combined_0001');
  assert.equal(pkg.sourceInvoiceLine, 1);
  assert.equal(pkg.requestId, 'tokens_tokens_combined_0001_1');
  // a one-card token invoice: the same single part and package id as before
  const single = { billingMode: 'lesson_tokens_v1', studentId: 'mari', tokenCredits: 9, amountCents: 18000, lessonPriceCents: 2000, subject: 'Eesti keel' };
  assert.equal(isCombinedTokenInvoice(single), false);
  assert.deepEqual(tokenInvoiceParts('inv-1', single).map((part) => [part.packageId, part.studentId, part.tokenCredits]), [[tokenPackageId('inv-1'), 'mari', 9]]);
});

test('a combined package invoice follows the one-card rules: unpaid or partly paid is refused, a credit note voids it', () => {
  const invoice = record([{ card: mari, plan: plans.mari, lessons: 8 }, { card: jaan, plan: plans.jaan, subject: 'Matemaatika', lessons: 4 }]);
  assert.match(creditBlocker(invoice), /ei ole veel makstud/);
  assert.match(creditBlocker({ ...invoice, paidAmountCents: 1000, balanceDueCents: invoice.amountCents - 1000 }), /ei ole veel makstud/);
  assert.equal(creditBlocker({ ...invoice, status: 'Makstud', paymentStatus: 'paid', paidAmountCents: invoice.amountCents, balanceDueCents: 0 }), '');
  assert.match(creditBlocker({ ...invoice, status: 'Krediteeritud', tokenStatus: 'voided' }), /krediteeritud/);
});

test('the backlog of each line takes only its own card\'s lessons (and its subject\'s)', () => {
  // the server reads the lessons per card (studentId) and filters by the package's subject: the same helper per line
  const jaanLessons = [
    { id: 'j-math-owed', date: '2031-10-20', subjectKey: 'matemaatika' },
    { id: 'j-est', date: '2031-11-05', subjectKey: 'eesti-keel' },
    { id: 'j-math', date: '2031-11-06', subjectKey: 'matemaatika' },
  ];
  assert.deepEqual(tokenBacklogLessonIds({ lessons: jaanLessons, issuedAt: '2031-11-04', owedLessonIds: ['j-math-owed'], subjectKey: 'matemaatika' }), ['j-math-owed', 'j-math']);
  assert.deepEqual(tokenBacklogLessonIds({ lessons: [{ id: 'm-1', date: '2031-11-05' }], issuedAt: '2031-11-04', owedLessonIds: [] }), ['m-1']);
});
