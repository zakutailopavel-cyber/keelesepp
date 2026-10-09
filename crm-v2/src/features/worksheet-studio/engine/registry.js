import { text, notice, tip, image, vocab } from './blocks/content.jsx';
import { taskBlocks } from './blocks/tasks.jsx';
import { productiveBlocks } from './blocks/productive.jsx';
import { extraBlocks } from './blocks/extra.jsx';
import { advancedBlocks } from './blocks/advanced.jsx';
import { diagram } from './blocks/diagram.jsx';
import { newId } from './schema.js';

// One registry = one source of truth for every host (Õppevara builder, homework player, Live Classroom, print).
export const BLOCKS = { text, notice, tip, image, vocab, ...taskBlocks, ...extraBlocks, ...productiveBlocks, ...advancedBlocks, diagram };

export const GROUPS = ['Grammatika ja sõnavara', 'Skeemid', 'Teemad', 'Tekst ja heli', 'Pildid', 'Kõne ja kirjutamine', 'Kujundus'];

// A palette key is a block type, or `type:variant` for a block that offers ready variants (the scheme kinds).
const splitKey = (key) => String(key || '').split(':');
export const isPaletteKey = (key) => {
  const [type, variant] = splitKey(key);
  const def = BLOCKS[type];
  return Boolean(def && (!variant || def.variants?.some((v) => v.variant === variant)));
};

// What the palette shows: every block, a block with variants as one entry per variant.
export function paletteEntries() {
  return Object.values(BLOCKS).flatMap((def) => (def.variants?.length
    ? def.variants.map((v) => ({ key: `${def.type}:${v.variant}`, label: v.label, hint: v.hint, icon: v.icon || def.icon, group: def.group, task: def.task }))
    : [{ key: def.type, label: def.label, icon: def.icon, group: def.group, task: def.task }]));
}

export function createBlock(key) {
  const [type, variant] = splitKey(key);
  const def = BLOCKS[type];
  return { id: newId(), type, width: def.width, span: def.width === 'full' ? 12 : 6, tone: def.tone, data: variant ? def.create(variant) : def.create() };
}

// Task modifications (spec §2): block.opts = { cols: 1|2|3, example: bool, shuffle: bool, size: 'small'|'large' }.
export const COLUMN_BLOCKS = new Set(['gaps', 'choice', 'truefalse', 'wordorder', 'reading', 'listening', 'selfcheck', 'categorize', 'wordforms', 'errorfix', 'translation']);
export const SHUFFLE_BLOCKS = new Set(['choice', 'wordforms', 'errorfix']);

// Answers of the first item when "Näide" is on: shown solved, never scored.
export function exampleAnswers(block) {
  const def = BLOCKS[block?.type];
  return block?.opts?.example && def?.example ? def.example(block.data || {}) || {} : {};
}

// Numbering is derived, never stored: moving a task renumbers the sheet automatically.
export function numberTasks(blocks) {
  let n = 0;
  return Object.fromEntries(blocks.map((b) => [b.id, BLOCKS[b.type]?.task ? ++n : null]));
}

// Score every scorable block; returns per-block and per-goal summaries (evidence for the learner profile).
export function scoreDocument(doc, answers) {
  const perBlock = {};
  const perGoal = {};
  for (const b of doc.blocks) {
    const def = BLOCKS[b.type];
    if (!def?.score) continue;
    const get = (k) => answers[`${b.id}:${k}`];
    const example = exampleAnswers(b);
    const items = def.score(b.data, get).filter((item) => !(item.key in example));
    perBlock[b.id] = items;
    const goal = b.goal || '_none';
    perGoal[goal] = perGoal[goal] || { ok: 0, total: 0 };
    perGoal[goal].ok += items.filter((i) => i.ok).length;
    perGoal[goal].total += items.length;
  }
  return { perBlock, perGoal };
}

// Everything a check produces, in one place: per-field marks for the sheet, per-goal evidence,
// the overall score for the assignment record and the open (teacher-judged) work.
export function checkDocument(doc, answers = {}) {
  const { perBlock, perGoal } = scoreDocument(doc, answers);
  const results = {};
  let correct = 0;
  let total = 0;
  Object.entries(perBlock).forEach(([bid, items]) => items.forEach((it) => {
    results[`${bid}:${it.key}`] = it.ok ? 'ok' : 'bad';
    total += 1;
    if (it.ok) correct += 1;
  }));
  const speak = doc.blocks.filter((b) => b.type === 'speaking')
    .map((b) => ({ id: b.id, goal: b.goal, recorded: !!answers[`${b.id}:audioUrl`], seconds: answers[`${b.id}:seconds`] || 0 }));
  const score = { correct, total, pct: total ? Math.round((correct / total) * 100) : 0, perGoal };
  return { results, perGoal, speak, score };
}

// How many answerable fields have an answer (scorable fields plus voice recordings).
export function answerProgress(doc, answers = {}) {
  const { results, speak } = checkDocument(doc, answers);
  const openKeys = doc.blocks.flatMap((block) => {
    const def = BLOCKS[block.type];
    return typeof def?.answerKeys === 'function' ? def.answerKeys(block.data || {}).map((key) => `${block.id}:${key}`) : [];
  });
  const keys = [...new Set([...Object.keys(results), ...openKeys])];
  const answered = keys.filter((k) => {
    const v = answers[k];
    return v !== undefined && v !== null && String(v).trim() !== '';
  }).length + speak.filter((x) => x.recorded).length;
  return { answered, total: keys.length + speak.length };
}
