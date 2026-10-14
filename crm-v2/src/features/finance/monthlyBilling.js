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
export function currentMonth(today = new Date()) {
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
}

export function defaultBillingMonth(today = new Date()) {
  const month = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
  return today.getDate() <= PAYMENT_DUE_DAY ? month : shiftMonth(month, 1);
}

export function defaultDue(month, mode) {
  if (mode === 'actual') return `${shiftMonth(month, 1)}-${String(PAYMENT_DUE_DAY).padStart(2, '0')}`;
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

// payer e-mail: the student card first, then the parent account linked to the card (Lapsevanemad)
export function payerEmailOf(student, parents = []) {
  const own = student.payerEmail || student.parentEmail || student.contactEmail || student.email || '';
  if (own) return own;
  const parentIds = [student.linkedParentId, student.parentUid, student.guardianUid].filter(Boolean);
  return parents.find((parent) => parentIds.includes(parent.id) && parent.email)?.email || '';
}

export function monthlyBillingRows({ month, students = [], plans = [], schedule = [], groups = [], lessons = [], invoices = [], parents = [] }) {
  const dates = monthDates(month);
  const previousMonth = shiftMonth(month, -1);
  const events = [...schedule, ...groupCalendarEvents(groups)];
  const occurrences = occurrencesForDates(events, dates);
  const planByStudent = new Map(plans.map((plan) => [plan.studentId || plan.id, plan]));
  // a card's invoice for a month: its own, or its part of a combined invoice (several cards of one payer) — then the
  // part's units, so next month's difference is counted per card
  const invoiceFor = (studentId, forMonth) => {
    const found = invoices.find((invoice) => invoice.planMonth === forMonth && invoice.status !== 'Tühistatud'
      && (invoice.studentId === studentId || (Array.isArray(invoice.studentIds) && invoice.studentIds.includes(studentId))));
    if (!found?.combined) return found;
    const part = (found.cardParts || []).find((item) => item.studentId === studentId) || {};
    return { ...found, plannedUnits: part.plannedUnits || 0, correctionUnits: part.correctionUnits || 0, amountCents: part.amountCents ?? found.amountCents, partOfCombined: true };
  };

  return students
    .filter((student) => student.active !== false && !student.mergedIntoStudentId)
    .map((student) => {
      const plan = planByStudent.get(student.id) || null;
      const mine = occurrences.filter((event) => event.studentId === student.id || (event.studentIds || []).includes(student.id));
      const mode = plan?.billingMode === 'actual' ? 'actual' : plan?.billingMode === 'current' ? 'current' : plan?.billingMode === 'package' ? 'package' : 'advance';
      const actualLessons = mode === 'actual' && plan ? lessons.filter((lesson) => lesson.studentId === student.id && String(lesson.date || '').startsWith(`${month}-`) && isChargeable(lesson, plan)) : [];
      const plannedUnits = plan ? round2((mode === 'actual' ? actualLessons : mine).reduce((sum, event) => sum + unitsOf(event.duration, plan), 0)) : 0;
      const previousLessons = lessons.filter((lesson) => lesson.studentId === student.id && String(lesson.date || '').startsWith(`${previousMonth}-`));
      const correction = plan && mode !== 'actual' ? correctionFor({ student, plan, previousInvoice: invoiceFor(student.id, previousMonth), previousLessons }) : { units: 0, note: '', noShows: [] };
      const priceCents = plan?.lessonPriceCents || 0;
      const totalCents = Math.round((plannedUnits + correction.units) * priceCents);
      const existing = invoiceFor(student.id, month);
      let status = 'ready';
      if (existing) status = 'invoiced';
      // a lesson-package card pays by package invoices (Tunnipakett), its lessons take credits — never a monthly invoice
      else if (mode === 'package') status = 'package';
      else if (!plan || !priceCents) status = 'no-price';
      else if (!plannedUnits && correction.units <= 0) status = 'no-lessons';
      else if (totalCents <= 0) status = 'nothing-to-pay';
      return {
        student,
        plan,
        mode,
        lessonCount: mode === 'actual' ? actualLessons.length : mine.length,
        plannedUnits,
        correction,
        priceCents,
        totalCents,
        due: defaultDue(month, mode),
        payerEmail: payerEmailOf(student, parents),
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

// who pays for the card (the server checks the same: functions/combined-invoice-core.js payerKey)
export function payerKey(student = {}) {
  const parentUid = String(student.linkedParentId || student.parentUid || student.guardianUid || '').trim();
  if (parentUid) return `parent:${parentUid}`;
  const email = String(student.payerEmail || student.parentEmail || student.contactEmail || student.email || '').trim().toLowerCase();
  if (email) return `email:${email}`;
  return `name:${String(student.name || '').trim().toLocaleLowerCase('et')}`;
}

// the chosen rows as invoices: one per payer when `combine` (owner 2026-10-14: English and Estonian of one student, or
// all children of one parent, on one invoice), else one per card. → [{ rows, payerKey }]
export function invoiceGroups(rows = [], combine = true) {
  if (!combine) return rows.map((row) => ({ rows: [row], payerKey: payerKey(row.student) }));
  const groups = new Map();
  rows.forEach((row) => {
    const key = payerKey(row.student);
    groups.set(key, [...(groups.get(key) || []), row]);
  });
  return [...groups.entries()].map(([key, list]) => ({ rows: list, payerKey: key }));
}

export function combinedMonthlyPayload(rows, month, due = rows[0]?.due) {
  return {
    month,
    due,
    items: rows.map((row) => ({ studentId: row.student.id, plannedUnits: row.plannedUnits, correctionUnits: row.correction.units, correctionNote: row.correction.note })),
  };
}
