import { revenueForecast } from './finance.js';
import { lessonPrice, lessonRevenue } from './financeDashboard.js';
import { groupForecast, weeklyForecastCents } from './subjectBilling.js';
import { groupPricesOf, validateGroupPrices } from '../../services/firebase/revenuePlans.js';

// „Individuaalne / Grupp”, owner 2026-11-18: the revenue forecast and the calendar revenue use the group price for group
// lessons, with the same fallback (the individual price) and a warning
const plan = { studentId: 'k', studentName: 'Mari', lessonPriceCents: 2500, lessonMinutes: 60, weeklyLessons: 1, active: true };
const student = { id: 'k', name: 'Mari', subject: 'Eesti keel', enrollments: [{ subject: 'Eesti keel' }, { subject: 'Eesti keel', format: 'group' }] };

describe('revenue forecast with group lessons', () => {
  it('group lessons per week × the group price; the card’s „Tunde nädalas” are the individual lessons', () => {
    const withGroup = { ...plan, groupPrices: { 'Eesti keel': { lessonPriceCents: 1200, lessonMinutes: 60, weeklyLessons: 2 } } };
    expect(weeklyForecastCents(plan)).toBe(2500);
    expect(weeklyForecastCents(withGroup)).toBe(2500 + 2 * 1200);
    expect(revenueForecast([withGroup]).rows[0]).toMatchObject({ weeklyCents: 4900, groupFallback: [] });
  });

  it('no group price: the individual price and a warning on the row', () => {
    const noPrice = { ...plan, groupPrices: { 'Eesti keel': { lessonPriceCents: 0, lessonMinutes: 60, weeklyLessons: 2 } } };
    expect(groupForecast(noPrice)).toEqual({ weeklyCents: 5000, fallbackSubjects: ['Eesti keel'] });
    expect(revenueForecast([noPrice]).rows[0]).toMatchObject({ weeklyCents: 7500, groupFallback: ['Eesti keel'] });
  });

  it('stores lessons per week next to the group price, also without a price', () => {
    expect(validateGroupPrices({ 'Eesti keel': { lessonPrice: '', lessonMinutes: '60', weeklyLessons: '1,5' } }).prices).toEqual({ 'Eesti keel': { lessonPriceCents: 0, lessonMinutes: 60, weeklyLessons: 1.5 } });
    expect(validateGroupPrices({ 'Eesti keel': { lessonPrice: 'x' } }).valid).toBe(false);
    expect(validateGroupPrices({ 'Eesti keel': { lessonPrice: '', weeklyLessons: '' } }).prices).toEqual({});
    expect(groupPricesOf({ 'Eesti keel': { lessonPriceCents: 0 }, Matemaatika: { lessonPriceCents: 900, weeklyLessons: 1 } })).toEqual({ Matemaatika: { lessonPriceCents: 900, lessonMinutes: 60, weeklyLessons: 1 } });
  });
});

describe('calendar revenue with group lessons', () => {
  const groups = [{ id: 'g1', name: 'Eesti A2', subject: 'Eesti keel', active: true, students: ['k'], lessons: [{ id: 'gl', day: 'Mon', time: '18:00', duration: 90, startDate: '2031-09-01', recurring: true }] }];
  it('a group lesson at the group price, an individual lesson at the individual price', () => {
    const withGroup = { ...plan, groupPrices: { 'Eesti keel': { lessonPriceCents: 1800, lessonMinutes: 90 } } };
    expect(lessonPrice({ isGroup: true, duration: 90 }, student, withGroup)).toEqual({ cents: 1800, groupFallback: false });
    expect(lessonPrice({ duration: 60 }, student, withGroup)).toEqual({ cents: 2500, groupFallback: false });
    // October 2031: Mondays 6, 13, 20, 27 — all planned (today before the month)
    const [row] = lessonRevenue({ months: ['2031-10'], today: '2031-09-30', students: [student], plans: [withGroup], groups });
    expect(row).toMatchObject({ plannedLessons: 4, plannedCents: 4 * 1800, groupNoPrice: 0 });
  });

  it('no group price: the individual price and the lessons are counted for the warning (legacy cards: no warning)', () => {
    const [row] = lessonRevenue({ months: ['2031-10'], today: '2031-09-30', students: [student], plans: [plan], groups });
    expect(row).toMatchObject({ plannedCents: 4 * 3750, groupNoPrice: 4 });
    const legacy = { id: 'k', name: 'Mari', subject: 'Eesti keel' };
    expect(lessonRevenue({ months: ['2031-10'], today: '2031-09-30', students: [legacy], plans: [plan], groups })[0]).toMatchObject({ plannedCents: 4 * 3750, groupNoPrice: 0 });
  });
});
