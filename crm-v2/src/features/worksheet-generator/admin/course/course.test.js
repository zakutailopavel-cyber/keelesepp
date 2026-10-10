import { COURSE_MODULES, moduleSheets } from './registry.js';
import { moduleProblems } from './quality.js';

describe.each(COURSE_MODULES.map((mod) => [mod.MODULE.id, mod]))('course module %s', (_id, mod) => {
  it('passes the quality gate (constructor check, level norms, variety)', () => {
    const problems = moduleProblems(moduleSheets(mod));
    expect(problems.map((p) => `${p.lessonId} ${p.phase} ${p.code}: ${p.text}`)).toEqual([]);
  });
  it('keeps answer keys inside the sheet', () => {
    for (const lesson of Object.values(moduleSheets(mod))) {
      for (const doc of Object.values(lesson)) {
        for (const b of doc.blocks) {
          if (b.type === 'choice') b.data.questions.forEach((q) => expect(q.options.split('\n').filter((o) => o.startsWith('*'))).toHaveLength(1));
          if (b.type === 'gaps') expect(b.data.sentences.split('\n').every((s) => s.includes('['))).toBe(true);
        }
      }
    }
  });
});
