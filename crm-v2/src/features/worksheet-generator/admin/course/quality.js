// Quality gate for the course sheets (docs/B1_B2_COURSE_PRODUCTION.md §4). A sheet is publishable only when the
// constructor's own check finds no error, the level's didactic norms are mostly met, and the module stays varied:
// no two sheets of one phase share the same task sequence, neighbours differ, and each phase does its own job.
import { BLOCKS } from '../../../worksheet-studio/engine/registry.js';
import { analyzeWorksheet } from '../../../worksheet-studio/quality.js';

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
  didactics?.issues?.filter((i) => i.level === 'warning').forEach((i) => out.push({ code: 'norm', text: i.text }));
  if ((didactics?.score ?? 100) < MIN_DIDACTIC_SCORE) out.push({ code: 'didactic', text: `didaktiline skoor ${didactics.score} < ${MIN_DIDACTIC_SCORE}: ${didactics.issues.map((i) => i.text).join(' · ')}` });
  const ids = (doc.blocks || []).map((b) => b.id);
  if (new Set(ids).size !== ids.length) out.push({ code: 'ids', text: 'korduvad ploki id-d' });
  const n = doc.blocks.length;
  if (n < 6 || n > 10) out.push({ code: 'length', text: `${n} plokki (lubatud 6–10)` });
  if (typeSet(doc).size < 5) out.push({ code: 'variety', text: `ainult ${typeSet(doc).size} erinevat ülesandetüüpi (vähemalt 5)` });
  const last = doc.blocks[n - 1]?.type;
  if (last !== 'selfcheck' && last !== 'rubric') out.push({ code: 'end', text: 'leht lõpeb enesehinnangu või rubriigiga' });
  const phase = doc.meta?.phase;
  if (phase === 'practice') {
    if (!has(doc, FORM)) out.push({ code: 'practice-form', text: 'Harjuta: puudub vormiülesanne' });
    if (!has(doc, MEANING)) out.push({ code: 'practice-meaning', text: 'Harjuta: puudub tähendusülesanne' });
    if (!has(doc, SENTENCE)) out.push({ code: 'practice-sentence', text: 'Harjuta: puudub lause tasandi ülesanne (viga / sõnajärg / teisendus)' });
    if (!has(doc, PRODUCTIVE)) out.push({ code: 'practice-use', text: 'Harjuta: puudub suuline või kirjalik kasutus' });
  }
  if (phase === 'transfer') {
    if (!SITUATION.includes(doc.blocks[0]?.type)) out.push({ code: 'transfer-situation', text: 'Kasuta: leht algab uue olukorraga' });
    const productive = new Set(tasks(doc).filter((b) => PRODUCTIVE.includes(b.type)).map((b) => b.type));
    if (productive.size < 2) out.push({ code: 'transfer-use', text: 'Kasuta: vähemalt kaks eri tüüpi suulist / kirjalikku ülesannet' });
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
  return out;
}

// the type mix of a course part, for the production page and the docs
export function typeMix(docs) {
  const count = {};
  docs.forEach((d) => tasks(d).forEach((b) => { count[b.type] = (count[b.type] || 0) + 1; }));
  return Object.entries(count).sort((a, b) => b[1] - a[1]);
}
