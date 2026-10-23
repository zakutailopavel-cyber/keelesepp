const { test } = require('node:test');
const assert = require('node:assert/strict');
const core = require('./invoice-correction-core');
const { automaticEntries } = require('./accounting-core');

const monthly = {
  num: 'KS-2026-101', date: '2026-09-01', due: '2026-09-10', status: 'Ootel', billingMode: 'monthly_plan_v1', planMonth: '2026-09',
  studentId: 's1', studentName: 'Mari', subject: 'Eesti keel', payerName: 'Ema Tamm', payerEmail: 'ema@example.com',
  amountCents: 16000, amount: 160, balanceDueCents: 16000, emailStatus: 'sent', emailSentAt: '2026-09-01', reminderCount: 2,
  lines: [{ description: 'Eesti keel: 8 × 60 min × 20 €', quantity: 8, unitPriceCents: 2000, amountCents: 16000, amount: 160 }],
  createdAt: '2026-09-01T08:00:00.000Z', creationSignature: 'old',
};

const lessonInvoice = {
  num: 'KS-2026-102', date: '2026-09-01', status: 'Ootel', studentId: 's2', payerName: 'Isa', amountCents: 5000, amount: 50,
  lessonIds: ['l1', 'l2'], correctedLessonIds: ['l1'], creditedAmountCents: 2500,
  lines: [{ lessonId: 'l1', date: '2026-08-03', amountCents: 2500 }, { lessonId: 'l2', date: '2026-08-10', amountCents: 2500 }],
};

test('the reason needs at least 10 characters', () => {
  assert.throws(() => core.cleanReason('liiga lühi'.slice(0, 9)), /vähemalt 10/);
  assert.equal(core.cleanReason('  Vale   summa arvel  '), 'Vale summa arvel');
});

test('full credit is refused for cancelled, credited, corrected, paid and package-on-card invoices', () => {
  assert.equal(core.fullCreditError(monthly), '');
  assert.match(core.fullCreditError({ ...monthly, status: 'Tühistatud' }), /Tühistatud/);
  assert.match(core.fullCreditError({ ...monthly, status: 'Krediteeritud' }), /täielikult/);
  assert.match(core.fullCreditError({ ...monthly, creditedAmountCents: 16000 }), /täielikult/);
  assert.match(core.fullCreditError({ ...monthly, correctedBy: { invoiceId: 'x' } }), /parandatud/);
  assert.match(core.fullCreditError(monthly, [{ status: 'active', amountCents: 100 }]), /laekumisi/);
  assert.equal(core.fullCreditError(monthly, [{ status: 'voided', amountCents: 100 }]), '');
  assert.match(core.fullCreditError({ ...monthly, status: 'Makstud' }), /laekumisi/);
  assert.match(core.fullCreditError({ ...monthly, billingMode: 'lesson_tokens_v1', tokenStatus: 'credited' }), /paketi/);
  assert.equal(core.fullCreditError({ ...monthly, billingMode: 'lesson_tokens_v1', tokenStatus: 'pending' }), '');
});

test('the credit note covers what is not yet credited and the invoice keeps its original amount', () => {
  const note = core.fullCreditNoteRecord({ invoice: lessonInvoice, invoiceId: 'inv2', creditNoteNum: 'KN-2026-005', todayIso: '2026-10-23', nowIso: '2026-10-23T10:00:00.000Z', reason: 'Vale arve perele', actor: { uid: 'a' }, requestId: 'r', signature: 'sig', issuer: {} });
  assert.equal(note.amountCents, 2500);
  assert.deepEqual(note.lessonIds, ['l2']);
  assert.equal(note.lines.length, 1);
  assert.equal(note.lines[0].amountCents, -2500);
  assert.match(note.lines[0].description, /KS-2026-102 krediteerimine/);
  assert.deepEqual(note.creditedLines.map((line) => line.lessonId), ['l2']);
  const patch = core.invoiceAfterFullCredit(lessonInvoice, { creditNoteId: 'r', creditNoteNum: 'KN-2026-005', amountCents: 2500, reason: 'Vale arve perele', nowIso: '2026-10-23T10:00:00.000Z' });
  assert.equal(patch.amountCents, 5000);
  assert.equal(patch.creditedAmountCents, 5000);
  assert.equal(patch.effectiveAmountCents, 0);
  assert.equal(patch.balanceDueCents, 0);
  assert.equal(patch.status, 'Krediteeritud');
  assert.deepEqual(patch.correctedLessonIds, ['l1', 'l2']);
  const tokens = core.invoiceAfterFullCredit({ ...monthly, billingMode: 'lesson_tokens_v1', tokenStatus: 'pending' }, { creditNoteId: 'r', creditNoteNum: 'n', amountCents: 1, reason: 'x', nowIso: 'now' });
  assert.equal(tokens.tokenStatus, 'voided', 'a credited package invoice can no longer give lessons to the card');
});

test('a correction changes the amount and/or the payer, never nothing', () => {
  assert.throws(() => core.correctionInput(monthly, { reason: 'Vale summa arvel' }), /praegu on kõik sama/);
  const amount = core.correctionInput(monthly, { amount: '140,50', reason: 'Vale summa arvel' });
  assert.equal(amount.amountCents, 14050);
  assert.equal(amount.amountChanged, true);
  assert.equal(amount.payerChanged, false);
  const payer = core.correctionInput(monthly, { payer: { payerName: 'Firma OÜ', payerRegCode: '12345678', payerEmail: 'arved@firma.ee' }, reason: 'Arve tuleb firmale' });
  assert.equal(payer.amountChanged, false);
  assert.equal(payer.payerChanged, true);
  assert.equal(payer.payer.payerName, 'Firma OÜ');
  assert.throws(() => core.correctionInput(monthly, { amount: 0, reason: 'Vale summa arvel' }), /positiivne/);
  assert.throws(() => core.correctionInput(monthly, { payer: { payerName: '' }, reason: 'Vale maksja arvel' }), /nimi/);
  assert.throws(() => core.correctionInput(monthly, { payer: { payerEmail: 'pole' }, reason: 'Vale maksja arvel' }), /e-post/);
  assert.throws(() => core.correctionInput(lessonInvoice, { amount: 10, reason: 'Vale summa arvel' }), /tunnirida/);
  assert.equal(core.correctionInput(lessonInvoice, { payer: { payerName: 'Ema' }, reason: 'Vale maksja arvel' }).amountCents, 2500, 'the open amount, not the original');
});

test('the new invoice keeps the content, gets a new number, fresh state and a link to the old one', () => {
  const input = core.correctionInput(monthly, { amount: 140, payer: { payerName: 'Firma OÜ' }, reason: 'Vale summa ja maksja' });
  const record = core.correctedInvoiceRecord({ invoice: monthly, invoiceId: 'inv1', input, invoiceNum: 'KS-2026-150', todayIso: '2026-10-23', nowIso: '2026-10-23T10:00:00.000Z', creditNoteId: 'cn1', creditNoteNum: 'KN-2026-006', actor: { uid: 'a' }, requestId: 'correction_x', signature: 'sig' });
  assert.equal(record.num, 'KS-2026-150');
  assert.equal(record.paymentReference, 'KS-2026-150');
  assert.equal(record.date, '2026-10-23');
  assert.equal(record.due, '2026-10-23', 'a past due date moves to today unless a new one is given');
  assert.equal(record.amountCents, 14000);
  assert.equal(record.balanceDueCents, 14000);
  assert.equal(record.status, 'Ootel');
  assert.equal(record.payerName, 'Firma OÜ');
  assert.equal(record.payerEmail, 'ema@example.com');
  assert.equal(record.subject, 'Eesti keel');
  assert.equal(record.planMonth, '2026-09');
  assert.equal(record.emailStatus, '');
  assert.equal(record.emailSentAt, '');
  assert.equal(record.reminderCount, 0);
  assert.equal(record.creationSignature, 'sig');
  assert.equal(record.lines.length, 2);
  assert.equal(record.lines[1].type, 'amount_correction');
  assert.equal(record.lines[1].amountCents, -2000);
  assert.equal(record.lines.reduce((sum, line) => sum + line.amountCents, 0), 14000);
  assert.deepEqual({ invoiceId: record.correctionOf.invoiceId, creditNoteId: record.correctionOf.creditNoteId, previousAmountCents: record.correctionOf.previousAmountCents }, { invoiceId: 'inv1', creditNoteId: 'cn1', previousAmountCents: 16000 });
  const lessons = core.correctedInvoiceRecord({ invoice: lessonInvoice, invoiceId: 'inv2', input: core.correctionInput(lessonInvoice, { payer: { payerName: 'Ema' }, reason: 'Vale maksja arvel', due: '2026-11-05' }), invoiceNum: 'KS-2026-151', todayIso: '2026-10-23', nowIso: 'now', creditNoteId: 'cn2', creditNoteNum: 'KN', actor: {}, requestId: 'r', signature: 's' });
  assert.deepEqual(lessons.lessonIds, ['l2']);
  assert.deepEqual(lessons.lines.map((line) => line.lessonId), ['l2']);
  assert.equal(lessons.correctedLessonIds, undefined);
  assert.equal(lessons.due, '2026-11-05');
});

test('bookkeeping: the full credit note and the new invoice become their own automatic entries', () => {
  const input = core.correctionInput(monthly, { amount: 140, reason: 'Vale summa arvel' });
  const note = core.fullCreditNoteRecord({ invoice: monthly, invoiceId: 'inv1', creditNoteNum: 'KN-2026-006', todayIso: '2026-10-23', nowIso: 'now', reason: input.reason, actor: {}, requestId: 'cn1', signature: 's', issuer: {} });
  const patch = core.invoiceAfterFullCredit(monthly, { creditNoteId: 'cn1', creditNoteNum: 'KN-2026-006', amountCents: note.amountCents, reason: input.reason, nowIso: 'now' });
  const replacement = core.correctedInvoiceRecord({ invoice: monthly, invoiceId: 'inv1', input, invoiceNum: 'KS-2026-150', todayIso: '2026-10-23', nowIso: 'now', creditNoteId: 'cn1', creditNoteNum: 'KN-2026-006', actor: {}, requestId: 'correction_cn1', signature: 's' });
  const entries = automaticEntries({ invoices: [{ id: 'inv1', ...monthly, ...patch }, { id: 'correction_cn1', ...replacement }], creditNotes: [{ id: 'cn1', ...note }] });
  const view = entries.map((entry) => [entry.sourceKey, entry.date, entry.lines.map((l) => [l.account, l.debitCents, l.creditCents])]);
  assert.deepEqual(view, [
    ['invoice:inv1', '2026-09-01', [['1200', 16000, 0], ['3000', 0, 16000]]],
    ['credit-note:cn1', '2026-10-23', [['3000', 16000, 0], ['1200', 0, 16000]]],
    ['invoice:correction_cn1', '2026-10-23', [['1200', 14000, 0], ['3000', 0, 14000]]],
  ]);
});

// shaped like the real old debts (KS-2026-004, -030, -049, -050): no billingMode, euros only, lessons linked by
// lessonIds without lesson lines, e-mail sending failed; another one with lesson lines and one line credited already
test('old invoices without billingMode and with lesson links are credited in full (lead 2026-10-23)', () => {
  const legacy = { num: 'KS-2026-030', date: '2026-03-02', due: '2026-03-12', status: 'Ootel', studentName: 'Jegor', amount: 56, lessonIds: ['old-1', 'old-2'], emailStatus: 'failed' };
  assert.equal(core.fullCreditError(legacy), '');
  assert.equal(core.openCreditCents(legacy), 5600);
  assert.deepEqual(core.activeLessonIds(legacy), ['old-1', 'old-2']);
  const note = core.fullCreditNoteRecord({ invoice: legacy, invoiceId: 'legacy', creditNoteNum: 'KN-2026-010', todayIso: '2026-10-23', nowIso: 'now', reason: 'Vana võlg suletakse', actor: {}, requestId: 'r', signature: 's', issuer: {} });
  assert.equal(note.amountCents, 5600);
  assert.deepEqual(note.lessonIds, ['old-1', 'old-2']);
  const patch = core.invoiceAfterFullCredit(legacy, { creditNoteId: 'r', creditNoteNum: 'KN-2026-010', amountCents: 5600, reason: 'x', nowIso: 'now' });
  assert.equal(patch.amountCents, 5600);
  assert.equal(patch.balanceDueCents, 0);
  assert.deepEqual(patch.correctedLessonIds, ['old-1', 'old-2']);
  assert.throws(() => core.correctionInput(legacy, { amount: 50, reason: 'Vale summa arvel' }), /tunnirida/);

  const partly = { num: 'KS-2026-004', status: 'Ootel', amount: 60, amountCents: 6000, creditedAmountCents: 2000, correctedLessonIds: ['h1'], lessonIds: ['h1', 'h2'], lines: [{ lessonId: 'h1', amountCents: 2000 }, { lessonId: 'h2', amountCents: 4000 }] };
  assert.equal(core.fullCreditError(partly), '');
  const partlyNote = core.fullCreditNoteRecord({ invoice: partly, invoiceId: 'p', creditNoteNum: 'KN', todayIso: '2026-10-23', nowIso: 'now', reason: 'Vana võlg suletakse', actor: {}, requestId: 'r', signature: 's', issuer: {} });
  assert.equal(partlyNote.amountCents, 4000);
  assert.deepEqual(partlyNote.lessonIds, ['h2']);
});
