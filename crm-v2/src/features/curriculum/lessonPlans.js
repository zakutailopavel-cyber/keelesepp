// Lesson plan text for every roadmap lesson (A2, A2→B1, B1→B2, C1): what the lesson is for, what to teach and how the
// hour goes, built from the lesson's own fields (goal, focus, practice, success) and its type. It is written into the
// lesson's `description`, so a teacher who opens the lesson in Õppevara sees a ready plan.

export const LESSON_PLAN_SOURCE = 'lesson-plan-v1';

const clean = (value) => String(value ?? '').replace(/\s+/g, ' ').trim();
const sentence = (value) => {
  const text = clean(value).replace(/[.;]+$/, '');
  return text ? `${text}.` : '';
};
const lower = (value) => {
  const text = clean(value);
  return text ? text[0].toLocaleLowerCase('ru') + text.slice(1) : '';
};
const items = (value) => clean(value).split(/;\s*/).map((item) => item.replace(/[.]+$/, '').trim()).filter(Boolean);
const list = (values) => values.map(lower).join('; ');

// practice items → the drill part and the part where the student uses the language on their own
function splitPractice(practice) {
  const parts = items(practice);
  if (parts.length <= 1) return { train: parts, apply: [] };
  const applyCount = parts.length >= 5 ? 2 : 1;
  return { train: parts.slice(0, parts.length - applyCount), apply: parts.slice(parts.length - applyCount) };
}

const TAG_CATEGORY = [
  [/диагност|diagnost/i, 'diagnostic'],
  [/провер|kontroll|eksam|финал|пробн|тест/i, 'assessment'],
  [/граммат|grammat/i, 'grammar'],
  [/лексик|sõnavara/i, 'vocabulary'],
  [/чтени.*письм/i, 'writing'],
  [/чтени|lugemine/i, 'reading'],
  [/аудир|kuulamine/i, 'listening'],
  [/письм|kirjutamine|редакт|korrigeer/i, 'writing'],
  [/аргумент|дискусс|перегов|критич|логик|сравнен|синтез/i, 'argument'],
  [/интеграц|integrats|проект/i, 'integrated'],
  [/речь|ситуац|говорен|диалог|монолог|спонтан|suhtlus|rääkimine/i, 'speaking'],
];
const KIND_CATEGORY = { assessment: 'assessment', grammar: 'grammar', vocabulary: 'vocabulary', reading: 'reading', listening: 'listening', writing: 'writing', communication: 'speaking', integrated: 'integrated' };

export function lessonCategory(lesson) {
  const tag = clean(lesson?.tag || lesson?.typeLabel);
  for (const [pattern, category] of TAG_CATEGORY) if (pattern.test(tag)) return category;
  if (lesson?.kind === 'theme') return 'theme';
  return KIND_CATEGORY[lesson?.kind] || 'speaking';
}

// 60-minute lesson flows; {train} and {apply} come from the lesson's practice, {focus} from its language focus
const FLOWS = {
  diagnostic: ({ train, apply }) => {
    const all = [...train, ...apply];
    const written = all.filter((item) => /письм|сообщени|о себе|эссе/i.test(item));
    const understanding = all.filter((item) => !written.includes(item) && /чтени|аудир|текст|граммат|языков|пункт/i.test(item));
    const oral = all.filter((item) => !written.includes(item) && !understanding.includes(item));
    return [
    ['Знакомство и настрой', 5, 'объяснить, что сегодня не оценка, а карта стартового уровня; короткий разговор для снятия напряжения'],
    ['Устная часть', 15, `${list(oral) || 'короткие вопросы о себе'}; фиксировать, сколько предложений ученик связывает без подсказки`],
    ['Понимание и язык', 20, `${list(understanding) || 'понимание короткого текста и базовая грамматика'}; отмечать типичные ошибки по фокусу урока`],
    ['Письмо', 15, list(written) || 'короткий текст о себе'],
    ['Вывод', 5, 'назвать ученику 2–3 сильные стороны и 3 приоритетные зоны; заполнить «Esmane hindamine» в карточке ученика'],
    ];
  },
  assessment: ({ train, apply }) => {
    const parts = [...train, ...apply];
    const each = parts.length ? Math.max(5, Math.floor(50 / parts.length)) : 50;
    return [
      ['Настрой', 3, 'объяснить формат проверки и критерии, ученик знает, что оценивается'],
      ...(parts.length ? parts.map((part) => [part[0].toLocaleUpperCase('ru') + part.slice(1), each, 'без подсказок учителя; ошибки только отмечать, не исправлять сразу']) : [['Проверка', 50, 'устная часть, языковые пункты и письмо по темам модуля']]),
      ['Разбор и выводы', 7, 'показать 2–3 главные ошибки, выставить оценку и оценки навыков (вкладка «Tööd» → «Oskused»), выбрать темы для повторения'],
    ];
  },
  grammar: ({ focus, train, apply }) => [
    ['Разминка', 5, '3–4 вопроса по прошлому уроку, ответы на которые требуют сегодняшней формы'],
    ['Объяснение', 12, `${focus ? `форма и правило: ${focus}. ` : ''}Показать 4–6 примеров из жизни ученика, ученик сам формулирует закономерность; таблица или схема в тетрадь`],
    ['Тренировка', 20, `${list(train)}; сначала с опорой, затем без; быстрый темп, исправление сразу`],
    ['Применение', 18, `${list(apply) || 'собственные предложения ученика о себе'}; ученик использует форму в собственных высказываниях, учитель записывает ошибки`],
    ['Итог', 5, 'ученик называет правило своими словами; 2–3 типичные ошибки в тетрадь; домашнее задание на форму'],
  ],
  vocabulary: ({ focus, train, apply }) => [
    ['Вход в тему', 5, 'что ученик уже знает по теме: ассоциации, 5–6 слов, которые он вспомнит сам'],
    ['Новые слова', 15, `${focus ? `${focus}. ` : ''}Показать в контексте и на картинках, отработать произношение и ударение, сразу 1–2 примера на каждое слово`],
    ['Тренировка', 20, `${list(train)}; слова должны прозвучать в речи ученика несколько раз`],
    ['Применение', 15, `${list(apply) || 'рассказ о себе'}; ученик говорит или пишет о себе, используя новые слова`],
    ['Итог', 5, 'ученик называет 8–10 слов урока без опоры; добавить их в «Sõnad» ученика для повторения карточками'],
  ],
  reading: ({ focus, train, apply }) => [
    ['Перед чтением', 8, `прогноз по заголовку или картинке; ключевые слова${focus ? ` (${focus})` : ''}`],
    ['Первое чтение', 10, 'общее понимание: о чём текст, кто, где, что главное'],
    ['Второе чтение', 20, `${list(train)}; ответы ученик подтверждает строчкой из текста`],
    ['После чтения', 17, `${list(apply) || 'пересказ и мнение ученика'}; перенос содержания на опыт ученика`],
    ['Итог', 5, 'какая стратегия чтения помогла; 5 слов из текста в «Sõnad»'],
  ],
  listening: ({ focus, train, apply }) => [
    ['Перед прослушиванием', 8, `ситуация и ожидания: кто говорит, что может прозвучать${focus ? `; ключевые слова: ${focus}` : ''}`],
    ['Первое прослушивание', 10, 'общий смысл: тема, участники, итог'],
    ['Детальное прослушивание', 20, `${list(train)}; при необходимости слушать фрагментами`],
    ['После прослушивания', 17, `${list(apply) || 'пересказ услышанного'}; ученик воспроизводит или продолжает услышанную ситуацию сам`],
    ['Итог', 5, 'что было трудно услышать и почему; 3–5 фраз из записи в тетрадь'],
  ],
  writing: ({ focus, train, apply }) => [
    ['Образец', 10, `разобрать готовый текст: структура, обращение, связки${focus ? `; языковой фокус: ${focus}` : ''}`],
    ['Подготовка', 15, `${list(train)}; составить план и набор фраз`],
    ['Письмо', 25, `${list(apply) || 'текст по теме урока'}; ученик пишет сам, учитель не подсказывает`],
    ['Проверка', 7, 'самопроверка по чек-листу (структура, падежи, порядок слов), затем исправления учителя прямо в работе'],
    ['Итог', 3, 'одна сильная сторона текста и одна цель на следующий раз'],
  ],
  speaking: ({ focus, train, apply }) => [
    ['Разминка', 5, 'короткий разговор по теме, 3–4 открытых вопроса'],
    ['Модель', 12, `${focus ? `нужные фразы и конструкции: ${focus}. ` : ''}Показать образец диалога или рассказа, ученик выделяет полезные фразы`],
    ['Тренировка', 18, `${list(train)}; сначала с опорой, затем без`],
    ['Применение', 20, `${list(apply) || 'новая похожая ситуация без опоры'}; ролевая ситуация или монолог, смена ролей; учитель записывает ошибки, не перебивая`],
    ['Обратная связь', 5, '2 сильные стороны и 1–2 исправления; ученик повторяет исправленные фразы'],
  ],
  argument: ({ focus, train, apply }) => [
    ['Вход в тему', 7, 'спорный вопрос по теме; ученик сразу высказывает позицию одним-двумя предложениями'],
    ['Структура и связки', 13, `тезис → аргумент → пример → вывод${focus ? `; языковой фокус: ${focus}` : ''}`],
    ['Тренировка', 15, `${list(train)}; каждый аргумент с примером`],
    ['Дискуссия или текст', 20, `${list(apply) || 'короткая дискуссия по теме'}; учитель берёт противоположную позицию, ученик отвечает на возражения`],
    ['Итог', 5, 'какие связки ученик использовал; одна формулировка, которую стоит улучшить'],
  ],
  integrated: ({ focus, train, apply }) => [
    ['Вход', 5, 'короткий разговор, связывающий урок с жизнью ученика'],
    ['Языковая опора', 12, focus ? `повторить и показать: ${focus}` : 'повторить нужную лексику и грамматику'],
    ['Задания', 25, `${list(train)}; чередовать говорение, чтение и письмо`],
    ['Итоговое задание', 13, list(apply) || 'ученик применяет всё в одном задании'],
    ['Итог', 5, 'что получилось и что повторить; домашнее задание'],
  ],
};

const C1_FLOWS = {
  theme: (focus) => [
    ['Вход в тему', 10, 'личный опыт ученика или провокационный вопрос по теме; первая позиция ученика'],
    ['Точная лексика', 15, `${focus ? `${focus} ` : ''}Нюансы значения, регистр (нейтральный, оценочный, образный), устойчивые сочетания`],
    ['Длинный текст или аудио', 25, 'понимание деталей, скрытого смысла и позиции автора; аргументы в тексте'],
    ['Говорение', 20, 'аргументированная позиция, ответы на возражения учителя, точная лексика урока'],
    ['Письмо или медиация', 15, 'обобщить информацию из текста для другого адресата или написать аргументированный текст'],
    ['Итог', 5, 'ключевые выражения урока в «Sõnad»; оценки навыков в «Tööd»'],
  ],
  grammar: (focus) => [
    ['Наблюдение', 10, 'найти конструкцию в аутентичном тексте; ученик сам формулирует, когда и зачем она нужна'],
    ['Фокус', 20, focus || 'грамматика урока в контексте'],
    ['Тренировка в контексте', 25, 'перефразирование, трансформация предложений, выбор между близкими конструкциями'],
    ['Применение', 25, 'устный или письменный текст, где конструкция естественно нужна; стилистическая правка'],
    ['Итог', 10, 'типичные ошибки и правило своими словами; оценки навыков в «Tööd»'],
  ],
  assessment: (focus) => [
    ['Настрой', 5, 'формат и критерии проверки'],
    ['Проверка', 70, focus || 'понимание текста, говорение с аргументацией, письмо, медиация'],
    ['Разбор', 15, 'главные ошибки и сильные стороны; оценки навыков в «Tööd» → «Oskused»; темы для повторения'],
  ],
};

function render(lines) {
  return lines.filter((line) => line !== null && line !== undefined && line !== false).join('\n');
}

function steps(flow) {
  return flow.map(([title, minutes, text], index) => `${index + 1}. ${title} (${minutes} мин): ${sentence(text).replace(/^([а-яё])/, (c) => c.toLocaleUpperCase('ru'))}`);
}

// One roadmap lesson (A2 / A2→B1 / B1→B2) → plan text.
export function roadmapLessonPlan(module = {}, lesson = {}, { minutes = 60 } = {}) {
  const category = lessonCategory(lesson);
  const { train, apply } = splitPractice(lesson.practice);
  const focus = clean(lesson.focus).replace(/[.]+$/, '');
  const inline = focus.replace(/^([А-ЯЁ])/, (c) => c.toLocaleLowerCase('ru'));
  const flow = (FLOWS[category] || FLOWS.speaking)({ focus: inline, train, apply });
  return render([
    `Цель урока: ${sentence(lesson.goal)}`,
    focus ? `Что учить: ${sentence(focus)}` : null,
    '',
    `Ход урока (${minutes} мин):`,
    ...steps(flow),
    '',
    `Результат: ${sentence(lesson.success)}`,
    module.attention ? `На что обратить внимание в модуле: ${sentence(module.attention)}` : null,
    'Рабочие листы: в Õppevara откройте урок → «Töölehed» (конструктор урока).',
  ]);
}

// One C1 lesson → plan text (2 academic hours).
export function c1LessonPlan(module = {}, lesson = {}) {
  const kind = lesson.kind === 'grammar' ? 'grammar' : lesson.kind === 'assessment' ? 'assessment' : 'theme';
  const focus = sentence(lesson.focus);
  const minutes = (Number(lesson.hours) || 2) * 45;
  return render([
    `Тип: ${clean(lesson.typeText) || 'C1 урок'}.`,
    focus ? `Что учить: ${focus}` : null,
    module.title ? `Модуль: ${clean(module.title)}${module.description ? ` — ${lower(module.description).replace(/[.]+$/, '')}` : ''}.` : null,
    '',
    `Ход урока (${minutes} мин):`,
    ...steps(C1_FLOWS[kind](focus)),
    '',
    kind === 'theme' ? 'Без отдельного объяснения грамматики: грамматика здесь встречается естественно в языке.' : null,
    'Рабочие листы: в Õppevara откройте урок → «Töölehed» (конструктор урока).',
  ]);
}
