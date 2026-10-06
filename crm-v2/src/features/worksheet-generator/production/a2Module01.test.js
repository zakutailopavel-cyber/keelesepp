import { describe, expect, it } from 'vitest';
import { validateWorksheetDoc } from '../../../services/firebase/worksheetDocs.js';
import { generateA2Module01 } from './a2Module01.js';

function visibleAuthorStrings(value, key = '') {
  if (typeof value === 'string') return key === 'options' ? [] : [value];
  if (Array.isArray(value)) return value.flatMap((item) => visibleAuthorStrings(item, key));
  if (!value || typeof value !== 'object') return [];
  return Object.entries(value).flatMap(([childKey, child]) => visibleAuthorStrings(child, childKey));
}

describe('A2 module 1 textbook production', () => {
  it('builds five complete Avasta-Harjuta-Kasuta lesson bundles', () => {
    const result = generateA2Module01();
    expect(result.lessonIds).toEqual(['a2-001', 'a2-002', 'a2-003', 'a2-004', 'a2-005']);
    expect(result.bundles).toHaveLength(5);
    expect(result.bundles.flatMap((bundle) => bundle.sheets)).toHaveLength(15);
    expect(result.bundles.every((bundle) => bundle.sheets.map((sheet) => sheet.phase).join(',') === 'discover,practice,transfer')).toBe(true);
    result.bundles.flatMap((bundle) => bundle.sheets).forEach((sheet) => {
      expect(validateWorksheetDoc(sheet.worksheetDoc)).toBe(true);
      expect(sheet.worksheetDoc.blocks.length).toBeGreaterThanOrEqual(5);
      expect(sheet.worksheetDoc.meta.module).toBe('A2 lähtepunkt ja eneseinfo');
    });
    expect(result.modulePlan.diversity.phaseFamilies.practice.length).toBeGreaterThanOrEqual(4);
    expect(result.modulePlan.diversity.phaseFamilies.transfer.length).toBeGreaterThanOrEqual(3);
    expect(result.diagnostics.filter((item) => item.severity === 'error')).toEqual([]);
    expect(result.ready).toBe(true);
  });

  it('uses a 16-item core lexicon with three forms, Russian translation and spaced return', () => {
    const result = generateA2Module01();
    expect(result.plannedVocabulary).toHaveLength(16);
    expect(result.plannedVocabulary.every((entry) => entry.forms.length >= 3 && entry.translationRu)).toBe(true);

    const introduced = result.plannedVocabulary.reduce((acc, entry) => {
      acc[entry.activeFromLessonId] = (acc[entry.activeFromLessonId] || 0) + 1;
      return acc;
    }, {});
    expect(introduced).toEqual({ 'a2-001': 8, 'a2-002': 5, 'a2-003': 3 });
    expect(introduced['a2-004']).toBeUndefined();
    expect(introduced['a2-005']).toBeUndefined();

    expect(result.lexicalCoverage.ready).toBe(true);
    expect(result.lexicalCoverage.insufficient).toEqual([]);
    expect(result.lexicalCoverage.noNextReturn).toEqual([]);
    const returned = result.plannedVocabulary.reduce((acc, entry) => {
      const id = entry.recycleLessonIds.find((lessonId) => ['a2-006', 'a2-007', 'a2-008'].includes(lessonId));
      acc[id] = (acc[id] || 0) + 1;
      return acc;
    }, {});
    expect(returned).toEqual({ 'a2-006': 8, 'a2-007': 5, 'a2-008': 3 });
  });

  it('carries grammar and vocabulary progression into every lesson DNA', () => {
    const result = generateA2Module01();
    result.bundles.forEach((bundle) => {
      bundle.sheets.forEach((sheet) => {
        expect(sheet.lessonDna.grammarPlan.length).toBeGreaterThanOrEqual(3);
        expect(sheet.lessonDna.vocabularyPlan.length).toBeGreaterThan(0);
      });
    });
    const assessment = result.bundles.find((bundle) => bundle.lessonId === 'a2-005');
    expect(assessment.sheets.every((sheet) => sheet.lessonDna.vocabularyPlan.every((item) => item.status !== 'new'))).toBe(true);
  });

  it('does not leak raw markdown emphasis into learner-facing prose', () => {
    const result = generateA2Module01();
    const docs = result.bundles.flatMap((bundle) => bundle.sheets.map((sheet) => sheet.worksheetDoc));
    const visible = docs.flatMap((doc) => visibleAuthorStrings(doc)).join('\n');
    expect(visible).not.toMatch(/\*[^*\n]+\*/);
  });
});
