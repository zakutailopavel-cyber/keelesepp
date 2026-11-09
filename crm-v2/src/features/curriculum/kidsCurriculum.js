// The Sunday children's groups (owner 2026-10-28: „полный учебный план, что на каком уроке делать”): three courses
// of 12 lessons — Eelkool 5–6 a, Kooliks valmis 6–7 a, Eesti keel 2.–3. klassile 8–9 a. Records go to
// curriculumLessons/{id} (Õppevara: Eesti keel → level → course); the sheets come from
// worksheet-generator/admin/course/kids/sheets.js. The lesson description is the teacher's plan minute by minute
// (Russian, like the other courses' plans).
import { PROGRAM_56 } from '../worksheet-generator/admin/course/kids/program56.js';
import { PROGRAM_67 } from '../worksheet-generator/admin/course/kids/program67.js';
import { PROGRAM_89 } from '../worksheet-generator/admin/course/kids/program89.js';
import { SCHOOL_89 } from '../worksheet-generator/admin/course/kids/school89.js';

export const KIDS_VERSION = '2026-10-28.1';
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

export const KIDS_COURSES = [
  { program: PROGRAM_56, plan: youngPlan },
  { program: PROGRAM_67, plan: youngPlan },
  { program: PROGRAM_89, plan: schoolPlan },
];

export function kidsCurriculumRecords() {
  return KIDS_COURSES.flatMap(({ program, plan }) => program.lessons.map((lesson, index) => {
    const number = index + 1;
    const id = `${program.id}-${pad(number)}`;
    const celebration = Boolean(lesson.celebration);
    return {
      id,
      type: 'lesson',
      title: lesson.title,
      description: plan(program, lesson, number),
      descriptionSource: 'lesson-plan-v1',
      subject: 'Eesti keel',
      level: program.level,
      levelStage: program.level,
      topic: `01. ${program.title}`,
      order: number,
      curriculumId: `kids-${program.id}-v1`,
      curriculumTitle: `KeeleSepp lastele: ${program.title}`,
      roadmapLessonId: id,
      roadmapLessonNumber: number,
      roadmapModuleId: `${program.id}-module-01`,
      roadmapModuleNumber: 1,
      roadmapModuleTitle: program.title,
      roadmapModuleGoal: program.goal,
      roadmapKind: celebration ? 'check' : 'theme',
      roadmapTag: celebration ? 'Pidu' : 'Teema',
      lessonTypeLabel: celebration ? 'Pidu' : 'Teema',
      goal: lesson.can,
      languageFocus: lesson.grammar || wordsOf(lesson).slice(0, 6).join(', '),
      contactMinutes: program.minutes,
      roadmapVersion: KIDS_VERSION,
      roadmapManaged: true,
    };
  }));
}
