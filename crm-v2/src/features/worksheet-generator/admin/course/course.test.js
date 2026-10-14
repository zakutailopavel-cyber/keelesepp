import { COURSE_MODULES, moduleSheets } from './registry.js';
import fs from 'node:fs';
import { moduleProblems, problemKey, splitByBaseline } from './quality.js';
import { moduleReport } from './readiness.js';
import { keysProblems } from '../../../worksheet-studio/didactics/gates.js';
import STRICT_MODULES from './strictModules.json';

// Update the baseline after fixing course content (or once, when a check is introduced):
//   UPDATE_QUALITY_BASELINE=1 npx vitest run src/features/worksheet-generator/admin/course
const UPDATE = Boolean(globalThis.process?.env?.UPDATE_QUALITY_BASELINE);
const BASELINE_FILE = 'src/features/worksheet-generator/admin/course/qualityBaseline.json'; // run from crm-v2

describe.each(COURSE_MODULES.map((mod) => [mod.MODULE.id, mod]))('course module %s', (_id, mod) => {
  it.skipIf(UPDATE)('passes the quality gate (constructor check, level norms, variety, Harno) — no problem beyond the baseline', () => {
    const { fresh, fixed } = splitByBaseline(mod.MODULE.id, moduleProblems(moduleSheets(mod)));
    expect(fresh.map((p) => `${p.lessonId} ${p.phase} ${p.code}: ${p.text}`)).toEqual([]);
    // fixed problems leave the baseline, so they cannot come back unnoticed (run with UPDATE_QUALITY_BASELINE=1)
    expect(UPDATE ? [] : fixed).toEqual([]);
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

describe.skipIf(!UPDATE)('quality baseline', () => {
  it('writes the current problems of every module', () => {
    const baseline = Object.fromEntries(COURSE_MODULES.map((mod) => [mod.MODULE.id, moduleProblems(moduleSheets(mod)).map(problemKey).sort()]).filter(([, keys]) => keys.length));
    fs.writeFileSync(BASELINE_FILE, `${JSON.stringify(baseline, null, 1)}\n`);
  });
});

// Answer keys must work everywhere (one right option, a correction that differs from the error, a sort item in one
// group…): a broken key is a wrong mark for the learner, not a style question.
describe.each(COURSE_MODULES.map((mod) => [mod.MODULE.id, mod]))('answer keys of %s', (_id, mod) => {
  it('have no key errors', () => {
    const errors = Object.entries(moduleSheets(mod)).flatMap(([lessonId, phases]) => Object.entries(phases)
      .flatMap(([phase, doc]) => keysProblems(doc).filter((p) => p.level === 'error').map((p) => `${lessonId} ${phase}: ${p.text}`)));
    expect(errors).toEqual([]);
  });
});

// Modules brought to the ideal curriculum (owner 2026-10-14) stay there: every lesson passes every quality gate
// (depth, keys, level, uniqueness, vocabulary). Add a module to strictModules.json when it is done.
describe.each(COURSE_MODULES.filter((mod) => STRICT_MODULES.includes(mod.MODULE.id)).map((mod) => [mod.MODULE.id, mod]))('strict module %s', (_id, mod) => {
  it('passes every quality gate', () => {
    const report = moduleReport(mod);
    const problems = Object.entries(report.lessons).flatMap(([lessonId, lesson]) => [
      ...Object.entries(lesson.sheets).flatMap(([phase, list]) => list.map((p) => `${lessonId} ${phase} ${p.gate}: ${p.text}`)),
      ...lesson.module.map((p) => `${lessonId} ${p.gate}: ${p.text}`),
    ]);
    expect(problems).toEqual([]);
  });
});
