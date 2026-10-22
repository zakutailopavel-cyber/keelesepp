// KeeleSepp English B1 (docs/ENGLISH_COURSE_PLAN.md): curriculum records for Õppevara (subject „Inglise keel”, level
// „English B1”). It prepares the basic school English exam (Harno, B1). A module is added here when its sheets are built
// (admin/course/en/b1/moduleNN.js); lesson 5 of each module is a check in the exam's task types. Records go to
// curriculumLessons/{en-b1-NNN}.

export const EN_B1_CURRICULUM_ID = 'en-b1-v1';
export const EN_B1_CURRICULUM_TITLE = 'KeeleSepp English B1';
export const EN_B1_LEVEL = 'English B1';
export const EN_B1_VERSION = '2026-10-23.9';

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
  {
    number: 3, title: 'Experiences', goal: 'Talking about life experiences, recent news, how long things have lasted and achievements.',
    lessons: [
      ['Have you ever…?', 'Present perfect for experiences (ever, never, been / gone), past participles; details in the past simple.'],
      ['Just, already, yet', 'Present perfect with just, already, yet and still; news in the present perfect, details in the past simple.'],
      ['How long have you…?', 'Present perfect with for and since; How long…?; ago with the past simple.'],
      ['Then or up to now?', 'Present perfect or past simple; follow-up questions; achievements and a scholarship application.'],
      ['Module 3 check: Experiences', 'Reading, listening, language use, an e-mail, a short message and speaking in the basic school exam\'s task types.'],
    ],
  },
  {
    number: 4, title: 'Plans and the future', goal: 'Talking about plans, arrangements, timetables, predictions and real possibilities.',
    lessons: [
      ['What are you going to do?', 'going to for plans and predictions from what you see; will for decisions, offers and promises.'],
      ['It\'s in my diary', 'Present continuous for arrangements; present simple for timetables and programmes; asking about plans.'],
      ['What will the future be like?', 'Predictions with will, won\'t, might, may, probably and definitely; I don\'t think… will; a magazine article.'],
      ['If I pass, I\'ll…', 'The first conditional; unless, when and as soon as with the present simple; a formal e-mail with conditions and questions.'],
      ['Module 4 check: Plans and the future', 'Reading, listening, language use, an e-mail, a short message and speaking in the basic school exam\'s task types.'],
    ],
  },
  {
    number: 5, title: 'Free time and culture', goal: 'Talking about hobbies, comparing places and events, reviewing films and books, and making invitations.',
    lessons: [
      ['I love doing it', 'Verbs + -ing (enjoy, don\'t mind, can\'t stand, avoid, give up) and verbs + to (want, decide, hope, plan, would like); -ing after prepositions.'],
      ['The best weekend ever', 'Comparatives and superlatives (regular, irregular, further), (not) as… as, much / a bit + comparative, the more…, the more…'],
      ['You have to see it!', 'so + adjective, such (a) + adjective + noun, so / such… that; absolutely with strong adjectives, quite; writing a review.'],
      ['How about going out?', 'Suggestions (Shall we, Let\'s, Why don\'t we, How about + -ing); formal and informal invitations; accepting and refusing politely.'],
      ['Module 5 check: Free time and culture', 'Reading, listening, language use, an e-mail, a short message and speaking in the basic school exam\'s task types.'],
    ],
  },
  {
    number: 6, title: 'Travel', goal: 'Talking about travel rules and advice, telling a story about travel problems and complaining politely.',
    lessons: [
      ['You have to show your ticket', 'must / have to (necessary), mustn\'t (not allowed), don\'t have to (not necessary); had to and will have to; airport and travel rules.'],
      ['You should pack light', 'Advice with should / shouldn\'t, ought to and If I were you, I\'d…; should vs must; travel tips.'],
      ['Everything went wrong', 'Past ability and success: could / couldn\'t, managed to, was able to; had to; telling a story about travel problems.'],
      ['I\'d like to complain', 'Polite complaints; too + adjective, not + adjective + enough; Could you possibly…?, I would be grateful if…; a formal complaint e-mail.'],
      ['Module 6 check: Travel', 'Reading, listening, language use, an e-mail, a short message and speaking in the basic school exam\'s task types.'],
    ],
  },
  {
    number: 7, title: 'Health and lifestyle', goal: 'Talking about food and habits, imagined changes and wishes, and health problems and advice.',
    lessons: [
      ['How much sugar?', 'Countable and uncountable nouns; much, many, a lot of, a few, a little, few, little, plenty of, too much / too many, (not) enough.'],
      ['If I had more time…', 'The second conditional (If I had…, I would…), If I were…, could / might in the result; first vs second conditional.'],
      ['What would you do?', 'Difficult situations with would, could, might; I wish + past simple; advice with If I were you, You could, It might help.'],
      ['I don\'t feel well', 'Symptoms (I\'ve got…, my… hurts, I feel…), How long have you had…?, should and had better (not), instructions; at the doctor\'s.'],
      ['Module 7 check: Health and lifestyle', 'Reading, listening, language use, an e-mail, a short message and speaking in the basic school exam\'s task types.'],
    ],
  },
  {
    number: 8, title: 'Technology and media', goal: 'Talking about how things are made and invented, online rules and safety, and giving opinions.',
    lessons: [
      ['How is it made?', 'The present simple passive (is / are + past participle), by + agent, irregular participles; what things are used for.'],
      ['It was invented in Estonia', 'The past simple passive (was / were + past participle); passive questions (When was it invented? Who was it made by?); present or past passive.'],
      ['Are you allowed to…?', 'be allowed to, let + object + verb, make + object + verb (present and past); online safety phrases.'],
      ['In my opinion…', 'Giving opinions, agreeing and disagreeing; linking words (however, although, on the one hand / on the other hand, firstly, in conclusion); a for-and-against essay.'],
      ['Module 8 check: Technology and media', 'Reading, listening, language use, an e-mail, a short message and speaking in the basic school exam\'s task types.'],
    ],
  },
  {
    number: 9, title: 'Our world', goal: 'Describing people, places and nature, reporting what others said, and talking about the environment.',
    lessons: [
      ['The girl who changed her school', 'Defining relative clauses with who, which and that; leaving out the relative pronoun; young people who help the environment.'],
      ['A place where nature comes first', 'where and whose; non-defining relative clauses with commas; who\'s vs whose; nature and protected areas.'],
      ['She said that…', 'Reported statements with said and told; tense, pronoun and time-word changes; reporting a talk or an interview.'],
      ['Turn it off!', 'Phrasal verbs about energy and waste (turn off, throw away, cut down on, run out of, give up); reported requests with asked / told someone (not) to.'],
      ['Module 9 check: Our world', 'Reading, listening, language use, an e-mail, a short message and speaking in the basic school exam\'s task types.'],
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
