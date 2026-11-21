// The Sunday children's groups (owner 2026-10-28: „полный учебный план, что на каком уроке делать”): three courses
// of 12 lessons — Eelkool 5–6 a, Kooliks valmis 6–7 a, Eesti keel 2.–3. klassile 8–9 a. Records go to
// curriculumLessons/{id} (Õppevara: Eesti keel → level → course); the sheets come from
// worksheet-generator/admin/course/kids/sheets.js. The lesson description is the teacher's plan minute by minute
// (Russian, like the other courses' plans).
import { PROGRAM_56 } from '../worksheet-generator/admin/course/kids/program56.js';
import { PROGRAM_67 } from '../worksheet-generator/admin/course/kids/program67.js';
import { PROGRAM_89 } from '../worksheet-generator/admin/course/kids/program89.js';
import { SCHOOL_89 } from '../worksheet-generator/admin/course/kids/school89.js';
import { CLUB_11 } from '../worksheet-generator/admin/course/kids/club11.js';

export const KIDS_VERSION = '2026-11-21.1';
const pad = (n) => String(n).padStart(3, '0');
const wordsOf = (lesson) => lesson.words.map((w) => (Array.isArray(w) ? w[0] : w));
const taskText = (task) => (task?.type === 'letterhunt' ? `«Leia täht ${task.target}» — обвести все буквы ${task.target}` : '«Loenda ja kirjuta» — посчитать картинки и назвать число по-эстонски');
const traceText = (lesson) => lesson.trace.map(([text]) => text.replace(/\s+/g, ' ')).join(', ');

function youngPlan(program, lesson, n) {
  const header = [
    `Курс: ${program.title} — воскресенье, ${program.minutes} минут, группа до 5 детей.`,
    `Урок ${n} из 12: ${lesson.title} (${lesson.ru}).`,
    `Цель урока: ${lesson.can}`,
    `Слова: ${wordsOf(lesson).join(', ')}.`,
    `Фразы: ${lesson.phrases.join(' · ')}`,
    `Материалы: карточки-картинки (лист 1 «Tunnis: uued sõnad»), цветные карандаши, мягкий мяч, лист 2 «Tunnis: harjutame», лист 3 «Kodus vanemaga» — домой.`,
    '',
  ];
  const plan = program.id === 'k56' ? [
    `Ход урока (${program.minutes} мин):`,
    `1. Приветствие (5 мин): круг, каждый говорит «Tere! Mina olen …». Стишок урока с движениями: «${lesson.chant.join(' / ')}».`,
    '2. Новые слова (10 мин): показать картинки, назвать каждое слово 3 раза; дети повторяют хором и по одному. Вопрос «Mis see on?» — ответ «See on …». На листе 1 — «Ühenda sõna ja pilt» (учитель читает слово, дети ищут картинку).',
    `3. Игра (10 мин): ${lesson.game}`,
    `4. Подвижная минутка (5 мин): ${lesson.move}`,
    `5. Лист 2 (10 мин): раскраска по номерам (называем цвета по-эстонски), прописи (${traceText(lesson)}), ${taskText(lesson.task)}.`,
    '6. Итог (5 мин): каждый ребёнок называет 2 новых слова; звёздочка/наклейка; раздать лист 3 «Kodus vanemaga» и коротко объяснить родителям.',
  ] : [
    `Ход урока (${program.minutes} мин):`,
    '1. Приветствие и календарь (5 мин): «Tere! Mis päev täna on? Mis ilm on?» — дети отвечают полным предложением.',
    `2. Звук и буква дня (15 мин): ${traceText(lesson)} — произносим звук, ищем слова на этот звук, пишем букву пальцем в воздухе и на доске. Стишок: «${lesson.chant.join(' / ')}».`,
    `3. Чтение (10 мин): карточка «Loe valjusti» на листе 1 — ${(lesson.read || []).join(' · ')}. Читаем по слогам, показывая пальцем.`,
    `4. Игра (10 мин): ${lesson.game}`,
    `5. Письмо (10 мин): лист 2 — прописи, «Kirjuta puuduv täht või sõna», ${taskText(lesson.task)}; раскраска — если осталось время.`,
    `6. ${lesson.story ? 'Сказка и пересказ' : 'Рассказ и итог'} (10 мин): ${lesson.story ? 'читаем сказку с листа 1, дети раскладывают картинки и пересказывают простыми фразами' : 'каждый ребёнок говорит 2–3 фразы урока'}; раздать лист 3 «Kodus vanemaga».`,
  ];
  return [...header, ...plan, '', `Домой (родителям): ${lesson.home}`, ...(lesson.celebration ? ['', 'Это праздничный урок: пригласить родителей, подготовить грамоты (на листе 3 «TUNNISTUS»).'] : [])].join('\n');
}

function schoolPlan(program, lesson, n) {
  const sheet = SCHOOL_89[n - 1];
  const [title, , questions] = sheet.reading;
  return [
    `Курс: ${program.title} — воскресенье, ${program.minutes} минут, группа до 5 детей.`,
    `Урок ${n} из 12: ${lesson.title} (${lesson.ru}).`,
    `Цель урока: ${lesson.can}`,
    `Грамматика: ${lesson.grammar}.`,
    `Слова: ${lesson.words.join(', ')}.`,
    `Материалы: лист 1 «Loeme» (слова, текст, вопросы, «Keelekast»), лист 2 «Harjutame keelt» (${sheet.practice.length} упражнений), лист 3 «Kirjutame ja räägime» (образец, план, письмо, выступление, записка родителям).`,
    '',
    `Ход урока (${program.minutes} мин):`,
    `1. Разминка (5 мин): вопросы «Enne lugemist» на листе 1 — ${sheet.warm.join(' ')}`,
    '2. Слова (10 мин): «Tunni sõnad» — читаем слова и формы, перевод только как подсказка; «Ühenda sõna ja pilt».',
    `3. Чтение (15 мин): текст «${title}» — сначала учитель читает вслух, потом дети по цепочке; ${questions.length} вопросов к тексту, «Õige või vale?» и «Vali õige vastus».`,
    `4. Грамматика (10 мин): рамка «Keelekast» (${lesson.grammar}) — дети находят примеры в тексте; последнее задание листа 1 делаем вместе, затем первые 2–3 упражнения листа 2.`,
    `5. Письмо (10 мин): лист 3 — читаем образец «${sheet.model[0]}», заполняем план, начинаем текст по «Lauseabi». ${lesson.write[0]}`,
    '6. Мини-выступление и итог (10 мин): каждый говорит около минуты (вопросы на листе 3), остальные задают один вопрос; отмечаем «Kontrolli end». Дома: оставшиеся упражнения листа 2 и текст до конца.',
    '',
    `Домой (родителям): ${lesson.home}`,
    ...(lesson.celebration ? ['', 'Это праздничный урок: пригласить родителей, грамоты на листе 3 «TUNNISTUS».'] : []),
  ].join('\n');
}


// the speaking club 10–12 (owner 2026-11-15): one meeting = lesson 1 (45 min) + snack + lesson 2 (45 min)
// Owner 2026-11-21 („давай разбавим”): the same 11-step skeleton every Sunday got monotonous for 9–11-year-olds.
// Now every meeting differs: the club passport with stickers runs through the course, each lesson has a 3-minute
// movement break (8 games in rotation), „Leia keegi” is played in 4 formats in turn, lesson 1 starts with the game
// on even meetings, the talk grows (modules 1–2: 30 s in pairs, 3–4: a minute in threes, 5: a minute to the group)
// and the crossword goes home.
const CLUB_BREAKS = [
  '«Kõik, kellel …»: стулья в кругу, одного не хватает; «Kõik, kellel on õde / kass / sinine pluus, vahetavad kohti!»',
  '«Õpetaja ütleb»: «Õpetaja ütleb: hüppa! puuduta nina! istu!» — без слов «Õpetaja ütleb» не выполнять.',
  '«Külm – kuum»: один выходит, группа прячет карточку слова; ищет, а группа подсказывает «külm / soe / kuum!»; нашёл — называет слово.',
  '«Kujud» (замри): под музыку двигаются, музыка стоп — учитель называет слово урока, все замирают и изображают его.',
  '«Jah – ei»: справа «JAH», слева «EI»; учитель говорит предложение о детях («Mul on koer.»), каждый перебегает на свою сторону.',
  '«Sõnapall»: мяч по кругу, поймавший называет слово урока; повторил уже сказанное — садится; последние двое — чемпионы.',
  '«Järjekord»: молча встать в ряд по дню рождения / по росту / по алфавиту имён, потом проверить вслух по-эстонски.',
  '«Peegel»: пары лицом друг к другу, один показывает действие и говорит «Ma …», партнёр повторяет движение и «Sa …».',
];
const CLUB_FIND = [
  ['подписи', 'дети ходят по классу и спрашивают «Kas sa …?»; кто ответил «Jah», ставит подпись в строке. Цель — 6 разных подписей за 6 минут.'],
  ['бинго', 'таблица — это бинго: кто первым собрал «Jah» в 3 строках подряд, кричит «Bingo!» и читает свои 3 ответа вслух полными предложениями.'],
  ['репортёр', 'в парах: один — репортёр с «микрофоном» (маркер), спрашивает 4 строки таблицы, потом меняются; в конце каждый сообщает группе новость «Uudised! Mark …».'],
  ['наперегонки', 'две команды; учитель называет строку таблицы, команды за 1 минуту находят в другой команде того, кто «Jah», и говорят полным предложением. Очко команде.'],
];
const clubTalk = (lesson, project) => {
  if (lesson.celebration) return 'Минута для родителей (15 мин): каждый ребёнок говорит около минуты о своей любимой теме клуба, родители задают по вопросу.';
  if (project) return 'Презентация проекта (12 мин): каждый с готовым продуктом в руках говорит 30–60 секунд, остальные задают по одному вопросу; за каждый вопрос — наклейка тому, кто спросил.';
  if (lesson.module <= 2) return `Рассказ в парах (8 мин): лист 3 — план из 6 строк; каждый 30 секунд рассказывает партнёру (таймер), партнёр задаёт 1 вопрос, потом меняются; перед всей группой — только желающие (за смелость — наклейка). Тема: ${lesson.talk}`;
  if (lesson.module <= 4) return `Рассказ в тройках (8 мин): лист 3 — план из 6 строк; каждый говорит около минуты двоим слушателям, слушатели задают по вопросу и говорят группе одну вещь, которую запомнили. Тема: ${lesson.talk}`;
  return `Минута рассказа (8 мин): лист 3 — план из 6 строк, затем каждый говорит около минуты перед группой (таймер), остальные задают по вопросу. Тема: ${lesson.talk}`;
};

function clubPlan(program, lesson, n) {
  const [roleTitle] = lesson.roles;
  const [extraTitle] = lesson.extra;
  const [pairTitle] = lesson.pair;
  const project = lesson.inModule === 4;
  const break1 = CLUB_BREAKS[(2 * n - 2) % CLUB_BREAKS.length];
  const break2 = CLUB_BREAKS[(2 * n - 1) % CLUB_BREAKS.length];
  const [findKind, findHow] = CLUB_FIND[(n - 1) % CLUB_FIND.length];
  const gameFirst = n % 2 === 0;
  const game = `Игра (10 мин): ${lesson.game1}`;
  const words = `Слова (8 мин): карточки с картинками — быстро, хором (простые слова дети уже знают). Главное — «Raskemad sõnad»: учитель объясняет слово по-эстонски, дети угадывают, затем каждый говорит предложение с одним сложным словом. Образец: ${lesson.phrases[0][1]}`;
  const lesson1 = [
    `Круг и разминка (4 мин): «Tere! Kuidas läheb?» — каждый отвечает и задаёт вопрос соседу.${n > 1 ? ' Плюс 2 вопроса с карточек прошлой встречи.' : ''}`,
    ...(gameFirst ? [game, words] : [words]),
    'Фразы и «Lauseehitaja» (7 мин): рамка «Räägime nii» — учитель спрашивает, дети отвечают по образцу; затем «Lauseehitaja» в парах — каждый говорит по предложению с каждым образцом (sest / aga / siis).',
    `Разминка-движение (3 мин): ${break1}`,
    'Диалог (5 мин): диалог в ролях A/B, затем пары говорят его о себе. «Kirjuta lünka» — только если осталось время, иначе дома.',
    ...(gameFirst ? [] : [game]),
    `Paaristöö «${pairTitle}» (7 мин): карточки A/B с листа 1 — не показывать друг другу, спрашивать и записывать ответы в таблицу на листе 2, потом поменяться.`,
  ];
  const lesson2 = [
    `«${lesson.findTitle || 'Leia keegi, kes …'}» — сегодня ${findKind} (8 мин): лист 3, ${findHow}`,
    `Карточки вопросов (${lesson.celebration ? 3 : project ? 5 : 7} мин): дети тянут карточку, задают вопрос соседу, тот отвечает полным предложением и тянет следующую.`,
    `Разминка-движение (3 мин): ${break2}`,
    `Ролевая игра и игра (15 мин; карточки «${roleTitle}» и «${extraTitle}» с листа 1): ${lesson.game2}`,
    clubTalk(lesson, project),
    'Итог (2 мин): «Ma oskan» на листе 3 — каждый отмечает, что умеет; наклейки в паспорт клуба; лист 3 с запиской для родителей — домой.',
  ];
  const numbered = (steps) => steps.map((step, i) => `${i + 1}. ${step}`);
  return [
    `Курс: ${program.title} — 2 урока по 45 минут с перекусом между ними, группа детей 9–12 лет, уровень A1–A2.`,
    `Модуль ${lesson.module} «${lesson.moduleTitle}», встреча ${lesson.inModule} из 4 (всего ${n} из ${program.lessons.length}): ${lesson.title} (${lesson.ru}).`,
    ...(lesson.inModule === 4 && !lesson.celebration ? ['Это встреча-проект модуля: повторение всего модуля и общий проект. Подготовить: листы А3, клей, фломастеры, ножницы.'] : []),
    `Цель: ${lesson.can}`,
    `Речевой фокус: ${lesson.focus}.`,
    `Слова: ${lesson.words.map(([w, ru]) => `${w} (${ru})`).join(', ')}.`,
    `Слова посложнее: ${lesson.words2.map(([w, ru]) => `${w} (${ru})`).join(', ')}.`,
    'Материалы: лист 1 «Kaardid» — распечатать заранее (лучше на плотной бумаге) и разрезать по рамкам (карточки слов, «Raskemad sõnad» и «Paaristöö» A/B — урок 1, вопросы — уроки 1 и 2, ролевые и дополнительные — урок 2); листы 2 и 3 — по одному на ребёнка; мягкий мяч, таймер, ножницы, наклейки для паспорта клуба.',
    'Правило клуба: дети говорят больше учителя. Учитель говорит по-эстонски, по-русски — только короткая подсказка. Ошибки не прерываем: в конце урока повторяем 2–3 правильные фразы.',
    `Паспорт клуба: у каждого ребёнка паспорт (если ещё не выдан — выдать сегодня). Наклейка — за просьбу по-эстонски на перекусе, за вопрос однокласснику, за выступление по желанию, за победу в игре. На талвепидy (встреча 8) и на празднике (встреча 20) — маленький приз тем, у кого больше всего наклеек${n === 8 || n === 20 ? ' — сегодня!' : ''}.`,
    '',
    'УРОК 1 (45 мин):',
    ...numbered(lesson1),
    '',
    `ПЕРЕКУС (10–15 мин): говорим только по-эстонски — фразы в рамке «Söögipaus» в начале листа 3: ${[...lesson.snack].join(' ')} Кто попросил по-эстонски — наклейка в паспорт.`,
    '',
    'УРОК 2 (45 мин):',
    ...numbered(lesson2),
    '',
    'ЕСЛИ ОСТАЛОСЬ ВРЕМЯ — запасные разговорные игры (без письма):',
    '• «Seleta sõna»: ребёнок тянет карточку «Raskemad sõnad» и объясняет слово по-эстонски, не называя его; кто угадал — объясняет следующее.',
    '• «Kuum tool»: один ребёнок на стуле, группа задаёт вопросы с карточек; он отвечает полным предложением и добавляет «sest …».',
    '• «Lauseahel»: первый говорит предложение по теме, следующий повторяет его и добавляет своё через «ja» или «aga».',
    '• «20 küsimust»: ребёнок загадывает слово урока, группа угадывает вопросами «Kas see on …?», ответ только «Jah» / «Ei».',
    '',
    `Домой (родителям): ${lesson.home} Кроссворд и «Kirjuta lünka» на листах 2–3 — дома, если не успели в классе.`,
    ...(lesson.celebration ? ['', 'Это праздничная встреча: пригласить родителей, подготовить грамоты (на листе 3 «TUNNISTUS»), кофе/чай для родителей во время перекуса — дети угощают по-эстонски.'] : []),
  ].join('\n');
}

export const KIDS_COURSES = [
  { program: PROGRAM_56, plan: youngPlan },
  { program: PROGRAM_67, plan: youngPlan },
  { program: PROGRAM_89, plan: schoolPlan },
  { program: CLUB_11, plan: clubPlan },
];

export function kidsCurriculumRecords() {
  return KIDS_COURSES.flatMap(({ program, plan }) => program.lessons.map((lesson, index) => {
    const number = index + 1;
    const id = `${program.id}-${pad(number)}`;
    const celebration = Boolean(lesson.celebration);
    const project = !celebration && lesson.inModule === 4;
    return {
      id,
      type: 'lesson',
      title: lesson.title,
      description: plan(program, lesson, number),
      descriptionSource: 'lesson-plan-v1',
      subject: 'Eesti keel',
      level: program.level,
      levelStage: program.level,
      topic: lesson.module ? `${String(lesson.module).padStart(2, '0')}. ${lesson.moduleTitle}` : `01. ${program.title}`,
      order: number,
      curriculumId: `kids-${program.id}-v1`,
      curriculumTitle: `KeeleSepp lastele: ${program.title}`,
      roadmapLessonId: id,
      roadmapLessonNumber: number,
      // the speaking club has five modules of four meetings (lesson.module); the Sunday groups one module
      roadmapModuleId: `${program.id}-module-${String(lesson.module || 1).padStart(2, '0')}`,
      roadmapModuleNumber: lesson.module || 1,
      roadmapModuleTitle: lesson.moduleTitle || program.title,
      roadmapModuleGoal: lesson.moduleGoal || program.goal,
      roadmapKind: celebration ? 'check' : project ? 'project' : 'theme',
      roadmapTag: celebration ? 'Pidu' : project ? 'Projekt' : 'Teema',
      lessonTypeLabel: celebration ? 'Pidu' : project ? 'Projekt' : 'Teema',
      goal: lesson.can,
      languageFocus: lesson.grammar || lesson.focus || wordsOf(lesson).slice(0, 6).join(', '),
      contactMinutes: program.minutes,
      roadmapVersion: KIDS_VERSION,
      roadmapManaged: true,
    };
  }));
}
