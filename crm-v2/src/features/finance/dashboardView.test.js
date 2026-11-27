import { describe, expect, it } from 'vitest';
import { atStakeCents, barParts, endOfPeriodProfit, profitChange, sparkPoints, studentLinks, trendSeries, verdict } from './dashboardView.js';

const monthly = [
  { month: '2026-09', earnedCents: 400000, profitCents: 100000, tookPlace: 150, planned: 0, students: 30 },
  { month: '2026-10', earnedCents: 500000, profitCents: 200000, tookPlace: 200, planned: 0, students: 38 },
  { month: '2026-11', earnedCents: 450000, profitCents: 190000, expectedCents: 520000, expectedProfitCents: 240000, tookPlace: 180, planned: 25, students: 40 },
];

describe('dashboardView', () => {
  it('the period ends with the profit so far plus the calendar of the running month', () => {
    expect(endOfPeriodProfit({ pnl: { profitCents: 190000 }, monthly: monthly.slice(2) })).toBe(240000);
    expect(endOfPeriodProfit({ pnl: { profitCents: 390000 }, monthly: monthly.slice(1) })).toBe(440000);
    expect(endOfPeriodProfit({ pnl: { profitCents: 200000 }, monthly: monthly.slice(1, 2) })).toBe(200000);
  });

  it('compares the profit with the month before; nothing to compare with a loss or an empty month', () => {
    expect(profitChange({ monthly }, '2026-11')).toBe(20);
    expect(profitChange({ monthly }, '2026-10')).toBe(100);
    expect(profitChange({ monthly }, '2026-09')).toBeNull();
    expect(profitChange({ monthly: [{ month: '2026-10', earnedCents: 100, profitCents: -5 }, monthly[2]] }, '2026-11')).toBeNull();
  });

  it('trend lines: the months up to the chosen one, the running month with its calendar', () => {
    expect(trendSeries({ monthly }, '2026-11')).toEqual({ profit: [100000, 200000, 240000], revenue: [400000, 500000, 520000], lessons: [150, 200, 205], students: [30, 38, 40] });
    expect(trendSeries({ monthly }, '2026-10').revenue).toEqual([400000, 500000]);
    expect(sparkPoints([1, 3])).toEqual([[4, 30], [92, 4]]);
    expect(sparkPoints([5])).toEqual([]);
  });

  it('a bar splits into fixed costs, teacher pay and profit; a loss is all costs', () => {
    expect(barParts(1000, { fixedCents: 300, payCents: 200, profitCents: 500 })).toEqual({ fixed: 300, pay: 200, profit: 500, profitCents: 500 });
    expect(barParts(400, { fixedCents: 300, payCents: 200, profitCents: -100 })).toEqual({ fixed: 300, pay: 100, profit: 0, profitCents: -100 });
    expect(barParts(0, { fixedCents: 300 })).toBeNull();
    expect(barParts(100, undefined)).toBeNull();
  });

  it('the verdict: a good month, falling revenue, a loss; the owner line only when the school would lose', () => {
    const report = { pnl: { profitCents: 190000, fixedMonthCents: 130000, owner: { withoutOwnerCents: -14200 } }, monthly: monthly.slice(2), forecast: { revenueCents: 545800 } };
    expect(verdict({ summary: { changePercent: 2, totalCents: 520000 }, report })).toEqual({ tone: 'good', label: 'Hea kuu', change: 2, endRevenueCents: 520000, endProfitCents: 240000, nextCents: 545800, withoutOwnerCents: -14200, noCosts: false });
    expect(verdict({ summary: { changePercent: -12, totalCents: 1 }, report: { ...report, forecast: null }, period: 3 })).toMatchObject({ tone: 'warn', label: 'Tulu langeb', nextCents: null });
    expect(verdict({ summary: { changePercent: null, totalCents: 1 }, report: { pnl: { profitCents: -100, fixedMonthCents: 0, owner: { withoutOwnerCents: 50 } }, monthly: [{ profitCents: -100 }] } })).toMatchObject({ tone: 'bad', label: 'Kahjumis', withoutOwnerCents: null, noCosts: true });
  });

  it('links a name to its card when one card has it; sums what the students without lessons ahead brought', () => {
    const report = { studentRows: [{ id: 'a', name: 'Ann', planned: false, tookPlace: 2, earnedCents: 5000 }, { id: 'b', name: 'Ben', planned: true, tookPlace: 1, earnedCents: 2500 }, { id: 'c', name: 'Ben', planned: false, tookPlace: 0, earnedCents: 0 }], nothingAhead: ['Ann'] };
    const linkOf = studentLinks(report);
    expect(linkOf('Ann')).toBe('a');
    expect(linkOf('Ben')).toBeNull();
    expect(linkOf('Cat')).toBeNull();
    expect(atStakeCents(report)).toBe(5000);
  });
});
