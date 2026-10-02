import { describe, expect, it } from 'vitest';
import {
  A2_CURRICULUM_ID,
  A2_LESSON_COUNT,
  A2_MODULE_COUNT,
  a2CurriculumRecords,
  a2InstalledCount,
  a2NeedsInstall,
  getA2Roadmap,
  validateA2Roadmap,
} from './a2Curriculum.js';

describe('A2 curriculum v1', () => {
  it('validates the canonical 20-module / 100-lesson roadmap', () => {
    const roadmap = getA2Roadmap();
    const result = validateA2Roadmap(roadmap);

    expect(result.ready).toBe(true);
    expect(result.diagnostics).toEqual([]);
    expect(result.modules).toHaveLength(A2_MODULE_COUNT);
    expect(result.lessons).toHaveLength(A2_LESSON_COUNT);
    expect(new Set(result.lessons.map((lesson) => lesson.id)).size).toBe(100);
    expect(new Set(result.lessons.map((lesson) => lesson.sourceKey)).size).toBe(100);
    for (let number = 5; number <= 100; number += 5) {
      expect(result.lessons[number - 1].kind).toBe('assessment');
    }
  });

  it('projects stable Firestore lesson records without worksheet or generator fields', () => {
    const records = a2CurriculumRecords();

    expect(records).toHaveLength(100);
    expect(records[0]).toMatchObject({
      id: 'a2-001',
      curriculumId: A2_CURRICULUM_ID,
      subject: 'Eesti keel',
      level: 'A2',
      levelStage: 'A2',
      roadmapManaged: true,
      roadmapLessonNumber: 1,
      roadmapModuleNumber: 1,
    });
    expect(records[99]).toMatchObject({
      id: 'a2-100',
      curriculumId: A2_CURRICULUM_ID,
      roadmapKind: 'assessment',
      roadmapLessonNumber: 100,
      roadmapModuleNumber: 20,
    });
    expect(records[0].worksheetPrompt).toContain('KeeleSepp A2 individuaaltund');
    expect(records[0]).not.toHaveProperty('worksheetDoc');
    expect(records[0]).not.toHaveProperty('generatorProfile');
  });

  it('detects installation completeness only from the exact A2 curriculum identity', () => {
    const all = a2CurriculumRecords();
    expect(a2InstalledCount(all)).toBe(100);
    expect(a2NeedsInstall(all)).toBe(false);
    expect(a2InstalledCount(all.slice(0, 99))).toBe(99);
    expect(a2NeedsInstall(all.slice(0, 99))).toBe(true);
    expect(a2InstalledCount([{ ...all[0], curriculumId: 'other' }])).toBe(0);
  });

  it('fails closed when a required lesson is structurally broken', () => {
    const roadmap = JSON.parse(JSON.stringify(getA2Roadmap()));
    roadmap.modules[0].lessons[0].goal = '';
    const result = validateA2Roadmap(roadmap);
    expect(result.ready).toBe(false);
    expect(result.diagnostics.some((message) => message.includes('goal'))).toBe(true);
  });
});
