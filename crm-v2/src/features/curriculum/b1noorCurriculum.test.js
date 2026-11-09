import { describe, expect, it } from 'vitest';
import { B1NOOR_CURRICULUM_ID, B1NOOR_LEVEL, b1noorCurriculumRecords } from './b1noorCurriculum.js';
import { MODULES } from '../worksheet-generator/admin/course/courseModules.b1noor.js';
import { COURSE_MODULES, COURSES } from '../worksheet-generator/admin/course/registry.js';
import { LOADABLE_COURSES } from '../worksheet-generator/admin/course/courseLoaders.js';

describe('B1 noorkeele õppija (course b1noor)', () => {
  const records = b1noorCurriculumRecords(MODULES);

  it('is its own course next to „Eesti keel B1”: own key, name, module and lesson ids', () => {
    expect(COURSES.b1noor).toMatchObject({ name: 'B1 noorkeele õppija', badge: 'KeeleSepp · B1 noorkeele õppija' });
    expect(LOADABLE_COURSES).toContain('b1noor');
    MODULES.forEach((mod) => {
      expect(mod.MODULE.course).toBe('b1noor');
      expect(mod.MODULE.id).toMatch(/^b1noor-module-\d\d$/);
      Object.keys(mod.LESSONS).forEach((id) => expect(id).toMatch(/^b1noor-\d{3}$/));
    });
    // the current A2 → B1 course keeps its own lessons
    const b1 = COURSE_MODULES.filter((mod) => mod.MODULE.course === 'b1');
    expect(b1.length).toBeGreaterThanOrEqual(18);
    expect(b1.flatMap((mod) => Object.keys(mod.LESSONS)).some((id) => id.startsWith('b1noor'))).toBe(false);
  });

  it('files the lessons in Õppevara under Eesti keel → B1 noorkeele õppija, one record per lesson in code', () => {
    const ids = MODULES.flatMap((mod) => Object.keys(mod.LESSONS));
    expect(records.map((r) => r.id)).toEqual(ids);
    records.forEach((r) => expect(r).toMatchObject({ subject: 'Eesti keel', level: B1NOOR_LEVEL, curriculumId: B1NOOR_CURRICULUM_ID, roadmapManaged: true, type: 'lesson' }));
    // the entry test (001) and each module's lesson 5 are checks
    expect(records.filter((r) => r.roadmapKind === 'check').map((r) => r.order)).toEqual([1, ...MODULES.map((_, i) => (i + 1) * 5)]);
    // a record only describes a lesson: nothing in it assigns the lesson to a student
    records.forEach((r) => expect(Object.keys(r).some((k) => /student|assign/i.test(k))).toBe(false));
  });

  it('every teaching lesson is a v3 station lesson with a teacher page', () => {
    MODULES.forEach((mod) => {
      expect(mod.MODULE.design).toBe('v3-stations');
      Object.values(mod.LESSONS).filter((l) => !l.assessment).forEach((l) => expect(l.teacherPage?.goal).toBeTruthy());
    });
  });
});
