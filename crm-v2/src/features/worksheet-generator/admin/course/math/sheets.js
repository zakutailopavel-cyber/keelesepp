// The mathematics course as course modules (owner 2026-11-16): every lesson of math/kitsas12.js becomes three sheets
//   discover „1 Teooria ja näited” — formulas to know, a short Russian hint, a worked example (with a graph);
//   practice „2 Harjutame” — scored tasks (block „Matemaatika ülesanne”): a final answer per part, the worked solution
//     in the key;
//   transfer „3 Eksamiülesanne” — one task in the exam's own form and points, squared paper, „Kontrolli end”.
// Not in COURSE_MODULES (like kids/sheets.js): the Estonian-language gates do not judge a maths sheet. The sheet lab
// opens it with set=course:mk12-001:practice.
import { KITSAS_12 } from './kitsas12.js';

const pad = (n) => String(n).padStart(3, '0');
const block = (id, type, tone, goal, data, width = 'full') => ({ id, type, width, span: width === 'full' ? 12 : 6, tone, goal, data });
export const mathLessonId = (program, index) => `${program.id}-${pad(index + 1)}`;

export const MATH_PHASES = {
  discover: { label: '1 Teooria ja näited', slot: 1, subtitle: 'Valemid, mida pead teadma, ja lahendatud näide.' },
  practice: { label: '2 Harjutame', slot: 2, subtitle: 'Lahenda ja kirjuta vastus. Lahenduskäik kirjuta ruudulisele alale.' },
  transfer: { label: '3 Eksamiülesanne', slot: 3, subtitle: 'Ülesanne nagu riigieksamil: kirjuta kogu lahenduskäik.' },
};

export const MATH_GOALS = {
  g_theory: 'Õpilane teab teema valemeid ja reegleid.',
  g_skill: 'Õpilane lahendab teema põhiülesandeid.',
  g_exam: 'Õpilane lahendab eksamiülesande ja kirjutab lahenduskäigu.',
};

// [text, points, answer, solution, rows?] → a part of „Matemaatika ülesanne”
const part = ([text, points, answer, solution, rows = 3]) => ({ text, points, answer, solution, space: rows ? 'grid' : 'none', rows });
const mathtask = (id, task, goal) => block(id, 'mathtask', 'white', goal, {
  title: task.title,
  instruction: task.instruction || '',
  context: task.context || '',
  parts: task.parts.map(part),
  answerLine: true,
});
const graph = (id, g, goal = 'g_theory', width = 'full') => block(id, 'graph', 'white', goal, {
  caption: '', fns: '', points: '', segments: '', shade: '', step: 1, stepY: 0, labelEvery: 1, angle: 'rad', blank: false, ...g,
}, width);

function lessonSheets(program, lesson, index) {
  const id = mathLessonId(program, index);
  const ex = lesson.example;
  const discover = [
    block(`${id}_d_theory`, 'notice', 'white', 'g_theory', { title: 'Valemid ja reeglid', lines: lesson.theory.join('\n') }, ex.graph ? 'full' : 'half'),
    block(`${id}_d_ru`, 'tip', 'white', '', { title: 'Подсказка по-русски', text: lesson.ru_hint.join('\n') }, ex.graph ? 'full' : 'half'),
    block(`${id}_d_example`, 'notice', 'white', 'g_skill', { title: 'Lahendatud näide', lines: [`Ülesanne: ${ex.task}`, ...ex.steps].join('\n') }, ex.graph ? 'half' : 'full'),
    ...(ex.graph ? [graph(`${id}_d_graph`, ex.graph, 'g_skill', 'half')] : []),
    block(`${id}_d_exam`, 'tip', 'white', '', { title: 'Riigieksamil', text: `${lesson.exam}\nKursus: ${lesson.course}.` }),
  ];
  const practice = lesson.practice.map((task, k) => mathtask(`${id}_p_${k + 1}`, task, 'g_skill'));
  const t = lesson.examTask;
  const transfer = [
    mathtask(`${id}_t_exam`, { ...t, instruction: 'Kirjuta kogu lahenduskäik: punkte saab iga õige sammu eest.' }, 'g_exam'),
    ...(t.grid ? [graph(`${id}_t_grid`, { ...t.grid, caption: 'Joonesta siia.' }, 'g_exam', 'half')] : []),
    block(`${id}_t_self`, 'selfcheck', 'sky', '', { title: 'Kontrolli end.', titleMore: 'Kas ma oskan?', instruction: 'Märgi, mida juba oskad.', items: lesson.self.join('\n'), stamp: 'Tubli töö!' }, t.grid ? 'half' : 'full'),
  ];
  return { discover, practice, transfer };
}

function moduleOf(program) {
  return {
    MODULE: { id: `${program.id}-module-01`, course: 'math', title: program.title, level: program.sheetLevel, supplement: true, phases: MATH_PHASES },
    LESSONS: Object.fromEntries(program.lessons.map((lesson, index) => [mathLessonId(program, index), {
      title: lesson.title, canDo: lesson.can, level: program.sheetLevel, goals: MATH_GOALS,
      ...lessonSheets(program, lesson, index),
    }])),
  };
}

export const MATH_PROGRAMS = [KITSAS_12];
export const MATH_MODULES = MATH_PROGRAMS.map(moduleOf);
