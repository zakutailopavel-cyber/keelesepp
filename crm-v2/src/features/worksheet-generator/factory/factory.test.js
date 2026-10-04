import { describe, expect, it } from 'vitest';
import roadmap from '../../curriculum/a2Roadmap.json';
import { generateLessonBundle } from '../engine/generator.js';
import { REUSABLE_CONTENT_LIBRARY } from './contentLibrary.js';
import { createContentPackDraft, suggestReusablePackIds } from './factory.js';

const lessons = roadmap.modules.flatMap((module) => module.lessons);

describe('Content Pack Factory v1', () => {
  it.each(['a2-002', 'a2-003', 'a2-004', 'a2-005', 'a2-006', 'a2-007', 'a2-008', 'a2-009', 'a2-010'])('builds a ready, deterministic five-task bundle for %s', (lessonId) => {
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

  it.each(['a2-007', 'a2-008', 'a2-009', 'a2-010'])('gives %s complete answer keys on every sheet across seeds', (lessonId) => {
    const lesson = lessons.find((item) => item.id === lessonId);
    const { profile } = createContentPackDraft(lesson);
    for (const seed of ['a', 'b', 'c', 'd', 'e', 'f']) {
      const generated = generateLessonBundle({ lesson, profile, seed: `${lessonId}:${seed}` });
      expect(generated.diagnostics.filter((item) => item.severity === 'error'), seed).toEqual([]);
    }
  });

  it('every sentence of every pack contains a target word, so gap-fill always has an answer', () => {
    for (const id of Object.keys(REUSABLE_CONTENT_LIBRARY)) {
      const pack = REUSABLE_CONTENT_LIBRARY[id];
      const words = pack.vocabulary.map((item) => item.word.toLocaleLowerCase('et'));
      pack.sentences.forEach((sentence) => {
        const text = sentence.text.toLocaleLowerCase('et');
        expect(words.some((word) => new RegExp(`(^|\\s)${word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?=[.,!?;:]|\\s|$)`, 'u').test(text)), `${id}: ${sentence.text}`).toBe(true);
      });
    }
  });

  it('module 2 uses the intended curated sources and keeps clock tasks out of A2-007…A2-009', () => {
    const pick = (lessonId) => suggestReusablePackIds(lessons.find((item) => item.id === lessonId));
    expect(pick('a2-007')).toEqual(['possession-genitive']);
    expect(pick('a2-008')).toEqual(['appearance-character']);
    expect(pick('a2-009')).toEqual(['people-profiles']);
    expect(pick('a2-010')).toEqual(['family-relations', 'possession-genitive', 'appearance-character', 'people-profiles']);
    for (const lessonId of ['a2-007', 'a2-008', 'a2-009']) {
      const lesson = lessons.find((item) => item.id === lessonId);
      const { profile } = createContentPackDraft(lesson);
      const generated = generateLessonBundle({ lesson, profile, seed: `${lessonId}:clock` });
      expect(generated.sheets.flatMap((sheet) => sheet.worksheetDoc.blocks.map((block) => block.type))).not.toContain('clock');
    }
    const a2007 = createContentPackDraft(lessons.find((item) => item.id === 'a2-007')).profile;
    expect(a2007.banks.sentences.some((item) => item.text.includes('Kelle kott'))).toBe(true);
    expect(a2007.banks.errorPairs.map((item) => item.correct)).toContain('See on minu venna auto.');
  });

  it('gap choices never offer a second word of the same part of speech (one correct answer)', () => {
    const lesson = lessons.find((item) => item.id === 'a2-007');
    const { profile } = createContentPackDraft(lesson);
    const typeOf = new Map(profile.activeVocabulary.map((item) => [item.word, item.lexicalType]));
    let checked = 0;
    for (let index = 0; index < 30; index += 1) {
      const generated = generateLessonBundle({ lesson, profile, seed: `a2-007:choice:${index}` });
      generated.sheets.flatMap((sheet) => sheet.worksheetDoc.blocks)
        .filter((block) => block.type === 'choice' && block.data.title === 'Vali lausesse sobiv vorm.')
        .flatMap((block) => block.data.questions)
        .forEach((question) => {
          const options = question.options.split('\n');
          const correct = options.find((option) => option.startsWith('*')).slice(1);
          options.filter((option) => !option.startsWith('*')).forEach((option) => expect(typeOf.get(option), `${question.q} ${option}`).not.toBe(typeOf.get(correct)));
          checked += 1;
        });
    }
    expect(checked).toBeGreaterThan(0);
  });

  it('true/false items name the situation the learner judges against', () => {
    const lesson = lessons.find((item) => item.id === 'a2-009');
    const { profile } = createContentPackDraft(lesson);
    const labels = profile.contexts.map((item) => item.label);
    const blocks = generateLessonBundle({ lesson, profile, seed: 'a2-009:tf' }).sheets.flatMap((sheet) => sheet.worksheetDoc.blocks).filter((block) => block.type === 'truefalse');
    expect(blocks.length).toBeGreaterThan(0);
    blocks.forEach((block) => expect(labels.some((label) => block.data.instruction.includes(`Olukord: ${label}.`))).toBe(true));
  });

  it('reports missing sources and never invents or activates an unsupported profile', () => {
    const result = createContentPackDraft({ id: 'a2-099', title: 'A2 proovieksam' });
    expect(result.status).toBe('missing-sources');
    expect(result.profile).toBeNull();
    expect(result.missingSources).not.toEqual([]);
  });
});
