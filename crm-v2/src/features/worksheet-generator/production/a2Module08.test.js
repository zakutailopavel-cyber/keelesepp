import { describe, expect, it } from 'vitest';
import { validateWorksheetDoc } from '../../../services/firebase/worksheetDocs.js';
import roadmap from '../../curriculum/a2Roadmap.json';
import { generatorProfileForLesson } from '../profiles/index.js';
import { generateA2Module08 } from './a2Module08.js';

describe('A2 module 8 textbook production', () => {
  it('uses curated profiles for all five service lessons', () => {
    const module = roadmap.modules.find((item) => item.id === 'a2-module-08');
    const profiles = module.lessons.map((lesson) => generatorProfileForLesson(lesson.id, lesson));
    expect(profiles.every(Boolean)).toBe(true);
    expect(profiles[0].focuses.map((item) => item.id)).toContain('appointment-booking');
    expect(profiles[1].focuses.map((item) => item.id)).toContain('service-modals');
    expect(profiles[2].focuses.map((item) => item.id)).toContain('forms-instructions');
    expect(profiles[3].focuses.map((item) => item.id)).toContain('phone-service');
    expect(profiles[2].banks.readingDocuments.length).toBeGreaterThanOrEqual(2);
    expect(profiles[3].banks.listeningScripts.length).toBeGreaterThanOrEqual(2);
  });

  it('builds five complete Avasta-Harjuta-Kasuta bundles', () => {
    const result = generateA2Module08();
    expect(result.lessonIds).toEqual(['a2-036', 'a2-037', 'a2-038', 'a2-039', 'a2-040']);
    expect(result.bundles).toHaveLength(5);
    expect(result.bundles.flatMap((bundle) => bundle.sheets)).toHaveLength(15);
    result.bundles.flatMap((bundle) => bundle.sheets).forEach((sheet) => {
      expect(validateWorksheetDoc(sheet.worksheetDoc)).toBe(true);
      expect(sheet.worksheetDoc.blocks.length).toBeGreaterThanOrEqual(5);
      expect(sheet.worksheetDoc.meta.module).toBe('Teenused ja asjaajamine');
    });
    expect(result.modulePlan.diversity.phaseFamilies.practice.length).toBeGreaterThanOrEqual(4);
    expect(result.modulePlan.diversity.phaseFamilies.transfer.length).toBeGreaterThanOrEqual(3);
    expect(result.diagnostics.filter((item) => item.severity === 'error')).toEqual([]);
    expect(result.ready).toBe(true);
  });

  it('keeps modal transformations, functional form reading and service listening in Harjuta', () => {
    const result = generateA2Module08();
    const modals = result.bundles.find((bundle) => bundle.lessonId === 'a2-037');
    const reading = result.bundles.find((bundle) => bundle.lessonId === 'a2-038');
    const listening = result.bundles.find((bundle) => bundle.lessonId === 'a2-039');
    const practiceBlocks = (bundle) => bundle.sheets.find((sheet) => sheet.phase === 'practice').worksheetDoc.blocks;

    expect(practiceBlocks(modals).map((block) => block.type)).toContain('transformation');

    expect(practiceBlocks(reading).map((block) => block.type)).toContain('reading');
    const readingBlock = practiceBlocks(reading).find((block) => block.type === 'reading');
    expect(readingBlock.data.passage.length).toBeGreaterThan(120);
    expect(String(readingBlock.data.questions).split('\n').filter(Boolean).length).toBeGreaterThanOrEqual(5);

    expect(practiceBlocks(listening).map((block) => block.type)).toContain('listening');
    const listeningBlock = practiceBlocks(listening).find((block) => block.type === 'listening');
    expect(listeningBlock.data.transcript.length).toBeGreaterThan(100);
    expect(String(listeningBlock.data.sentences).split('\n').filter(Boolean).length).toBeGreaterThanOrEqual(5);
  });

  it('introduces 16 core items as 8 + 5 + 3 and recycles module 7', () => {
    const result = generateA2Module08();
    expect(result.plannedVocabulary).toHaveLength(16);
    expect(result.previousVocabulary).toHaveLength(16);
    expect(result.plannedVocabulary.every((entry) => entry.forms.length >= 3 && entry.translationRu)).toBe(true);

    const introduced = result.plannedVocabulary.reduce((acc, entry) => {
      acc[entry.activeFromLessonId] = (acc[entry.activeFromLessonId] || 0) + 1;
      return acc;
    }, {});
    expect(introduced).toEqual({ 'a2-036': 8, 'a2-037': 5, 'a2-038': 3 });
    expect(introduced['a2-039']).toBeUndefined();
    expect(introduced['a2-040']).toBeUndefined();

    const first = result.bundles.find((bundle) => bundle.lessonId === 'a2-036');
    const second = result.bundles.find((bundle) => bundle.lessonId === 'a2-037');
    const third = result.bundles.find((bundle) => bundle.lessonId === 'a2-038');
    expect(first.sheets[0].lessonDna.vocabularyPlan.filter((item) => item.status === 'previous-module')).toHaveLength(8);
    expect(second.sheets[0].lessonDna.vocabularyPlan.filter((item) => item.status === 'previous-module')).toHaveLength(5);
    expect(third.sheets[0].lessonDna.vocabularyPlan.filter((item) => item.status === 'previous-module')).toHaveLength(3);
  });

  it('returns current vocabulary in module 9 and keeps Kontroll 8 free of new items', () => {
    const result = generateA2Module08();
    const returned = result.plannedVocabulary.reduce((acc, entry) => {
      const id = entry.recycleLessonIds.find((lessonId) => ['a2-041', 'a2-042', 'a2-043'].includes(lessonId));
      acc[id] = (acc[id] || 0) + 1;
      return acc;
    }, {});
    expect(returned).toEqual({ 'a2-041': 8, 'a2-042': 5, 'a2-043': 3 });

    const assessment = result.bundles.find((bundle) => bundle.lessonId === 'a2-040');
    expect(assessment.sheets.every((sheet) => sheet.lessonDna.vocabularyPlan.every((item) => item.status !== 'new'))).toBe(true);
  });
});
