import { describe, expect, it } from 'vitest';
import { lessonProgress, nextLesson, progressMap } from './selfStudyModel.js';

const assignments = [
  { lessonId: 'a', phase: 'discover', status: 'done', score: { correct: 9, total: 10 } },
  { lessonId: 'a', worksheetDoc: { meta: { phase: 'practice' } }, status: 'new' },
  { lessonId: 'b', phase: 'discover', status: 'new' },
  { lessonId: 'b', phase: 'discover', status: 'done', completedAt: '2026-10-12', score: { pct: 70 } },
];

describe('Õpi ise progress', () => {
  it('a lesson\'s three sheets: done (with %), started, untouched', () => {
    const map = progressMap(assignments);
    expect(lessonProgress('a', map).phases.map((p) => [p.key, p.status, p.pct])).toEqual([['discover', 'done', 90], ['practice', 'started', null], ['transfer', 'none', null]]);
    expect(lessonProgress('b', map).phases[0]).toMatchObject({ status: 'done', pct: 70 });
  });
  it('goes on with the started lesson, else the first untouched one', () => {
    const map = progressMap(assignments);
    expect(nextLesson([{ id: 'a' }, { id: 'b' }, { id: 'c' }], map).id).toBe('a');
    const finished = progressMap(['discover', 'practice', 'transfer'].map((phase) => ({ lessonId: 'a', phase, status: 'done' })));
    expect(nextLesson([{ id: 'a' }, { id: 'c' }], finished).id).toBe('c');
  });
});
