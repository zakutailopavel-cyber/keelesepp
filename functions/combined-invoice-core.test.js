'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { payerKey, sameCardsInput, monthlyItemsInput, planForSubject, combinedMonthlyRecord, combinedManualRecord, billsCardForMonth } = require('./combined-invoice-core');

const actor = { uid: 'admin', name: 'Admin' };
const en = { id: 'en', name: 'Aleksandr Smirnov', subject: 'Inglise keel', parentEmail: 'ema@example.ee', parentName: 'Jekaterina' };
const et = { id: 'et', name: 'Aleksandr Smirnov', subject: 'Eesti keel', parentEmail: 'ema@example.ee', parentName: 'Jekaterina' };

test('one payer: a linked parent account first, then the e-mail, then the name', () => {
  assert.equal(payerKey({ parentUid: 'p1', parentEmail: 'x@y.ee' }), 'parent:p1');
  assert.equal(payerKey({ parentEmail: 'X@Y.ee' }), 'email:x@y.ee');
  assert.equal(payerKey({ name: 'Mari' }), 'name:mari');
});

test('2–12 different cards', () => {
  assert.deepEqual(sameCardsInput([{ studentId: 'a' }, { studentId: 'b' }]), ['a', 'b']);
  assert.throws(() => sameCardsInput([{ studentId: 'a' }]), { status: 400 });
  assert.throws(() => sameCardsInput([{ studentId: 'a' }, { studentId: 'a' }]), { status: 400 });
});

test('two subjects of one student: one invoice, a line per subject, units kept per card', () => {
  const record = combinedMonthlyRecord({
    month: '2026-11', due: '2026-11-10', invoiceNum: 'KS-2026-200', nowIso: '2026-10-20T10:00:00.000Z', actor, requestId: 'r', signature: 's',
    parts: [
      { card: en, plan: { lessonPriceCents: 2500, lessonMinutes: 60 }, plannedUnits: 4, correctionUnits: 0, correctionNote: '' },
      { card: et, plan: { lessonPriceCents: 2000, lessonMinutes: 60 }, plannedUnits: 8, correctionUnits: -1, correctionNote: 'puudus' },
    ],
  });
  assert.equal(record.combined, true);
  assert.equal(record.invoiceTargetType, 'student');
  assert.deepEqual(record.studentIds, ['en', 'et']);
  assert.equal(record.studentName, 'Aleksandr Smirnov');
  assert.equal(record.amountCents, 4 * 2500 + 8 * 2000 - 2000);
  assert.equal(record.balanceDueCents, record.amountCents);
  assert.equal(record.lines.length, 3);
  assert.match(record.lines[0].description, /^Inglise keel: Keeletunnid/);
  assert.deepEqual(record.lines.map((line) => line.studentId), ['en', 'et', 'et']);
  assert.deepEqual(record.cardParts.map((part) => [part.studentId, part.plannedUnits, part.correctionUnits, part.amountCents]), [['en', 4, 0, 10000], ['et', 8, -1, 14000]]);
  assert.equal(record.planMonth, '2026-11');
  assert.equal(record.payerEmail, 'ema@example.ee');
});

test('children of one parent: a parent invoice with the names on the lines', () => {
  const mia = { id: 'mia', name: 'Mia', subject: 'Eesti keel', parentUid: 'p1', parentName: 'Olga' };
  const lev = { id: 'lev', name: 'Lev', subject: 'Matemaatika', parentUid: 'p1', parentName: 'Olga' };
  const record = combinedManualRecord({ description: 'Õppematerjalid', due: '2026-11-10', note: '', invoiceNum: 'KS-2026-201', nowIso: '2026-10-20T10:00:00.000Z', actor, requestId: 'r2', signature: 's2', parts: [{ card: mia, amountCents: 1500 }, { card: lev, amountCents: 2000 }] });
  assert.equal(record.invoiceTargetType, 'parent');
  assert.equal(record.studentName, 'Mia, Lev');
  assert.deepEqual(record.lines.map((line) => line.description), ['Õppematerjalid · Mia · Eesti keel', 'Õppematerjalid · Lev · Matemaatika']);
  assert.equal(record.amountCents, 3500);
  assert.equal(record.parentUid, 'p1');
});

test('never two payers on one invoice; a missing price is named', () => {
  assert.throws(() => combinedManualRecord({ description: 'x', due: '2026-11-10', parts: [{ card: en, amountCents: 1 }, { card: { id: 'z', name: 'Z', parentEmail: 'other@example.ee' }, amountCents: 1 }], invoiceNum: 'n', nowIso: '2026-10-20T00:00:00.000Z', actor }), { status: 409 });
  assert.throws(() => combinedMonthlyRecord({ month: '2026-11', due: '2026-11-10', parts: [{ card: en, plan: {}, plannedUnits: 1, correctionUnits: 0 }, { card: et, plan: { lessonPriceCents: 1 }, plannedUnits: 1, correctionUnits: 0 }], invoiceNum: 'n', nowIso: '2026-10-20T00:00:00.000Z', actor }), /Inglise keel: tunnihind puudub/);
});

test('a card is billed for the month by its own invoice or its part of a combined one, not by a cancelled one', () => {
  assert.equal(billsCardForMonth({ studentId: 'en', planMonth: '2026-11' }, 'en', '2026-11'), true);
  assert.equal(billsCardForMonth({ studentId: 'et', studentIds: ['et', 'en'], planMonth: '2026-11' }, 'en', '2026-11'), true);
  assert.equal(billsCardForMonth({ studentId: 'et', studentIds: ['et', 'en'], planMonth: '2026-11', status: 'Tühistatud' }, 'en', '2026-11'), false);
  assert.equal(billsCardForMonth({ studentId: 'en', planMonth: '2026-10' }, 'en', '2026-11'), false);
});

test('the PDF of a combined invoice renders every line', async () => {
  const { buildInvoicePdf } = require('./invoice-document');
  const record = combinedMonthlyRecord({
    month: '2026-11', due: '2026-11-10', invoiceNum: 'KS-2026-300', nowIso: '2026-10-20T10:00:00.000Z', actor, requestId: 'r', signature: 's',
    parts: [{ card: en, plan: { lessonPriceCents: 2500 }, plannedUnits: 4, correctionUnits: 0 }, { card: et, plan: { lessonPriceCents: 2000 }, plannedUnits: 4, correctionUnits: 0 }],
  });
  const pdf = await buildInvoicePdf({ invoice: record, student: en, paymentDetails: { company: 'EP Koolitus' } });
  assert.ok(Buffer.isBuffer(pdf) && pdf.length > 1000);
});

test('one card, two subjects (owner 2026-10-20): a line per subject at its own price', () => {
  assert.deepEqual(monthlyItemsInput([{ studentId: 'st', subject: 'Eesti keel' }, { studentId: 'st', subject: 'matemaatika' }]), [{ studentId: 'st', subject: 'Eesti keel' }, { studentId: 'st', subject: 'Matemaatika' }]);
  assert.throws(() => monthlyItemsInput([{ studentId: 'st', subject: 'Eesti keel' }, { studentId: 'st', subject: 'Eesti keel' }]), { status: 400 });
  const plan = { lessonPriceCents: 2000, lessonMinutes: 60, subjectPrices: { Matemaatika: { lessonPriceCents: 2800, lessonMinutes: 45 } } };
  assert.equal(planForSubject(plan, 'Matemaatika').lessonPriceCents, 2800);
  assert.equal(planForSubject(plan, 'Eesti keel').lessonPriceCents, 2000);
  const stefania = { id: 'st', name: 'Stefania', subject: 'Eesti keel', parentEmail: 'ema@example.ee' };
  const record = combinedMonthlyRecord({
    month: '2026-11', due: '2026-11-10', invoiceNum: 'KS-2026-300', nowIso: '2026-10-20T10:00:00.000Z', actor, requestId: 'r', signature: 's',
    parts: [
      { card: stefania, plan, subject: 'Eesti keel', plannedUnits: 4, correctionUnits: 0, correctionNote: '' },
      { card: stefania, plan, subject: 'Matemaatika', plannedUnits: 3, correctionUnits: 0, correctionNote: '' },
    ],
  });
  assert.deepEqual(record.studentIds, ['st']);
  assert.equal(record.amountCents, 4 * 2000 + 3 * 2800);
  assert.match(record.lines[0].description, /^Eesti keel: Keeletunnid/);
  assert.match(record.lines[1].description, /^Matemaatika: Tunnid, .*3 × 45 min × 28,00 €/);
  assert.deepEqual(record.cardParts.map((part) => [part.studentId, part.subject, part.plannedUnits]), [['st', 'Eesti keel', 4], ['st', 'Matemaatika', 3]]);
  assert.deepEqual(record.subjects, ['Eesti keel', 'Matemaatika']);
});
