import { describe, expect, it } from 'vitest';
import { businessReport, lessonFacts } from './businessReport.js';

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
