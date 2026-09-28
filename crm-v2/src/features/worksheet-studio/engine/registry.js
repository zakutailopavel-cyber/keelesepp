import { text, notice, tip, image, vocab } from './blocks/content.jsx';
import { taskBlocks } from './blocks/tasks.jsx';
import { productiveBlocks } from './blocks/productive.jsx';
import { extraBlocks } from './blocks/extra.jsx';
import { newId } from './schema.js';

// One registry = one source of truth for every host (Õppevara builder, homework player, Live Classroom, print).
export const BLOCKS = { text, notice, tip, image, vocab, ...taskBlocks, ...extraBlocks, ...productiveBlocks };

export const GROUPS = ['Grammatika ja sõnavara', 'Teemad', 'Tekst ja heli', 'Pildid', 'Kõne ja kirjutamine', 'Kujundus'];

export function createBlock(type) {
  const def = BLOCKS[type];
  return { id: newId(), type, width: def.width, tone: def.tone, data: def.create() };
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
    const items = def.score(b.data, get);
    perBlock[b.id] = items;
    const goal = b.goal || '_none';
    perGoal[goal] = perGoal[goal] || { ok: 0, total: 0 };
    perGoal[goal].ok += items.filter((i) => i.ok).length;
    perGoal[goal].total += items.length;
  }
  return { perBlock, perGoal };
}
