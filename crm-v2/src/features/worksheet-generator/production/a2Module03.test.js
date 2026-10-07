import { describe, expect, it } from 'vitest';
import { validateWorksheetDoc } from '../../../services/firebase/worksheetDocs.js';
import { generateA2Module03 } from './a2Module03.js';

describe('A2 module 3 textbook production', () => {
  it('builds five complete lesson bundles for day, clock and habits', () => {
    const result = generateA2Module03();
    expect(result.lessonIds).toEqual(['a2-011', 'a2-012', 'a2-013', 'a2-014', 'a2-015']);
    expect(result.bundles).toHaveLength(5);
    expect(result.bundles.flatMap((bundle) => bundle.sheets)).toHaveLength(15);
    expect(result.bundles.every((bundle) => bundle.sheets.map((sheet) => sheet.phase).join(',') === 'discover,practice,transfer')).toBe(true);
    result.bundles.flatMap((bundle) => bundle.sheets).forEach((sheet) => {
      expect(validateWorksheetDoc(sheet.worksheetDoc)).toBe(true);
      expect(sheet.worksheetDoc.blocks.length).toBeGreaterThanOrEqual(5);
      expect(sheet.worksheetDoc.meta.module).toBe('Päev, kell ja harjumused');
    });
    expect(result.modulePlan.diversity.phaseFamilies.practice.length).toBeGreaterThanOrEqual(4);
    expect(result.modulePlan.diversity.phaseFamilies.transfer.length).toBeGreaterThanOrEqual(3);
    expect(result.diagnostics.filter((item) => item.severity === 'error')).toEqual([]);
    expect(result.ready).toBe(true);
  });

  it('uses 16 core items with 8 + 5 + 3 introduction and module 4 return', () => {
    const result = generateA2Module03();
    expect(result.plannedVocabulary).toHaveLength(16);
    expect(result.plannedVocabulary.every((entry) => entry.forms.length >= 3 && entry.translationRu)).toBe(true);
    const introduced = result.plannedVocabulary.reduce((acc, entry) => {
      acc[entry.activeFromLessonId] = (acc[entry.activeFromLessonId] || 0) + 1;
      return acc;
    }, {});
    expect(introduced).toEqual({ 'a2-011': 8, 'a2-012': 5, 'a2-013': 3 });
    expect(introduced['a2-014']).toBeUndefined();
    expect(introduced['a2-015']).toBeUndefined();

    const returned = result.plannedVocabulary.reduce((acc, entry) => {
      const id = entry.recycleLessonIds.find((lessonId) => ['a2-016', 'a2-017', 'a2-018'].includes(lessonId));
      acc[id] = (acc[id] || 0) + 1;
      return acc;
    }, {});
    expect(returned).toEqual({ 'a2-016': 8, 'a2-017': 5, 'a2-018': 3 });
  });

  it('recycles module 2 vocabulary across lessons 11 to 13', () => {
    const result = generateA2Module03();
    expect(result.previousVocabulary).toHaveLength(16);
    const first = result.bundles.find((bundle) => bundle.lessonId === 'a2-011');
    const second = result.bundles.find((bundle) => bundle.lessonId === 'a2-012');
    const third = result.bundles.find((bundle) => bundle.lessonId === 'a2-013');
    expect(first.sheets[0].lessonDna.vocabularyPlan.filter((item) => item.status === 'previous-module')).toHaveLength(8);
    expect(second.sheets[0].lessonDna.vocabularyPlan.filter((item) => item.status === 'previous-module')).toHaveLength(5);
    expect(third.sheets[0].lessonDna.vocabularyPlan.filter((item) => item.status === 'previous-module')).toHaveLength(3);
  });

  it('keeps Kontroll 3 free of new core vocabulary', () => {
    const result = generateA2Module03();
    const assessment = result.bundles.find((bundle) => bundle.lessonId === 'a2-015');
    expect(assessment.sheets.every((sheet) => sheet.lessonDna.vocabularyPlan.every((item) => item.status !== 'new'))).toBe(true);
  });
});
