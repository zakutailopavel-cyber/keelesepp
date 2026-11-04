// FAKE demo family for the parent lab page (screenshots) and tests — invented names and numbers, no real data.
// Mia (B1): five months of lessons, homework, words and goals. Oskar (A2): started this month. `empty`: a child with
// nothing yet. Dates are built from `today` so the pictures always show the last months.
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
const MIA_GOALS = [
  ['Igapäevaelu', 'Ma oskan rääkida oma päevast'], ['Igapäevaelu', 'Ma oskan kokku leppida aja'],
  ['Toit ja teenindus', 'Ma oskan poes küsida ja osta'], ['Toit ja teenindus', 'Ma oskan kohvikus tellida'],
  ['Tervis', 'Ma oskan kirjeldada, mis valutab'], ['Tervis', 'Ma oskan arsti juurde aja panna'],
  ['Töö ja amet', 'Ma oskan lugeda töökuulutust'], ['Töö ja amet', 'Ma oskan vastata tööintervjuu küsimustele'], ['Töö ja amet', 'Ma oskan kirjutada lühikese CV'],
];

export function demoFamily(today, family = 'two') {
  const students = family === 'empty'
    ? [{ id: 'demo-lena', name: 'Lena Kask', level: 'A2', subject: 'Eesti keel', teacher: 'Kadri Õpetaja', linkedParentId: 'demo-parent', recordingConsent: true, recordingConsentAt: '2026-10-01', enrollments: [{ id: 'e-lena', subject: 'Eesti keel', level: 'A2', targetLevel: 'B1', teacher: 'Kadri Õpetaja' }] }]
    : [
      { id: 'demo-mia', name: 'Mia Tamm', level: 'B1', subject: 'Eesti keel', teacher: 'Kadri Õpetaja', linkedParentId: 'demo-parent', recordingConsent: true, recordingConsentAt: '2026-07-01', enrollments: [{ id: 'e-mia', subject: 'Eesti keel', level: 'B1', targetLevel: 'B2', teacher: 'Kadri Õpetaja' }] },
      ...(family === 'two' ? [{ id: 'demo-oskar', name: 'Oskar Tamm', level: 'A2', subject: 'Eesti keel', teacher: 'Jaan Õpetaja', linkedParentId: 'demo-parent', recordingConsent: true, recordingConsentAt: '2026-11-01', enrollments: [{ id: 'e-oskar', subject: 'Eesti keel', level: 'A2', targetLevel: 'B1', teacher: 'Jaan Õpetaja' }] }] : []),
    ];
  const lessons = [];
  const homework = [];
  const assignments = [];
  const words = [];
  const schedule = [];
  const invoices = [];
  if (family === 'empty') {
    schedule.push({ id: 'sch-lena', studentId: 'demo-lena', studentName: 'Lena Kask', teacher: 'Kadri Õpetaja', date: shift(today, 2), time: '16:00', duration: 60, status: 'Planeeritud' });
    return { students, lessons, homework, assignments, words, schedule, invoices, submissions: [] };
  }

  // Mia: lessons per month (5 months back → this month), with a few missed ones
  const perMonth = [[4, 1], [6, 0], [7, 1], [8, 0], [2, 0]];
  let topic = 0;
  perMonth.forEach(([held, missed], index) => {
    const back = 4 - index;
    for (let n = 0; n < held + missed; n += 1) {
      const date = back === 0 ? shift(today, -(n * 2 + 1)) : at(today, back, 3 + n * 3);
      const [title, module] = MIA_TOPICS[Math.min(MIA_TOPICS.length - 1, Math.floor(topic))];
      topic += 0.45;
      lessons.push({ id: `l-mia-${index}-${n}`, studentId: 'demo-mia', studentName: 'Mia Tamm', date, time: '16:00', teacher: 'Kadri Õpetaja', status: n < held ? 'Toimunud' : 'Puudus_p', topic: n < held ? title : '', topicLevel: 'B1', topicModule: module });
    }
  });
  // Mia: homework with deadlines, mostly on time, better over the months
  const onTime = [[3, 2], [4, 3], [5, 4], [6, 6], [2, 2]];
  onTime.forEach(([count, good], index) => {
    const back = 4 - index;
    for (let n = 0; n < count; n += 1) {
      const due = back === 0 ? shift(today, n === 0 ? -2 : -1) : at(today, back, 6 + n * 4);
      const done = n < good ? shift(due, -1) : shift(due, 3);
      homework.push({ id: `h-mia-${index}-${n}`, studentId: 'demo-mia', task: `Kodutöö ${n + 1}`, due, status: 'Tehtud', submittedAt: stamp(done) });
    }
  });
  homework.push({ id: 'h-mia-open-1', studentId: 'demo-mia', task: 'Loe töökuulutust ja vasta küsimustele', due: shift(today, 2), status: 'Ootel' });
  homework.push({ id: 'h-mia-open-2', studentId: 'demo-mia', task: 'Kirjuta 5 lauset oma tööpäevast', due: shift(today, 5), status: 'Ootel' });
  // Mia: words — 35, 70, 120, 180, 205 at the months' ends
  [35, 35, 50, 60, 25].forEach((count, index) => {
    const back = 4 - index;
    for (let n = 0; n < count; n += 1) words.push({ id: `w-mia-${index}-${n}`, studentId: 'demo-mia', word: `sõna ${index}-${n}`, translation: 'слово', box: n % 3 === 0 ? 3 : 1, createdAt: stamp(back === 0 ? shift(today, -(n % 3)) : at(today, back, 1 + (n % 27))) });
  });
  words.push({ id: 'w-mia-sentence', studentId: 'demo-mia', word: 'Ma lähen tööle.', translation: 'Sinu lause: Ma lähen tööl.', box: 1, createdAt: stamp(shift(today, -3)) });
  // Mia: auto-checked sheets with lesson goals; a goal reaches ≥ 80 % over time
  const goalPlan = [
    [0, [[0, 9, 10], [1, 6, 10]]], [1, [[1, 9, 10], [2, 8, 10], [3, 5, 10]]], [2, [[3, 9, 10], [4, 9, 10], [5, 7, 10]]],
    [3, [[5, 9, 10], [6, 9, 10], [7, 6, 10]]], [4, [[7, 7, 10], [8, 4, 10]]],
  ];
  goalPlan.forEach(([index, items]) => {
    const back = 4 - index;
    items.forEach(([goal, ok, total], n) => {
      const [module, text] = MIA_GOALS[goal];
      const day = back === 0 ? shift(today, -(n + 1)) : at(today, back, 10 + n * 5);
      assignments.push({ id: `a-mia-${index}-${n}`, studentId: 'demo-mia', status: 'done', phase: 'practice', lessonTitle: module, title: `${module} · Harjuta`, assignedAt: stamp(shift(day, -3)), completedAt: stamp(day), dueDate: day,
        worksheetDoc: { meta: { title: module, goals: { g_1: text } } }, score: { perGoal: { g_1: { ok, total } } } });
    });
  });
  // one sheet of this month still to do: its goal shows as „Veel tegemata”
  assignments.push({ id: 'a-mia-todo', studentId: 'demo-mia', status: 'new', phase: 'transfer', lessonTitle: 'Töö ja amet', title: 'Töö ja amet · Kasuta', assignedAt: stamp(shift(today, -1)), dueDate: shift(today, 3), answers: {},
    worksheetDoc: { meta: { title: 'Töö ja amet', goals: { g_1: 'Ma oskan kirjutada kaaskirja' } } } });

  // Oskar: started this month — one lesson, a few words, one homework
  lessons.push({ id: 'l-oskar-1', studentId: 'demo-oskar', studentName: 'Oskar Tamm', date: shift(today, -2), time: '17:00', teacher: 'Jaan Õpetaja', status: 'Toimunud', topic: 'Tutvustan ennast', topicLevel: 'A2', topicModule: 'Mina ja minu pere' });
  for (let n = 0; n < 14; n += 1) words.push({ id: `w-oskar-${n}`, studentId: 'demo-oskar', word: `sõna ${n}`, translation: 'слово', box: 0, createdAt: stamp(shift(today, -2)) });
  homework.push({ id: 'h-oskar-1', studentId: 'demo-oskar', task: 'Kirjuta 5 lauset endast', due: shift(today, 3), status: 'Ootel' });

  // next lessons
  [1, 3, 8, 10].forEach((days, n) => schedule.push({ id: `sch-mia-${n}`, studentId: 'demo-mia', studentName: 'Mia Tamm', teacher: 'Kadri Õpetaja', date: shift(today, days), time: '16:00', duration: 60, status: 'Planeeritud' }));
  schedule.push({ id: 'sch-oskar', studentId: 'demo-oskar', studentName: 'Oskar Tamm', teacher: 'Jaan Õpetaja', date: shift(today, 2), time: '17:00', duration: 45, status: 'Planeeritud' });
  // one unpaid invoice (a family invoice, money only — never lessons left)
  invoices.push({ id: 'inv-1', num: 'KS-2026-311', studentId: 'demo-mia', studentName: 'Mia Tamm', amountCents: 20000, paidAmountCents: 0, status: 'Ootel', date: at(today, 0, 1), due: shift(today, 10), desc: 'November' });
  invoices.push({ id: 'inv-0', num: 'KS-2026-270', studentId: 'demo-mia', studentName: 'Mia Tamm', amountCents: 20000, paidAmountCents: 20000, status: 'Makstud', date: at(today, 1, 1), desc: 'Oktoober' });
  return { students, lessons, homework, assignments, words, schedule, invoices, submissions: [] };
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
    summaryService: { listForStudents: async () => [] },
    boardCopiesService: { listForStudents: async () => [] },
    announcementService: { listAnswered: async () => [] },
  };
}
