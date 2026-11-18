import { combinedMonthlyPayload, invoiceItems, monthlyBillingRows, studentLessonBalances } from './monthlyBilling.js';

// „Õppesuunad: individuaalne / grupp” (team 2026-11-18): Mari takes Eesti keel individually (Wednesdays, 60 min) and in
// a calendar group (Mondays, 90 min). October 2031: Wednesdays 1, 8, 15, 22, 29; Mondays 6, 13, 20, 27.
const legacyCard = { id: 'k', name: 'Mari', active: true, subject: 'Eesti keel', parentEmail: 'ema@example.com', enrollments: [{ subject: 'Eesti keel', teacher: 'Pavel', teacherUid: 'p1' }] };
const card = { ...legacyCard, enrollments: [...legacyCard.enrollments, { subject: 'Eesti keel', teacher: 'Pavel', teacherUid: 'p1', format: 'group', groupId: 'g1' }] };
const schedule = [{ id: 'est', studentId: 'k', teacherUid: 'p1', recurring: true, day: 'Wed', startDate: '2031-09-03', time: '16:00', duration: 60, subject: 'Eesti keel' }];
const groups = [{ id: 'g1', name: 'Eesti A2', subject: 'Eesti keel', teacher: 'Pavel', teacherUid: 'p1', active: true, students: ['k'], lessons: [{ id: 'gl', day: 'Mon', time: '18:00', duration: 90, startDate: '2031-09-08', recurring: true }] }];
const plan = { studentId: 'k', lessonPriceCents: 2000, lessonMinutes: 60, billingMode: 'advance', chargeNoShow: true, weeklyLessons: 2 };
const groupPlan = { ...plan, groupPrices: { 'Eesti keel': { lessonPriceCents: 1200, lessonMinutes: 90 } } };
const rowOf = (student, p, extra = {}) => monthlyBillingRows({ month: '2031-10', students: [student], plans: [p], schedule, groups, lessons: [], invoices: [], ...extra })[0];

describe('monthly invoice per direction (individual / group)', () => {
  it('a legacy card in a calendar group bills exactly as before (one line, the card price)', () => {
    const row = rowOf(legacyCard, plan);
    expect(row.subjectParts).toBeNull();
    expect(row.plannedUnits).toBe(5 + 4 * 1.5);
    expect(row.totalCents).toBe(Math.round((5 + 6) * 2000));
    expect(row.formatWarnings).toEqual([]);
    expect(invoiceItems([row])).toEqual([{ studentId: 'k', plannedUnits: 11, correctionUnits: 0, correctionNote: '' }]);
  });

  it('a stored group direction: two lines, the group line at the group price „Eesti keel · grupp”', () => {
    const row = rowOf(card, groupPlan);
    expect(row.subjectParts.map((part) => [part.label, part.plannedUnits, part.priceCents])).toEqual([['Eesti keel', 5, 2000], ['Eesti keel · grupp', 4, 1200]]);
    expect(row.totalCents).toBe(5 * 2000 + 4 * 1200);
    expect(row.status).toBe('ready');
    expect(row.formatWarnings).toEqual([]);
    expect(combinedMonthlyPayload([row], '2031-10').items).toEqual([
      { studentId: 'k', subject: 'Eesti keel', plannedUnits: 5, correctionUnits: 0, correctionNote: '' },
      { studentId: 'k', subject: 'Eesti keel', format: 'group', plannedUnits: 4, correctionUnits: 0, correctionNote: '' },
    ]);
  });

  it('no group price: the group line falls back to the individual price and the row warns', () => {
    const row = rowOf(card, plan);
    const group = row.subjectParts.find((part) => part.format === 'group');
    expect(group.priceFallback).toBe(true);
    expect(group.priceCents).toBe(2000);
    expect(group.plannedUnits).toBe(6); // 4 × 90 min on a 60 min price
    expect(row.formatWarnings).toEqual(['Eesti keel · grupp: grupi hind puudub — grupitunnid arveldatakse individuaalse hinnaga. Määra grupi hind: õpilase kaart → Finantsid → Arveldus.']);
  });

  it('old invoices keep their meaning: group lessons they paid count on the individual balance', () => {
    const held = (date, extra) => ({ id: `${date}-${extra.groupId ? 'g' : 'i'}`, studentId: 'k', date, status: 'Toimunud', subject: 'Eesti keel', ...extra });
    const lessons = [
      ...['2031-09-03', '2031-09-10', '2031-09-17', '2031-09-24'].map((date) => held(date, { duration: 60, scheduleId: 'est', occurrenceDate: date })),
      ...['2031-09-08', '2031-09-15', '2031-09-22', '2031-09-29'].map((date) => held(date, { duration: 90, groupId: 'g1' })),
    ];
    // September was one invoice for the subject (before the split): 4 × 1 + 4 × 1.5 units
    const invoices = [{ id: 'sep', studentId: 'k', planMonth: '2031-09', plannedUnits: 10, correctionUnits: 0, amountCents: 20000 }];
    const row = rowOf(card, groupPlan, { lessons, invoices });
    expect(row.subjectParts.map((part) => [part.label, part.correction.units])).toEqual([['Eesti keel', 0], ['Eesti keel · grupp', 0]]);
    // after a group line was invoiced for October, November's group lessons are the group direction's
    const october = { id: 'oct', combined: true, studentIds: ['k'], studentId: 'k', planMonth: '2031-10', cardParts: [
      { studentId: 'k', subject: 'Eesti keel', plannedUnits: 5, correctionUnits: 0 },
      { studentId: 'k', subject: 'Eesti keel', format: 'group', plannedUnits: 4, correctionUnits: 0 },
    ] };
    const balances = studentLessonBalances({ student: card, plan: groupPlan, invoices: [...invoices, october], lessons, month: '2031-10' });
    expect(balances.map((balance) => [balance.label, balance.paid, balance.used])).toEqual([['Eesti keel', 15, 10], ['Eesti keel · grupp', 4, 0]]);
  });
});
