import { describe, expect, it } from 'vitest';
import { enA2CurriculumRecords, EN_A2_LEVEL } from './enA2Curriculum.js';
import { COURSE_MODULES } from '../worksheet-generator/admin/course/registry.js';

describe('English A2 curriculum records', () => {
  const records = enA2CurriculumRecords();
  it('has one record per built lesson, with the course ids', () => {
    const built = COURSE_MODULES.filter((mod) => mod.MODULE.course === 'en').flatMap((mod) => Object.keys(mod.LESSONS));
    expect(records.map((r) => r.id)).toEqual(built);
  });
  it('puts the lessons under Inglise keel · English A2 with a check every fifth lesson', () => {
    records.forEach((r) => {
      expect(r.subject).toBe('Inglise keel');
      expect(r.level).toBe(EN_A2_LEVEL);
      expect(r.roadmapKind).toBe(r.order % 5 === 0 ? 'check' : 'theme');
    });
  });
});
