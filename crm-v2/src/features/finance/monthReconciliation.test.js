import { describe, expect, it } from 'vitest';
import { lessonPriceCents, monthLabel, monthReconciliation } from './monthReconciliation.js';

const month = '2026-11';
const today = new Date('2026-11-27T12:00:00');
const students = [
  { id: 's1', name: 'Mia Tamm' }, { id: 's2', name: 'Arseni Kask' }, { id: 's3', name: 'Demjan Saar' },
  { id: 's4', name: 'Liis Lepp' }, { id: 's5', name: 'Vend Lepp' }, { id: 's6', name: 'Ott Paju' },
];
const plans = [
  { studentId: 's1', lessonPriceCents: 2500, lessonMinutes: 60 },
  { studentId: 's2', lessonPriceCents: 2500, lessonMinutes: 60, cashSubjects: ['*'] },
  { studentId: 's3', lessonPriceCents: 2000, lessonMinutes: 60 },
  { studentId: 's4', lessonPriceCents: 2500, lessonMinutes: 60 },
  { studentId: 's5', lessonPriceCents: 2500, lessonMinutes: 60 },
  { studentId: 's6', lessonPriceCents: 3000, lessonMinutes: 60, billingMode: 'actual' },
];
const held = (id, studentId, date, extra = {}) => ({ id, studentId, date, status: 'Toimunud', duration: 60, ...extra });
const run = (input) => monthReconciliation({ month, students, plans, today, ...input });

describe('monthReconciliation', () => {
  it('a paid invoice matches, an unpaid one is listed with its balance', () => {
    const result = run({
      invoices: [
        { id: 'i1', num: 'KS-101', studentId: 's1', planMonth: month, amountCents: 10000, paidAmountCents: 10000, status: 'Makstud' },
        { id: 'i2', num: 'KS-102', studentId: 's3', planMonth: month, amountCents: 8000, paidAmountCents: 2000, due: '2026-11-10' },
      ],
      lessons: [held('l1', 's1', '2026-11-03'), held('l2', 's3', '2026-11-04')],
    });
    expect(result.matched.map((row) => row.name)).toEqual(['Mia Tamm']);
    expect(result.open).toEqual([expect.objectContaining({ name: 'Demjan Saar', kind: 'invoice', reason: 'Arve osaliselt tasutud', detail: 'KS-102', amountCents: 6000 })]);
    expect(result).toMatchObject({ total: 2, openCents: 6000, percent: 50 });
  });

  it('a „Maksab sularahas” card is not a debtor: it waits for „Sain kätte”, and a receipt in the month settles it', () => {
    const lessons = [held('l1', 's2', '2026-11-03'), held('l2', 's2', '2026-11-10'), held('l3', 's2', '2026-11-17', { cashPaid: { receiptId: 'r0', amountCents: 2500 } })];
    const before = run({ lessons });
    expect(before.open).toEqual([expect.objectContaining({ kind: 'cash', reason: 'Maksab sularahas · 2 tundi kinnitamata', amountCents: 5000, lessonCount: 2 })]);
    const receipt = { id: 'c1', type: 'receipt', source: 'teacher', status: 'open', purpose: 'lessons', studentId: 's2', amountCents: 5000, receivedAt: '2026-11-20' };
    const after = run({ lessons, cashEntries: [receipt] });
    expect(after.open).toEqual([]);
    expect(after.matched).toEqual([expect.objectContaining({ name: 'Arseni Kask', how: 'sularaha', amountCents: 7500 })]);
    // a voided receipt, another month's receipt and „muu” cash do not count
    for (const change of [{ status: 'void' }, { receivedAt: '2026-12-01' }, { purpose: 'other' }]) expect(run({ lessons, cashEntries: [{ ...receipt, ...change }] }).open).toHaveLength(1);
  });

  it('held lessons without an invoice are listed; invoiced, package, school-covered and other months are not', () => {
    const result = run({ lessons: [
      held('l1', 's1', '2026-11-03'), held('l2', 's1', '2026-11-05', { duration: 90 }),
      held('l3', 's1', '2026-11-06', { invoiceId: 'x' }), held('l4', 's1', '2026-11-07', { packageConsumptionStatus: 'consumed' }),
      held('l5', 's1', '2026-11-08', { billingStatus: 'school_covered' }), held('l6', 's1', '2026-10-30'),
      { id: 'l7', studentId: 's1', date: '2026-11-09', status: 'Puudus_p' },
    ] });
    expect(result.open).toEqual([expect.objectContaining({ kind: 'lessons', reason: '2 tundi ilma arveta', amountCents: 6250 })]);
  });

  it('a family invoice covers every card on it; „pärast tunde” cards are covered by next month\'s invoice', () => {
    const result = run({
      invoices: [
        { id: 'i1', num: 'KS-200', studentId: 's4', studentIds: ['s4', 's5'], combined: true, planMonth: month, amountCents: 20000, paidAmountCents: 20000 },
        { id: 'i2', num: 'KS-201', studentId: 's6', planMonth: '2026-12', amountCents: 6000 },
      ],
      lessons: [held('l1', 's4', '2026-11-03'), held('l2', 's5', '2026-11-03'), held('l3', 's6', '2026-11-04')],
    });
    expect(result.open).toEqual([]);
    expect(result.matched.map((row) => row.name)).toEqual(['Liis Lepp', 'Ott Paju', 'Vend Lepp']);
  });

  it('cancelled and credited invoices bill nothing; FIE invoices are the owner\'s alone', () => {
    const invoices = [
      { id: 'i1', studentId: 's1', planMonth: month, amountCents: 5000, status: 'Tühistatud' },
      { id: 'i2', studentId: 's1', planMonth: month, amountCents: 5000, status: 'Krediteeritud' },
      { id: 'i3', num: 'FIE-7', studentId: 's3', planMonth: month, amountCents: 4000, issuer: 'fie' },
    ];
    expect(run({ invoices }).total).toBe(0);
    expect(run({ invoices, includeFie: true }).open).toEqual([expect.objectContaining({ name: 'Demjan Saar', amountCents: 4000 })]);
  });

  it('an invoice without a student card is kept under the payer; the month falls back to the invoice date', () => {
    const result = run({ invoices: [{ id: 'i1', num: 'KS-300', payerName: 'Firma OÜ', date: '2026-11-12', amountCents: 12000, due: '2026-11-20' }] });
    expect(result.open).toEqual([expect.objectContaining({ key: 'payer:Firma OÜ', studentId: '', name: 'Firma OÜ', reason: 'Arve üle tähtaja', amountCents: 12000 })]);
  });

  it('the largest amount comes first; lessons on a card without a price are still shown', () => {
    const result = monthReconciliation({ month, today, students: [...students, { id: 's7', name: 'Hinnata Õpilane' }], plans,
      invoices: [{ id: 'i1', studentId: 's1', planMonth: month, amountCents: 3000 }, { id: 'i2', studentId: 's3', planMonth: month, amountCents: 9000 }],
      lessons: [held('l1', 's7', '2026-11-03')] });
    expect(result.open.map((row) => row.name)).toEqual(['Demjan Saar', 'Mia Tamm', 'Hinnata Õpilane']);
    expect(result.open[2]).toMatchObject({ amountCents: 0, detail: 'kaardil puudub hind' });
  });

  it('prices a further subject by its own price and names the month', () => {
    const plan = { lessonPriceCents: 2500, lessonMinutes: 60, subjectPrices: { Matemaatika: { lessonPriceCents: 3000, lessonMinutes: 45 } } };
    expect(lessonPriceCents({ subject: 'matemaatika', duration: 90 }, plan)).toBe(6000);
    expect(lessonPriceCents({ subject: 'Eesti keel' }, plan)).toBe(2500);
    expect(lessonPriceCents({}, {}, { lessonPrice: 20 })).toBe(2000);
    expect(monthLabel('2026-11')).toBe('november 2026');
  });
});
