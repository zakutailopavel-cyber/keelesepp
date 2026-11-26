// Gates G14–G25 of methodology v6 (docs/METHODOLOGY_V6.md) for the Estonian A2 (a2-*), B1 (A2→B1, a2b1-*) and B2
// (B1→B2, b1b2-*) courses: the systemic findings of the independent v5 audit (2026-11-25, B1 6.2 · B2 6.7 · A2 6.4 → 9/10)
// as rules. v6 extends v5: a v6 module passes G1–G13 (methodV5.js) and G14–G25. Pure and node-importable
// (tools/course-audit/method-v6.mjs prints the report): no block registry, no React.
//
//   methodV6Problems(input, { forms })   input = methodV5Input(mod) → [{ gate: 'G14'…'G25', code, lessonId, phase, blockId, text }]
//   methodV6Report(mod, { forms })       the problems + counts per gate and per lesson (the retrofit backlog)
//   formatMethodV6Report(r)              the report as plain text lines
//   `forms` = { A1: Set, A2: Set, B1: Set, B2: Set } of the EKI level word forms (levelVocabulary.js); without it G22
//   (the lexical profile) is not run.
//
// Strict for the modules listed in strictModulesV6.json (methodV6.test.js); the modules rewritten under v5 are measured
// against methodV6Baseline.json (their retrofit backlog: the count may fall, never rise).
//
// Markers the gates read (all on block.data unless said otherwise; see docs/METHODOLOGY_V6.md §3):
//   exit         a block of the lesson's exit check (stationBlocks.js exitCheck)
//   home         a home task (stationBlocks.js homeTask)
//   tag.main     the main task of Kasuta (blocks.js tag); without it the last speaking / writing task of Kasuta
//   taskType     the main task's archetype (V6.taskTypes); without it inferred from tag.task / the block type
//   support      the main task's „Abikaart”: 2–3 sentence starters (array or lines); stretch: one „Lisaväljakutse” line
//   criteria     on a selfcheck: the success criteria the learner rates (3-point scale) + evidence: true (one own sentence)
//   revisionOf   on a B2 block: the lesson id whose draft the learner revises („Parandatud versioon”, 5 min)
//   review       on a vocab block: ≥ 3 old words from 3–15 lessons back that the lesson uses again
//   pronunciation on a task: the pronunciation strand („Hääldusnurk”: välted, õ/ä/ö/ü, shadowing)
//   peerReply    a peer exchange (a product shared with a classmate who answers); mediaLog: the media-network log
//   open         on a transformation: free rewrites, checked by the teacher (or a model answer with „…”)
import { ownBlocks, learnerText, words, methodV5Input } from './methodV5.js';
import { moduleSheets } from './courseSheet.js';
import { clipScripts } from './listeningAudio.js';
import { ITEMS } from '../../../worksheet-studio/didactics/depth.js';
import { RUBRIC_SCALES } from '../../../worksheet-studio/engine/blocks/harnoScales.js';

export const V6 = Object.freeze({
  // G14: an exit check may hold at most this many form items next to its mini-performance
  exitFormItems: 1,
  // G15: share of the rule box's bold forms the lesson's form task must make the learner produce
  coverage: 0.6,
  // G17: at most this many teaching lessons a module with the same main-task type; identical station rhythms in a row
  sameType: 2,
  sameRhythm: 3,
  // G18: old words a vocabulary block brings back
  reviewWords: 3,
  // G21: instruction words (the purpose line counts while it is printed in the instruction)
  instructionWords: { a2: 12, b1Early: 18, b1Late: 25, b2: 25, b1LateFrom: 41 },
  // G22: share of tokens beyond the stage's EKI lists (inputs, cards, controls), and the least tokens a lesson needs
  lexisBeyond: 0.05,
  lexisMinTokens: 40,
  // G20: a B2 control's longest recording and the share of listening gap answers that may be copied from the script
  b2ControlAudioSec: 150,
  b2ControlVerbatim: 0.7,
  // G19: a transformation row whose key is longer than this, with one variant, is a free rewrite
  freeRewriteWords: 12,
  // the main-task archetypes a module rotates (§2 d)
  taskTypes: ['phone', 'message', 'jigsaw', 'survey', 'presentation', 'ranking', 'project', 'mediation', 'debate', 'roleplay', 'narrative', 'interview', 'infogap', 'essay', 'report', 'form'],
  wpm: 128,
});

export const GATES_V6 = {
  G14: 'väljumiskontroll = tunni oskuse lühike sooritus (sama oskus kui põhiülesandel), kõige rohkem üks vormiküsimus',
  G15: 'vormiülesanne laseb õppijal toota ≥ 60 % reeglikasti rõhutatud vormidest; vihje ei anna vastust ette',
  G16: 'B2: kirjutamise mustand tunnis, järgmise tunni alguses „Parandatud versioon” (revisionOf)',
  G17: 'põhiülesannete vaheldus: üks tüüp ≤ 2 tundi moodulis, jaamade rütm ei kordu > 3 tundi järjest',
  G18: 'hajutatud kordamine: sõnavarakast toob tagasi ≥ 3 vana sõna, mida tund kasutab; kodutöö viitab Harjutale',
  G19: 'vastusevõti mahub juhises öeldud sõnapiiri; vaba ümbersõnastus on õpetaja kontrollida',
  G20: 'kontroll: osa punktid = ülesannete punktid, hindamisjuhend iga kirjutamise ja rääkimise jaoks, B2 kontroll ≥ tundide tase',
  G21: 'Harno teine tingimus („ükski osa ei ole 0 punkti”) igas kontrollis (A2, B1, B2)',
  G22: 'juhise pikkus tasemeastme järgi (A2 ≤ 12, B1 ≤ 18 / ≤ 25, B2 ≤ 25 sõna); sõnavara profiil ≤ 5 % üle taseme',
  G23: 'hääldusnurk igas A2 / B1 tunnis (välted, õ/ä/ö/ü, varjutamine)',
  G24: 'diferentseerimine: põhiülesandel abikaart ja lisaväljakutse; enesekontroll edukriteeriumide ja oma lausega',
  G25: 'päris võrgustik: moodulist 2 õpetaja ei ole päris adressaat; üks kaaslase vastus ja üks meediapäeviku kirje moodulis',
};

const lines = (v) => (Array.isArray(v) ? v.map(String) : String(v || '').split('\n')).map((x) => x.trim()).filter(Boolean);
const blockText = (b) => learnerText(b?.data || {}).join('\n');
const moduleNumber = (id) => Number(String(id).split('-').pop()) || 1;

const SPEAK = new Set(['speaking', 'speakcard', 'rolecards']);
const WRITE = new Set(['writing', 'guidedletter', 'examwriting']);
const PERFORM = new Set([...SPEAK, ...WRITE]);
const skillOf = (b) => (SPEAK.has(b.type) ? 'S' : WRITE.has(b.type) ? 'W' : '');
// closed form tasks (their answers are the forms the learner produces)
const FORM_TASKS = new Set(['gaps', 'formtext', 'wordforms', 'transformation', 'errorfix', 'cloze', 'table']);
const CLOSED_ITEMS = (b) => {
  const d = b.data || {};
  if (b.type === 'reading') return lines(d.questions).length;
  if (b.type === 'listening') return (String(d.sentences || '').match(/\[[^\]]*\]/g) || []).length;
  if (b.type === 'cloze') return (String(d.passage || '').match(/\{[^}]*\}/g) || []).length;
  return ITEMS[b.type]?.(d) || 0;
};

// ---- main task ------------------------------------------------------------------------------------------------
// tag.task (taskCatalogue.js) → the v6 archetype
const TASK_TYPE = {
  S01: 'interview', S02: 'interview', S03: 'ranking', S04: 'phone', S05: 'infogap', S06: 'presentation', S07: 'narrative', S08: 'narrative',
  S09: 'survey', S10: 'roleplay', S11: 'debate', S12: 'ranking', S13: 'mediation', S14: 'debate', S15: 'presentation', S16: 'presentation',
  S17: 'debate', S18: 'presentation', S19: 'debate',
  W01: 'form', W02: 'message', W03: 'message', W04: 'message', W05: 'narrative', W06: 'narrative', W07: 'form', W08: 'message',
  W12: 'mediation', W13: 'message', W14: 'essay', W15: 'report', W16: 'report', W17: 'essay', W18: 'essay',
};
export function mainTaskType(b) {
  if (!b) return '';
  const d = b.data || {};
  if (d.taskType) return String(d.taskType);
  if (TASK_TYPE[b.tag?.task]) return TASK_TYPE[b.tag.task];
  if (b.type === 'speakcard') return d.mode === 'phone' ? 'phone' : 'ranking';
  if (b.type === 'rolecards') return /helist|telefon/i.test(`${d.title || ''} ${d.instruction || ''}`) ? 'phone' : 'roleplay';
  if (b.type === 'speaking') return 'interview';
  if (WRITE.has(b.type)) return 'message';
  return b.type;
}
// the lesson's in-class main tasks: tag.main (not at home, not the exit); else the last speaking / writing task of Kasuta
export function mainTasks(all) {
  const tagged = all.filter(({ b }) => b.tag?.main && !b.data?.home && !b.data?.exit);
  if (tagged.length) return tagged;
  const transfer = all.filter(({ p, b }) => p === 'transfer' && PERFORM.has(b.type) && !b.data?.home && !b.data?.exit);
  return transfer.length ? [transfer[transfer.length - 1]] : [];
}

// ---- G15: bold forms of the rule box and the answers of the form tasks ------------------------------------------
const norm = (w) => String(w || '').toLocaleLowerCase('et').replace(/[^\p{L}\p{N}-]/gu, '');
const tokens = (s) => String(s || '').split(/[\s/,;:()·…–—]+/).map(norm).filter((w) => w.length >= 2);
// grammar terms in bold are labels, not forms the learner produces
const TERM = /^(täis|osa)?sihitis|^(nimetav|omastav|osastav|kaasaütlev|saav|olev|seesütlev|sisseütlev|alaleütlev|alalütlev|alaltütlev|seestütlev|rajav|ilmaütlev)\b|kõneviis|infinitiiv|tegusõna|nimisõna|omadussõna|käände|^vorm|^reegel/iu;
export function boldForms(notice) {
  const text = lines(notice?.data?.lines).join('\n');
  return [...new Set([...text.matchAll(/\*\*([^*]+)\*\*/g)].map((m) => m[1].trim().replace(/[.:,;!?]+$/, '').toLocaleLowerCase('et')).filter((f) => f && !TERM.test(f)))];
}
// a bold form is produced when one of its words is among the answers (an ending „-ks” when an answer ends with it)
const producedBy = (answerTokens) => (form) => tokens(form).some((t) => (t.startsWith('-') ? t.length > 1 && [...answerTokens].some((a) => a.endsWith(t.slice(1))) : answerTokens.has(t)));
const alts = (s) => String(s || '').split(/[|;]/).map((x) => x.trim()).filter(Boolean);
// [{ answer: [variants], prompt: the item's visible text without the answer }]
export function formItems(b) {
  const d = b.data || {};
  const gapItems = (text) => {
    const out = [];
    lines(text).forEach((line) => {
      const visible = line.replace(/\[\[[^\]]*\]\]/g, ' ').replace(/\[[^\]]*\]/g, ' ').replace(/\{[^}]*\}/g, ' ');
      for (const m of line.matchAll(/\[(?!\[)([^\]]*)\]/g)) out.push({ answer: alts(m[1]), prompt: visible });
      for (const m of line.matchAll(/\{\*?([^|}]*)[^}]*\}/g)) out.push({ answer: [m[1].trim()], prompt: '' });
    });
    return out;
  };
  switch (b.type) {
    case 'gaps': return gapItems(d.sentences);
    case 'formtext': case 'cloze': return gapItems(d.passage);
    case 'table': return lines(d.rows).flatMap((row) => row.split('|').slice(1).flatMap((cell) => gapItems(cell)));
    case 'wordforms': return (d.rows || []).map((r) => ({ answer: alts(String(r.answer || '').replace(/,/g, '|')), prompt: `${r.base || ''} ${r.prompt || ''}`, base: r.base }));
    case 'transformation': return (d.rows || []).map((r) => ({ answer: alts(r.answer), prompt: '' }));
    case 'errorfix': return (d.rows || []).map((r) => ({ answer: alts(r.answer), prompt: '' }));
    default: return [];
  }
}
// an item whose answer stands in its own prompt (the hint gives it away): „(tomatid)” → tomatid
const givesAway = (item) => item.prompt && item.answer.length && item.answer.every((a) => {
  const w = norm(a);
  return w.length >= 2 && new RegExp(`(^|[^\\p{L}])${w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}([^\\p{L}]|$)`, 'iu').test(String(item.prompt).toLocaleLowerCase('et'));
});

// ---- G19: the word limit an instruction states --------------------------------------------------------------------
const NUM = { üks: 1, ühe: 1, kaks: 2, kahe: 2, kolm: 3, kolme: 3, neli: 4, nelja: 4, viis: 5, viie: 5 };
const num = (x) => (NUM[String(x).toLocaleLowerCase('et')] ?? Number(x));
const LIMIT_RE = /(?:(\d+|üks|ühe|kaks|kahe|kolm|kolme|neli|nelja)\s*(?:[–-]|või|kuni)\s*)?(?:kuni\s+)?(\d+|üks|ühe|kaks|kahe|kolm|kolme|neli|nelja|viis|viie)\s+sõna/iu;
export function wordLimit(instruction) {
  const m = String(instruction || '').match(LIMIT_RE);
  return m ? num(m[2]) : null;
}
const keyedAnswers = (b) => {
  const d = b.data || {};
  if (b.type === 'reading') return lines(d.questions).map((q) => alts(q.match(/\[([^\]]*)\]\s*$/)?.[1] || ''));
  if (b.type === 'listening' || b.type === 'gaps') return [...String(d.sentences || '').matchAll(/\[(?!\[)([^\]]*)\]/g)].map((m) => alts(m[1]));
  return [];
};
const FREE_REWRITE = /oma sõnadega|ümber|teisiti|viisakam|pehme|ametlik|register|lihtsamalt|lühemalt|parafraas/iu;
const isFreeModel = (answer) => /…|\.\.\./.test(String(answer || ''));

// ---- G20: points of a control part --------------------------------------------------------------------------------
const rubricMax = (b) => {
  const d = b.data || {};
  if (b.type === 'examrubric') {
    const crit = Array.isArray(d.criteria) && d.criteria.length ? d.criteria : RUBRIC_SCALES[d.scale]?.criteria || [];
    return crit.reduce((m, c) => m + (Number(c?.max) || (Array.isArray(c?.levels) ? c.levels.length - 1 : 0)), 0);
  }
  if (b.type === 'rubric') return lines(d.items).length * 2; // 0/1/2 rows
  return 0;
};

// ---- G22: instruction words and the lexical profile ----------------------------------------------------------------
const FALLBACK = /\*\*Kui jätsid jaama[\s\S]*$/u;
export const instructionWords = (b) => words(String(b.data?.instruction || '').replace(FALLBACK, ''));
function instructionCeiling(course, n) {
  const c = V6.instructionWords;
  if (course === 'a2') return c.a2;
  if (course === 'b2') return c.b2;
  return n >= c.b1LateFrom ? c.b1Late : c.b1Early;
}
const allowedLevels = (course, n) => (course === 'a2' ? ['A1', 'A2'] : course === 'b2' ? ['A1', 'A2', 'B1', 'B2'] : n >= 41 ? ['A1', 'A2', 'B1'] : ['A1', 'A2']);
// the learner-facing input of a block for the profile: texts, recordings, cards
function inputText(b) {
  const d = b.data || {};
  switch (b.type) {
    case 'reading': case 'cloze': case 'formtext': case 'insertion': return String(d.passage || '').replace(/\{\*?([^|}]*)[^}]*\}/g, '$1').replace(/\[\[|\]\]/g, ' ').replace(/\[([^\]|]*)[^\]]*\]/g, '$1');
    case 'listening': case 'examlisten': return [d.transcript, ...clipScripts(b).map((c) => c.script)].filter(Boolean).join('\n');
    case 'dialogue': return (d.lines || []).map((l) => l?.text || '').join('\n');
    case 'speakcard': return [d.situation, d.cardA?.items, d.cardB?.items, ...(d.ideas || []).map((i) => i?.text)].filter(Boolean).join('\n');
    case 'rolecards': return [d.roleA, d.roleB].filter(Boolean).join('\n');
    case 'text': return d.opener ? '' : String(d.text || '');
    default: return '';
  }
}
const isLexWord = (w) => /^\p{Ll}[\p{Ll}-]*$/u.test(w) && w.length >= 3;
function lexWords(text) {
  return String(text || '').replace(/\*[^*]*\*/g, ' ').split(/[^\p{L}-]+/u).filter(isLexWord).map((w) => w.replace(/^-+|-+$/g, ''));
}
const vocabWords = (b) => String(b.data?.words || '').split(/[,\n]/).map((x) => x.split('—')[0].trim().toLocaleLowerCase('et')).filter(Boolean);
const stem = (w) => { const s = norm(w); return s.length > 5 ? s.slice(0, s.length - 2) : s; };
export function wordLevelIn(word, forms, levels) {
  const w = String(word || '').toLocaleLowerCase('et');
  const sets = levels.map((l) => forms?.[l]).filter(Boolean);
  if (!sets.length) return true;
  if (sets.some((s) => s.has(w))) return true;
  const mine = /^(.{2,})mi(ne|se|st|sel|sele|selt|ses|sesse|sest|seks|seni|sena|seta|sega|sed|ste|si|sid|sile|sil|silt|sis|sisse|sist|siks)$/.exec(w);
  if (mine && sets.some((s) => s.has(`${mine[1]}ma`))) return true;
  for (let i = 3; i <= w.length - 3; i += 1) {
    if (sets.some((s) => s.has(w.slice(0, i))) && sets.some((s) => s.has(w.slice(i)))) return true;
  }
  return false;
}

const HARJUTA = /Harjuta/u;
const ZERO_PART = /(ükski|ühegi|üheski)[^.\n]{0,40}(0 punkti|null|nulli)|0 punkti[^.\n]{0,30}(ühe(gi|s)ki|osa)|mitte 0 punkti/iu;
const TEACHER = /õpetaja/iu;
const URL_RE = /https:\/\/[^\s)\]>»”"]+/;
const recordingSec = (b) => {
  const d = b.data || {};
  return Math.round(Number(d.audio?.seconds)) || Math.round((words(d.transcript || '') / V6.wpm) * 60);
};
const stationRhythm = (all) => all.map(({ b }) => b.data?.station).filter(Boolean).sort((x, y) => x.n - y.n).map((s) => s.minutes).join('/');

export function methodV6Problems(input, { forms = null } = {}) {
  const out = [];
  const { course } = input;
  const b2 = course === 'b2';
  const a2 = course === 'a2';
  const moduleNo = moduleNumber(input.id);
  const add = (gate, code, lessonId, phase, text, blockId = '') => out.push({ gate, code, lessonId, phase, blockId, text });
  const types = [];
  const rhythms = [];
  const vocabSoFar = new Set();
  let peer = 0; let media = 0; let realLinks = 0; let teacherOnly = 0;
  const ordered = Object.entries(input.lessons || {}).sort(([, x], [, y]) => x.n - y.n);
  let prev = null; // the previous lesson of the module: { id, kind, writes }

  for (const [lessonId, lesson] of ordered) {
    const { kind, n } = lesson;
    const sheets = lesson.sheets || {};
    const all = Object.keys(sheets).flatMap((p) => ownBlocks(sheets[p]).map((b) => ({ b, p, doc: sheets[p] })));
    const teaching = kind === 'lesson';
    const mains = teaching ? mainTasks(all) : [];
    const longWriting = all.some(({ b }) => WRITE.has(b.type) && (Number(b.data?.maxWords) || (Number(b.data?.maxSent) || 0) * 8) >= 120);
    all.filter(({ b }) => b.type === 'vocab').forEach(({ b }) => vocabWords(b).forEach((w) => vocabSoFar.add(w)));

    if (teaching) {
      // G14: the exit check performs the can-do
      const exit = all.filter(({ b }) => b.data?.exit);
      const perform = exit.filter(({ b }) => PERFORM.has(b.type));
      const formCount = exit.filter(({ b }) => !PERFORM.has(b.type) && b.type !== 'selfcheck').reduce((m, { b }) => m + CLOSED_ITEMS(b), 0);
      const mainSkills = new Set(mains.map(({ b }) => skillOf(b)).filter(Boolean));
      if (!exit.length) add('G14', 'G14-none', lessonId, 'transfer', 'tunnis pole väljumiskontrolli (exitCheck): lühike sooritus tunni oskusest');
      else if (!perform.length) add('G14', 'G14-forms', lessonId, 'transfer', `${exit.map(({ b }) => b.id).join(', ')}: väljumiskontroll on ${formCount ? `${formCount} vormiküsimust` : 'ainult enesehinnang'}, mitte tunni oskuse sooritus (30 s kõnet või üks rida tootest)`, exit[0].b.id);
      else if (mainSkills.size && !perform.some(({ b }) => mainSkills.has(skillOf(b)))) add('G14', 'G14-skill', lessonId, 'transfer', `${perform[0].b.id}: väljumiskontroll (${skillOf(perform[0].b)}) ei ole põhiülesande oskus (${[...mainSkills].join('/')})`, perform[0].b.id);
      if (perform.length && formCount > V6.exitFormItems) add('G14', 'G14-form-items', lessonId, 'transfer', `väljumiskontrollis ${formCount} vormiküsimust (≤ ${V6.exitFormItems})`);

      // G15: the form task produces the rule box's forms; the hint does not give the answer
      const bold = [...new Set(all.filter(({ b }) => b.type === 'notice').flatMap(({ b }) => boldForms(b)))];
      const formTasks = all.filter(({ b }) => FORM_TASKS.has(b.type) && !b.data?.exit && formItems(b).length);
      if (bold.length) {
        if (!formTasks.length) add('G15', 'G15-none', lessonId, '*', `reeglikastis on ${bold.length} rõhutatud vormi, aga tunnis pole vormiülesannet, mis neid toota laseb`);
        else {
          const answerTokens = new Set(formTasks.flatMap(({ b }) => formItems(b).flatMap((it) => it.answer.flatMap(tokens))));
          const covered = bold.filter(producedBy(answerTokens));
          const share = covered.length / bold.length;
          if (share < V6.coverage) add('G15', 'G15-coverage', lessonId, '*', `vormiülesanne katab ${covered.length}/${bold.length} reeglikasti vormi (${Math.round(share * 100)} %, vaja ≥ ${V6.coverage * 100} %); puudu: ${bold.filter((f) => !covered.includes(f)).slice(0, 6).join(', ')}`);
        }
      }
      formTasks.forEach(({ b, p }) => {
        const zero = formItems(b).filter((it) => givesAway(it) || (b.type === 'wordforms' && it.base && it.answer.some((a) => norm(a) === norm(it.base))));
        if (zero.length) add('G15', 'G15-hint', lessonId, p, `${b.id}: ${zero.length} küsimuse vihje annab vastuse ette (${zero.slice(0, 3).map((it) => it.answer[0]).join(', ')})`, b.id);
      });

      // G16: B2 — a draft in class, the revision next lesson
      if (b2) {
        const writes = all.filter(({ b }) => WRITE.has(b.type));
        if (longWriting && writes.every(({ b }) => b.data?.home)) add('G16', 'G16-draft', lessonId, 'transfer', 'B2 kirjutamine on ainult kodus: tunnis ≈ 10 min mustandit (esimene lõik) ja tagasiside ühele kriteeriumile');
        if (prev?.kind === 'lesson' && prev.longWriting && !all.some(({ b }) => b.data?.revisionOf === prev.id)) add('G16', 'G16-revision', lessonId, 'discover', `pole „Parandatud versioon” plokki (revisionOf: '${prev.id}'): 5 min, õppija kirjutab kolm märgitud lauset ümber`);
      }

      // G17: main-task types and station rhythm (module)
      if (mains.length) types.push([lessonId, mainTaskType(mains[0].b)]);
      rhythms.push([lessonId, stationRhythm(all)]);

      // G18: spaced retrieval — old words reused, Harjuta named in the home task
      all.filter(({ b }) => b.type === 'vocab').forEach(({ b, p }) => {
        if (n <= 2) return;
        const review = lines(Array.isArray(b.data?.review) ? b.data.review : String(b.data?.review || '').replace(/,/g, '\n'));
        const rest = all.filter((x) => x.b !== b).map((x) => blockText(x.b)).join('\n').toLocaleLowerCase('et');
        const used = review.filter((w) => rest.includes(stem(w)));
        if (used.length < V6.reviewWords) add('G18', 'G18-review', lessonId, p, `${b.id}: ${review.length ? `vanadest sõnadest kasutab tund ${used.length}` : 'vanu sõnu (review) pole'} (vaja ≥ ${V6.reviewWords} sõna 3–15 tunni tagant, mis esinevad sisendis või kaardil)`, b.id);
      });
      const home = all.filter(({ b }) => b.data?.home);
      if (!home.some(({ b }) => HARJUTA.test(blockText(b)))) add('G18', 'G18-harjuta', lessonId, 'transfer', home.length ? `kodutöö (${home.map(({ b }) => b.id).join(', ')}) ei viita Harjutale („Harjuta → moodul ${moduleNo}”)` : 'tunnis pole kodutööd (homeTask) viitega Harjutale');

      // G19: free rewrites are open
      all.filter(({ b }) => b.type === 'transformation' && !b.data?.open).forEach(({ b, p }) => {
        const free = FREE_REWRITE.test(String(b.data?.instruction || ''));
        const rows = (b.data?.rows || []).filter((r) => {
          const v = alts(r.answer);
          if (v.some(isFreeModel)) return false;
          return (free && v.length < 3) || (v.length === 1 && words(v[0]) > V6.freeRewriteWords);
        });
        if (rows.length) add('G19', 'G19-open', lessonId, p, `${b.id}: ${rows.length} vaba ümbersõnastust ühe võtmega — märgi open: true (õpetaja kontrollib) või anna ≥ 3 varianti`, b.id);
      });

      // G22: instruction ceilings
      const ceil = instructionCeiling(course, n);
      all.filter(({ b }) => b.data?.instruction).forEach(({ b, p }) => {
        const w = instructionWords(b);
        if (w > ceil) add('G22', 'G22-instruction', lessonId, p, `${b.id}: juhis ${w} sõna (${a2 ? 'A2' : b2 ? 'B2' : `B1 ${n >= V6.instructionWords.b1LateFrom ? '041+' : '001–040'}`}: ≤ ${ceil}${b.data?.purpose ? '; eesmärgirida kuulub õpetaja lehele' : ''})`, b.id);
      });

      // G23: pronunciation strand (A2, B1)
      if (!b2 && !all.some(({ b }) => b.data?.pronunciation || /^häälda|hääldus/iu.test(String(b.data?.title || '')))) add('G23', 'G23-pron', lessonId, '*', 'hääldusnurk puudub (≈ 5 min: välted sada/saada/saaada, õ/ä/ö/ü või varjutamine; data.pronunciation)');

      // G24: differentiation on the main task, evidence in the self-check
      mains.forEach(({ b, p }) => {
        if (!lines(b.data?.support).length) add('G24', 'G24-support', lessonId, p, `${b.id}: põhiülesandel pole abikaarti (data.support: 2–3 lausealgust)`, b.id);
        if (!String(b.data?.stretch || '').trim()) add('G24', 'G24-stretch', lessonId, p, `${b.id}: põhiülesandel pole lisaväljakutset (data.stretch: üks rida)`, b.id);
      });
      all.filter(({ b }) => b.type === 'selfcheck').forEach(({ b, p }) => {
        if (!(lines(b.data?.criteria).length || Array.isArray(b.data?.criteria)) || !b.data?.evidence) add('G24', 'G24-selfcheck', lessonId, p, `${b.id}: enesekontroll on linnukesed — vaja edukriteeriume (criteria, 3-astmeline skaala) ja üht oma lauset tõendiks (evidence: true)`, b.id);
      });

      // G25: real networks (module)
      all.forEach(({ b }) => {
        const d = b.data || {};
        if (d.peerReply) peer += 1;
        if (d.mediaLog) media += 1;
        const url = URL_RE.test(blockText(b)) && String(d.title || d.heading || '').trim();
        if (url || (d.realAddressee && !TEACHER.test(String(d.realAddressee)))) realLinks += 1;
        else if (d.realAddressee) teacherOnly += 1;
      });
    }

    // G20 / G21: controls
    if (kind === 'control') {
      const text = all.map(({ b }) => blockText(b)).join('\n');
      if (!ZERO_PART.test(text)) add('G21', 'G21-zero', lessonId, '*', 'kontrollis pole Harno teist tingimust: ükski osa ei tohi olla 0 punkti');
      // parts: an exampart header and the blocks after it on the same sheet, up to the next header
      Object.entries(sheets).forEach(([p, doc]) => {
        const blocks = ownBlocks(doc);
        blocks.forEach((h, i) => {
          if (h.type !== 'exampart') return;
          const end = blocks.findIndex((x, j) => j > i && x.type === 'exampart');
          const body = blocks.slice(i + 1, end < 0 ? blocks.length : end);
          const pts = Number(h.data?.points) || 0;
          if (['R', 'L'].includes(h.data?.skill)) {
            const items = body.reduce((m, b) => m + CLOSED_ITEMS(b), 0);
            const want = Number(h.data?.items) || pts;
            if (items && items !== want) add('G20', 'G20-sum', lessonId, p, `${h.id}: osa ${h.data.skill} on ${want} ${h.data?.items ? 'küsimust' : 'punkti'}, ülesannetes ${items} küsimust`, h.id);
          }
        });
      });
      // the open parts (writing, speaking) are scored by descriptors: their points = the rubrics' maxima on the sheet
      const open = all.filter(({ b }) => b.type === 'exampart' && ['W', 'S'].includes(b.data?.skill));
      if (open.length) {
        const pts = open.reduce((m, { b }) => m + (Number(b.data?.points) || 0), 0);
        const rubricPts = all.reduce((m, { b }) => m + rubricMax(b), 0);
        if (rubricPts !== pts) add('G20', 'G20-rubric', lessonId, '*', `kirjutamise ja rääkimise osad on ${pts} punkti (${open.map(({ b }) => `${b.data.skill} ${b.data.points}`).join(' + ')}), hindamisjuhendites kokku ${rubricPts}: iga avatud ülesanne vajab kirjeldustega juhendit`);
      }
      if (b2) {
        const audio = all.filter(({ b }) => b.type === 'listening' || b.type === 'examlisten');
        if (audio.length) {
          const longest = audio.reduce((m, { b }) => Math.max(m, recordingSec(b)), 0);
          if (longest < V6.b2ControlAudioSec) add('G20', 'G20-level', lessonId, '*', `B2 kontrolli pikim salvestus ≈ ${longest} s (≥ ${V6.b2ControlAudioSec} s: kontroll ei ole kergem kui tunnid)`);
          audio.filter(({ b }) => b.type === 'listening').forEach(({ b, p }) => {
            const keys = keyedAnswers(b);
            const script = String(b.data?.transcript || '').toLocaleLowerCase('et');
            const verbatim = keys.filter((k) => k.some((a) => a && script.includes(a.toLocaleLowerCase('et')))).length;
            if (keys.length && verbatim / keys.length > V6.b2ControlVerbatim) add('G20', 'G20-level', lessonId, p, `${b.id}: ${verbatim}/${keys.length} vastust on salvestuses sõna-sõnalt (B2: ≥ 30 % ümbersõnastatud)`, b.id);
          });
        }
      }
    }

    // G19: keys fit the stated word limit (lessons and controls)
    if (teaching || kind === 'control' || kind === 'diagnostic') {
      all.filter(({ b }) => ['reading', 'listening', 'gaps'].includes(b.type)).forEach(({ b, p }) => {
        const limit = wordLimit(b.data?.instruction);
        if (!limit) return;
        const long = keyedAnswers(b).filter((k) => k.some((a) => words(a) > limit + 1));
        if (long.length) add('G19', 'G19-key-length', lessonId, p, `${b.id}: juhis lubab ${limit} sõna, ${long.length} võtmes on pikem variant (${long[0].find((a) => words(a) > limit + 1)})`, b.id);
      });
    }

    // G22: lexical profile (inputs, cards, controls)
    if (forms && (teaching || kind === 'control')) {
      const levels = allowedLevels(course, n);
      const topic = new Set([...vocabSoFar, ...all.flatMap(({ b }) => (b.tag?.topic || []).map((w) => String(w).toLocaleLowerCase('et')))]);
      const toks = all.filter(({ b }) => teaching || b.type !== 'text').flatMap(({ b }) => lexWords(inputText(b)));
      if (toks.length >= V6.lexisMinTokens) {
        const beyond = toks.filter((w) => !topic.has(w) && ![...topic].some((t) => t.length >= 4 && w.startsWith(stem(t))) && !wordLevelIn(w, forms, levels));
        const share = beyond.length / toks.length;
        if (share > V6.lexisBeyond) add('G22', 'G22-lexis', lessonId, '*', `${Math.round(share * 100)} % sõnu üle taseme (${levels[levels.length - 1]}; ≤ ${V6.lexisBeyond * 100} %): ${[...new Set(beyond)].slice(0, 8).join(', ')}`);
      }
    }

    prev = { id: lessonId, kind, longWriting };
  }

  // G17 module rules
  const byType = types.reduce((m, [id, t]) => ({ ...m, [t]: [...(m[t] || []), id] }), {});
  Object.entries(byType).filter(([, ids]) => ids.length > V6.sameType)
    .forEach(([t, ids]) => add('G17', 'G17-same', '*', '*', `põhiülesanne „${t}” ${ids.length} tunnis (≤ ${V6.sameType}): ${ids.join(', ')}`));
  let run = 1;
  for (let i = 1; i < rhythms.length; i += 1) {
    run = rhythms[i][1] && rhythms[i][1] === rhythms[i - 1][1] ? run + 1 : 1;
    if (run === V6.sameRhythm + 1) add('G17', 'G17-rhythm', '*', '*', `jaamade rütm ${rhythms[i][1]} min kordub ${run} tundi järjest (≤ ${V6.sameRhythm})`);
  }
  // G25 module rules
  if (types.length) {
    if (moduleNo >= 2 && !realLinks && teacherOnly) add('G25', 'G25-teacher', '*', '*', 'moodulis on päris adressaat ainult õpetaja (moodulist 2: päris allikas, asutus või kaaslane)');
    if (!peer) add('G25', 'G25-peer', '*', '*', 'moodulis pole kaaslase vastust (data.peerReply: toode läheb kaaslasele, kaaslane vastab)');
    if (!media) add('G25', 'G25-media', '*', '*', 'moodulis pole „Minu eesti keele võrgustik” kirjet (data.mediaLog)');
  }
  return out;
}

export function methodV6Report(mod, { forms = null, sheets = moduleSheets(mod) } = {}) {
  const input = methodV5Input(mod, sheets);
  const problems = methodV6Problems(input, { forms });
  const byGate = Object.fromEntries(Object.keys(GATES_V6).map((g) => [g, problems.filter((p) => p.gate === g).length]));
  const lessons = Object.entries(input.lessons).map(([id, l]) => ({ id, kind: l.kind, n: l.n, problems: problems.filter((p) => p.lessonId === id) }));
  return { id: input.id, course: input.course, title: input.title, total: problems.length, byGate, lessons, problems, module: problems.filter((p) => p.lessonId === '*') };
}

export function formatMethodV6Report(report, { gates = null, baseline = null } = {}) {
  const keep = (p) => !gates || gates.includes(p.gate);
  const out = [`${report.id} „${report.title}” — v6 järeltöö ${report.problems.filter(keep).length}${baseline != null ? ` (baseline ${baseline})` : ''}`,
    `  väravad: ${Object.entries(report.byGate).filter(([g]) => !gates || gates.includes(g)).map(([g, n]) => `${g} ${n}`).join(' · ')}`];
  report.lessons.forEach((l) => {
    const own = l.problems.filter(keep);
    if (!own.length) return;
    out.push(`  ${l.id} [${l.kind}]`);
    own.forEach((p) => out.push(`      ${p.gate} ${p.phase === '*' ? '' : `${p.phase}: `}${p.text}`));
  });
  if (report.module.filter(keep).length) out.push('  moodul:');
  report.module.filter(keep).forEach((p) => out.push(`      ${p.gate} ${p.text}`));
  return out;
}
