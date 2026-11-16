// Õppevara records of the mathematics course (math/sheets.js, owner 2026-11-16). The level „12. klass matemaatika
// kitsas” puts them under Õppevara → Matemaatika (library/libraryModel.js subjectOfLevel). The description is the
// teacher's plan in Russian (the owner's working language), the sheets are Estonian.
import { KITSAS_12 } from '../worksheet-generator/admin/course/math/kitsas12.js';

export const MATH_VERSION = '2026-11-16.1';
const pad = (n) => String(n).padStart(3, '0');
const pointsOf = (task) => task.parts.reduce((sum, [, points]) => sum + Number(points || 0), 0);

function examPlan(program, lesson, n) {
  return [
    `Курс: ${program.title} — подготовка к государственному экзамену по математике (kitsas), занятие ${program.minutes} минут.`,
    `Тема ${n} из ${program.lessons.length}: ${lesson.title} (${lesson.ru}). Курс программы: ${lesson.course}.`,
    `Цель: ${lesson.can}`,
    `На экзамене: ${lesson.exam}`,
    'Материалы: лист 1 «Teooria ja näited», лист 2 «Harjutame», лист 3 «Eksamiülesanne»; простой калькулятор (без графиков и памяти), ручка; лист формул kitsas (на нём только тригонометрия и таблица производных).',
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

export function mathCurriculumRecords() {
  return [KITSAS_12].flatMap((program) => program.lessons.map((lesson, index) => {
    const number = index + 1;
    const id = `${program.id}-${pad(number)}`;
    return {
      id,
      type: 'lesson',
      title: lesson.title,
      description: examPlan(program, lesson, number),
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
      roadmapKind: 'theme',
      roadmapTag: 'Teema',
      lessonTypeLabel: 'Teema',
      goal: lesson.can,
      languageFocus: `Kursus ${lesson.course}: ${lesson.exam}`,
      contactMinutes: program.minutes,
      roadmapVersion: MATH_VERSION,
      roadmapManaged: true,
    };
  }));
}
