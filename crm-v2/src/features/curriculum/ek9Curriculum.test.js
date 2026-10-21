import { describe, expect, it } from 'vitest';
import { EK9_LEVEL, ek9CurriculumRecords } from './ek9Curriculum.js';
import { LESSONS, MODULE } from '../worksheet-generator/admin/course/ek9/module01.js';

describe('9. klass emakeel curriculum', () => {
  const records = ek9CurriculumRecords();

  it('has 30 lessons in 6 modules, every fifth a check', () => {
    expect(records).toHaveLength(30);
    expect(new Set(records.map((r) => r.id)).size).toBe(30);
    expect(records.map((r) => r.id).slice(0, 3)).toEqual(['ek9-001', 'ek9-002', 'ek9-003']);
    expect(new Set(records.map((r) => r.roadmapModuleId)).size).toBe(6);
    expect(records.filter((r) => r.roadmapKind === 'check').map((r) => r.order)).toEqual([5, 10, 15, 20, 25, 30]);
  });

  it('files the lessons in Õppevara under Eesti keel → 9. klass emakeel', () => {
    records.forEach((r) => expect(r).toMatchObject({ subject: 'Eesti keel', level: EK9_LEVEL, roadmapManaged: true, type: 'lesson' }));
    expect(EK9_LEVEL).toBe('9. klass emakeel');
  });

  it('matches the course module that is built in code', () => {
    expect(MODULE.level).toBe(EK9_LEVEL);
    Object.entries(LESSONS).forEach(([id, lesson]) => {
      const record = records.find((r) => r.id === id);
      expect(record?.title).toBe(lesson.title);
      expect(record?.roadmapModuleId).toBe(MODULE.id);
    });
  });
});
