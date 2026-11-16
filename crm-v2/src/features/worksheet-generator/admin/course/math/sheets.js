// The mathematics course as course modules (owner 2026-11-16): every lesson of math/kitsas12.js (and kitsas10.js)
// becomes three sheets
//   discover „1 Teooria ja näited” — formulas to know, a short Russian hint, a worked example (with a graph);
//   practice „2 Harjutame” — scored tasks (block „Matemaatika ülesanne”): a final answer per part, the worked solution
//     in the key;
//   transfer „3 Eksamiülesanne” — one task in the exam's own form and points, squared paper, „Kontrolli end”.
// After the topic lessons come the mock exams (program.mocks, kitsas12mocks.js) with their own phase labels:
//   discover „1 I osa (120 min)” — tasks 1–7 (4 × 5 p + 3 × 10 p); practice „2 II osa (150 min)” — tasks 8–12 (5 × 10 p);
//   transfer „3 Eneseanalüüs” — points per task, the grade bands (an orientation only) and „Kontrolli end”.
// Not in COURSE_MODULES (like kids/sheets.js): the Estonian-language gates do not judge a maths sheet. The sheet lab
// opens it with set=course:mk12-001:practice.
import { KITSAS_12 } from './kitsas12.js';
import { KITSAS_10 } from './kitsas10.js';

const pad = (n) => String(n).padStart(3, '0');
const block = (id, type, tone, goal, data, width = 'full') => ({ id, type, width, span: width === 'full' ? 12 : 6, tone, goal, data });
export const mathLessonId = (program, index) => `${program.id}-${pad(index + 1)}`;

export const MATH_PHASES = {
  discover: { label: '1 Teooria ja näited', slot: 1, subtitle: 'Valemid, mida pead teadma, ja lahendatud näide.' },
  practice: { label: '2 Harjutame', slot: 2, subtitle: 'Lahenda ja kirjuta vastus. Lahenduskäik kirjuta ruudulisele alale.' },
  transfer: { label: '3 Eksamiülesanne', slot: 3, subtitle: 'Ülesanne nagu riigieksamil: kirjuta kogu lahenduskäik.' },
};

// a mock exam's own labels (buildCourseSheet reads lesson.phases before MODULE.phases)
export const MOCK_PHASES = {
  discover: { label: '1 I osa (120 min)', slot: 1, subtitle: 'Proovieksami I osa: ülesanded 1–7, kokku 50 punkti. Aega 120 minutit.' },
  practice: { label: '2 II osa (150 min)', slot: 2, subtitle: 'Proovieksami II osa: ülesanded 8–12, kokku 50 punkti. Aega 150 minutit.' },
  transfer: { label: '3 Eneseanalüüs', slot: 3, subtitle: 'Kanna punktid tabelisse, leia oma tugevad ja nõrgad teemad.' },
};

export const MATH_GOALS = {
  g_theory: 'Õpilane teab teema valemeid ja reegleid.',
  g_skill: 'Õpilane lahendab teema põhiülesandeid.',
  g_exam: 'Õpilane lahendab eksamiülesande samm-sammult.',
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

export const mockPoints = (task) => task.parts.reduce((sum, [, p]) => sum + Number(p || 0), 0);
const EXAM_RULES = [
  'Kirjuta iga ülesande juurde kogu lahenduskäik: punkte antakse iga õige sammu eest, ainult vastuse eest vähe.',
  'Lubatud on lihtne kalkulaator (mitte graafiline ega programmeeritav), pastakas ja kitsa kursuse valemileht (trigonomeetria ja tuletised).',
  'Ümarda alles lõpus ja kirjuta vastusele ühik.',
].join('\n');
// the grade bands are a school orientation only: the riigieksam itself gives 0–100 points (pass ≥ 1 p)
const GRADE_BANDS = [
  'Riigieksami tulemus on punktid 0–100; eksam on sooritatud, kui saad vähemalt 1 punkti. Hindeid riigieksamil ei panda.',
  'Allpool on ainult orienteeruv koolihinde skaala, et näha oma taset — see ei ole Harno ametlik skaala.',
  '90–100 p: „5”',
  '75–89 p: „4”',
  '50–74 p: „3”',
  '20–49 p: „2”',
  '0–19 p: „1”',
].join('\n');

function mockSheets(program, mock, index) {
  const id = mathLessonId(program, index);
  const tasks = [...mock.part1, ...mock.part2];
  const examTask = (task, n, phase) => {
    const points = mockPoints(task);
    return [
      mathtask(`${id}_${phase}_${n}`, { ...task, title: `${n}. ülesanne (${points} punkti)`, instruction: 'Kirjuta kogu lahenduskäik.' }, 'g_exam'),
      ...(task.grid ? [graph(`${id}_${phase}_${n}_grid`, { ...task.grid, caption: `${n}. ülesanne: joonesta siia.` }, 'g_exam', 'half')] : []),
    ];
  };
  const discover = [
    block(`${id}_d_rules`, 'tip', 'white', '', { title: 'Eksami juhend', text: `I osa: 120 minutit, ülesanded 1–7 (4 × 5 p ja 3 × 10 p). Seejärel 45-minutiline vaheaeg.\n${EXAM_RULES}` }),
    ...mock.part1.flatMap((task, k) => examTask(task, k + 1, 'd')),
  ];
  const practice = [
    block(`${id}_p_rules`, 'tip', 'white', '', { title: 'Eksami juhend', text: `II osa: 150 minutit, ülesanded 8–12 (igaüks 10 p).\n${EXAM_RULES}` }),
    ...mock.part2.flatMap((task, k) => examTask(task, mock.part1.length + k + 1, 'p')),
  ];
  const transfer = [
    block(`${id}_t_points`, 'notice', 'white', 'g_exam', {
      title: 'Minu punktid',
      lines: [...tasks.map((task, k) => `${k + 1}. ${task.topic}: ___ / ${mockPoints(task)} p`), 'Kokku: ___ / 100 p'].join('\n'),
    }),
    block(`${id}_t_grades`, 'notice', 'white', '', { title: 'Hindamine', lines: GRADE_BANDS }, 'half'),
    block(`${id}_t_self`, 'selfcheck', 'sky', '', { title: 'Kontrolli end.', titleMore: 'Mida kordan?', instruction: 'Märgi, mis õnnestus. Kirjuta, millised kaks teemat kordad enne järgmist proovieksamit.', items: mock.self.join('\n'), stamp: 'Tubli töö!' }, 'half'),
  ];
  return { discover, practice, transfer };
}

function moduleOf(program) {
  const mocks = program.mocks || [];
  return {
    MODULE: { id: `${program.id}-module-01`, course: 'math', title: program.title, level: program.sheetLevel, supplement: true, phases: { ...MATH_PHASES, ...program.phases } },
    LESSONS: Object.fromEntries([
      ...program.lessons.map((lesson, index) => [mathLessonId(program, index), {
        title: lesson.title, canDo: lesson.can, level: program.sheetLevel, goals: MATH_GOALS,
        ...lessonSheets(program, lesson, index),
      }]),
      ...mocks.map((mock, k) => {
        const index = program.lessons.length + k;
        return [mathLessonId(program, index), {
          title: mock.title, canDo: mock.can, level: program.sheetLevel, goals: MATH_GOALS, phases: MOCK_PHASES, mock: true,
          ...mockSheets(program, mock, index),
        }];
      }),
    ]),
  };
}

// every math program; mathCurriculum.js makes the library records of each (kitsas10.js: grade 10, kitsas12.js: exam prep)
export const MATH_PROGRAMS = [KITSAS_12, KITSAS_10];
export const MATH_MODULES = MATH_PROGRAMS.map(moduleOf);
