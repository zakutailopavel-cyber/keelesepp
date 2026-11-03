'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { tokenInvoiceInput, tokenInvoiceLines, invoicePaid, creditBlocker, tokenPackageId, tokenPackageRecord, lessonTakesToken, packageForOwedLesson, tokenBacklogLessonIds, lessonTokenCost, TOKENS_PER_LESSON, OWED_LESSONS_TAKE_NEXT_PACKAGE } = require('./lesson-tokens-core');

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

test('credits per lesson: one per full hour, at least one (owner 2026-10-29)', () => {
  assert.deepEqual([45, 60, 90, 119, 120, 150, 180].map((duration) => lessonTokenCost({ duration })), [1, 1, 1, 1, 2, 2, 3]);
  assert.equal(lessonTokenCost({}), 1);
  assert.equal(lessonTokenCost({ duration: '120' }), 2);
  assert.equal(lessonTokenCost({ durationMinutes: 180 }), 3);
  assert.equal(lessonTokenCost({ duration: 30 }), 1);
});

test('a two-credit owed lesson needs a package with two credits left', () => {
  const token = (id, issuedAt, balanceCredits) => ({ id, productType: 'lesson_package', sourceType: 'invoice_payment', status: 'active', issuedAt, balanceCredits });
  assert.equal(packageForOwedLesson([token('a', '2026-10-01', 1), token('b', '2026-11-01', 4)], { credits: 2 }).id, 'b');
  assert.equal(packageForOwedLesson([token('a', '2026-10-01', 1)], { credits: 2 }), null);
});

// ---- a package for one subject (Oleksiy 2026-11-03) ----
const { tokenSubjectKey, cardSubjects, tokenInvoiceSubject, lessonSubject, packageTiersForLesson } = require('./lesson-tokens-core');

test('the subject of a package invoice: one of the card\'s own subjects', () => {
  const two = { subject: 'Eesti keel', enrollments: [{ subject: 'Eesti keel', teacher: 'Pavel' }, { subject: 'matemaatika', teacher: 'Liza' }, { subject: 'Vene keel', active: false }] };
  assert.deepEqual(cardSubjects(two), ['Eesti keel', 'Matemaatika']);
  assert.equal(tokenInvoiceSubject('Matemaatika', two), 'Matemaatika');
  assert.equal(tokenInvoiceSubject(' matemaatika ', two), 'Matemaatika', 'case and spaces do not matter');
  assert.throws(() => tokenInvoiceSubject('', two), /Vali aine/, 'several subjects: the invoice has to name one');
  assert.throws(() => tokenInvoiceSubject('Vene keel', two), /ei ole seda ainet/, 'an ended track is not offered');
  assert.equal(tokenInvoiceSubject('', { subject: 'Inglise keel' }), 'Inglise keel', 'one subject: chosen without asking');
  assert.equal(tokenInvoiceSubject('Estonian', { subject: 'Eesti keel' }), 'Eesti keel', 'an alias is the same subject');
  assert.equal(tokenInvoiceSubject('Matemaatika', { enrollments: [{ subject: 'Eesti keel', status: 'ended' }] }), 'Matemaatika', 'a card with no subject takes any school subject');
  assert.equal(tokenInvoiceSubject('', {}), '', 'no subject anywhere: a shared package, as before');
  assert.equal(tokenInvoiceInput({ studentId: 'k1', lessons: 4, due: '2026-11-10', subject: ' inglise keel ' }).subject, 'Inglise keel');
  assert.equal(tokenSubjectKey('English'), tokenSubjectKey('Inglise keel'));
});

test('the package of a subject invoice pays only that subject; an old invoice makes a shared package', () => {
  const base = { studentId: 'k1', tokenCredits: 8, amountCents: 16000, num: 'KS-1' };
  assert.equal(tokenPackageRecord({ invoice: { ...base, subject: 'Matemaatika' }, invoiceId: 'i1', student: { subject: 'Eesti keel' }, issuedAt: '2026-11-03', nowIso: '2026-11-03T10:00:00Z', actor: {} }).tokenSubject, 'Matemaatika');
  const old = tokenPackageRecord({ invoice: base, invoiceId: 'i0', student: { subject: 'Eesti keel' }, issuedAt: '2026-11-03', nowIso: '2026-11-03T10:00:00Z', actor: {} });
  assert.equal(old.tokenSubject, undefined, 'no subject on the invoice: no tokenSubject, the package pays every lesson');
  assert.equal(old.subject, 'Eesti keel', 'the display subject stays as before');
});

test('a lesson\'s subject: its own if the card has it, else its teacher\'s track', () => {
  const card = { subject: 'Eesti keel', enrollments: [{ subject: 'Eesti keel', teacher: 'Pavel', teacherUid: 'p' }, { subject: 'Matemaatika', teacher: 'Liza', teacherUid: 'l' }] };
  assert.equal(lessonSubject({ subject: 'Matemaatika' }, card), 'Matemaatika');
  assert.equal(lessonSubject({ teacherUid: 'l' }, card), 'Matemaatika');
  assert.equal(lessonSubject({ subject: 'Inglise keel', teacher: 'Liza' }, card), 'Matemaatika', 'a subject the card does not have: by teacher');
  assert.equal(lessonSubject({}, card), 'Eesti keel', 'unknown: the card\'s main subject');
  assert.equal(lessonSubject({}, { subject: 'Inglise keel' }), 'Inglise keel');
});

test('which packages a lesson may take: its subject first, then the shared pool; old cards unchanged', () => {
  const pkg = (id, tokenSubject) => ({ id, ...(tokenSubject ? { tokenSubject } : {}) });
  const est = tokenSubjectKey('Eesti keel');
  const math = tokenSubjectKey('Matemaatika');
  const old = [pkg('a'), pkg('b')];
  assert.deepEqual(packageTiersForLesson(old, math), [old], 'no package has a subject: one pool, as before');
  const mixed = [pkg('e', 'Eesti keel'), pkg('m', 'Matemaatika'), pkg('s')];
  assert.deepEqual(packageTiersForLesson(mixed, math).map((tier) => tier.map((item) => item.id)), [['m'], ['s']]);
  assert.deepEqual(packageTiersForLesson(mixed, est).map((tier) => tier.map((item) => item.id)), [['e'], ['s']]);
  assert.deepEqual(packageTiersForLesson(mixed, tokenSubjectKey('Vene keel')).map((tier) => tier.map((item) => item.id)), [['s']], 'no own package: the shared pool');
  assert.equal(packageTiersForLesson([pkg('e', 'Eesti keel')], math), null, 'only another subject\'s packages: this lesson is not on packages');
});

test('the backlog of a subject package takes only that subject\'s lessons', () => {
  const lessons = [{ id: 'e1', date: '2026-11-04', subjectKey: 'eesti-keel' }, { id: 'm1', date: '2026-11-05', subjectKey: 'matemaatika' }, { id: 'm0', date: '2026-10-01', subjectKey: 'matemaatika' }];
  assert.deepEqual(tokenBacklogLessonIds({ lessons, issuedAt: '2026-11-01', owedLessonIds: ['m0'], subjectKey: 'matemaatika' }), ['m0', 'm1']);
  assert.deepEqual(tokenBacklogLessonIds({ lessons, issuedAt: '2026-11-01', owedLessonIds: ['m0'] }), ['m0', 'e1', 'm1'], 'a shared package: every lesson, as before');
});
