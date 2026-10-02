import { describe, expect, it } from 'vitest';
import profile from '../fixtures/a2b1-016.generator-profile.json';
import { activityById } from './activityCatalog.js';
import { catalogReadiness, planLessonActivities } from './planner.js';

describe('didactic planner', () => {
  it('builds deterministic five-activity progressions from the catalog', () => {
    const first = planLessonActivities({ profile, lessonKind: 'grammar', seed: 'planner-reference' });
    const second = planLessonActivities({ profile, lessonKind: 'grammar', seed: 'planner-reference' });
    expect(second).toEqual(first);
    expect(first.diagnostics.filter((item) => item.severity === 'error')).toEqual([]);
    expect(Object.keys(first.phases)).toEqual(['discover', 'practice', 'transfer']);

    Object.entries(first.phases).forEach(([phase, ids]) => {
      expect(ids).toHaveLength(5);
      expect(new Set(ids).size).toBe(5);
      expect(ids.every((id) => activityById(id)?.phase === phase)).toBe(true);
    });

    const discoverTags = new Set(first.phases.discover.flatMap((id) => activityById(id).tags));
    expect(discoverTags).toEqual(expect.objectContaining ? discoverTags : discoverTags);
    expect(discoverTags.has('input')).toBe(true);
    expect(discoverTags.has('noticing')).toBe(true);
    expect(discoverTags.has('reflection')).toBe(true);

    const practiceTags = new Set(first.phases.practice.flatMap((id) => activityById(id).tags));
    expect(practiceTags.has('accuracy')).toBe(true);
    expect(practiceTags.has('controlled')).toBe(true);

    const transferTags = new Set(first.phases.transfer.flatMap((id) => activityById(id).tags));
    expect(transferTags.has('oral')).toBe(true);
    expect(transferTags.has('written')).toBe(true);
    expect(transferTags.has('reflection')).toBe(true);
  });

  it('reports catalog readiness and treats recent activities as cooldown history', () => {
    const readiness = catalogReadiness(profile, 'grammar');
    expect(readiness.discover.available).toBeGreaterThanOrEqual(5);
    expect(readiness.practice.available).toBeGreaterThanOrEqual(5);
    expect(readiness.transfer.available).toBeGreaterThanOrEqual(5);

    const first = planLessonActivities({ profile, lessonKind: 'grammar', seed: 'cooldown' });
    const history = Object.values(first.phases).flat();
    const next = planLessonActivities({ profile, lessonKind: 'grammar', seed: 'cooldown-next', activityHistory: history });
    expect(next.diagnostics.filter((item) => item.severity === 'error')).toEqual([]);
    expect(next.diagnostics.some((item) => item.code === 'ACTIVITY_COOLDOWN_REUSED')).toBe(true);

    Object.keys(first.phases).forEach((phase) => {
      expect(next.phases[phase].some((id) => !first.phases[phase].includes(id))).toBe(true);
    });
  });

  it('fails closed when a profile cannot support a five-task phase', () => {
    const sparse = {
      ...profile,
      activeVocabulary: profile.activeVocabulary.slice(0, 1),
      banks: { sentences: profile.banks.sentences.slice(0, 1) },
      successCriteria: [],
    };
    const result = planLessonActivities({ profile: sparse, lessonKind: 'grammar', seed: 'sparse' });
    expect(result.diagnostics.some((item) => item.code === 'DIDACTIC_PLAN_INSUFFICIENT' && item.severity === 'error')).toBe(true);
  });
});
