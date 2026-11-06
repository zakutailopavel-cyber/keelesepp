import { invoiceItems, monthlyBillingRows, studentLessonBalances } from './monthlyBilling.js';
import { goldenOf } from './legacyBillingFixtures.js';
import golden from './monthlyBilling.golden.json';

// Per-subject billing (owner 2026-11-06) must not change a plan that has no `subjectBilling`: the rows, the invoice
// items sent to the server and the lessons left are the same as the code before it made them (golden file made by
// origin/main d3ed25d on the same fixtures: current, advance without stored mode, package, actual with free no-shows,
// and a two-subject card with its own maths price and last month's combined invoice).

describe('legacy plans bill exactly as before per-subject billing', () => {
  const now = JSON.parse(JSON.stringify(goldenOf({ monthlyBillingRows, invoiceItems, studentLessonBalances })));
  it.each(Object.keys(golden))('%s: rows, invoice items and lessons left are unchanged', (month) => {
    expect(now[month]).toEqual(golden[month]);
  });
});
