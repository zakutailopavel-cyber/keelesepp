// Course-level checks of the methodology standard (docs/METHODOLOGY_STANDARD.md §2): skills and recycling across a
// course's modules. Pure: modules (registry COURSE_MODULES entries) → findings. The course tests list the known gaps,
// so a rewritten module leaves the list and an old gap cannot come back unnoticed.
const PHASES = ['discover', 'practice', 'transfer'];
const lessonBlocks = (mod) => Object.values(mod.LESSONS).filter((l) => !l.assessment).flatMap((l) => PHASES.flatMap((p) => l[p] || []));
export const moduleNo = (mod) => Number(String(mod.MODULE.id).match(/(\d+)$/)?.[1] || 0);
// a supplement (extra homework sheets, MODULE.supplement) is not a roadmap module: no listening or recycling rule
export const courseModules = (modules, course) => modules.filter((m) => m.MODULE.course === course && !m.MODULE.supplement).sort((a, b) => moduleNo(a) - moduleNo(b));

// listening: at least METHOD.listening tasks a module outside the exam lessons (H: a quarter of every exam is listening)
export const METHOD = { listening: 2, recycling: 0.3 };
export const listeningCount = (mod) => lessonBlocks(mod).filter((b) => b.type === 'listening').length;

// the words of a module's vocabulary blocks, as stems: „kohtuma — встречаться” → „kohtu”, „eelmisel nädalal” → „eelmise” (the longest word)
const VOCAB_SPLIT = /\s+[—–-]\s+/;
export function vocabStems(mod) {
  const entries = lessonBlocks(mod).filter((b) => b.type === 'vocab').flatMap((b) => String(b.data?.words || '').split(/,\s*/));
  return [...new Set(entries.map((e) => e.split(VOCAB_SPLIT)[0].replace(/\([^)]*\)/g, '').trim().toLowerCase()).filter(Boolean).map((head) => {
    const word = head.split(/\s+/).sort((a, b) => b.length - a.length)[0];
    const stem = word.endsWith('ma') && word.length > 4 ? word.slice(0, -2) : word.slice(0, -1);
    return stem;
    // a short stem („saa”, „või”) matches too much; a translation split off by a comma is not Estonian
  }).filter((stem) => stem.length >= 4 && /^[a-zõäöüšž]+$/.test(stem)))];
}
// what the learner reads (not the teacher's explanations and notes)
const moduleText = (mod) => JSON.stringify(lessonBlocks(mod).map((b) => Object.fromEntries(Object.entries(b.data || {}).filter(([k]) => !['explain', 'teacher'].includes(k))))).toLowerCase();

// recycling (SR): the share of the previous module's vocabulary that the module uses again; null when there is no
// vocabulary to measure
export function recyclingShare(prev, mod) {
  const stems = vocabStems(prev);
  if (!stems.length) return null;
  const words = new Set(moduleText(mod).split(/[^\p{L}]+/u).filter(Boolean));
  const used = stems.filter((stem) => [...words].some((w) => w.startsWith(stem)));
  return used.length / stems.length;
}

// a course's findings: [{ module, code, text }]
export function courseMethodGaps(modules, course) {
  const list = courseModules(modules, course);
  const out = [];
  list.forEach((mod, i) => {
    const n = listeningCount(mod);
    if (n < METHOD.listening) out.push({ module: mod.MODULE.id, code: 'listening', text: `${n} kuulamist (vähemalt ${METHOD.listening})` });
    if (!vocabStems(mod).length) out.push({ module: mod.MODULE.id, code: 'no-vocabulary', text: 'moodulis pole sõnavaraplokke — kordamist ei saa mõõta' });
    const share = i ? recyclingShare(list[i - 1], mod) : null;
    if (share !== null && share < METHOD.recycling) out.push({ module: mod.MODULE.id, code: 'recycling', text: `eelmise mooduli sõnadest kasutab ${Math.round(share * 100)}% (vähemalt ${METHOD.recycling * 100}%)` });
  });
  return out;
}

// Harno exam formats a course must train at least once (METHODOLOGY_STANDARD §4). A rough test on the course's blocks:
// it shows a format that is never trained, not how well it is trained.
const words = (v) => String(v || '').split(/\s+/).filter((w) => /\p{L}/u.test(w)).length;
const text = (b) => Object.values(b.data || {}).filter((v) => typeof v === 'string').join(' ').toLowerCase();
const optionSets = (b) => String(b.data?.passage || '').match(/\{[^}]*\}/g) || [];
const listenTF = (b) => b.type === 'examlisten' && b.data?.mode === 'truefalse';
const writingWords = (b) => (['guidedletter', 'examwriting'].includes(b.type) ? Number(b.data?.maxWords) || 0 : b.type === 'writing' ? (Number(b.data?.maxSent) || 0) * 10 : 0);
export const EXAM_FORMATS = {
  a2: [
    ['listening', 'kuulamine', (b) => ['listening', 'examlisten'].includes(b.type)],
    ['reading-150', 'tekst ~150 sõna + küsimused', (b) => b.type === 'reading' && words(b.data?.passage) >= 120],
    ['letter-gaps', 'kirja lünktekst valikutega', (b) => b.type === 'cloze'],
    ['signs', 'sildid ja teated: sobitamine', (b) => ['match', 'manymatch'].includes(b.type)],
    ['message-30', 'sõnum või kirjeldus ≥ 30 sõna', (b) => writingWords(b) >= 30],
    ['picture', 'pildi kirjeldamine suuliselt', (b) => b.type === 'speaking' && /pilt/.test(text(b))],
    // verified Harno A2 tasks (docs/HARNO_LEVEL_REQUIREMENTS.md, 2026-11-03): listening 2 true/false, writing 1 from a
    // business card, speaking 2 questions with an idea card
    ['listen-tf', 'kuulamine: õige / vale', (b) => listenTF(b) || b.type === 'truefalse'],
    ['business-card', 'andmed visiitkaardilt ≥ 25 sõna', (b) => /visiitkaart/.test(text(b))],
    ['idea-card', 'küsimused ideekaardi abil', (b) => ['speaking', 'rolecards', 'speakcard'].includes(b.type) && /ideekaart|küsi/.test(text(b))],
  ],
  b1: [
    ['listening', 'kuulamine', (b) => ['listening', 'examlisten'].includes(b.type)],
    ['reading-200', 'tekst 200–300 sõna + valikud', (b) => b.type === 'reading' && words(b.data?.passage) >= 180],
    ['gap-10', 'lünktekst 10 valikuga', (b) => b.type === 'cloze'],
    ['phrase-bank', 'fraaside / lausete lünktekst', (b) => b.type === 'insertion'],
    ['letter-100', 'isiklik kiri või jutt ~100 sõna', (b) => writingWords(b) >= 90],
    ['agreement', 'paaristöö kokkuleppega', (b) => (b.type === 'speakcard' && b.data?.mode !== 'phone') || (['rolecards', 'speaking'].includes(b.type) && /kokku lepp|kokkulepe|otsusta/.test(text(b)))],
    ['phone', 'telefonikõne asutusse (rollimäng)', (b) => (b.type === 'speakcard' && b.data?.mode === 'phone') || (['rolecards', 'speaking'].includes(b.type) && /helista|telefon/.test(text(b)))],
    // verified Harno B1 tasks: reading 1 situations ↔ ads, writing 1 questionnaire or note, listening 4 true/false
    ['ads-match', 'olukorrad ja kuulutused', (b) => b.type === 'adsmatch'],
    ['note-50', 'küsimustik või teade ~50 sõna', (b) => b.type === 'examwriting' && ['kusimustik', 'teade', 'kutse'].includes(b.data?.genre)],
    ['listen-tf', 'kuulamine: intervjuu, õige / vale', listenTF],
  ],
  b2: [
    ['listening', 'kuulamine', (b) => ['listening', 'examlisten'].includes(b.type)],
    ['reading-500', 'artikkel 500–600 sõna', (b) => b.type === 'reading' && words(b.data?.passage) >= 450],
    ['letter-140', 'poolametlik kiri ~140 sõna', (b) => writingWords(b) >= 130],
    ['essay-180', 'arutlev tekst või kokkuvõte ~180 sõna', (b) => writingWords(b) >= 170],
    ['monologue-work', 'sõnavõtt töö teemal', (b) => b.type === 'speaking' && /töö|amet|ettevõt/.test(text(b))],
    ['debate', 'arutelu poolt- ja vastuargumentidega', (b) => b.type === 'rolecards' && /poolt|vastu/.test(text(b))],
    // verified Harno B2 tasks: reading 3 gaps with 4 options, reading 4 sentence bank, listening 1 clips heard once,
    // listening 4 twelve true / false statements
    ['gap-4', 'lünktekst 4 valikuga', (b) => b.type === 'cloze' && optionSets(b).some((o) => o.split('|').length >= 4)],
    ['sentence-bank', 'lausepangaga lünktekst', (b) => b.type === 'insertion'],
    ['clips-once', 'lühiklipid, kuuldakse üks kord', (b) => b.type === 'examlisten' && Number(b.data?.plays) === 1],
    ['listen-tf', 'kuulamine: õige / vale', (b) => listenTF(b) || (b.type === 'truefalse' && (b.data?.statements || []).length >= 10)],
  ],
  c1: [
    ['listening', 'kuulamine', (b) => ['listening', 'examlisten'].includes(b.type)],
    ['lecture-notes', 'loengu märkmed → peamõtted', (b) => b.type === 'listening' && /loeng|märkm|peamõt/.test(text(b))],
    ['reading-600', 'pikk tekst ~600 sõna', (b) => b.type === 'reading' && words(b.data?.passage) >= 500],
    ['data-summary', 'andmete kokkuvõte diagrammist', (b) => b.type === 'chart'],
    ['opinion-220', 'arvamuslugu 220–260 sõna', (b) => writingWords(b) >= 220],
    ['presentation', 'ettekanne töö teemal', (b) => b.type === 'speaking' && /ettekan|esitlus/.test(text(b))],
    // verified Harno C1 tasks: reading 1 statement ↔ paragraph, reading 2 sentence gaps, reading 3 short answers 1–4 words
    ['paragraph-match', 'väide ja tekstilõik', (b) => ['table', 'manymatch', 'match', 'adsmatch'].includes(b.type) && /lõik/.test(text(b))],
    ['sentence-gap', 'lünka sobiv lause', (b) => ['gaps', 'insertion', 'cloze'].includes(b.type) && /lause/.test(text(b))],
    ['short-answer', 'teabetekst ja lühivastused', (b) => b.type === 'reading'],
  ],
};
// formats never trained in a course: [{ id, label }]
export function examFormatGaps(modules, course) {
  const blocks = courseModules(modules, course).flatMap((m) => Object.values(m.LESSONS).flatMap((l) => PHASES.flatMap((p) => l[p] || [])));
  return (EXAM_FORMATS[course] || []).filter(([, , test]) => !blocks.some(test)).map(([id, label]) => ({ id, label }));
}
