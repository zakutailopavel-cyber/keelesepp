// After hand-in the learner sees her mistakes (owner 2026-11-16: „надо чтобы ученик после сдачи видел свои балл /
// ошибки и объяснения что не так”): per wrong answer what she wrote, the right answer and — when the sheet has it —
// why (data.explain, a math part's worked solution). Nothing new reaches her device: the whole sheet with its answers is
// already her copy (transcript.js); the teacher's key view stays staff-only.
// Pure: (doc, answers, results) → { tasks: [{ id, num, title, wrong: [{ key, prompt, given, right, why }] }], points }.
import { BLOCKS, numberTasks } from './registry.js';
import { answerKeyOf } from './answerKey.js';
import { expectedAnswer, givenAnswer } from './errorText.js';

const variants = (v) => String(v || '').split('|').map((x) => x.trim()).filter(Boolean).join(' / ');

// the key item (prompt, why) that belongs to a scoring key: a math part p<i> is item i; otherwise the n-th scoring key
// is the n-th item when the task has as many items as scoring keys
function itemFor(block, key, items) {
  const part = /^p(\d+)$/.exec(String(key));
  if (part && typeof BLOCKS[block.type]?.keyItems === 'function') return items[Number(part[1])] || null;
  const keys = (BLOCKS[block.type].score?.(block.data || {}, () => '', block) || []).map((it) => String(it.key));
  if (keys.length !== items.length) return null;
  return items[keys.indexOf(String(key))] || null;
}

// points of the math tasks (block „Matemaatika ülesanne”): only parts with a final answer are checked automatically;
// the rest the teacher judges — so the learner sees „x / y punkti automaatselt kontrollitud osadest”
function mathPoints(doc, results) {
  let got = 0;
  let max = 0;
  for (const b of doc.blocks || []) {
    if (b.type !== 'mathtask') continue;
    (b.data?.parts || []).forEach((p, i) => {
      const state = results[`${b.id}:p${i}`];
      if (!state) return;
      const pts = Number(p.points) || 0;
      max += pts;
      if (state === 'ok') got += pts;
    });
  }
  return max ? { got, max } : null;
}

export function mistakesOf(doc, answers = {}, results = {}) {
  if (!doc?.blocks) return { tasks: [], points: null };
  const nums = numberTasks(doc.blocks);
  const keyById = Object.fromEntries(answerKeyOf(doc).map((t) => [t.id, t]));
  const tasks = [];
  for (const block of doc.blocks) {
    const bad = Object.keys(results).filter((k) => k.startsWith(`${block.id}:`) && results[k] === 'bad');
    if (!bad.length) continue;
    const items = keyById[block.id]?.items || [];
    const wrong = bad.map((full) => {
      const key = full.slice(block.id.length + 1);
      const item = itemFor(block, key, items);
      const right = BLOCKS[block.type]?.expectedText?.(block.data || {}, key) || variants(expectedAnswer(block, key)) || item?.answer || '';
      return { key, prompt: item?.prompt || '', given: givenAnswer(block, key, answers[full]), right, why: item?.why || '' };
    });
    tasks.push({ id: block.id, num: nums[block.id], title: block.data?.title || BLOCKS[block.type]?.label || '', wrong });
  }
  return { tasks, points: mathPoints(doc, results) };
}
