import { describe, expect, it } from 'vitest';
import { validateWorksheetDoc } from '../../../services/firebase/worksheetDocs.js';
import roadmap from '../../curriculum/a2Roadmap.json';
import { generatorProfileForLesson } from '../profiles/index.js';
import { generateA2Module09 } from './a2Module09.js';

describe('A2 module 9 textbook production', () => {
  it('uses curated profiles for all five health lessons', () => {
    const module = roadmap.modules.find((item) => item.id === 'a2-module-09');
    const profiles = module.lessons.map((lesson) => generatorProfileForLesson(lesson.id, lesson));
    expect(profiles.every(Boolean)).toBe(true);
    expect(profiles[0].focuses.map((item) => item.id)).toContain('body-symptoms');
    expect(profiles[1].focuses.map((item) => item.id)).toContain('health-state-forms');
    expect(profiles[2].focuses.map((item) => item.id)).toContain('doctor-visit');
    expect(profiles[3].focuses.map((item) => item.id)).toContain('medicine-appointment-info');
    expect(profiles[1].banks.transformations.length).toBeGreaterThanOrEqual(3);
    expect(profiles[2].banks.listeningScripts.length).toBeGreaterThanOrEqual(1);
    expect(profiles[3].banks.readingDocuments.length).toBeGreaterThanOrEqual(2);
  });

  it('builds five complete Avasta-Harjuta-Kasuta bundles', () => {
    const result = generateA2Module09();
    expect(result.lessonIds).toEqual(['a2-041', 'a2-042', 'a2-043', 'a2-044', 'a2-045']);
    expect(result.bundles).toHaveLength(5);
    expect(result.bundles.flatMap((bundle) => bundle.sheets)).toHaveLength(15);
    result.bundles.flatMap((bundle) => bundle.sheets).forEach((sheet) => {
      expect(validateWorksheetDoc(sheet.worksheetDoc)).toBe(true);
      expect(sheet.worksheetDoc.blocks.length).toBeGreaterThanOrEqual(5);
      expect(sheet.worksheetDoc.meta.module).toBe('Tervis ja kehahooldus');
    });
    expect(result.modulePlan.diversity.phaseFamilies.practice.length).toBeGreaterThanOrEqual(4);
    expect(result.modulePlan.diversity.phaseFamilies.transfer.length).toBeGreaterThanOrEqual(3);
    expect(result.diagnostics.filter((item) => item.severity === 'error')).toEqual([]);
    expect(result.ready).toBe(true);
  });

  it('keeps health-state transformations and practical safe reading in Harjuta', () => {
    const result = generateA2Module09();
    const state = result.bundles.find((bundle) => bundle.lessonId === 'a2-042');
    const reading = result.bundles.find((bundle) => bundle.lessonId === 'a2-044');
    const practiceBlocks = (bundle) => bundle.sheets.find((sheet) => sheet.phase === 'practice').worksheetDoc.blocks;

    expect(practiceBlocks(state).map((block) => block.type)).toContain('transformation');

    expect(practiceBlocks(reading).map((block) => block.type)).toContain('reading');
    const readingBlock = practiceBlocks(reading).find((block) => block.type === 'reading');
    expect(readingBlock.data.passage.length).toBeGreaterThan(120);
    expect(String(readingBlock.data.questions).split('\n').filter(Boolean).length).toBeGreaterThanOrEqual(5);

    const sourceText = JSON.stringify(
      generatorProfileForLesson(
        'a2-044',
        roadmap.modules.find((item) => item.id === 'a2-module-09').lessons.find((lesson) => lesson.id === 'a2-044'),
      ).banks.readingDocuments,
    );
    expect(sourceText).toContain('EI OLE PÄRIS RAVIMIJUHIS');
    expect(sourceText).toContain('küsige apteekrilt või arstilt');
  });

  it('introduces 16 core items as 8 + 5 + 3 and recycles module 8', () => {
    const result = generateA2Module09();
    expect(result.plannedVocabulary).toHaveLength(16);
    expect(result.previousVocabulary).toHaveLength(16);
    expect(result.plannedVocabulary.every((entry) => entry.forms.length >= 3 && entry.translationRu)).toBe(true);

    const introduced = result.plannedVocabulary.reduce((acc, entry) => {
      acc[entry.activeFromLessonId] = (acc[entry.activeFromLessonId] || 0) + 1;
      return acc;
    }, {});
    expect(introduced).toEqual({ 'a2-041': 8, 'a2-042': 5, 'a2-043': 3 });
    expect(introduced['a2-044']).toBeUndefined();
    expect(introduced['a2-045']).toBeUndefined();

    const first = result.bundles.find((bundle) => bundle.lessonId === 'a2-041');
    const second = result.bundles.find((bundle) => bundle.lessonId === 'a2-042');
    const third = result.bundles.find((bundle) => bundle.lessonId === 'a2-043');
    expect(first.sheets[0].lessonDna.vocabularyPlan.filter((item) => item.status === 'previous-module')).toHaveLength(8);
    expect(second.sheets[0].lessonDna.vocabularyPlan.filter((item) => item.status === 'previous-module')).toHaveLength(5);
    expect(third.sheets[0].lessonDna.vocabularyPlan.filter((item) => item.status === 'previous-module')).toHaveLength(3);
  });

  it('returns current vocabulary in module 10 and keeps Kontroll 9 free of new items', () => {
    const result = generateA2Module09();
    const returned = result.plannedVocabulary.reduce((acc, entry) => {
      const id = entry.recycleLessonIds.find((lessonId) => ['a2-046', 'a2-047', 'a2-048'].includes(lessonId));
      acc[id] = (acc[id] || 0) + 1;
      return acc;
    }, {});
    expect(returned).toEqual({ 'a2-046': 8, 'a2-047': 5, 'a2-048': 3 });

    const assessment = result.bundles.find((bundle) => bundle.lessonId === 'a2-045');
    expect(assessment.sheets.every((sheet) => sheet.lessonDna.vocabularyPlan.every((item) => item.status !== 'new'))).toBe(true);
  });
});
