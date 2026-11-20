// „B1 eksperimentaalkursus” (course key b1eksp, owner 2026-11-20): an experimental A2 → B1 course — a chain of topics with
// smooth transitions (each topic leads into the next one), one recurring character, Markus. Every lesson has TWO sheets
// on one lesson record: the adult version („Täiskasvanu”) and the school pupil version („Laps”). They are stored in the
// existing phases — discover = Täiskasvanu, practice = Laps, no transfer (no Firestore rules change); the lesson record's
// `phaseLabels` (curriculum/b1ekspCurriculum.js) and MODULE.phaseLabels give them their names in the CRM.
// A separate course next to „Eesti keel B1” and „B1 noorkeele õppija”: staff see it in „Kursuse tootmine”, a teacher
// assigns a sheet by hand. It is not part of the strict course gates (strictModules.json, v4 / academic value / final
// shape): one sheet per learner group is not the Avasta / Harjuta / Kasuta lesson those gates measure.
// Module 1 „Tutvus” (b1eksp-001…002), stage A2. Each sheet has the same six steps:
//   1) picture + text  2) questions  3) words to the picture's numbers  4) the rule (+ gaps)
//   5) „Ja sina? Räägi” — about the learner, not about Markus  6) „Kirjuta endast” — 4–5 sentences
// Pictures: black-line placeholders in crm-v2/public/textbook-art/b1eksp/<nnn>-<adult|kid>.svg with the numbered markers
// the word task uses; the final art replaces the files under the same names. No dictation (B1–C1 rule).
import { B, teach } from '../blocks.js';

export const MODULE = {
  id: 'b1eksp-module-01',
  course: 'b1eksp',
  title: 'Tutvus',
  level: 'A2',
  // the course's own sheet names (courseSheet.js → meta.phaseLabel; the curriculum records copy them as phaseLabels)
  phaseLabels: { discover: 'Täiskasvanu', practice: 'Laps' },
  // the sheet header (meta.displayLabel / subtitle)
  phases: {
    discover: { label: 'Täiskasvanu', slot: 1, subtitle: 'Tunni leht täiskasvanud õppijale.' },
    practice: { label: 'Laps', slot: 2, subtitle: 'Tunni leht kooliõpilasele.' },
  },
  // one sheet is the whole lesson in a short format (about 30–40 min with talk): no 40–55 min Avasta norm
  shortSheets: true,
};

// a placeholder picture of the lesson inside the opening text (figureFloat.js: data.figures), full width above the text
const picture = (file, alt) => ({
  mode: 'float', img: { src: `/textbook-art/b1eksp/${file}.svg`, width: 900, height: 600, focus: { x: 50, y: 50 } },
  caption: '', alt, side: 'center', width: 100, at: 0, shape: 'rect', border: 'none', locked: false,
});
const withPicture = (block, file, alt) => ({ ...block, data: { ...block.data, figures: [picture(file, alt)] } });

// the six steps of one sheet
function sheet(id, { title, text, file, alt, questions, words, extra, rule, ruleGaps, speak, speakNote = '', phrases, write, notes }) {
  return [
    // 1) picture + text and 2) the questions: one reading block — the picture above the text, the questions under it
    withPicture(B.reading(`${id}_text`, 'Loe ja vaata pilti.', 'Loe teksti. Vasta küsimustele.', title, text, questions), file, alt),
    // 3) the picture's numbers; the word box has two extra words, so the last answer is not left over
    teach(B.gaps(`${id}_words`, 'Sõnad pildil.', 'Vaata pilti. Mis on numbri all? Kirjuta sõna kastist.', words.map(([n, word]) => `Number ${n} on [${word}].`),
      [...words.map(([, word]) => word.split('|')[0]), ...extra].sort((a, b) => a.localeCompare(b, 'et'))), notes.words),
    B.table(`${id}_rule`, rule.title, rule.instruction, rule.headers, rule.rows),
    teach(B.gaps(`${id}_rule_gaps`, 'Kirjuta õige vorm.', 'Kirjuta sulgudes olev sõna õiges vormis.', ruleGaps), notes.rule),
    teach(B.speaking(`${id}_speak`, 'Ja sina? Räägi.', speakNote ? `Räägi 2 minutit. ${speakNote}` : 'Räägi endast, mitte Markusest. Räägi umbes 2 minutit.', speak, [90, 120], phrases), notes.speak),
    teach(B.writing(`${id}_write`, 'Kirjuta endast.', write, [4, 5]), notes.write),
  ];
}

const BUS_RULE = (where) => ({
  title: 'Reegel. Kuhu? Millega?',
  instruction: 'Kuhu? — kuhu inimene sõidab. Millega? — mis sõidukiga (lõpp -ga).',
  headers: 'Kuhu?, Millega?',
  rows: [`${where} | bussiga`, 'kesklinna | rattaga', 'koju | autoga'],
});
const BUS_PHRASES = ['Ma sõidan … -ga.', 'Sõit kestab … minutit.', 'Bussis ma …', 'Aknast näen ma …'];
const BUS_NOTES = {
  words: 'Учитель: сначала устно — «Mis see on? Number üks on…». Слова повторяются во 2-м уроке (iste, aken) и в рассказе ученика.',
  rule: 'Учитель: Kuhu? — направление (tööle, kooli, kesklinna, koju — запомнить как слова), Millega? — окончание -ga. Не объяснять падежи по-научному; достаточно вопроса и примера из текста.',
  speak: 'Учитель: ученик говорит о себе, не о Маркусе. Один на один учитель задаёт вопросы как собеседник и в конце называет 1–2 ошибки в формах -ga / kuhu. Цель: 2 минуты связной речи.',
  write: 'Учитель: 4–5 предложений по образцу текста. Проверить: имя, возраст, kuhu + millega, что делает в дороге. Ошибки ученик исправляет сам, учитель отмечает только строку.',
};

const FAMILY_RULE = {
  title: 'Reegel. Kelle?',
  instruction: 'Kelle? — kelle pereliige või asi see on. Nimi saab sageli lõpu -e.',
  headers: 'Kes?, Kelle?',
  rows: ['Markus | Markuse', 'Kati | Kati', 'isa | isa', 'mina | minu', 'sina | sinu', 'tema | tema'],
};
const FAMILY_PHRASES = ['Minu peres on …', 'Minu ema / isa on …', 'Ma elan koos …', 'Õhtul me …'];
const FAMILY_NOTES = {
  words: 'Учитель: показать на картинку и спросить «Kes see on?». Слова семьи нужны в устной и письменной части.',
  rule: 'Учитель: Kelle? — родительный (omastav). Имена на согласную получают -e (Markuse), на гласную часто не меняются (Kati, Mia, Lisa). Местоимения: minu, sinu, tema — выучить наизусть.',
  speak: 'Учитель: тема семьи может быть личной. Если ученик не хочет говорить о семье, он рассказывает о друге или близком человеке — это написано в задании. Не расспрашивать дальше.',
  write: 'Учитель: 4–5 предложений о своей семье (или близком человеке). Проверить формы Kelle? (minu ema, Markuse naine) и глаголы в настоящем времени.',
};
const FAMILY_NOTE = 'Võid rääkida ka sõbrast või inimesest, kes on sulle lähedane.';

const LESSONS = {
  'b1eksp-001': {
    title: 'Markus bussis',
    canDo: 'Ma tutvustan ennast: nimi, vanus, kuhu ja millega ma sõidan.',
    discover: sheet('001_a', {
      title: 'Markus bussis',
      file: '001-adult',
      alt: 'Markus istub bussis akna all. Tal on ülikond, lips ja portfell. Aknast paistavad majad ja päike. Silt: Buss nr 17 · Kesklinn.',
      text: [
        'Tere! Minu nimi on Markus. Ma olen 34-aastane. Praegu istun ma bussis ja vaatan aknast välja. Ma sõidan tööle. Ma töötan kontoris kesklinnas.',
        'Iga hommik sõidan ma bussiga number 17, sest kesklinnas on raske parkida. Sõit kestab umbes kakskümmend minutit. Bussis ma kuulan muusikat või mõtlen, mida ma täna tegema pean. Aknast näen ma inimesi, kes kiirustavad, ja kohvikuid, mis just avatakse.',
      ].join('\n\n'),
      questions: [['Kes on pildil?', 'Markus'], ['Kuhu ta sõidab?', 'tööle|ta sõidab tööle|kesklinna']],
      words: [[1, 'aken'], [2, 'maja'], [3, 'päike'], [4, 'iste'], [5, 'portfell']],
      extra: ['auto', 'puu'],
      rule: BUS_RULE('tööle'),
      ruleGaps: ['Markus sõidab [bussiga] (buss).', 'Kolleeg sõidab [autoga] (auto).', 'Markus sõidab [kesklinna] (kesklinn).', 'Õhtul läheb ta [koju] (kodu).'],
      speak: ['Kuidas sina hommikul tööle sõidad?', 'Kui kaua sõit kestab?', 'Mida sa teed bussis või autos?', 'Mida sa näed aknast?'],
      phrases: BUS_PHRASES,
      write: 'Kirjuta 4–5 lauset nagu Markus: nimi, vanus, kuhu ja millega sa sõidad, mida sa teel teed.',
      notes: BUS_NOTES,
    }),
    practice: sheet('001_k', {
      title: 'Markus bussis',
      file: '001-kid',
      alt: 'Markus istub bussis akna all. Tal on kapuutsiga pusa ja seljakott. Aknast paistavad majad, päike ja ratturist sõber. Silt: Buss nr 17 · Kool.',
      text: [
        'Tere! Minu nimi on Markus. Ma olen 13-aastane ja käin seitsmendas klassis. Praegu istun ma bussis ja vaatan aknast välja. Ma sõidan kooli.',
        'Kool algab kell kaheksa, aga buss on alati natuke hiljem, sest hommikul on palju autosid. Sõit kestab viisteist minutit. Bussis ma kordan sõnu, sest täna on eesti keele kontrolltöö. Aknast näen ma oma sõpra Karlit, kes sõidab rattaga. Ta on alati kiirem kui buss!',
      ].join('\n\n'),
      questions: [['Kes on pildil?', 'Markus'], ['Kuhu ta sõidab?', 'kooli|ta sõidab kooli']],
      words: [[1, 'aken'], [2, 'maja'], [3, 'päike'], [4, 'iste'], [5, 'seljakott']],
      extra: ['auto', 'puu'],
      rule: BUS_RULE('kooli'),
      ruleGaps: ['Markus sõidab [bussiga] (buss).', 'Karl sõidab [rattaga] (ratas).', 'Markus sõidab [kooli] (kool).', 'Pärast kooli läheb ta [koju] (kodu).'],
      speak: ['Kuidas sina hommikul kooli sõidad?', 'Kui kaua sõit kestab?', 'Mida sa teed bussis või autos?', 'Mida sa näed aknast?'],
      phrases: BUS_PHRASES,
      write: 'Kirjuta 4–5 lauset nagu Markus: nimi, vanus, kuhu ja millega sa sõidad, mida sa teel teed.',
      notes: BUS_NOTES,
    }),
  },
  'b1eksp-002': {
    title: 'Markuse pere',
    canDo: 'Ma räägin oma perest: kes on peres, kui vanad nad on, mida nad teevad ja mida me koos teeme.',
    discover: sheet('002_a', {
      title: 'Markuse pere',
      file: '002-adult',
      alt: 'Markus, tema naine Kati, tütar Mia ja koer Muri seisavad koos.',
      text: [
        'Õhtul sõidab Markus bussiga koju. Kodus ootab teda pere. Markuse naine on Kati. Ta on 32-aastane. Ta on medõde ja töötab haiglas. Markuse ja Kati tütar on Mia. Mia on kuueaastane ja käib lasteaias.',
        'Peres on veel üks liige — koer Muri. Muri on vana ja laisk, aga väga sõbralik. Õhtul söövad nad koos õhtusööki ja räägivad, kuidas päev läks. Mia räägib alati kõige rohkem. Pärast sööki läheb Markus Muriga õue.',
      ].join('\n\n'),
      questions: [['Kes on Markuse naine?', 'Kati'], ['Kus Kati töötab?', 'haiglas'], ['Kui vana on Mia?', 'kuueaastane|kuus aastat vana|6-aastane|kuus']],
      words: [[1, 'Markus'], [2, 'naine Kati|Kati|naine'], [3, 'tütar Mia|Mia|tütar'], [4, 'koer Muri|Muri|koer']],
      extra: ['poeg', 'kass'],
      rule: FAMILY_RULE,
      ruleGaps: ['Kati on [Markuse] naine (Markus).', 'Mia on [Kati] tütar (Kati).', 'Muri on [Mia] parim sõber (Mia).', 'See on [minu] pere (mina).'],
      speak: ['Kes on sinu peres?', 'Kellega sa elad?', 'Mida te õhtul koos teete?'],
      speakNote: FAMILY_NOTE,
      phrases: FAMILY_PHRASES,
      write: 'Kirjuta 4–5 lauset oma perest: kes on peres, kui vana, mida nad teevad, mida te koos teete.',
      notes: FAMILY_NOTES,
    }),
    practice: sheet('002_k', {
      title: 'Markuse pere',
      file: '002-kid',
      alt: 'Markuse pere: isa, ema, Markus, väike õde Lisa ja vanaema.',
      text: [
        'Pärast kooli sõidab Markus bussiga koju. Kodus on isa, ema ja väike õde Lisa. Markuse isa on bussijuht! Mõnikord sõidab Markus isa bussiga kooli. Markuse ema töötab raamatukogus.',
        'Lisa on seitsmeaastane ja käib esimeses klassis. Ta küsib Markuselt kogu aeg midagi. Nendega koos elab ka vanaema. Vanaema teeb kõige paremaid pannkooke. Õhtul söövad nad kõik koos ja räägivad, kuidas päev läks.',
      ].join('\n\n'),
      questions: [
        ['Kes elavad Markusega koos?', 'isa, ema, Lisa ja vanaema|isa, ema, Lisa, vanaema|isa, ema, õde Lisa ja vanaema|isa, ema, Lisa ja vanaema elavad Markusega koos'],
        ['Kes on Markuse isa?', 'bussijuht|ta on bussijuht'],
        ['Kui vana on Lisa?', 'seitsmeaastane|seitse aastat vana|7-aastane|seitse'],
      ],
      words: [[1, 'isa'], [2, 'ema'], [3, 'Markus'], [4, 'õde Lisa|Lisa|õde'], [5, 'vanaema']],
      extra: ['vend', 'vanaisa'],
      rule: FAMILY_RULE,
      ruleGaps: ['Lisa on [Markuse] õde (Markus).', 'Markus on [Lisa] vend (Lisa).', 'Vanaema on [isa] ema (isa).', 'See on [minu] pere (mina).'],
      speak: ['Kes on sinu peres?', 'Kes sinu peres teeb kõige paremat sööki?', 'Kellega sa räägid kõige rohkem ja miks?'],
      speakNote: FAMILY_NOTE,
      phrases: FAMILY_PHRASES,
      write: 'Kirjuta 4–5 lauset oma perest: kes on peres, kui vana, mida nad teevad, mida te koos teete.',
      notes: FAMILY_NOTES,
    }),
  },
};

export { LESSONS };
