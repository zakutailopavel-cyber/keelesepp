import { buildLibrary } from './blockLibrary.js';
import { buildReviewSheet, REVIEW_MINUTES } from './reviewSheet.js';
import { sheetMinutes } from './didactics/timeEstimate.js';
import { analyzeWorksheet } from './quality.js';
import { COURSE_MODULES, buildCourseSheet } from '../worksheet-generator/admin/course/registry.js';

describe('Kordamisleht — a review sheet from the course tasks', () => {
  const entries = buildLibrary(COURSE_MODULES, buildCourseSheet);

  // a2b1-084 (085 gives 62 min: its review takes the full mock 080), not a2b1-020 / … / a2b1-080: B1 modules 4, 6, 8, 10,
  // 12, 14 and 16 are methodology v5 / v6 modules — lean lessons whose drills went to Harjuta (hidden blocks), so a review of
  // their five lessons is ≈ 22–26 min (docs/PROJECT_STATE.md 2026-11-25 / 2026-11-26); a2-043, not a2-033: A2 module 7
  // (031–035) is a v5 + v6 module too (2026-11-26)
  it.each(['a2-005', 'a2-043', 'a2b1-084', 'b1b2-045', 'est-c1-010'])('%s: 40–50 min of the last five lessons, no constructor error', (lessonId) => {
    const doc = buildReviewSheet(entries, lessonId);
    const n = Number(lessonId.match(/(\d+)$/)[1]);
    const lessons = doc.meta.review.lessons.map((id) => Number(id.match(/(\d+)$/)[1]));
    expect(lessons.every((x) => x <= n && x > n - 5)).toBe(true);
    expect(sheetMinutes(doc)).toBeGreaterThanOrEqual(REVIEW_MINUTES.min - 5);
    expect(sheetMinutes(doc)).toBeLessThanOrEqual(REVIEW_MINUTES.max + 5);
    expect(doc.blocks.length).toBeLessThanOrEqual(16);
    expect(doc.blocks.at(-1).type).toBe('selfcheck');
    expect(new Set(doc.blocks.map((b) => b.id)).size).toBe(doc.blocks.length);
    expect(analyzeWorksheet(doc).issues.filter((i) => i.level === 'error')).toEqual([]);
  });

  it('is the same for the same variant and changes with the next one', () => {
    const a = buildReviewSheet(entries, 'a2-020', { variant: 1 });
    expect(buildReviewSheet(entries, 'a2-020', { variant: 1 })).toEqual(a);
    const b = buildReviewSheet(entries, 'a2-020', { variant: 2 });
    expect(b.blocks.map((x) => x.id)).not.toEqual(a.blocks.map((x) => x.id));
  });

  it('says so when the lesson has no course tasks', () => {
    expect(() => buildReviewSheet(entries, 'xx-001')).toThrow(/pole kursuse ülesandeid/);
  });
});
