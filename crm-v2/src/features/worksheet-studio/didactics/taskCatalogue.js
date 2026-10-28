// The task-type catalogue of the B1 course final shape (docs/COURSE_FINAL_SHAPE_B1.md §3) as data, and how a course
// block gets its catalogue id, Harno format and cognitive level (§9 item 1). Pure and node-importable (no JSX): the
// gates (finalShape.js), the course builders (admin/course/blocks.js) and the summary tool share it.
//
// A block may carry `tag: { task, harno, level, fluency, main, corner }` (B.tag / tag() in admin/course/blocks.js). Without
// `tag.task` the default of its block type applies (DEFAULT_TASK); without `tag.level` the catalogue's level.

// skill groups
export const SKILLS = { R: 'Lugemine', L: 'Kuulamine', W: 'Kirjutamine', S: 'Rääkimine', G: 'Keel (grammatika ja sõnavara)' };

// id → { name, skill, level (1 recognise · 2 controlled · 3 guided production · 4 free production / negotiate),
// exam: Harno task ids it prepares (§2.2), min/max per module (over the module's teaching lessons; null = no bound) }
const t = (name, level, exam, min, max) => ({ name, level, exam, min, max });
export const TASK_CATALOGUE = Object.freeze({
  // 3.1 Reading
  R01: t('Olukorrad ja kuulutused', 2, ['R1'], 0, 1),
  R02: t('Artikkel + valikvastused', 2, ['R2'], 0, 1),
  R03: t('Valikvastustega lünktekst', 2, ['R3a'], 0, 1),
  R04: t('Sõnapangaga lünktekst', 2, ['R3b'], 0, 1),
  R05: t('Fraasipank tekstis', 3, ['R4'], 0, 1),
  R06: t('Õige, vale või ei selgu', 2, ['L4'], 0, 1),
  R07: t('Sildid ja teated', 1, ['R1'], 0, 1),
  R08: t('Sõiduplaan, hinnakiri, tabel', 2, ['R1', 'L3b'], 0, 1),
  R09: t('Pealkiri lõigule', 2, ['R2'], 0, 1),
  R10: t('Lõigud õiges järjekorras', 3, ['R4', 'W2'], 0, 1),
  R11: t('Profiilid ja valik', 3, ['R1', 'S1b'], 0, 1),
  R12: t('Sõnumilõim', 2, ['W1b'], 0, 1),
  R13: t('Ennusta ja kontrolli', 2, ['R2'], 0, 1),
  // 3.2 Listening
  L01: t('Lühikesed klipid + pilt/sõna', 1, ['L1'], 0, 1),
  L02: t('Raadiolugu + valikvastused', 2, ['L2'], 0, 1),
  L03: t('Lühivastus 1–2 sõnaga', 2, ['L3a'], 0, 1),
  L04: t('Lünklaused kuulamise järgi', 2, ['L3b'], 0, 1),
  L05: t('Intervjuu: õige või vale', 2, ['L4'], 0, 1),
  L06: t('Teadaanne → tegevus', 2, ['L1', 'L3a'], 0, 1),
  L07: t('Telefonisõnum → märge', 3, ['L3a', 'S2', 'W1b'], 0, 1),
  L08: t('Dikteerimine / taastamine', 2, ['L3a'], 0, 2),
  L09: t('Kuula ja järjesta', 2, ['L2'], 0, 1),
  L10: t('Numbrid, ajad, hinnad', 1, ['L1', 'L3b'], 0, 1),
  // 3.3 Writing
  W01: t('Küsimustik (10 vastust, osa „Miks?”)', 3, ['W1a'], 0, 1),
  W02: t('Teade / sõnum (≈ 50 sõna, 4 punkti)', 3, ['W1b'], 0, 1),
  W03: t('Kutse või kaart', 3, ['W1b'], 0, 1),
  W04: t('Isiklik kiri (≈ 100 sõna)', 4, ['W2b'], 0, 1),
  W05: t('Jutt etteantud pealkirjaga', 4, ['W2a'], 0, 1),
  W06: t('Lugu piltide järgi', 3, ['W2a'], 0, 1),
  W07: t('Blankett / vorm', 2, ['W1a'], 0, 1),
  W08: t('Vastus kirjale või kuulutusele', 3, ['W2b', 'W1b'], 0, 1),
  W09: t('Lausete ühendamine', 2, ['W2', 'R4'], 0, 1),
  W10: t('Toimeta oma teksti', 3, ['W2'], 0, 1),
  W11: t('Plaan enne kirjutamist', 3, ['W2'], 0, 1),
  W12: t('Teisele adressaadile ümber', 3, ['W1b'], 0, 1),
  // 3.4 Speaking
  S01: t('Tutvustav vestlus', 3, ['S0'], 0, 1),
  S02: t('Teemaküsimused', 3, ['S1a'], 1, 2),
  S03: t('Kokkulepe ideekaardiga', 4, ['S1b'], 1, 2),
  S04: t('Telefonikõne asutusse', 4, ['S2'], 1, 2),
  S05: t('Infolünk', 3, ['S2'], 0, 1),
  S06: t('Pildi kirjeldus ja võrdlus', 3, ['S1a'], 0, 1),
  S07: t('Jutusta, mis juhtus', 3, ['S1a', 'W2a'], 0, 1),
  S08: t('4-3-2 kordus', 3, [], 0, 1),
  S09: t('Küsitle ja anna ülevaade', 3, ['S1a', 'W1a'], 0, 1),
  S10: t('Kaebus või probleem teenindajaga', 4, ['S2'], 0, 1),
  S11: t('Arvamus ja põhjendus', 3, ['S1a', 'S1b'], 0, 1),
  S12: t('Järjesta ja vali', 4, ['S1b'], 0, 1),
  S13: t('Seleta sõbrale', 3, ['S2'], 0, 1),
  // „Mida sa teeksid?” — a dilemma or problem situation answered with tingiv kõneviis (from module 13, finalShape V16)
  S14: t('Mida sa teeksid?', 4, ['S1a', 'S1b'], 0, 1),
  // the learner records it at home, one in every teaching lesson's Kasuta (finalShape V16); the pair tasks stay in the lesson
  S15: t('Kodune monoloog (salvestus)', 3, ['S1a'], 0, 4),
  // 3.5 Language
  G01: t('Märka', 1, [], 2, 4),
  G02: t('Leia reegel', 2, ['R3'], 1, 2),
  G03: t('Vormid tekstis', 2, ['R3'], 0, 2),
  G04: t('Sorteeri', 2, ['R3', 'R4'], 0, 2),
  G05: t('Teisenda', 2, [], 0, 2),
  G06: t('Paranda viga', 2, ['W2'], 0, 2),
  G07: t('Sõnajärg', 2, [], 0, 1),
  G08: t('Rektsioon ja ühendid', 2, ['R3', 'R4'], 0, 2),
  G09: t('Sõnamoodustus', 2, ['R3'], 0, 1),
  G10: t('Tõlgi mõte', 2, [], 0, 1),
  G11: t('Ristsõna / sõnamäng', 1, [], 0, 1),
  // G12 „Mäletad?” is in every lesson and is not counted as a task
  G12: t('Mäletad?', 2, [], null, null),
  G13: t('Vali õige vorm', 1, ['R3a'], 0, 2),
});
export const skillOf = (id) => String(id || '').charAt(0);
export const isCatalogueId = (id) => Object.prototype.hasOwnProperty.call(TASK_CATALOGUE, id);

// Harno B1 task ids (§2.2) and their exam part; a family groups the variants for coverage counts (§6.4)
export const HARNO_FORMATS = Object.freeze({
  W1a: 'W', W1b: 'W', W2a: 'W', W2b: 'W',
  L1: 'L', L2: 'L', L3a: 'L', L3b: 'L', L4: 'L',
  R1: 'R', R2: 'R', R3a: 'R', R3b: 'R', R4: 'R',
  S0: 'S', S1a: 'S', S1b: 'S', S2: 'S',
});
export const isHarnoFormat = (id) => Object.prototype.hasOwnProperty.call(HARNO_FORMATS, id);
// W1a / W1b → W1, L3a / L3b → L3, R3a / R3b → R3; S1a, S1b, S2 stay apart (§6.4 counts them apart)
export const harnoFamily = (id) => (/^(W1|W2|L3|R3)[ab]$/.test(id) ? id.slice(0, -1) : id);

// the block types that are not tasks for the variety rules (§8: text, tip, vocab, phrase bank, review, rubric, self-check,
// notice; notice counts as G01 only for V3) — plus pictures, charts and the exam part header
export const NON_TASK_TYPES = new Set(['text', 'tip', 'vocab', 'phrasebank', 'rubric', 'examrubric', 'selfcheck', 'notice', 'image', 'chart', 'exampart', 'heading']);

// default catalogue id of a block without a tag (§3 notes: one block type can host several catalogue types; a tag wins)
const DEFAULT_BY_TYPE = {
  reading: 'R02', cloze: 'R03', insertion: 'R05', truefalse: 'R06', manymatch: 'R07', adsmatch: 'R01', profiles: 'R11', dialogue: 'R12',
  listening: 'L04', dictation: 'L08',
  writing: 'W05', planning: 'W11', transformation: 'G05',
  speaking: 'S02', rolecards: 'S05', picrows: 'S06',
  notice: 'G01', table: 'G02', diagram: 'G02', formtext: 'G03', gaps: 'G03', categorize: 'G04', errorfix: 'G06', wordorder: 'G07',
  match: 'G08', wordforms: 'G09', translation: 'G10', crossword: 'G11', wordsearch: 'G11', picmatch: 'G11', scenelabel: 'G11', pictures: 'G11',
  choice: 'G13', clock: 'G13',
};
const WRITING_GENRE_TASK = { kusimustik: 'W01', teade: 'W02', kutse: 'W03', kiri: 'W04', jutt: 'W05', vastus: 'W08' };
export function defaultTaskId(block) {
  const d = block?.data || {};
  switch (block?.type) {
    case 'tip': return d.review ? 'G12' : null;
    case 'guidedletter': return (Number(d.maxWords) || 0) <= 70 ? 'W02' : 'W04';
    case 'examwriting': return WRITING_GENRE_TASK[d.genre] || 'W02';
    case 'examlisten': return d.mode === 'truefalse' ? 'L05' : d.mode === 'match' ? 'L09' : 'L02';
    case 'speakcard': return d.mode === 'phone' ? 'S04' : 'S03';
    default: return DEFAULT_BY_TYPE[block?.type] || null;
  }
}
// the catalogue id of a block: its tag, else the default of its type (null for non-tasks)
export const taskIdOf = (block) => block?.tag?.task || defaultTaskId(block);
// the cognitive level 1–4: the tag, else the catalogue's level
export const taskLevelOf = (block) => Number(block?.tag?.level) || TASK_CATALOGUE[taskIdOf(block)]?.level || null;
export const harnoOf = (block) => block?.tag?.harno || null;
// a review block („Mäletad?”, B.review)
export const isReview = (block) => Boolean(block?.data?.review);
// a task for the variety rules (§8): a known block that is not text, tip, vocab, … and not a review
export const isFinalShapeTask = (block) => Boolean(block) && !NON_TASK_TYPES.has(block.type) && !isReview(block) && Boolean(taskIdOf(block));

// Lesson archetypes (§4): code → { name, input skills, output skills } (EKS / PROOV = assessment, no lead)
export const ARCHETYPES = Object.freeze({
  LUGU: { name: 'Loo tund', input: ['R', 'L'], output: ['W', 'S'] },
  PROB: { name: 'Probleemi tund', input: ['L', 'R'], output: ['S'] },
  KUUL: { name: 'Kuulamise tund', input: ['L'], output: ['S', 'W'] },
  LUGE: { name: 'Lugemise tund', input: ['R'], output: ['S', 'W'] },
  RÄÄK: { name: 'Rääkimise tund', input: ['L', 'R'], output: ['S'] },
  KIRJ: { name: 'Kirjutamise töötuba', input: ['R', 'L'], output: ['W'] },
  AVAS: { name: 'Avastamise tund (TTT)', input: ['R', 'L'], output: ['S', 'W'] },
  PROJ: { name: 'Projektitund', input: ['R', 'L'], output: ['W', 'S'] },
  EKS: { name: 'Mooduli eksam', input: [], output: [] },
  PROOV: { name: 'Proovieksam', input: [], output: [] },
});
export const TEACHING_ARCHETYPES = ['LUGU', 'PROB', 'KUUL', 'LUGE', 'RÄÄK', 'KIRJ', 'AVAS', 'PROJ'];
// §6.2 marks a RÄÄK / KIRJ with the „other” input with *: allowed, so the lead table only checks the output skill strictly
export const LEAD_PAIRS = ['L→S', 'L→W', 'R→S', 'R→W'];

// §6.3: the module in which each B1 format is first taught; §6.4: how often it must be practised before 090
export const FORMAT_INTRO = Object.freeze({ W1b: 4, S2: 4, W2a: 5, L1: 5, R1: 6, S1a: 6, L3a: 7, W1a: 7, R2: 8, L2: 8, R3a: 9, S1b: 9, R4: 10, L4: 10, W2b: 10, R3b: 11, L3b: 11 });
const p = (exam, corner, total, gap) => ({ exam, corner, total, gap });
export const FORMAT_PRACTICE = Object.freeze({
  R1: p(6, 4, 10, 3), R2: p(6, 4, 10, 3), R3: p(6, 4, 10, 3), R4: p(6, 4, 10, 3),
  L1: p(6, 4, 10, 3), L2: p(6, 4, 10, 3), L3: p(6, 4, 10, 3), L4: p(6, 4, 10, 3),
  W1: p(6, 3, 9, 3), W2: p(6, 4, 10, 3),
  S1a: p(6, 5, 11, 2), S1b: p(6, 5, 11, 2), S2: p(6, 5, 11, 2),
});
export const VARIANT_MIN = 3; // W1a, W1b, W2a, W2b, L3a, L3b, R3a, R3b ≥ 3 each
export const VARIANTS = ['W1a', 'W1b', 'W2a', 'W2b', 'L3a', 'L3b', 'R3a', 'R3b'];
