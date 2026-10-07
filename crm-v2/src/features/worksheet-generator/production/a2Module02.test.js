import { describe, expect, it } from 'vitest';
import { validateWorksheetDoc } from '../../../services/firebase/worksheetDocs.js';
import { generateA2Module02 } from './a2Module02.js';

describe('A2 module 2 textbook production', () => {
  it('builds five complete lesson bundles for family and people', () => {
    const result = generateA2Module02();
    expect(result.lessonIds).toEqual(['a2-006', 'a2-007', 'a2-008', 'a2-009', 'a2-010']);
    expect(result.bundles).toHaveLength(5);
    expect(result.bundles.flatMap((bundle) => bundle.sheets)).toHaveLength(15);
    expect(result.bundles.every((bundle) => bundle.sheets.map((sheet) => sheet.phase).join(',') === 'discover,practice,transfer')).toBe(true);
    result.bundles.flatMap((bundle) => bundle.sheets).forEach((sheet) => {
      expect(validateWorksheetDoc(sheet.worksheetDoc)).toBe(true);
      expect(sheet.worksheetDoc.blocks.length).toBeGreaterThanOrEqual(5);
      expect(sheet.worksheetDoc.meta.module).toBe('Pere, inimesed ja kirjeldamine');
    });
    expect(result.modulePlan.diversity.phaseFamilies.practice.length).toBeGreaterThanOrEqual(4);
    expect(result.modulePlan.diversity.phaseFamilies.transfer.length).toBeGreaterThanOrEqual(3);
    expect(result.diagnostics.filter((item) => item.severity === 'error')).toEqual([]);
    expect(result.ready).toBe(true);
  });

  it('introduces 16 new core items as 8 + 5 + 3 and returns them in module 3', () => {
    const result = generateA2Module02();
    expect(result.plannedVocabulary).toHaveLength(16);
    expect(result.plannedVocabulary.every((entry) => entry.forms.length >= 3 && entry.translationRu)).toBe(true);

    const introduced = result.plannedVocabulary.reduce((acc, entry) => {
      acc[entry.activeFromLessonId] = (acc[entry.activeFromLessonId] || 0) + 1;
      return acc;
    }, {});
    expect(introduced).toEqual({ 'a2-006': 8, 'a2-007': 5, 'a2-008': 3 });
    expect(introduced['a2-009']).toBeUndefined();
    expect(introduced['a2-010']).toBeUndefined();

    const returned = result.plannedVocabulary.reduce((acc, entry) => {
      const id = entry.recycleLessonIds.find((lessonId) => ['a2-011', 'a2-012', 'a2-013'].includes(lessonId));
      acc[id] = (acc[id] || 0) + 1;
      return acc;
    }, {});
    expect(returned).toEqual({ 'a2-011': 8, 'a2-012': 5, 'a2-013': 3 });
    expect(result.lexicalCoverage.ready).toBe(true);
  });

  it('recycles module 1 vocabulary into the first three module 2 lessons', () => {
    const result = generateA2Module02();
    expect(result.previousVocabulary).toHaveLength(16);
    const returns = result.previousVocabulary.reduce((acc, entry) => {
      const id = entry.recycleLessonIds.find((lessonId) => ['a2-006', 'a2-007', 'a2-008'].includes(lessonId));
      acc[id] = (acc[id] || 0) + 1;
      return acc;
    }, {});
    expect(returns).toEqual({ 'a2-006': 8, 'a2-007': 5, 'a2-008': 3 });

    const first = result.bundles.find((bundle) => bundle.lessonId === 'a2-006');
    const second = result.bundles.find((bundle) => bundle.lessonId === 'a2-007');
    const third = result.bundles.find((bundle) => bundle.lessonId === 'a2-008');
    expect(first.sheets[0].lessonDna.vocabularyPlan.filter((item) => item.status === 'previous-module')).toHaveLength(8);
    expect(second.sheets[0].lessonDna.vocabularyPlan.filter((item) => item.status === 'previous-module')).toHaveLength(5);
    expect(third.sheets[0].lessonDna.vocabularyPlan.filter((item) => item.status === 'previous-module')).toHaveLength(3);
  });

  it('keeps the module assessment free of new core vocabulary', () => {
    const result = generateA2Module02();
    const assessment = result.bundles.find((bundle) => bundle.lessonId === 'a2-010');
    expect(assessment.sheets.every((sheet) => sheet.lessonDna.vocabularyPlan.every((item) => item.status !== 'new'))).toBe(true);
  });
});
