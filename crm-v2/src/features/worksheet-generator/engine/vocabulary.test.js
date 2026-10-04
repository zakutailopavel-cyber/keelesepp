import { describe, expect, it } from 'vitest';
import { inspectVocabularyLevel, normalizeLevelLexicon, selectVocabulary } from './vocabulary.js';

const lexicon = {
  A1: { noun: ['kodu'], verb: ['olema'] },
  A2: { adverb: ['hommikul'] },
  B1: { noun: ['prioriteet'], adverb: ['tegelikult'] },
};

describe('level vocabulary', () => {
  it('normalizes the existing level/type lexicon shape deterministically', () => {
    expect(normalizeLevelLexicon(lexicon)).toEqual([
      { word: 'kodu', lexicalType: 'noun', level: 'A1' },
      { word: 'olema', lexicalType: 'verb', level: 'A1' },
      { word: 'hommikul', lexicalType: 'adverb', level: 'A2' },
      { word: 'prioriteet', lexicalType: 'noun', level: 'B1' },
      { word: 'tegelikult', lexicalType: 'adverb', level: 'B1' },
    ]);
  });

  it('uses the lexicon as a CEFR-safe reserve without replacing lesson target vocabulary', () => {
    const result = selectVocabulary({
      activeVocabulary: [{ id: 'target-1', word: 'enne' }],
      levelLexicon: lexicon,
      level: 'A2',
      count: 3,
      seed: 'vocabulary',
    });
    expect(result.items[0]).toMatchObject({ id: 'target-1', word: 'enne' });
    expect(result.items).toHaveLength(3);
    expect(result.items.some((item) => item.word === 'prioriteet')).toBe(false);
    expect(result.items.some((item) => item.word === 'tegelikult')).toBe(false);
  });

  it('warns when a known target word exists only above the lesson CEFR ceiling', () => {
    const audit = inspectVocabularyLevel({
      activeVocabulary: [{ word: 'kodu' }, { word: 'prioriteet' }, { word: 'tundmatu' }],
      levelLexicon: lexicon,
      level: 'A2',
    });
    expect(audit.knownCount).toBe(2);
    expect(audit.aboveLevel).toEqual([{ word: 'prioriteet', levels: ['B1'] }]);
    expect(audit.diagnostics).toEqual([
      expect.objectContaining({ severity: 'warning', code: 'VOCAB_ABOVE_LEVEL' }),
    ]);
  });
});
