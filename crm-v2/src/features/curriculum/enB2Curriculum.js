// KeeleSepp English B2 (docs/COURSE_FINAL_SHAPE_EN_B2.md): curriculum records for Õppevara (subject „Inglise keel”, level
// „English B2”, levelStage per module: English B1+ / B2- / B2). The step English B1 → B2: the Harno English state exam
// (B2 = 75–100 %), with IELTS, TOEFL iBT and Cambridge B2 First as further targets (owner 2026-11-03). 50 lessons in 10
// modules of 5 (owner 2026-11-03); lesson 5 of each module is a check in the exam's task types (005 a diagnostic, 030 and
// 050 full mocks). A module's lessons are added here when its sheets are built (admin/course/en/b2/moduleNN.js), so the
// records always match the built lessons. Code only: writing the records to curriculumLessons/{en-b2-NNN} in Firestore is
// a production write and needs the owner's yes.

export const EN_B2_CURRICULUM_ID = 'en-b2-v1';
export const EN_B2_CURRICULUM_TITLE = 'KeeleSepp English B2';
export const EN_B2_LEVEL = 'English B2';
export const EN_B2_VERSION = '2026-11-03.1';
export const EN_B2_LESSONS = 50;

// the module plan (§5): title, stage, the module's goal; `lessons`: [title, focus] as each module is written
export const EN_B2_MODULES = Object.freeze([
  { number: 1, title: 'Who we are', stage: 'English B1+', goal: 'Identity, generations and how young people in Estonia live; the tense system, narrative tenses and question tags.', lessons: [] },
  { number: 2, title: 'Learning and work', stage: 'English B1+', goal: 'School systems, studying abroad, careers, a CV and an interview; future forms, gerund vs infinitive.', lessons: [] },
  { number: 3, title: 'Living with nature', stage: 'English B1+', goal: 'Climate, Estonian nature and sustainable consumption; all conditionals, mixed conditionals, wish and if only.', lessons: [] },
  { number: 4, title: 'Science around us', stage: 'English B2-', goal: 'Discoveries, medicine, Estonian science and technology; the passive in all tenses, have something done.', lessons: [] },
  { number: 5, title: 'Media and truth', stage: 'English B2-', goal: 'News, social media, fact and persuasion, AI and data; reported speech and reporting verbs.', lessons: [] },
  { number: 6, title: 'Estonia in the world', stage: 'English B2-', goal: 'The e-state, the EU, migration and Estonia\'s image; relative and participle clauses, articles; full mock 1.', lessons: [] },
  { number: 7, title: 'Culture and creativity', stage: 'English B2', goal: 'Books, film, music and art, comparing works; modal perfects, adjective order and intensifiers.', lessons: [] },
  { number: 8, title: 'Society and responsibility', stage: 'English B2', goal: 'Rights and duties, volunteering, health and the city; emphasis (cleft sentences, inversion) and linking.', lessons: [] },
  { number: 9, title: 'Travel and global English', stage: 'English B2', goal: 'Tourism, cultural differences, English as a world language; quantifiers, future in the past, used to / be used to.', lessons: [] },
  { number: 10, title: 'Exam module', stage: 'English B2', goal: 'The state exam, IELTS, TOEFL iBT and B2 First: how they are marked, timing, strategies; full mock 2.', lessons: [] },
]);

const pad = (n) => String(n).padStart(3, '0');

// the teacher's lesson description in the CRM (Russian, like the other courses' lesson plans)
function lessonPlan(module, title, focus, check) {
  return [
    'Курс: английский язык, уровень B2 (подготовка к государственному экзамену по английскому, Harno; также IELTS, TOEFL iBT, Cambridge B2 First).',
    `Модуль ${module.number}: ${module.title}.`,
    `Тема урока: ${title}.`,
    `Что учить: ${focus}`,
    check
      ? 'Как проходит урок: контроль в формате экзамена — письмо, аудирование, чтение и говорение, с временем и баллами экзамена.'
      : 'Как проходит урок: Avasta (текст и язык) → Harjuta (задания в формате экзамена) → Kasuta (новая ситуация). Тексты для аудирования читает учитель.',
  ].join('\n');
}

export function enB2CurriculumRecords(modules = EN_B2_MODULES) {
  return modules.flatMap((module) => module.lessons.map(([title, focus], index) => {
    const number = (module.number - 1) * 5 + index + 1;
    const check = index === 4;
    const moduleId = `en-b2-module-${String(module.number).padStart(2, '0')}`;
    return {
      id: `en-b2-${pad(number)}`,
      type: 'lesson',
      title,
      description: lessonPlan(module, title, focus, check),
      descriptionSource: 'lesson-plan-v1',
      subject: 'Inglise keel',
      level: EN_B2_LEVEL,
      levelStage: module.stage,
      topic: `${String(module.number).padStart(2, '0')}. ${module.title}`,
      order: number,
      curriculumId: EN_B2_CURRICULUM_ID,
      curriculumTitle: EN_B2_CURRICULUM_TITLE,
      roadmapLessonId: `en-b2-${pad(number)}`,
      roadmapLessonNumber: number,
      roadmapModuleId: moduleId,
      roadmapModuleNumber: module.number,
      roadmapModuleTitle: module.title,
      roadmapModuleGoal: module.goal,
      roadmapKind: check ? 'check' : 'theme',
      roadmapTag: check ? 'Kontroll' : 'Teema',
      lessonTypeLabel: check ? 'Kontroll' : 'Teema',
      goal: focus,
      languageFocus: focus,
      contactMinutes: 60,
      roadmapVersion: EN_B2_VERSION,
      roadmapManaged: true,
    };
  }));
}
