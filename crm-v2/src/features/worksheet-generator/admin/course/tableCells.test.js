// A table splits its cells on „|” (engine/blocks/extra.jsx tableRows), so an answer with alternatives takes „/” inside
// the brackets: [tube/tubasid]. Written as [tube|tubasid], the cell breaks in two and the learner sees „[tube” with no
// field (found in b1b2-k01, 2026-11-18). Every table cell of every course sheet has balanced brackets.
import { COURSE_MODULES, moduleSheets } from './registry.js';

const broken = (cell) => (cell.match(/\[/g) || []).length !== (cell.match(/\]/g) || []).length;

describe('course tables: alternatives inside [ ] use „/”, never „|”', () => {
  it('no table cell is cut in two by a „|” inside brackets', () => {
    const bad = [];
    for (const mod of COURSE_MODULES) {
      for (const [lessonId, phases] of Object.entries(moduleSheets(mod))) {
        for (const [phase, doc] of Object.entries(phases)) {
          for (const block of (doc.blocks || []).filter((b) => b.type === 'table')) {
            String(block.data?.rows || '').split('\n').forEach((row) => {
              if (row.split('|').some(broken)) bad.push(`${lessonId} ${phase} ${block.id}: ${row}`);
            });
          }
        }
      }
    }
    expect(bad).toEqual([]);
  });
});
