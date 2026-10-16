// Quality gate for the course sheets (docs/B1_B2_COURSE_PRODUCTION.md §4). A sheet is publishable only when the
// constructor's own check finds no error, the level's didactic norms are mostly met, and the module stays varied:
// no two sheets of one phase share the same task sequence, neighbours differ, and each phase does its own job.
import { BLOCKS } from '../../../worksheet-studio/engine/registry.js';
import { analyzeWorksheet } from '../../../worksheet-studio/quality.js';
import { SHEET_MINUTES, sheetMinutes } from '../../../worksheet-studio/didactics/timeEstimate.js';
import { harnoFor } from '../../../worksheet-studio/didactics/levels.js';
import BASELINE from './qualityBaseline.json';

export const MIN_DIDACTIC_SCORE = 85;
const FORM = ['gaps', 'wordforms', 'table', 'transformation', 'dictation', 'translation'];
const MEANING = ['choice', 'truefalse', 'match', 'manymatch', 'categorize', 'crossword', 'reading', 'listening'];
const SENTENCE = ['errorfix', 'wordorder', 'transformation'];
const PRODUCTIVE = ['speaking', 'writing', 'dialogue', 'rolecards', 'guidedletter', 'planning'];
const SITUATION = ['text', 'tip', 'image', 'reading', 'listening', 'dialogue'];

const tasks = (doc) => (doc.blocks || []).filter((b) => BLOCKS[b.type]?.task);
const typeSet = (doc) => new Set(tasks(doc).map((b) => b.type));
const has = (doc, list) => tasks(doc).some((b) => list.includes(b.type));
const overlap = (a, b) => { const A = typeSet(a); const Bs = typeSet(b); const inter = [...A].filter((t) => Bs.has(t)).length; return inter / Math.max(1, new Set([...A, ...Bs]).size); };

// one sheet: [{ code, text }]
export function sheetProblems(doc) {
  const out = [];
  const { issues, didactics } = analyzeWorksheet(doc);
  issues.filter((i) => i.level === 'error').forEach((i) => out.push({ code: 'error', text: i.text }));
  // check: the didactic check's own id (block + rule), so a known problem is recognised in the baseline
  didactics?.issues?.filter((i) => i.level === 'warning').forEach((i) => out.push({ code: 'norm', check: i.code.split(':').pop(), text: i.text }));
  if ((didactics?.score ?? 100) < MIN_DIDACTIC_SCORE) out.push({ code: 'didactic', text: `didaktiline skoor ${didactics.score} < ${MIN_DIDACTIC_SCORE}: ${didactics.issues.map((i) => i.text).join(' · ')}` });
  const ids = (doc.blocks || []).map((b) => b.id);
  if (new Set(ids).size !== ids.length) out.push({ code: 'ids', text: 'korduvad ploki id-d' });
  const n = doc.blocks.length;
  // a sheet is a whole lesson (owner 2026-10-10: 60 min lesson, 40–55 min of work on the sheet)
  if (n < 6 || n > 18) out.push({ code: 'length', text: `${n} plokki (lubatud 6–18)` });
  const minutes = sheetMinutes(doc);
  if (!doc.meta?.shortSheet && (minutes < SHEET_MINUTES.min || minutes > SHEET_MINUTES.max)) out.push({ code: 'minutes', text: `tööaeg ≈ ${minutes} min (terve tund ${SHEET_MINUTES.min}–${SHEET_MINUTES.max} min)` });
  if (typeSet(doc).size < 5) out.push({ code: 'variety', text: `ainult ${typeSet(doc).size} erinevat ülesandetüüpi (vähemalt 5)` });
  const last = doc.blocks[n - 1]?.type;
  // design v2 (docs/COURSE_DESIGN_COMMUNICATIVE.md): a sheet may end with the task itself; a self-check only once a lesson
  const v2 = doc.meta?.design === 'v2';
  const endsWell = last === 'selfcheck' || last === 'rubric' || (v2 && PRODUCTIVE.includes(last));
  if (!endsWell) out.push({ code: 'end', text: v2 ? 'leht lõpeb ülesande, rubriigi või enesehinnanguga' : 'leht lõpeb enesehinnangu või rubriigiga' });
  const phase = doc.meta?.phase;
  // v2: the Harjuta sheet of an exam lesson is the exam's reading and listening part — exam formats, not practice jobs
  if (phase === 'practice' && !(v2 && doc.meta?.assessment)) {
    if (!has(doc, FORM)) out.push({ code: 'practice-form', text: 'Harjuta: puudub vormiülesanne' });
    if (!has(doc, MEANING)) out.push({ code: 'practice-meaning', text: 'Harjuta: puudub tähendusülesanne' });
    if (!has(doc, SENTENCE)) out.push({ code: 'practice-sentence', text: 'Harjuta: puudub lause tasandi ülesanne (viga / sõnajärg / teisendus)' });
    if (!has(doc, PRODUCTIVE)) out.push({ code: 'practice-use', text: 'Harjuta: puudub suuline või kirjalik kasutus' });
  }
  if (phase === 'transfer') {
    if (!SITUATION.includes(doc.blocks[0]?.type)) out.push({ code: 'transfer-situation', text: 'Kasuta: leht algab uue olukorraga' });
    const productive = new Set(tasks(doc).filter((b) => PRODUCTIVE.includes(b.type)).map((b) => b.type));
    if (productive.size < 2) out.push({ code: 'transfer-use', text: 'Kasuta: vähemalt kaks eri tüüpi suulist / kirjalikku ülesannet' });
    // v2: the use task has one assessed result
    if (v2 && !(doc.blocks || []).some((b) => b.type === 'rubric')) out.push({ code: 'transfer-rubric', text: 'Kasuta: ülesande tulemust hindab rubriik' });
  }
  return out;
}

// a module: { [lessonId]: { practice: doc, transfer: doc, … } } → [{ lessonId, phase, code, text }]
export function moduleProblems(sheets) {
  const out = [];
  const lessonIds = Object.keys(sheets);
  for (const lessonId of lessonIds) {
    for (const [phase, doc] of Object.entries(sheets[lessonId])) sheetProblems(doc).forEach((p) => out.push({ lessonId, phase, ...p }));
    const docs = Object.values(sheets[lessonId]);
    if (new Set(docs.map((d) => tasks(d).map((b) => b.type).join('|'))).size !== docs.length) out.push({ lessonId, phase: '*', code: 'phases-same', text: 'tunni etappidel on sama ülesannete jada' });
  }
  for (const phase of ['discover', 'practice', 'transfer']) {
    const list = lessonIds.filter((id) => sheets[id][phase]).map((id) => [id, sheets[id][phase]]);
    const seqs = list.map(([, d]) => tasks(d).map((b) => b.type).join('|'));
    if (new Set(seqs).size !== seqs.length) out.push({ lessonId: '*', phase, code: 'module-same', text: 'mooduli kahel lehel on sama ülesannete jada' });
    for (let i = 1; i < list.length; i += 1) {
      const o = overlap(list[i - 1][1], list[i][1]);
      if (o > 0.75) out.push({ lessonId: list[i][0], phase, code: 'neighbour', text: `liiga sarnane eelmise tunniga (${Math.round(o * 100)}% samu ülesandetüüpe)` });
    }
  }
  out.push(...harnoProblems(sheets));
  out.push(...varietyProblems(sheets));
  return out;
}

// Design v2 (docs/COURSE_DESIGN_COMMUNICATIVE.md §5): a module is varied on purpose — consecutive lessons open a
// phase differently, neighbours share at most 60 % of the task types, the module uses ≥ 16 block types, at most one
// self-check per lesson. Modules written before v2 are not checked here.
const OPENERS = new Set(['text', 'tip', 'image', 'heading']);
const openingOf = (doc) => (doc.blocks || []).find((b) => !OPENERS.has(b.type))?.type || '';
export function varietyProblems(sheets) {
  const ids = Object.keys(sheets);
  const first = Object.values(sheets[ids[0]] || {})[0];
  if (first?.meta?.design !== 'v2') return [];
  const out = [];
  const docs = ids.flatMap((id) => Object.values(sheets[id]));
  const types = new Set(docs.flatMap((d) => (d.blocks || []).map((b) => b.type)));
  if (types.size < 16) out.push({ lessonId: '*', phase: '*', code: 'module-variety', text: `moodulis on ${types.size} plokitüüpi (v2: vähemalt 16)` });
  for (const id of ids) {
    const checks = Object.values(sheets[id]).filter((d) => (d.blocks || []).some((b) => b.type === 'selfcheck')).length;
    if (checks > 1) out.push({ lessonId: id, phase: '*', code: 'selfcheck-once', text: `enesehinnang ${checks} lehel (v2: üks kord tunnis)` });
  }
  for (const phase of ['discover', 'practice', 'transfer']) {
    const list = ids.filter((id) => sheets[id][phase] && !sheets[id][phase].meta?.assessment).map((id) => [id, sheets[id][phase]]);
    for (let i = 1; i < list.length; i += 1) {
      if (openingOf(list[i - 1][1]) === openingOf(list[i][1])) out.push({ lessonId: list[i][0], phase, code: 'same-opening', text: `algab samamoodi kui eelmine tund (${openingOf(list[i][1])})` });
      const o = overlap(list[i - 1][1], list[i][1]);
      if (o > 0.6) out.push({ lessonId: list[i][0], phase, code: 'neighbour-v2', text: `liiga sarnane eelmise tunniga (${Math.round(o * 100)}% samu ülesandetüüpe, v2: kuni 60%)` });
    }
  }
  return out;
}

// What the module must train for its Harno exam (levels.js HARNO): a listening task and at least one reading text near
// the exam's longest text. Checked per module, not per sheet: one exam-length text a module is enough.
export function harnoProblems(sheets) {
  const docs = Object.values(sheets).flatMap((lesson) => Object.values(lesson));
  const harno = harnoFor(docs[0]?.meta?.level);
  if (!harno) return [];
  const out = [];
  const blocks = docs.flatMap((d) => d.blocks || []);
  if (harno.listening && !blocks.some((b) => b.type === 'listening')) out.push({ lessonId: '*', phase: '*', code: 'harno-listening', text: `moodulis pole ühtki kuulamisülesannet (Harno ${harno.level} eksamil on kuulamine veerand punktidest)` });
  const longest = Math.max(0, ...blocks.filter((b) => b.type === 'reading').map((b) => String(b.data?.passage || '').split(/\s+/).filter(Boolean).length));
  const want = Math.round(harno.longestText * 0.8);
  if (longest < want) out.push({ lessonId: '*', phase: '*', code: 'harno-reading', text: `pikim lugemistekst on ${longest} sõna — Harno ${harno.level} eksami pikim tekst on ~${harno.longestText} sõna; vähemalt üks tekst moodulis ≥ ${want} sõna` });
  return out;
}

// The quality baseline (qualityBaseline.json): problems the course had when a check was introduced. They are shown but
// do not lock publishing; a new problem does, and a fixed one must leave the baseline (the course test says how).
export const problemKey = (p) => [p.lessonId, p.phase, p.check || p.code].join('|');
export function splitByBaseline(moduleId, problems, baseline = BASELINE) {
  const left = new Map();
  (baseline[moduleId] || []).forEach((k) => left.set(k, (left.get(k) || 0) + 1));
  const fresh = []; const known = [];
  problems.forEach((p) => {
    const k = problemKey(p);
    if (left.get(k)) { known.push(p); left.set(k, left.get(k) - 1); } else fresh.push(p);
  });
  const fixed = [...left].flatMap(([k, n]) => Array(n).fill(k));
  return { fresh, known, fixed };
}

// the type mix of a course part, for the production page and the docs
export function typeMix(docs) {
  const count = {};
  docs.forEach((d) => tasks(d).forEach((b) => { count[b.type] = (count[b.type] || 0) + 1; }));
  return Object.entries(count).sort((a, b) => b[1] - a[1]);
}
