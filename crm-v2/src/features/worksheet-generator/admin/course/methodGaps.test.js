import { COURSE_MODULES } from './registry.js';
import { courseMethodGaps, examFormatGaps, recyclingShare, vocabStems } from './methodGaps.js';

const COURSES = ['a2', 'b1', 'b2', 'c1'];
const gaps = COURSES.flatMap((c) => courseMethodGaps(COURSE_MODULES, c));
const v4 = new Set(COURSE_MODULES.filter((m) => m.MODULE.template === 'v4').map((m) => m.MODULE.id));

describe('methodology across a course (docs/METHODOLOGY_STANDARD.md §2)', () => {
  it('a module in lesson template v4 has no gap: listening, vocabulary, recycling', () => {
    expect(gaps.filter((g) => v4.has(g.module)).map((g) => `${g.module} ${g.code}: ${g.text}`)).toEqual([]);
  });

  // known gaps of the older modules; a rewritten module leaves the list (remove it here)
  it('lists the known gaps of the older modules', () => {
    expect(gaps.filter((g) => g.code === 'listening').map((g) => g.module)).toEqual([
      
      'b1b2-module-17', 'b1b2-module-18',
      'est-c1-module-05', 'est-c1-module-06', 'est-c1-module-07', 'est-c1-module-08',
    ]);
    expect(gaps.filter((g) => g.code === 'recycling').map((g) => g.module)).toEqual([]);
    // A2 and C1 have no vocabulary blocks at all
    expect([...new Set(gaps.filter((g) => g.code === 'no-vocabulary').map((g) => g.module.split('-module')[0]))]).toEqual(['a2', 'est-c1']);
  });

  it('every course trains every Harno exam format at least once', () => {
    expect(COURSES.flatMap((c) => examFormatGaps(COURSE_MODULES, c).map((g) => `${c} ${g.id}`))).toEqual([]);
  });

  it('measures recycling by word stems', () => {
    const mod = (id, words, text) => ({ MODULE: { id, course: 'x' }, LESSONS: { l: { discover: [{ type: 'vocab', data: { words } }, { type: 'text', data: { text } }] } } });
    const prev = mod('x-module-01', 'kohtuma — встречаться, eelmisel nädalal — на прошлой неделе, saama — получать', '');
    expect(vocabStems(prev)).toEqual(['kohtu', 'eelmise']);
    expect(recyclingShare(prev, mod('x-module-02', '', 'Me kohtusime eile.'))).toBe(0.5);
  });
});
