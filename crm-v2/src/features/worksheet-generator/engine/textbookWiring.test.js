import { describe, expect, it } from 'vitest';
import { BLOCKS } from '../../worksheet-studio/engine/registry.js';
import { activityById } from './activityCatalog.js';
import { createLessonDna } from './lessonDna.js';
import { createGrammarTarget } from '../../curriculum/grammarProgression.js';
import { createVocabularyEntry } from '../../curriculum/textbookVocabulary.js';

describe('textbook generator wiring', () => {
  it('registers a first-class transformation block and activity', () => {
    expect(BLOCKS.transformation?.type).toBe('transformation');
    expect(BLOCKS.transformation?.task).toBe(true);
    expect(activityById('practice-sentence-transformation')).toMatchObject({
      blockType: 'transformation',
      family: 'transformation',
      phase: 'practice',
    });
  });

  it('adds problem solving to transfer planning', () => {
    expect(activityById('transfer-problem-solving')).toMatchObject({
      blockType: 'planning',
      family: 'problem-solving',
      phase: 'transfer',
    });
  });

  it('carries grammar and lexical progression into lesson DNA', () => {
    const grammar = createGrammarTarget({
      id: 'present-frequency',
      label: 'Olevik ja sagedus',
      firstLevel: 'A2',
      firstLessonId: 'a2-011',
      masteryLevel: 'B1',
      controlledLessonIds: ['a2-012'],
      retrievalLessonIds: ['a2-015'],
    });
    const vocabulary = createVocabularyEntry({
      id: 'v-arkama',
      lemma: 'ärkama',
      forms: ['ärkama', 'ärgata', 'ärkan'],
      translationRu: 'просыпаться',
      level: 'A2',
      activeFromLessonId: 'a2-011',
      recycleLessonIds: ['a2-012', 'a2-013', 'a2-014', 'a2-015'],
    });

    const dna = createLessonDna({
      lesson: { id: 'a2-012', levelStage: 'A2', kind: 'grammar' },
      profile: {
        schema: 'keelesepp.worksheet-generator-profile/1',
        version: 1,
        lessonId: 'a2-012',
        level: 'A2',
        lessonKind: 'grammar',
        focuses: [{ id: 'frequency', label: 'Sagedus' }],
        activeVocabulary: [{ id: 'v-arkama', word: 'ärkama' }],
        grammarTargets: [grammar],
        textbookVocabulary: [vocabulary],
        currentModuleLessonIds: ['a2-011', 'a2-012', 'a2-013', 'a2-014', 'a2-015'],
      },
    });

    expect(dna.grammarPlan).toEqual([{ id: 'present-frequency', state: 'recycled' }]);
    expect(dna.vocabularyPlan).toEqual([{ id: 'v-arkama', status: 'current-module' }]);
  });
});
