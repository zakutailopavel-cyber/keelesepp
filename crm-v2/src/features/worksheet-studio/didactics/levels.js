// Didactic norms per level, as data (docs/DIDACTIC_ENGINE.md). One source for the constructor's check, the generator's
// self-check and the prompts of the local models. Reading and writing lengths, speaking time and the word bank follow
// Harno's level exams (HARNO below, docs/HARNO_LEVEL_REQUIREMENTS.md); sentence length, items per task, closed-task share,
// instruction length and the stages A2+ / B1- / B1+ / B2- are KeeleSepp's own norms (docs/CEFR_A2_B1_LEARNING_STANDARD.md).
// Numbers are norms for a worksheet task, not for a whole course.

export const LEVEL_ORDER = ['A1', 'A2', 'A2+', 'B1-', 'B1', 'B1+', 'B2-', 'B2', 'C1'];

// sentence: average / longest sentence in words; items: answers per closed task; reading: passage words and questions;
// writing: sentences (or words from B1); speaking: seconds of one learner's talk (the exam monologue is short: B2 1 min,
// C1 2 min; a discussion is longer); bank: word bank in gap tasks — yes (a bank of words helps), tip (give base forms),
// extra (a bank is fine when it holds more options than gaps, as in Harno's B1/B2 tasks);
// closedShare: the most a sheet should consist of recognition tasks (true/false, matching, choice);
// instructionWords: the longest instruction a learner of this level reads alone.
export const LEVELS = Object.freeze({
  A1: {
    label: 'A1', sentence: { avg: 7, max: 11 }, items: [3, 6], reading: { words: [30, 120], questions: [3, 6], inference: false },
    writing: { sentences: [3, 5] }, speaking: [30, 60], bank: 'yes', closedShare: 0.8, instructionWords: 10, example: 'yes',
    can: 'Tutvustab ennast, küsib ja vastab lihtsate fraasidega tuttavatel teemadel; loeb lühikesi silte ja teateid.',
  },
  A2: {
    label: 'A2', sentence: { avg: 9, max: 14 }, items: [4, 8], reading: { words: [80, 200], questions: [4, 7], inference: false },
    writing: { sentences: [4, 8] }, speaking: [45, 120], bank: 'yes', closedShare: 0.7, instructionWords: 14, example: 'yes',
    can: 'Kirjeldab oma päeva, peret ja ümbrust lihtsate seotud lausetega; saab hakkama igapäevaste olukordadega.',
  },
  'A2+': {
    label: 'A2+', sentence: { avg: 10, max: 16 }, items: [5, 8], reading: { words: [120, 250], questions: [4, 7], inference: false },
    writing: { sentences: [6, 10] }, speaking: [60, 120], bank: 'tip', closedShare: 0.6, instructionWords: 16, example: 'tip',
    can: 'Jutustab lühidalt, põhjendab ja valib vormi ise; kontrollitud valik nõuab vormi- või tähendusotsust.',
  },
  'B1-': {
    label: 'A2+/B1-', sentence: { avg: 11, max: 18 }, items: [5, 10], reading: { words: [150, 320], questions: [5, 8], inference: true },
    writing: { sentences: [8, 12] }, speaking: [90, 180], bank: 'tip', closedShare: 0.5, instructionWords: 20, example: 'no',
    can: 'Võrdleb, lahendab probleeme, parafraseerib; räägib 2–3 minutit seotult.',
  },
  B1: {
    label: 'B1', sentence: { avg: 13, max: 22 }, items: [5, 10], reading: { words: [200, 400], questions: [5, 8], inference: true },
    writing: { sentences: [6, 12], words: [50, 120] }, speaking: [120, 240], bank: 'extra', closedShare: 0.45, instructionWords: 25, example: 'no',
    can: 'Kirjutab ja räägib iseseisvalt selge ülesehitusega; järeldab, sõnastab ümber ja kannab üle uude olukorda.',
  },
  // B1 → B2 course stages (roadmap levelStage B1+ and B1+/B2- / B2-), between the B1 and B2 profiles
  'B1+': {
    label: 'B1+', sentence: { avg: 14, max: 24 }, items: [6, 10], reading: { words: [250, 500], questions: [5, 8], inference: true },
    writing: { words: [100, 160] }, speaking: [120, 240], bank: 'extra', closedShare: 0.4, instructionWords: 30, example: 'no',
    can: 'Arutleb tuttavatel teemadel, võrdleb ja põhjendab; kirjutab seotud teksti, ametliku kirja ja lühikese arvamusloo.',
  },
  'B2-': {
    label: 'B2-', sentence: { avg: 15, max: 26 }, items: [6, 12], reading: { words: [300, 600], questions: [5, 10], inference: true },
    writing: { words: [120, 180] }, speaking: [60, 180], bank: 'extra', closedShare: 0.38, instructionWords: 32, example: 'no',
    can: 'Esitab ja kaitseb seisukohta, kaalub poolt- ja vastuargumente; mõistab probleemartikleid ja pikemaid intervjuusid.',
  },
  // B2 after Harno's B2 exam: writing ~140 words (letter / explanation) and ~180 words (argument with pros and cons),
  // long problem articles in reading, a prepared speech at a meeting and a discussion with argument cards
  B2: {
    label: 'B2', sentence: { avg: 16, max: 28 }, items: [6, 12], reading: { words: [350, 700], questions: [5, 10], inference: true },
    writing: { words: [120, 200] }, speaking: [60, 180], bank: 'extra', closedShare: 0.35, instructionWords: 35, example: 'no',
    can: 'Arutleb, kaalub plusse ja miinuseid, kirjutab arutleva teksti; mõistab keerukamaid tekste.',
  },
  C1: {
    label: 'C1', sentence: { avg: 19, max: 40 }, items: [6, 12], reading: { words: [400, 650], questions: [5, 10], inference: true },
    writing: { words: [180, 260] }, speaking: [90, 180], bank: 'extra', closedShare: 0.25, instructionWords: 45, example: 'no',
    can: 'Väljendab end vabalt ja täpselt, valib registri ja stiili; mõistab pikki ja implitsiitseid tekste.',
  },
  // Estonian as a mother tongue (docs/NATIVE_ESTONIAN_9_12_PLAN.md): school grades, not CEFR levels. The norms follow
  // Harno's exam descriptions 2026/2027: grade 9 reads texts up to 800 words and writes a narrative-argumentative text of
  // at least 200 words; grade 12 reads up to 1000 words, answers in 50–100 words and writes an essay of about 400 words.
  // Neither exam has a speaking part; translation into Estonian does not belong here.
  EK9: {
    label: '9. klass emakeel', sentence: { avg: 14, max: 28 }, items: [6, 12], reading: { words: [400, 800], questions: [5, 10], inference: true },
    writing: { words: [200, 300] }, speaking: [60, 180], bank: 'extra', closedShare: 0.35, instructionWords: 35, example: 'no',
    can: 'Mõistab ja tõlgendab ilukirjandus-, tarbe-, teabe- ja meediatekste; kirjutab sidusa jutustava-arutleva teksti ja järgib õigekirja põhireegleid.',
  },
  EK12: {
    label: '12. klass emakeel', sentence: { avg: 17, max: 34 }, items: [6, 12], reading: { words: [600, 1000], questions: [3, 6], inference: true },
    writing: { words: [400, 450] }, speaking: [90, 180], bank: 'extra', closedShare: 0.25, instructionWords: 45, example: 'no',
    can: 'Analüüsib ja hindab kriitiliselt avalikke tekste, seob mitme teksti teavet ning kirjutab umbes 400-sõnalise arutleva kirjandi normikirjakeeles.',
  },
});

// a school grade of the mother-tongue course („9. klass emakeel”, „9. klass”, „EK9”) → its LEVELS key, else ''
export function nativeStage(value) {
  const v = String(value || '').toUpperCase().replace(/\s+/g, '');
  const grade = v.match(/^EK(\d+)$/)?.[1] || v.match(/^(\d+)\.?KL(ASS)?(EMAKEEL)?$/)?.[1];
  if (grade === '9') return 'EK9';
  if (grade === '12') return 'EK12';
  return '';
}

// Harno's level exams (harno.ee, consultation booklets; docs/HARNO_LEVEL_REQUIREMENTS.md): what a course must train
// toward. longestText: the longest reading text of the exam (words); writing: the exam's writing tasks (words);
// monologue: seconds of the prepared talk; options: answer options in a choice gap; listening: the exam has a listening
// part (every level does). A module of a course is checked against the exam of its stage (HARNO_FOR).
export const HARNO = Object.freeze({
  A2: { level: 'A2', longestText: 150, writing: [[25, 40], [30, 50]], monologue: 60, options: 3, listening: true },
  B1: { level: 'B1', longestText: 250, writing: [[40, 60], [90, 120]], monologue: 90, options: 3, listening: true },
  B2: { level: 'B2', longestText: 550, writing: [[120, 160], [160, 200]], monologue: 60, options: 4, listening: true },
  C1: { level: 'C1', longestText: 575, writing: [[160, 200], [220, 260]], monologue: 120, options: 4, listening: true },
  // mother tongue: põhikooli lõpueksam and riigieksam (eristuskirjad 2026/2027) — written exams, no listening or speaking
  EK9: { level: '9. klass emakeel', longestText: 800, writing: [[200, 300]], monologue: 0, options: 3, listening: false },
  EK12: { level: '12. klass emakeel', longestText: 1000, writing: [[400, 450]], monologue: 0, options: 4, listening: false },
});
// the exam a stage prepares for (A2+ still meets the A2 exam; B1- already reads toward B1)
const HARNO_STAGE = { EK9: 'EK9', EK12: 'EK12', A1: 'A2', A2: 'A2', 'A2+': 'A2', 'B1-': 'B1', B1: 'B1', 'B1+': 'B1', 'B2-': 'B2', B2: 'B2', C1: 'C1' };
export const harnoFor = (value) => HARNO[HARNO_STAGE[levelKey(value)]];

// Grammar of Estonian as a second language, by the level where it becomes a target (what is earlier is known; what is
// later is too early as a target, though it may appear as a fixed phrase). Used by the generator's planner and the
// prompts; a worksheet's own grammar is not machine-detected yet (that needs a morphological analyser, step 2).
export const GRAMMAR = Object.freeze({
  A1: ['olevik (ma-, sa-, ta-vormid)', 'eitus (ei, ära)', 'küsimused (kas, kes, mis, kus, kuhu, kust)', 'mul on / mul ei ole', 'ainsuse omastav', 'ainsuse osastav (arvsõnaga, eitusega)', 'kohakäänded: -s, -sse, -st', 'arvud ja kell', 'isikulised asesõnad'],
  A2: ['lihtminevik', 'mitmuse nimetav', 'kohakäänded: -l, -le, -lt', 'ma-infinitiiv ja da-infinitiiv', 'modaalverbid (pean, võin, saan, tahan, oskan)', 'käskiv kõneviis (sa-vorm)', 'omadussõna ühildumine', 'keskvõrre (suurem kui)', 'kaassõnad (enne, pärast, juures)', 'sidesõnad (et, sest, aga, kui)'],
  'A2+': ['mitmuse osastav (sagedased sõnad)', 'täisminevik', 'kaudsed küsimused (kas, kus …)', 'sihitise käänded (täis- ja osasihitis)', 'ülivõrre', 'ühendverbid (ära, ette, kaasa)'],
  'B1-': ['enneminevik', 'tingiv kõneviis (oleks, tahaksin)', 'mitmuse omastav', 'kesksõnad (-v, -nud, -tud) omadussõnana', 'des-vorm', 'rektsioon (huvitub millest, sõltub millest)'],
  B1: ['umbisikuline tegumood olevikus ja minevikus', 'kaudne kõne', 'mitmuse käänded tervikuna', 'tingiva kõneviisi minevik', 'mas-, mast-, maks-, mata-vorm', 'põhjust ja tingimust väljendavad laused'],
  'B1+': ['umbisikuline tegumood kõigis aegades', 'kaudne kõne (et-lause, ütles, et…)', 'mas-, mast-, maks-, mata-vorm', 'täis- ja osasihitis keerukamates lausetes', 'rektsioon (sõltuma millest, nõustuma millega)', 'sidesõnad (kuigi, seetõttu, samas, pigem)'],
  'B2-': ['kaudne kõneviis (-vat)', 'kesksõnad (-v, -tav, -nud, -tud) laiendina', 'des-vorm lauselühendina', 'nominaliseerimine (-mine, -us)', 'sidusvahendid (esiteks, teisalt, seega, kokkuvõttes)', 'tingiv kõneviis minevikus (oleksin teinud)'],
  B2: ['kaudne kõneviis (-vat)', 'umbisikulise tegumoe kõik ajad', 'nominaliseerimine (-mine, -us)', 'keerukad lauselühendid', 'sidusvahendid tekstis', 'registri valik (ametlik / igapäevane)'],
  C1: ['stiil ja register', 'idioomid ja püsiühendid', 'implitsiitne tähendus ja hinnangud', 'keerukas lause- ja tekstiehitus', 'termini- ja ametikeel'],
  // mother tongue, III kooliaste („Õigekeelsus ja keelehoole”, PRÕK 2011 lisa 1, the topics Harno's grade 9 exam uses)
  EK9: ['häälikuõigekiri (kaashäälikuühend, g/k/b/p/d/t, h, i/j, võõrsõnad)', 'poolitamine', 'algustäheõigekiri', 'kokku- ja lahkukirjutamine', 'veaohtlikud käände- ja pöördevormid, astmevaheldus', 'arvude ja lühendite kirjutamine', 'lauseliikmed ja koondlause', 'rind-, põim- ja segaliitlause kirjavahemärgid', 'lauselühend, lisand, üte', 'otsekõne, kaudkõne, tsitaat'],
  EK12: ['normikirjakeel ja õigekeelsussõnaraamat', 'kirjavahemärgid keerukas lauses', 'sõnastus, rektsioon ja lausestus', 'tsiteerimine ja refereerimine', 'stiil ja register', 'arutleva teksti sidusus'],
});

// the task types that belong to each phase of a lesson (Avasta / Harjuta / Kasuta)
export const PHASE_TASKS = Object.freeze({
  input: ['reading', 'listening', 'dialogue', 'vocab', 'text', 'image', 'diagram'],
  controlled: ['cloze', 'formtext', 'insertion', 'picmatch', 'scenelabel', 'profiles', 'gaps', 'choice', 'truefalse', 'match', 'manymatch', 'wordforms', 'errorfix', 'transformation', 'wordorder', 'categorize', 'table', 'clock', 'pictures', 'crossword', 'wordsearch', 'dictation', 'translation'],
  productive: ['speaking', 'writing', 'guidedletter', 'rolecards', 'planning', 'picrows'],
  recognition: ['cloze', 'insertion', 'picmatch', 'truefalse', 'match', 'manymatch', 'choice', 'pictures', 'wordsearch', 'crossword', 'clock'],
});

// „A2+”, „A2+/B1-”, „B1-”, „B1”, „b2” … → a key of LEVELS (the closest profile; unknown → A2, the most common level)
export function levelKey(value) {
  const native = nativeStage(value);
  if (native) return native;
  const v = String(value || '').toUpperCase().replace(/\s+/g, '');
  if (!v) return 'A2';
  if (v.includes('C1') || v.includes('C2')) return 'C1';
  if (v.includes('B1+')) return 'B1+';
  if (v.includes('B2-')) return 'B2-';
  if (v.includes('B2')) return 'B2';
  if (v.includes('A2+/B1') || v === 'B1-' || v.includes('B1-')) return 'B1-';
  if (v.includes('B1')) return 'B1';
  if (v.includes('A2+')) return 'A2+';
  if (v.includes('A2')) return 'A2';
  if (v.includes('A1') || v.includes('EELKOOL')) return 'A1';
  return 'A2';
}

export const levelProfile = (value) => LEVELS[levelKey(value)];
