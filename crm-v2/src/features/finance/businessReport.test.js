import { describe, expect, it } from 'vitest';
import { businessReport, lessonFacts, normalizeBusinessSettings } from './businessReport.js';

const students = [
  { id: 's1', name: 'Mia', teacher: 'Anna', subject: 'Eesti keel' },
  { id: 's2', name: 'Ott', teacher: 'Anna' },
  { id: 's3', name: 'Uku', teacher: 'Maria', subject: 'Matemaatika' },
  { id: 's4', name: 'Eva', teacher: 'Maria' },
];
const plans = [
  { studentId: 's1', lessonPriceCents: 2500, lessonMinutes: 60 },
  { studentId: 's2', lessonPriceCents: 2000, lessonMinutes: 60 },
  { studentId: 's3', lessonPriceCents: 3000, lessonMinutes: 60 },
];
const schedule = [
  // s1 every Monday since September; s2 Tuesdays in September only (lost); s3 starts in October (new); s4 no price
  { id: 'w1', studentId: 's1', teacher: 'Anna', recurring: true, day: 'Mon', startDate: '2026-09-01', duration: 60 },
  { id: 'w2', studentId: 's2', teacher: 'Anna', recurring: true, day: 'Tue', startDate: '2026-09-01', endDate: '2026-09-30', duration: 60 },
  { id: 'w3', studentId: 's3', teacher: 'Maria', subject: 'Matemaatika', recurring: true, day: 'Wed', startDate: '2026-10-01', duration: 60 },
  { id: 'o1', studentId: 's4', teacher: 'Maria', date: '2026-10-09', duration: 60 },
  { id: 'o2', studentId: 's1', teacher: 'Anna', date: '2026-10-10', duration: 60, status: 'Tühistatud' },
];
const lessons = [
  { id: 'l1', scheduleId: 'w1', studentId: 's1', date: '2026-10-05', status: 'Toimunud' },
  { id: 'l2', scheduleId: 'w1', studentId: 's1', date: '2026-10-12', status: 'Puudus_p' },
  { id: 'l3', scheduleId: 'w3', studentId: 's3', date: '2026-10-07', status: 'Puudus_eta' },
  { id: 'l4', scheduleId: 'w3', studentId: 's3', date: '2026-10-14', status: 'Toimunud', billingStatus: 'school_covered' },
];

describe('business report („Ärinäitajad”)', () => {
  it('every lesson of the period with what happened to it', () => {
    const facts = lessonFacts({ from: '2026-10-01', to: '2026-10-31', today: '2026-10-20', students, plans, schedule, lessons });
    const states = (id) => facts.filter((fact) => fact.studentId === id).map((fact) => `${fact.date}:${fact.state}`).sort();
    expect(states('s1')).toEqual(['2026-10-05:held', '2026-10-10:cancelled', '2026-10-12:absentNotified', '2026-10-19:unmarked', '2026-10-26:planned']);
    expect(states('s3')).toEqual(['2026-10-07:absentCharged', '2026-10-14:covered', '2026-10-21:planned', '2026-10-28:planned']);
    expect(states('s4')).toEqual(['2026-10-09:unmarked']);
  });

  it('lessons, money, students, new and lost, by teacher and subject, against the month before', () => {
    const report = businessReport({ current: '2026-10', months: 1, today: '2026-10-20', students, plans, schedule, lessons });
    expect(report).toMatchObject({ from: '2026-10-01', to: '2026-10-31' });
    // took place: s1 5th + 19th, s3 14th (covered), s4 9th; missed: s1 12th + 10th cancelled, s3 7th
    expect(report.now).toMatchObject({ held: 1, unmarked: 2, covered: 1, absentNotified: 1, absentCharged: 1, cancelled: 1, planned: 3, tookPlace: 4, missed: 3, attendance: 57 });
    expect(report.now.earnedCents).toBe(2500 + 2500 + 3000);
    expect(report.now.plannedCents).toBe(2500 + 3000 + 3000);
    // September: s1 4 Mondays, s2 5 Tuesdays, all unmarked (held)
    expect(report.before).toMatchObject({ tookPlace: 9, earnedCents: 4 * 2500 + 5 * 2000, students: 2 });
    expect(report.newStudents).toEqual(['Eva', 'Uku']);
    expect(report.lostStudents).toEqual(['Ott']);
    expect(report.unpriced).toEqual(['Eva']);
    expect(report.byTeacher.map((row) => [row.name, row.tookPlace, row.earnedCents])).toEqual([['Anna', 2, 5000], ['Maria', 2, 3000]]);
    expect(report.bySubject.map((row) => row.name)).toEqual(['Eesti keel', 'Matemaatika']);
    expect(report.change.earned).toBe(Math.round(((8000 - 20000) / 20000) * 100));
  });

  it('a longer period starts months back and compares with as many months before', () => {
    const report = businessReport({ current: '2026-10', months: 3, today: '2026-10-20', students, plans, schedule, lessons });
    expect(report).toMatchObject({ from: '2026-08-01', to: '2026-10-31' });
    expect(report.before.tookPlace).toBe(0);
    expect(report.change.earned).toBeNull();
  });
});

describe('teacher names in the report', () => {
  it('a first name alone joins the one full name that starts with it', async () => {
    const { teacherNames } = await import('./businessReport.js');
    const of = teacherNames(['Mari Tamm', 'Mari', 'Jüri', 'Kati Kask', 'Kati Mets', 'Kati', '']);
    expect([of('Mari'), of('Jüri'), of('Kati'), of('')]).toEqual(['Mari Tamm', 'Jüri', 'Kati', '—']);
  });
});

describe('teacher pay („доход с каждого учителя”)', () => {
  it('hours given × the hourly rate, a group lesson once; what stays with the school', () => {
    const team = [{ id: 's1', name: 'Mia' }, { id: 's2', name: 'Ott' }];
    const prices = [{ studentId: 's1', lessonPriceCents: 2500 }, { studentId: 's2', lessonPriceCents: 2500 }];
    const report = businessReport({
      current: '2026-10', months: 1, today: '2026-10-20', students: team, plans: prices,
      schedule: [{ id: 'g', isGroup: true, studentIds: ['s1', 's2'], teacher: 'Liza', date: '2026-10-05', duration: 90 }, { id: 'o', studentId: 's1', teacher: 'Pavel', date: '2026-10-06', duration: 60 }],
      teachers: [{ id: 't1', name: 'Liza Lukiianchuk', workHourlyRateCents: 1200 }, { id: 't2', name: 'Pavel Zakutailo' }],
    });
    const liza = report.byTeacher.find((row) => row.name === 'Liza Lukiianchuk');
    expect(liza).toMatchObject({ tookPlace: 2, hours: 1.5, rateCents: 1200, payCents: 1800, earnedCents: 7500, schoolCents: 5700 });
    expect(report.byTeacher.find((row) => row.name === 'Pavel Zakutailo')).toMatchObject({ payCents: null, schoolCents: 2500 });
    expect(report.pay).toEqual({ payCents: 1800, schoolCents: 10000 - 1800, unrated: ['Pavel Zakutailo'] });
  });
});

describe('the school economy (profit, owner, break-even, next month)', () => {
  const team = [{ id: 's1', name: 'Mia', active: true }, { id: 's2', name: 'Ott', active: true }];
  const prices = [{ studentId: 's1', lessonPriceCents: 2000 }, { studentId: 's2', lessonPriceCents: 2000 }];
  // Liza (12 €/h) teaches Mia on Mondays, the owner Pavel teaches Ott on Tuesdays; October 2026, today the 20th
  const schedule = [
    { id: 'm', studentId: 's1', teacher: 'Liza Lukiianchuk', recurring: true, day: 'Mon', startDate: '2026-10-01', duration: 60 },
    { id: 't', studentId: 's2', teacher: 'Pavel', recurring: true, day: 'Tue', startDate: '2026-10-01', endDate: '2026-10-31', duration: 60 },
  ];
  const teachers = [{ id: 'a', name: 'Liza Lukiianchuk', workHourlyRateCents: 1200 }, { id: 'b', name: 'Pavel Zakutailo' }];
  const settings = { fixedCosts: [{ label: 'Ruum', cents: 4000 }, { label: 'Admin', cents: 2000 }, { label: '', cents: 5 }], ownerTeacher: 'Pavel Zakutailo', ownerRateCents: 1000 };
  const report = businessReport({ current: '2026-10', months: 1, today: '2026-10-20', students: team, plans: prices, schedule, teachers, settings });

  it('settings are cleaned', () => {
    expect(normalizeBusinessSettings(settings).fixedCosts).toEqual([{ label: 'Ruum', cents: 4000 }, { label: 'Admin', cents: 2000 }]);
    expect(normalizeBusinessSettings(null)).toEqual({ fixedCosts: [], ownerTeacher: '', ownerRateCents: 0 });
  });

  it('profit = revenue − teacher pay − fixed costs; the owner’s lessons apart', () => {
    // held: Mia 5, 12, 19 (3 × 20 €), Ott 6, 13 (2 × 20 €); Liza paid 3 h × 12 €
    expect(report.pnl).toMatchObject({ revenueCents: 10000, teacherPayCents: 3600, fixedCents: 6000, profitCents: 400, marginPercent: 4, hours: 5, revenuePerHourCents: 2000 });
    expect(report.pnl.owner).toMatchObject({ name: 'Pavel Zakutailo', earnedCents: 4000, hours: 2, share: 40, payAtRateCents: 2000, profitAfterOwnerPayCents: -1600, withoutOwnerCents: -3600 });
    // Liza's hour leaves 8 € to the school: 60 € of fixed costs need 8 hours a month; 3 given
    expect(report.pnl.breakEven).toEqual({ marginPerHourCents: 800, hoursNeededPerMonth: 8, hoursPerMonthNow: 3 });
  });

  it('this month to the end by the calendar, the next month, students', () => {
    // still planned: Mia 26, Ott 20 and 27
    expect(report.monthly[0]).toMatchObject({ month: '2026-10', profitCents: 400, expectedCents: 16000, expectedProfitCents: 16000 - 4 * 1200 - 6000 });
    // November: Mia's Mondays 2, 9, 16, 23, 30; Ott's series ended
    expect(report.forecast).toEqual({ month: '2026-11', lessons: 5, revenueCents: 10000, teacherPayCents: 6000, fixedCents: 6000, profitCents: -2000 });
    expect(report.kinds.individual).toEqual({ lessons: 5, earnedCents: 10000 });
    expect(report.studentRows.map((row) => [row.name, row.tookPlace, row.lastLesson, row.planned])).toEqual([['Mia', 3, '2026-10-19', true], ['Ott', 2, '2026-10-13', true]]);
    expect(report.nothingAhead).toEqual([]);
  });
});
