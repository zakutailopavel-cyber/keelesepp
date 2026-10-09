import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import process from 'node:process';
import { describe, expect, it } from 'vitest';
import profile from '../fixtures/a2b1-016.generator-profile.json';
import { validateWorksheetDoc } from '../../../services/firebase/worksheetDocs.js';
import { BLOCKS } from '../../worksheet-studio/engine/registry.js';
import { renderTemplate } from './content.js';
import {
  createSeededRandom,
  generateFocusWorksheet,
  generateLessonBundle,
  normalizeFocusSelection,
  normalizeLessonKind,
  normalizeLevel,
  normalizeLevelLexicon,
  selectVocabulary,
  shuffleSeeded,
} from './generator.js';

const lesson = { id: 'a2b1-016', tag: 'Грамматика', levelStage: 'A2', goal: 'Уточнить выражение времени, длительности и последовательности.', success: 'Ученик описывает расписание с минимум 6 временными маркерами.' };
const lexicon = { A1: { noun: ['kodu', 'töö'], verb: ['minema'] }, A2: [{ word: 'kohtumine', lexicalType: 'noun' }], B1: ['keeruline'] };

describe('deterministic seed helpers', () => {
  it('repeats sequences for the same seed and changes them for another seed', () => {
    const first = createSeededRandom('same');
    const second = createSeededRandom('same');
    const other = createSeededRandom('other');
    expect([first(), first(), first()]).toEqual([second(), second(), second()]);
    expect([createSeededRandom('same')(), createSeededRandom('same')()]).not.toEqual([other(), other()]);
  });

  it('shuffles without losing or duplicating values', () => {
    const source = ['a', 'b', 'c', 'd'];
    const result = shuffleSeeded(source, 'seed');
    expect([...result].sort()).toEqual(source);
    expect(result).toEqual(shuffleSeeded(source, 'seed'));
  });
});

describe('normalization', () => {
  it('normalizes lesson kinds, levels, legacy focus aliases and duplicate selections', () => {
    expect(normalizeLessonKind('Грамматика')).toBe('grammar');
    expect(normalizeLessonKind('Большая проверка')).toBe('assessment');
    expect(normalizeLevel('B2-')).toEqual({ base: 'B2', modifier: 'minus' });
    expect(normalizeFocusSelection({ profile, legacy: 'enne / pärast; enne / pärast' })).toMatchObject({ focusIds: ['before-after'], diagnostics: [] });
    expect(normalizeFocusSelection({ profile, selected: [{ id: 'sequence', label: 'Järjekord' }] })).toMatchObject({ focusIds: ['sequence'], diagnostics: [] });
    expect(normalizeFocusSelection({ profile, legacy: 'kell…' })).toMatchObject({ focusIds: ['time-of-day'], diagnostics: [] });
    expect(normalizeFocusSelection({ profile, legacy: 'kell…, alates… kuni…, enne, pärast, kõigepealt, siis, lõpuks' }).diagnostics[0].code).toBe('FOCUS_TOO_MANY');
    expect(normalizeFocusSelection({ profile, legacy: 'unknown target' }).diagnostics[0].code).toBe('FOCUS_UNKNOWN');
    expect(normalizeFocusSelection({ profile, selected: profile.focuses.map((item) => item.id) }).diagnostics[0].code).toBe('FOCUS_TOO_MANY');
  });

  it('normalizes the legacy vocabulary shapes and never samples above the level ceiling', () => {
    expect(normalizeLevelLexicon(lexicon)).toEqual(expect.arrayContaining([expect.objectContaining({ word: 'kohtumine', level: 'A2' })]));
    const selected = selectVocabulary({ activeVocabulary: profile.activeVocabulary.slice(0, 2), levelLexicon: lexicon, level: 'A2+', count: 8, seed: 'vocab' });
    expect(selected.items.map((item) => item.word)).not.toContain('keeruline');
    expect(selected.items.slice(0, 2).map((item) => item.word)).toEqual(profile.activeVocabulary.slice(0, 2).map((item) => item.word));
    expect(selectVocabulary({ activeVocabulary: profile.activeVocabulary.slice(0, 2), levelLexicon: lexicon, level: 'A2+', count: 8, seed: 'vocab' })).toEqual(selected);
    expect(selected.diagnostics[0].code).toBe('VOCAB_INSUFFICIENT');
  });
});

describe('worksheet generation', () => {
  it('generates three distinct, valid and aligned worksheet documents', () => {
    const result = generateLessonBundle({ lesson, profile, levelLexicon: lexicon, seed: 'reference' });
    expect(result.sheets).toHaveLength(3);
    expect(result.sheets.map((sheet) => sheet.role)).toEqual(['discover', 'practice', 'transfer']);
    expect(result.sheets.map((sheet) => sheet.displayLabel)).toEqual(['Avasta', 'Harjuta', 'Kasuta']);
    expect(result.sheets.every((sheet) => sheet.activityIds.length === 5)).toBe(true);
    expect(result.sheets.every((sheet) => new Set(sheet.activityIds).size === 5)).toBe(true);
    result.sheets.forEach((sheet) => {
      expect(validateWorksheetDoc(sheet.worksheetDoc)).toBe(true);
      const tasks = sheet.worksheetDoc.blocks.filter((block) => BLOCKS[block.type]?.task);
      expect(tasks.length).toBeGreaterThanOrEqual(5);
      expect(tasks.length).toBeLessThanOrEqual(7);
      expect(sheet.diagnostics.filter((item) => item.severity === 'error')).toEqual([]);
    });
    expect(new Set(result.sheets.map((sheet) => sheet.contextId))).toHaveLength(3);
    expect(result.sheets[2].worksheetDoc.blocks.some((block) => ['speaking', 'writing'].includes(block.type))).toBe(true);
    const serialized = result.sheets.map((sheet) => JSON.stringify(sheet.worksheetDoc));
    (profile.banks.sentences || []).map((item) => renderTemplate(item, 'audit')).forEach((sentence) => {
      expect(serialized.filter((document) => document.includes(sentence)).length).toBeLessThanOrEqual(1);
    });
    expect(generateLessonBundle({ lesson, profile, levelLexicon: lexicon, seed: 'reference' })).toEqual(result);
    expect(result.lessonDna).toMatchObject({ schema: 'keelesepp.lesson-dna/1', lessonId: 'a2b1-016', difficulty: 'core', mode: 'lesson-bundle' });
    expect(generateLessonBundle({ lesson, profile, levelLexicon: lexicon, seed: 'variant' }).sheets).not.toEqual(result.sheets);

    const support = generateLessonBundle({ lesson, profile, seed: 'difficulty', difficulty: 'support' });
    const challenge = generateLessonBundle({ lesson, profile, seed: 'difficulty', difficulty: 'challenge' });
    expect(support.diagnostics.filter((item) => item.severity === 'error')).toEqual([]);
    expect(challenge.diagnostics.filter((item) => item.severity === 'error')).toEqual([]);
    expect(support.lessonDna.difficulty).toBe('support');
    expect(challenge.lessonDna.difficulty).toBe('challenge');
    expect(support.sheets).not.toEqual(challenge.sheets);
  });

  it('generates deterministic focus sheets and rejects unsupported focus selections', () => {
    const one = generateFocusWorksheet({ lesson, profile, focusIds: ['before-after'], phase: 'full', seed: 'focus' });
    expect(one.sheet.role).toBe('focus');
    expect(one.sheet.displayLabel).toBe('Täistööleht');
    expect(validateWorksheetDoc(one.sheet.worksheetDoc)).toBe(true);
    expect(one.sheet.worksheetDoc.blocks.some((block) => block.type === 'speaking')).toBe(true);
    expect(one.sheet.worksheetDoc.blocks.some((block) => block.type === 'gaps' || block.type === 'errorfix')).toBe(true);
    expect(generateFocusWorksheet({ lesson, profile, focusIds: ['before-after'], phase: 'full', seed: 'focus' })).toEqual(one);
    ['discover', 'practice', 'transfer'].forEach((phase) => {
      const generated = generateFocusWorksheet({ lesson, profile, focusIds: ['before-after'], phase, seed: `focus:${phase}` });
      expect(generated.sheet.displayLabel).toBe({ discover: 'Avasta', practice: 'Harjuta', transfer: 'Kasuta' }[phase]);
      expect(generated.sheet.diagnostics.filter((item) => item.severity === 'error')).toEqual([]);
    });
    expect(generateFocusWorksheet({ lesson, profile, focusIds: profile.focuses.slice(0, 3).map((item) => item.id), phase: 'practice' }).sheet).not.toBeNull();
    expect(generateFocusWorksheet({ lesson, profile, focusIds: profile.focuses.map((item) => item.id), phase: 'practice' }).diagnostics[0].code).toBe('FOCUS_TOO_MANY');
    expect(generateFocusWorksheet({ lesson, profile, focusIds: ['not-real'], phase: 'practice' }).diagnostics[0].code).toBe('FOCUS_UNKNOWN');
  });

  it('keeps the generator path free of non-deterministic random calls and provider imports', () => {
    const folder = join(process.cwd(), 'src/features/worksheet-generator/engine');
    const sources = ['seed.js', 'lessonKind.js', 'focus.js', 'vocabulary.js', 'difficulty.js', 'lessonDna.js', 'activityCatalog.js', 'planner.js', 'modulePlanner.js', 'recipes.js', 'content.js', 'quality.js', 'generator.js'].map((file) => readFileSync(`${folder}/${file}`, 'utf8')).join('\n');
    expect(sources).not.toContain('Math.random');
    expect(sources).not.toMatch(/openai|anthropic|gemini|@google\/generative-ai/i);
  });
});

describe('teacher-flagged sentences („Halb lause”)', () => {
  it('a sentence marked bad is never generated again', () => {
    const first = generateLessonBundle({ lesson, profile, levelLexicon: lexicon, seed: 'flags' });
    const sentencesOf = (bundle) => bundle.sheets.flatMap((s) => s.worksheetDoc.blocks).filter((b) => b.type === 'gaps' || b.type === 'wordorder')
      .flatMap((b) => String(b.data.sentences || '').split('\n').filter(Boolean));
    const used = sentencesOf(first);
    expect(used.length).toBeGreaterThan(0);
    const again = generateLessonBundle({ lesson, profile, levelLexicon: lexicon, seed: 'flags', blockedSentences: [used[0]] });
    const key = (x) => x.replace(/\[([^\]|]*)(\|[^\]]*)?\]/g, '$1').toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
    expect(sentencesOf(again).map(key)).not.toContain(key(used[0]));
  });
});
