import { createHash } from 'node:crypto';
import { BLOCKS, answerProgress, checkDocument } from './registry.js';
import { buildCourseSheet } from '../../worksheet-generator/admin/course/registry.js';
import * as a2m01 from '../../worksheet-generator/admin/course/archive/pin/a2/module01.js';
import * as b1m03 from '../../worksheet-generator/admin/course/archive/pin/b1/module03.js';
import * as b2m01 from '../../worksheet-generator/admin/course/archive/pin/b2/module01.js';
import * as c1m01 from '../../worksheet-generator/admin/course/archive/pin/c1/module01.js';
import * as b2v3 from '../../worksheet-generator/admin/course/archive/v3/b2/module01.js';

// Grading is the contract the phone view must not touch (owner 2026-11-01): the marks and the score of real course sheets,
// also the template v3 copies old assignments hold, for answers typed right, answers of one fixed kind, and none.
// GOLDEN was written from `main` before the phone view existed. The sheets come from frozen copies in `archive/pin/`
// (main 2026-11-03), so rewriting a live module's content does not move the pin; only a grading change does. A change here means grading changed: that is a decision
// for the owner, never a side effect of a layout fix.
export const MODULES = { a2m01, b1m03, b2m01, c1m01, b2v3 };
const PHASES = ['discover', 'practice', 'transfer'];

function answerSets(doc) {
  const typed = {};
  const fixed = {};
  doc.blocks.forEach((block) => {
    const def = BLOCKS[block.type];
    (def?.answers?.(block.data || {}, block) || []).forEach(({ key, accept }) => { typed[`${block.id}:${key}`] = accept[0]; fixed[`${block.id}:${key}`] = 0; });
    (def?.answerKeys?.(block.data || {}) || []).forEach((key) => { typed[`${block.id}:${key}`] = 'Minu vastus on siin.'; });
  });
  return { typed, fixed, empty: {} };
}

const sha = (value) => createHash('sha256').update(JSON.stringify(value)).digest('hex').slice(0, 16);

export function digest(mod) {
  return Object.keys(mod.LESSONS).flatMap((lessonId) => PHASES.filter((phase) => mod.LESSONS[lessonId][phase]).map((phase) => {
    const doc = buildCourseSheet(mod, lessonId, phase);
    const sets = answerSets(doc);
    const out = Object.fromEntries(Object.entries(sets).map(([name, answers]) => {
      const { results, score } = checkDocument(doc, answers);
      return [name, { results, score, progress: answerProgress(doc, answers) }];
    }));
    return [`${lessonId}/${phase}`, sha(out), out.typed.score.pct];
  }));
}

