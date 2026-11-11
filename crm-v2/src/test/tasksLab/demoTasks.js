// FAKE demo tasks for the „Ülesanded” lab page (screenshots) — invented names and texts, no real data. Like the owner's
// test student on 2026-11-10: a lesson's three sheets given with the same teacher line a month ago, a word-card task,
// more old sheets, one fresh lesson, and some done work with a grade. Dates are built from `today`.
const pad = (value) => String(value).padStart(2, '0');
const iso = (date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
export const shift = (today, days) => { const date = new Date(`${today}T12:00:00`); date.setDate(date.getDate() + days); return iso(date); };
const stamp = (day, time = '18:30') => new Date(`${day}T${time}:00`).toISOString();

const doc = (title, canDo, count = 16) => ({ meta: { title, canDo }, blocks: [{ id: 'g', type: 'gaps', data: { sentences: Array(count).fill('Ma [loen] raamatut.').join('\n') } }] });
const PHASE_TITLE = { discover: 'Avasta', practice: 'Harjuta', transfer: 'Kasuta' };

export function demoTasks(today) {
  const studentId = 'demo-test';
  const sheets = [];
  const homework = [];
  const submissions = [];
  const lesson = ({ id, title, canDo, daysAgo, due = null, phases = ['discover', 'practice', 'transfer'], done = [], started = [], teacherLine = '', invitationId = '' }) => {
    phases.forEach((phase) => {
      const sheetId = `${id}-${phase}`;
      const isDone = done.includes(phase);
      sheets.push({
        id: sheetId, studentId, studentName: 'Test Õpilane', lessonId: id, lessonTitle: title, title: `${title} · ${PHASE_TITLE[phase]}`, phase, subject: 'Eesti keel',
        source: 'learning_library', status: isDone ? 'done' : 'new', completedAt: isDone ? stamp(shift(today, -daysAgo + 1)) : '',
        answers: started.includes(phase) || isDone ? { a: 'Ma loen.' } : {}, assignedAt: stamp(shift(today, -daysAgo)), dueDate: due === null ? '' : shift(today, due),
        worksheetDoc: doc(`${title} · ${PHASE_TITLE[phase]}`, canDo),
      });
      if (teacherLine) homework.push({ id: `hw-${sheetId}`, studentId, studentName: 'Test Õpilane', task: teacherLine, status: isDone ? 'Tehtud' : 'Ootel', due: due === null ? '' : shift(today, due), worksheetAssignmentId: sheetId, invitationId, date: shift(today, -daysAgo), createdAt: stamp(shift(today, -daysAgo)) });
    });
  };

  // the owner's screenshot: one lesson, three sheets, the same „Testülesanne” line on each, deadline a month ago
  lesson({ id: 'b1-07', title: 'Minu nädal', canDo: 'Ma räägin oma nädalast.', daysAgo: 32, due: -30, teacherLine: 'Testülesanne', invitationId: 'inv-old' });
  homework.push({ id: 'hw-words', studentId, studentName: 'Test Õpilane', task: 'Korda tunni sõnu sõnakaartidega 10 minutit', status: 'Ootel', due: shift(today, -28), invitationId: 'inv-old', date: shift(today, -32), createdAt: stamp(shift(today, -32)) });
  lesson({ id: 'b1-08', title: 'Ilm ja aastaajad', canDo: 'Ma oskan ilmast rääkida.', daysAgo: 30, due: -27 });
  lesson({ id: 'b1-09', title: 'Poes ja turul', canDo: 'Ma oskan poes küsida.', daysAgo: 29, due: -26, done: ['discover'] });
  homework.push({ id: 'hw-essay', studentId, studentName: 'Test Õpilane', task: 'Kirjuta 5 lauset oma eelmisest nädalavahetusest', status: 'Ootel', due: shift(today, -26), date: shift(today, -29), createdAt: stamp(shift(today, -29)) });
  // a fresh lesson (yesterday), Avasta begun
  lesson({ id: 'b1-12', title: 'Tervis ja arsti juures', canDo: 'Ma oskan arstile öelda, mis valutab.', daysAgo: 1, due: 5, started: ['discover'], teacherLine: 'Tee lehed järjest, Kasuta enne järgmist tundi.', invitationId: 'inv-new' });
  homework.push({ id: 'hw-words-new', studentId, studentName: 'Test Õpilane', task: 'Korda tunni sõnu („Minu sõnad” → „Harjuta”)', status: 'Ootel', due: shift(today, 5), invitationId: 'inv-new', date: shift(today, -1), createdAt: stamp(shift(today, -1)) });
  // a lesson last week, half done
  lesson({ id: 'b1-11', title: 'Minu kodu', canDo: 'Ma kirjeldan oma kodu.', daysAgo: 6, due: -1, done: ['discover'] });
  // done and reviewed work
  lesson({ id: 'b1-10', title: 'Hommikust õhtuni', canDo: 'Ma räägin oma päevast.', daysAgo: 9, done: ['discover', 'practice', 'transfer'] });
  submissions.push({ id: 'b1-10-transfer', submissionKind: 'worksheet', studentId, studentName: 'Test Õpilane', title: 'Hommikust õhtuni · Kasuta', status: 'done', completedAt: stamp(shift(today, -8)), percentage: 92, reviewStatus: 'reviewed', teacherGrade: 5, teacherFeedback: 'Väga hea! Jälgi ainult sõnajärge.', reviewedAt: stamp(shift(today, -7)) });
  homework.push({ id: 'hw-done', studentId, studentName: 'Test Õpilane', task: 'Loe tekst „Minu sõber” ette', status: 'Tehtud', submittedAt: stamp(shift(today, -3)), date: shift(today, -6), createdAt: stamp(shift(today, -6)) });

  const words = [
    { id: 'w1', studentId, word: 'valutama', translation: 'болеть', invitationId: 'inv-new', box: 0, reviews: 0, createdAt: stamp(shift(today, -1)) },
    { id: 'w2', studentId, word: 'retsept', translation: 'рецепт', invitationId: 'inv-new', box: 0, reviews: 0, createdAt: stamp(shift(today, -1)) },
    { id: 'w3', studentId, word: 'palavik', translation: 'температура', invitationId: 'inv-new', box: 0, reviews: 0, createdAt: stamp(shift(today, -1)) },
    { id: 'w4', studentId, word: 'nädal', translation: 'неделя', invitationId: 'inv-old', box: 1, reviews: 2, dueAt: stamp(shift(today, -2)), reviewedAt: stamp(shift(today, -9)), createdAt: stamp(shift(today, -32)) },
    { id: 'w5', studentId, word: 'esmaspäev', translation: 'понедельник', invitationId: 'inv-old', box: 1, reviews: 2, dueAt: stamp(shift(today, -2)), reviewedAt: stamp(shift(today, -9)), createdAt: stamp(shift(today, -32)) },
  ];
  return { student: { id: studentId, name: 'Test Õpilane', subject: 'Eesti keel', level: 'A2', targetLevel: 'B1' }, sheets, homework, submissions, words };
}
