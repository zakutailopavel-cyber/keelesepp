// „Suuline osa” (owner 2026-11-01): a 45-minute speaking lesson built on the claim → explanation → example → conclusion
// scheme, first made as a personal C1 sheet for a learner. Everything is done aloud in the lesson with the teacher as the
// partner; only the last block, the homework, is written. A supplement per level (a2/, b1/, b2/ suuline.js).
// Five claims with fading support: 1–2 guiding questions + words, 3–4 words only, 5 nothing. 5 min scheme and model,
// 8 min a claim (think, speak, answer the teacher's counter-question, say it again better).
import { B, teach } from './blocks.js';

const NB = 'Pärast sõnu *Näiteks, Seega, Järelikult* tuleb verb kohe teisele kohale: *Seega **tasub** proovida.*';

const claim = (id, n, { text, q, words, counter }, level) => {
  const task = B.speaking(`${id}_v${n}`, `${n}. Väide: ${text}`, words ? `Mõtle 1 minut, räägi ${level.talk}. Siis vasta õpetajale ja ütle mõte paremini.` : `Mõtle 1 minut, räägi ${level.talk} ilma vihjeteta. Siis vasta õpetajale.`,
    q ? [`**Selgitus:** ${q[0]}`, `**Näide:** ${q[1]}`, `**Järeldus:** ${q[2]}`] : [], level.seconds, words ? words.split(', ') : '', 'g_talk');
  return { ...teach(task, `Pärast vastust küsi: „${counter}” Seejärel palu tal sama mõte selgemini uuesti öelda (kokku umbes 8 minutit).`), inLesson: true };
};

// level: { talk, seconds, links: { why, example, end }, homework: { words, instruction, sentences } }
export function oralLesson(id, level, { title, canDo, model, claims }) {
  const [v, s, n, j] = model;
  return {
    oral: true,
    title,
    canDo,
    goals: { g_talk: 'Jätkan väidet suuliselt skeemi järgi: selgitus, näide, järeldus.', g_write: 'Kasutan sama skeemi kirjutades.' },
    practice: [
      B.notice(`${id}_skeem`, 'Skeem', [
        '**Väide:** mida ma väidan? See on sul juba olemas.',
        `**Selgitus:** miks see nii on? *${level.links.why}*`,
        `**Näide:** kuidas see elus välja näeb? *${level.links.example}*`,
        `**Järeldus:** mis sellest järeldub? *${level.links.end}*`,
      ], 'full', 'g_talk'),
      B.text(`${id}_naidis`, 'Näidis', `**Väide:** ${v}\n\n**Selgitus:** ${s}\n\n**Näide:** ${n}\n\n**Järeldus:** ${j}`),
      B.notice(`${id}_nb`, 'NB!', [NB], 'full', 'g_talk'),
      ...claims.map((c, i) => claim(id, i + 1, c, level)),
      B.selfcheck(`${id}_kontroll`, [
        'Selgitasin, miks väide kehtib.',
        'Minu näide oli konkreetne, mitte teine üldine väide.',
        'Järeldus tulenes selgitusest ja näitest.',
        'Verb oli teisel kohal pärast *Näiteks* ja *Seega*.',
      ], 'Mõttekäik on selge!', 'Pärast rääkimist'),
      { ...teach(B.writing(`${id}_kodutoo`, `Kodutöö: kirjuta arvamus (${level.homework.words} sõna).`, level.homework.instruction, level.homework.sentences, [], 0, 'g_write'),
        'Hinda iga punkti 0–2: selgitus vastab küsimusele „miks?”; näide on konkreetne; järeldus tuleneb öeldust; tekst on sidus ja sõnajärg õige.'),
      tone: 'white', look: { frame: 'dashed', icon: 'write', head: 'tab', num: 'outline' } },
    ],
  };
}
