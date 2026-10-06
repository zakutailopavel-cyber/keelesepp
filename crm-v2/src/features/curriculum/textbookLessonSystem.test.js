import { describe, expect, it } from 'vitest';
import {
  GRAMMAR_PROGRESSION_EXAMPLES,
  createGrammarTarget,
  grammarStateForLesson,
  validateGrammarTarget,
} from './grammarProgression.js';
import {
  createVocabularyEntry,
  hasRequiredLexicalEncounters,
  validateVocabularyEntry,
  vocabularyStatusForLesson,
} from './textbookVocabulary.js';

describe('textbook lesson system schemas', () => {
  it('tracks grammar from introduction through recycling', () => {
    const target = GRAMMAR_PROGRESSION_EXAMPLES[0];
    expect(validateGrammarTarget(target)).toEqual([]);
    expect(grammarStateForLesson(target, target.firstLessonId)).toBe('new');
    expect(grammarStateForLesson(target, target.controlledLessonIds[0])).toBe('recycled');
    expect(grammarStateForLesson(target, 'b1b2-001')).toBe('assumed');
  });

  it('rejects incomplete grammar targets', () => {
    expect(validateGrammarTarget(createGrammarTarget({ id: 'x' }))).toEqual(expect.arrayContaining([
      'label missing',
      'firstLevel missing',
      'firstLessonId missing',
      'masteryLevel missing',
    ]));
  });

  it('requires three learner forms and Russian translation for textbook vocabulary', () => {
    const entry = createVocabularyEntry({
      id: 'v-arkama',
      lemma: 'ärkama',
      forms: ['ärkama', 'ärgata', 'ärkan'],
      translationRu: 'просыпаться',
      level: 'A2',
      activeFromLessonId: 'a2-011',
      recycleLessonIds: ['a2-012', 'a2-013', 'a2-014', 'a2-015'],
    });
    expect(validateVocabularyEntry(entry)).toEqual([]);
    expect(hasRequiredLexicalEncounters(entry)).toBe(true);
  });

  it('classifies vocabulary encounters for retrieval planning', () => {
    const entry = createVocabularyEntry({
      id: 'v-puhkama',
      lemma: 'puhkama',
      forms: ['puhkama', 'puhata', 'puhkan'],
      translationRu: 'отдыхать',
      level: 'A2',
      activeFromLessonId: 'a2-011',
      recycleLessonIds: ['a2-012', 'a2-014', 'a2-015', 'a2-021'],
    });
    const ctx = {
      currentModuleLessonIds: ['a2-011', 'a2-012', 'a2-013', 'a2-014', 'a2-015'],
      previousModuleLessonIds: ['a2-006', 'a2-007', 'a2-008', 'a2-009', 'a2-010'],
    };
    expect(vocabularyStatusForLesson(entry, 'a2-011', ctx)).toBe('new');
    expect(vocabularyStatusForLesson(entry, 'a2-012', ctx)).toBe('current-module');
    expect(vocabularyStatusForLesson(entry, 'a2-021', ctx)).toBe('long-gap');
  });
});
