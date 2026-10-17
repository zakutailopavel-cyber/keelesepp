// Depth of a worksheet: is there enough real work in it, at the level's difficulty? (owner 2026-10-14, after a live
// lesson: „многие листы откровенно пустые, задания настолько простые, что заканчиваются за пару минут”.)
// The older checks look at the structure (block count, task types, estimated minutes); a sheet passed them with a few
// five-item tasks because speaking and writing blocks filled the minutes. These rules look at the work itself.
// Pure: { meta: { level, phase }, blocks: [{ type, data }] } → [{ code, level: 'error' | 'warning', text }].
import { blockMinutes } from './timeEstimate.js';
import { groupItems } from '../engine/schema.js';

// closed, checked tasks and how their items are counted
const lines = (v) => String(v || '').split('\n').map((x) => x.trim()).filter(Boolean);
const ITEMS = {
  choice: (d) => (d.questions || []).length,
  truefalse: (d) => (d.statements || []).length,
  gaps: (d) => lines(d.sentences).length,
  match: (d) => (d.pairs || []).length,
  manymatch: (d) => lines(d.left).length,
  errorfix: (d) => (d.rows || []).length,
  transformation: (d) => (d.rows || []).length,
  wordforms: (d) => (d.rows || []).length,
  wordorder: (d) => lines(d.sentences).length,
  translation: (d) => (d.rows || []).length,
  dictation: (d) => lines(d.sentences).length,
  formtext: (d) => (String(d.passage || '').match(/\]\s*\(/g) || []).length,
  insertion: (d) => (String(d.passage || '').match(/\[\[/g) || []).length,
  categorize: (d) => (d.groups || []).reduce((n, g) => n + (Array.isArray(g?.words) ? g.words.length : groupItems(g || {}).length), 0),
};
// the learner writes a whole sentence
const SENTENCE_WRITING = ['errorfix', 'transformation', 'translation', 'dictation'];
// speaking / writing / reflection: they matter, but they cannot stand in for the exercises
const OPEN = new Set(['speaking', 'writing', 'guidedletter', 'rolecards', 'planning', 'selfcheck', 'rubric', 'phrasebank', 'vocab', 'text', 'tip', 'notice', 'image', 'heading']);

const band = (level) => {
  const l = String(level || '').toUpperCase();
  if (l.startsWith('C')) return 'C1';
  if (l.startsWith('B2')) return 'B2';
  if (l.startsWith('B1')) return 'B1';
  return 'A2';
};
// per level: items in one closed task, minutes of exercises (without speaking/writing), average words in a task
// sentence, minutes of the same exercises when the class does them aloud with the teacher
// (calibrated on the published course 2026-10-14: a task had 5–6 items at every level, a C1 sheet 2 closed tasks)
// Kasuta (transfer) sheets: the use tasks are the lesson; exercises prepare them
export const TRANSFER = { exerciseMin: 12, liveMin: 8 };
export const V2_ITEMS = 6;
export const V3_DISCOVER = { exerciseMin: 12, liveMin: 6 };
// v3 Kasuta: the situation text is the only exercise; the sheet is the speech, the discussion and the letter
export const V3_TRANSFER = { exerciseMin: 6, liveMin: 5 };
export const DEPTH = {
  A2: { items: 8, exerciseMin: 20, sentenceWords: 4, liveMin: 12 },
  B1: { items: 10, exerciseMin: 25, sentenceWords: 5, liveMin: 15 },
  B2: { items: 10, exerciseMin: 25, sentenceWords: 6, liveMin: 15 },
  C1: { items: 10, exerciseMin: 25, sentenceWords: 8, liveMin: 15 },
};

const words = (v) => String(v || '').replace(/\[[^\]]*\]|\([^)]*\)|\{[^}]*\}/g, ' x ').split(/\s+/).filter((w) => /[\p{L}\p{N}]/u.test(w)).length;
function taskSentences(block) {
  const d = block.data || {};
  switch (block.type) {
    case 'gaps': case 'dictation': case 'wordorder': return lines(d.sentences);
    case 'errorfix': return (d.rows || []).map((r) => r?.wrong || r?.text || r?.sentence || '');
    case 'transformation': return (d.rows || []).map((r) => r?.source || r?.text || r?.from || '');
    case 'translation': return (d.rows || []).map((r) => r?.source || '');
    case 'truefalse': return (d.statements || []).map((s) => s?.text || '');
    case 'choice': return (d.questions || []).map((q) => q?.q || '');
    default: return [];
  }
}

export function depthProblems(doc) {
  const level = band(doc?.meta?.level);
  const norm = DEPTH[level];
  const blocks = doc?.blocks || [];
  const out = [];
  const closed = blocks.filter((b) => ITEMS[b.type]);
  // the Kasuta sheet of a check lesson is the exam's writing and speaking part: letters, essay, speech, discussion —
  // measured by the level gate (lengths), not by exercise depth
  if (doc?.meta?.assessment && doc?.meta?.phase === 'transfer') return out;

  // a dictation has its own norm below (ten dictated sentences would be ten minutes of dictating)
  // the exam parts of a check lesson have the exam's own sizes (6, 8, 9 points): the items norm does not apply there
  const examParts = doc?.meta?.assessment && doc?.meta?.phase === 'practice';
  // design v2: several shorter, different operations instead of one long drill (docs/COURSE_DESIGN_COMMUNICATIVE.md §6)
  // lesson template v3 (docs/COURSE_DESIGN_COMMUNICATIVE.md §11): fewer, fuller tasks — the level's full item count again
  const v3 = doc?.meta?.template === 'v3';
  const minItems = doc?.meta?.design === 'v2' && !v3 ? V2_ITEMS : norm.items;
  // a sentence-insertion text has the exam's 5–8 gaps
  const short = examParts ? [] : closed.filter((b) => b.type !== 'dictation' && b.type !== 'insertion' && ITEMS[b.type](b.data || {}) < minItems);
  if (short.length) out.push({ code: 'short-tasks', level: 'warning', text: `${short.length} ülesannet alla ${minItems} punkti (${level})`, blocks: short.map((b) => b.id) });

  // Kasuta (transfer) is for using the language: writing, speaking, role play carry it; the exercises only prepare
  const transfer = doc?.meta?.phase === 'transfer';
  // v3 Avasta: the text and its discussion are the lesson's input; one full language task follows it
  const exerciseMin = transfer ? (v3 ? V3_TRANSFER : TRANSFER).exerciseMin : v3 && doc?.meta?.phase === 'discover' ? V3_DISCOVER.exerciseMin : norm.exerciseMin;
  const liveMin = transfer ? (v3 ? V3_TRANSFER : TRANSFER).liveMin : v3 && doc?.meta?.phase === 'discover' ? V3_DISCOVER.liveMin : norm.liveMin;
  const exercise = blocks.filter((b) => !OPEN.has(b.type)).reduce((n, b) => n + blockMinutes(b, doc?.meta?.level || level), 0);
  if (exercise < exerciseMin) out.push({ code: 'thin', level: 'error', text: `harjutusi ≈ ${Math.round(exercise)} min (vähemalt ${exerciseMin}; rääkimine ja kirjutamine ei loe)` });

  // aloud with the teacher: a recognised item goes in ~9 s, a whole sentence written or rebuilt in ~25 s; a text is
  // still read at the learner's pace
  const liveRate = (type) => (SENTENCE_WRITING.includes(type) || type === 'wordorder' ? 0.4 : 0.15);
  // a text task (forms or sentences in a text) is read at the learner's pace like any text
  const TEXT_TASKS = ['formtext', 'insertion'];
  const live = blocks.filter((b) => !OPEN.has(b.type)).reduce((n, b) => n + (ITEMS[b.type] && !TEXT_TASKS.includes(b.type) ? ITEMS[b.type](b.data || {}) * liveRate(b.type) : blockMinutes(b, doc?.meta?.level || level)), 0);
  if (live < liveMin) out.push({ code: 'live-fast', level: 'warning', text: `tunnis koos õpetajaga ≈ ${Math.round(live)} min harjutusi (vähemalt ${liveMin})` });

  const sentences = blocks.flatMap(taskSentences).filter(Boolean);
  if (sentences.length >= 4) {
    const avg = sentences.reduce((n, s) => n + words(s), 0) / sentences.length;
    if (avg < norm.sentenceWords) out.push({ code: 'short-sentences', level: 'warning', text: `ülesannete laused keskmiselt ${avg.toFixed(1)} sõna (${level}: vähemalt ${norm.sentenceWords})` });
  }

  if (level !== 'A2') {
    // „Ma [ärkan] (ärkama)”: the base form after the gap gives the word away
    // …unless the task itself is the form („Kirjuta sulgudes olev sõna õiges vormis”): then the base form is the stimulus
    const formTask = (b) => /vorm/i.test(`${b.data?.title || ''} ${b.data?.instruction || ''}`);
    const hinted = blocks.filter((b) => b.type === 'gaps' && !formTask(b) && lines(b.data?.sentences).filter((s) => /\][^[]*\([^)]+\)/.test(s)).length > lines(b.data?.sentences).length / 2);
    if (hinted.length) out.push({ code: 'hinted', level: 'warning', text: `${hinted.length} lünkülesannet annab sõna algvormi sulgudes ette`, blocks: hinted.map((b) => b.id) });
    const banked = blocks.filter((b) => b.type === 'gaps' && b.data?.showBank === 'yes' && ['B2', 'C1'].includes(level));
    if (banked.length) out.push({ code: 'bank', level: 'warning', text: `${banked.length} lünkülesannet näitab sõnapanka (${level})`, blocks: banked.map((b) => b.id) });
    const twoOptions = blocks.filter((b) => b.type === 'choice' && (b.data?.questions || []).some((q) => lines(q?.options).length < 3 && (q?.opts || []).length < 3));
    if (twoOptions.length) out.push({ code: 'two-options', level: 'warning', text: `${twoOptions.length} valikülesannet, kus on alla 3 vastusevariandi`, blocks: twoOptions.map((b) => b.id) });
  }

  const writing = closed.filter((b) => SENTENCE_WRITING.includes(b.type));
  // v2 exam parts (reading and listening in exam form) have no sentence writing by design
  // v3: Harjuta is the exam's text tasks (option gaps, forms in a text, sentence gaps); Avasta has one language task
  if (writing.length < 2 && !(examParts && doc?.meta?.design === 'v2') && !v3) out.push({ code: 'no-sentences', level: 'warning', text: `ainult ${writing.length} ülesannet, kus õpilane kirjutab terve lause (vähemalt 2)` });

  blocks.filter((b) => b.type === 'dictation').forEach((b) => {
    const n = lines(b.data?.sentences).length;
    if (!n) out.push({ code: 'dictation-empty', level: 'error', text: 'etteütlusel pole lauseid (õpetajal pole midagi ette lugeda)', blocks: [b.id] });
    else if (n < (level === 'A2' ? 4 : 6)) out.push({ code: 'dictation-short', level: 'warning', text: `etteütluses ${n} lauset (vähemalt ${level === 'A2' ? 4 : 6})`, blocks: [b.id] });
  });

  return out;
}

// 0–100: errors weigh more than warnings; for sorting the audit, not a grade
export function depthScore(problems = []) {
  return Math.max(0, 100 - problems.reduce((n, p) => n + (p.level === 'error' ? 25 : 10), 0));
}
