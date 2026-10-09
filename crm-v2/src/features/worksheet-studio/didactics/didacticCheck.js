// The didactic check of a worksheet against its level's norms (levels.js). Used by the constructor (quality list),
// the generator's self-check and, later, to filter what the local models write. It measures what can be measured
// without a morphological analyser: sentence length, items per task, reading length and question types, writing and
// speaking amounts, scaffolding (word bank, solved example), recognition vs production, instruction length.
// Returns { level, label, checks[], score, issues[] } — issues never block publishing (warning / tip only).
import { BLOCKS } from '../engine/registry.js';
import { LEVELS, PHASE_TASKS, levelKey } from './levels.js';
import { VOCABULARY_FOR, wordLevel } from './levelVocabulary.js';

const lines = (value) => String(value || '').split('\n').map((x) => x.trim()).filter(Boolean);
// „Ma ärkan [hommikul|varakult] kell 7.” → the sentence as the learner will read it once solved
const solved = (text) => String(text || '').replace(/\[([^\]|]*)(\|[^\]]*)?\]/g, '$1').replace(/^\*/, '').trim();
const wordsIn = (text) => String(text || '').split(/\s+/).filter((w) => /[\p{L}\p{N}]/u.test(w)).length;
const sentencesIn = (text) => String(text || '').split(/(?<=[.!?…])\s+|\n+/).map((s) => s.trim()).filter((s) => wordsIn(s) >= 2);
const INFERENCE = /\b(miks|kuidas|mida (sa )?arvad|mis sa arvad|põhjenda|selgita|mida tähendab|mis on (teksti|loo) (mõte|peamõte)|kas oled nõus)\b/i;

// the learner-facing sentences of a task (solved) and how many answers it asks
export function measureBlock(block) {
  const d = block?.data || {};
  const s = [];
  let items = 0;
  switch (block?.type) {
    case 'gaps': case 'listening': case 'wordorder': lines(d.sentences).forEach((l) => s.push(solved(l))); items = lines(d.sentences).length; break;
    case 'dialogue': (d.lines || []).forEach((l) => s.push(solved(l.text))); items = (JSON.stringify(d.lines || []).match(/\[/g) || []).length; break;
    case 'truefalse': (d.statements || []).forEach((st) => s.push(st.text)); items = (d.statements || []).length; break;
    // only the questions: answer options are short by nature
    case 'choice': (d.questions || []).forEach((q) => s.push(q.q)); items = (d.questions || []).length; break;
    case 'errorfix': (d.rows || []).forEach((r) => s.push(r.answer)); items = (d.rows || []).length; break;
    case 'wordforms': case 'translation': case 'transformation': items = (d.rows || []).length; (d.rows || []).forEach((r) => { if (r.answer && wordsIn(r.answer) > 2) s.push(r.answer); }); break;
    case 'match': items = (d.pairs || []).length; break;
    case 'manymatch': items = lines(d.left).length; break;
    case 'categorize': items = (d.groups || []).reduce((n, g) => n + String(g.words || '').split(',').filter((w) => w.trim()).length, 0); break;
    case 'reading': sentencesIn(d.passage).forEach((x) => s.push(x)); items = lines(d.questions).length; break;
    default: break;
  }
  return { sentences: s.filter((x) => wordsIn(x) >= 2), items };
}

// The lesson phase of a sheet: given, or read from a generated sheet's title/subtitle („… — Harjuta”). Avasta and
// Harjuta sheets do not need speaking or writing — that is Kasuta's job.
const PHASE_WORDS = [['discover', /\b(avasta|märka)/i], ['practice', /\bharjuta/i], ['transfer', /\bkasuta/i]];
export function sheetPhase(doc) {
  const m = doc?.meta || {};
  if (['discover', 'practice', 'transfer', 'full'].includes(m.phase)) return m.phase;
  const text = `${m.title || ''} ${m.subtitle || ''}`;
  const found = PHASE_WORDS.filter(([, re]) => re.test(text)).map(([phase]) => phase);
  return found.length === 1 ? found[0] : 'full';
}

// `forms`: the EKI level vocabularies (levelVocabulary.js loadLevelForms); without them the vocabulary is not checked
export function didacticCheck(doc, { level = doc?.meta?.level, phase = sheetPhase(doc), forms = null } = {}) {
  const key = levelKey(level);
  const norm = LEVELS[key];
  const tasks = (doc?.blocks || []).filter((b) => BLOCKS[b.type]?.task);
  const checks = [];
  const issues = [];
  const add = (code, label, ok, { detail = '', severity = 'tip', blockId = '' } = {}) => {
    checks.push({ code, label, ok, detail, blockId });
    if (!ok) issues.push({ level: severity, code: blockId ? `${blockId}:did-${code}` : `did-${code}`, text: `Tase ${norm.label}: ${detail || label}` });
  };
  const name = (b) => `${tasks.indexOf(b) + 1}. ${BLOCKS[b.type]?.label || b.type}`;

  // sentence length over all tasks
  const measured = tasks.map((b) => ({ b, ...measureBlock(b) }));
  const all = measured.flatMap((m) => m.sentences);
  if (all.length >= 3) {
    const avg = all.reduce((n, x) => n + wordsIn(x), 0) / all.length;
    const longest = measured.flatMap((m) => m.sentences.map((x) => ({ b: m.b, n: wordsIn(x), x }))).sort((a, b) => b.n - a.n)[0];
    // too simple only matters from B1- on (short sentences are right for beginners)
    const tooSimple = ['B1-', 'B1', 'B2', 'C1'].includes(key) && avg < norm.sentence.avg * 0.55;
    add('sentence-avg', 'Lause pikkus sobib tasemele', avg <= norm.sentence.avg * 1.25 && !tooSimple,
      { detail: !tooSimple ? `laused on keskmiselt ${Math.round(avg)} sõna, tasemel ${norm.label} sobib kuni ~${norm.sentence.avg}.` : `laused on keskmiselt ${Math.round(avg)} sõna — tasemele ${norm.label} liiga lihtsad (~${norm.sentence.avg}).`, severity: 'warning' });
    add('sentence-max', 'Ükski lause pole liiga pikk', longest.n <= norm.sentence.max,
      { detail: `${name(longest.b)}: lause „${longest.x.slice(0, 60)}${longest.x.length > 60 ? '…' : ''}” on ${longest.n} sõna (tasemel kuni ${norm.sentence.max}).`, blockId: longest.b.id });
  }

  // items per closed task
  measured.filter((m) => m.items && !PHASE_TASKS.productive.includes(m.b.type) && m.b.type !== 'reading').forEach(({ b, items }) => {
    const [min, rawMax] = norm.items;
    // sorting words into groups is quick per word: only the minimum counts
    const max = b.type === 'categorize' ? Infinity : rawMax;
    add(`items-${b.id}`, `${name(b)}: vastuste arv`, items >= min && items <= max,
      { detail: items < min ? `${name(b)}: ainult ${items} vastust — tasemel ${norm.label} vähemalt ${min}, et oskus kinnistuks.` : `${name(b)}: ${items} vastust — rohkem kui ${max}, ülesanne väsitab; jaga kaheks.`, blockId: b.id });
  });

  // reading: length, number and kind of questions
  tasks.filter((b) => b.type === 'reading').forEach((b) => {
    const n = wordsIn(b.data?.passage);
    const [min, max] = norm.reading.words;
    add(`reading-len-${b.id}`, `${name(b)}: teksti pikkus`, n >= min && n <= max,
      { detail: `${name(b)}: tekstis on ${n} sõna, tasemel ${norm.label} sobib ${min}–${max}.`, severity: 'warning', blockId: b.id });
    const q = lines(b.data?.questions);
    if (norm.reading.inference) {
      add(`reading-inf-${b.id}`, `${name(b)}: järeldav küsimus`, q.some((x) => INFERENCE.test(x)),
        { detail: `${name(b)}: kõik küsimused on faktiküsimused. Tasemel ${norm.label} lisa vähemalt üks „miks / kuidas / mida arvad” küsimus.`, blockId: b.id });
    }
  });

  // productive amounts
  tasks.filter((b) => b.type === 'writing').forEach((b) => {
    const want = norm.writing.sentences;
    if (!want) return;
    const lo = Number(b.data?.minSent) || 0; const hi = Number(b.data?.maxSent) || lo;
    add(`writing-${b.id}`, `${name(b)}: kirjutamise maht`, lo >= want[0] - 1 && hi <= want[1] + 2,
      { detail: `${name(b)}: ${lo}–${hi} lauset, tasemel ${norm.label} sobib ${want[0]}–${want[1]}.`, blockId: b.id });
  });
  tasks.filter((b) => b.type === 'guidedletter').forEach((b) => {
    const want = norm.writing.words;
    if (!want) return;
    const lo = Number(b.data?.minWords) || 0; const hi = Number(b.data?.maxWords) || lo;
    add(`letter-${b.id}`, `${name(b)}: kirja pikkus`, lo >= want[0] * 0.8 && hi <= want[1] * 1.2,
      { detail: `${name(b)}: ${lo}–${hi} sõna, tasemel ${norm.label} sobib ${want[0]}–${want[1]}.`, blockId: b.id });
  });
  tasks.filter((b) => b.type === 'speaking').forEach((b) => {
    const [lo, hi] = norm.speaking;
    const min = Number(b.data?.minSec) || 0; const max = Number(b.data?.maxSec) || min;
    add(`speaking-${b.id}`, `${name(b)}: rääkimise aeg`, min >= lo * 0.75 && max <= hi * 1.25,
      { detail: `${name(b)}: ${min}–${max} s, tasemel ${norm.label} sobib ${lo}–${hi} s.`, blockId: b.id });
  });

  // scaffolding
  tasks.filter((b) => b.type === 'gaps' && b.data?.showBank !== 'no' && String(b.data?.bank || '').trim()).forEach((b) => {
    if (norm.bank === 'yes') return;
    add(`bank-${b.id}`, `${name(b)}: sõnapank`, false,
      { detail: `${name(b)}: sõnapangast saab vastuse lihtsalt kopeerida. Tasemel ${norm.label} ${norm.bank === 'no' ? 'jäta pank ära või anna algvormid' : 'anna pangas algvormid (õpilane moodustab vormi ise) või lisa segajaid'}.`, severity: norm.bank === 'no' ? 'warning' : 'tip', blockId: b.id });
  });
  tasks.filter((b) => b.opts?.example).forEach((b) => {
    if (norm.example !== 'no') return;
    add(`example-${b.id}`, `${name(b)}: lahendatud näide`, false, { detail: `${name(b)}: lahendatud näide pole tasemel ${norm.label} enam vajalik — see võtab ühe vastuse ära.`, blockId: b.id });
  });

  // recognition vs production, and the way from input to use
  if (tasks.length >= 3) {
    const closed = tasks.filter((b) => PHASE_TASKS.recognition.includes(b.type)).length;
    add('closed-share', 'Äratundmisülesandeid pole liiga palju', closed / tasks.length <= norm.closedShare,
      { detail: `${closed} ülesannet ${tasks.length}-st on äratundmine (õige/vale, ühendamine, valik). Tasemel ${norm.label} peaks õpilane rohkem ise moodustama.`, severity: 'warning' });
    const productive = tasks.filter((b) => PHASE_TASKS.productive.includes(b.type));
    const advanced = ['A2+', 'B1-', 'B1', 'B2', 'C1'].includes(key) || phase === 'transfer';
    if (phase === 'full' || phase === 'transfer') add('productive', 'Lehel on rääkimine või kirjutamine', productive.length > 0,
      { detail: 'lehel pole rääkimist ega kirjutamist — lisa „Räägi”, „Rollikaardid” või „Kirjuta”, et õpilane kasutaks keelt ise.', severity: advanced ? 'warning' : 'tip' });
    const firstProductive = tasks.findIndex((b) => PHASE_TASKS.productive.includes(b.type));
    const lastControlled = tasks.map((b) => PHASE_TASKS.controlled.includes(b.type)).lastIndexOf(true);
    if (firstProductive >= 0 && lastControlled >= 0) {
      add('progression', 'Järjestus: kõigepealt harjutamine, siis kasutamine', firstProductive > tasks.findIndex((b) => PHASE_TASKS.controlled.includes(b.type)),
        { detail: 'iseseisev rääkimine/kirjutamine on enne kontrollitud harjutamist. Pane harjutused ette, kasutamine lõppu.' });
    }
  }

  // vocabulary above the level (EKI etLex A1–C1 lists, every form): names (a capital inside a sentence) and numbers
  // are skipped; on C1 only words outside all lists are counted
  const allowed = VOCABULARY_FOR[key];
  if (forms && allowed && allowed.every((level) => forms[level])) {
    const texts = [...all, ...tasks.filter((b) => b.type === 'reading').flatMap((b) => [b.data?.passageTitle || ''])];
    const tokens = texts.flatMap((sentence) => String(sentence).split(/\s+/).map((raw, i) => ({ raw, i })))
      .map(({ raw, i }) => ({ w: raw.replace(/^[^\p{L}]+|[^\p{L}]+$/gu, ''), i, raw }))
      .filter(({ w, i }) => w.length > 2 && !/\d/.test(w) && !(i > 0 && /^\p{Lu}/u.test(w)) && !w.includes('-'));
    if (tokens.length >= 15) {
      const above = tokens.filter(({ w }) => { const lv = wordLevel(w, forms); return !lv || !allowed.includes(lv); });
      const share = above.length / tokens.length;
      const examples = [...new Set(above.map(({ w }) => w.toLocaleLowerCase('et')))].slice(0, 6);
      add('vocabulary', 'Sõnavara vastab tasemele', share <= 0.1,
        { detail: `${Math.round(share * 100)}% sõnadest pole tasemel ${norm.label} õpitavas sõnavaras (EKI etLex), nt ${examples.join(', ')}. Selgita need sõnad või asenda lihtsamatega.`, severity: share > 0.2 ? 'warning' : 'tip' });
    }
  }

  // instructions the learner reads alone
  tasks.forEach((b) => {
    const n = wordsIn(b.data?.instruction);
    if (n > norm.instructionWords) add(`instruction-${b.id}`, `${name(b)}: juhise pikkus`, false, { detail: `${name(b)}: juhises on ${n} sõna — tasemel ${norm.label} kuni ~${norm.instructionWords}; ütle lühemalt.`, blockId: b.id });
  });

  // a warning costs 12 points, a tip 6 (a sheet with one small tip is not „0%”)
  const score = Math.max(0, 100 - issues.reduce((n, i) => n + (i.level === 'warning' ? 12 : 6), 0));
  return { level: key, label: norm.label, phase, checks, score, issues };
}
