// Quality gates of a course sheet and a module (owner 2026-10-14: „идеальный учебный план и рабочие листы, которые
// обеспечат это”). A sheet is ready when no gate finds anything:
//   depth  — enough real work at the level (depth.js)
//   keys   — every answer key is usable: one right option, no duplicates, a correction differs from the error…
//   level  — Harno text, writing and speaking lengths for the level (docs/HARNO_LEVEL_REQUIREMENTS.md, master plan §4)
// and a module is ready when its sheets are, no task sentence is used twice and the module's words come back.
// The Estonian language check (Vabamorf) runs offline: tools/course-audit/language.py.
// Pure: docs are { meta: { level, phase }, blocks: [{ id, type, data }] }; problems { gate, code, level, text, blocks }.
import { depthProblems } from './depth.js';
import { bankItems, groupItems } from '../engine/schema.js';

const lines = (v) => String(v || '').split('\n').map((x) => x.trim()).filter(Boolean);
const list = (v) => (Array.isArray(v) ? v : String(v || '').split(/[,\n]/)).map((x) => String(x).trim()).filter(Boolean);
const norm = (v) => String(v || '').toLocaleLowerCase('et').replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
const first = (answer) => String(answer || '').split('|')[0].trim();
// a correction may be only punctuation („Mulle tundub, et …”): compare with the punctuation kept
const exact = (v) => String(v || '').toLocaleLowerCase('et').replace(/\s+/g, ' ').trim();
const words = (v) => String(v || '').split(/\s+/).filter((w) => /[\p{L}\p{N}]/u.test(w)).length;
const band = (level) => {
  const l = String(level || '').toUpperCase();
  return l.startsWith('C') ? 'C1' : l.startsWith('B2') ? 'B2' : l.startsWith('B1') ? 'B1' : 'A2';
};

// ---------- keys ----------
export function keysProblems(doc) {
  const out = [];
  const add = (block, code, text, level = 'error') => out.push({ gate: 'keys', code, level, text: `${block.data?.title || block.type}: ${text}`, blocks: [block.id] });
  for (const block of doc?.blocks || []) {
    const d = block.data || {};
    switch (block.type) {
      case 'choice':
        (d.questions || []).forEach((q, i) => {
          const options = lines(q?.options);
          if (!options.length) return;
          const clean = options.map((o) => exact(o.replace(/^\*/, '')));
          const right = options.filter((o) => o.startsWith('*')).length;
          if (new Set(clean).size !== clean.length) add(block, 'choice-duplicate', `küsimus ${i + 1}: kaks ühesugust vastusevarianti`);
          if (right && right === options.length) add(block, 'choice-all-right', `küsimus ${i + 1}: kõik variandid on märgitud õigeks`);
        });
        break;
      case 'gaps': {
        const answers = lines(d.sentences).flatMap((s) => [...s.matchAll(/\[([^\]]*)\]/g)].map((m) => m[1]));
        if (answers.some((a) => !first(a))) add(block, 'gap-empty', 'tühi lünk (nurksulud ilma vastuseta)');
        if (d.showBank === 'yes' && String(d.bank || '').trim()) {
          const bank = new Set(bankItems(d).map(norm));
          const missing = answers.map(first).filter((a) => a && !bank.has(norm(a)));
          if (missing.length) add(block, 'bank-missing', `sõnapangas puudub: ${[...new Set(missing)].slice(0, 4).join(', ')}`);
        }
        break;
      }
      case 'errorfix':
        (d.rows || []).forEach((r, i) => {
          if (!first(r?.answer)) add(block, 'fix-no-answer', `rida ${i + 1}: parandus puudub`);
          else if (exact(first(r.answer)) === exact(r.wrong)) add(block, 'fix-same', `rida ${i + 1}: parandus on sama mis vale lause`);
        });
        break;
      case 'transformation':
        (d.rows || []).forEach((r, i) => {
          if (!first(r?.answer)) add(block, 'trans-no-answer', `rida ${i + 1}: õige vastus puudub`, 'warning');
          else if (exact(first(r.answer)) === exact(r.from)) add(block, 'trans-same', `rida ${i + 1}: vastus on sama mis lähtelause`);
        });
        break;
      case 'match': {
        const left = (d.pairs || []).map((p) => norm(p?.left)).filter(Boolean);
        // the right side may repeat (one author of several statements); two equal left items cannot be told apart
        if (new Set(left).size !== left.length) add(block, 'match-duplicate', 'kaks ühesugust vasakut poolt');
        break;
      }
      case 'truefalse':
        (d.statements || []).forEach((s, i) => { if (!['true', 'false'].includes(String(s?.answer))) add(block, 'tf-no-answer', `väide ${i + 1}: õige/vale on märkimata`); });
        break;
      case 'categorize': {
        const seen = new Map();
        (d.groups || []).forEach((g) => groupItems(g || {}).forEach((w) => seen.set(norm(w), (seen.get(norm(w)) || 0) + 1)));
        const twice = [...seen.entries()].filter(([, n]) => n > 1).map(([w]) => w);
        if (twice.length) add(block, 'sort-duplicate', `sama sõna kahes rühmas: ${twice.slice(0, 3).join(', ')}`);
        break;
      }
      default:
    }
  }
  return out;
}

// ---------- level (Harno) ----------
// master plan §4: texts, writing and speaking per level (authoring defaults, the lower bound is the gate)
export const LEVEL_LENGTHS = {
  A2: { text: 80, write: 40, speakSec: 60 },
  B1: { text: 140, write: 70, speakSec: 120 },
  // speaking: within the didactic norm (levels.js: B2 60–180 s, C1 90–180 s, +25 %) — the gate asked for 240 / 300 s,
  // so every B2 sheet failed one of the two checks (owner 2026-10-18, lesson template v3)
  B2: { text: 220, write: 140, speakSec: 180 },
  C1: { text: 350, write: 220, speakSec: 210 },
};

export function levelProblems(doc) {
  const level = band(doc?.meta?.level);
  const want = LEVEL_LENGTHS[level];
  const blocks = doc?.blocks || [];
  const out = [];
  const phase = doc?.meta?.phase;
  // Avasta and Kasuta start from a text of the level (Harno: every closed task works on a text)
  if (phase === 'discover' || phase === 'transfer') {
    // design v2: any input of that length starts the phase — a dialogue, people profiles or a gapped exam text too
    const inputs = doc?.meta?.design === 'v2' ? ['reading', 'listening', 'dialogue', 'profiles', 'cloze', 'formtext', 'insertion'] : ['reading', 'listening'];
    const inputText = (b) => (b.type === 'dialogue' ? (b.data?.lines || []).map((l) => l?.text).join(' ')
      : b.type === 'profiles' ? (b.data?.people || []).map((p) => `${p?.facts || ''} ${p?.sentences || ''}`).join(' ')
        : b.type === 'insertion' ? String(b.data?.passage || '').replace(/\[\[|\]\]/g, '')
          : b.data?.passage || b.data?.transcript || lines(b.data?.sentences).join(' '));
    const longest = Math.max(0, ...blocks.filter((b) => inputs.includes(b.type)).map((b) => words(inputText(b))));
    if (longest < want.text) out.push({ gate: 'level', code: 'text-short', level: 'warning', text: `pikim tekst ${longest} sõna (${level}: vähemalt ${want.text})`, blocks: [] });
  }
  const letters = blocks.filter((b) => b.type === 'guidedletter');
  letters.forEach((b) => { if ((Number(b.data?.minWords) || 0) < want.write) out.push({ gate: 'level', code: 'writing-short', level: 'warning', text: `kirjutamine ${b.data?.minWords || 0} sõna (${level}: vähemalt ${want.write})`, blocks: [b.id] }); });
  const speaking = blocks.filter((b) => b.type === 'speaking');
  if (speaking.length && Math.max(...speaking.map((b) => Number(b.data?.maxSec) || 0)) < want.speakSec) {
    out.push({ gate: 'level', code: 'speaking-short', level: 'warning', text: `rääkimine kuni ${Math.max(...speaking.map((b) => Number(b.data?.maxSec) || 0))} s (${level}: vähemalt ${want.speakSec} s ühes ülesandes)`, blocks: speaking.map((b) => b.id) });
  }
  return out;
}

// ---------- one sheet ----------
export function sheetGates(doc) {
  return [
    ...depthProblems(doc).map((p) => ({ gate: 'depth', ...p })),
    ...keysProblems(doc),
    ...levelProblems(doc),
  ];
}

// ---------- module ----------
const SENTENCE_FIELDS = { gaps: 'sentences', dictation: 'sentences', wordorder: 'sentences' };
function taskSentences(block) {
  const d = block.data || {};
  if (SENTENCE_FIELDS[block.type]) return lines(d[SENTENCE_FIELDS[block.type]]);
  if (block.type === 'errorfix') return (d.rows || []).map((r) => r?.wrong);
  if (block.type === 'transformation') return (d.rows || []).map((r) => r?.from);
  if (block.type === 'translation') return (d.rows || []).map((r) => r?.source);
  if (block.type === 'truefalse') return (d.statements || []).map((s) => s?.text);
  return [];
}
const textOf = (value) => (typeof value === 'string' ? value : Array.isArray(value) ? value.map(textOf).join(' ') : value && typeof value === 'object' ? Object.values(value).map(textOf).join(' ') : '');
// the Estonian head of a vocabulary entry („kõigepealt — сначала” → „kõigepealt”) and a loose stem for inflected forms
const vocabHead = (entry) => norm(String(entry).split(/\s[—–-]\s/)[0]);
const stemOf = (word) => (word.length >= 6 ? word.slice(0, word.length - 2) : word);

// sheets: { [lessonId]: { discover, practice, transfer } }
export function moduleGates(sheets = {}) {
  const out = [];
  const seen = new Map();
  for (const [lessonId, phases] of Object.entries(sheets)) {
    for (const [phase, doc] of Object.entries(phases)) {
      for (const block of doc.blocks || []) {
        for (const sentence of taskSentences(block)) {
          const key = norm(String(sentence || '').replace(/\[[^\]]*\]|\([^)]*\)/g, ' '));
          if (words(key) < 4) continue;
          const where = `${lessonId} ${phase}`;
          seen.set(key, [...(seen.get(key) || []), where]);
        }
      }
    }
  }
  [...seen.entries()].filter(([, where]) => new Set(where).size > 1).forEach(([sentence, where]) => out.push({ gate: 'unique', code: 'repeated-sentence', level: 'warning', text: `sama lause mitmel lehel (${[...new Set(where)].join(', ')}): „${sentence.slice(0, 60)}”`, lessonId: '*', phase: '*' }));

  // vocabulary: every lesson has its words, and each comes back on at least two other sheets of the module
  const docs = Object.entries(sheets).flatMap(([lessonId, phases]) => Object.entries(phases).map(([phase, doc]) => ({ lessonId, phase, doc })));
  for (const lessonId of Object.keys(sheets)) {
    const entries = docs.filter((x) => x.lessonId === lessonId).flatMap(({ doc }) => (doc.blocks || []).filter((b) => b.type === 'vocab').flatMap((b) => list(b.data?.words)));
    if (!entries.length) { out.push({ gate: 'vocab', code: 'no-vocabulary', level: 'warning', text: 'tunnil pole sõnavaraplokki (tunni põhisõnad)', lessonId, phase: '*' }); continue; }
    const weak = entries.map(vocabHead).filter(Boolean).filter((head) => {
      const stems = head.split(' ').map(stemOf);
      const sheetsWith = docs.filter(({ doc }) => {
        const text = norm(textOf((doc.blocks || []).filter((b) => b.type !== 'vocab').map((b) => b.data)));
        return stems.every((stem) => text.includes(stem));
      }).length;
      return sheetsWith < 3;
    });
    if (weak.length > entries.length / 3) out.push({ gate: 'vocab', code: 'vocabulary-not-recycled', level: 'warning', text: `${weak.length}/${entries.length} tunni sõna esineb mooduli lehtedel alla 3 korra: ${weak.slice(0, 5).join(', ')}`, lessonId, phase: '*' });
  }
  return out;
}

// readiness of one lesson's sheets + the module checks for that lesson
export function lessonReady(phases = {}, moduleProblemsForLesson = []) {
  const sheetProblems = Object.values(phases).flatMap((doc) => sheetGates(doc));
  return !sheetProblems.length && !moduleProblemsForLesson.length;
}
