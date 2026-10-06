import { describe, expect, it } from 'vitest';
import { validateWorksheetDoc } from '../../../services/firebase/worksheetDocs.js';
import roadmap from '../../curriculum/a2Roadmap.json';
import { generatorProfileForLesson } from '../profiles/index.js';
import { generateA2Module05 } from './a2Module05.js';

describe('A2 module 5 textbook production', () => {
  it('uses curated profiles for all five city and route lessons', () => {
    const module = roadmap.modules.find((item) => item.id === 'a2-module-05');
    const profiles = module.lessons.map((lesson) => generatorProfileForLesson(lesson.id, lesson));
    expect(profiles.every(Boolean)).toBe(true);
    expect(profiles[0].focuses.map((item) => item.id)).toContain('city-places');
    expect(profiles[1].focuses.map((item) => item.id)).toContain('directions');
    expect(profiles[2].focuses.map((item) => item.id)).toContain('route-imperative');
    expect(profiles[3].focuses.map((item) => item.id)).toContain('city-practical-info');
    expect(profiles[2].banks.listeningScripts.length).toBeGreaterThanOrEqual(2);
    expect(profiles[3].banks.readingDocuments.length).toBeGreaterThanOrEqual(2);
  });

  it('builds five complete Avasta-Harjuta-Kasuta bundles', () => {
    const result = generateA2Module05();
    expect(result.lessonIds).toEqual(['a2-021', 'a2-022', 'a2-023', 'a2-024', 'a2-025']);
    expect(result.bundles).toHaveLength(5);
    expect(result.bundles.flatMap((bundle) => bundle.sheets)).toHaveLength(15);
    result.bundles.flatMap((bundle) => bundle.sheets).forEach((sheet) => {
      expect(validateWorksheetDoc(sheet.worksheetDoc)).toBe(true);
      expect(sheet.worksheetDoc.blocks.length).toBeGreaterThanOrEqual(5);
      expect(sheet.worksheetDoc.meta.module).toBe('Linn, kohad ja tee');
    });
    expect(result.modulePlan.diversity.phaseFamilies.practice.length).toBeGreaterThanOrEqual(4);
    expect(result.modulePlan.diversity.phaseFamilies.transfer.length).toBeGreaterThanOrEqual(3);
    expect(result.diagnostics.filter((item) => item.severity === 'error')).toEqual([]);
    expect(result.ready).toBe(true);
  });

  it('puts real listening into imperative practice and functional reading into lesson 24', () => {
    const result = generateA2Module05();
    const imperative = result.bundles.find((bundle) => bundle.lessonId === 'a2-023');
    const reading = result.bundles.find((bundle) => bundle.lessonId === 'a2-024');
    const practiceBlocks = (bundle) => bundle.sheets.find((sheet) => sheet.phase === 'practice').worksheetDoc.blocks;

    expect(practiceBlocks(imperative).map((block) => block.type)).toContain('listening');
    const listening = practiceBlocks(imperative).find((block) => block.type === 'listening');
    expect(listening.data.transcript.length).toBeGreaterThan(100);
    expect(String(listening.data.sentences).split('\n').filter(Boolean).length).toBeGreaterThanOrEqual(5);

    expect(practiceBlocks(reading).map((block) => block.type)).toContain('reading');
    const readingBlock = practiceBlocks(reading).find((block) => block.type === 'reading');
    expect(readingBlock.data.passage.length).toBeGreaterThan(120);
    expect(String(readingBlock.data.questions).split('\n').filter(Boolean).length).toBeGreaterThanOrEqual(5);
    expect(readingBlock.data.questions).toMatch(/Kas tal on veel aega|Kui inimene ootab/);
  });

  it('introduces 16 current-module core items as 8 + 5 + 3 and recycles module 4', () => {
    const result = generateA2Module05();
    expect(result.plannedVocabulary).toHaveLength(16);
    expect(result.previousVocabulary).toHaveLength(16);
    expect(result.plannedVocabulary.every((entry) => entry.forms.length >= 3 && entry.translationRu)).toBe(true);

    const introduced = result.plannedVocabulary.reduce((acc, entry) => {
      acc[entry.activeFromLessonId] = (acc[entry.activeFromLessonId] || 0) + 1;
      return acc;
    }, {});
    expect(introduced).toEqual({ 'a2-021': 8, 'a2-022': 5, 'a2-023': 3 });
    expect(introduced['a2-024']).toBeUndefined();
    expect(introduced['a2-025']).toBeUndefined();

    const first = result.bundles.find((bundle) => bundle.lessonId === 'a2-021');
    const second = result.bundles.find((bundle) => bundle.lessonId === 'a2-022');
    const third = result.bundles.find((bundle) => bundle.lessonId === 'a2-023');
    expect(first.sheets[0].lessonDna.vocabularyPlan.filter((item) => item.status === 'previous-module')).toHaveLength(8);
    expect(second.sheets[0].lessonDna.vocabularyPlan.filter((item) => item.status === 'previous-module')).toHaveLength(5);
    expect(third.sheets[0].lessonDna.vocabularyPlan.filter((item) => item.status === 'previous-module')).toHaveLength(3);
  });

  it('returns current vocabulary in module 6 and keeps Kontroll 5 free of new core items', () => {
    const result = generateA2Module05();
    const returned = result.plannedVocabulary.reduce((acc, entry) => {
      const id = entry.recycleLessonIds.find((lessonId) => ['a2-026', 'a2-027', 'a2-028'].includes(lessonId));
      acc[id] = (acc[id] || 0) + 1;
      return acc;
    }, {});
    expect(returned).toEqual({ 'a2-026': 8, 'a2-027': 5, 'a2-028': 3 });

    const assessment = result.bundles.find((bundle) => bundle.lessonId === 'a2-025');
    expect(assessment.sheets.every((sheet) => sheet.lessonDna.vocabularyPlan.every((item) => item.status !== 'new'))).toBe(true);
  });
});
