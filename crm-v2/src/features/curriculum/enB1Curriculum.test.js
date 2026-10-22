import { describe, expect, it } from 'vitest';
import { enB1CurriculumRecords, EN_B1_LEVEL } from './enB1Curriculum.js';
import { COURSE_MODULES } from '../worksheet-generator/admin/course/registry.js';

describe('English B1 curriculum records', () => {
  const records = enB1CurriculumRecords();
  it('has one record per built lesson, with the course ids', () => {
    const built = COURSE_MODULES.filter((mod) => mod.MODULE.course === 'en' && mod.MODULE.level === 'English B1').flatMap((mod) => Object.keys(mod.LESSONS));
    expect(records.map((r) => r.id)).toEqual(built);
  });
  it('puts the lessons under Inglise keel · English B1 with a check every fifth lesson', () => {
    records.forEach((r) => {
      expect(r.subject).toBe('Inglise keel');
      expect(r.level).toBe(EN_B1_LEVEL);
      expect(r.roadmapKind).toBe(r.order % 5 === 0 ? 'check' : 'theme');
    });
  });
});
