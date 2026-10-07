import { describe, expect, it } from 'vitest';
import { validateWorksheetDoc } from '../../../services/firebase/worksheetDocs.js';
import roadmap from '../../curriculum/a2Roadmap.json';
import { generatorProfileForLesson } from '../profiles/index.js';
import { generateA2Module06 } from './a2Module06.js';

describe('A2 module 6 textbook production', () => {
  it('uses curated profiles for all five food and cafe lessons', () => {
    const module = roadmap.modules.find((item) => item.id === 'a2-module-06');
    const profiles = module.lessons.map((lesson) => generatorProfileForLesson(lesson.id, lesson));
    expect(profiles.every(Boolean)).toBe(true);
    expect(profiles[0].focuses.map((item) => item.id)).toContain('food-drink');
    expect(profiles[1].focuses.map((item) => item.id)).toContain('quantity-partitive');
    expect(profiles[2].focuses.map((item) => item.id)).toContain('cafe-order');
    expect(profiles[3].focuses.map((item) => item.id)).toContain('order-bill');
    expect(profiles[3].banks.listeningScripts.length).toBeGreaterThanOrEqual(2);
  });

  it('builds five complete Avasta-Harjuta-Kasuta bundles', () => {
    const result = generateA2Module06();
    expect(result.lessonIds).toEqual(['a2-026', 'a2-027', 'a2-028', 'a2-029', 'a2-030']);
    expect(result.bundles).toHaveLength(5);
    expect(result.bundles.flatMap((bundle) => bundle.sheets)).toHaveLength(15);
    result.bundles.flatMap((bundle) => bundle.sheets).forEach((sheet) => {
      expect(validateWorksheetDoc(sheet.worksheetDoc)).toBe(true);
      expect(sheet.worksheetDoc.blocks.length).toBeGreaterThanOrEqual(5);
      expect(sheet.worksheetDoc.meta.module).toBe('Söök, jook ja kohvik');
    });
    expect(result.modulePlan.diversity.phaseFamilies.practice.length).toBeGreaterThanOrEqual(4);
    expect(result.modulePlan.diversity.phaseFamilies.transfer.length).toBeGreaterThanOrEqual(3);
    expect(result.diagnostics.filter((item) => item.severity === 'error')).toEqual([]);
    expect(result.ready).toBe(true);
  });

  it('keeps quantity transformation and real order listening in Harjuta', () => {
    const result = generateA2Module06();
    const quantity = result.bundles.find((bundle) => bundle.lessonId === 'a2-027');
    const listening = result.bundles.find((bundle) => bundle.lessonId === 'a2-029');
    const practiceBlocks = (bundle) => bundle.sheets.find((sheet) => sheet.phase === 'practice').worksheetDoc.blocks;

    expect(practiceBlocks(quantity).map((block) => block.type)).toContain('transformation');
    expect(practiceBlocks(listening).map((block) => block.type)).toContain('listening');
    const listeningBlock = practiceBlocks(listening).find((block) => block.type === 'listening');
    expect(listeningBlock.data.transcript.length).toBeGreaterThan(100);
    expect(String(listeningBlock.data.sentences).split('\n').filter(Boolean).length).toBeGreaterThanOrEqual(5);
  });

  it('introduces 16 core items as 8 + 5 + 3 and recycles module 5', () => {
    const result = generateA2Module06();
    expect(result.plannedVocabulary).toHaveLength(16);
    expect(result.previousVocabulary).toHaveLength(16);
    expect(result.plannedVocabulary.every((entry) => entry.forms.length >= 3 && entry.translationRu)).toBe(true);

    const introduced = result.plannedVocabulary.reduce((acc, entry) => {
      acc[entry.activeFromLessonId] = (acc[entry.activeFromLessonId] || 0) + 1;
      return acc;
    }, {});
    expect(introduced).toEqual({ 'a2-026': 8, 'a2-027': 5, 'a2-028': 3 });
    expect(introduced['a2-029']).toBeUndefined();
    expect(introduced['a2-030']).toBeUndefined();

    const first = result.bundles.find((bundle) => bundle.lessonId === 'a2-026');
    const second = result.bundles.find((bundle) => bundle.lessonId === 'a2-027');
    const third = result.bundles.find((bundle) => bundle.lessonId === 'a2-028');
    expect(first.sheets[0].lessonDna.vocabularyPlan.filter((item) => item.status === 'previous-module')).toHaveLength(8);
    expect(second.sheets[0].lessonDna.vocabularyPlan.filter((item) => item.status === 'previous-module')).toHaveLength(5);
    expect(third.sheets[0].lessonDna.vocabularyPlan.filter((item) => item.status === 'previous-module')).toHaveLength(3);
  });

  it('returns current vocabulary in module 7 and keeps Kontroll 6 free of new items', () => {
    const result = generateA2Module06();
    const returned = result.plannedVocabulary.reduce((acc, entry) => {
      const id = entry.recycleLessonIds.find((lessonId) => ['a2-031', 'a2-032', 'a2-033'].includes(lessonId));
      acc[id] = (acc[id] || 0) + 1;
      return acc;
    }, {});
    expect(returned).toEqual({ 'a2-031': 8, 'a2-032': 5, 'a2-033': 3 });

    const assessment = result.bundles.find((bundle) => bundle.lessonId === 'a2-030');
    expect(assessment.sheets.every((sheet) => sheet.lessonDna.vocabularyPlan.every((item) => item.status !== 'new'))).toBe(true);
  });
});
