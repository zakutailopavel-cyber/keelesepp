import { describe, expect, it } from 'vitest';
import { COURSE_MODULES, LISTENING_GOAL, lessonGoalsFor, moduleSheets } from './registry.js';
import { ESTIMATE_RULES } from '../../../students/skillEstimate.js';

// „Kuulamine” on the skill-estimate card (docs/PROGRESS_ESTIMATE.md) reads score.perGoal.g_listen: the course's scored
// listening tasks report under that goal (lessonGoals.js goals.g_listen + tags), never a reading or writing task
const LISTENING_TASKS = new Set(['listening', 'examlisten', 'dictation', 'truefalse', 'choice', 'adsmatch']);
const lessons = COURSE_MODULES.filter((m) => ['a2', 'b1', 'b2', 'c1'].includes(m.MODULE.course))
  .flatMap((m) => Object.entries(moduleSheets(m)).map(([id, sheets]) => ({ id, course: m.MODULE.course, blocks: Object.values(sheets).flatMap((d) => d.blocks) })));

describe('listening goal g_listen', () => {
  it('is the goal the skill estimate reads', () => {
    expect(ESTIMATE_RULES.listening.goal).toBe(LISTENING_GOAL);
  });

  it('every Estonian course has lessons whose listening tasks are scored as g_listen', () => {
    for (const course of ['a2', 'b1', 'b2', 'c1']) {
      const tagged = lessons.filter((l) => l.course === course && l.blocks.some((b) => b.goal === LISTENING_GOAL));
      expect(tagged.length, course).toBeGreaterThanOrEqual(10);
    }
  });

  it('a lesson with g_listen has it as a sub-goal, trained by ≥ 2 listening tasks only', () => {
    for (const l of lessons) {
      const own = l.blocks.filter((b) => b.goal === LISTENING_GOAL);
      const listed = Boolean(lessonGoalsFor(l.id)?.goals?.[LISTENING_GOAL]);
      expect(listed, l.id).toBe(own.length > 0);
      if (!own.length) continue;
      expect(own.length, l.id).toBeGreaterThanOrEqual(2);
      for (const b of own) expect(LISTENING_TASKS.has(b.type), `${l.id} ${b.id} ${b.type}`).toBe(true);
    }
  });
});
