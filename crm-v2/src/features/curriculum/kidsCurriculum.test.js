import { describe, expect, it } from 'vitest';
import { kidsCurriculumRecords } from './kidsCurriculum.js';
import { KIDS_MODULES } from '../worksheet-generator/admin/course/kids/sheets.js';

describe('children’s courses in Õppevara', () => {
  const records = kidsCurriculumRecords();
  it('56 lessons with the ids, titles and levels of the sheets', () => {
    expect(records).toHaveLength(56);
    const lessons = Object.assign({}, ...KIDS_MODULES.map((mod) => Object.fromEntries(Object.entries(mod.LESSONS).map(([id, l]) => [id, { ...l, module: mod.MODULE }]))));
    records.forEach((r) => {
      expect(lessons[r.id], r.id).toBeDefined();
      expect(r.title).toBe(lessons[r.id].title);
      expect(r.level).toBe(lessons[r.id].module.level);
    });
  });
  it('every lesson has the teacher’s plan minute by minute and a home task', () => {
    records.forEach((r) => {
      expect(r.description, r.id).toMatch(/Ход урока \((45|60) мин\)|УРОК 1 \(45 мин\)/);
      expect(r.description, r.id).toMatch(/Домой \(родителям\)/);
      expect(r.description.split('\n').filter((l) => /^\d\. /.test(l)).length, r.id).toBeGreaterThanOrEqual(5);
    });
    expect(records.filter((r) => r.roadmapTag === 'Pidu').map((r) => r.id)).toEqual(['k56-012', 'k67-012', 'k89-012', 'k11-020']);
  });

  it('the speaking club 10–12: two lessons of 45 min with a snack, 12 meetings, in the „Lastele” tab', () => {
    const club = records.filter((r) => r.id.startsWith('k11-'));
    expect(club).toHaveLength(20);
    expect(club.map((r) => r.roadmapModuleNumber)).toEqual([1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5]);
    expect(club.filter((r) => r.roadmapTag === 'Projekt').map((r) => r.id)).toEqual(['k11-004', 'k11-008', 'k11-012', 'k11-016']);
    club.forEach((r) => {
      expect(r.level).toBe('Klubi 10–12 a');
      expect(r.description, r.id).toMatch(/УРОК 1 \(45 мин\)[\s\S]*ПЕРЕКУС[\s\S]*УРОК 2 \(45 мин\)/);
      expect(r.contactMinutes).toBe(90);
    });
  });
});
