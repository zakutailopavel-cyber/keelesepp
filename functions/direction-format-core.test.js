'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const core = require('./direction-format-core');
const { combinedMonthlyRecord, combinedTokenRecord, monthlyItemsInput, planForDirection } = require('./combined-invoice-core');
const { tokenInvoiceInput, tokenInvoiceLines, tokenInvoiceParts, tokenPackageRecord, combinedTokenInput, tokenBacklogLessonIds, packageTiersForLesson } = require('./lesson-tokens-core');

// „Õppesuunad: individuaalne / grupp” (team 2026-11-18): price and lesson packages per direction + format
const actor = { uid: 'admin', name: 'Admin' };
const mari = { id: 'mari', name: 'Mari Tamm', parentEmail: 'kati@example.ee', enrollments: [{ subject: 'Eesti keel', teacher: 'Pavel' }, { subject: 'Eesti keel', teacher: 'Pavel', format: 'group', groupId: 'g1' }] };
const plan = { lessonPriceCents: 2500, lessonMinutes: 60, groupPrices: { 'Eesti keel': { lessonPriceCents: 1200, lessonMinutes: 90 } } };
const legacyPlan = { lessonPriceCents: 2500, lessonMinutes: 60 };

test('a lesson with groupId is a group lesson; every other lesson is individual', () => {
  assert.equal(core.lessonFormat({ groupId: 'g1' }), 'group');
  assert.equal(core.lessonFormat({ isGroup: true }), 'group');
  assert.equal(core.lessonFormat({}), 'individual');
  assert.equal(core.lessonFormat({ groupId: '  ' }), 'individual');
  assert.equal(core.subjectFormatLabel('Eesti keel', 'group'), 'Eesti keel · grupp');
  assert.equal(core.subjectFormatLabel('Eesti keel', ''), 'Eesti keel');
});

test('price: the group price for a group line, else the individual price with fallback; individual lines unchanged', () => {
  assert.deepEqual(core.groupPriceOf(plan, 'eesti keel'), { lessonPriceCents: 1200, lessonMinutes: 90 });
  assert.equal(core.groupPriceOf(legacyPlan, 'Eesti keel'), null);
  assert.equal(core.groupPriceOf({ groupPrices: { 'Eesti keel': { lessonPriceCents: 0 } } }, 'Eesti keel'), null);
  assert.deepEqual(core.planForFormat(legacyPlan, plan, 'Eesti keel', 'group'), { plan: { ...legacyPlan, lessonPriceCents: 1200, lessonMinutes: 90 }, fallback: false });
  assert.deepEqual(core.planForFormat(legacyPlan, legacyPlan, 'Eesti keel', 'group'), { plan: legacyPlan, fallback: true });
  assert.deepEqual(core.planForFormat(legacyPlan, plan, 'Eesti keel', 'individual'), { plan: legacyPlan, fallback: false });
  // the server's line price
  assert.equal(planForDirection(plan, 'Eesti keel', 'group').lessonPriceCents, 1200);
  assert.equal(planForDirection(plan, 'Eesti keel', '').lessonPriceCents, 2500);
  assert.equal(planForDirection({ ...plan, subjectPrices: { Matemaatika: { lessonPriceCents: 3000 } } }, 'Matemaatika', 'group').lessonPriceCents, 3000);
});

const pkg = (id, extra = {}) => ({ id, status: 'active', balanceCredits: 4, sourceType: 'invoice_payment', productType: 'lesson_package', issuedAt: '2026-11-01', ...extra });

test('packages: a card without group packages takes exactly as before', () => {
  const packages = [pkg('a', { tokenSubject: 'Eesti keel' }), pkg('b')];
  for (const format of ['group', 'individual']) {
    assert.deepEqual(core.packageTiersForFormat(packages, 'eesti-keel', format), { tiers: packageTiersForLesson(packages, 'eesti-keel'), fallback: false });
  }
});

test('packages: a group lesson takes its subject’s group package, an individual lesson never does', () => {
  const individual = pkg('ind', { tokenSubject: 'Eesti keel' });
  const group = pkg('grp', { tokenSubject: 'Eesti keel', tokenFormat: 'group' });
  const shared = pkg('old');
  assert.deepEqual(core.packageTiersForFormat([individual, group, shared], 'eesti-keel', 'group'), { tiers: [[group]], fallback: false });
  assert.deepEqual(core.packageTiersForFormat([individual, group, shared], 'eesti-keel', 'individual'), { tiers: [[individual], [shared]], fallback: false });
  // a group package of another subject: the Estonian group lesson falls back to the individual packages (warning)
  const mathsGroup = pkg('mg', { tokenSubject: 'Matemaatika', tokenFormat: 'group' });
  assert.deepEqual(core.packageTiersForFormat([individual, mathsGroup], 'eesti-keel', 'group'), { tiers: [[individual]], fallback: true });
  // only group packages: an individual lesson is not on packages (takes nothing, owes nothing)
  assert.deepEqual(core.packageTiersForFormat([group], 'eesti-keel', 'individual'), { tiers: null, fallback: false });
});

test('package invoices: format group is kept, priced at the group price, named „· grupp”, its package has tokenFormat', () => {
  assert.equal(tokenInvoiceInput({ studentId: 'mari', lessons: 8, due: '2026-12-01', subject: 'Eesti keel', format: 'group' }).format, 'group');
  assert.equal('format' in tokenInvoiceInput({ studentId: 'mari', lessons: 8, due: '2026-12-01', format: 'x' }), false);
  const lines = tokenInvoiceLines({ lessons: 8, plan: planForDirection(plan, 'Eesti keel', 'group'), subject: 'Eesti keel', format: 'group' });
  assert.equal(lines.amountCents, 9600);
  assert.equal(lines.lines[0].description, 'Tunnipakett (Eesti keel · grupp): 8 × 90 min × 12,00 €');
  assert.equal(tokenInvoiceLines({ lessons: 2, plan: legacyPlan, subject: 'Eesti keel' }).lines[0].description, 'Tunnipakett (Eesti keel): 2 × 60 min × 25,00 €');
  const invoice = { studentId: 'mari', subject: 'Eesti keel', format: 'group', tokenCredits: 8, amountCents: 9600, lessonPriceCents: 1200, num: 'KS-1' };
  assert.equal(tokenInvoiceParts('inv1', invoice)[0].format, 'group');
  assert.equal('format' in tokenInvoiceParts('inv2', { ...invoice, format: undefined })[0], false);
  const record = tokenPackageRecord({ invoice, invoiceId: 'inv1', student: mari, issuedAt: '2026-11-18', nowIso: '2026-11-18T10:00:00Z', actor });
  assert.equal(record.tokenFormat, 'group');
  assert.equal(record.tokenSubject, 'Eesti keel');
  assert.equal('tokenFormat' in tokenPackageRecord({ invoice: { ...invoice, format: undefined }, invoiceId: 'inv2', student: mari, issuedAt: '2026-11-18', nowIso: '2026-11-18T10:00:00Z', actor }), false);
});

test('one family package invoice may hold Eesti keel individually and in a group', () => {
  const input = combinedTokenInput({ due: '2026-12-01', items: [{ studentId: 'mari', lessons: 8, subject: 'Eesti keel' }, { studentId: 'mari', lessons: 4, subject: 'Eesti keel', format: 'group' }] });
  assert.deepEqual(input.items[1], { studentId: 'mari', lessons: 4, subject: 'Eesti keel', format: 'group' });
  assert.throws(() => combinedTokenInput({ due: '2026-12-01', items: [{ studentId: 'mari', lessons: 8, subject: 'Eesti keel', format: 'group' }, { studentId: 'mari', lessons: 4, subject: 'Eesti keel', format: 'group' }] }), /üks kord/);
  const record = combinedTokenRecord({ due: '2026-12-01', parts: [{ card: mari, plan, subject: 'Eesti keel', lessons: 8 }, { card: mari, plan, subject: 'Eesti keel', format: 'group', lessons: 4 }], invoiceNum: 'KS-2', nowIso: '2026-11-18T10:00:00Z', actor, requestId: 'r', signature: 's' });
  assert.deepEqual(record.lines.map((line) => line.description), ['Tunnipakett (Eesti keel): 8 × 60 min × 25,00 €', 'Tunnipakett (Eesti keel · grupp): 4 × 90 min × 12,00 €']);
  assert.equal(record.cardParts[1].format, 'group');
  assert.equal('format' in record.cardParts[0], false);
  assert.equal(record.amountCents, 8 * 2500 + 4 * 1200);
  const parts = tokenInvoiceParts('inv3', { ...record, combined: true });
  assert.deepEqual(parts.map((part) => part.format || ''), ['', 'group']);
});

test('a group package’s backlog takes only group lessons', () => {
  const lessons = [{ id: 'l1', date: '2026-11-19', format: 'group' }, { id: 'l2', date: '2026-11-19', format: 'individual' }];
  assert.deepEqual(tokenBacklogLessonIds({ lessons, issuedAt: '2026-11-18', format: 'group' }), ['l1']);
  assert.deepEqual(tokenBacklogLessonIds({ lessons, issuedAt: '2026-11-18' }), ['l1', 'l2']);
});

test('monthly invoice: a group line is its own line „Eesti keel · grupp” at the group price; fallback = individual price', () => {
  assert.deepEqual(monthlyItemsInput([{ studentId: 'mari', subject: 'Eesti keel' }, { studentId: 'mari', subject: 'Eesti keel', format: 'group' }]).map((item) => item.format || ''), ['', 'group']);
  assert.throws(() => monthlyItemsInput([{ studentId: 'mari', subject: 'Eesti keel', format: 'group' }, { studentId: 'mari', subject: 'Eesti keel', format: 'group' }]), /üks kord/);
  const record = combinedMonthlyRecord({
    month: '2026-12', due: '2026-12-10', invoiceNum: 'KS-3', nowIso: '2026-11-18T10:00:00.000Z', actor, requestId: 'r', signature: 's',
    parts: [
      { card: mari, plan, subject: 'Eesti keel', plannedUnits: 4, correctionUnits: 0, correctionNote: '' },
      { card: mari, plan, subject: 'Eesti keel', format: 'group', plannedUnits: 4, correctionUnits: 0, correctionNote: '' },
    ],
  });
  assert.match(record.lines[0].description, /^Eesti keel: /);
  assert.match(record.lines[1].description, /^Eesti keel · grupp: /);
  assert.equal(record.lines[1].format, 'group');
  assert.equal(record.cardParts[1].priceCents, 1200);
  assert.equal(record.cardParts[0].priceCents, 2500);
  assert.equal('format' in record.cardParts[0], false);
  const fallback = combinedMonthlyRecord({
    month: '2026-12', due: '2026-12-10', invoiceNum: 'KS-4', nowIso: '2026-11-18T10:00:00.000Z', actor, requestId: 'r', signature: 's',
    parts: [
      { card: mari, plan: legacyPlan, subject: 'Eesti keel', plannedUnits: 4, correctionUnits: 0, correctionNote: '' },
      { card: mari, plan: legacyPlan, subject: 'Eesti keel', format: 'group', plannedUnits: 2, correctionUnits: 0, correctionNote: '' },
    ],
  });
  assert.equal(fallback.cardParts[1].priceCents, 2500);
});

test('legacy report: an untouched track reads as Grupp only when the card is in a calendar group of that subject', () => {
  const students = [
    { id: 's1', name: 'A', subject: 'Eesti keel' },
    { id: 's2', name: 'B', enrollments: [{ subject: 'Eesti keel' }, { subject: 'Matemaatika' }] },
    { id: 's3', name: 'C', enrollments: [{ subject: 'Eesti keel', teacher: 'X' }, { subject: 'Eesti keel', teacher: 'Y' }] },
    { id: 's4', name: 'D', enrollments: [{ subject: 'Eesti keel', format: 'individual' }] },
  ];
  const groups = [{ id: 'g1', subject: 'Eesti keel', students: ['s1', 's2', 's3', 's4'] }, { id: 'g0', subject: 'Matemaatika', active: false, students: ['s2'] }];
  assert.deepEqual(core.legacyGroupCandidates(students, groups), [
    { studentId: 's1', name: 'A', subject: 'Eesti keel', groupId: 'g1' },
    { studentId: 's2', name: 'B', subject: 'Eesti keel', groupId: 'g1' },
  ]);
});

test('the browser copy (crm-v2 directionFormat.js) answers the same', async () => {
  const client = await import(pathToFileURL(path.join(__dirname, '../crm-v2/src/features/students/directionFormat.js')).href);
  for (const lesson of [{ groupId: 'g' }, {}, { isGroup: true }, { groupId: ' ' }]) assert.equal(client.lessonFormat(lesson), core.lessonFormat(lesson));
  for (const [p, subject] of [[plan, 'Eesti keel'], [plan, 'EESTI KEEL'], [legacyPlan, 'Eesti keel'], [null, 'x']]) assert.deepEqual(client.groupPriceOf(p, subject), core.groupPriceOf(p, subject));
  for (const format of ['group', 'individual', '']) assert.deepEqual(client.planForFormat(legacyPlan, plan, 'Eesti keel', format), core.planForFormat(legacyPlan, plan, 'Eesti keel', format));
  assert.equal(client.subjectFormatLabel('Eesti keel', 'group'), core.subjectFormatLabel('Eesti keel', 'group'));
  const students = [{ id: 's1', subject: 'Eesti keel' }, { id: 's2', enrollments: [{ subject: 'Eesti keel' }, { subject: 'Eesti keel', format: 'group' }] }];
  const groups = [{ id: 'g1', subject: 'Eesti keel', students: ['s1', 's2'] }];
  assert.deepEqual(client.legacyGroupCandidates(students, groups), core.legacyGroupCandidates(students, groups));
});
