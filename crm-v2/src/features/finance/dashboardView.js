// How „Tulu ja prognoos” words and draws the numbers of financeDashboard.js and businessReport.js (owner 2026-11-27:
// „выглядит вообще не понятно” → one sentence, four numbers, the rest one click away). Pure, and no money rule of its
// own: every amount comes from periodSummary or businessReport as it is.

const value = (row, key, expectedKey) => (row?.[expectedKey] ?? row?.[key] ?? 0);

// what the period ends with: the profit so far plus what the calendar still adds to the running month
export function endOfPeriodProfit(report) {
  const current = report?.monthly?.[report.monthly.length - 1];
  if (!report?.pnl) return 0;
  return current?.expectedProfitCents === undefined ? report.pnl.profitCents : report.pnl.profitCents + current.expectedProfitCents - current.profitCents;
}

// profit of the month against the month before it, in percent; null when there is nothing fair to compare with
export function profitChange(trend, month) {
  const rows = trend?.monthly || [];
  const at = rows.findIndex((row) => row.month === month);
  if (at < 1) return null;
  const before = rows[at - 1];
  if (!(before.earnedCents > 0) || !(before.profitCents > 0)) return null;
  return Math.round(((value(rows[at], 'profitCents', 'expectedProfitCents') - before.profitCents) / before.profitCents) * 100);
}

// the last `count` months up to `month` for the small trend lines (the running month with its calendar)
export function trendSeries(trend, month, count = 6) {
  const rows = (trend?.monthly || []).filter((row) => row.month <= month).slice(-count);
  const first = rows.findIndex((row) => row.earnedCents || row.planned);
  const shown = first < 0 ? [] : rows.slice(first);
  return {
    profit: shown.map((row) => value(row, 'profitCents', 'expectedProfitCents')),
    revenue: shown.map((row) => value(row, 'earnedCents', 'expectedCents')),
    lessons: shown.map((row) => row.tookPlace + (row.planned || 0)),
    students: shown.map((row) => row.students),
  };
}

// points of a small trend line in a width × height box
export function sparkPoints(values = [], width = 96, height = 34, pad = 4) {
  if (values.length < 2) return [];
  const max = Math.max(...values);
  const min = Math.min(...values);
  const step = (width - pad * 2) / (values.length - 1);
  return values.map((item, index) => [Math.round((pad + index * step) * 10) / 10, Math.round((height - pad - ((item - min) / (max - min || 1)) * (height - pad * 2)) * 10) / 10]);
}

// how a month's bar splits into fixed costs, teacher pay and profit; a loss fills the whole bar with costs
export function barParts(heldCents, row) {
  if (!row || !(heldCents > 0)) return null;
  const fixed = Math.min(row.fixedCents || 0, heldCents);
  const pay = Math.min(row.payCents || 0, heldCents - fixed);
  return { fixed, pay, profit: heldCents - fixed - pay, profitCents: row.profitCents };
}

/**
 * The block in one sentence. → { tone: good | warn | bad, label, change, comparable, endRevenueCents, endProfitCents,
 * nextCents (null: no forecast), withoutOwnerCents (only when it is a loss), noCosts }
 */
export function verdict({ summary, report, period = 1 } = {}) {
  const endProfitCents = endOfPeriodProfit(report);
  const change = summary?.changePercent ?? null;
  const withoutOwner = report?.pnl?.owner?.withoutOwnerCents;
  const tone = endProfitCents < 0 ? 'bad' : change !== null && change <= -5 ? 'warn' : 'good';
  const unit = period === 1 ? 'kuu' : 'periood';
  return {
    tone,
    label: tone === 'bad' ? 'Kahjumis' : tone === 'warn' ? 'Tulu langeb' : `Hea ${unit}`,
    change,
    endRevenueCents: summary?.totalCents || 0,
    endProfitCents,
    nextCents: report?.forecast ? report.forecast.revenueCents : null,
    withoutOwnerCents: withoutOwner < 0 ? withoutOwner : null,
    noCosts: Boolean(report?.pnl) && !report.pnl.fixedMonthCents,
  };
}

// names of the report with the student's card when the period knows it (one card per name only)
export function studentLinks(report) {
  const seen = new Map();
  (report?.studentRows || []).forEach((row) => seen.set(row.name, seen.has(row.name) ? null : row.id));
  return (name) => seen.get(name) || null;
}

// what the students with nothing in the calendar brought in this period
export function atStakeCents(report) {
  const names = new Set(report?.nothingAhead || []);
  return (report?.studentRows || []).filter((row) => !row.planned && row.tookPlace && names.has(row.name)).reduce((sum, row) => sum + row.earnedCents, 0);
}
