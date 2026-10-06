import { describe, expect, it } from 'vitest';
import {
  LEXICAL_ENCOUNTER_CONTRACT,
  TEXTBOOK_ACTIVITY_FAMILIES,
  TEXTBOOK_LESSON_COMPONENTS,
  TEXTBOOK_LEVEL_CONTRACT,
  TEXTBOOK_LEVELS,
  TEXTBOOK_MODULE_COMPONENTS,
  TEXTBOOK_PHASE_CONTRACT,
  VOCABULARY_ENTRY_FIELDS,
  textbookLessonCount,
  textbookLevel,
  validateTextbookLevelContract,
} from './textbookContract.js';

describe('A2-C1 textbook contract', () => {
  it('covers A2 through C1 with current curriculum manifests', () => {
    expect(TEXTBOOK_LEVELS).toEqual(['A2', 'B1', 'B2', 'C1']);
    expect(TEXTBOOK_LEVEL_CONTRACT.A2.manifest).toBe('/data/keelesepp-a2-roadmap.json');
    expect(TEXTBOOK_LEVEL_CONTRACT.B1.manifest).toBe('/data/keelesepp-a2-b1-roadmap.json');
    expect(TEXTBOOK_LEVEL_CONTRACT.B2.manifest).toBe('/data/keelesepp-b1-b2-roadmap.json');
    expect(TEXTBOOK_LEVEL_CONTRACT.C1.manifest).toBe('/data/keelesepp-c1-curriculum.json');
  });

  it('uses the existing 380 lesson path', () => {
    expect(textbookLessonCount()).toBe(380);
  });

  it.each(TEXTBOOK_LEVELS)('%s contract is structurally valid', (level) => {
    expect(validateTextbookLevelContract(level)).toEqual([]);
    expect(textbookLevel(level)).toBe(TEXTBOOK_LEVEL_CONTRACT[level]);
  });

  it('makes all three phases part of a complete lesson', () => {
    expect(Object.keys(TEXTBOOK_PHASE_CONTRACT)).toEqual(['discover', 'practice', 'transfer']);
    expect(TEXTBOOK_LESSON_COMPONENTS).toEqual(expect.arrayContaining(['discover', 'practice', 'transfer', 'teacher-notes', 'answer-key']));
  });

  it('requires textbook-level module structure', () => {
    expect(TEXTBOOK_MODULE_COMPONENTS).toEqual(expect.arrayContaining(['module-opener', 'lesson-bundles', 'module-revision', 'module-assessment', 'module-project']));
  });

  it('defines lexical recycling metadata', () => {
    expect(LEXICAL_ENCOUNTER_CONTRACT.minimumEncounters).toBeGreaterThanOrEqual(5);
    expect(VOCABULARY_ENTRY_FIELDS).toEqual(expect.arrayContaining(['lemma', 'forms', 'translationRu', 'collocations', 'government', 'recycleLessonIds']));
  });

  it('reserves diverse activity families', () => {
    expect(TEXTBOOK_ACTIVITY_FAMILIES.length).toBeGreaterThanOrEqual(20);
    expect(TEXTBOOK_ACTIVITY_FAMILIES).toEqual(expect.arrayContaining(['information-gap', 'problem-solving', 'mediation', 'argumentation', 'synthesis']));
  });
});
