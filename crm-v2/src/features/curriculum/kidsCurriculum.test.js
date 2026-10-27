import { describe, expect, it } from 'vitest';
import { kidsCurriculumRecords } from './kidsCurriculum.js';
import { KIDS_MODULES } from '../worksheet-generator/admin/course/kids/sheets.js';

describe('children’s courses in Õppevara', () => {
  const records = kidsCurriculumRecords();
  it('36 lessons with the ids, titles and levels of the sheets', () => {
    expect(records).toHaveLength(36);
    const lessons = Object.assign({}, ...KIDS_MODULES.map((mod) => Object.fromEntries(Object.entries(mod.LESSONS).map(([id, l]) => [id, { ...l, module: mod.MODULE }]))));
    records.forEach((r) => {
      expect(lessons[r.id], r.id).toBeDefined();
      expect(r.title).toBe(lessons[r.id].title);
      expect(r.level).toBe(lessons[r.id].module.level);
    });
  });
  it('every lesson has the teacher’s plan minute by minute and a home task', () => {
    records.forEach((r) => {
      expect(r.description, r.id).toMatch(/Ход урока \((45|60) мин\)/);
      expect(r.description, r.id).toMatch(/Домой \(родителям\)/);
      expect(r.description.split('\n').filter((l) => /^\d\. /.test(l)).length, r.id).toBeGreaterThanOrEqual(5);
    });
    expect(records.filter((r) => r.roadmapTag === 'Pidu').map((r) => r.id)).toEqual(['k56-012', 'k67-012', 'k89-012']);
  });
});
