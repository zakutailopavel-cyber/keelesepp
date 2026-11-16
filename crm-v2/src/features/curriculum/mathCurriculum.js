// Õppevara records of the mathematics course (math/sheets.js, owner 2026-11-16): one record per lesson of every program
// in MATH_PROGRAMS (mk12 kitsas exam prep, mk10 grade 10, ml12 lai exam prep: program.track and formulaSheetRu). A level with „matemaatika” („12. klass matemaatika kitsas”,
// „10. klass matemaatika kitsas”) puts them under Õppevara → Matemaatika (library/libraryModel.js subjectOfLevel).
// The description is the teacher's plan in Russian (the owner's working language), the sheets are Estonian.
import { MATH_PROGRAMS } from '../worksheet-generator/admin/course/math/sheets.js';

export const MATH_VERSION = '2026-11-16.2';
const pad = (n) => String(n).padStart(3, '0');
const pointsOf = (task) => task.parts.reduce((sum, [, points]) => sum + Number(points || 0), 0);

function examPlan(program, lesson, n) {
  return [
    `Курс: ${program.title} — подготовка к государственному экзамену по математике (${program.track || 'kitsas'}), занятие ${program.minutes} минут.`,
    `Тема ${n} из ${program.lessons.length}: ${lesson.title} (${lesson.ru}). Курс программы: ${lesson.course}.`,
    `Цель: ${lesson.can}`,
    `На экзамене: ${lesson.exam}`,
    `Материалы: лист 1 «Teooria ja näited», лист 2 «Harjutame», лист 3 «Eksamiülesanne»; простой калькулятор (без графиков и памяти), ручка; ${program.formulaSheetRu || 'лист формул kitsas (на нём только тригонометрия и таблица производных)'}.`,
    '',
    `Ход занятия (${program.minutes} мин):`,
    '1. Разминка (10 мин): 2–3 устных вопроса по прошлой теме; проверка домашнего задания.',
    '2. Теория (15 мин): лист 1 — формулы. Отметить, каких формул НЕТ на листе формул и что надо выучить. Русская подсказка — для понимания, термины говорим по-эстонски.',
    '3. Разобранный пример (10 мин): ученик объясняет каждый шаг своими словами.',
    `4. Практика (30 мин): лист 2, ${lesson.practice.length} задания — ученик решает, учитель смотрит решение по шагам, а не только ответ.`,
    `5. Экзаменационная задача (20 мин): лист 3, ${pointsOf(lesson.examTask)} баллов — с таймером, с полной записью решения; проверяем по ключу: балл за каждый правильный шаг.`,
    '6. Итог (5 мин): «Kontrolli end»; что было трудно — повторить на следующем занятии.',
    '',
    'Домой: задания листа 2, которые не успели, и повторить формулы темы.',
  ].join('\n');
}

// a mock exam (kitsas12mocks.js, lai12mocks.js: program.track, formulaSheetRu): the whole paper in exam conditions, then the analysis
const MOCK_PART1_MINUTES = 120;
const MOCK_PART2_MINUTES = 150;
const MOCK_BREAK_MINUTES = 45;
function mockPlan(program, mock, n, k) {
  const tasks = [...mock.part1, ...mock.part2];
  const p1 = mock.part1.reduce((sum, task) => sum + pointsOf(task), 0);
  const p2 = mock.part2.reduce((sum, task) => sum + pointsOf(task), 0);
  return [
    `Курс: ${program.title} — пробный экзамен ${k} из ${program.mocks.length} (занятие ${n}), полный формат госэкзамена ${program.track || 'kitsas'} 2027.`,
    `Цель: ${mock.can}`,
    `Формат: I osa — ${MOCK_PART1_MINUTES} мин, задачи 1–${mock.part1.length} (${p1} баллов: 4 × 5 + 3 × 10); перерыв ${MOCK_BREAK_MINUTES} мин; II osa — ${MOCK_PART2_MINUTES} мин, задачи ${mock.part1.length + 1}–${tasks.length} (${p2} баллов: 5 × 10). Всего ${p1 + p2} баллов.`,
    `Темы: ${tasks.map((task, i) => `${i + 1}) ${task.topic} — ${pointsOf(task)} б.`).join('; ')}.`,
    `Материалы: лист 1 «I osa», лист 2 «II osa», лист 3 «Eneseanalüüs»; простой калькулятор (без графиков и памяти), ручка, ${program.formulaSheetRu || 'лист формул kitsas (только тригонометрия и таблица производных)'}. Телефоны сданы.`,
    '',
    'Ход:',
    `1. Перед стартом (5 мин): правила как на экзамене — пишем полный ход решения, ответы с единицами, округляем в конце; учитель засекает ${MOCK_PART1_MINUTES} мин.`,
    `2. I osa (${MOCK_PART1_MINUTES} мин) — без подсказок. Если занятие короче, I osa — на одном занятии (или дома с таймером), II osa (${MOCK_PART2_MINUTES} мин) — на следующем; не делить одну часть на куски.`,
    `3. II osa (${MOCK_PART2_MINUTES} мин) — после перерыва ${MOCK_BREAK_MINUTES} мин или на отдельном занятии, тоже без подсказок.`,
    '4. Проверка по шагам: в ключе у каждой части есть баллы и решение; балл ставится за каждый верный шаг, ответ без решения — как правило, лишь часть баллов; верный ход с вычислительной ошибкой — баллы за верные шаги. Чертежи и объяснения (часть без ответа в ключе) оценивает учитель.',
    `5. Разбор (следующее занятие, 45–90 мин): лист 3 — ученик вносит баллы по задачам, отмечает 2 самые слабые темы; повторяем их по урокам ${program.id}-001…${pad(program.lessons.length)}.`,
    '',
    'Оценки на листе 3 — только ориентир (школьная шкала); на самом госэкзамене результат — баллы 0–100, сдан при ≥ 1 балле.',
  ].join('\n');
}

// a school-course lesson (program.plan 'course', kitsas10.js): built step by step; a „Kordamine ja kontrolltöö” lesson
// ends with a 45-minute test
const isTest = (lesson) => /^Kordamine ja kontrolltöö/.test(lesson.title);
function coursePlan(program, lesson, n) {
  const test = isTest(lesson);
  return [
    `Курс: ${program.title} — гимназия, узкая математика (kitsas), занятие ${program.minutes} минут.`,
    `Тема ${n} из ${program.lessons.length}: ${lesson.title} (${lesson.ru}). Курс программы GRÕK: ${lesson.course}.`,
    `Цель: ${lesson.can}`,
    `Связь с экзаменом: ${lesson.exam}`,
    'Материалы: лист 1 «Teooria ja näited», лист 2 «Harjutame», лист 3 «Kontrollülesanne»; простой калькулятор (без графиков и памяти), ручка, тетрадь в клетку.',
    '',
    `Ход занятия (${program.minutes} мин):`,
    ...(test ? [
      '1. Повторение (20 мин): лист 1 — формулы курса; ученик говорит, где какую формулу применять.',
      `2. Разминка (20 мин): лист 2, ${lesson.practice.length} задания — короткие задачи на все темы курса; разбираем ошибки.`,
      `3. Контрольная работа (45 мин): лист 3, ${pointsOf(lesson.examTask)} баллов — без помощи учителя, с полной записью решения; проверяем по ключу: балл за каждый правильный шаг.`,
      '4. Итог (5 мин): «Kontrolli end»; что не получилось — в план следующих занятий.',
    ] : [
      '1. Разминка (10 мин): 2–3 устных вопроса по прошлой теме; проверка домашнего задания.',
      '2. Теория (20 мин): лист 1 — формулы и правила, учитель объясняет на доске. Русская подсказка — для понимания, термины говорим по-эстонски.',
      '3. Разобранный пример (10 мин): ученик объясняет каждый шаг своими словами.',
      `4. Практика (30 мин): лист 2, ${lesson.practice.length} задания от простого к сложному — ученик решает, учитель смотрит решение по шагам, а не только ответ.`,
      `5. Большая задача (15 мин): лист 3, ${pointsOf(lesson.examTask)} баллов — с полной записью решения; проверяем по ключу.`,
      '6. Итог (5 мин): «Kontrolli end»; что было трудно — повторить на следующем занятии.',
    ]),
    '',
    test ? 'Домой: исправить ошибки контрольной работы.' : 'Домой: задания листа 2, которые не успели, и выучить формулы темы.',
  ].join('\n');
}

export function mathCurriculumRecords() {
  return MATH_PROGRAMS.flatMap((program) => [
    ...program.lessons.map((lesson, index) => ({ lesson, index, mock: false })),
    ...(program.mocks || []).map((lesson, k) => ({ lesson, index: program.lessons.length + k, mock: true, k: k + 1 })),
  ].map(({ lesson, index, mock, k }) => {
    const number = index + 1;
    const id = `${program.id}-${pad(number)}`;
    const kind = mock
      ? { roadmapKind: 'check', roadmapTag: 'Proovieksam', lessonTypeLabel: 'Proovieksam', languageFocus: 'Proovieksam: I osa 120 min (4 × 5 p + 3 × 10 p), II osa 150 min (5 × 10 p), kokku 100 p.', contactMinutes: MOCK_PART1_MINUTES + MOCK_PART2_MINUTES }
      : isTest(lesson)
        ? { roadmapKind: 'check', roadmapTag: 'Kontrolltöö', lessonTypeLabel: 'Kontrolltöö', languageFocus: `Kursus ${lesson.course}: ${lesson.exam}`, contactMinutes: program.minutes }
        : { roadmapKind: 'theme', roadmapTag: 'Teema', lessonTypeLabel: 'Teema', languageFocus: `Kursus ${lesson.course}: ${lesson.exam}`, contactMinutes: program.minutes };
    return {
      id,
      type: 'lesson',
      title: lesson.title,
      description: mock ? mockPlan(program, lesson, number, k) : program.plan === 'course' ? coursePlan(program, lesson, number) : examPlan(program, lesson, number),
      descriptionSource: 'lesson-plan-v1',
      subject: 'Matemaatika',
      level: program.level,
      levelStage: program.level,
      topic: `${String(number).padStart(2, '0')}. ${lesson.title}`,
      order: number,
      curriculumId: `math-${program.id}-v1`,
      curriculumTitle: `KeeleSepp: ${program.title}`,
      roadmapLessonId: id,
      roadmapLessonNumber: number,
      roadmapModuleId: `${program.id}-module-01`,
      roadmapModuleNumber: 1,
      roadmapModuleTitle: program.title,
      roadmapModuleGoal: program.goal,
      goal: lesson.can,
      ...kind,
      roadmapVersion: MATH_VERSION,
      roadmapManaged: true,
    };
  }));
}
