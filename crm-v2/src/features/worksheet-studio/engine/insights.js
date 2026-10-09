import { BLOCKS, checkDocument, numberTasks } from './registry.js';
import { norm } from './schema.js';

// How a sheet works with real learners (owner, 2026-10-09): from all submitted copies of the sheet — per task the
// share of right answers, and the answers many learners wrote the same „wrong” way (often a second right answer the
// sheet does not accept yet). Plain counting, no AI.

const filled = (value) => value !== undefined && value !== null && String(value).trim() !== '';
export const MIN_SAME_ANSWER = 2;
// blocks whose gaps are written [a|b] in a newline field or in dialogue lines: a right answer can be added on the spot
export const ALTERNATIVE_BLOCKS = new Set(['gaps', 'listening', 'dialogue']);

export function sheetInsights(doc, assignments = []) {
  const blocks = doc?.blocks || [];
  const nums = numberTasks(blocks);
  const done = assignments.filter((a) => a?.status === 'done' && a.worksheetDoc?.blocks?.length);
  const perBlock = new Map(); // id → { right, total }
  const wrong = new Map(); // "blockId:key" → Map(normalised answer → { answer, count })
  const attempts = new Map(); // "blockId:key" → answered count
  let pctSum = 0;
  done.forEach((a) => {
    const { results, score } = checkDocument(a.worksheetDoc, a.answers || {});
    pctSum += score.pct;
    Object.entries(results).forEach(([key, mark]) => {
      const blockId = key.slice(0, key.indexOf(':'));
      if (!blocks.some((b) => b.id === blockId)) return; // the task was removed or replaced since
      const stat = perBlock.get(blockId) || { right: 0, total: 0 };
      stat.total += 1;
      if (mark === 'ok') stat.right += 1;
      perBlock.set(blockId, stat);
      const answer = a.answers?.[key];
      if (!filled(answer) || typeof answer !== 'string') return;
      attempts.set(key, (attempts.get(key) || 0) + 1);
      if (mark !== 'bad') return;
      const group = wrong.get(key) || new Map();
      const n = norm(answer);
      const hit = group.get(n) || { answer: answer.trim(), count: 0 };
      hit.count += 1;
      group.set(n, hit);
      wrong.set(key, group);
    });
  });

  const tasks = blocks.filter((b) => BLOCKS[b.type]?.task).map((b) => {
    const stat = perBlock.get(b.id) || { right: 0, total: 0 };
    return { blockId: b.id, num: nums[b.id], title: b.data?.title || BLOCKS[b.type]?.label || '', ...stat, pct: stat.total ? Math.round((stat.right / stat.total) * 100) : null };
  });

  const hints = [];
  wrong.forEach((group, fullKey) => {
    const blockId = fullKey.slice(0, fullKey.indexOf(':'));
    const key = fullKey.slice(fullKey.indexOf(':') + 1);
    const block = blocks.find((b) => b.id === blockId);
    group.forEach(({ answer, count }) => {
      if (count < MIN_SAME_ANSWER || count / Math.max(1, attempts.get(fullKey) || 0) < 0.3) return;
      hints.push({ kind: 'same-answer', blockId, key, answer, count, num: nums[blockId], canAdd: ALTERNATIVE_BLOCKS.has(block?.type) && /^\d+\.\d+$/.test(key) });
    });
  });
  tasks.forEach((t) => {
    if (t.pct !== null && done.length >= 3 && t.pct === 100) hints.push({ kind: 'easy', blockId: t.blockId, num: t.num });
    if (t.pct !== null && t.total >= 3 && t.pct < 50) hints.push({ kind: 'hard', blockId: t.blockId, num: t.num, pct: t.pct });
  });
  hints.sort((a, b) => (a.kind === 'same-answer' ? 0 : 1) - (b.kind === 'same-answer' ? 0 : 1) || (b.count || 0) - (a.count || 0));

  return { assigned: assignments.length, submitted: done.length, avgPct: done.length ? Math.round(pctSum / done.length) : null, tasks, hints };
}

// „Lisa õigeks”: the learners' answer becomes one more right answer of that gap — key "line.gap" → [a|b|answer]
export function addAlternative(block, key, answer) {
  const [line, gap] = String(key).split('.').map(Number);
  const extra = String(answer || '').replace(/[[\]|]/g, '').trim();
  if (!extra || !Number.isInteger(line) || !Number.isInteger(gap)) return block;
  const patchText = (text) => {
    let index = -1;
    return String(text || '').replace(/\[([^\]]*)\]/g, (whole, inner) => {
      index += 1;
      if (index !== gap) return whole;
      const options = inner.split('|').map((x) => x.trim());
      return options.some((o) => norm(o) === norm(extra)) ? whole : `[${[...options, extra].join('|')}]`;
    });
  };
  const data = block.data || {};
  if (block.type === 'dialogue') {
    const lines = [...(data.lines || [])];
    if (!lines[line]) return block;
    lines[line] = { ...lines[line], text: patchText(lines[line].text) };
    return { ...block, data: { ...data, lines } };
  }
  const raw = String(data.sentences || '').split('\n');
  const at = raw.map((l, i) => (l.trim() ? i : -1)).filter((i) => i >= 0)[line];
  if (at === undefined) return block;
  raw[at] = patchText(raw[at]);
  return { ...block, data: { ...data, sentences: raw.join('\n') } };
}
