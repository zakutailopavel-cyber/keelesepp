// „Ülevaade” in Finantsid (owner 2026-10-26: „дашборд с графиком дохода, прогнозируемый доход и т.д.”). Pure numbers for
// FinanceDashboard.jsx: what was invoiced and what came in month by month, and what the calendar says the next months
// will bring — the same calculation as „Koosta arved” (monthlyBillingRows: scheduled lessons × each card's price).
import { financeRowState } from './financeRows.js';
import { monthlyBillingRows, shiftMonth } from './monthlyBilling.js';

export const HISTORY_MONTHS = 12;
export const FORECAST_MONTHS = 3;
const VOID_PAYMENT = new Set(['void', 'cancelled', 'canceled', 'reversed', 'Tühistatud']);

const monthOf = (value) => String(value || '').slice(0, 7);
const isMonth = (value) => /^\d{4}-\d{2}$/.test(value);

// the months on the chart, oldest first: `count` months ending with `last`
export function monthRange(last, count) {
  return Array.from({ length: count }, (_, index) => shiftMonth(last, index - count + 1));
}

// invoiced by the invoice's date (cancelled and credited ones count nothing); received by the payment's date — payment
// records first, an old invoice marked paid by hand (no payment record) by its own paidAt
export function revenueHistory({ invoices = [], payments = [], months = [] } = {}) {
  const byMonth = new Map(months.map((month) => [month, { month, invoicedCents: 0, receivedCents: 0, invoiceCount: 0 }]));
  const recorded = new Set();
  payments.forEach((payment) => {
    if (VOID_PAYMENT.has(payment.status)) return;
    if (payment.invoiceId) recorded.add(payment.invoiceId);
    const slot = byMonth.get(monthOf(payment.paidAt || payment.createdAt));
    if (slot) slot.receivedCents += Math.max(0, Math.round(Number(payment.amountCents ?? Number(payment.amount || 0) * 100) || 0));
  });
  invoices.forEach((invoice) => {
    const state = financeRowState(invoice);
    if (state.status === 'cancelled' || state.status === 'credit') return;
    const slot = byMonth.get(monthOf(invoice.date || invoice.issueDate || invoice.createdAt));
    if (slot) { slot.invoicedCents += state.amountCents; slot.invoiceCount += 1; }
    // paid by hand long ago: financeRowState shows no paid amount, only a zero balance
    const paid = state.paidCents || (state.status === 'paid' ? state.amountCents : 0);
    if (!recorded.has(invoice.id) && paid > 0) {
      const paidSlot = byMonth.get(monthOf(invoice.paidAt || invoice.date));
      if (paidSlot) paidSlot.receivedCents += paid;
    }
  });
  return months.map((month) => byMonth.get(month));
}

// the coming months from the calendar: each card's scheduled lessons × its price (lesson packages and cards without a
// price are not in it, they are counted separately)
export function revenueForecast({ months = [], students = [], plans = [], schedule = [], groups = [], lessons = [], invoices = [] } = {}) {
  return months.map((month) => {
    // most invoices carry no planMonth: an invoice dated in the month also counts as that month's invoice
    const dated = new Set(invoices.filter((invoice) => invoice.status !== 'Tühistatud' && (invoice.planMonth ? invoice.planMonth === month : monthOf(invoice.date) === month))
      .flatMap((invoice) => [invoice.studentId, ...(Array.isArray(invoice.studentIds) ? invoice.studentIds : [])]).filter(Boolean));
    const rows = monthlyBillingRows({ month, students, plans, schedule, groups, lessons, invoices })
      .map((row) => (row.status === 'ready' && dated.has(row.student.id) ? { ...row, status: 'invoiced' } : row));
    // „ready” = still to invoice; „invoiced” = already on an invoice of that month (the current month)
    const expected = rows.filter((row) => row.status === 'ready' || row.status === 'invoiced');
    return {
      month,
      forecastCents: expected.reduce((sum, row) => sum + Math.max(0, row.totalCents), 0),
      notInvoicedCents: rows.filter((row) => row.status === 'ready').reduce((sum, row) => sum + Math.max(0, row.totalCents), 0),
      notInvoicedStudents: rows.filter((row) => row.status === 'ready').length,
      students: expected.length,
      lessons: expected.reduce((sum, row) => sum + row.lessonCount, 0),
      packageStudents: rows.filter((row) => row.status === 'package').length,
      noPrice: rows.filter((row) => row.status === 'no-price').length,
    };
  });
}

// the headline numbers next to the chart
// thisMonth: the calendar's view of the current month (revenueForecast for it): what is owed by the lessons
export function dashboardSummary({ history = [], forecast = [], invoices = [], current, thisMonth = null } = {}) {
  const now = history.find((item) => item.month === current) || { invoicedCents: 0, receivedCents: 0, invoiceCount: 0 };
  const previous = history.find((item) => item.month === shiftMonth(current, -1)) || { invoicedCents: 0, receivedCents: 0 };
  const states = invoices.map((invoice) => financeRowState(invoice));
  const received12 = history.reduce((sum, item) => sum + item.receivedCents, 0);
  const activeMonths = history.filter((item) => item.receivedCents > 0 || item.invoicedCents > 0).length;
  return {
    invoicedCents: now.invoicedCents,
    receivedCents: now.receivedCents,
    changePercent: previous.invoicedCents ? Math.round(((now.invoicedCents - previous.invoicedCents) / previous.invoicedCents) * 100) : null,
    outstandingCents: states.reduce((sum, state) => sum + state.balanceCents, 0),
    overdueCents: states.filter((state) => state.overdue).reduce((sum, state) => sum + state.balanceCents, 0),
    received12Cents: received12,
    averageMonthCents: activeMonths ? Math.round(received12 / activeMonths) : 0,
    averageInvoiceCents: now.invoiceCount ? Math.round(now.invoicedCents / now.invoiceCount) : 0,
    nextMonth: forecast[0] || null,
    calendarCents: thisMonth?.forecastCents || 0,
    notInvoicedCents: thisMonth?.notInvoicedCents || 0,
    notInvoicedStudents: thisMonth?.notInvoicedStudents || 0,
    forecastTotalCents: forecast.reduce((sum, item) => sum + item.forecastCents, 0),
  };
}

// a round top for the chart's scale (e.g. 3 870 € → 4 000 €)
export function niceMax(cents) {
  const value = Math.max(1, cents);
  const step = 10 ** Math.floor(Math.log10(value));
  return [1, 2, 2.5, 5, 10].map((k) => k * step).find((top) => top >= value) || 10 * step;
}

// a smooth line through the points that never overshoots (monotone cubic, Fritsch–Carlson): money never dips below 0
export function smoothPath(points) {
  if (!points.length) return '';
  if (points.length === 1) return `M${points[0][0]},${points[0][1]}`;
  const n = points.length;
  const dx = []; const slope = [];
  for (let i = 0; i < n - 1; i += 1) { dx[i] = points[i + 1][0] - points[i][0]; slope[i] = (points[i + 1][1] - points[i][1]) / dx[i]; }
  const tangent = [slope[0]];
  for (let i = 1; i < n - 1; i += 1) tangent[i] = slope[i - 1] * slope[i] <= 0 ? 0 : (3 * (dx[i - 1] + dx[i])) / ((2 * dx[i] + dx[i - 1]) / slope[i - 1] + (dx[i] + 2 * dx[i - 1]) / slope[i]);
  tangent[n - 1] = slope[n - 2];
  let d = `M${points[0][0]},${points[0][1]}`;
  for (let i = 0; i < n - 1; i += 1) {
    const h = dx[i] / 3;
    d += ` C${points[i][0] + h},${points[i][1] + h * tangent[i]} ${points[i + 1][0] - h},${points[i + 1][1] - h * tangent[i + 1]} ${points[i + 1][0]},${points[i + 1][1]}`;
  }
  return d;
}

export { isMonth };
