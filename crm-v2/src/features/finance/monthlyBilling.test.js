import { defaultBillingMonth, defaultDue, monthlyBillingRows, monthlyInvoicePayload, shiftMonth } from './monthlyBilling.js';

const students = [
  { id: 's1', name: 'Mari', active: true, parentEmail: 'mari@example.com' },
  { id: 's2', name: 'Jaan', active: true },
  { id: 's3', name: 'Vana', active: false },
];
const plans = [
  { studentId: 's1', lessonPriceCents: 2500, lessonMinutes: 60, billingMode: 'current', chargeNoShow: true },
  { studentId: 's2', lessonPriceCents: 3000, lessonMinutes: 60, billingMode: 'advance', chargeNoShow: true },
];
// October 2031: Wednesdays 1, 8, 15, 22, 29
const schedule = [
  { id: 'e1', studentId: 's1', recurring: true, day: 'Wed', startDate: '2031-09-03', time: '16:00', duration: 60, excludedDates: ['2031-10-22'] },
  { id: 'e2', studentId: 's2', recurring: true, day: 'Wed', startDate: '2031-09-03', time: '17:00', duration: 90 },
];
const groups = [{ id: 'g1', name: 'A2', students: ['s1'], lessons: [{ id: 'gl', day: 'Fri', time: '18:00', duration: 60, recurring: true, startDate: '2031-10-01', endDate: '2031-10-10' }] }];

describe('monthly billing', () => {
  it('counts planned lessons (individual + group, skipping cancelled dates) and lesson length', () => {
    const rows = monthlyBillingRows({ month: '2031-10', students, plans, schedule, groups, lessons: [], invoices: [] });
    const mari = rows.find((row) => row.student.id === 's1');
    expect(mari.lessonCount).toBe(6); // 4 Wednesdays + Fridays 3 and 10
    expect(mari.plannedUnits).toBe(6);
    expect(mari.totalCents).toBe(15000);
    expect(mari.due).toBe('2031-10-10');
    const jaan = rows.find((row) => row.student.id === 's2');
    expect(jaan.plannedUnits).toBe(7.5); // 5 × 90 min on a 60 min price
    expect(jaan.due).toBe('2031-09-30');
    expect(rows.some((row) => row.student.id === 's3')).toBe(false);
  });

  it('corrects by last month: notified absence and waived no-show credited, extra lesson charged', () => {
    const invoices = [{ studentId: 's1', planMonth: '2031-09', plannedUnits: 4, status: 'Ootel' }];
    const lessons = [
      { id: 'l1', studentId: 's1', date: '2031-09-03', status: 'Toimunud', duration: 60 },
      { id: 'l2', studentId: 's1', date: '2031-09-10', status: 'Puudus_p', duration: 60 },
      { id: 'l3', studentId: 's1', date: '2031-09-17', status: 'Puudus_eta', duration: 60 },
      { id: 'l4', studentId: 's1', date: '2031-09-24', status: 'Puudus_eta', duration: 60, billingWaived: true },
    ];
    const mari = monthlyBillingRows({ month: '2031-10', students, plans, schedule, groups, lessons, invoices }).find((row) => row.student.id === 's1');
    expect(mari.correction.units).toBe(-2);
    expect(mari.correction.note).toBe('1 ette teatatud puudumist, 1 erandit');
    expect(mari.correction.noShows.map((lesson) => lesson.id)).toEqual(['l3', 'l4']);
    expect(mari.totalCents).toBe((6 - 2) * 2500);
    expect(monthlyInvoicePayload(mari, '2031-10')).toEqual({ studentId: 's1', month: '2031-10', due: '2031-10-10', plannedUnits: 6, correctionUnits: -2, correctionNote: '1 ette teatatud puudumist, 1 erandit' });
  });

  it('marks months already invoiced and students without a price', () => {
    const rows = monthlyBillingRows({ month: '2031-10', students, plans: [plans[1]], schedule, groups, lessons: [], invoices: [{ studentId: 's2', planMonth: '2031-10', num: 'KS-2031-001', status: 'Ootel' }] });
    expect(rows.find((row) => row.student.id === 's1').status).toBe('no-price');
    expect(rows.find((row) => row.student.id === 's2').status).toBe('invoiced');
  });

  it('picks the month and due dates', () => {
    expect(defaultBillingMonth(new Date(2031, 9, 5))).toBe('2031-10');
    expect(defaultBillingMonth(new Date(2031, 9, 20))).toBe('2031-11');
    expect(shiftMonth('2031-01', -1)).toBe('2030-12');
    expect(defaultDue('2031-03', 'advance')).toBe('2031-02-28');
  });
});
