import { describe, expect, it } from 'vitest';
import roadmap from '../../curriculum/a2Roadmap.json';
import { generateLessonBundle } from '../engine/generator.js';
import { createContentPackDraft, suggestReusablePackIds } from './factory.js';

const lessons = roadmap.modules.flatMap((module) => module.lessons);

describe('Content Pack Factory v1', () => {
  it.each(['a2-002', 'a2-003', 'a2-004', 'a2-005', 'a2-006'])('builds a ready, deterministic five-task bundle for %s', (lessonId) => {
    const lesson = lessons.find((item) => item.id === lessonId);
    const first = createContentPackDraft(lesson);
    const second = createContentPackDraft(lesson);

    expect(first).toEqual(second);
    expect(first.status).toBe('ready');
    expect(first.readiness.ready).toBe(true);
    expect(first.readiness.diagnostics.filter((item) => item.severity === 'error')).toEqual([]);
    expect(first.profile.contexts.length).toBeGreaterThanOrEqual(3);
    ['discover', 'practice', 'transfer'].forEach((phase) => {
      expect(first.readiness.catalog[phase].available).toBeGreaterThanOrEqual(5);
    });

    const ids = [
      ...first.profile.focuses,
      ...first.profile.activeVocabulary,
      ...first.profile.contexts,
      ...Object.values(first.profile.banks).flat(),
    ].map((item) => item.id).filter(Boolean);
    expect(new Set(ids).size).toBe(ids.length);

    const generated = generateLessonBundle({ lesson, profile: first.profile, seed: `${lessonId}:factory-test` });
    expect(generated.diagnostics.filter((item) => item.severity === 'error')).toEqual([]);
    expect(generated.sheets.map((sheet) => sheet.phase)).toEqual(['discover', 'practice', 'transfer']);
    expect(generated.sheets.every((sheet) => sheet.worksheetDoc.blocks.length === 5)).toBe(true);
    generated.sheets.forEach((sheet) => {
      expect(sheet.worksheetDoc.meta.subtitle).not.toMatch(/[А-Яа-яЁё]/);
      expect(sheet.worksheetDoc.meta.canDo).not.toMatch(/[А-Яа-яЁё]/);
      sheet.worksheetDoc.blocks.forEach((block) => {
        expect(block.data?.title || '').not.toMatch(/[А-Яа-яЁё]/);
        expect(block.data?.instruction || '').not.toMatch(/[А-Яа-яЁё]/);
      });
    });
  });

  it('uses the intended curated sources for each supported lesson', () => {
    const selections = ['a2-002', 'a2-003', 'a2-004', 'a2-005', 'a2-006'].map((lessonId) => {
      const lesson = lessons.find((item) => item.id === lessonId);
      return suggestReusablePackIds(lesson);
    });
    expect(selections[0]).toEqual(['introduction', 'basic-questions']);
    expect(selections[1]).toEqual(['olema-present', 'present-common-verbs']);
    expect(selections[2]).toEqual(['personal-info', 'numbers-dates']);
    expect(selections[3]).toHaveLength(6);
    expect(selections[4]).toEqual(['family-relations']);
    expect(new Set(selections.map((item) => item.join('|'))).size).toBe(5);
  });

  it('keeps A2-006 grounded in family relations and the kelle-pattern', () => {
    const lesson = lessons.find((item) => item.id === 'a2-006');
    const result = createContentPackDraft(lesson);

    expect(result.status).toBe('ready');
    expect(result.selectedPackIds).toEqual(['family-relations']);
    expect(result.profile.focuses).toEqual(expect.arrayContaining([
      expect.objectContaining({ id: 'family-relations', patterns: expect.arrayContaining(['Kelle …?']) }),
    ]));
    expect(result.profile.activeVocabulary.map((item) => item.word)).toEqual(expect.arrayContaining([
      'ema', 'isa', 'õde', 'vend', 'abikaasa', 'vanemad', 'lapsed',
    ]));
    expect(result.profile.contexts.map((item) => item.id)).toEqual(['family-tree', 'family-photo', 'family-visit']);
    expect(result.profile.banks.sentences.some((item) => item.text.includes('Kelle tütar'))).toBe(true);
    expect(result.profile.banks.speakingPrompts).toHaveLength(2);
    expect(result.profile.banks.writingPrompts).toHaveLength(1);
  });

  it('reports missing sources and never invents or activates an unsupported profile', () => {
    const result = createContentPackDraft({ id: 'a2-099', title: 'A2 proovieksam' });
    expect(result.status).toBe('missing-sources');
    expect(result.profile).toBeNull();
    expect(result.missingSources).not.toEqual([]);
  });
});
