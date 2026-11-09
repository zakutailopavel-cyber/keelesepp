// Golden fixtures (per-subject billing, 2026-11-06): cards whose plans have no `subjectBilling` must bill exactly as
// before. monthlyBilling.golden.test.js compares today's rows with the rows the code before per-subject billing made
// (monthlyBilling.golden.json, produced by origin/main d3ed25d finance/monthlyBilling.js on these fixtures).
const est = (id, extra = {}) => ({ id, studentId: 'st', teacherUid: 'p1', recurring: true, day: 'Wed', startDate: '2031-09-03', time: '16:00', duration: 60, subject: 'Eesti keel', ...extra });
const mat = (id, extra = {}) => ({ id, studentId: 'st', teacherUid: 'y1', recurring: true, day: 'Thu', startDate: '2031-09-04', time: '16:00', duration: 45, ...extra });

export const students = [
  { id: 's1', name: 'Mari', active: true, parentEmail: 'mari@example.com' },
  { id: 's2', name: 'Jaan', active: true },
  { id: 's4', name: 'Pakett', active: true, subject: 'Inglise keel' },
  { id: 's5', name: 'Toimunud', active: true, payerEmail: 'toim@example.com' },
  { id: 'st', name: 'Stefania', active: true, subject: 'Eesti keel', parentEmail: 'ema@example.com', enrollments: [
    { subject: 'Eesti keel', teacher: 'Pavel', teacherUid: 'p1' }, { subject: 'Matemaatika', teacher: 'Yelyzaveta', teacherUid: 'y1' }] },
];

export const plans = [
  { studentId: 's1', lessonPriceCents: 2500, lessonMinutes: 60, billingMode: 'current', chargeNoShow: true, weeklyLessons: 1 },
  { studentId: 's2', lessonPriceCents: 3000, lessonMinutes: 60, weeklyLessons: 1 }, // no billingMode / chargeNoShow stored
  { studentId: 's4', lessonPriceCents: 2200, lessonMinutes: 60, billingMode: 'package', chargeNoShow: true, weeklyLessons: 2 },
  { studentId: 's5', lessonPriceCents: 2000, lessonMinutes: 45, billingMode: 'actual', chargeNoShow: false, weeklyLessons: 1 },
  { studentId: 'st', lessonPriceCents: 2000, lessonMinutes: 60, billingMode: 'advance', chargeNoShow: true, weeklyLessons: 2, subjectPrices: { Matemaatika: { lessonPriceCents: 2800, lessonMinutes: 45 } } },
];

export const schedule = [
  { id: 'e1', studentId: 's1', recurring: true, day: 'Wed', startDate: '2031-09-03', time: '16:00', duration: 60, excludedDates: ['2031-10-22'] },
  { id: 'e2', studentId: 's2', recurring: true, day: 'Wed', startDate: '2031-09-03', time: '17:00', duration: 90 },
  { id: 'e4', studentId: 's4', recurring: true, day: 'Mon', startDate: '2031-09-01', time: '17:00', duration: 60 },
  { id: 'e5', studentId: 's5', recurring: true, day: 'Tue', startDate: '2031-09-02', time: '17:00', duration: 45 },
  est('est'),
  mat('mat'),
];

export const groups = [{ id: 'g1', name: 'A2', students: ['s1'], lessons: [{ id: 'gl', day: 'Fri', time: '18:00', duration: 60, recurring: true, startDate: '2031-10-01', endDate: '2031-10-10' }] }];

const day = (date, studentId, status, extra = {}) => ({ id: `${studentId}-${date}`, studentId, date, status, duration: 60, ...extra });
export const lessons = [
  day('2031-09-03', 's1', 'Toimunud'), day('2031-09-10', 's1', 'Puudus_p'), day('2031-09-17', 's1', 'Puudus_eta'), day('2031-09-24', 's1', 'Puudus_eta', { billingWaived: true }),
  day('2031-09-03', 's2', 'Toimunud', { duration: 90 }), day('2031-09-10', 's2', 'Toimunud', { duration: 90 }),
  day('2031-10-07', 's5', 'Toimunud', { duration: 45 }), day('2031-10-14', 's5', 'Puudus_eta', { duration: 45 }), day('2031-10-21', 's5', 'Toimunud', { duration: 45, billingStatus: 'school_covered' }),
  day('2031-10-01', 'st', 'Toimunud', { subject: 'Eesti keel' }), day('2031-10-08', 'st', 'Puudus_eta', { subject: 'Eesti keel' }),
  day('2031-10-02', 'st', 'Toimunud', { duration: 45, teacherUid: 'y1' }), day('2031-10-09', 'st', 'Puudus_p', { duration: 45, subject: 'Matemaatika' }),
  day('2031-10-16', 'st', 'Puudus_eta', { duration: 45, subject: 'Matemaatika' }),
];

export const invoices = [
  { id: 'i1', studentId: 's1', planMonth: '2031-09', plannedUnits: 4, status: 'Ootel' },
  { id: 'i2', studentId: 's2', planMonth: '2031-09', plannedUnits: 6, correctionUnits: 0, status: 'Makstud' },
  { id: 'i3', planMonth: '2031-10', status: 'Saadetud', combined: true, studentIds: ['st'], cardParts: [
    { studentId: 'st', subject: 'Eesti keel', plannedUnits: 5 }, { studentId: 'st', subject: 'Matemaatika', plannedUnits: 5 }] },
];

export const MONTHS = ['2031-09', '2031-10', '2031-11'];

// what a row bills, without the card and plan objects
export function summary(row) {
  return {
    id: row.student.id, mode: row.mode, status: row.status, lessonCount: row.lessonCount, lessonsLeft: row.lessonsLeft,
    plannedUnits: row.plannedUnits, priceCents: row.priceCents, totalCents: row.totalCents, due: row.due, payerEmail: row.payerEmail,
    correction: { units: row.correction.units, note: row.correction.note, noShows: (row.correction.noShows || []).map((item) => item.id), unmarked: row.correction.unmarked },
    subjectParts: row.subjectParts ? row.subjectParts.map((part) => ({ subject: part.subject, plannedUnits: part.plannedUnits, priceCents: part.priceCents, minutes: part.minutes, lessonCount: part.lessonCount, totalCents: part.totalCents, correction: { units: part.correction.units, note: part.correction.note } })) : null,
  };
}

// every month: the rows, the invoice items of the ready rows and the lessons left per card
export function goldenOf({ monthlyBillingRows, invoiceItems, studentLessonBalances }) {
  return Object.fromEntries(MONTHS.map((month) => {
    const rows = monthlyBillingRows({ month, students, plans, schedule, groups, lessons, invoices });
    return [month, {
      rows: rows.map(summary),
      items: invoiceItems(rows.filter((row) => row.status === 'ready')),
      balances: Object.fromEntries(students.map((student) => [student.id, studentLessonBalances({ student, plan: plans.find((plan) => plan.studentId === student.id), invoices, lessons, month })])),
    }];
  }));
}
