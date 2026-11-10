// „Ülevaade” of Finantsid (owner 2026-11-09: „найди нормальный дашборд … красиво и профессионально”, modelled on the
// Stripe Dashboard home and Mercury). Pure numbers from the invoices the page has already loaded — company invoices
// only (the owner's FIE invoices are loaded apart and never reach these figures). Nothing here reads or writes data.
//
// Two bases, named on the screen:
// - „Laekunud” (the headline chart): money received by its payment date in the period (cash basis);
// - the cards: the invoices of the period by their billing month (planMonth / month / date) — the same invoices the
//   list under the cards shows.
import { financeRowState, summarizeFinanceRows } from './financeRows.js';
import { debtAgeBuckets, debtsByPayer } from './financeDebts.js';
import { monthDates, shiftMonth } from './monthlyBilling.js';
import { isoDay } from './paymentEntry.js';

export const PERIOD_UNITS = Object.freeze([
  { id: 'month', label: 'Kuu', months: 1 },
  { id: 'quarter', label: 'Kvartal', months: 3 },
  { id: 'year', label: 'Aasta', months: 12 },
]);
const unitMonths = (unit) => PERIOD_UNITS.find((item) => item.id === unit)?.months || 1;
const MONTHS_LONG = ['jaanuar', 'veebruar', 'märts', 'aprill', 'mai', 'juuni', 'juuli', 'august', 'september', 'oktoober', 'november', 'detsember'];
const MONTHS_SHORT = ['jaan', 'veebr', 'märts', 'apr', 'mai', 'juuni', 'juuli', 'aug', 'sept', 'okt', 'nov', 'dets'];
const ROMAN = ['I', 'II', 'III', 'IV'];
// today as yyyy-mm-dd in local time (a Date's toISOString is UTC and turns the day over at 2–3 a.m. here)
const dayOf = (value) => (value instanceof Date && !Number.isNaN(value.getTime()) ? new Intl.DateTimeFormat('sv-SE').format(value) : isoDay(value));

// the period of `unit` that holds `anchor` (yyyy-mm): a month, its calendar quarter or its calendar year
export function periodRange(unit, anchor) {
  const year = Number(anchor.slice(0, 4));
  const month = Number(anchor.slice(5, 7));
  const n = unitMonths(unit);
  const firstMonth = n === 12 ? 1 : n === 3 ? Math.floor((month - 1) / 3) * 3 + 1 : month;
  const from = `${year}-${String(firstMonth).padStart(2, '0')}`;
  const months = Array.from({ length: n }, (_, index) => shiftMonth(from, index));
  return { unit: PERIOD_UNITS.some((item) => item.id === unit) ? unit : 'month', from, to: months[months.length - 1], months };
}

// the period before (by = -1) or after (by = 1)
export function shiftPeriod(unit, anchor, by) {
  return shiftMonth(periodRange(unit, anchor).from, by * unitMonths(unit));
}

export function previousRange(range) {
  return periodRange(range.unit, shiftPeriod(range.unit, range.from, -1));
}

export function periodLabel(range) {
  const year = range.from.slice(0, 4);
  const month = Number(range.from.slice(5, 7));
  if (range.unit === 'year') return year;
  if (range.unit === 'quarter') return `${ROMAN[Math.floor((month - 1) / 3)]} kvartal ${year}`;
  return `${MONTHS_LONG[month - 1]} ${year}`;
}

// „eelmise kuuga” / „eelmise kvartaliga” / „eelmise aastaga”
export function previousName(unit) {
  return { month: 'eelmise kuuga', quarter: 'eelmise kvartaliga', year: 'eelmise aastaga' }[unit] || 'eelmise perioodiga';
}

export const invoiceMonthKey = (invoice = {}) => String(invoice.planMonth || invoice.month || invoice.date || '').slice(0, 7);

// the period's invoices by billing month, cancelled ones left out (as the list under the cards)
export function periodInvoices(invoices = [], range) {
  const months = new Set(range.months);
  return invoices.filter((invoice) => invoice.status !== 'Tühistatud' && months.has(invoiceMonthKey(invoice)));
}

const studentKeys = (invoice) => {
  const ids = Array.isArray(invoice.studentIds) && invoice.studentIds.length ? invoice.studentIds : [invoice.studentId || invoice.studentName].filter(Boolean);
  return ids.map(String);
};

// the card figures of a set of invoices
export function invoiceMetrics(invoices = [], today = new Date()) {
  const summary = summarizeFinanceRows(invoices, today);
  const billableCount = summary.count - summary.byStatus.credit;
  const students = new Set(invoices.filter((invoice) => financeRowState(invoice, today).status !== 'credit').flatMap(studentKeys));
  return {
    count: summary.count,
    billableCount,
    invoicedCents: summary.billableCents,
    paidCents: summary.paidCents,
    openCents: summary.balanceCents,
    averageCents: billableCount ? Math.round(summary.billableCents / billableCount) : 0,
    students: students.size,
    byStatus: summary.byStatus,
  };
}

// a change in whole percent; null when there is nothing to compare with
export function deltaPercent(current, previous) {
  if (!previous) return null;
  return Math.round(((current - previous) / Math.abs(previous)) * 100);
}

// every receipt of an invoice with its day: the invoice's own payment list when it has one, else the paid amount on
// its payment date (paidAt; the invoice date when an old invoice has none)
export function invoiceReceipts(invoice = {}, today = new Date()) {
  if (invoice.status === 'Tühistatud') return [];
  const state = financeRowState(invoice, today);
  const received = state.status === 'credit' ? state.paidCents : Math.max(state.paidCents, state.amountCents - state.balanceCents);
  if (received <= 0) return [];
  const dated = (Array.isArray(invoice.payments) ? invoice.payments : [])
    .filter((payment) => payment && payment.status !== 'void' && payment.status !== 'voided')
    .map((payment) => ({ date: isoDay(payment.paidAt), cents: Math.max(0, Math.round(Number(payment.amountCents ?? Number(payment.amount || 0) * 100) || 0)) }))
    .filter((entry) => entry.date && entry.cents > 0);
  const listed = dated.reduce((sum, entry) => sum + entry.cents, 0);
  const rest = received - listed;
  const fallback = isoDay(invoice.paidAt) || isoDay(invoice.date);
  return rest > 0 && fallback ? [...dated, { date: fallback, cents: rest }] : dated;
}

// the points of a period: days for a month and a quarter, months for a year
export function periodBuckets(range) {
  if (range.unit === 'year') return range.months.map((month) => ({ key: month, from: `${month}-01`, to: `${month}-31` }));
  return range.months.flatMap(monthDates).map((day) => ({ key: day, from: day, to: day }));
}

const bucketLabel = (bucket, unit) => {
  const month = Number(bucket.key.slice(5, 7));
  if (unit === 'year') return { label: MONTHS_SHORT[month - 1], longLabel: `${MONTHS_LONG[month - 1]} ${bucket.key.slice(0, 4)}` };
  const day = Number(bucket.key.slice(8, 10));
  return { label: `${day}. ${MONTHS_SHORT[month - 1]}`, longLabel: `${day}. ${MONTHS_LONG[month - 1]} ${bucket.key.slice(0, 4)}` };
};

function cumulative(buckets, receipts) {
  let running = 0;
  return buckets.map((bucket) => {
    running += receipts.filter((entry) => entry.date >= bucket.from && entry.date <= bucket.to).reduce((sum, entry) => sum + entry.cents, 0);
    return running;
  });
}

// „Ülekanded” and „Sularaha” under „Laekunud” (owner 2026-11-10; admin only — the bookkeeper sees the total line as
// before, and lesson cash never reaches the accountant). From the company's `payments` (FIE payments live apart in
// fiePayments and never come here) and the cash box (`cashLedger`):
// - Ülekanded: active payments with method bank (a bank-statement match, an LHV run or a transfer typed by hand),
//   linkpay (a bank-link payment, the money lands on the bank account) or card;
// - Sularaha: active payments with method cash (a cash-box receipt linked to an invoice, or a cash payment typed in
//   Finantsid) + cash-box receipts that are still open — not linked to an invoice, e.g. „Makstud sularahas” of a
//   lesson — on the day they were taken. A linked receipt is counted once, as its payment (status „allocated”).
// What is in neither (an advance applied to an invoice — method credit —, other, and old invoices without a payment
// record) stays only in the total.
export const TRANSFER_METHODS = Object.freeze(['bank', 'linkpay', 'card']);
const activePayment = (payment) => payment && payment.status !== 'void' && payment.status !== 'voided' && payment.issuer !== 'fie';
const paymentCents = (payment) => Math.max(0, Math.round(Number(payment.amountCents ?? Number(payment.amount || 0) * 100) || 0));

// Only payments of the company invoices on the page (not cancelled) count, and the total line then takes its days from
// the same payment records (`paymentsByInvoice`), so the two lines never stand above the total.
export function moneyFlows({ invoices = [], payments = [], cashEntries = [] } = {}) {
  const dated = (list) => list.map((item) => ({ date: isoDay(item.date), cents: item.cents })).filter((item) => item.date && item.cents > 0);
  const ids = new Set(invoices.filter((invoice) => invoice.status !== 'Tühistatud').map((invoice) => invoice.id));
  const active = payments.filter((payment) => activePayment(payment) && ids.has(payment.invoiceId));
  const paymentsByInvoice = new Map();
  active.forEach((payment) => paymentsByInvoice.set(payment.invoiceId, [...(paymentsByInvoice.get(payment.invoiceId) || []), payment]));
  return {
    paymentsByInvoice,
    transfers: dated(active.filter((payment) => TRANSFER_METHODS.includes(String(payment.method || 'bank'))).map((payment) => ({ date: payment.paidAt, cents: paymentCents(payment) }))),
    cashPayments: dated(active.filter((payment) => payment.method === 'cash').map((payment) => ({ date: payment.paidAt, cents: paymentCents(payment) }))),
    ledgerCash: dated(cashEntries.filter((entry) => entry && entry.type === 'receipt' && entry.status === 'open').map((entry) => ({ date: entry.receivedAt, cents: Math.round(Number(entry.amountCents) || 0) }))),
  };
}

// „Laekunud”: money received in the period, day by day (month by month for a year) and summed up, beside the period
// before at the same point. A period still running stops at today and is compared with the period before up to the
// same day; a past period is compared in full. With `flows` (moneyFlows, admin) the cash box's open receipts are
// money received too, and every point also carries `transfer` and `cash` (this period only).
export function receivedSeries({ invoices = [], range, today = new Date(), flows = null }) {
  const todayIso = dayOf(today) || dayOf(new Date());
  const withPayments = flows?.paymentsByInvoice
    ? invoices.map((invoice) => (Array.isArray(invoice.payments) || !flows.paymentsByInvoice.has(invoice.id) ? invoice : { ...invoice, payments: flows.paymentsByInvoice.get(invoice.id) }))
    : invoices;
  const receipts = [...withPayments.flatMap((invoice) => invoiceReceipts(invoice, today)), ...(flows?.ledgerCash || [])];
  const buckets = periodBuckets(range);
  const before = previousRange(range);
  const beforeBuckets = periodBuckets(before);
  const values = cumulative(buckets, receipts);
  const compare = cumulative(beforeBuckets, receipts);
  const transfers = flows ? cumulative(buckets, flows.transfers) : null;
  const cash = flows ? cumulative(buckets, [...flows.cashPayments, ...flows.ledgerCash]) : null;
  const lastBucket = buckets[buckets.length - 1];
  const currentUntil = todayIso < buckets[0].from ? -1 : todayIso > lastBucket.to ? buckets.length - 1 : buckets.findIndex((bucket) => todayIso >= bucket.from && todayIso <= bucket.to);
  const points = buckets.map((bucket, index) => ({
    key: bucket.key, ...bucketLabel(bucket, range.unit), value: values[index], compare: compare[Math.min(index, compare.length - 1)],
    ...(flows ? { transfer: transfers[index], cash: cash[index] } : {}),
  }));
  const totalCents = currentUntil >= 0 ? values[currentUntil] : 0;
  const running = currentUntil >= 0 && currentUntil < buckets.length - 1;
  const compareCents = running ? compare[Math.min(currentUntil, compare.length - 1)] : compare[compare.length - 1];
  const split = flows && currentUntil >= 0 ? { transferCents: transfers[currentUntil], cashCents: cash[currentUntil] } : flows ? { transferCents: 0, cashCents: 0 } : null;
  return {
    points, currentUntil, totalCents, compareCents, compareFullCents: compare[compare.length - 1], running,
    future: currentUntil < 0, delta: currentUntil < 0 ? null : deltaPercent(totalCents, compareCents),
    split: split ? { ...split, otherCents: Math.max(0, totalCents - split.transferCents - split.cashCents) } : null,
  };
}

// one figure over the last `count` periods ending with the anchor's (oldest first) — the sparkline of a card
export function metricTrend({ invoices = [], unit, anchor, count = 8, pick, today = new Date() }) {
  const ranges = Array.from({ length: count }, (_, index) => periodRange(unit, shiftPeriod(unit, anchor, index - count + 1)));
  const values = ranges.map((range) => pick(invoiceMetrics(periodInvoices(invoices, range), today)));
  // a young school has no empty years on the line: leading periods without invoices are left out (two points stay)
  const firstWithData = values.findIndex((value) => value > 0);
  return values.slice(Math.max(0, Math.min(firstWithData < 0 ? values.length : firstWithData, values.length - 2)));
}

// past due today, whatever month they were billed for: the sum, the invoices, the families (one payer = one family,
// financeDebts.debtsByPayer) and the age buckets (financeDebts.debtAgeBuckets)
export function overdueNow(invoices = [], today = new Date()) {
  const debts = invoices.filter((invoice) => invoice.status !== 'Tühistatud' && financeRowState(invoice, today).status === 'overdue');
  return {
    cents: debts.reduce((sum, invoice) => sum + financeRowState(invoice, today).balanceCents, 0),
    count: debts.length,
    families: debtsByPayer(debts).length,
    ages: debtAgeBuckets(debts, dayOf(today) || undefined).filter((bucket) => bucket.id !== 'notDue'),
  };
}

// everything the overview shows for one period
export function financeOverview({ invoices = [], unit = 'month', anchor, today = new Date(), flows = null }) {
  const range = periodRange(unit, anchor);
  const before = previousRange(range);
  const now = invoiceMetrics(periodInvoices(invoices, range), today);
  // a quarter or a year still running is compared with the same months of the period before (Oktoober–November
  // against Juuli–August, not against the whole of III kvartal); a month is compared whole
  const thisMonth = dayOf(today).slice(0, 7);
  const elapsed = range.months.indexOf(thisMonth) + 1;
  const toDate = elapsed > 0 && elapsed < range.months.length;
  const was = invoiceMetrics(periodInvoices(invoices, toDate ? { ...before, months: before.months.slice(0, elapsed) } : before), today);
  const trend = (pick) => metricTrend({ invoices, unit, anchor: range.from, pick, today });
  return {
    range, before, label: periodLabel(range), beforeLabel: periodLabel(before), toDate,
    received: receivedSeries({ invoices, range, today, flows }),
    metrics: now, previous: was,
    deltas: {
      invoiced: deltaPercent(now.invoicedCents, was.invoicedCents),
      open: deltaPercent(now.openCents, was.openCents),
      average: deltaPercent(now.averageCents, was.averageCents),
      students: deltaPercent(now.students, was.students),
    },
    trends: {
      invoiced: trend((m) => m.invoicedCents),
      open: trend((m) => m.openCents),
      average: trend((m) => m.averageCents),
      students: trend((m) => m.students),
    },
    overdue: overdueNow(invoices, today),
  };
}
