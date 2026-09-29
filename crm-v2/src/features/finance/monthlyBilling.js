import { groupCalendarEvents, occurrencesForDates, toIsoDate } from '../calendar/calendarView.js';

// Finance v2 §2: one invoice per student per month for the lessons planned in the calendar.
// "current": invoiced at the start of the month, due by the 10th. "advance": invoiced the month before.
// Last month's difference (lessons not held, notified absences, waived no-shows, extra lessons) is added
// to this month's invoice as a correction line.

export const PAYMENT_DUE_DAY = 10;

const round2 = (value) => Math.round(value * 100) / 100;

export function monthDates(month) {
  const [year, index] = month.split('-').map(Number);
  const days = new Date(year, index, 0).getDate();
  return Array.from({ length: days }, (_, day) => toIsoDate(new Date(year, index - 1, day + 1, 12)));
}

export function shiftMonth(month, amount) {
  const [year, index] = month.split('-').map(Number);
  const date = new Date(year, index - 1 + amount, 1, 12);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

// the month to bill by default: this month until the 10th, afterwards next month
export function defaultBillingMonth(today = new Date()) {
  const month = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
  return today.getDate() <= PAYMENT_DUE_DAY ? month : shiftMonth(month, 1);
}

export function defaultDue(month, mode) {
  if (mode === 'advance') {
    const [year, index] = month.split('-').map(Number);
    return toIsoDate(new Date(year, index - 1, 0, 12)); // last day of the month before
  }
  return `${month}-${String(PAYMENT_DUE_DAY).padStart(2, '0')}`;
}

// lesson length in plan units (a 90 min lesson on a 60 min price = 1.5)
const unitsOf = (minutes, plan) => (Number(minutes) || plan.lessonMinutes || 60) / (plan.lessonMinutes || 60);

export function isChargeable(lesson, plan) {
  if (lesson.status === 'Toimunud') return true;
  if (lesson.status === 'Puudus_eta') return plan.chargeNoShow !== false && !lesson.billingWaived;
  return false;
}

function correctionFor({ student, plan, previousInvoice, previousLessons }) {
  if (!previousInvoice) return { units: 0, note: '', noShows: [] };
  const held = previousLessons.filter((lesson) => isChargeable(lesson, plan));
  const heldUnits = round2(held.reduce((sum, lesson) => sum + unitsOf(lesson.duration, plan), 0));
  const billed = Number(previousInvoice.plannedUnits) || 0;
  const units = round2(heldUnits - billed);
  const notified = previousLessons.filter((lesson) => lesson.status === 'Puudus_p').length;
  const waived = previousLessons.filter((lesson) => lesson.status === 'Puudus_eta' && !isChargeable(lesson, plan)).length;
  const parts = [];
  if (notified) parts.push(`${notified} ette teatatud puudumist`);
  if (waived) parts.push(`${waived} erandit`);
  if (units && !parts.length) parts.push(units < 0 ? 'tunde toimus vähem' : 'lisatunnid');
  return {
    units,
    note: units ? parts.join(', ') : '',
    noShows: previousLessons.filter((lesson) => lesson.status === 'Puudus_eta'),
    studentId: student.id,
  };
}

export function monthlyBillingRows({ month, students = [], plans = [], schedule = [], groups = [], lessons = [], invoices = [] }) {
  const dates = monthDates(month);
  const previousMonth = shiftMonth(month, -1);
  const events = [...schedule, ...groupCalendarEvents(groups)];
  const occurrences = occurrencesForDates(events, dates);
  const planByStudent = new Map(plans.map((plan) => [plan.studentId || plan.id, plan]));
  const invoiceFor = (studentId, forMonth) => invoices.find((invoice) => invoice.studentId === studentId && invoice.planMonth === forMonth && invoice.status !== 'Tühistatud');

  return students
    .filter((student) => student.active !== false && !student.mergedIntoStudentId)
    .map((student) => {
      const plan = planByStudent.get(student.id) || null;
      const mine = occurrences.filter((event) => event.studentId === student.id || (event.studentIds || []).includes(student.id));
      const plannedUnits = plan ? round2(mine.reduce((sum, event) => sum + unitsOf(event.duration, plan), 0)) : 0;
      const previousLessons = lessons.filter((lesson) => lesson.studentId === student.id && String(lesson.date || '').startsWith(`${previousMonth}-`));
      const correction = plan ? correctionFor({ student, plan, previousInvoice: invoiceFor(student.id, previousMonth), previousLessons }) : { units: 0, note: '', noShows: [] };
      const priceCents = plan?.lessonPriceCents || 0;
      const totalCents = Math.round((plannedUnits + correction.units) * priceCents);
      const existing = invoiceFor(student.id, month);
      const mode = plan?.billingMode === 'advance' ? 'advance' : 'current';
      let status = 'ready';
      if (existing) status = 'invoiced';
      else if (!plan || !priceCents) status = 'no-price';
      else if (!plannedUnits && correction.units <= 0) status = 'no-lessons';
      else if (totalCents <= 0) status = 'nothing-to-pay';
      return {
        student,
        plan,
        mode,
        lessonCount: mine.length,
        plannedUnits,
        correction,
        priceCents,
        totalCents,
        due: defaultDue(month, mode),
        payerEmail: student.payerEmail || student.parentEmail || student.contactEmail || student.email || '',
        existing,
        status,
      };
    })
    .filter((row) => row.plan || row.lessonCount)
    .sort((left, right) => String(left.student.name || '').localeCompare(String(right.student.name || ''), 'et'));
}

export function monthlyInvoicePayload(row, month, due = row.due) {
  return {
    studentId: row.student.id,
    month,
    due,
    plannedUnits: row.plannedUnits,
    correctionUnits: row.correction.units,
    correctionNote: row.correction.note,
  };
}
