// Didactic norms per level, as data (docs/DIDACTIC_ENGINE.md). One source for the constructor's check, the generator's
// self-check and the prompts of the local models. Ranges follow CEFR, the Estonian national level descriptions (Harno)
// and KeeleSepp's own A2 → B1 standard (docs/CEFR_A2_B1_LEARNING_STANDARD.md, lesson stages A2 / A2+ / A2+/B1- /
// B1- / B1). Numbers are norms for a worksheet task, not for a whole course.

export const LEVEL_ORDER = ['A1', 'A2', 'A2+', 'B1-', 'B1', 'B2', 'C1'];

// sentence: average / longest sentence in words; items: answers per closed task; reading: passage words and questions;
// writing: sentences (or words from B2); speaking: seconds; bank: word bank in gap tasks (yes | tip | no);
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
    writing: { sentences: [10, 14], words: [100, 180] }, speaking: [120, 240], bank: 'no', closedShare: 0.45, instructionWords: 25, example: 'no',
    can: 'Kirjutab ja räägib iseseisvalt selge ülesehitusega; järeldab, sõnastab ümber ja kannab üle uude olukorda.',
  },
  B2: {
    label: 'B2', sentence: { avg: 16, max: 28 }, items: [6, 12], reading: { words: [350, 650], questions: [5, 10], inference: true },
    writing: { words: [180, 280] }, speaking: [180, 300], bank: 'no', closedShare: 0.35, instructionWords: 35, example: 'no',
    can: 'Arutleb, kaalub plusse ja miinuseid, kirjutab arutleva teksti; mõistab keerukamaid tekste.',
  },
  C1: {
    label: 'C1', sentence: { avg: 19, max: 40 }, items: [6, 12], reading: { words: [500, 900], questions: [5, 10], inference: true },
    writing: { words: [250, 400] }, speaking: [240, 420], bank: 'no', closedShare: 0.25, instructionWords: 45, example: 'no',
    can: 'Väljendab end vabalt ja täpselt, valib registri ja stiili; mõistab pikki ja implitsiitseid tekste.',
  },
});

// Grammar of Estonian as a second language, by the level where it becomes a target (what is earlier is known; what is
// later is too early as a target, though it may appear as a fixed phrase). Used by the generator's planner and the
// prompts; a worksheet's own grammar is not machine-detected yet (that needs a morphological analyser, step 2).
export const GRAMMAR = Object.freeze({
  A1: ['olevik (ma-, sa-, ta-vormid)', 'eitus (ei, ära)', 'küsimused (kas, kes, mis, kus, kuhu, kust)', 'mul on / mul ei ole', 'ainsuse omastav', 'ainsuse osastav (arvsõnaga, eitusega)', 'kohakäänded: -s, -sse, -st', 'arvud ja kell', 'isikulised asesõnad'],
  A2: ['lihtminevik', 'mitmuse nimetav', 'kohakäänded: -l, -le, -lt', 'ma-infinitiiv ja da-infinitiiv', 'modaalverbid (pean, võin, saan, tahan, oskan)', 'käskiv kõneviis (sa-vorm)', 'omadussõna ühildumine', 'keskvõrre (suurem kui)', 'kaassõnad (enne, pärast, juures)', 'sidesõnad (et, sest, aga, kui)'],
  'A2+': ['mitmuse osastav (sagedased sõnad)', 'täisminevik', 'kaudsed küsimused (kas, kus …)', 'sihitise käänded (täis- ja osasihitis)', 'ülivõrre', 'ühendverbid (ära, ette, kaasa)'],
  'B1-': ['enneminevik', 'tingiv kõneviis (oleks, tahaksin)', 'mitmuse omastav', 'kesksõnad (-v, -nud, -tud) omadussõnana', 'des-vorm', 'rektsioon (huvitub millest, sõltub millest)'],
  B1: ['umbisikuline tegumood olevikus ja minevikus', 'kaudne kõne', 'mitmuse käänded tervikuna', 'tingiva kõneviisi minevik', 'mas-, mast-, maks-, mata-vorm', 'põhjust ja tingimust väljendavad laused'],
  B2: ['kaudne kõneviis (-vat)', 'umbisikulise tegumoe kõik ajad', 'nominaliseerimine (-mine, -us)', 'keerukad lauselühendid', 'sidusvahendid tekstis', 'registri valik (ametlik / igapäevane)'],
  C1: ['stiil ja register', 'idioomid ja püsiühendid', 'implitsiitne tähendus ja hinnangud', 'keerukas lause- ja tekstiehitus', 'termini- ja ametikeel'],
});

// the task types that belong to each phase of a lesson (Avasta / Harjuta / Kasuta)
export const PHASE_TASKS = Object.freeze({
  input: ['reading', 'listening', 'dialogue', 'vocab', 'text', 'image', 'diagram'],
  controlled: ['gaps', 'choice', 'truefalse', 'match', 'manymatch', 'wordforms', 'errorfix', 'transformation', 'wordorder', 'categorize', 'table', 'clock', 'pictures', 'crossword', 'wordsearch', 'dictation', 'translation'],
  productive: ['speaking', 'writing', 'guidedletter', 'rolecards', 'planning'],
  recognition: ['truefalse', 'match', 'manymatch', 'choice', 'pictures', 'wordsearch', 'crossword', 'clock'],
});

// „A2+”, „A2+/B1-”, „B1-”, „B1”, „b2” … → a key of LEVELS (the closest profile; unknown → A2, the most common level)
export function levelKey(value) {
  const v = String(value || '').toUpperCase().replace(/\s+/g, '');
  if (!v) return 'A2';
  if (v.includes('C1') || v.includes('C2')) return 'C1';
  if (v.includes('B2')) return 'B2';
  if (v.includes('A2+/B1') || v === 'B1-' || v.includes('B1-')) return 'B1-';
  if (v.includes('B1')) return 'B1';
  if (v.includes('A2+')) return 'A2+';
  if (v.includes('A2')) return 'A2';
  if (v.includes('A1') || v.includes('EELKOOL')) return 'A1';
  return 'A2';
}

export const levelProfile = (value) => LEVELS[levelKey(value)];
