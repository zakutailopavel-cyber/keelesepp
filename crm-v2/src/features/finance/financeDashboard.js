// „Ülevaade” in Finantsid (owner 2026-10-26: „дашборд с графиком дохода, прогнозируемый доход и т.д.”; then: „не
// привязывать к бухгалтерии — из количества уроков в календаре, проведённых и вынесенных”). Pure numbers for
// FinanceDashboard.jsx: the calendar's lessons month by month — held (past) and planned (from today) — at each
// student's price. Invoices and payments are not used; the bookkeeping stays with the accountant.
import { monthDates, shiftMonth } from './monthlyBilling.js';
import { groupCalendarEvents, occurrencesForDates } from '../calendar/calendarView.js';
import { itemSubject, mainSubject } from '../students/subjects.js';

export const HISTORY_MONTHS = 12;
export const FORECAST_MONTHS = 3;
// the period switch (owner 2026-10-27: „сделай периоды от месяца до года”)
export const PERIODS = [{ months: 1, label: 'Kuu' }, { months: 3, label: '3 kuud' }, { months: 6, label: '6 kuud' }, { months: 12, label: 'Aasta' }];

const isMonth = (value) => /^\d{4}-\d{2}$/.test(value);

// the months on the chart, oldest first: `count` months ending with `last`
export function monthRange(last, count) {
  return Array.from({ length: count }, (_, index) => shiftMonth(last, index - count + 1));
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

// ---------- lesson revenue (owner 2026-10-26: the dashboard is not the bookkeeping — it counts the calendar's lessons,
// held and planned, at each student's price; the accountant does the books herself) ----------

const NOT_HELD = new Set(['Tühistatud', 'Puudus_p']);

// a lesson's price for a student: the subject's own price when it has one, the length in the plan's units
export function lessonPriceCents(item, student, plan) {
  if (!plan) return 0;
  const main = mainSubject(student);
  const subject = itemSubject(item, student) || main;
  const own = subject !== main ? plan.subjectPrices?.[subject] : null;
  const price = own?.lessonPriceCents || plan.lessonPriceCents || 0;
  const minutes = own?.lessonMinutes || plan.lessonMinutes || 60;
  return Math.round(((Number(item.duration) || minutes) / minutes) * price);
}

// month by month: held lessons (past dates — marked „Toimunud” or a charged no-show, or still unmarked and not
// cancelled) and planned lessons (from today on), each at its student's price; journal lessons that are not in the
// calendar count as held
export function lessonRevenue({ months = [], today, students = [], plans = [], schedule = [], groups = [], lessons = [] } = {}) {
  const studentById = new Map(students.map((student) => [student.id, student]));
  const planById = new Map(plans.map((plan) => [plan.studentId || plan.id, plan]));
  const events = [...schedule, ...groupCalendarEvents(groups)];
  const journal = new Map();
  lessons.forEach((lesson) => {
    const date = lesson.occurrenceDate || lesson.date;
    if (lesson.scheduleId && date) journal.set(`${lesson.scheduleId}:${date}`, lesson);
    if (lesson.studentId && lesson.date) journal.set(`${lesson.studentId}@${lesson.date}`, lesson);
  });
  const charged = (status, plan, record) => status === 'Toimunud' ? record?.billingStatus !== 'school_covered' : status === 'Puudus_eta' ? plan.chargeNoShow !== false && !record?.billingWaived : false;
  return months.map((month) => {
    const row = { month, heldCents: 0, heldLessons: 0, unmarkedLessons: 0, plannedCents: 0, plannedLessons: 0, noPrice: 0 };
    const seen = new Set();
    occurrencesForDates(events, monthDates(month)).forEach((item) => {
      const ids = item.isGroup ? item.studentIds || [] : [item.studentId];
      ids.forEach((studentId) => {
        const student = studentById.get(studentId);
        const plan = planById.get(studentId);
        if (!student) return;
        const record = journal.get(`${item.id}:${item.occurrenceDate}`) || journal.get(`${studentId}@${item.occurrenceDate}`);
        if (record) seen.add(record.id || `${studentId}@${item.occurrenceDate}`);
        const cents = lessonPriceCents(item, student, plan);
        if (!cents) { row.noPrice += 1; return; }
        const status = record?.status || item.status || 'Planeeritud';
        if (item.occurrenceDate >= today) {
          if (!NOT_HELD.has(status)) { row.plannedCents += cents; row.plannedLessons += 1; }
          return;
        }
        if (status === 'Planeeritud' && !record) { row.heldCents += cents; row.heldLessons += 1; row.unmarkedLessons += 1; return; }
        if (plan && charged(status, plan, record)) { row.heldCents += cents; row.heldLessons += 1; }
      });
    });
    // a lesson written in the journal only (not in the calendar)
    lessons.filter((lesson) => String(lesson.date || '').startsWith(`${month}-`) && lesson.date < today && !seen.has(lesson.id || `${lesson.studentId}@${lesson.date}`))
      .forEach((lesson) => {
        const student = studentById.get(lesson.studentId);
        const plan = planById.get(lesson.studentId);
        if (!student || !plan || !charged(lesson.status, plan, lesson)) return;
        const cents = lessonPriceCents(lesson, student, plan);
        if (cents) { row.heldCents += cents; row.heldLessons += 1; }
      });
    return row;
  });
}

// the headline numbers of the lesson dashboard
export function lessonSummary({ rows = [], current } = {}) {
  const now = rows.find((row) => row.month === current) || { heldCents: 0, plannedCents: 0, heldLessons: 0, plannedLessons: 0 };
  const previous = rows.find((row) => row.month === shiftMonth(current, -1));
  const past = rows.filter((row) => row.month < current && row.heldCents > 0);
  const future = rows.filter((row) => row.month > current);
  return {
    heldCents: now.heldCents,
    heldLessons: now.heldLessons,
    plannedCents: now.plannedCents,
    plannedLessons: now.plannedLessons,
    monthTotalCents: now.heldCents + now.plannedCents,
    changePercent: previous?.heldCents ? Math.round(((now.heldCents + now.plannedCents - previous.heldCents) / previous.heldCents) * 100) : null,
    averageMonthCents: past.length ? Math.round(past.reduce((sum, row) => sum + row.heldCents, 0) / past.length) : 0,
    unmarkedLessons: rows.filter((row) => row.month <= current).reduce((sum, row) => sum + row.unmarkedLessons, 0),
    nextMonth: future[0] || null,
    forecastCents: future.reduce((sum, row) => sum + row.plannedCents, 0),
    noPrice: now.noPrice || 0,
  };
}

// the headline numbers of a period of `months` months that ends with the current month (held + still planned in it),
// compared with the period before it, and the calendar's lessons in the same number of months ahead
export function periodSummary({ rows = [], current, months = 1 } = {}) {
  const n = Math.max(1, Number(months) || 1);
  const inWindow = (row, from, to) => row.month >= from && row.month <= to;
  const from = shiftMonth(current, -(n - 1));
  const window = rows.filter((row) => inWindow(row, from, current));
  const before = rows.filter((row) => inWindow(row, shiftMonth(from, -n), shiftMonth(from, -1)));
  const ahead = rows.filter((row) => inWindow(row, shiftMonth(current, 1), shiftMonth(current, n)));
  const sum = (list, key) => list.reduce((total, row) => total + (row[key] || 0), 0);
  const heldCents = sum(window, 'heldCents');
  const plannedCents = sum(window, 'plannedCents');
  const beforeCents = sum(before, 'heldCents') + sum(before, 'plannedCents');
  return {
    months: n, from,
    heldCents, heldLessons: sum(window, 'heldLessons'),
    plannedCents, plannedLessons: sum(window, 'plannedLessons'),
    totalCents: heldCents + plannedCents,
    changePercent: beforeCents && before.length === n ? Math.round(((heldCents + plannedCents - beforeCents) / beforeCents) * 100) : null,
    averageMonthCents: Math.round((heldCents + plannedCents) / n),
    unmarkedLessons: sum(window, 'unmarkedLessons'),
    aheadCents: sum(ahead, 'plannedCents'), aheadLessons: sum(ahead, 'plannedLessons'), aheadMonths: ahead.length,
    noPrice: sum(window, 'noPrice'),
  };
}

export { isMonth };
