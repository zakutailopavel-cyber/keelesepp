// A2 supplement „Kontrolltöö 1” (a2/kontrolltoo.js): a review pack before a school test — a theory sheet, graded practice
// and a mock test. Every scored item has its „why” (one EXPLAIN line per key item), the mock test is closed and scored by
// the player (diagnostic), and all three sheets pass the sheet gate.
import { describe, expect, it } from 'vitest';
import * as mod from './a2/kontrolltoo.js';
import { buildCourseSheet } from './registry.js';
import { sheetProblems } from './quality.js';
import { answerKeyOf, explainedShare } from '../../../worksheet-studio/engine/answerKey.js';

const PHASES = ['discover', 'practice', 'transfer'];
const sheets = Object.fromEntries(PHASES.map((p) => [p, buildCourseSheet(mod, 'a2-kt01', p)]));

describe('A2 supplement: Kontrolltöö 1 (a2-kt01)', () => {
  it('three sheets: theory, practice, a scored mock test', () => {
    expect(sheets.discover.meta.theory).toBe(true);
    expect(sheets.practice.meta.diagnostic).toBeUndefined();
    expect(sheets.transfer.meta.diagnostic).toBe(true);
    expect(sheets.transfer.meta.displayLabel).toBe('3 Proovitöö');
  });

  it('every sheet passes the sheet gate', () => {
    for (const p of PHASES) expect(sheetProblems(sheets[p]), p).toEqual([]);
  });

  it('every scored item has its „why”, one EXPLAIN line per key item', () => {
    const items = {};
    for (const doc of Object.values(sheets)) {
      for (const task of answerKeyOf(doc)) {
        items[task.id] = task.items.length;
        if (task.items.some((it) => it.answer)) expect(explainedShare(task), task.id).toBe(1);
      }
    }
    for (const [blockId, lines] of Object.entries(mod.EXPLAIN)) expect(lines.length, blockId).toBe(items[blockId]);
  });

  it('the mock test is worth 48 points: six tasks, one point an item', () => {
    const points = answerKeyOf(sheets.transfer).reduce((n, task) => n + task.items.length, 0);
    expect(points).toBe(48);
  });
});
