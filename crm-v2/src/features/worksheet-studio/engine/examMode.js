// The e-exam form of a sheet (docs/EXAM_9KL_E_EKSAM.md §4, the engine's part in docs/E_EXAM_ENGINE.md). Pure helpers:
//   - an exam sheet (meta.exam, e.g. 'E9'): the real exam's format — the lesson norms (items per task, no solved example,
//     bank, task variety …) do not apply to it (didacticCheck.js, admin/course/quality.js), and item 0 is numbered 0;
//   - the part's clock (exampart.data.lock): started by the learner (or by her first answer), kept with the answers, at 0
//     the sheet is locked and handed in (DocWorksheetPlayer);
//   - the plays of a recording when it is heard a set number of times (listening blocks, data.lockPlays);
//   - the part's points: the scored items of the sheet converted to the part's points (35 items → 20 p).
// Bookkeeping values live with the answers under keys whose item starts with `$` („blockId:$startedAt”,
// „blockId:$plays”): never an answer, never scored, they do not make a task „answered” (registry.js blockAnswered).

import { BLOCKS, exampleAnswers } from './registry.js';
import { isInLesson } from './inLesson.js';
import { E9_EXAM, examFor } from './blocks/harnoScales.js';

import { START_KEY } from './metaKeys.js';

export { START_KEY, formatClock, isMetaKey, playLimit, playsKey } from './metaKeys.js';

// an exam sheet: the sheet names the exam whose format it follows
export const isExamSheet = (doc) => Boolean(doc?.meta?.exam);

// the part header that locks the sheet when its time is over
export function examLockBlock(doc) {
  return (doc?.blocks || []).find((b) => b.type === 'exampart' && b.data?.lock && Number(b.data?.minutes) > 0) || null;
}

// { blockId, minutes, startedAt, deadline, left (seconds), over } — or null when the sheet has no locked part
export function examClock(doc, answers = {}, now = Date.now()) {
  const block = examLockBlock(doc);
  if (!block) return null;
  const minutes = Number(block.data.minutes);
  const startedAt = Number(answers[`${block.id}:${START_KEY}`]) || 0;
  if (!startedAt) return { blockId: block.id, minutes, startedAt: 0, deadline: 0, left: minutes * 60, over: false };
  const deadline = startedAt + minutes * 60000;
  const left = Math.max(0, Math.ceil((deadline - now) / 1000));
  return { blockId: block.id, minutes, startedAt, deadline, left, over: left === 0 };
}


// The part's points (owner's format: listening 35 items → 20 p, reading and structure 65 → 40 p). Every scored item of
// the sheet counts — an unanswered task is 0 here, as in the exam — except the solved example, an ungraded task and a pair
// task of the lesson. The part header says which part and how many points: exampart { skill, points } with `convert`,
// or with exam 'E9' (the 9th-grade e-exam). { skill, part, exam, correct, items, points, max, pct, rule } or null.
export function partScore(doc, answers = {}) {
  const head = (doc?.blocks || []).find((b) => b.type === 'exampart' && Number(b.data?.points) > 0 && (b.data?.convert || b.data?.exam === E9_EXAM));
  if (!head) return null;
  let correct = 0;
  let items = 0;
  for (const b of doc.blocks) {
    const def = BLOCKS[b.type];
    if (!def?.score || b.ungraded || isInLesson(b)) continue;
    const example = exampleAnswers(b);
    const scored = def.score(b.data || {}, (k) => answers[`${b.id}:${k}`], b).filter((it) => !(it.key in example));
    items += scored.length;
    correct += scored.filter((it) => it.ok).length;
  }
  if (!items) return null;
  const max = Number(head.data.points);
  const points = Math.round((correct / items) * max * 10) / 10;
  return { skill: head.data.skill || '', part: head.data.part || '', exam: head.data.exam || doc.meta?.exam || '', correct, items, points, max, pct: Math.round((correct / items) * 100), rule: examFor(head.data.exam || doc.meta?.exam)?.rule || null };
}
