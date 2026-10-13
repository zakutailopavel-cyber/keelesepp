import { describe, expect, it } from 'vitest';
import { hasLessonWords, lessonWordId, loadLessonWords, loadWordsForLessons } from './lessonWords.js';

describe('lesson words loader', () => {
  it('knows the four course prefixes and builds fixed ids', () => {
    expect(hasLessonWords('a2-001')).toBe(true);
    expect(hasLessonWords('est-c1-010')).toBe(true);
    expect(hasLessonWords('b1-003')).toBe(false);
    expect(lessonWordId('s/1', 'a2-001', 3)).toBe('lw_s1_a2-001_3');
  });

  it('loads a lesson and many lessons lazily', async () => {
    expect((await loadLessonWords('a2-001')).length).toBeGreaterThanOrEqual(8);
    expect(await loadLessonWords('nope')).toEqual([]);
    const map = await loadWordsForLessons(['a2-001', 'a2b1-001', 'x-1']);
    expect(Object.keys(map)).toEqual(['a2-001', 'a2b1-001']);
  });
});
