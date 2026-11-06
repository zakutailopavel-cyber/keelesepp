// The children's courses as course modules (owner 2026-10-28: „учебные планы для групп, с раскрасками, полным
// учебным планом, что на каком уроке делать”): every lesson of program56 / program67 / program89 becomes three
// sheets for the constructor and the Live Classroom:
//   discover „Tunnis: uued sõnad” — the chant, the words with pictures (and reading / a story for 6–7);
//   practice „Tunnis: harjutame” — colouring by numbers, tracing, counting / letter hunt;
//   transfer „Kodus koos vanemaga” — the parents' note, colouring, tracing.
// The 8–9 group has full school-style sheets instead (1 Loeme, 2 Harjutame keelt, 3 Kirjutame ja räägime; owner
// 2026-11-06): content in school89.js, built by schoolLesson below.
// Pictures: public/kids-art/<id>.svg (scripts/kids-art.mjs) from engine/blocks/kidsPictures.js.
import { B } from '../blocks.js';
import { COLORING_PICTURES } from '../../../../worksheet-studio/engine/blocks/kidsPictures.js';
import { PROGRAM_56 } from './program56.js';
import { PROGRAM_67 } from './program67.js';
import { PROGRAM_89 } from './program89.js';
import { SCHOOL_89 } from './school89.js';

const pad = (n) => String(n).padStart(3, '0');
const block = (id, type, tone, goal, data, width = 'full') => ({ id, type, width, span: width === 'full' ? 12 : 6, tone, goal, data });
const art = (pic) => ({ src: `/kids-art/${pic}.svg` });
export const lessonIdOf = (program, index) => `${program.id}-${pad(index + 1)}`;

// the three sheets of a children's lesson (their own names instead of Avasta / Harjuta / Kasuta)
export const KIDS_PHASES = {
  discover: { label: '1 Tunnis: uued sõnad', slot: 1, subtitle: 'Laulame, kuulame ja õpime uusi sõnu.' },
  practice: { label: '2 Tunnis: harjutame', slot: 2, subtitle: 'Värvime, kirjutame ja mängime.' },
  transfer: { label: '3 Kodus vanemaga', slot: 3, subtitle: 'Kordame kodus koos emme või issiga.' },
};

// the 8–9 group reads and writes: its sheets are named like school work
export const SCHOOL_PHASES = {
  discover: { label: '1 Loeme', slot: 1, subtitle: 'Loeme teksti ja vastame küsimustele.' },
  practice: { label: '2 Harjutame keelt', slot: 2, subtitle: 'Märkame reeglit ja harjutame.' },
  transfer: { label: '3 Kirjutame ja räägime', slot: 3, subtitle: 'Kirjutame oma teksti ja räägime sellest — ka kodus.' },
};

const KIDS_GOALS = {
  g_vocab: 'Laps teab ja ütleb tunni sõnu.',
  g_read: 'Laps saab aru, mida kuuleb ja loeb.',
  g_notice: 'Laps tunneb tähti ja häälikuid ning kirjutab järele.',
  g_use: 'Laps kasutab õpitut mängus ja kodus.',
};

const words = (lesson) => lesson.words.map((w) => (Array.isArray(w) ? w[0] : w));
// the words that have a picture (each picture once): picture matching
const pictured = (lesson) => {
  const seen = new Set();
  return lesson.words.filter((w) => Array.isArray(w) && w[1] && COLORING_PICTURES[w[1]] && !seen.has(w[1]) && seen.add(w[1])).slice(0, 8);
};

const coloring = (id, [picture, colors], { free = false, title, instruction } = {}) => block(id, 'coloring', 'white', 'g_vocab', {
  title: title || (free ? 'Värvi pilt.' : 'Värvi numbrite järgi.'),
  instruction: instruction || (free ? 'Värvi pilt ilusaks ja ütle eesti keeles, mis see on.' : 'Vaata numbrit ja värvi selle värviga. Ütle värvi nimi eesti keeles.'),
  picture, mode: free ? 'free' : 'key', colors: free ? '' : (colors || []).join('\n'),
});
const tracing = (id, rows, title = 'Kirjuta järele.') => block(id, 'tracing', 'white', 'g_notice', {
  title, instruction: 'Vaata esimest. Kirjuta punktiirjoonel järele ja siis ise rea lõpuni.', rows: rows.map(([text, repeat]) => ({ text, repeat })),
});
const counting = (id, items) => block(id, 'counting', 'cream', 'g_vocab', {
  title: 'Loenda ja kirjuta.', instruction: 'Mitu on? Kirjuta number või ütle eesti keeles.', items: items.map(([icon, count]) => ({ icon, count })),
});
const letterhunt = (id, target, grid) => block(id, 'letterhunt', 'sky', 'g_notice', {
  title: `Leia täht ${target}.`, instruction: `Tee ring ümber iga tähe ${target} ja ${target.toLowerCase()}.`, target, caseSensitive: 'no', grid,
}, 'full');
const picmatch = (id, lesson) => block(id, 'picmatch', 'cream', 'g_vocab', {
  title: 'Ühenda sõna ja pilt.', instruction: 'Õpetaja või vanem loeb sõna. Kirjuta sõna kõrvale pildi täht.', columns: '4', aspect: '1:1',
  items: pictured(lesson).map(([word, pic]) => ({ img: art(pic), word })),
});
const certificate = (id, program) => B.text(id, 'TUNNISTUS', [
  '**________________________** (nimi)',
  `lõpetas KeeleSepa kursuse „${program.title}”.`,
  'Sa oskad nüüd eesti keeles tervitada, rääkida endast ja palju uusi sõnu. Tubli!',
  'Õpetaja: ________________    Kuupäev: ____________',
].join('\n\n'));
const parentsNote = (id, lesson, extra = '') => B.text(id, 'Vanemale · Родителям', [
  `**Сегодня на уроке:** ${lesson.ru}. ${lesson.home}`,
  ...(extra ? [extra] : []),
  `**Sõnad · слова:** ${words(lesson).join(', ')}.`,
  ...(lesson.phrases?.length ? [`**Laused · фразы:** ${lesson.phrases.join(' · ')}`] : []),
].join('\n\n'));

// a body picture with numbered places (lesson „Minu keha”)
const bodyLabels = (id) => block(id, 'scenelabel', 'sky', 'g_vocab', {
  title: 'Kirjuta pildile sõnad.', instruction: 'Vali sõna kastist ja kirjuta numbri juurde.', img: art('child'), aspect: '1:1',
  bank: 'pea, käsi, jalg, kõht', showBank: 'yes', columns: '2',
  pins: [{ x: 50, y: 22, answer: 'pea' }, { x: 22, y: 57, answer: 'käsi' }, { x: 41, y: 84, answer: 'jalg' }, { x: 50, y: 52, answer: 'kõht' }],
});

function youngLesson(program, lesson, index) {
  const id = lessonIdOf(program, index).replace(/-/g, '_');
  const reader = program.id === 'k67';
  const task = lesson.task?.type === 'letterhunt' ? letterhunt(`${id}_p_task`, lesson.task.target, lesson.task.grid) : counting(`${id}_p_task`, lesson.task?.items || [['⭐', 3]]);
  const discover = [
    B.text(`${id}_d_chant`, 'Laul ja luuletus', lesson.chant.join('\n\n')),
    B.vocab(`${id}_d_words`, 'Tunni sõnad', words(lesson), '3'),
    ...(pictured(lesson).length >= 3 ? [picmatch(`${id}_d_pics`, lesson)] : []),
    ...(lesson.intro ? [counting(`${id}_d_count`, lesson.intro)] : []),
    ...(lesson.scene ? [bodyLabels(`${id}_d_body`)] : []),
    ...(lesson.story ? [B.text(`${id}_d_story`, 'Kuula ja vaata: muinasjutt', lesson.story)] : []),
    ...(reader && lesson.read?.length ? [block(`${id}_d_read`, 'readcard', 'cream', 'g_read', { title: 'Loe valjusti.', instruction: 'Loe rida haaval. Näita sõrmega, mida loed.', lines: lesson.read.join('\n') })] : []),
  ];
  const practice = [
    coloring(`${id}_p_color`, lesson.color),
    tracing(`${id}_p_trace`, lesson.trace),
    task,
    ...(reader && lesson.gaps?.length ? [B.gaps(`${id}_p_gaps`, 'Kirjuta puuduv täht või sõna.', 'Loe sõna valjusti ja kirjuta, mis on puudu.', lesson.gaps, '', 'full', 'g_notice')] : []),
  ];
  const last = lesson.trace[lesson.trace.length - 1];
  const transfer = [
    parentsNote(`${id}_t_parents`, lesson),
    coloring(`${id}_t_color`, [lesson.color2 || lesson.color[0], []], { free: true }),
    tracing(`${id}_t_trace`, [[last[0], Math.min(6, last[1] + 2)]], 'Kirjuta kodus järele.'),
    ...(reader && lesson.phrases?.length ? [B.wordorder(`${id}_t_order`, 'Pane sõnad järjekorda.', 'Loe sõnad ja pane lause kokku.', lesson.phrases.filter((p) => p.split(' ').length >= 3).slice(0, 3).map((p) => p.replace(/[„”]/g, '')), 'full', 'g_use')] : []),
    ...(lesson.celebration ? [certificate(`${id}_t_cert`, program)] : []),
  ];
  return { discover, practice, transfer };
}

// The 8–9 group's three full sheets (owner 2026-11-06): content in school89.js, one entry per lesson of PROGRAM_89.
const SCHOOL_GOALS = {
  g_vocab: 'Laps teab ja kasutab tunni sõnu.',
  g_read: 'Laps loeb teksti ja vastab küsimustele.',
  g_notice: 'Laps märkab tunni keelereeglit ja kasutab seda harjutustes.',
  g_use: 'Laps kirjutab ja räägib oma teemal.',
};
const full = (b) => ({ ...b, width: 'full', span: 12 });
const wordsearch = (id, title, instruction, words, goal = 'g_vocab') => block(id, 'wordsearch', 'green', goal, { title, instruction, words: words.join(', '), size: 10 });
const picsOf = (id, [title, items]) => block(id, 'picmatch', 'cream', 'g_vocab', {
  title, instruction: 'Loe sõna. Kirjuta sõna kõrvale pildi täht.', columns: '4', aspect: '1:1', items: items.map(([word, pic]) => ({ img: art(pic), word })),
});
// one exercise of school89.js: ex(key, type, title, instruction, items, { bank, goal })
function exercise(id, e, lesson) {
  const { type, title, instruction, items } = e;
  const goal = (fallback) => e.goal || fallback;
  switch (type) {
    case 'gaps': return B.gaps(id, title, instruction, items, e.bank || '', 'full', goal('g_notice'));
    case 'choice': return B.choice(id, title, instruction, items, 'full', goal('g_notice'));
    case 'match': return B.match(id, title, instruction, items, 'full', goal('g_vocab'));
    case 'wordforms': return B.wordforms(id, title, instruction, items, 'full', goal('g_notice'));
    case 'transformation': return B.transformation(id, title, instruction, items, 'full', goal('g_notice'));
    case 'errorfix': return B.errorfix(id, title, instruction, items, 'full', goal('g_notice'));
    case 'categorize': return B.categorize(id, title, instruction, items, 'full', goal('g_vocab'));
    case 'wordorder': return B.wordorder(id, title, instruction, items, 'full', goal('g_notice'));
    case 'crossword': return B.crossword(id, title, instruction, items, 'full', goal('g_vocab'));
    case 'truefalse': return B.truefalse(id, title, instruction, items, 'full', goal('g_read'));
    case 'wordsearch': return wordsearch(id, title, instruction, items, goal('g_vocab'));
    case 'coloring': return coloring(id, lesson.color, { title, instruction });
    default: throw new Error(`${id}: tundmatu harjutus ${type}`);
  }
}

function schoolLesson(program, lesson, index) {
  const id = lessonIdOf(program, index).replace(/-/g, '_');
  const s = SCHOOL_89[index];
  if (!s) throw new Error(`${lessonIdOf(program, index)}: school89.js sisu puudub`);
  const [passageTitle, passage, questions] = s.reading;
  const [writeInstruction, keywords] = lesson.write;
  const discover = [
    B.tip(`${id}_d_warm`, 'Enne lugemist', s.warm, 'full'),
    B.vocab(`${id}_d_words`, 'Tunni sõnad · слова урока', s.vocab.join('\n'), '2'),
    picsOf(`${id}_d_pics`, s.pictures),
    B.reading(`${id}_d_read`, 'Loe teksti.', 'Loe tekst läbi. Vasta küsimustele lühidalt: üks või paar sõna.', passageTitle, passage, questions),
    B.truefalse(`${id}_d_tf`, 'Õige või vale?', 'Loe lauset. Märgi, kas see on teksti järgi õige või vale.', s.truefalse, 'full'),
    B.choice(`${id}_d_choice`, 'Vali õige vastus.', 'Vali iga küsimuse juurde vastus, mis sobib teksti järgi.', s.choice),
    B.notice(`${id}_d_rule`, `Keelekast: ${lesson.grammar}`, [...s.rule, `Подсказка: ${s.ru}`], 'full'),
    full(exercise(`${id}_d_use`, s.use, lesson)),
  ];
  const practice = [
    B.notice(`${id}_p_rule`, `Pea meeles: ${lesson.grammar}`, s.rule.slice(0, 3), 'full'),
    B.review(`${id}_p_review`, s.review),
    ...s.practice.map((e) => full(exercise(`${id}_p_${e.key}`, e, lesson))),
  ];
  const [modelTitle, modelText] = s.model;
  const transfer = [
    B.text(`${id}_t_model`, `Näidis: ${modelTitle}`, modelText),
    B.tip(`${id}_t_starters`, 'Lauseabi: alusta nii', s.starters, 'full'),
    B.planning(`${id}_t_plan`, 'Mõtle enne kirjutamist.', 'Vasta igale küsimusele paari sõnaga. Need on sinu teksti märksõnad.', s.plan, 1),
    B.writing(`${id}_t_write`, 'Kirjuta oma tekst.', writeInstruction, [5, 7], keywords, Math.min(2, keywords.length)),
    B.speaking(`${id}_t_talk`, 'Räägi umbes üks minut.', lesson.talk, s.talk, [45, 75], s.talkTip || 'Kasuta tunni sõnu ja oma teksti. Räägi tervete lausetega.'),
    parentsNote(`${id}_t_parents`, lesson, 'Дома: закончить упражнения листа 2, которые не успели на уроке, и дописать текст (5–7 предложений). Ребёнок рассказывает вам свой текст по-эстонски около минуты.'),
    ...(lesson.celebration ? [certificate(`${id}_t_cert`, program)] : []),
    B.selfcheck(`${id}_t_self`, s.self, 'Tubli töö!', 'Ma oskan'),
  ];
  return { discover, practice, transfer };
}

function moduleOf(program, build, phases = KIDS_PHASES, goals = KIDS_GOALS) {
  return {
    MODULE: { id: `${program.id}-module-01`, course: 'kids', title: program.title, level: program.level, supplement: true, phases },
    LESSONS: Object.fromEntries(program.lessons.map((lesson, index) => [lessonIdOf(program, index), {
      title: lesson.title, canDo: lesson.can, level: program.level, goals,
      // the 8–9 sheets are full lessons (owner 2026-11-06); the younger groups' sheets stay short
      ...(build === schoolLesson ? {} : { shortSheet: true }),
      ...build(program, lesson, index),
    }])),
  };
}

export const KIDS_PROGRAMS = [PROGRAM_56, PROGRAM_67, PROGRAM_89];
export const KIDS_MODULES = [moduleOf(PROGRAM_56, youngLesson), moduleOf(PROGRAM_67, youngLesson), moduleOf(PROGRAM_89, schoolLesson, SCHOOL_PHASES, SCHOOL_GOALS)];
