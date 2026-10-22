// KeeleSepp English B1 (docs/ENGLISH_COURSE_PLAN.md): curriculum records for Õppevara (subject „Inglise keel”, level
// „English B1”). It prepares the basic school English exam (Harno, B1). A module is added here when its sheets are built
// (admin/course/en/b1/moduleNN.js); lesson 5 of each module is a check in the exam's task types. Records go to
// curriculumLessons/{en-b1-NNN}.

export const EN_B1_CURRICULUM_ID = 'en-b1-v1';
export const EN_B1_CURRICULUM_TITLE = 'KeeleSepp English B1';
export const EN_B1_LEVEL = 'English B1';
export const EN_B1_VERSION = '2026-10-22.2';

export const EN_B1_MODULES = Object.freeze([
  {
    number: 1, title: 'People around me', goal: 'Talking about yourself, personality, relationships and communicating politely.',
    lessons: [
      ['Getting to know you', 'Present simple vs present continuous (habits and temporary situations); stative verbs; subject and object questions.'],
      ['What are you like?', 'Personality adjectives; adjective + preposition (good at, proud of, afraid of); -ed / -ing adjectives; negative prefixes.'],
      ['Friends and family', 'Relationships; phrasal verbs (get on with, fall out, make up, take after, bring up); always + continuous for annoying habits.'],
      ['Asking politely', 'Indirect questions (Could you tell me where…?, Do you know if…?); polite requests (Would you mind -ing?); a formal e-mail asking for information.'],
      ['Module 1 check: People around me', 'Reading, listening, language use, an e-mail, a short message and speaking in the basic school exam\'s task types.'],
    ],
  },
  {
    number: 2, title: 'Life stories', goal: 'Telling what happened, describing past moments and habits, and writing a story.',
    lessons: [
      ['What happened?', 'Past simple: regular and irregular verbs, spelling and pronunciation of -ed, questions and negatives with did.'],
      ['While it was happening', 'Past continuous for the background; past continuous vs past simple with when and while.'],
      ['How things used to be', 'used to / didn\'t use to / Did you use to…? for past habits and states; used to vs past simple.'],
      ['Telling a story', 'Time linkers (at first, as soon as, meanwhile, eventually, in the end); strong adjectives; a competition story.'],
      ['Module 2 check: Life stories', 'Reading, listening, language use, a story, a short message and speaking in the basic school exam\'s task types.'],
    ],
  },
]);

const pad = (n) => String(n).padStart(3, '0');

// the teacher's lesson description in the CRM (Russian, like the other courses' lesson plans)
function lessonPlan(module, title, focus, check) {
  return [
    'Курс: английский язык, уровень B1 (подготовка к выпускному экзамену основной школы, Harno).',
    `Модуль ${module.number}: ${module.title}.`,
    `Тема урока: ${title}.`,
    `Что учить: ${focus}`,
    check
      ? 'Как проходит урок: контроль в формате экзамена — лист 1 (чтение), лист 2 (аудирование и задания по языку), лист 3 (e-mail 100–120 слов, сообщение 40–60 слов и говорение).'
      : 'Как проходит урок: Avasta (текст и правило) → Harjuta (упражнения, перевод, диктант) → Kasuta (письмо, аудирование и разговор). Тексты для аудирования читает учитель.',
  ].join('\n');
}

export function enB1CurriculumRecords() {
  return EN_B1_MODULES.flatMap((module) => module.lessons.map(([title, focus], index) => {
    const number = (module.number - 1) * 5 + index + 1;
    const check = index === 4;
    return {
      id: `en-b1-${pad(number)}`,
      type: 'lesson',
      title,
      description: lessonPlan(module, title, focus, check),
      descriptionSource: 'lesson-plan-v1',
      subject: 'Inglise keel',
      level: EN_B1_LEVEL,
      levelStage: EN_B1_LEVEL,
      topic: `${String(module.number).padStart(2, '0')}. ${module.title}`,
      order: number,
      curriculumId: EN_B1_CURRICULUM_ID,
      curriculumTitle: EN_B1_CURRICULUM_TITLE,
      roadmapLessonId: `en-b1-${pad(number)}`,
      roadmapLessonNumber: number,
      roadmapModuleId: `en-b1-module-${String(module.number).padStart(2, '0')}`,
      roadmapModuleNumber: module.number,
      roadmapModuleTitle: module.title,
      roadmapModuleGoal: module.goal,
      roadmapKind: check ? 'check' : 'theme',
      roadmapTag: check ? 'Kontroll' : 'Teema',
      lessonTypeLabel: check ? 'Kontroll' : 'Teema',
      goal: focus,
      languageFocus: focus,
      contactMinutes: 60,
      roadmapVersion: EN_B1_VERSION,
      roadmapManaged: true,
    };
  }));
}
