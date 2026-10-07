import { describe, expect, it } from 'vitest';
import { validateWorksheetDoc } from '../../../services/firebase/worksheetDocs.js';
import roadmap from '../../curriculum/a2Roadmap.json';
import { generatorProfileForLesson } from '../profiles/index.js';
import { generateA2Module07 } from './a2Module07.js';

describe('A2 module 7 textbook production', () => {
  it('uses curated profiles for all five shopping lessons', () => {
    const module = roadmap.modules.find((item) => item.id === 'a2-module-07');
    const profiles = module.lessons.map((lesson) => generatorProfileForLesson(lesson.id, lesson));
    expect(profiles.every(Boolean)).toBe(true);
    expect(profiles[0].focuses.map((item) => item.id)).toContain('shopping-goods');
    expect(profiles[1].focuses.map((item) => item.id)).toContain('shopping-prices');
    expect(profiles[2].focuses.map((item) => item.id)).toContain('fitting-compare');
    expect(profiles[3].focuses.map((item) => item.id)).toContain('receipt-return');
    expect(profiles[1].banks.listeningScripts.length).toBeGreaterThanOrEqual(2);
    expect(profiles[3].banks.readingDocuments.length).toBeGreaterThanOrEqual(2);
  });

  it('builds five complete Avasta-Harjuta-Kasuta bundles', () => {
    const result = generateA2Module07();
    expect(result.lessonIds).toEqual(['a2-031', 'a2-032', 'a2-033', 'a2-034', 'a2-035']);
    expect(result.bundles).toHaveLength(5);
    expect(result.bundles.flatMap((bundle) => bundle.sheets)).toHaveLength(15);
    result.bundles.flatMap((bundle) => bundle.sheets).forEach((sheet) => {
      expect(validateWorksheetDoc(sheet.worksheetDoc)).toBe(true);
      expect(sheet.worksheetDoc.blocks.length).toBeGreaterThanOrEqual(5);
      expect(sheet.worksheetDoc.meta.module).toBe('Pood, raha ja ostud');
    });
    expect(result.modulePlan.diversity.phaseFamilies.practice.length).toBeGreaterThanOrEqual(4);
    expect(result.modulePlan.diversity.phaseFamilies.transfer.length).toBeGreaterThanOrEqual(3);
    expect(result.diagnostics.filter((item) => item.severity === 'error')).toEqual([]);
    expect(result.ready).toBe(true);
  });

  it('puts number listening into lesson 32 and functional reading into lesson 34', () => {
    const result = generateA2Module07();
    const prices = result.bundles.find((bundle) => bundle.lessonId === 'a2-032');
    const reading = result.bundles.find((bundle) => bundle.lessonId === 'a2-034');
    const practiceBlocks = (bundle) => bundle.sheets.find((sheet) => sheet.phase === 'practice').worksheetDoc.blocks;

    expect(practiceBlocks(prices).map((block) => block.type)).toContain('listening');
    const listeningBlock = practiceBlocks(prices).find((block) => block.type === 'listening');
    expect(listeningBlock.data.transcript.length).toBeGreaterThan(100);
    expect(String(listeningBlock.data.sentences).split('\n').filter(Boolean).length).toBeGreaterThanOrEqual(5);

    expect(practiceBlocks(reading).map((block) => block.type)).toContain('reading');
    const readingBlock = practiceBlocks(reading).find((block) => block.type === 'reading');
    expect(readingBlock.data.passage.length).toBeGreaterThan(120);
    expect(String(readingBlock.data.questions).split('\n').filter(Boolean).length).toBeGreaterThanOrEqual(5);
    expect(readingBlock.data.questions).toMatch(/Kas jope eest maksti täishinda|Kas 10 päeva tagasi ostetud/);
  });

  it('introduces 16 core items as 8 + 5 + 3 and recycles module 6', () => {
    const result = generateA2Module07();
    expect(result.plannedVocabulary).toHaveLength(16);
    expect(result.previousVocabulary).toHaveLength(16);
    expect(result.plannedVocabulary.every((entry) => entry.forms.length >= 3 && entry.translationRu)).toBe(true);

    const introduced = result.plannedVocabulary.reduce((acc, entry) => {
      acc[entry.activeFromLessonId] = (acc[entry.activeFromLessonId] || 0) + 1;
      return acc;
    }, {});
    expect(introduced).toEqual({ 'a2-031': 8, 'a2-032': 5, 'a2-033': 3 });
    expect(introduced['a2-034']).toBeUndefined();
    expect(introduced['a2-035']).toBeUndefined();

    const first = result.bundles.find((bundle) => bundle.lessonId === 'a2-031');
    const second = result.bundles.find((bundle) => bundle.lessonId === 'a2-032');
    const third = result.bundles.find((bundle) => bundle.lessonId === 'a2-033');
    expect(first.sheets[0].lessonDna.vocabularyPlan.filter((item) => item.status === 'previous-module')).toHaveLength(8);
    expect(second.sheets[0].lessonDna.vocabularyPlan.filter((item) => item.status === 'previous-module')).toHaveLength(5);
    expect(third.sheets[0].lessonDna.vocabularyPlan.filter((item) => item.status === 'previous-module')).toHaveLength(3);
  });

  it('returns current vocabulary in module 8 and keeps Kontroll 7 free of new items', () => {
    const result = generateA2Module07();
    const returned = result.plannedVocabulary.reduce((acc, entry) => {
      const id = entry.recycleLessonIds.find((lessonId) => ['a2-036', 'a2-037', 'a2-038'].includes(lessonId));
      acc[id] = (acc[id] || 0) + 1;
      return acc;
    }, {});
    expect(returned).toEqual({ 'a2-036': 8, 'a2-037': 5, 'a2-038': 3 });

    const assessment = result.bundles.find((bundle) => bundle.lessonId === 'a2-035');
    expect(assessment.sheets.every((sheet) => sheet.lessonDna.vocabularyPlan.every((item) => item.status !== 'new'))).toBe(true);
  });
});
