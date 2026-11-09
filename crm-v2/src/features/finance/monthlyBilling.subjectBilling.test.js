import { invoiceItems, monthlyBillingRows, studentLessonBalances } from './monthlyBilling.js';

// Billing per subject (owner 2026-11-06): one card, Eesti keel by monthly invoice, Inglise keel by lesson packages,
// Matemaatika with its own no-show rule. October 2031: Wednesdays 1, 8, 15, 22, 29 (Estonian), Mondays 6, 13, 20, 27
// (English), Thursdays 2, 9, 16, 23, 30 (maths, 45 min).
const card = { id: 'k', name: 'Kristjan', active: true, subject: 'Eesti keel', parentEmail: 'ema@example.com', enrollments: [
  { subject: 'Eesti keel', teacher: 'Pavel', teacherUid: 'p1' },
  { subject: 'Inglise keel', teacher: 'Anna', teacherUid: 'a1' },
  { subject: 'Matemaatika', teacher: 'Yelyzaveta', teacherUid: 'y1' },
] };
const schedule = [
  { id: 'est', studentId: 'k', teacherUid: 'p1', recurring: true, day: 'Wed', startDate: '2031-09-03', time: '16:00', duration: 60, subject: 'Eesti keel' },
  { id: 'eng', studentId: 'k', teacherUid: 'a1', recurring: true, day: 'Mon', startDate: '2031-09-01', time: '16:00', duration: 60, subject: 'Inglise keel' },
  { id: 'mat', studentId: 'k', teacherUid: 'y1', recurring: true, day: 'Thu', startDate: '2031-09-04', time: '16:00', duration: 45 },
];
const base = { studentId: 'k', lessonPriceCents: 2000, lessonMinutes: 60, billingMode: 'advance', chargeNoShow: true, weeklyLessons: 1,
  subjectPrices: { 'Inglise keel': { lessonPriceCents: 2500, lessonMinutes: 60 }, Matemaatika: { lessonPriceCents: 2800, lessonMinutes: 45 } } };
const rowOf = (plan, extra = {}) => monthlyBillingRows({ month: '2031-10', students: [card], plans: [plan], schedule, groups: [], lessons: [], invoices: [], ...extra })[0];

describe('per-subject billing mode on one card', () => {
  it('a subject on lesson packages gets no monthly line; the others bill as before', () => {
    const plan = { ...base, subjectBilling: { 'Inglise keel': { billingMode: 'package' } } };
    const row = rowOf(plan);
    expect(row.mode).toBe('advance');
    expect(row.status).toBe('ready');
    expect(row.packageSubjects).toEqual(['Inglise keel']);
    expect(row.subjectParts.map((part) => [part.subject, part.plannedUnits, part.priceCents])).toEqual([['Eesti keel', 5, 2000], ['Matemaatika', 5, 2800]]);
    expect(row.lessonCount).toBe(10); // the 4 English Mondays are not on the monthly invoice
    expect(row.totalCents).toBe(5 * 2000 + 5 * 2800);
    expect(invoiceItems([row]).map((item) => [item.subject, item.plannedUnits])).toEqual([['Eesti keel', 5], ['Matemaatika', 5]]);
    // the same card without per-subject billing still bills English monthly
    expect(rowOf(base).subjectParts.map((part) => part.subject)).toEqual(['Eesti keel', 'Inglise keel', 'Matemaatika']);
  });

  it('only one subject left on monthly billing: one line with that subject', () => {
    const plan = { ...base, subjectBilling: { 'Inglise keel': { billingMode: 'package' }, Matemaatika: { billingMode: 'package' } } };
    const row = rowOf(plan);
    expect(row.subjectParts.map((part) => part.subject)).toEqual(['Eesti keel']);
    expect(invoiceItems([row])).toEqual([{ studentId: 'k', subject: 'Eesti keel', plannedUnits: 5, correctionUnits: 0, correctionNote: '' }]);
    expect(row.totalCents).toBe(10000);
  });

  it('the card on packages but one subject by monthly invoice: the row bills that subject in its mode', () => {
    const plan = { ...base, billingMode: 'package', subjectBilling: { Matemaatika: { billingMode: 'current' } } };
    const row = rowOf(plan);
    expect(row.mode).toBe('current');
    expect(row.packageSubjects).toEqual(['Eesti keel', 'Inglise keel']);
    expect(invoiceItems([row]).map((item) => [item.subject, item.plannedUnits])).toEqual([['Matemaatika', 5]]);
    expect(row.totalCents).toBe(5 * 2800);
  });

  it('every subject on packages: no monthly invoice', () => {
    const plan = { ...base, billingMode: 'package', subjectBilling: { 'Inglise keel': { weeklyLessons: 2 } } };
    expect(rowOf(plan).status).toBe('package');
  });

  it('„Pärast toimunud tunde” next to „Kuu ette” is not invoiced and says why', () => {
    const plan = { ...base, subjectBilling: { Matemaatika: { billingMode: 'actual' } } };
    const row = rowOf(plan);
    expect(row.status).toBe('mixed-timing');
    expect(row.totalCents).toBe(0);
    expect(row.subjectParts).toEqual([]);
  });

  it('actual + packages: the actual subjects bill their held lessons, the package subject nothing', () => {
    const plan = { ...base, billingMode: 'actual', subjectBilling: { 'Inglise keel': { billingMode: 'package' } } };
    const lessons = [
      { id: 'e1', studentId: 'k', date: '2031-10-01', status: 'Toimunud', duration: 60, subject: 'Eesti keel' },
      { id: 'n1', studentId: 'k', date: '2031-10-06', status: 'Toimunud', duration: 60, subject: 'Inglise keel' },
      { id: 'm1', studentId: 'k', date: '2031-10-02', status: 'Toimunud', duration: 45, teacherUid: 'y1' },
      { id: 'm2', studentId: 'k', date: '2031-10-09', status: 'Puudus_eta', duration: 45, subject: 'Matemaatika' },
    ];
    const row = rowOf(plan, { lessons });
    expect(row.mode).toBe('actual');
    expect(row.due).toBe('2031-11-10');
    expect(row.subjectParts.map((part) => [part.subject, part.plannedUnits])).toEqual([['Eesti keel', 1], ['Matemaatika', 2]]);
    expect(row.totalCents).toBe(2000 + 2 * 2800);
  });
});

describe('per-subject no-show rule', () => {
  // October was invoiced for 5 Estonian and 5 maths lessons; maths had one no-show without notice
  const invoice = { id: 'i', planMonth: '2031-10', status: 'Saadetud', combined: true, studentIds: ['k'], cardParts: [
    { studentId: 'k', subject: 'Eesti keel', plannedUnits: 5 }, { studentId: 'k', subject: 'Matemaatika', plannedUnits: 5 }] };
  const held = [
    ...['01', '08', '15', '22'].map((day) => ({ id: `e${day}`, studentId: 'k', date: `2031-10-${day}`, status: 'Toimunud', duration: 60, subject: 'Eesti keel' })),
    { id: 'e29', studentId: 'k', date: '2031-10-29', status: 'Puudus_eta', duration: 60, subject: 'Eesti keel' },
    ...['02', '09', '16', '23'].map((day) => ({ id: `m${day}`, studentId: 'k', date: `2031-10-${day}`, status: 'Toimunud', duration: 45, subject: 'Matemaatika' })),
    { id: 'm30', studentId: 'k', date: '2031-10-30', status: 'Puudus_eta', duration: 45, subject: 'Matemaatika' },
  ];
  const plan = { ...base, subjectBilling: { 'Inglise keel': { billingMode: 'package' }, Matemaatika: { chargeNoShow: false } } };

  it('a subject whose no-shows are free gets its no-show back; the card’s rule still charges the other subject', () => {
    const row = monthlyBillingRows({ month: '2031-11', students: [card], plans: [plan], schedule, groups: [], lessons: held, invoices: [invoice] })[0];
    const part = (subject) => row.subjectParts.find((item) => item.subject === subject);
    expect(part('Eesti keel').correction.units).toBe(0);
    expect(part('Matemaatika').correction.units).toBe(-1);
    expect(part('Matemaatika').correction.note).toBe('1 erandit');
    expect(row.correction.units).toBe(-1);
    expect(row.correction.note).toBe('Matemaatika: 1 erandit');
  });

  it('lessons left per subject: the package subject has no monthly balance', () => {
    const balances = studentLessonBalances({ student: card, plan, invoices: [invoice], lessons: held, month: '2031-10' });
    expect(balances.map((item) => [item.subject, item.paid, item.used, item.left])).toEqual([['Eesti keel', 5, 5, 0], ['Matemaatika', 5, 4, 1]]);
    // without per-subject billing English is counted (paid nothing → no balance line) and maths' no-show is charged
    const legacy = studentLessonBalances({ student: card, plan: base, invoices: [invoice], lessons: held, month: '2031-10' });
    expect(legacy.map((item) => [item.subject, item.left])).toEqual([['Eesti keel', 0], ['Matemaatika', 0]]);
  });
});
