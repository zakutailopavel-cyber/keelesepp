// KeeleSepp English A2 (docs/ENGLISH_COURSE_PLAN.md): curriculum records for Õppevara (subject „Inglise keel”, level
// „English A2”). A module is added here when its sheets are built (admin/course/en/a2/moduleNN.js); lesson 5 of each
// module is a check in the exam's task types. Records go to curriculumLessons/{en-a2-NNN}.

export const EN_A2_CURRICULUM_ID = 'en-a2-v1';
export const EN_A2_CURRICULUM_TITLE = 'KeeleSepp English A2';
export const EN_A2_LEVEL = 'English A2';
export const EN_A2_VERSION = '2026-10-23.10';

export const EN_A2_MODULES = Object.freeze([
  {
    number: 1, title: 'Me and my world', goal: 'Talking about yourself, your day and the people around you: present simple and present continuous.',
    lessons: [
      ['Meet the class', 'Introducing yourself and others; be (am / is / are); present simple with he / she / it; questions and negatives with do / does.'],
      ['My day', 'Daily routine, telling the time, adverbs of frequency (always … never), at / on / in with time, How often…?'],
      ['Right now', 'Present continuous for now; present simple vs present continuous; -ing spelling; verbs not used with -ing.'],
      ['People I know', 'Looks and character, has got, adjective order, What is he like? / What does he look like?'],
      ['Module 1 check: Me and my world', 'Reading, listening, language tasks, an e-mail and speaking in the exam\'s task types.'],
    ],
  },
  {
    number: 2, title: 'Home and my town', goal: 'Describing your home and town, finding the way and comparing places.',
    lessons: [
      ['My home', 'Rooms and furniture; there is / there are; a / some / any; questions Is there…? Are there any…?'],
      ['Where is it?', 'Prepositions of place (in, on, under, behind, in front of, next to, between, opposite, above); It is / They are.'],
      ['Around town', 'Places in town; asking the way politely; directions with the imperative; first / second / third.'],
      ['Town or country?', 'Comparatives (-er, more, better, worse) with than; spelling; giving an opinion with reasons.'],
      ['Module 2 check: Home and my town', 'Reading, listening, language tasks, an e-mail, a notice and speaking in the exam\'s task types.'],
    ],
  },
  {
    number: 3, title: 'School and learning', goal: 'Talking about school subjects, timetables and rules, and telling about the past at school.',
    lessons: [
      ['My timetable', 'School subjects and timetables; can / can\'t for ability; at / on / in with times and days; telling the time.'],
      ['School rules', 'have to / has to, don\'t have to, can / can\'t for permission; questions and short answers.'],
      ['Last week at school', 'The past simple of regular verbs (-ed spelling and pronunciation); was / were.'],
      ['Did you finish the project?', 'Past simple questions and negatives with did / didn\'t; question words; interviews and a project report.'],
      ['Module 3 check: School and learning', 'Reading, listening, language tasks, an e-mail, a notice and speaking in the exam\'s task types (A2).'],
    ],
  },
  {
    number: 4, title: 'Free time', goal: 'Talking about hobbies and sports and telling stories about the weekend in the past.',
    lessons: [
      ['I love dancing', 'Hobbies; like / love / enjoy / hate / don\'t mind + -ing; spelling of -ing; questions and short answers.'],
      ['What did you do?', 'The past simple of common irregular verbs (went, saw, had, ate, got, took, bought, met); questions and negatives.'],
      ['Sports stars', 'play / go / do + sports; won, lost, taught, broke; the story of an athlete; talking about a match.'],
      ['A weekend to remember', 'Telling a story in order: first, then, after that, suddenly, in the end; feelings; so and but.'],
      ['Module 4 check: Free time', 'Reading, listening, language tasks, an e-mail, a notice and speaking in the exam\'s task types (A2).'],
    ],
  },
  {
    number: 5, title: 'Food and health', goal: 'Talking about food, shopping and cafés, amounts and prices, and giving simple health advice.',
    lessons: [
      ['What\'s in the fridge?', 'Countable and uncountable nouns; a / an, some / any; containers (a bottle of, a loaf of).'],
      ['How much? How many?', 'How much / how many, much / many / a lot of; prices; a school café menu.'],
      ['At the café', 'Ordering politely: I\'d like, Can I have, Would you like; like vs would like; starters, main courses and desserts.'],
      ['You should drink more water', 'Health problems (headache, sore throat, a cold); advice with should / shouldn\'t; at the doctor\'s.'],
      ['Module 5 check: Food and health', 'Reading, listening, language tasks, an e-mail, a notice and speaking in the exam\'s task types (A2).'],
    ],
  },
  {
    number: 6, title: 'Travel and holidays', goal: 'Talking about holiday plans, transport and tickets, booking a room and writing postcards.',
    lessons: [
      ['Holiday plans', 'going to for plans: positive, negative, questions and short answers; time words for the future; what to pack.'],
      ['A ticket to Riga, please', 'Timetables with the present simple; by bus / train / plane, on foot; single and return tickets; buying a ticket.'],
      ['Booking a room', 'Hotels and hostels; Is there…? / Can I…?; I\'ll for decisions and offers; booking by phone and by e-mail.'],
      ['Greetings from Saaremaa', 'Postcards and holiday e-mails: present continuous for now, past simple for yesterday, going to for tomorrow.'],
      ['Module 6 check: Travel and holidays', 'Reading, listening, language tasks, an e-mail, a postcard and speaking in the exam\'s task types (A2).'],
    ],
  },
  {
    number: 7, title: 'People and places', goal: 'Superlatives, countries and nationalities, describing places and people, festivals and dates.',
    lessons: [
      ['The tallest, the oldest, the best', 'superlatives'],
      ['Where are you from?', 'countries, nationalities, languages'],
      ['What is it like?', 'describing places and people'],
      ['Festivals and traditions', 'in / on / at, dates'],
      ['Module 7 check: People and places', 'check'],
    ],
  },
  {
    number: 8, title: 'Shopping and money', goal: 'Prices and quantities, too / enough, comparing products, returns and complaints.',
    lessons: [
      ['How much is it?', 'much / many, prices'],
      ['Too big, not big enough', 'too / enough, clothes'],
      ['Which one is better?', 'comparatives, as… as'],
      ['I\'d like to return this', 'polite requests, past simple'],
      ['Module 8 check: Shopping and money', 'check'],
    ],
  },
  {
    number: 9, title: 'Media and technology', goal: 'Present perfect for experiences (ever / never), just / already / yet, online safety advice, present perfect vs past simple.',
    lessons: [
      ['Have you ever…?', 'present perfect: experiences'],
      ['Have you done it yet?', 'just / already / yet, messages'],
      ['Safe online', 'should / shouldn\'t'],
      ['Have you seen it? — Yes, I saw it last week', 'present perfect vs past simple'],
      ['Module 9 check: Media and technology', 'check'],
    ],
  },
  {
    number: 10, title: 'A2 exam practice', goal: 'Exam strategies for reading, listening and language, writing and speaking with an A2 grammar review, and a full A2 mock exam.',
    lessons: [
      ['Smart reading', 'reading strategies, A2 tenses review'],
      ['Listen and use', 'listening strategies, comparatives, much / many, too / enough, prepositions'],
      ['Writing for points', 'exam e-mail, linking words'],
      ['Speak with confidence', 'speaking tasks, question forms'],
      ['Final mock exam (A2)', 'mock exam'],
    ],
  },
]);

const pad = (n) => String(n).padStart(3, '0');

// the teacher's lesson description in the CRM (Russian, like the other courses' lesson plans)
function lessonPlan(module, title, focus, check) {
  return [
    'Курс: английский язык, уровень A2 (подготовка к экзамену основной школы, B1).',
    `Модуль ${module.number}: ${module.title}.`,
    `Тема урока: ${title}.`,
    `Что учить: ${focus}`,
    check
      ? 'Как проходит урок: контроль в формате экзамена — лист 1 (чтение), лист 2 (аудирование и задания по языку), лист 3 (e-mail 90–110 слов и говорение).'
      : 'Как проходит урок: Avasta (текст и правило) → Harjuta (упражнения, перевод, диктант) → Kasuta (письмо, аудирование и разговор). Тексты для аудирования читает учитель.',
  ].join('\n');
}

export function enA2CurriculumRecords() {
  return EN_A2_MODULES.flatMap((module) => module.lessons.map(([title, focus], index) => {
    const number = (module.number - 1) * 5 + index + 1;
    const check = index === 4;
    return {
      id: `en-a2-${pad(number)}`,
      type: 'lesson',
      title,
      description: lessonPlan(module, title, focus, check),
      descriptionSource: 'lesson-plan-v1',
      subject: 'Inglise keel',
      level: EN_A2_LEVEL,
      levelStage: EN_A2_LEVEL,
      topic: `${String(module.number).padStart(2, '0')}. ${module.title}`,
      order: number,
      curriculumId: EN_A2_CURRICULUM_ID,
      curriculumTitle: EN_A2_CURRICULUM_TITLE,
      roadmapLessonId: `en-a2-${pad(number)}`,
      roadmapLessonNumber: number,
      roadmapModuleId: `en-a2-module-${String(module.number).padStart(2, '0')}`,
      roadmapModuleNumber: module.number,
      roadmapModuleTitle: module.title,
      roadmapModuleGoal: module.goal,
      roadmapKind: check ? 'check' : 'theme',
      roadmapTag: check ? 'Kontroll' : 'Teema',
      lessonTypeLabel: check ? 'Kontroll' : 'Teema',
      goal: focus,
      languageFocus: focus,
      contactMinutes: 60,
      roadmapVersion: EN_A2_VERSION,
      roadmapManaged: true,
    };
  }));
}
