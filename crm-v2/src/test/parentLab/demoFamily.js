// FAKE demo family for the parent lab page (screenshots) and tests — invented names and numbers, no real data.
// Aleksandr (Eesti keel A1 → B1): months of lessons, homework, goals and a „Keeleoskus” curve B1 43 % → 62 % with a
// mock exam. Sofia (A2): started this month, one measured point. `empty`: a child with nothing yet. Dates are built from `today` so the pictures always show the last months.
import { B1_LESSON_GOALS } from '../../features/worksheet-generator/admin/course/b1/lessonGoals.js';

const pad = (value) => String(value).padStart(2, '0');
const iso = (date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
const at = (today, monthsBack, day) => { const date = new Date(`${today}T12:00:00`); date.setDate(1); date.setMonth(date.getMonth() - monthsBack); date.setDate(day); return iso(date); };
const shift = (dayIso, days) => { const date = new Date(`${dayIso}T12:00:00`); date.setDate(date.getDate() + days); return iso(date); };
const stamp = (dayIso, time = '18:30') => new Date(`${dayIso}T${time}:00`).toISOString();

const MIA_TOPICS = [
  ['Minu päev ja harjumused', 'Igapäevaelu'], ['Kellaajad ja kokkulepped', 'Igapäevaelu'], ['Poes ja turul', 'Toit ja teenindus'],
  ['Kohvikus tellimine', 'Toit ja teenindus'], ['Arsti juures', 'Tervis'], ['Kuidas ma end tunnen', 'Tervis'],
  ['Töökuulutuse lugemine', 'Töö ja amet'], ['Tööintervjuu küsimused', 'Töö ja amet'], ['CV ja kaaskiri', 'Töö ja amet'], ['Minu tööpäev', 'Töö ja amet'],
];
// the curve example ends here (owner 2026-11-04: 62 % on 4.11.2026)
const COURSE_END = '2026-11-03';

export function demoFamily(today, family = 'two') {
  const students = family === 'empty'
    ? [{ id: 'demo-lena', name: 'Lena Kask', level: 'A2', subject: 'Eesti keel', teacher: 'Kadri Õpetaja', linkedParentId: 'demo-parent', recordingConsent: true, recordingConsentAt: '2026-10-01', enrollments: [{ id: 'e-lena', subject: 'Eesti keel', level: 'A2', targetLevel: 'B1', teacher: 'Kadri Õpetaja' }] }]
    : [
      { id: 'demo-aleksandr', name: 'Aleksandr Smirnov', level: 'A1', targetLevel: 'B1', subject: 'Eesti keel', teacher: 'Kadri Õpetaja', linkedParentId: 'demo-parent', recordingConsent: true, recordingConsentAt: '2026-07-01', enrollments: [{ id: 'e-al', subject: 'Eesti keel', level: 'A1', targetLevel: 'B1', teacher: 'Kadri Õpetaja' }] },
      ...(family === 'two' ? [{ id: 'demo-sofia', name: 'Sofia Smirnova', level: 'A2', subject: 'Eesti keel', teacher: 'Jaan Õpetaja', linkedParentId: 'demo-parent', recordingConsent: true, recordingConsentAt: '2026-11-01', enrollments: [{ id: 'e-sofia', subject: 'Eesti keel', level: 'A2', targetLevel: 'B1', teacher: 'Jaan Õpetaja' }] }] : []),
    ];
  const lessons = [];
  const homework = [];
  const assignments = [];
  const words = [];
  const schedule = [];
  const invoices = [];
  if (family === 'empty') {
    schedule.push({ id: 'sch-lena', studentId: 'demo-lena', studentName: 'Lena Kask', teacher: 'Kadri Õpetaja', date: shift(today, 2), time: '16:00', duration: 60, status: 'Planeeritud' });
    return { students, lessons, homework, assignments, words, schedule, invoices, progressPoints: [], submissions: [] };
  }

  // Aleksandr: lessons per month (5 months back → this month), with a few missed ones
  const perMonth = [[4, 1], [6, 0], [7, 1], [8, 0], [2, 0]];
  let topic = 0;
  perMonth.forEach(([held, missed], index) => {
    const back = 4 - index;
    for (let n = 0; n < held + missed; n += 1) {
      const date = back === 0 ? shift(today, -(n * 2 + 1)) : at(today, back, 3 + n * 3);
      const [title, module] = MIA_TOPICS[Math.min(MIA_TOPICS.length - 1, Math.floor(topic))];
      topic += 0.45;
      lessons.push({ id: `l-al-${index}-${n}`, studentId: 'demo-aleksandr', studentName: 'Aleksandr Smirnov', date, time: '16:00', teacher: 'Kadri Õpetaja', status: n < held ? 'Toimunud' : 'Puudus_p', topic: n < held ? title : '', topicLevel: 'A2', topicModule: module });
    }
  });
  // Aleksandr: homework with deadlines, mostly on time, better over the months
  const onTime = [[3, 2], [4, 3], [5, 4], [6, 6], [2, 2]];
  onTime.forEach(([count, good], index) => {
    const back = 4 - index;
    for (let n = 0; n < count; n += 1) {
      const due = back === 0 ? shift(today, n === 0 ? -2 : -1) : at(today, back, 6 + n * 4);
      const done = n < good ? shift(due, -1) : shift(due, 3);
      homework.push({ id: `h-al-${index}-${n}`, studentId: 'demo-aleksandr', task: `Kodutöö ${n + 1}`, due, status: 'Tehtud', submittedAt: stamp(done) });
    }
  });
  homework.push({ id: 'h-al-open-1', studentId: 'demo-aleksandr', task: 'Loe töökuulutust ja vasta küsimustele', due: shift(today, 2), status: 'Ootel' });
  homework.push({ id: 'h-al-open-2', studentId: 'demo-aleksandr', task: 'Kirjuta 5 lauset oma tööpäevast', due: shift(today, 5), status: 'Ootel' });
  // Aleksandr: words — 35, 70, 120, 180, 205 at the months' ends
  [35, 35, 50, 60, 25].forEach((count, index) => {
    const back = 4 - index;
    for (let n = 0; n < count; n += 1) words.push({ id: `w-al-${index}-${n}`, studentId: 'demo-aleksandr', word: `sõna ${index}-${n}`, translation: 'слово', box: n % 3 === 0 ? 3 : 1, createdAt: stamp(back === 0 ? shift(today, -(n % 3)) : at(today, back, 1 + (n % 27))) });
  });
  words.push({ id: 'w-al-sentence', studentId: 'demo-aleksandr', word: 'Ma lähen tööle.', translation: 'Sinu lause: Ma lähen tööl.', box: 1, createdAt: stamp(shift(today, -3)) });
  // Aleksandr: the B1 course (a2b1) sheets he handed in from 11 July: each lesson's Avasta + Harjuta, auto-checked per
  // goal (teacher-graded g_use left out). Enough goals reach „Oskan” (≥ 70 % in ≥ 2 sheets) for the level curve to go
  // from the start 43 % (11.07) to 62 % (3.11): 43 + 57 × mastered / all goals.
  const courseIds = Object.keys(B1_LESSON_GOALS);
  const totalGoals = courseIds.reduce((sum, id) => sum + Object.keys(B1_LESSON_GOALS[id].goals || {}).length, 0);
  const wanted = Math.round((totalGoals * (62 - 43)) / 57);
  const plan = [];
  for (const id of courseIds) {
    const goals = Object.keys(B1_LESSON_GOALS[id].goals || {}).filter((goal) => goal !== 'g_use');
    plan.push({ id, goals: goals.slice(0, Math.max(0, wanted - plan.reduce((sum, item) => sum + item.goals.length, 0))) });
    if (plan.reduce((sum, item) => sum + item.goals.length, 0) >= wanted) break;
  }
  const first = Date.parse('2026-07-14T12:00:00Z');
  const lastDay = Date.parse(`${COURSE_END}T12:00:00Z`);
  plan.forEach(({ id, goals }, index) => {
    const day = new Date(first + ((lastDay - first) * index) / Math.max(1, plan.length - 1)).toISOString().slice(0, 10);
    ['discover', 'practice'].forEach((phase, n) => {
      const done = shift(day, n);
      const perGoal = Object.fromEntries(goals.map((goal) => [goal, { ok: 9, total: 10 }]));
      assignments.push({ id: `a-al-${id}-${phase}`, studentId: 'demo-aleksandr', status: 'done', phase, lessonTitle: `B1 · tund ${index + 1}`, title: `B1 · tund ${index + 1} · ${phase === 'discover' ? 'Avasta' : 'Harjuta'}`,
        assignedAt: stamp(shift(done, -3)), completedAt: stamp(done), dueDate: done,
        worksheetDoc: { id: `ws_${id}_${phase}`, meta: { title: `B1 · tund ${index + 1}`, canDo: B1_LESSON_GOALS[id].canDo, goals: B1_LESSON_GOALS[id].goals } }, score: { perGoal } });
    });
  });
  // the newest lesson's Kasuta: still to do, and one weaker sheet (Harjutan / Kordame in „Mida õpime praegu”)
  const next = courseIds[plan.length];
  if (next) {
    assignments.push({ id: 'a-al-weak', studentId: 'demo-aleksandr', status: 'done', phase: 'discover', lessonTitle: `B1 · tund ${plan.length + 1}`, title: `B1 · tund ${plan.length + 1} · Avasta`, assignedAt: stamp(shift(today, -4)), completedAt: stamp(shift(today, -2)), dueDate: shift(today, -2),
      worksheetDoc: { id: `ws_${next}_discover`, meta: { title: `B1 · tund ${plan.length + 1}`, canDo: B1_LESSON_GOALS[next].canDo, goals: B1_LESSON_GOALS[next].goals } }, score: { perGoal: { g_vocab: { ok: 6, total: 10 }, g_read: { ok: 3, total: 10 } } } });
    assignments.push({ id: 'a-al-todo', studentId: 'demo-aleksandr', status: 'new', phase: 'transfer', lessonTitle: `B1 · tund ${plan.length + 1}`, title: `B1 · tund ${plan.length + 1} · Kasuta`, assignedAt: stamp(shift(today, -1)), dueDate: shift(today, 3), answers: {},
      worksheetDoc: { id: `ws_${next}_transfer`, meta: { title: `B1 · tund ${plan.length + 1}`, canDo: 'Ma kirjutan lühikese kaaskirja tööpakkumisele.', goals: { g_use: 'Ma kirjutan lühikese kaaskirja tööpakkumisele.' } } } });
  }

  // Sofia: started this month — one lesson, a few words, one homework
  lessons.push({ id: 'l-sofia-1', studentId: 'demo-sofia', studentName: 'Sofia Smirnova', date: shift(today, -2), time: '17:00', teacher: 'Jaan Õpetaja', status: 'Toimunud', topic: 'Tutvustan ennast', topicLevel: 'A2', topicModule: 'Mina ja minu pere' });
  for (let n = 0; n < 14; n += 1) words.push({ id: `w-sofia-${n}`, studentId: 'demo-sofia', word: `sõna ${n}`, translation: 'слово', box: 0, createdAt: stamp(shift(today, -2)) });
  homework.push({ id: 'h-sofia-1', studentId: 'demo-sofia', task: 'Kirjuta 5 lauset endast', due: shift(today, 3), status: 'Ootel' });

  // next lessons
  [1, 3, 8, 10].forEach((days, n) => schedule.push({ id: `sch-al-${n}`, studentId: 'demo-aleksandr', studentName: 'Aleksandr Smirnov', teacher: 'Kadri Õpetaja', date: shift(today, days), time: '16:00', duration: 60, status: 'Planeeritud' }));
  schedule.push({ id: 'sch-sofia', studentId: 'demo-sofia', studentName: 'Sofia Smirnova', teacher: 'Jaan Õpetaja', date: shift(today, 2), time: '17:00', duration: 45, status: 'Planeeritud' });
  // one unpaid invoice (a family invoice, money only — never lessons left)
  invoices.push({ id: 'inv-1', num: 'KS-2026-311', studentId: 'demo-aleksandr', studentName: 'Aleksandr Smirnov', amountCents: 20000, paidAmountCents: 0, status: 'Ootel', date: at(today, 0, 1), due: shift(today, 10), desc: 'November' });
  invoices.push({ id: 'inv-0', num: 'KS-2026-270', studentId: 'demo-aleksandr', studentName: 'Aleksandr Smirnov', amountCents: 20000, paidAmountCents: 20000, status: 'Makstud', date: at(today, 1, 1), desc: 'Oktoober' });
  // „Keeleoskus” points (progressPoints): Aleksandr's start 43 % on 11.07 („Algus”, teacher) and a mock exam 64 % on
  // 23.10 (a marker only); Sofia's start 35 % today. The rest of the curve is computed from the sheets above.
  const point = (studentId, date, level, percent, kind, label) => ({ id: `pp-${studentId}-${date}-${kind}`, studentId, date, level, percent, kind, label, createdBy: 'demo-teacher', createdByName: 'Kadri Õpetaja', createdAt: `${date}T10:00:00.000Z` });
  const progressPoints = [
    point('demo-aleksandr', '2026-07-11', 'B1', 43, 'teacher', 'Algus'),
    point('demo-aleksandr', '2026-10-23', 'B1', 64, 'exam', 'Proovieksam'),
    point('demo-sofia', today, 'B1', 35, 'teacher', 'Algus'),
  ];
  return { students, lessons, homework, assignments, words, schedule, invoices, progressPoints, submissions: [] };
}

// fake repositories with the same methods the page calls; reads only, nothing is written anywhere
export function demoRepositories(data) {
  const byStudent = (items) => async (studentId) => items.filter((item) => item.studentId === studentId);
  const byStudents = (items) => async (ids) => items.filter((item) => ids.includes(item.studentId));
  return {
    studentRepository: { listOwned: async () => data.students },
    homeworkRepository: { listByStudentIds: byStudents(data.homework), listWorksheetAssignmentsByStudentIds: byStudents(data.assignments), listSubmissionsByStudentIds: byStudents(data.submissions) },
    scheduleRepository: { listByStudent: byStudent(data.schedule) },
    invoiceRepository: { listByStudent: byStudent(data.invoices) },
    lessonRepository: { listByStudent: byStudent(data.lessons) },
    changeRequests: { listForStudents: async () => [], create: async () => ({}) },
    wordsService: { subscribeForStudent: (studentId, onData) => { onData(data.words.filter((word) => word.studentId === studentId)); return () => {}; } },
    consentService: { answerConsent: async () => ({}) },
    summaryService: { listForStudents: async () => [], subscribeForStudent: (id, onData) => { onData([]); return () => {}; } },
    boardCopiesService: { listForStudents: async () => [], subscribe: (id, onData) => { onData([]); return () => {}; } },
    // the student's own „Minu areng” (lab ?view=student)
    studentSelf: { listSelf: async () => data.students.slice(0, 1), getById: async (id) => data.students.find((item) => item.id === id) || null },
    availabilityService: { get: async () => null, getForStudent: async () => null, subscribe: () => () => {} },
    pointsService: { listForStudents: byStudents(data.progressPoints || []) },
    announcementService: { listAnswered: async () => [] },
  };
}
