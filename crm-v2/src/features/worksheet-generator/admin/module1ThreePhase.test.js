import { describe, expect, it } from 'vitest';
import { buildModule1Worksheet, MODULE1_LESSON_IDS, MODULE1_PHASES, module1VocabularyCycle } from './module1ThreePhase.js';

const rawMarkdown = /(^|\s)\*[^*]+\*/;

describe('module 1 three-phase worksheets', () => {
  it('builds 15 worksheets', () => {
    const docs = MODULE1_LESSON_IDS.flatMap((lessonId) => MODULE1_PHASES.map((phase) => buildModule1Worksheet(lessonId, phase)));
    expect(docs).toHaveLength(15);
  });

  it.each(MODULE1_LESSON_IDS)('%s has all three distinct phases', (lessonId) => {
    const docs = MODULE1_PHASES.map((phase) => buildModule1Worksheet(lessonId, phase));
    expect(docs.map((doc) => doc.meta.phase)).toEqual(['discover', 'practice', 'transfer']);
    expect(new Set(docs.map((doc) => doc.blocks.map((block) => block.type).join('|'))).size).toBeGreaterThan(1);
  });

  it('question blocks use at least five questions', () => {
    for (const lessonId of MODULE1_LESSON_IDS) {
      for (const phase of MODULE1_PHASES) {
        const doc = buildModule1Worksheet(lessonId, phase);
        for (const block of doc.blocks) {
          if (block.type === 'choice') expect(block.data.questions.length).toBeGreaterThanOrEqual(5);
          if (block.type === 'reading') expect(String(block.data.questions).split('\n').filter(Boolean).length).toBeGreaterThanOrEqual(5);
        }
      }
    }
  });

  it('discover sheets are substantial and do not share one block template', () => {
    const patterns = MODULE1_LESSON_IDS.map((lessonId) => {
      // the author's blocks; the lesson frame (enrichment `enr_…`, picture `art_…` / `artq_…`) is the same everywhere
      const blocks = buildModule1Worksheet(lessonId, 'discover').blocks.filter((block) => !/^(enr|art|artq)_/.test(String(block.id)));
      expect(blocks.length).toBeGreaterThanOrEqual(7);
      expect(blocks.length).toBeLessThanOrEqual(9);
      return blocks.map((block) => block.type).join('|');
    });
    expect(new Set(patterns).size).toBeGreaterThanOrEqual(4);
  });

  it('vocabulary cycle uses three-form Russian entries for core verbs', () => {
    const cycle = module1VocabularyCycle();
    expect(cycle.core.length).toBeGreaterThanOrEqual(12);
    for (const item of cycle.core.filter((entry) => entry.includes(' — ') && entry.includes('ma – '))) {
      expect(item.split(' – ').length).toBeGreaterThanOrEqual(3);
      expect(item).toMatch(/ — [А-Яа-яЁё]/);
    }
  });

  it('uses learner keyword markup instead of raw authoring asterisks in text passages', () => {
    for (const lessonId of MODULE1_LESSON_IDS) {
      const doc = buildModule1Worksheet(lessonId, 'discover');
      for (const block of doc.blocks) {
        if (block.type === 'reading') expect(block.data.passage).not.toMatch(rawMarkdown);
      }
    }
  });
});
