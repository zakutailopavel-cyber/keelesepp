import { describe, expect, it } from 'vitest';
import { courseBadge, courseNameForCurriculum, courseNameForLevel } from './courseNames.js';
import { COURSES, COURSE_MODULES, buildCourseSheet } from '../worksheet-generator/admin/course/registry.js';

describe('course names by the target level (owner 2026-10-29)', () => {
  it('names a course by its level and curriculum id; the ids stay as they are', () => {
    expect(courseNameForLevel('B1')).toBe('Eesti keel B1');
    expect(courseNameForLevel('C1')).toBe('C1 süvakursus');
    expect(courseNameForLevel('English A2')).toBe('English A2');
    expect(courseNameForLevel('B1+')).toBe('');
    expect(courseNameForCurriculum('est-a2-b1-roadmap-v1')).toBe('Eesti keel B1');
    expect(courseNameForCurriculum('est-b1-b2-roadmap-v1')).toBe('Eesti keel B2');
    expect(courseNameForCurriculum('est-c1-curriculum-240-v1')).toBe('C1 süvakursus');
    expect(courseNameForCurriculum('est-b2-c1-roadmap-v1')).toBe('Eesti keel C1');
  });

  it('shows an old saved badge under the new name and leaves a hand-typed badge alone', () => {
    expect(courseBadge('KeeleSepp A2 → B1 · moodul 3', 'B1')).toBe('KeeleSepp · Eesti keel B1 · moodul 3');
    expect(courseBadge('KeeleSepp A1 → A2 · Lihtminevik', 'A2')).toBe('KeeleSepp · Eesti keel A2 · Lihtminevik');
    expect(courseBadge('KeeleSepp B2 → C1 · moodul 8', 'C1')).toBe('KeeleSepp · C1 süvakursus · moodul 8');
    expect(courseBadge('KeeleSepp English · moodul 2', 'English B1')).toBe('KeeleSepp · English B1 · moodul 2');
    expect(courseBadge('KeeleSepp · Eesti keel B2 · moodul 1', 'B2')).toBe('KeeleSepp · Eesti keel B2 · moodul 1');
    expect(courseBadge('Minu rühm', 'B1')).toBe('Minu rühm');
    expect(courseBadge(undefined, 'B1')).toBeUndefined();
  });

  it('prints the new name on every generated course sheet', () => {
    expect(COURSES.b1.label).toBe('Eesti keel B1 · A2 tasemelt · Harno B1 eksamini');
    expect(COURSES.b2c1.label).toBe('Eesti keel C1 · B2 tasemelt · Harno C1 eksamini');
    expect(COURSES.b2c1.badge).toBe('KeeleSepp · Eesti keel C1');
    expect(COURSES.c1.name).toBe('C1 süvakursus');
    const first = (course) => COURSE_MODULES.find((m) => m.MODULE.course === course && !m.MODULE.supplement);
    for (const [course, badge] of [['a2', 'KeeleSepp · Eesti keel A2 · moodul 1'], ['b1', 'KeeleSepp · Eesti keel B1 · moodul 1'], ['b2', 'KeeleSepp · Eesti keel B2 · moodul 1'], ['c1', 'KeeleSepp · C1 süvakursus · moodul 1']]) {
      const mod = first(course);
      const lessonId = Object.keys(mod.LESSONS)[0];
      const phase = Object.keys(mod.LESSONS[lessonId]).find((p) => ['discover', 'practice', 'transfer'].includes(p));
      expect(buildCourseSheet(mod, lessonId, phase).meta.badge).toBe(badge);
    }
    const en = COURSE_MODULES.find((m) => m.MODULE.course === 'en' && m.MODULE.level === 'English B1');
    const enLesson = Object.keys(en.LESSONS)[0];
    expect(buildCourseSheet(en, enLesson, 'discover').meta.badge).toMatch(/^KeeleSepp · English B1 · moodul \d+$/);
  });
});
