import { describe, expect, it } from 'vitest';
import { lessonPriceCents, lessonRevenue, lessonSummary, monthRange, niceMax, smoothPath } from './financeDashboard.js';

const students = [{ id: 's1', name: 'Mia', active: true, subject: 'Eesti keel' }, { id: 's2', name: 'Ott', active: false }];
const plans = [{ studentId: 's1', lessonPriceCents: 2500, lessonMinutes: 60, subjectPrices: { Matemaatika: { lessonPriceCents: 3000, lessonMinutes: 45 } } }, { studentId: 's2', lessonPriceCents: 2000, lessonMinutes: 60, chargeNoShow: true }];
// Mondays: 5, 12, 19, 26 October; Tuesdays 6, 13, 20, 27
const schedule = [
  { id: 'w1', studentId: 's1', recurring: true, day: 'Mon', startDate: '2026-09-01', time: '17:00', duration: 60, status: 'Planeeritud' },
  { id: 'w2', studentId: 's2', recurring: true, day: 'Tue', startDate: '2026-09-01', endDate: '2026-10-31', time: '17:00', duration: 90, status: 'Planeeritud' },
];

describe('finance dashboard: lesson revenue (not the bookkeeping)', () => {
  it('months, a round scale and a smooth line', () => {
    expect(monthRange('2026-02', 4)).toEqual(['2025-11', '2025-12', '2026-01', '2026-02']);
    expect(niceMax(387000)).toBe(500000);
    expect(smoothPath([[0, 10], [10, 0], [20, 10]])).toMatch(/^M0,10 C/);
  });

  it('a lesson is priced by its length and the subject’s own price', () => {
    expect(lessonPriceCents({ duration: 90 }, students[0], plans[0])).toBe(3750);
    expect(lessonPriceCents({ duration: 45, subject: 'Matemaatika' }, { ...students[0], subjects: ['Eesti keel', 'Matemaatika'] }, plans[0])).toBe(3000);
    expect(lessonPriceCents({ duration: 60 }, students[0], null)).toBe(0);
  });

  it('held before today (marked, charged no-show or unmarked), planned from today, cancelled and notified absences not', () => {
    const lessons = [
      { id: 'l1', scheduleId: 'w1', studentId: 's1', date: '2026-10-05', status: 'Toimunud' },
      { id: 'l2', scheduleId: 'w1', studentId: 's1', date: '2026-10-12', status: 'Puudus_p' },
      { id: 'l3', scheduleId: 'w2', studentId: 's2', date: '2026-10-06', status: 'Puudus_eta' },
      { id: 'l4', studentId: 's1', date: '2026-10-08', status: 'Toimunud', duration: 60 }, // only in the journal
    ];
    const [october, november] = lessonRevenue({ months: ['2026-10', '2026-11'], today: '2026-10-20', students, plans, schedule, lessons });
    // s1: 5th held, 12th notified absence, 19th unmarked (held), 26th planned; journal-only 8th held
    // s2 (archived card, past lessons still count): 6th charged no-show, 13th unmarked, 20th and 27th planned (90 min = 30 €)
    expect(october).toMatchObject({ heldLessons: 5, heldCents: 2500 + 2500 + 2500 + 3000 + 3000, unmarkedLessons: 2, plannedLessons: 3, plannedCents: 2500 + 3000 + 3000 });
    expect(november).toMatchObject({ heldLessons: 0, plannedLessons: 5, plannedCents: 5 * 2500 });
  });

  it('a card without a price is counted apart; the summary adds this month and the forecast', () => {
    const [october] = lessonRevenue({ months: ['2026-10'], today: '2026-10-01', students: [{ id: 'x', name: 'X' }], plans: [], schedule: [{ id: 'w', studentId: 'x', recurring: true, day: 'Mon', startDate: '2026-09-01', duration: 60 }] });
    expect(october).toMatchObject({ plannedCents: 0, noPrice: 4 });
    const rows = [
      { month: '2026-09', heldCents: 100000, heldLessons: 40, plannedCents: 0, plannedLessons: 0, unmarkedLessons: 3 },
      { month: '2026-10', heldCents: 80000, heldLessons: 30, plannedCents: 40000, plannedLessons: 15, unmarkedLessons: 2 },
      { month: '2026-11', heldCents: 0, heldLessons: 0, plannedCents: 130000, plannedLessons: 50, unmarkedLessons: 0 },
      { month: '2026-12', heldCents: 0, heldLessons: 0, plannedCents: 120000, plannedLessons: 48, unmarkedLessons: 0 },
    ];
    expect(lessonSummary({ rows, current: '2026-10' })).toMatchObject({ heldCents: 80000, plannedCents: 40000, monthTotalCents: 120000, changePercent: 20, averageMonthCents: 100000, unmarkedLessons: 5, forecastCents: 250000 });
  });
});

describe('periodSummary', () => {
  it('sums a period ending this month, compares with the one before, and the months ahead', async () => {
    const { periodSummary } = await import('./financeDashboard.js');
    const row = (month, held, planned = 0) => ({ month, heldCents: held, plannedCents: planned, heldLessons: held / 100, plannedLessons: planned / 100, unmarkedLessons: 0 });
    const rows = [row('2026-05', 100), row('2026-06', 100), row('2026-07', 100), row('2026-08', 200), row('2026-09', 200), row('2026-10', 100, 100), row('2026-11', 0, 300), row('2026-12', 0, 300), row('2027-01', 0, 300)];
    const q = periodSummary({ rows, current: '2026-10', months: 3 });
    expect(q).toMatchObject({ from: '2026-08', heldCents: 500, plannedCents: 100, totalCents: 600, changePercent: 100, averageMonthCents: 200, aheadCents: 900, aheadMonths: 3 });
    expect(periodSummary({ rows, current: '2026-10', months: 12 }).changePercent).toBeNull();
  });
});
