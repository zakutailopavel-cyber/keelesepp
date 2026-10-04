import { describe, expect, it } from 'vitest';
import profile from '../fixtures/a2b1-016.generator-profile.json';
import { generateLessonBundle } from './generator.js';
import { canRegenerateTask, regenerateTask } from './regenerate.js';

function source() {
  const result = generateLessonBundle({
    lesson: { id: 'a2b1-016', tag: 'Грамматика', levelStage: 'A2' },
    profile,
    seed: 'task-regeneration-reference',
    difficulty: 'core',
    variant: 2,
  });
  const sheet = result.sheets.find((item) => item.phase === 'practice');
  return {
    sheet,
    generation: {
      generatorVersion: sheet.generatorVersion,
      seed: sheet.seed,
      phase: sheet.phase,
      focusIds: sheet.focusIds,
      profileVersion: sheet.profileVersion,
      activityIds: sheet.activityIds,
      difficulty: sheet.difficulty,
      lessonDna: sheet.lessonDna,
    },
  };
}

describe('per-task regeneration', () => {
  it('deterministically replaces one generated task while preserving its identity and layout', () => {
    const { sheet, generation } = source();
    const original = { ...sheet.worksheetDoc.blocks[0], span: 9, width: 'half', minHeightMm: 88, tone: 'mint' };
    const worksheetDoc = {
      ...sheet.worksheetDoc,
      blocks: [original, ...sheet.worksheetDoc.blocks.slice(1)],
    };

    expect(canRegenerateTask({ block: original, generation })).toBe(true);
    const first = regenerateTask({ profile, generation, worksheetDoc, blockId: original.id });
    const again = regenerateTask({ profile, generation, worksheetDoc, blockId: original.id });

    expect(first).toEqual(again);
    expect(first.diagnostics.filter((item) => item.severity === 'error')).toEqual([]);
    expect(first.block).toBeTruthy();
    expect(first.block.id).toBe(original.id);
    expect(first.block.goal).toBe(original.goal);
    expect(first.block.span).toBe(9);
    expect(first.block.width).toBe('half');
    expect(first.block.minHeightMm).toBe(88);
    expect(first.block.tone).toBe('mint');
    expect({ type: first.block.type, data: first.block.data }).not.toEqual({ type: original.type, data: original.data });
    expect(['activity', 'content']).toContain(first.mode);
  });

  it('uses current block content as the next deterministic seed', () => {
    const { sheet, generation } = source();
    const original = sheet.worksheetDoc.blocks[1];
    const first = regenerateTask({ profile, generation, worksheetDoc: sheet.worksheetDoc, blockId: original.id });
    expect(first.block).toBeTruthy();

    const nextDoc = {
      ...sheet.worksheetDoc,
      blocks: sheet.worksheetDoc.blocks.map((block) => block.id === original.id ? first.block : block),
    };
    const second = regenerateTask({ profile, generation, worksheetDoc: nextDoc, blockId: original.id });
    expect(second.block).toBeTruthy();
    expect({ type: second.block.type, data: second.block.data }).not.toEqual({ type: first.block.type, data: first.block.data });
    expect(second.seed).not.toBe(first.seed);
  });

  it('fails closed for a manual or unsupported block', () => {
    const { sheet, generation } = source();
    const manual = { ...sheet.worksheetDoc.blocks[0], id: 'manual-block' };
    const worksheetDoc = { ...sheet.worksheetDoc, blocks: [manual, ...sheet.worksheetDoc.blocks.slice(1)] };
    const result = regenerateTask({ profile, generation, worksheetDoc, blockId: manual.id });
    expect(result.block).toBeNull();
    expect(result.diagnostics).toEqual(expect.arrayContaining([
      expect.objectContaining({ severity: 'error', code: 'REGENERATION_BLOCK_UNSUPPORTED' }),
    ]));
  });
});
