import { describe, expect, it } from 'vitest';
import { validateWorksheetDoc } from '../../../services/firebase/worksheetDocs.js';
import { generatorProfileForLesson } from '../profiles/index.js';
import roadmap from '../../curriculum/a2Roadmap.json';
import { generateA2Module04 } from './a2Module04.js';

describe('A2 module 4 textbook production', () => {
  it('uses curated thematic profiles for all five home and neighbourhood lessons', () => {
    const module = roadmap.modules.find((item) => item.id === 'a2-module-04');
    const profiles = module.lessons.map((lesson) => generatorProfileForLesson(lesson.id, lesson));
    expect(profiles.every(Boolean)).toBe(true);
    expect(profiles[0].focuses.map((item) => item.id)).toContain('home-rooms');
    expect(profiles[1].focuses.map((item) => item.id)).toContain('inner-local-cases');
    expect(profiles[2].focuses.map((item) => item.id)).toContain('outer-local-cases');
    expect(profiles[3].focuses.map((item) => item.id)).toContain('neighbourhood');
    expect(profiles[3].banks.listeningScripts.length).toBeGreaterThanOrEqual(2);
    expect(profiles[1].banks.transformations.length).toBeGreaterThanOrEqual(2);
    expect(profiles[2].banks.transformations.length).toBeGreaterThanOrEqual(2);
  });

  it('builds five complete Avasta-Harjuta-Kasuta bundles', () => {
    const result = generateA2Module04();
    expect(result.lessonIds).toEqual(['a2-016', 'a2-017', 'a2-018', 'a2-019', 'a2-020']);
    expect(result.bundles).toHaveLength(5);
    expect(result.bundles.flatMap((bundle) => bundle.sheets)).toHaveLength(15);
    result.bundles.flatMap((bundle) => bundle.sheets).forEach((sheet) => {
      expect(validateWorksheetDoc(sheet.worksheetDoc)).toBe(true);
      expect(sheet.worksheetDoc.blocks.length).toBeGreaterThanOrEqual(5);
      expect(sheet.worksheetDoc.meta.module).toBe('Kodu ja ümbrus');
    });
    expect(result.modulePlan.diversity.phaseFamilies.practice.length).toBeGreaterThanOrEqual(4);
    expect(result.modulePlan.diversity.phaseFamilies.transfer.length).toBeGreaterThanOrEqual(3);
    expect(result.diagnostics.filter((item) => item.severity === 'error')).toEqual([]);
    expect(result.ready).toBe(true);
  });

  it('uses transformation practice for local cases and listening in the listening lesson', () => {
    const result = generateA2Module04();
    const inner = result.bundles.find((bundle) => bundle.lessonId === 'a2-017');
    const outer = result.bundles.find((bundle) => bundle.lessonId === 'a2-018');
    const listening = result.bundles.find((bundle) => bundle.lessonId === 'a2-019');
    const practiceTypes = (bundle) => bundle.sheets.find((sheet) => sheet.phase === 'practice').worksheetDoc.blocks.map((block) => block.type);
    expect([...practiceTypes(inner), ...practiceTypes(outer)]).toContain('transformation');
    expect(practiceTypes(listening)).toContain('listening');
    const listeningBlock = listening.sheets.find((sheet) => sheet.phase === 'practice').worksheetDoc.blocks.find((block) => block.type === 'listening');
    expect(listeningBlock.data.transcript.length).toBeGreaterThan(100);
    expect(String(listeningBlock.data.sentences).split('\n').filter(Boolean).length).toBeGreaterThanOrEqual(5);
  });

  it('recycles module 3 vocabulary and introduces current core vocabulary as 8 + 5 + 3', () => {
    const result = generateA2Module04();
    expect(result.previousVocabulary).toHaveLength(16);
    expect(result.plannedVocabulary).toHaveLength(16);
    const introduced = result.plannedVocabulary.reduce((acc, entry) => {
      acc[entry.activeFromLessonId] = (acc[entry.activeFromLessonId] || 0) + 1;
      return acc;
    }, {});
    expect(introduced).toEqual({ 'a2-016': 8, 'a2-017': 5, 'a2-018': 3 });

    const first = result.bundles.find((bundle) => bundle.lessonId === 'a2-016');
    const second = result.bundles.find((bundle) => bundle.lessonId === 'a2-017');
    const third = result.bundles.find((bundle) => bundle.lessonId === 'a2-018');
    expect(first.sheets[0].lessonDna.vocabularyPlan.filter((item) => item.status === 'previous-module')).toHaveLength(8);
    expect(second.sheets[0].lessonDna.vocabularyPlan.filter((item) => item.status === 'previous-module')).toHaveLength(5);
    expect(third.sheets[0].lessonDna.vocabularyPlan.filter((item) => item.status === 'previous-module')).toHaveLength(3);
  });

  it('keeps Kontroll 4 free of new core vocabulary', () => {
    const result = generateA2Module04();
    const assessment = result.bundles.find((bundle) => bundle.lessonId === 'a2-020');
    expect(assessment.sheets.every((sheet) => sheet.lessonDna.vocabularyPlan.every((item) => item.status !== 'new'))).toBe(true);
  });
});
