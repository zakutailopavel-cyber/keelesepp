import { describe, expect, it } from 'vitest';
import { COURSE_MODULES, moduleSheets } from './registry.js';

// Owner 2026-11-04: „диктанты вообще не нужны на Б1 Б2 и С1” — no dictation in the B1 (a2b1), B2 (b1b2) and C1 courses;
// A2 keeps them (docs/LESSON_QUALITY_CONTRACT.md A3b)
const NO_DICTATION = ['b1', 'b2', 'c1', 'b2c1'];

describe('no dictation in B1–C1', () => {
  it('no B1, B2 or C1 course sheet has a dictation block', () => {
    const found = COURSE_MODULES.filter((m) => NO_DICTATION.includes(m.MODULE.course))
      .flatMap((m) => Object.entries(moduleSheets(m)).flatMap(([id, sheets]) => Object.entries(sheets)
        .flatMap(([phase, doc]) => doc.blocks.filter((b) => b.type === 'dictation').map((b) => `${id}/${phase} ${b.id}`))));
    expect(found).toEqual([]);
  });
});
