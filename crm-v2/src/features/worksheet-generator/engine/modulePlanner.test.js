import { describe, expect, it } from 'vitest';
import { lexicalCoverageReport, moduleDiversityReport, planLexicalRecycling, scheduledVocabularyForLesson } from './modulePlanner.js';

const lesson = (discover, practice, transfer) => ({ phases: { discover, practice, transfer } });

describe('module diversity planner', () => {
  it('accepts a five-lesson module with varied practice and transfer families', () => {
    const plans = [
      lesson(['discover-vocabulary-match','discover-focus-categorize'], ['practice-gap-fill','practice-error-repair'], ['transfer-speaking','transfer-planning']),
      lesson(['discover-context-truefalse','discover-guided-dialogue'], ['practice-sentence-transformation','practice-translation'], ['transfer-rolecards','transfer-problem-solving']),
      lesson(['discover-focus-choice','discover-guided-dialogue'], ['practice-word-order','practice-dictation'], ['transfer-writing','transfer-selfcheck']),
      lesson(['discover-focus-categorize','discover-context-truefalse'], ['practice-error-repair','practice-focus-categorize'], ['transfer-problem-solving','transfer-rubric']),
      lesson(['discover-vocabulary-match','discover-selfcheck'], ['practice-translation','practice-sentence-transformation'], ['transfer-rolecards','transfer-writing']),
    ];
    const report = moduleDiversityReport(plans);
    expect(report.ready).toBe(true);
    expect(report.phaseFamilies.practice.length).toBeGreaterThanOrEqual(4);
    expect(report.phaseFamilies.transfer.length).toBeGreaterThanOrEqual(3);
  });

  it('rejects a module that repeats one family pattern three times', () => {
    const repeated = lesson(['discover-vocabulary-match'], ['practice-gap-fill'], ['transfer-speaking']);
    const report = moduleDiversityReport([repeated, repeated, repeated, repeated, repeated]);
    expect(report.ready).toBe(false);
    expect(report.diagnostics.map((item) => item.code)).toContain('MODULE_FAMILY_REPETITION');
  });

  it('plans at least three current-module encounters and a next-module return when possible', () => {
    const entries = planLexicalRecycling(
      [{ id: 'v1', lemma: 'ärkama' }, { id: 'v2', lemma: 'tavaliselt' }],
      ['a2-001','a2-002','a2-003','a2-004','a2-005'],
      ['a2-006','a2-007'],
    );
    const report = lexicalCoverageReport(entries, ['a2-001','a2-002','a2-003','a2-004','a2-005'], ['a2-006','a2-007']);
    expect(report.ready).toBe(true);
    expect(report.insufficient).toEqual([]);
    expect(report.noNextReturn).toEqual([]);
    expect(entries.every((entry) => entry.recycleLessonIds.includes('a2-006'))).toBe(true);
  });

  it('distributes a 16-word core set as 8 + 5 + 3 introductions and next-module returns', () => {
    const core = Array.from({ length: 16 }, (_, i) => ({ id: `v${i + 1}`, lemma: `word${i + 1}`, translationRu: `перевод ${i + 1}`, partOfSpeech: 'noun' }));
    const entries = planLexicalRecycling(core, ['a2-001','a2-002','a2-003','a2-004','a2-005'], ['a2-006','a2-007','a2-008','a2-009','a2-010']);
    const introductions = entries.reduce((acc, entry) => ({ ...acc, [entry.activeFromLessonId]: (acc[entry.activeFromLessonId] || 0) + 1 }), {});
    expect(introductions).toEqual({ 'a2-001': 8, 'a2-002': 5, 'a2-003': 3 });
    const returns = entries.reduce((acc, entry) => {
      const id = entry.recycleLessonIds.find((lessonId) => ['a2-006','a2-007','a2-008'].includes(lessonId));
      return { ...acc, [id]: (acc[id] || 0) + 1 };
    }, {});
    expect(returns).toEqual({ 'a2-006': 8, 'a2-007': 5, 'a2-008': 3 });
    expect(lexicalCoverageReport(entries, ['a2-001','a2-002','a2-003','a2-004','a2-005'], ['a2-006','a2-007','a2-008','a2-009','a2-010']).ready).toBe(true);
    expect(scheduledVocabularyForLesson(entries, 'a2-006', ['focus']).every((item) => item.focusIds.includes('focus'))).toBe(true);
  });
});
