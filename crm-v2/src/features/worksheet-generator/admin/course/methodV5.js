// Gates G1–G13 of methodology v5 „lesson budget” for the Estonian B1 (A2→B1, a2b1-*) and B2 (B1→B2, b1b2-*) courses
// (docs/METHODOLOGY_B1_B2_V5.md §3–§6). Pure and node-importable (tools/course-audit/method-v5.mjs prints the report): no
// block registry, no React. The gates apply to the modules listed in strictModulesV5.json (methodV5.test.js); the report
// shows any module, so a content agent sees the gaps before switching a module on.
//
//   methodV5Input(mod)          a course module → { id, course, title, lessons: { [lessonId]: { kind, n, sheets } } }
//   methodV5Problems(input)     → [{ gate: 'G1'…'G13', code, lessonId, phase, blockId, text }]
//   methodV5Report(mod)         blocks and minutes per sheet and lesson + the problems
//   formatMethodV5Report(r)     the report as plain text lines
//
// What the gates read (block shapes of blocks.js / stationBlocks.js):
//   - hidden blocks (`hidden: true`, blocks.js hide()) are already off the sheets (courseSheet.js visibleBlocks);
//   - the textbook picture added to a sheet (data.artId / data.artFor) and word strips are not lesson blocks;
//   - lesson kinds: a teaching lesson, a module control (lesson.assessment), a full mock exam (an assessment at the
//     planned numbers, V5.mocks) and other sheets (oral, theory, diagnostic, e-exam: only G5–G7, G12 apply).
import { moduleSheets, PHASES } from './courseSheet.js';
import { clipScripts } from './listeningAudio.js';
import { sheetMinutes } from '../../../worksheet-studio/didactics/timeEstimate.js';
import { ITEMS } from '../../../worksheet-studio/didactics/depth.js';

export const V5 = Object.freeze({
  // G1: blocks per sheet and per lesson (§3)
  budget: { b1: { discover: 5, practice: 4, transfer: 5, lesson: 15 }, b2: { discover: 4, practice: 4, transfer: 5, lesson: 14 } },
  // G1: a 90-min lesson: the 75-min core + buffer, by the sheets' time estimate (timeEstimate.js)
  lessonMinutes: 90,
  // G1 / §5: a module control is one sheet, 45 min, ≤ 10 blocks (the estimate may run 10 % over)
  control: { sheets: 1, blocks: 10, minutes: 50 },
  // §5: full mock exams only at these lesson numbers (their exam format is not a lesson budget)
  mocks: { b1: [60, 80, 89, 90], b2: [20, 40, 60, 80, 89, 90] },
  // G3: B1 lengths with a floor and a ceiling by lesson number (§3); „~50 + ~100” words = 45–110
  b1Stages: [
    { to: 20, stage: 'A2', text: [80, 150], audioSec: 90, write: [30, 60], speak: [30, 60] },
    { to: 40, stage: 'A2+', text: [120, 180], audioSec: 120, write: [50, 80], speak: [60, 90] },
    { to: 60, stage: 'A2+/B1-', text: [150, 220], audioSec: 150, write: [60, 90], speak: [90, 120] },
    { to: 90, stage: 'B1', text: [180, 300], audioSec: 210, write: [45, 110], speak: [120, 180] },
  ],
  // G3 / G4: B2 (§3): reading 400–600, listening 3–4 min (clips 35–45 s, heard once), writing ~140 + ~180, a 1-min
  // monologue after 2 min preparation, a discussion ≤ 4 min
  b2: { text: [400, 600], audioSec: [180, 240], clipSec: 45, write: [126, 200], speak: [60, 240] },
  // a pair task (an agreement or phone card) is timed for both partners: twice the stage's speech ceiling
  pairFactor: 2,
  // words per minute of the recorded voice (TartuNLP Neurokõne; stations.js: 320 words ≈ 2.5 min), when the audio file's
  // own length is not known
  wpm: 128,
  // a `writing` block counts sentences: about 8 words a sentence
  wordsPerSentence: 8,
  // G4: listening items of the long recording
  listenItems: [8, 12],
  // G8: drills beyond this many items go to Harjuta
  drillItems: 10,
  // G8: from this B1 lesson on (and in all of B2) these do not stand on lesson sheets (§4)
  noDrillFrom: 41,
});

// G7: the continuing story's cast (docs/COURSE_CAST.md) — at most one lesson per module mentions them
export const CAST = Object.freeze(['Sofia', 'Markus', 'Jaan', 'Anna', 'Liis', 'Viktor', 'Helgi', 'Kadri', 'Mia', 'Oskar', 'Muki', 'Bruno', 'Maret']);
// a name in an Estonian case form (Sofiale, Markusega, Jaani, Annal …)
const CAST_RE = new RegExp(`(?<![\\p{L}])(${CAST.join('|')})(?:i|e|a|u)?(?:le|l|lt|ga|st|s|sse|ks|ni|na|ta|t|d|de|sid)?(?![\\p{L}])`, 'gu');
// „Anna mulle …” is the imperative of andma, not Anna
const ANNA_VERB = /^Anna\s+(mulle|talle|meile|neile|teile|andeks|teada|märku|oma|see|seda|need|neid|üks|palun|edasi|vastus|nõu|luba|kõik)\b/iu;

// G8: drill types that leave the lesson sheet for Harjuta (§4): crosswords, matching, sorting, word order, „Mäletad?”
const OFF_SHEET = new Set(['crossword', 'match', 'manymatch', 'categorize', 'wordorder']);
// G8: form drills whose item count is capped on the lesson sheet (comprehension items of a text or recording are not)
const FORM_DRILLS = new Set(['gaps', 'wordforms', 'errorfix', 'transformation', 'wordorder', 'translation', 'match', 'manymatch', 'categorize', 'crossword']);
// G3: input texts and recordings
const TEXT_INPUT = { reading: 'passage', cloze: 'passage', insertion: 'passage', formtext: 'passage', text: 'text' };
const AUDIO = new Set(['listening', 'examlisten']);
const RUBRICS = new Set(['examrubric', 'rubric', 'selfcheck']);
// keys whose strings the learner does not read (teacher notes, keys, files)
const NOT_LEARNER = new Set(['explain', 'teacher', 'img', 'audio', 'src', 'artId', 'artFor', 'from', 'hash', 'opener', 'station', 'extension', 'purposeNote', 'hiddenWhy']);

const lines = (v) => String(v || '').split('\n').map((x) => x.trim()).filter(Boolean);
// words of a text without the task markup: {*right|wrong} → right, [[sentence]] → sentence, [form|alt] → form
export function words(text) {
  const clean = String(text || '')
    .replace(/\{\*?([^|}]*)[^}]*\}/g, '$1')
    .replace(/\[\[|\]\]/g, ' ')
    .replace(/\[([^\]|]*)[^\]]*\]/g, '$1')
    .replace(/[*_#>]/g, ' ');
  return clean.split(/\s+/).filter((w) => /[\p{L}\p{N}]/u.test(w)).length;
}
const lessonNumber = (lessonId) => { const m = String(lessonId).match(/(\d{3})$/); return m ? Number(m[1]) : null; };
const isArt = (b) => Boolean(b?.data?.artId || b?.data?.artFor);
// the blocks of a sheet that count: no textbook picture, no word strip, nothing hidden
export const ownBlocks = (doc) => (doc?.blocks || []).filter((b) => !b.hidden && !isArt(b) && b.type !== 'wordstrip');

// every string the learner reads in a block
export function learnerText(value, key = '') {
  if (NOT_LEARNER.has(key)) return [];
  if (typeof value === 'string') return [value];
  if (Array.isArray(value)) return value.flatMap((v) => learnerText(v));
  if (value && typeof value === 'object') return Object.entries(value).flatMap(([k, v]) => learnerText(v, k));
  return [];
}
const blockText = (b) => learnerText(b?.data || {}).join('\n');

export function castMentions(text) {
  const found = [];
  for (const m of String(text || '').matchAll(CAST_RE)) {
    if (m[1] === 'Anna' && ANNA_VERB.test(String(text).slice(m.index))) continue;
    found.push(m[1]);
  }
  return found;
}

// seconds of one recording: the audio file's own length (listeningAudio.json) or the words at the voice's pace
function recordings(b) {
  const d = b.data || {};
  const clips = clipScripts(b);
  if (clips.length) return clips.map((c) => ({ clip: true, sec: Math.round((words(c.script) / V5.wpm) * 60) }));
  const sec = Math.round(Number(d.audio?.seconds)) || Math.round((words(d.transcript || d.sentences) / V5.wpm) * 60);
  return [{ clip: false, sec }];
}
const listenItems = (b) => (b.type === 'examlisten' ? ITEMS.examlisten(b.data || {}) : Math.max((String(b.data?.sentences || '').match(/\[[^\]]*\]/g) || []).length, 0) || lines(b.data?.sentences).length);
const textWords = (b) => {
  if (TEXT_INPUT[b.type]) return words(b.data?.[TEXT_INPUT[b.type]]);
  if (b.type === 'dialogue') return words((b.data?.lines || []).map((l) => l?.text || '').join(' '));
  if (b.type === 'adsmatch') return words((b.data?.ads || []).map((a) => `${a.title || ''} ${a.text || ''}`).join(' '));
  return 0;
};
// [min, max] words of a writing task
function writingWords(b) {
  const d = b.data || {};
  if (b.type === 'writing') return [(Number(d.minSent) || 0) * V5.wordsPerSentence, (Number(d.maxSent) || 0) * V5.wordsPerSentence];
  if (b.type === 'guidedletter' || b.type === 'examwriting') {
    if (b.type === 'examwriting' && lines(d.questions).length) return null; // a questionnaire, not a text
    return [Number(d.minWords) || 0, Number(d.maxWords) || 0];
  }
  return null;
}
const isSpeech = (b) => (b.type === 'speaking' || b.type === 'speakcard') && Number(b.data?.maxSec) > 0;
// an analytic rubric: ≥ 4 criteria, each with a descriptor (hint) or level descriptors
export const isAnalyticRubric = (b) => (b?.type === 'examrubric' || b?.type === 'rubric')
  && Array.isArray(b.data?.criteria) && b.data.criteria.length >= 4
  && b.data.criteria.every((c) => String(c?.hint || c?.descriptor || '').trim() || (Array.isArray(c?.levels) && c.levels.length >= 2));
// G9: a hidden-information card: the teacher's card holds „Varjatud info” (b1b2-006) or the block says so
export const isHiddenInfoCard = (b) => ['rolecards', 'speakcard'].includes(b?.type)
  && (b.data?.hiddenInfo === true || /varjatud info/i.test(`${b.data?.teacher || ''}\n${blockText(b)}`));
// G9: a speech / a text without ready phrases and without a given opening
const hasPhrasebank = (doc) => (doc?.blocks || []).some((b) => b.type === 'phrasebank' && !b.hidden);
const freeSpeech = (b, doc) => b.type === 'speaking' && !String(b.data?.tipText || '').trim() && !hasPhrasebank(doc);
const freeWriting = (b, doc) => !hasPhrasebank(doc) && (
  (b.type === 'writing' && !String(b.data?.keywords || '').trim())
  || ((b.type === 'guidedletter' || b.type === 'examwriting') && !String(b.data?.opening || '').trim() && !lines(b.data?.questions).length));
// G4: a question that asks to infer (the author's view, a hint, a reason, a conclusion)
const INFERENCE = /\b(miks|järeld|vihja|autor|kirjutaja|hoiak|suhtu|eesmär|peab silmas|kaudselt|millest võib|mida .{0,30}(arvab|tahab|mõtleb)|arvab|mõtleb|tähendab)/iu;
// G13: a real source (title + https URL) or a real addressee
const URL_RE = /https:\/\/[^\s)\]>»”"]+/;
// G11: the thresholds, one way everywhere (§2.9)
const HARNO_THRESHOLD = /Harno\p{L}*[^.\n]{0,60}?(?:lävend|soorit|läbi|alates|vähemalt|piir)[^.\n%]{0,25}?(\d{2})\s?%/giu;
const PCT = (n) => new RegExp(`(?<![\\d,.])${n}\\s?%`);

function lessonKind(course, lessonId, lesson, sheets) {
  const docs = Object.values(sheets);
  if (docs.some((d) => d.meta?.oral || d.meta?.theory || d.meta?.diagnostic || d.meta?.exam)) return 'other';
  if (!lesson?.assessment && !docs.some((d) => d.meta?.assessment)) return 'lesson';
  return (V5.mocks[course] || []).includes(lessonNumber(lessonId)) ? 'mock' : 'control';
}
function b1Stage(n) { return V5.b1Stages.find((s) => n <= s.to) || V5.b1Stages[V5.b1Stages.length - 1]; }

// a course module → the gates' input (sheets built by the course builder, hidden blocks already out)
export function methodV5Input(mod, sheets = moduleSheets(mod)) {
  const ids = Object.keys(sheets);
  const moduleNo = Number(String(mod.MODULE.id).split('-').pop()) || 1;
  return {
    id: mod.MODULE.id, course: mod.MODULE.course, title: mod.MODULE.title,
    lessons: Object.fromEntries(ids.map((lessonId, i) => [lessonId, {
      kind: lessonKind(mod.MODULE.course, lessonId, mod.LESSONS[lessonId], sheets[lessonId]),
      // a lesson id without a number (a supplement) takes its place in the module
      n: lessonNumber(lessonId) ?? (moduleNo - 1) * 5 + i + 1,
      sheets: sheets[lessonId],
    }])),
  };
}

export const GATES = {
  G1: 'tunni maht (plokid lehel ja tunnis, minutid; kontroll: üks leht, ≤ 10 plokki, 45 min)',
  G2: 'vanad normid (40–55 min lehel, ≥ 25 min drille) ei kehti: lehel on meta.methodV5',
  G3: 'pikkused tasemeastme järgi (alam- ja ülempiir), üks sisend tunnis',
  G4: 'B2 sisend: lugemine ≥ 400 sõna + ≥ 2 järeldusküsimust või kuulamine ≥ 3 min + 8–12 punkti; lüngad ilma sõnapangata',
  G5: 'etteütlust ei ole',
  G6: 'kuulamine: kuulamiste arv on määratud (2×, B2 klipid 1×), kontrollis lukus',
  G7: 'loo tegelased kõige rohkem ühes tunnis mooduli kohta',
  G8: 'kaunistused: ≤ 1 nõuanne tunnis, examrubric ainult kontrollis, risti-, sobitus- ja järjestusülesanded Harjutasse',
  G9: 'iseseisvus: üks kõne ja üks tekst ilma fraaside ja alguseta, üks varjatud infoga rollikaart moodulis',
  G10: 'B2 kirjutamise analüütiline hindamisjuhend (4 kriteeriumi kirjeldustega)',
  G11: 'lävendid ühtemoodi: Harno 60 %, KeeleSepp 70 % / 80 %',
  G12: 'A2/B1 hindamisjuhendis ei ole „pausideta”',
  G13: 'seosülesanne: päris allikas (pealkiri + https-link) või päris adressaat',
};

export function methodV5Problems(input) {
  const out = [];
  const { course } = input;
  const b2 = course === 'b2';
  const budget = V5.budget[b2 ? 'b2' : 'b1'];
  const add = (gate, code, lessonId, phase, text, blockId = '') => out.push({ gate, code, lessonId, phase, blockId, text });
  const castLessons = [];
  let freeSpeak = 0; let freeWrite = 0; let hiddenCards = 0; let links = 0; let oldSheets = 0;

  for (const [lessonId, lesson] of Object.entries(input.lessons || {})) {
    const { kind, n } = lesson;
    const sheets = lesson.sheets || {};
    const phases = Object.keys(sheets);
    const all = phases.flatMap((p) => ownBlocks(sheets[p]).map((b) => ({ b, p, doc: sheets[p] })));
    const teaching = kind === 'lesson';
    const stage = b2 ? null : b1Stage(n);

    // G2: the sheet is built as a v5 sheet (its old minute and drill norms off), counted over the module
    oldSheets += phases.filter((p) => !sheets[p]?.meta?.methodV5).length;

    // G1: the lesson budget
    if (teaching) {
      phases.forEach((p) => {
        const count = ownBlocks(sheets[p]).length;
        if (count > (budget[p] ?? Infinity)) add('G1', 'G1-sheet', lessonId, p, `${count} plokki lehel ${PHASES[p]?.label || p} (≤ ${budget[p]})`);
      });
      if (all.length > budget.lesson) add('G1', 'G1-lesson', lessonId, '*', `${all.length} plokki tunnis (≤ ${budget.lesson})`);
      const minutes = phases.reduce((m, p) => m + sheetMinutes(sheets[p]), 0);
      if (minutes > V5.lessonMinutes) add('G1', 'G1-minutes', lessonId, '*', `tunni töö ≈ ${minutes} min (≤ ${V5.lessonMinutes}: 75 min tuum + puhver)`);
    } else if (kind === 'control') {
      if (phases.length > V5.control.sheets) add('G1', 'G1-control-sheets', lessonId, '*', `kontrollis ${phases.length} lehte (üks leht, 45 min)`);
      if (all.length > V5.control.blocks) add('G1', 'G1-control-blocks', lessonId, '*', `kontrollis ${all.length} plokki (≤ ${V5.control.blocks})`);
      const minutes = phases.reduce((m, p) => m + sheetMinutes(sheets[p]), 0);
      if (minutes > V5.control.minutes) add('G1', 'G1-control-minutes', lessonId, '*', `kontroll ≈ ${minutes} min (45 min)`);
    }

    // G3: lengths with a floor and a ceiling (mock exams keep the real exam's lengths)
    if (teaching || kind === 'control') {
      const textCeil = b2 ? V5.b2.text[1] : stage.text[1];
      const audioCeil = b2 ? V5.b2.audioSec[1] : stage.audioSec;
      const writeCeil = b2 ? V5.b2.write[1] : stage.write[1];
      const speakCeil = b2 ? V5.b2.speak[1] : stage.speak[1];
      const where = b2 ? 'B2' : `B1 tund ${String(n).padStart(3, '0')}, ${stage.stage}`;
      let longestText = 0; let longestAudio = 0; let longestWrite = 0; let longestSpeak = 0; let writes = 0; let speeches = 0;
      const inputs = [];
      all.forEach(({ b, p }) => {
        const w = textWords(b);
        if (w) {
          longestText = Math.max(longestText, w);
          if (w > textCeil) add('G3', 'G3-text', lessonId, p, `${b.id}: tekst ${w} sõna (${where}: kuni ${textCeil})`, b.id);
          if (b.type !== 'cloze' && b.type !== 'formtext' && b.type !== 'insertion' && w >= (b2 ? 200 : stage.text[0])) inputs.push(b.id);
        }
        if (AUDIO.has(b.type)) {
          recordings(b).forEach((r) => {
            const ceil = b2 && r.clip ? V5.b2.clipSec : audioCeil;
            if (r.sec > ceil) add('G3', 'G3-audio', lessonId, p, `${b.id}: salvestus ≈ ${r.sec} s (${where}${r.clip ? ', klipp' : ''}: kuni ${ceil} s)`, b.id);
            if (!r.clip) longestAudio = Math.max(longestAudio, r.sec);
          });
          const main = recordings(b).filter((r) => !r.clip).reduce((m, r) => Math.max(m, r.sec), 0);
          if (main >= (b2 ? 90 : 60)) inputs.push(b.id);
        }
        const ww = writingWords(b);
        if (ww) {
          writes += 1;
          longestWrite = Math.max(longestWrite, ww[1]);
          if (ww[1] > writeCeil) add('G3', 'G3-writing', lessonId, p, `${b.id}: kirjutamine kuni ${ww[1]} sõna (${where}: kuni ${writeCeil})`, b.id);
        }
        if (isSpeech(b)) {
          speeches += 1;
          const sec = Number(b.data.maxSec);
          const ceil = b.type === 'speakcard' && !b2 ? speakCeil * V5.pairFactor : speakCeil;
          longestSpeak = Math.max(longestSpeak, b.type === 'speakcard' && !b2 ? sec / V5.pairFactor : sec);
          if (sec > ceil) add('G3', 'G3-speech', lessonId, p, `${b.id}: rääkimine kuni ${sec} s (${where}${b.type === 'speakcard' ? ', paaris' : ''}: kuni ${ceil} s)`, b.id);
        }
      });
      if (teaching) {
        const textFloor = b2 ? V5.b2.text[0] : stage.text[0];
        const audioFloor = b2 ? V5.b2.audioSec[0] : Math.round(stage.audioSec / 2);
        if (longestText < textFloor && longestAudio < audioFloor) add('G3', 'G3-input-short', lessonId, '*', `pikim tekst ${longestText} sõna, pikim salvestus ${longestAudio} s (${where}: tekst vähemalt ${textFloor} sõna või salvestus ${audioFloor} s)`);
        const writeFloor = b2 ? V5.b2.write[0] : stage.write[0];
        if (writes && longestWrite < writeFloor) add('G3', 'G3-writing-short', lessonId, '*', `pikim kirjutamine ${longestWrite} sõna (${where}: vähemalt ${writeFloor})`);
        const speakFloor = b2 ? V5.b2.speak[0] : stage.speak[0];
        if (speeches && longestSpeak < speakFloor) add('G3', 'G3-speech-short', lessonId, '*', `pikim kõne ${longestSpeak} s (${where}: vähemalt ${speakFloor} s)`);
        if (inputs.length > 1) add('G3', 'G3-inputs', lessonId, '*', `${inputs.length} sisendit tunnis (${inputs.join(', ')}): üks tekst või üks salvestus`);
      }
    }

    // G4: the B2 input rule
    if (b2 && teaching) {
      const reads = all.filter(({ b }) => ['reading', 'cloze', 'insertion', 'formtext'].includes(b.type) && textWords(b) >= V5.b2.text[0]);
      const readOk = reads.some(({ b, doc }) => {
        const own = lines(b.data?.questions).map((q) => q.replace(/\[.*$/, ''));
        const near = ownBlocks(doc).filter((x) => x.type === 'choice').flatMap((x) => (x.data?.questions || []).map((q) => q?.q || ''));
        return [...own, ...near].filter((q) => INFERENCE.test(q)).length >= 2;
      });
      const listenOk = all.some(({ b, doc }) => {
        if (!AUDIO.has(b.type)) return false;
        const sec = recordings(b).filter((r) => !r.clip).reduce((m, r) => Math.max(m, r.sec), 0);
        if (sec < V5.b2.audioSec[0]) return false;
        const follow = ownBlocks(doc).filter((x) => ['choice', 'truefalse'].includes(x.type) && /kuula|kuuld|salvest/i.test(`${x.data?.title || ''} ${x.data?.instruction || ''}`))
          .reduce((m, x) => m + (ITEMS[x.type]?.(x.data || {}) || 0), 0);
        const items = listenItems(b) + follow;
        return items >= V5.listenItems[0] && items <= V5.listenItems[1];
      });
      if (!readOk && !listenOk) add('G4', 'G4-input', lessonId, '*', `B2 sisend puudub: lugemine ≥ ${V5.b2.text[0]} sõna ja ≥ 2 järeldusküsimust või kuulamine ≥ ${V5.b2.audioSec[0] / 60} min ja ${V5.listenItems.join('–')} punkti`);
      all.filter(({ b }) => b.type === 'gaps' && b.data?.showBank === 'yes').forEach(({ b, p }) => add('G4', 'G4-bank', lessonId, p, `${b.id}: lüngad sõnapangaga (B2: ilma pangata)`, b.id));
    }

    // G5: no dictation in B1–C1
    all.filter(({ b }) => b.type === 'dictation').forEach(({ b, p }) => add('G5', 'G5-dictation', lessonId, p, `${b.id}: etteütlus (B1–C1 ei ole)`, b.id));

    // G6: the play count of every recording; locked in controls and mock exams
    all.filter(({ b }) => AUDIO.has(b.type)).forEach(({ b, p }) => {
      const plays = Number(b.data?.plays);
      const clips = clipScripts(b).length > 0;
      // B1: twice. B2: a set of short clips once, a recording twice — a B2 recording over a minute is not heard once
      const longest = recordings(b).reduce((m, r) => Math.max(m, r.sec), 0);
      const ok = !b2 ? plays === 2 : clips ? plays === 1 : plays === 2 || (plays === 1 && longest <= 60);
      const want = !b2 ? '2×' : clips ? 'B2 klipid 1×' : 'B2: 2×, lühike klipp (≤ 60 s) 1×';
      if (!(plays > 0)) add('G6', 'G6-plays', lessonId, p, `${b.id}: kuulamiste arv on määramata (${want})`, b.id);
      else if (!ok) add('G6', 'G6-plays', lessonId, p, `${b.id}: kuulatakse ${plays}× (${want})`, b.id);
      if ((kind === 'control' || kind === 'mock') && !b.data?.lockPlays) add('G6', 'G6-lock', lessonId, p, `${b.id}: kontrollis on kuulamine lukus (lockPlays)`, b.id);
    });

    // G7: the cast
    const cast = new Set(all.flatMap(({ b }) => castMentions(blockText(b))));
    if (cast.size) castLessons.push(`${lessonId} (${[...cast].join(', ')})`);

    // G8: decoration and off-sheet drills
    if (teaching) {
      const tips = all.filter(({ b }) => b.type === 'tip' && !b.data?.review);
      if (tips.length > 1) add('G8', 'G8-tips', lessonId, '*', `${tips.length} nõuannet / „Kas teadsid?” tunnis (≤ 1): ${tips.map(({ b }) => b.id).join(', ')}`);
      const b2Writing = b2 && all.some(({ b }) => (writingWords(b)?.[1] || 0) >= 120);
      all.filter(({ b }) => b.type === 'examrubric' && !(b2Writing && isAnalyticRubric(b) && b.data?.scale !== 'S'))
        .forEach(({ b, p }) => add('G8', 'G8-examrubric', lessonId, p, `${b.id}: eksami hindamisjuhend tavalises tunnis (ainult kontrollis; B2: kirjutamise analüütiline juhend)`, b.id));
      if (b2 || n >= V5.noDrillFrom) {
        all.filter(({ b }) => OFF_SHEET.has(b.type) || (b.type === 'tip' && b.data?.review))
          .forEach(({ b, p }) => add('G8', 'G8-off-sheet', lessonId, p, `${b.id}: ${b.data?.review ? '„Mäletad?”' : b.type} kuulub Harjutasse, mitte tunnilehele`, b.id));
      }
      all.filter(({ b }) => FORM_DRILLS.has(b.type) && (ITEMS[b.type]?.(b.data || {}) || 0) > V5.drillItems)
        .forEach(({ b, p }) => add('G8', 'G8-drill-long', lessonId, p, `${b.id}: ${ITEMS[b.type](b.data || {})} punkti (tunnilehel ≤ ${V5.drillItems}, ülejäänu Harjutasse)`, b.id));
    }

    // G9: independence (counted over the module)
    if (teaching) {
      freeSpeak += all.filter(({ b, doc }) => freeSpeech(b, doc)).length;
      freeWrite += all.filter(({ b, doc }) => freeWriting(b, doc)).length;
      hiddenCards += all.filter(({ b }) => isHiddenInfoCard(b)).length;
    }

    // G10: B2 writing is graded by an analytic rubric
    if (b2 && teaching) {
      const long = all.filter(({ b }) => (writingWords(b)?.[1] || 0) >= 120);
      if (long.length && !all.some(({ b }) => isAnalyticRubric(b))) add('G10', 'G10-rubric', lessonId, '*', `${long.map(({ b }) => b.id).join(', ')}: B2 kirjutamisel puudub analüütiline hindamisjuhend (4 kriteeriumi kirjeldustega)`);
    }

    // G11: thresholds named one way
    all.forEach(({ b, p }) => {
      for (const m of blockText(b).matchAll(HARNO_THRESHOLD)) {
        if (m[1] !== '60') add('G11', 'G11-harno', lessonId, p, `${b.id}: Harno lävend ${m[1]} % (Harno: sooritatud alates 60 %)`, b.id);
      }
    });
    if (kind === 'control' || kind === 'mock') {
      const text = all.map(({ b }) => blockText(b)).join('\n');
      const missing = [60, 70, 80].filter((x) => !PCT(x).test(text));
      if (missing.length) add('G11', 'G11-thresholds', lessonId, '*', `kontrollis pole nimetatud ${missing.map((x) => `${x} %`).join(', ')} (Harno 60 %, KeeleSepp eksamiks valmis 70 %, sertifikaat 80 %)`);
    }

    // G12: no „pausideta” in an A2 / B1 rubric
    all.filter(({ b, doc }) => RUBRICS.has(b.type) && /^(A2|B1(?!\+))/.test(String(doc?.meta?.level || '')) && /pausideta/i.test(JSON.stringify(b.data || {})))
      .forEach(({ b, p }) => add('G12', 'G12-pauses', lessonId, p, `${b.id}: „pausideta” A2/B1 hindamisjuhendis (üle taseme)`, b.id));

    // G13: a real source or addressee
    if (teaching) links += all.filter(({ b }) => b.data?.realAddressee || (URL_RE.test(blockText(b)) && String(b.data?.title || b.data?.heading || '').trim())).length;
  }

  const lessons = Object.values(input.lessons || {});
  const teachingLessons = lessons.filter((l) => l.kind === 'lesson').length;
  if (oldSheets) add('G2', 'G2-flag', '*', '*', `${oldSheets} lehte ilma meta.methodV5-ta (moodul pole strictModulesV5.json-is): vanad 40–55 min ja ≥ 25 min drillide normid kehtivad`);
  if (castLessons.length > 1) add('G7', 'G7-cast', '*', '*', `loo tegelased ${castLessons.length} tunnis (≤ 1): ${castLessons.join('; ')}`);
  if (teachingLessons) {
    if (!freeSpeak) add('G9', 'G9-speech', '*', '*', 'moodulis pole ühtegi rääkimisülesannet ilma valmis fraasideta (speaking ilma tipText-ita, lehel pole fraasipanka)');
    if (!freeWrite) add('G9', 'G9-writing', '*', '*', 'moodulis pole ühtegi kirjutamist ilma fraaside ja antud alguseta');
    if (!hiddenCards) add('G9', 'G9-hidden-card', '*', '*', 'moodulis pole varjatud infoga rollikaarti (õpetaja kaardil „Varjatud info: …” või data.hiddenInfo)');
    if (!links) add('G13', 'G13-link', '*', '*', 'moodulis pole seosülesannet: plokk päris allikaga (pealkiri + https-link) või päris adressaadiga (data.realAddressee)');
  }
  return out;
}

// blocks and minutes per sheet and lesson + the problems, for content agents (tools/course-audit/method-v5.mjs)
export function methodV5Report(mod, sheets = moduleSheets(mod)) {
  const input = methodV5Input(mod, sheets);
  const problems = methodV5Problems(input);
  const lessons = Object.entries(input.lessons).map(([id, l]) => {
    const per = Object.fromEntries(Object.entries(l.sheets).map(([p, doc]) => [p, { blocks: ownBlocks(doc).length, minutes: sheetMinutes(doc) }]));
    return {
      id, kind: l.kind, n: l.n, sheets: per,
      blocks: Object.values(per).reduce((m, s) => m + s.blocks, 0),
      minutes: Object.values(per).reduce((m, s) => m + s.minutes, 0),
      problems: problems.filter((p) => p.lessonId === id),
    };
  });
  const byGate = Object.fromEntries(Object.keys(GATES).map((g) => [g, problems.filter((p) => p.gate === g).length]));
  return { id: input.id, course: input.course, title: input.title, lessons, problems, byGate, module: problems.filter((p) => p.lessonId === '*') };
}

export function formatMethodV5Report(report, { gates = null } = {}) {
  const budget = V5.budget[report.course === 'b2' ? 'b2' : 'b1'];
  const keep = (p) => !gates || gates.includes(p.gate);
  const out = [`${report.id} „${report.title}” — v5 rikkumisi ${report.problems.filter(keep).length}`,
    `  eelarve: Avasta ≤ ${budget.discover} · Harjuta ≤ ${budget.practice} · Kasuta ≤ ${budget.transfer} · tund ≤ ${budget.lesson} plokki, ≤ ${V5.lessonMinutes} min; kontroll 1 leht ≤ ${V5.control.blocks} plokki`,
    `  väravad: ${Object.entries(report.byGate).filter(([g]) => !gates || gates.includes(g)).map(([g, n]) => `${g} ${n}`).join(' · ')}`];
  report.lessons.forEach((l) => {
    const sheets = ['discover', 'practice', 'transfer'].map((p) => (l.sheets[p] ? `${p[0].toUpperCase()} ${l.sheets[p].blocks}/${l.sheets[p].minutes}′` : `${p[0].toUpperCase()} –`)).join('  ');
    out.push(`  ${l.id} [${l.kind}]  ${sheets}  = ${l.blocks} plokki, ≈ ${l.minutes} min`);
    l.problems.filter(keep).forEach((p) => out.push(`      ${p.gate} ${p.phase === '*' ? '' : `${p.phase}: `}${p.text}`));
  });
  if (report.module.filter(keep).length) out.push('  moodul:');
  report.module.filter(keep).forEach((p) => out.push(`      ${p.gate} ${p.text}`));
  return out;
}
