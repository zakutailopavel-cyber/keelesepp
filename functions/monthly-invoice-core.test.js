'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { monthlyInvoiceInput, monthlyInvoiceLines, monthlyInvoiceId } = require('./monthly-invoice-core');

test('validates the monthly invoice request', () => {
  assert.deepEqual(monthlyInvoiceInput({ studentId: 's1', month: '2026-10', due: '2026-10-10', plannedUnits: 4.333, correctionUnits: -1 }),
    { studentId: 's1', month: '2026-10', due: '2026-10-10', plannedUnits: 4.33, correctionUnits: -1, correctionNote: '' });
  assert.throws(() => monthlyInvoiceInput({ studentId: 's1', month: '2026-13', due: '2026-10-10', plannedUnits: 4 }), /month/);
  assert.throws(() => monthlyInvoiceInput({ studentId: 's1', month: '2026-10', due: 'x', plannedUnits: 4 }), /due/);
  assert.throws(() => monthlyInvoiceInput({ studentId: 's1', month: '2026-10', due: '2026-10-10', plannedUnits: 99 }), /plannedUnits/);
});

test('prices lines from the plan and nets the correction', () => {
  const result = monthlyInvoiceLines({ month: '2026-10', plannedUnits: 4, correctionUnits: -1, correctionNote: '1 puudumine ette teatatud' }, { lessonPriceCents: 2500, lessonMinutes: 60 });
  assert.equal(result.amountCents, 7500);
  assert.equal(result.lines.length, 2);
  assert.match(result.lines[0].description, /oktoober 2026: 4 × 60 min × 25,00 €/);
  assert.match(result.lines[1].description, /-1 tundi \(1 puudumine ette teatatud\)/);
  assert.throws(() => monthlyInvoiceLines({ month: '2026-10', plannedUnits: 1, correctionUnits: -1 }, { lessonPriceCents: 2500 }), /positive/);
  assert.throws(() => monthlyInvoiceLines({ month: '2026-10', plannedUnits: 1, correctionUnits: 0 }, {}), /price/);
  assert.equal(monthlyInvoiceId('s/1', '2026-10'), 'monthly_s_1_2026-10');
});
