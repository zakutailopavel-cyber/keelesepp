// „B1 eksperimentaalkursus” (owner 2026-11-20): an experimental A2 → B1 course, course key `b1eksp` in admin/course
// (courseModules.b1eksp.js). A chain of neighbouring topics with smooth transitions and one recurring character, Markus.
// Every lesson is ONE record with TWO sheets: the adult version („Täiskasvanu”, stored as phase discover) and the school
// pupil version („Laps”, stored as phase practice); there is no transfer sheet. `phaseLabels` on the record tells
// Õppevara, the lesson room and the assign dialog to show only those two sheets under those names
// (features/library/libraryModel.js lessonCorePhases).
// Records go to curriculumLessons/{id} (Õppevara: Eesti keel → B1 eksperimentaalkursus → module). Nothing is assigned to
// a student by these records: a teacher picks a sheet by hand. Creating the records in production is the owner's step
// (a create-only script like the b1noor / ek9 install, docs/PROJECT_STATE.md).
// The records are built from the module files themselves (title, canDo, the module's phase labels), so the library and
// the sheets cannot drift apart.

export const B1EKSP_CURRICULUM_ID = 'est-b1-eksp-v1';
export const B1EKSP_CURRICULUM_TITLE = 'KeeleSepp B1 eksperimentaalkursus (täiskasvanud ja noored)';
export const B1EKSP_LEVEL = 'B1 eksperimentaalkursus';
export const B1EKSP_VERSION = '2026-11-20.1';
// the course's two sheets per lesson (the module files carry the same, MODULE.phaseLabels)
export const B1EKSP_PHASE_LABELS = Object.freeze({ discover: 'Täiskasvanu', practice: 'Laps' });

const pad = (n, size = 3) => String(n).padStart(size, '0');
const numberOf = (lessonId) => Number(String(lessonId).split('-').pop());

// the teacher's lesson description in the CRM (Russian, like the other courses' lesson plans)
function lessonPlan(mod, lesson) {
  return [
    'Курс: B1 eksperimentaalkursus — экспериментальный курс A2 → B1: цепочка тем с плавными переходами (смежные темы), сквозной персонаж Маркус; у каждого урока два листа — для взрослых и для школьников.',
    `Модуль ${numberOf(mod.MODULE.id)}: ${mod.MODULE.title}.`,
    `Тема урока: ${lesson.title}.`,
    `Цель: ${lesson.canDo}`,
    'Как проходит урок: учитель выбирает один лист — «Täiskasvanu» (взрослый) или «Laps» (школьник). На листе шесть шагов: картинка и текст, вопросы, слова к номерам на картинке, правило с пропусками, «Ja sina? Räägi» (рассказ о себе, 2 минуты), «Kirjuta endast» (4–5 предложений).',
  ].join('\n');
}

// modules: the course's module files (courseModules.b1eksp.js MODULES)
export function b1ekspCurriculumRecords(modules) {
  return modules.flatMap((mod) => Object.entries(mod.LESSONS).map(([id, lesson]) => {
    const number = numberOf(id);
    const moduleNumber = numberOf(mod.MODULE.id);
    return {
      id,
      type: 'lesson',
      title: lesson.title,
      description: lessonPlan(mod, lesson),
      descriptionSource: 'lesson-plan-v1',
      subject: 'Eesti keel',
      level: B1EKSP_LEVEL,
      levelStage: mod.MODULE.level,
      topic: `${pad(moduleNumber, 2)}. ${mod.MODULE.title}`,
      order: number,
      curriculumId: B1EKSP_CURRICULUM_ID,
      curriculumTitle: B1EKSP_CURRICULUM_TITLE,
      roadmapLessonId: id,
      roadmapLessonNumber: number,
      roadmapModuleId: mod.MODULE.id,
      roadmapModuleNumber: moduleNumber,
      roadmapModuleTitle: mod.MODULE.title,
      roadmapModuleGoal: lesson.canDo,
      roadmapKind: 'theme',
      roadmapTag: 'Teema',
      lessonTypeLabel: 'Teema',
      goal: lesson.canDo,
      contactMinutes: 45,
      roadmapVersion: B1EKSP_VERSION,
      roadmapManaged: true,
      // one lesson, two sheets: adult in discover, school pupil in practice
      phaseLabels: { ...(mod.MODULE.phaseLabels || B1EKSP_PHASE_LABELS) },
    };
  }));
}
