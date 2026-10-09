import { BLOCKS, checkDocument, numberTasks } from './registry.js';
import { expectedAnswer } from './errorText.js';

// Live lesson on a worksheet (owner, 2026-10-09): the teacher opens tasks one by one, shows the right answers of a
// task when the class has done it, and sees per task how it went. State lives on the assignment (staff-written):
//   liveStep  { on, open: [blockId], at }   — step mode: the learner sees only the opened tasks
//   liveShown [blockId]                      — tasks whose right answers the learner sees

const isTask = (block) => Boolean(BLOCKS[block?.type]?.task);
const filled = (value) => value !== undefined && value !== null && String(value).trim() !== '' && !(Array.isArray(value) && !value.length);

// what the learner sees: in step mode only the opened tasks (texts, pictures and other non-task blocks stay)
export function stepView(doc, liveStep) {
  if (!doc || !liveStep?.on) return { doc, hidden: 0 };
  const open = new Set(liveStep.open || []);
  const blocks = doc.blocks.filter((block) => !isTask(block) || open.has(block.id));
  return { doc: { ...doc, blocks }, hidden: doc.blocks.length - blocks.length };
}

export const nextToOpen = (doc, liveStep) => (doc?.blocks || []).find((block) => isTask(block) && !(liveStep?.open || []).includes(block.id))?.id || '';

// ✓ / ✗ of the shown tasks only
export function shownResults(doc, answers, shown = []) {
  if (!doc || !shown.length) return {};
  const { results } = checkDocument(doc, answers || {});
  const keep = new Set(shown);
  // only what the learner answered gets ✓ / ✗ — an empty field stays neutral (the right answers are listed below)
  return Object.fromEntries(Object.entries(results).filter(([key]) => keep.has(key.slice(0, key.indexOf(':'))) && filled(answers?.[key])));
}

// the right answers of one task, in order: ["seitse / 7", "kohvi"]
export function rightAnswers(block) {
  const def = BLOCKS[block?.type];
  if (!def?.score) return [];
  const keys = def.score(block.data || {}, () => '').map((item) => item.key);
  return keys.map((key) => expectedAnswer(block, key)).filter(Boolean);
}

// per task: answered / right / total and a tone for the teacher's overview (and the summary after the lesson)
export function taskStats(doc, answers = {}) {
  if (!doc) return [];
  const nums = numberTasks(doc.blocks);
  const { results } = checkDocument(doc, answers);
  return doc.blocks.filter(isTask).map((block) => {
    const keys = Object.keys(results).filter((key) => key.startsWith(`${block.id}:`));
    const answered = keys.filter((key) => filled(answers[key])).length;
    const ok = keys.filter((key) => results[key] === 'ok').length;
    const wrong = keys.filter((key) => results[key] === 'bad' && filled(answers[key])).length;
    const tone = !keys.length ? 'open' : !answered ? 'idle' : wrong === 0 ? 'good' : ok >= wrong ? 'mixed' : 'hard';
    return { id: block.id, num: nums[block.id], title: block.data?.title || BLOCKS[block.type]?.label || '', total: keys.length, answered, ok, wrong, tone };
  });
}

// the hardest tasks first (for „Mis oli raske?” after the lesson)
export const hardestTasks = (stats) => stats.filter((s) => s.wrong > 0).sort((a, b) => (b.wrong / Math.max(1, b.answered)) - (a.wrong / Math.max(1, a.answered)) || b.wrong - a.wrong);
