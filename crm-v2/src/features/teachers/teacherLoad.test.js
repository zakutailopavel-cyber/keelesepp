import { describe, expect, it } from 'vitest';
import { excludedCancellations, freeSlots, loadTotals, periodRange, tallinnClock, tallinnDay, tallinnDayOf, teacherLoad, waitingReviews } from './teacherLoad.js';

const TODAY = '2026-11-04'; // a Wednesday
const mari = { id: 't1', name: 'Mari Mets', role: 'teacher', workHourlyRateCents: 1500 };
const juri = { id: 't2', name: 'Jüri Saar', role: 'teacher' };
const students = [
  { id: 's1', name: 'Anna', teacher: 'Mari Mets', teacherUid: 't1', active: true },
  { id: 's2', name: 'Boris', teacher: 'Mari Mets', teacherUid: 't1', active: true },
  { id: 's3', name: 'Carl', teacher: 'Jüri Saar', teacherUid: 't2', active: true },
];
// Anna: every Monday 10:00 with Mari since 5 October; 16 November cancelled by excludedDates only
const series = { id: 'w1', studentId: 's1', studentName: 'Anna', teacher: 'Mari Mets', teacherUid: 't1', recurring: true, day: 'Mon', startDate: '2026-10-05', date: '2026-10-05', time: '10:00', duration: 60, status: 'Planeeritud', excludedDates: ['2026-11-16'] };
const schedule = [
  series,
  // Boris: one lesson on 3 November, he did not come and did not tell
  { id: 'o1', studentId: 's2', studentName: 'Boris', teacher: 'Mari Mets', teacherUid: 't1', recurring: false, date: '2026-11-03', time: '17:00', duration: 45, status: 'Planeeritud' },
  // Boris: a lesson cancelled as a whole
  { id: 'o2', studentId: 's2', studentName: 'Boris', teacher: 'Mari Mets', teacherUid: 't1', recurring: false, date: '2026-11-20', time: '17:00', duration: 45, status: 'Tühistatud' },
];
// a group of Mari: Anna and Carl, one lesson on 3 November
const groups = [{ id: 'g1', name: 'Grupp A', teacher: 'Mari Mets', teacherUid: 't1', students: ['s1', 's3'], lessons: [{ id: 'l1', recurring: false, date: '2026-11-03', time: '15:00', duration: 90 }] }];
const lessons = [
  { id: 'j1', scheduleId: 'w1', studentId: 's1', date: '2026-11-02', status: 'Toimunud', teacherUid: 't1', time: '10:00' },
  { id: 'j2', scheduleId: 'o1', studentId: 's2', date: '2026-11-03', status: 'Puudus_eta', teacherUid: 't1', time: '17:00' },
  { id: 'j3', scheduleId: 'w1', studentId: 's1', date: '2026-10-26', status: 'Puudus_p', teacherUid: 't1', time: '10:00' },
  // the group lesson: Anna came (Carl has no mark) — one lesson for the teacher
  { id: 'j4', studentId: 's1', date: '2026-11-03', status: 'Toimunud', teacherUid: 't1', time: '15:00' },
];

describe('Tallinn time', () => {
  it('uses the Tallinn day and clock in winter and in summer time', () => {
    expect(tallinnDay(new Date('2026-11-04T22:30:00Z'))).toBe('2026-11-05'); // UTC+2
    expect(tallinnClock(new Date('2026-11-04T22:30:00Z'))).toBe('00:30');
    expect(tallinnDay(new Date('2026-07-01T21:30:00Z'))).toBe('2026-07-02'); // UTC+3
    expect(tallinnDay(new Date('2026-07-01T20:30:00Z'))).toBe('2026-07-01');
  });
  it('reads stored instants and plain dates', () => {
    expect(tallinnDayOf('2026-11-03T23:10:00.000Z')).toBe('2026-11-04');
    expect(tallinnDayOf('2026-11-03')).toBe('2026-11-03');
    expect(tallinnDayOf({ toDate: () => new Date('2026-11-03T08:00:00Z') })).toBe('2026-11-03');
    expect(tallinnDayOf('')).toBe('');
  });
});

describe('periodRange', () => {
  it('gives a Monday-first week and a whole month', () => {
    expect(periodRange('week', TODAY)).toMatchObject({ from: '2026-11-02', to: '2026-11-08' });
    expect(periodRange('week', '2026-11-08')).toMatchObject({ from: '2026-11-02', to: '2026-11-08' });
    expect(periodRange('month', TODAY)).toMatchObject({ from: '2026-11-01', to: '2026-11-30', label: '2026-11' });
    expect(periodRange('month', '2027-02')).toMatchObject({ from: '2027-02-01', to: '2027-02-28' });
  });
});

describe('excludedCancellations', () => {
  it('counts a date cut out of a weekly series, not a moved one or a date outside the series', () => {
    const moved = { id: 'c1', seriesId: 'w1', originalOccurrenceDate: '2026-11-09', recurring: false, date: '2026-11-10', status: 'Planeeritud' };
    const all = [{ ...series, excludedDates: ['2026-11-16', '2026-11-09', '2026-11-17'] }, moved];
    expect(excludedCancellations(all, '2026-11-01', '2026-11-30').map((item) => item.date)).toEqual(['2026-11-16']);
    expect(excludedCancellations(all, '2026-11-01', '2026-11-15')).toEqual([]);
  });
});

describe('teacherLoad', () => {
  const run = (period, extra = {}) => teacherLoad({ teachers: [mari, juri], students, schedule, groups, lessons, period, today: TODAY, nowClock: '12:00', ...extra });

  it('counts the month: held, planned, cancelled, absences and hours (series, group once, cancellations)', () => {
    const [row] = run(periodRange('month', TODAY)).filter((item) => item.id === 't1');
    expect(row.students).toBe(2);
    expect(row.held).toBe(2); // Monday 2 Nov + the group lesson on 3 Nov
    expect(row.hours).toBe(2.5); // 60 + 90 min
    expect(row.planned).toBe(3); // Mondays 9, 23, 30 (16 cancelled)
    expect(row.cancelled).toBe(2); // 16 Nov (excluded date) + Boris on 20 Nov
    expect(row.absences).toBe(1);
    expect(row.absentUnnotified).toBe(1);
    expect(row.absentNotified).toBe(0);
  });

  it('counts the week only inside its dates', () => {
    const [row] = run(periodRange('week', TODAY)).filter((item) => item.id === 't1');
    expect(row).toMatchObject({ held: 2, planned: 0, cancelled: 0, absences: 1 });
  });

  it('counts a past absence the student reported', () => {
    const [row] = run(periodRange('month', '2026-10-01')).filter((item) => item.id === 't1');
    expect(row.absentNotified).toBe(1); // 26 Oct
    expect(row.held).toBe(0);
    expect(row.pastUnmarked).toBe(3); // 5, 12, 19 Oct
  });

  it('uses the ONE „märkimata” definition: from MARKING_START (1.11) up to yesterday', () => {
    const rows = run(periodRange('week', TODAY));
    // the unmarked Mondays 5, 12, 19 Oct are before 1.11 (owner 2026-11-09: not counted for now)
    expect(rows.find((item) => item.id === 't1').unmarked).toBe(0);
    expect(rows.find((item) => item.id === 't2').unmarked).toBe(0);
  });

  it('estimates pay by the „Ärinäitajad” rule and leaves a teacher without a rate undefined', () => {
    const rows = run(periodRange('month', TODAY));
    const row = rows.find((item) => item.id === 't1');
    // held 60 + group 90 + charged no-show 45 = 195 min × 15 €/h
    expect(row.pay).toMatchObject({ rateCents: 1500, payCents: 4875 });
    expect(row.pay.forecastCents).toBe(4875 + 3 * 1500); // + the three Mondays still planned
    expect(rows.find((item) => item.id === 't2').pay).toMatchObject({ rateCents: null, payCents: null });
    expect(loadTotals(rows)).toMatchObject({ held: 2, payCents: 4875, unrated: ['Jüri Saar'] });
  });

  it('keeps an archived student’s lessons countable and leaves out a disabled teacher', () => {
    const rows = teacherLoad({ teachers: [mari, { ...juri, disabled: true }], students: students.filter((item) => item.id !== 's2'), schedule, groups, lessons, period: periodRange('month', TODAY), today: TODAY });
    expect(rows.map((item) => item.id)).toEqual(['t1']);
    expect(rows[0].absences).toBe(1); // Boris archived, his no-show still counts
    expect(rows[0].students).toBe(1);
  });
});

describe('freeSlots', () => {
  const availability = { teacherUid: 't1', slots: [
    { id: 'a', kind: 'free', day: 'Mon', start: '09:00', end: '13:00' },
    { id: 'b', kind: 'free', day: 'Wed', start: '10:00', end: '14:00' },
    { id: 'c', kind: 'online', day: 'Thu', start: '14:00', end: '16:00' },
    { id: 'd', kind: 'busy', date: '2026-11-05', start: '14:00', end: '15:00' },
  ] };
  it('takes the windows minus lessons, red windows and the past part of today', () => {
    const free = freeSlots({ availability, events: [series], teacher: mari, today: TODAY, nowClock: '12:00', days: 2 });
    expect(free.windows).toEqual([
      { date: '2026-11-04', start: '12:00', end: '14:00', minutes: 120, online: false, slots: 2 },
      { date: '2026-11-05', start: '15:00', end: '16:00', minutes: 60, online: true, slots: 1 },
    ]);
    expect(free.count).toBe(3);
  });
  it('subtracts the teacher’s lessons but not a cancelled date', () => {
    const free = freeSlots({ availability, events: [series], teacher: mari, today: '2026-11-09', days: 8 });
    const mondays = free.windows.filter((item) => item.date === '2026-11-09' || item.date === '2026-11-16');
    expect(mondays.map((item) => `${item.date} ${item.start}-${item.end}`)).toEqual(['2026-11-09 09:00-10:00', '2026-11-09 11:00-13:00', '2026-11-16 09:00-13:00']);
  });
  it('ignores another teacher’s lessons and says when no times are marked', () => {
    const other = { ...series, teacherUid: 't2', teacher: 'Jüri Saar' };
    expect(freeSlots({ availability, events: [other], teacher: mari, today: '2026-11-09', days: 1 }).count).toBe(4);
    expect(freeSlots({ availability: null, teacher: mari, today: TODAY })).toMatchObject({ count: 0, hasAvailability: false });
  });
});

describe('waitingReviews', () => {
  const submissions = [
    { id: 'w1', studentId: 's1', reviewStatus: 'pending', completedAt: '2026-10-28T09:00:00.000Z', source: { assignedBy: 't1' } },
    { id: 'w2', studentId: 's1', reviewStatus: 'pending', completedAt: '2026-11-03T21:30:00.000Z', source: {} }, // 4 Nov in Tallinn
    { id: 'w3', studentId: 's1', reviewStatus: 'reviewed', completedAt: '2026-10-01T09:00:00.000Z', source: {} },
    { id: 'w4', studentId: 's3', reviewStatus: 'pending', completedAt: '2026-11-01T09:00:00.000Z', source: { assignedBy: 'admin-x' } },
    { id: 'w5', studentId: 'gone', reviewStatus: 'pending', completedAt: '2026-09-01T09:00:00.000Z', source: {} },
  ];
  it('counts waiting and overdue works with the oldest age, by the giver or the student’s teacher', () => {
    const rows = waitingReviews({ submissions, students, teachers: [mari, juri], today: TODAY });
    expect(rows.get('t1')).toEqual({ waiting: 2, overdue: 1, oldestDays: 7 });
    expect(rows.get('t2')).toEqual({ waiting: 1, overdue: 0, oldestDays: 3 }); // an admin's sheet goes to Carl's teacher
    expect(rows.has('gone')).toBe(false);
  });
});
