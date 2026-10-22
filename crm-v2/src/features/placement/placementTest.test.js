import { checkDocument } from '../worksheet-studio/engine/registry.js';
import { LEVELS, placementDocument, placementItem, placementLevel } from './placementTest.js';

describe('Paigutustest (owner 2026-10-23)', () => {
  it('has 30 questions, six per level, one right option each, a goal per level', () => {
    const doc = placementDocument();
    expect(doc.blocks.map((block) => block.goal)).toEqual(LEVELS.map((level) => `g_${level.toLowerCase()}`));
    for (const block of doc.blocks) {
      expect(block.data.questions).toHaveLength(6);
      block.data.questions.forEach((q) => expect(q.options.split('\n').filter((o) => o.startsWith('*'))).toHaveLength(1));
    }
  });

  it('the auto-check gives a result per level and the level follows from it', () => {
    const doc = placementDocument();
    // right answers for A1 and A2 (option 0 is the right one as written), wrong for the rest
    const answers = {};
    doc.blocks.forEach((block, bi) => block.data.questions.forEach((_, qi) => { answers[`${block.id}:${qi}`] = bi < 2 ? 0 : 1; }));
    const { perGoal } = checkDocument(doc, answers).score;
    expect(placementLevel(perGoal)).toMatchObject({ level: 'A2' });
    expect(placementLevel({ g_a1: { ok: 2, total: 6 }, g_a2: { ok: 6, total: 6 } }).level).toBe('A0');
    expect(placementLevel({ g_a1: { ok: 6, total: 6 }, g_a2: { ok: 3, total: 6 }, g_b1: { ok: 6, total: 6 } }).level).toBe('A1');
  });

  it('is a normal worksheet item for the library', () => {
    expect(placementItem()).toMatchObject({ sourceId: 'placement-et', type: 'worksheet', source: { worksheetDocStatus: 'published' } });
  });
});
