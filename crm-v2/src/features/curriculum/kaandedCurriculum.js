// Mini-course „Käänded lauses” (owner 2026-11-28, course key `kaanded`, worksheet-generator/admin/course/kaanded/module01.js):
// six lessons on the noun cases in the sentence for Russian-speaking A2–B1 learners. Records go to curriculumLessons/{id}
// (Õppevara: Eesti keel → level „Käänded lauses” → the one module); each lesson has the three sheets Avasta / Harjuta /
// Kasuta, published from „Kursuse tootmine”. Nothing is assigned by these records: a teacher assigns a sheet by hand, and
// a learner with work in the course then sees it in „Minu kursus” (self-study/selfStudyModel.js courseChoice: a course he
// has touched). Creating the records in production is the owner's step: a create-only script (never overwrites), like
// the b1eksp / b1noor install — docs/MINICOURSE_KAANDED.md. The records are built from the module file itself.

export const KAANDED_CURRICULUM_ID = 'est-kaanded-mini-v1';
export const KAANDED_CURRICULUM_TITLE = 'KeeleSepp minikursus: Käänded lauses (A2–B1)';
export const KAANDED_LEVEL = 'Käänded lauses';
export const KAANDED_VERSION = '2026-11-28.1';
export const KAANDED_MINUTES = 60;

const pad = (n, size = 2) => String(n).padStart(size, '0');
const numberOf = (id) => Number(String(id).split('-').pop());

// the teacher's plan in the CRM (Russian, like the other courses)
function lessonPlan(lesson, number) {
  return [
    'Курс: мини-курс «Käänded lauses» — падежи в предложении для русскоязычных учеников A2–B1 (подростки и взрослые), 6 уроков по 60 минут.',
    `Урок ${number} из 6: ${lesson.title}.`,
    `Цель: ${lesson.canDo}`,
    '',
    'Ход урока (60 мин):',
    `1. Avasta (20 мин): ${number > 1 ? '«Mäletad?» — 2 вопроса прошлых уроков; ' : ''}схема-картинка, рамка «Märka!» (правило + строка по-русски), таблица форм, короткий текст и задание «найди формы».`,
    '2. Harjuta (20 мин): текст с пропусками (дана начальная форма), выбор формы, трансформация или исправление ошибок; «Abi ja lisaväljakutse» — подсказка слабому и задание сильному.',
    `3. Kasuta (20 мин): задание в паре (учитель — партнёр в индивидуальном уроке), «Kirjuta oma laused», выход: 30 секунд речи или 2 своих предложения + 2 формы, самооценка 0–1–2.${number === 6 ? ' В уроке 6 — контроль по всем урокам: 4 части, 30 баллов.' : ''}`,
    '',
    'Дома: задание «Kodutöö» на листе Kasuta.',
  ].join('\n');
}

// modules: courseModules.kaanded.js MODULES
export function kaandedCurriculumRecords(modules) {
  return modules.flatMap((mod) => Object.entries(mod.LESSONS).map(([id, lesson]) => {
    const number = numberOf(id);
    const check = number === 6;
    return {
      id,
      type: 'lesson',
      title: lesson.title,
      description: lessonPlan(lesson, number),
      descriptionSource: 'lesson-plan-v1',
      subject: 'Eesti keel',
      level: KAANDED_LEVEL,
      levelStage: lesson.level || mod.MODULE.level,
      topic: `${pad(number)}. ${lesson.title}`,
      order: number,
      curriculumId: KAANDED_CURRICULUM_ID,
      curriculumTitle: KAANDED_CURRICULUM_TITLE,
      roadmapLessonId: id,
      roadmapLessonNumber: number,
      roadmapModuleId: mod.MODULE.id,
      roadmapModuleNumber: 1,
      roadmapModuleTitle: mod.MODULE.title,
      roadmapModuleGoal: 'Õpilane saab aru, kuidas käänded lauses töötavad, ja kasutab neid kõnes ja kirjas.',
      roadmapKind: check ? 'check' : 'theme',
      roadmapTag: check ? 'Kontroll' : 'Teema',
      lessonTypeLabel: check ? 'Kordamine ja kontroll' : 'Teema',
      languageFocus: lesson.canDo,
      goal: lesson.canDo,
      contactMinutes: KAANDED_MINUTES,
      roadmapVersion: KAANDED_VERSION,
      roadmapManaged: true,
    };
  }));
}
