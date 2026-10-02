import { describe, expect, it } from 'vitest';
import referenceProfile from './fixtures/a2b1-016.generator-profile.json';
import {
  buildGeneratorCoverage,
  GENERATOR_COVERAGE_STATUSES,
  generatorCoverageForLesson,
} from './coverage.js';

function embeddedLesson(id, profile = referenceProfile) {
  return {
    id,
    title: `Tund ${id}`,
    levelStage: 'A2',
    type: 'lesson',
    generatorProfile: { ...profile, lessonId: id },
  };
}

describe('generator coverage', () => {
  it('classifies ready embedded, ready static, draft, missing and structural error lessons', () => {
    const readyEmbedded = generatorCoverageForLesson(embeddedLesson('embedded-ready'));
    const readyStatic = generatorCoverageForLesson({ id: 'a2b1-016', title: 'Ajamäärused', levelStage: 'A2', type: 'lesson' });
    const draft = generatorCoverageForLesson(embeddedLesson('embedded-draft', { ...referenceProfile, contexts: [] }));
    const missing = generatorCoverageForLesson({ id: 'missing', title: 'Puuduv', levelStage: 'B1', type: 'lesson' });
    const error = generatorCoverageForLesson({
      id: 'broken',
      title: 'Vigane',
      levelStage: 'B1',
      type: 'lesson',
      generatorProfile: { ...referenceProfile, lessonId: 'broken', schema: 'unsupported/schema' },
    });

    expect(readyEmbedded.status).toBe(GENERATOR_COVERAGE_STATUSES.READY_EMBEDDED);
    expect(readyEmbedded.phaseAvailability).toMatchObject({ discover: 5, practice: 5, transfer: 5 });
    expect(readyStatic.status).toBe(GENERATOR_COVERAGE_STATUSES.READY_STATIC);
    expect(draft.status).toBe(GENERATOR_COVERAGE_STATUSES.DRAFT);
    expect(draft.errorCount).toBeGreaterThan(0);
    expect(missing.status).toBe(GENERATOR_COVERAGE_STATUSES.MISSING);
    expect(error.status).toBe(GENERATOR_COVERAGE_STATUSES.ERROR);
  });

  it('keeps an incomplete embedded draft visible when a verified static fallback is usable', () => {
    const row = generatorCoverageForLesson({
      id: 'a2b1-016',
      title: 'Ajamäärused',
      levelStage: 'A2',
      type: 'lesson',
      generatorProfile: { ...referenceProfile, contexts: [] },
    });

    expect(row.status).toBe(GENERATOR_COVERAGE_STATUSES.READY_STATIC);
    expect(row.fallback).toBe(true);
    expect(row.hasEmbeddedDraft).toBe(true);
    expect(row.errorCount).toBeGreaterThan(0);
  });

  it('builds stable summary counts and level facets', () => {
    const result = buildGeneratorCoverage([
      embeddedLesson('embedded-ready'),
      { id: 'a2b1-016', title: 'Ajamäärused', levelStage: 'A2', type: 'lesson' },
      embeddedLesson('embedded-draft', { ...referenceProfile, contexts: [] }),
      { id: 'missing', title: 'Puuduv', levelStage: 'B1', type: 'lesson' },
    ]);

    expect(result.summary).toMatchObject({
      total: 4,
      'ready-embedded': 1,
      'ready-static': 1,
      draft: 1,
      missing: 1,
      error: 0,
    });
    expect(result.levels).toEqual(['A2', 'B1']);
  });
});
