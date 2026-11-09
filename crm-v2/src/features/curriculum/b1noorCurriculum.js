// „B1 noorkeele õppija” (owner 2026-11-10): the A2 → B1 course rebuilt for teens and the 9th-grade exam track
// (docs/A2B1_COURSE_BLUEPRINT.md §8), course key `b1noor` in admin/course (courseModules.b1noor.js). A separate course
// next to „Eesti keel B1” (est-a2-b1-roadmap-v1): the learners of the current course keep their lessons and sheets.
// Records go to curriculumLessons/{id} (Õppevara: Eesti keel → B1 noorkeele õppija → module). Nothing is assigned to a
// student by these records: a teacher picks a lesson by hand. Creating the records in production is the owner's step
// (a create-only script like the ek9 install, docs/PROJECT_STATE.md 2026-10-21).
// The records are built from the module files themselves (title, canDo, the teacher page's goal), so the library and the
// sheets cannot drift apart.

export const B1NOOR_CURRICULUM_ID = 'est-b1-noor-v1';
export const B1NOOR_CURRICULUM_TITLE = 'KeeleSepp B1 noorkeele õppija (noored ja 9. klass)';
export const B1NOOR_LEVEL = 'B1 noorkeele õppija';
export const B1NOOR_VERSION = '2026-11-10.1';

const pad = (n, size = 3) => String(n).padStart(size, '0');
const numberOf = (lessonId) => Number(String(lessonId).split('-').pop());

// the teacher's lesson description in the CRM (Russian, like the other courses' lesson plans)
function lessonPlan(mod, lesson, check) {
  return [
    'Курс: B1 noorkeele õppija — эстонский A2 → B1 для подростков и выпускного экзамена 9 класса (eesti keel teise keelena).',
    `Модуль ${numberOf(mod.MODULE.id)}: ${mod.MODULE.title}.`,
    `Тема урока: ${lesson.title}.`,
    `Цель: ${lesson.teacherPage?.goal || lesson.canDo}`,
    check
      ? 'Как проходит урок: контроль модуля — часть A (формат экзамена), часть B (финальное задание в новой ситуации), часть C (грамматика и слова); порог 70 % в каждой части.'
      : 'Как проходит урок: 4–6 независимых станций (лист Avasta / Harjuta / Kasuta), ядро на 45 минут и запасная станция — на странице учителя; финальное задание на листе Kasuta.',
  ].join('\n');
}

// modules: the course's module files (courseModules.b1noor.js MODULES)
export function b1noorCurriculumRecords(modules) {
  return modules.flatMap((mod) => Object.entries(mod.LESSONS).map(([id, lesson]) => {
    const number = numberOf(id);
    const moduleNumber = numberOf(mod.MODULE.id);
    const check = Boolean(lesson.assessment);
    return {
      id,
      type: 'lesson',
      title: lesson.title,
      description: lessonPlan(mod, lesson, check),
      descriptionSource: 'lesson-plan-v1',
      subject: 'Eesti keel',
      level: B1NOOR_LEVEL,
      levelStage: mod.MODULE.level,
      topic: `${pad(moduleNumber, 2)}. ${mod.MODULE.title}`,
      order: number,
      curriculumId: B1NOOR_CURRICULUM_ID,
      curriculumTitle: B1NOOR_CURRICULUM_TITLE,
      roadmapLessonId: id,
      roadmapLessonNumber: number,
      roadmapModuleId: mod.MODULE.id,
      roadmapModuleNumber: moduleNumber,
      roadmapModuleTitle: mod.MODULE.title,
      roadmapModuleGoal: lesson.canDo,
      roadmapKind: check ? 'check' : 'theme',
      roadmapTag: check ? 'Kontroll' : 'Teema',
      lessonTypeLabel: check ? 'Kontroll' : 'Teema',
      goal: lesson.canDo,
      contactMinutes: 45,
      roadmapVersion: B1NOOR_VERSION,
      roadmapManaged: true,
    };
  }));
}
