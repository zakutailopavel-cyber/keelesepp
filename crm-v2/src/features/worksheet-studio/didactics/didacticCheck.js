import { groupItems } from '../engine/schema.js';
// The didactic check of a worksheet against its level's norms (levels.js). Used by the constructor (quality list),
// the generator's self-check and, later, to filter what the local models write. It measures what can be measured
// without a morphological analyser: sentence length, items per task, reading length and question types, writing and
// speaking amounts, scaffolding (word bank, solved example), recognition vs production, instruction length.
// Returns { level, label, checks[], score, issues[] } — issues never block publishing (warning / tip only).
import { BLOCKS } from '../engine/registry.js';
import { HARNO, LEVELS, PHASE_TASKS, levelKey } from './levels.js';
import { VOCABULARY_FOR, wordLevel } from './levelVocabulary.js';

const lines = (value) => String(value || '').split('\n').map((x) => x.trim()).filter(Boolean);
// „Ma ärkan [hommikul|varakult] kell 7.” → the sentence as the learner will read it once solved
const solved = (text) => String(text || '').replace(/\[([^\]|]*)(\|[^\]]*)?\]/g, '$1').replace(/^\*/, '').trim();
const wordsIn = (text) => String(text || '').split(/\s+/).filter((w) => /[\p{L}\p{N}]/u.test(w)).length;
const sentencesIn = (text) => String(text || '').split(/(?<=[.!?…])\s+|\n+/).map((s) => s.trim()).filter((s) => wordsIn(s) >= 2);
const INFERENCE = /\b(miks|kuidas|mida (sa )?arvad|mis sa arvad|põhjenda|selgita|mida tähendab|mis on (teksti|loo) (mõte|peamõte)|kas oled nõus)\b/i;

// Can the task be solved without knowing Estonian, or not solved at all? (owner's audit 2026-10-12, docs/DIDACTIC_ENGINE.md
// „Lahendatavus”). These are the faults the level audit found across all courses; each is a warning from A2+ on.
const EASY_LEVELS = new Set(['A1', 'A2']);
const listOf = (value) => String(value || '').split(/[,\n;]/).map((x) => x.trim()).filter(Boolean);
const normText = (value) => String(value || '').toLocaleLowerCase('et').replace(/[.,!?;:„“”"«»()…–—-]/g, ' ').replace(/\s+/g, ' ').trim();
const CYRILLIC = /[А-Яа-яЁё]/;
// a false statement that is false because of „always / only / never” is guessed without the text
const ABSOLUTE = /\b(alati|ainult|üksnes|mitte kunagi|mitte keegi|iial|kõik|kogu aeg|igal pool)\b/i;
const answersOf = (line) => (String(line).match(/\[([^\]]*)\]/)?.[1] || '').split('|').map((x) => x.trim()).filter(Boolean);

function solvabilityChecks(tasks, { key, norm: level, name, add }) {
  // the mother-tongue course fixes commas and capitals too: there sentences are compared as written
  const cmp = key.startsWith('EK') ? (v) => String(v || '').replace(/\s+/g, ' ').trim() : normText;
  const severity = EASY_LEVELS.has(key) ? 'tip' : 'warning';
  const harno = HARNO[{ 'B2-': 'B2', B2: 'B2', C1: 'C1' }[key]];
  tasks.forEach((b) => {
    const d = b.data || {};
    if (b.type === 'choice') {
      const qs = (d.questions || []).map((q) => {
        const opts = String(q.options || '').split('\n').map((o) => o.trim()).filter(Boolean);
        const right = opts.filter((o) => o.startsWith('*')).map((o) => o.slice(1));
        const wrong = opts.filter((o) => !o.startsWith('*'));
        const words = (o) => wordsIn(o);
        const longest = Math.max(0, ...wrong.map(words));
        return { opts, right, wrong, giveaway: right.length === 1 && words(right[0]) >= 4 && words(right[0]) >= 2 * Math.max(1, longest) };
      });
      const few = qs.filter((q) => q.opts.length < 3).length;
      add(`choice-options-${b.id}`, `${name(b)}: valikuid on piisavalt`, few === 0,
        { detail: `${name(b)}: ${few} küsimuses on alla 3 valiku — vastuse saab arvata. Anna 3 valikut (Harno B2/C1: 4).`, severity, blockId: b.id });
      if (harno && !few) add(`choice-four-${b.id}`, `${name(b)}: neli valikut (Harno ${harno.level})`, qs.every((q) => q.opts.length >= harno.options),
        { detail: `${name(b)}: Harno ${harno.level} eksamil on lünga juures ${harno.options} valikut; siin on vähem.`, blockId: b.id });
      const giveaways = qs.filter((q) => q.giveaway).length;
      add(`choice-length-${b.id}`, `${name(b)}: õige vastus ei paista pikkuse järgi`, !(giveaways >= 2 && giveaways >= qs.length / 2),
        { detail: `${name(b)}: ${giveaways} küsimuses on õige vastus mitu korda pikem kui teised — selle saab ära arvata keelt oskamata. Tee valikud ühepikkuseks ja usutavaks.`, severity, blockId: b.id });
      if (!EASY_LEVELS.has(key)) add(`choice-russian-${b.id}`, `${name(b)}: valikud on eesti keeles`, !qs.some((q) => q.opts.some((o) => CYRILLIC.test(o))),
        { detail: `${name(b)}: valikud on vene keeles — tasemel ${level.label} vali tähendus eesti keeles (seletus, sünonüüm, kontekst).`, severity: 'warning', blockId: b.id });
    }
    if (b.type === 'wordforms') {
      // the same word with the same (or no) hint but different answers: the learner cannot know which form is wanted
      const seen = new Map();
      let ambiguous = 0; let given = 0;
      (d.rows || []).forEach((r) => {
        const k = `${normText(r.base)}|${normText(r.prompt)}`;
        if (seen.has(k) && seen.get(k) !== normText(r.answer)) ambiguous += 1;
        seen.set(k, normText(r.answer));
        if (normText(r.prompt) && normText(r.prompt) === normText(r.answer)) given += 1;
      });
      add(`forms-which-${b.id}`, `${name(b)}: on selge, millist vormi on vaja`, ambiguous === 0,
        { detail: `${name(b)}: sama sõna ja sama vihjega read ootavad eri vorme (${ambiguous}) — ülesanne pole üheselt lahendatav. Kirjuta vihjesse vorm (nt „mitmuse osastav”, „ma-tegevusnimi”) või lauseosa.`, severity: 'warning', blockId: b.id });
      add(`forms-given-${b.id}`, `${name(b)}: vastus pole vihjes`, given === 0,
        { detail: `${name(b)}: ${given} real on vastus juba vihjes kirjas.`, severity: 'warning', blockId: b.id });
    }
    if (b.type === 'errorfix') {
      const same = (d.rows || []).filter((r) => cmp(r.wrong) && cmp(r.wrong) === cmp(r.answer)).length;
      add(`errorfix-none-${b.id}`, `${name(b)}: igas reas on viga`, same === 0,
        { detail: `${name(b)}: ${same} real on „vale” ja „õige” lause samad — seal pole midagi parandada.`, severity: 'warning', blockId: b.id });
    }
    if (b.type === 'transformation') {
      const same = (d.rows || []).filter((r) => cmp(r.from) && cmp(r.from) === cmp(r.answer)).length;
      add(`transform-none-${b.id}`, `${name(b)}: lauset tuleb muuta`, same === 0,
        { detail: `${name(b)}: ${same} real on vastus sama mis lähtelause.`, severity: 'warning', blockId: b.id });
    }
    if (b.type === 'categorize') {
      const groups = (d.groups || []).map((g) => listOf(Array.isArray(g.items) ? g.items.join(',') : g.words ?? g.items).map(normText).sort().join('|'));
      const dup = groups.length - new Set(groups.filter(Boolean)).size - groups.filter((g) => !g).length;
      add(`categorize-same-${b.id}`, `${name(b)}: rühmades on eri sõnad`, dup === 0,
        { detail: `${name(b)}: mitmes rühmas on täpselt samad sõnad — sorteerida pole võimalik.`, severity: 'warning', blockId: b.id });
    }
    if (b.type === 'truefalse') {
      const st = d.statements || [];
      const falseAbs = st.filter((s) => s.answer === 'false' && ABSOLUTE.test(s.text)).length;
      const trueAbs = st.filter((s) => s.answer === 'true' && ABSOLUTE.test(s.text)).length;
      add(`tf-absolute-${b.id}`, `${name(b)}: valed väited ei paista sõna „alati / ainult” järgi`, !(falseAbs >= 2 && trueAbs === 0),
        { detail: `${name(b)}: ${falseAbs} vales väites on „alati / ainult / kõik”, õigetes mitte — vastuse saab arvata teksti lugemata.`, blockId: b.id });
    }
    if (b.type === 'reading' && !EASY_LEVELS.has(key) && key !== 'A2+') {
      // answers a learner copies from the text word for word (fine at A2, too easy from B1- on)
      const passage = normText(d.passage);
      const qs = lines(d.questions).map(answersOf).filter((a) => a.length);
      const copied = qs.filter((a) => a.some((x) => wordsIn(x) <= 3 && passage.includes(normText(x)))).length;
      add(`reading-copy-${b.id}`, `${name(b)}: küsimused nõuavad mõistmist`, !(qs.length >= 3 && copied / qs.length >= 0.8),
        { detail: `${name(b)}: ${copied} vastust ${qs.length}-st saab tekstist sõna-sõnalt kopeerida. Lisa küsimusi, mis nõuavad ümbersõnastamist, valikut või järeldust (Harno: valikvastused, väide ↔ lõik).`, severity: ['B1-', 'B1'].includes(key) ? 'tip' : 'warning', blockId: b.id });
    }
  });
}

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
    case 'categorize': items = (d.groups || []).reduce((n, g) => n + groupItems(g).length, 0); break;
    case 'reading': sentencesIn(d.passage).forEach((x) => s.push(x)); items = lines(d.questions).length; break;
    // a text with option gaps: the solved text (right options), one answer per gap
    case 'cloze': sentencesIn(String(d.passage || '').replace(/\{([^}]*)\}/g, (_, o) => (o.split('|').find((x) => x.trim().startsWith('*')) || '').replace('*', '').trim())).forEach((x) => s.push(x)); items = (String(d.passage || '').match(/\{/g) || []).length; break;
    // „Pane sõnad õigesse vormi” on a text: the solved text, one answer per gap
    case 'formtext': sentencesIn(String(d.passage || '').replace(/\[([^\]]*)\]\s*\([^)]*\)/g, (_, a) => a.split('|')[0].trim())).forEach((x) => s.push(x)); items = (String(d.passage || '').match(/\]\s*\(/g) || []).length; break;
    // „Lünka sobiv lause”: the whole text, one answer per taken-out sentence
    case 'insertion': sentencesIn(String(d.passage || '').replace(/\[\[|\]\]/g, '')).forEach((x) => s.push(x)); items = (String(d.passage || '').match(/\[\[/g) || []).length; break;
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
    const tooSimple = ['B1-', 'B1', 'B1+', 'B2-', 'B2', 'C1'].includes(key) && avg < norm.sentence.avg * 0.55;
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
    if (norm.bank === 'yes' || norm.bank === 'extra') return;
    add(`bank-${b.id}`, `${name(b)}: sõnapank`, false,
      { detail: `${name(b)}: sõnapangast saab vastuse lihtsalt kopeerida. Tasemel ${norm.label} ${norm.bank === 'no' ? 'jäta pank ära või anna algvormid' : 'anna pangas algvormid (õpilane moodustab vormi ise) või lisa segajaid'}.`, severity: norm.bank === 'no' ? 'warning' : 'tip', blockId: b.id });
  });
  // a bank of exactly as many words as gaps is solved by elimination (Harno's banks always hold extra options)
  tasks.filter((b) => b.type === 'gaps' && b.data?.showBank !== 'no' && String(b.data?.bank || '').trim()).forEach((b) => {
    const bank = listOf(b.data.bank).length;
    const gaps = lines(b.data.sentences).reduce((n, l) => n + (l.match(/\[/g) || []).length, 0);
    add(`bank-extra-${b.id}`, `${name(b)}: sõnapangas on segajaid`, bank > gaps,
      { detail: `${name(b)}: pangas on ${bank} sõna ja ${gaps} lünka — viimase vastuse saab välistamisega. Lisa vähemalt 1–2 segajat.`, severity: EASY_LEVELS.has(key) ? 'tip' : 'warning', blockId: b.id });
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
    const advanced = ['A2+', 'B1-', 'B1', 'B1+', 'B2-', 'B2', 'C1'].includes(key) || phase === 'transfer';
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

  solvabilityChecks(tasks, { key, norm, name, add });

  // instructions the learner reads alone
  tasks.forEach((b) => {
    const n = wordsIn(b.data?.instruction);
    if (n > norm.instructionWords) add(`instruction-${b.id}`, `${name(b)}: juhise pikkus`, false, { detail: `${name(b)}: juhises on ${n} sõna — tasemel ${norm.label} kuni ~${norm.instructionWords}; ütle lühemalt.`, blockId: b.id });
  });

  // a warning costs 12 points, a tip 6 (a sheet with one small tip is not „0%”)
  const score = Math.max(0, 100 - issues.reduce((n, i) => n + (i.level === 'warning' ? 12 : 6), 0));
  return { level: key, label: norm.label, phase, checks, score, issues };
}
