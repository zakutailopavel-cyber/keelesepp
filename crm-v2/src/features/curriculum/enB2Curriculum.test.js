import { describe, expect, it } from 'vitest';
import { EN_B2_CURRICULUM_ID, EN_B2_LESSONS, EN_B2_LEVEL, EN_B2_MODULES, enB2CurriculumRecords } from './enB2Curriculum.js';
import { courseNameForCurriculum, courseNameForLevel } from './courseNames.js';
import { COURSE_MODULES } from '../worksheet-generator/admin/course/registry.js';
import { COURSES } from '../worksheet-generator/admin/course/courseSheet.js';

describe('English B2 curriculum records', () => {
  it('has one record per built lesson (none before module 1)', () => {
    const built = COURSE_MODULES.filter((mod) => mod.MODULE.course === 'enb2').flatMap((mod) => Object.keys(mod.LESSONS));
    expect(enB2CurriculumRecords().map((r) => r.id)).toEqual(built);
  });

  it('plans 10 modules of 5 lessons with the stages B1+ (1–3), B2- (4–6), B2 (7–10)', () => {
    expect(EN_B2_MODULES).toHaveLength(EN_B2_LESSONS / 5);
    expect(EN_B2_MODULES.map((m) => m.stage)).toEqual([...Array(3).fill('English B1+'), ...Array(3).fill('English B2-'), ...Array(4).fill('English B2')]);
  });

  it('puts the lessons under Inglise keel · English B2 with ids, stage and a check every fifth lesson', () => {
    const lessons = Array.from({ length: 5 }, (_, i) => [`Lesson ${i + 1}`, `Focus ${i + 1}.`]);
    const modules = EN_B2_MODULES.map((m) => ({ ...m, lessons }));
    const records = enB2CurriculumRecords(modules);
    expect(records).toHaveLength(50);
    expect(records[0]).toMatchObject({ id: 'en-b2-001', roadmapModuleId: 'en-b2-module-01', levelStage: 'English B1+' });
    expect(records[49]).toMatchObject({ id: 'en-b2-050', roadmapModuleId: 'en-b2-module-10', levelStage: 'English B2', roadmapKind: 'check' });
    records.forEach((r) => {
      expect(r.subject).toBe('Inglise keel');
      expect(r.level).toBe(EN_B2_LEVEL);
      expect(r.curriculumId).toBe(EN_B2_CURRICULUM_ID);
      expect(r.roadmapKind).toBe(r.order % 5 === 0 ? 'check' : 'theme');
    });
  });

  it('is named English B2 and has a fixed course badge', () => {
    expect(courseNameForLevel('English B2')).toBe('English B2');
    expect(courseNameForCurriculum('en-b2-v1')).toBe('English B2');
    expect(COURSES.enb2).toMatchObject({ name: 'English B2', badge: 'KeeleSepp · English B2', label: 'English B2 · B1 tasemelt · inglise keele riigieksamini' });
  });
});
