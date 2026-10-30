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

// ---- one package per subject, expiry (owner 2026-10-30) ----
const { TOKEN_EXPIRY_DAYS, TOKEN_EXPIRY_FROM, tokenSubjectKey, packageSubject, lessonSubject, tokenInvoiceSubject, tokenExpiryStart, tokenExpiresOn, tokenPackageExpired, lastLessonDateAfter, lastHeldLessonDate, packageForLesson, subjectUsesPackages, tokenExtensionUntil } = require('./lesson-tokens-core');

const twoSubjects = { name: 'Mia', subject: 'Eesti keel', enrollments: [{ subject: 'Eesti keel', teacherUid: 't1', teacher: 'Pavel' }, { subject: 'Matemaatika', teacherUid: 't2', teacher: 'Liza' }] };
const oneSubject = { name: 'Kaarel', subject: 'Eesti keel' };
const pack = (id, values = {}) => ({ id, studentId: 'k1', productType: 'lesson_package', sourceType: 'invoice_payment', status: 'active', balanceCredits: 8, issuedAt: '2031-01-01', activatedOn: '2031-01-01', createdAt: '2031-01-01T10:00:00Z', ...values });

test('subject keys: one name in any case, the built-in aliases, the same key as the CRM directions', () => {
  assert.equal(tokenSubjectKey('Inglise Keel'), 'inglise-keel');
  assert.equal(tokenSubjectKey('English'), 'inglise-keel');
  assert.equal(tokenSubjectKey('Eesti'), 'eesti-keel');
  assert.equal(tokenSubjectKey(''), '');
});

test('a package: its own subject, else the card\'s only subject, else the shared pool', () => {
  assert.equal(packageSubject({ subject: 'matemaatika' }, twoSubjects), 'Matemaatika');
  assert.equal(packageSubject({}, oneSubject), 'Eesti keel');
  assert.equal(packageSubject({}, twoSubjects), '', 'ambiguous: shared');
});

test('a lesson: its own subject, its teacher\'s track, the card\'s only one, the main one', () => {
  assert.equal(lessonSubject({ subject: 'Matemaatika' }, twoSubjects), 'Matemaatika');
  assert.equal(lessonSubject({ teacherUid: 't2' }, twoSubjects), 'Matemaatika');
  assert.equal(lessonSubject({}, oneSubject), 'Eesti keel');
  assert.equal(lessonSubject({}, twoSubjects), 'Eesti keel');
});

test('a package invoice names a subject when the card has several, and only one of its own', () => {
  assert.throws(() => tokenInvoiceSubject('', twoSubjects), /Vali aine/);
  assert.equal(tokenInvoiceSubject('matemaatika', twoSubjects), 'Matemaatika');
  assert.throws(() => tokenInvoiceSubject('Vene keel', twoSubjects), { status: 400 });
  assert.equal(tokenInvoiceSubject('', oneSubject), 'Eesti keel');
  assert.deepEqual(tokenInvoiceInput({ studentId: 'k1', lessons: 4, due: '2031-01-10', subject: 'matemaatika' }).subject, 'Matemaatika');
});

test('the package record holds the invoice subject; without one the only subject, on several the shared pool', () => {
  const invoice = { studentId: 'k1', tokenCredits: 4, amountCents: 8000 };
  const make = (values, student) => tokenPackageRecord({ invoice: { ...invoice, ...values }, invoiceId: 'i', student, issuedAt: '2031-01-01', nowIso: '2031-01-05T10:00:00Z', actor: {} });
  assert.equal(make({ subject: 'Matemaatika' }, twoSubjects).subject, 'Matemaatika');
  assert.equal(make({}, oneSubject).subject, 'Eesti keel');
  assert.equal(make({}, twoSubjects).subject, '');
  assert.equal(make({}, oneSubject).activatedOn, '2031-01-05');
});

test('per-subject FIFO: Estonian takes the oldest Estonian package, maths its own; the shared pool last', () => {
  const math = pack('m', { subject: 'Matemaatika', issuedAt: '2030-12-30', activatedOn: '2030-12-30' });
  const etOld = pack('e1', { subject: 'Eesti keel', issuedAt: '2031-01-01' });
  const etNew = pack('e2', { subject: 'Eesti keel', issuedAt: '2031-01-03', activatedOn: '2031-01-03' });
  const shared = pack('s', { issuedAt: '2030-12-01', activatedOn: '2030-12-01', extendedUntil: '2031-12-31' });
  const packages = [shared, etNew, math, etOld];
  const pick = (subject, values = {}) => packageForLesson(packages, { subjectKey: tokenSubjectKey(subject), card: twoSubjects, lessonDate: '2031-01-05', ...values })?.id;
  assert.equal(pick('Eesti keel'), 'e1', 'never the older maths or shared package');
  assert.equal(pick('Matemaatika'), 'm');
  assert.equal(pick('Vene keel'), 's', 'a subject without its own package: the shared pool');
  // own packages used up → the shared pool
  const etEmpty = [{ ...etOld, balanceCredits: 0, status: 'depleted' }, shared];
  assert.equal(packageForLesson(etEmpty, { subjectKey: 'eesti-keel', card: twoSubjects, lessonDate: '2031-01-05' }).id, 's');
  // no credits in the subject and no shared pool → null: owed in that subject, the maths package does not pay it
  assert.equal(packageForLesson([math], { subjectKey: 'eesti-keel', card: twoSubjects, lessonDate: '2031-01-05' }), null);
  // a 2-credit lesson skips a package with one credit left
  assert.equal(packageForLesson([{ ...etOld, balanceCredits: 1 }, etNew], { subjectKey: 'eesti-keel', card: twoSubjects, lessonDate: '2031-01-05', credits: 2 }).id, 'e2');
  // a requested package of another subject is refused
  assert.throws(() => packageForLesson(packages, { subjectKey: 'eesti-keel', card: twoSubjects, lessonDate: '2031-01-05', requestedPackageId: 'm' }), { status: 409 });
});

test('debt per subject: an owed lesson is paid by the next package of its own subject, even dated after the lesson', () => {
  const nextMath = pack('m2', { subject: 'Matemaatika', issuedAt: '2031-02-01', activatedOn: '2031-02-01' });
  const nextEt = pack('e2', { subject: 'Eesti keel', issuedAt: '2031-02-01', activatedOn: '2031-02-01' });
  const owedLesson = { subjectKey: 'eesti-keel', card: twoSubjects, lessonDate: '2031-01-20' };
  assert.equal(packageForLesson([nextMath], owedLesson), null);
  assert.equal(packageForLesson([nextMath, nextEt], owedLesson).id, 'e2');
  // the backlog of the Estonian package: Estonian lessons only (owed ones and those since the invoice date)
  const lessons = [{ id: 'et-owed', date: '2031-01-20', subjectKey: 'eesti-keel' }, { id: 'ma-owed', date: '2031-01-21', subjectKey: 'matemaatika' }, { id: 'et-new', date: '2031-02-03', subjectKey: 'eesti-keel' }, { id: 'et-old', date: '2031-01-02', subjectKey: 'eesti-keel' }];
  const owedLessonIds = ['et-owed', 'ma-owed'];
  assert.deepEqual(tokenBacklogLessonIds({ lessons, issuedAt: '2031-02-01', owedLessonIds, subjectKey: 'eesti-keel' }), ['et-owed', 'et-new']);
  // a shared package takes any subject's; an extension only what is owed
  assert.deepEqual(tokenBacklogLessonIds({ lessons, issuedAt: '2031-02-01', owedLessonIds }), ['et-owed', 'ma-owed', 'et-new']);
  assert.deepEqual(tokenBacklogLessonIds({ lessons, issuedAt: '2031-02-01', owedLessonIds, subjectKey: 'eesti-keel', onlyOwed: true }), ['et-owed']);
});

test('a subject the card has no package for is not on packages: it takes nothing and owes nothing', () => {
  const packages = [pack('e', { subject: 'Eesti keel' })];
  assert.equal(subjectUsesPackages(packages, 'eesti-keel', twoSubjects), true);
  assert.equal(subjectUsesPackages(packages, 'matemaatika', twoSubjects), false);
  assert.equal(subjectUsesPackages([pack('s')], 'matemaatika', twoSubjects), true, 'the shared pool serves every subject');
  assert.equal(subjectUsesPackages([pack('e', { subject: 'Eesti keel', balanceCredits: 0, status: 'depleted' })], 'eesti-keel', twoSubjects), true, 'used up: still on packages, so owed');
});

test('expiry start: the payment before the first lesson, then the last lesson held (14 days without use)', () => {
  assert.equal(TOKEN_EXPIRY_DAYS, 14);
  const fresh = pack('p', { issuedAt: '2031-03-01', activatedOn: '2031-03-02' });
  assert.equal(tokenExpiryStart(fresh), '2031-03-02');
  assert.equal(tokenExpiresOn(fresh), '2031-03-16');
  // day 14 still counts, day 15 does not
  assert.equal(tokenPackageExpired(fresh, '2031-03-16'), false);
  assert.equal(tokenPackageExpired(fresh, '2031-03-17'), true);
  // an 8-lesson package at one lesson a week never expires: each lesson restarts the 14 days
  const used = { ...fresh, lastLessonDate: lastLessonDateAfter(fresh, '2031-03-09') };
  assert.equal(tokenExpiryStart(used), '2031-03-09');
  assert.equal(tokenExpiresOn(used), '2031-03-23');
  assert.equal(tokenPackageExpired(used, '2031-03-20'), false);
});

test('an owed lesson dated before the payment does not start the count earlier; a late-marked lesson does not move it back', () => {
  const paid = pack('p', { issuedAt: '2031-03-01', activatedOn: '2031-03-10' });
  const afterOwed = { ...paid, lastLessonDate: lastLessonDateAfter(paid, '2031-01-15') };
  assert.equal(tokenExpiryStart(afterOwed), '2031-03-10');
  assert.equal(lastLessonDateAfter({ lastLessonDate: '2031-03-20' }, '2031-03-05'), '2031-03-20');
});

test('a lesson cannot take an expired package; a lesson held in time and marked late can', () => {
  const stale = pack('p', { subject: 'Eesti keel', issuedAt: '2031-03-01', activatedOn: '2031-03-01', lastLessonDate: '2031-03-01' });
  const lesson = (lessonDate) => packageForLesson([stale], { subjectKey: 'eesti-keel', card: oneSubject, lessonDate });
  assert.equal(lesson('2031-03-15').id, 'p', 'held on the last day, whenever it is marked');
  assert.equal(lesson('2031-03-16'), null, 'owed');
  // own package expired → the next one of the subject, FIFO
  const next = pack('q', { subject: 'Eesti keel', issuedAt: '2031-03-10', activatedOn: '2031-03-10' });
  assert.equal(packageForLesson([stale, next], { subjectKey: 'eesti-keel', card: oneSubject, lessonDate: '2031-03-20' }).id, 'q');
});

test('grandfathering: a package from before the rule starts counting on the rule\'s first day, nothing burns retroactively', () => {
  assert.equal(TOKEN_EXPIRY_FROM, '2026-10-30');
  const old = { issuedAt: '2026-01-05', createdAt: '2026-01-06T10:00:00Z', lastLessonDate: '2026-02-01', balanceCredits: 3 };
  assert.equal(tokenExpiryStart(old), TOKEN_EXPIRY_FROM);
  assert.equal(tokenExpiresOn(old), '2026-11-13');
  assert.equal(tokenPackageExpired(old, '2026-11-13'), false);
  assert.equal(tokenPackageExpired(old, '2026-11-14'), true);
  // a package with no activatedOn (an old record): its creation day
  assert.equal(tokenExpiryStart({ issuedAt: '2031-01-01', createdAt: '2031-01-02T10:00:00Z' }), '2031-01-02');
});

test('a corrected mark gives back the last lesson: the count returns to the lesson before it', () => {
  const entries = [
    { id: 'c1', entryType: 'lesson_consumption', lessonDate: '2031-03-01' },
    { id: 'c2', entryType: 'lesson_consumption', lessonDate: '2031-03-08' },
    { id: 'c3', entryType: 'lesson_consumption', lessonDate: '2031-03-15' },
    { id: 'r2', entryType: 'lesson_restoration', lessonDate: '2031-03-08', restoresLedgerEntryId: 'c2' },
    { id: 'g', entryType: 'grant' },
  ];
  assert.equal(lastHeldLessonDate(entries), '2031-03-15');
  assert.equal(lastHeldLessonDate(entries, { restoredEntryId: 'c3' }), '2031-03-01');
  assert.equal(lastHeldLessonDate(entries.slice(4)), '');
});

test('an extension: 14 days from today by default, or a later day; never earlier than the package is valid; expired no more', () => {
  const stale = pack('p', { issuedAt: '2031-03-01', activatedOn: '2031-03-01', balanceCredits: 3 });
  assert.equal(tokenPackageExpired(stale, '2031-04-01'), true);
  const until = tokenExtensionUntil(stale, { today: '2031-04-01' });
  assert.equal(until, '2031-04-15');
  const extended = { ...stale, extendedUntil: until };
  assert.equal(tokenPackageExpired(extended, '2031-04-15'), false);
  assert.equal(tokenPackageExpired(extended, '2031-04-16'), true);
  assert.equal(packageForLesson([extended], { subjectKey: 'eesti-keel', card: oneSubject, lessonDate: '2031-04-10' }).id, 'p');
  assert.throws(() => tokenExtensionUntil(extended, { today: '2031-04-01', until: '2031-04-10' }), { status: 409 });
  assert.equal(tokenExtensionUntil(stale, { today: '2031-04-01', until: '2031-06-01' }), '2031-06-01');
  assert.throws(() => tokenExtensionUntil({ ...stale, balanceCredits: 0 }, { today: '2031-04-01' }), { status: 409 });
  // the next lesson's 14 days still run on after an extension
  assert.equal(tokenExpiresOn({ ...extended, lastLessonDate: '2031-04-10' }), '2031-04-24');
});
