/* global console */
import fs from 'node:fs';
import { COURSE_MODULES, moduleSheets } from './registry.js';
import { academicKey, courseAcademicProblems, moduleAcademicProblems } from './academicValue.js';
import { splitByBaseline } from './quality.js';

// The academic-value gates (docs/COURSE_DESIGN_COMMUNICATIVE.md §13, docs/ACADEMIC_VALUE_ROUND1.md) on every module of
// the B1 and B2 courses. academicValueBaseline.json lists the modules NOT yet rewritten, with the problems they had when
// the gates came (shown, not blocking). A module that is not in the baseline must pass every gate; a listed module may
// not get a new problem, and a fixed problem must leave the baseline. When a module is rewritten, regenerate:
//   UPDATE_ACADEMIC_BASELINE=1 npx vitest run src/features/worksheet-generator/admin/course/academicValueGate.test.js
// (a module with no problem left drops out of the file — it is then held to every gate). One module's problems:
//   ACADEMIC_REPORT=a2b1-module-05 npx vitest run src/features/worksheet-generator/admin/course/academicValueGate.test.js --silent=false --reporter=verbose
// (ACADEMIC_REPORT=b1 or b2 prints the whole course, ACADEMIC_REPORT=summary the counts per gate).
const env = globalThis.process?.env || {};
const UPDATE = Boolean(env.UPDATE_ACADEMIC_BASELINE);
const FILE = 'src/features/worksheet-generator/admin/course/academicValueBaseline.json'; // run from crm-v2
const baseline = fs.existsSync(FILE) ? JSON.parse(fs.readFileSync(FILE, 'utf8')) : {};

const COURSES = ['b1', 'b2'].map((course) => {
  const modules = COURSE_MODULES.filter((mod) => mod.MODULE.course === course && !mod.MODULE.supplement);
  const groups = modules.map((mod) => [mod.MODULE.id, moduleAcademicProblems(moduleSheets(mod), { profile: course })]);
  groups.push([`course:${course}`, courseAcademicProblems(course, modules, moduleSheets)]);
  return { course, groups };
});
const GROUPS = COURSES.flatMap((c) => c.groups);

describe.skipIf(UPDATE || env.ACADEMIC_REPORT)('academic value', () => {
  it.each(GROUPS)('%s: no problem beyond the baseline, every fixed problem has left it', (group, problems) => {
    const { fresh, fixed } = splitByBaseline(group, problems, baseline);
    expect(fresh.map((p) => `${academicKey(p)}: ${p.text}`)).toEqual([]);
    expect(fixed).toEqual([]);
  });
});

describe.skipIf(!UPDATE)('academic value baseline', () => {
  it('writes the current problems of the modules not yet rewritten', () => {
    const out = Object.fromEntries(GROUPS.map(([g, problems]) => [g, problems.map(academicKey).sort()]).filter(([, keys]) => keys.length));
    fs.writeFileSync(FILE, `${JSON.stringify(out, null, 1)}\n`);
  });
});

describe.skipIf(!env.ACADEMIC_REPORT)('academic value report', () => {
  it('prints the problems', () => {
    const want = env.ACADEMIC_REPORT;
    if (want === 'summary') {
      const lines = [];
      for (const { course, groups } of COURSES) {
        const modules = groups.filter(([g]) => !g.startsWith('course:'));
        const codes = [...new Set(groups.flatMap(([, ps]) => ps.map((p) => p.code)))].sort();
        lines.push(`\n${course}: ${modules.filter(([, ps]) => !ps.length).length}/${modules.length} modules pass every gate`);
        for (const code of codes) {
          const failing = modules.filter(([, ps]) => ps.some((p) => p.code === code));
          const count = groups.reduce((n, [, ps]) => n + ps.filter((p) => p.code === code).length, 0);
          lines.push(`  ${code}: ${failing.length} modules, ${count} problems`);
        }
        groups.filter(([g]) => g.startsWith('course:')).forEach(([, ps]) => ps.forEach((p) => lines.push(`  course ${p.code}: ${p.text}`)));
      }
      console.log(lines.join('\n'));
      return;
    }
    const groups = GROUPS.filter(([g]) => g === want || g.startsWith(`${want === 'b1' ? 'a2b1' : want === 'b2' ? 'b1b2' : want}`) || g === `course:${want}`);
    expect(groups.length, `module or course ${want}`).toBeGreaterThan(0);
    console.log(groups.map(([g, ps]) => `## ${g}: ${ps.length ? '' : 'PASS'}\n${ps.map((p) => `  ${p.lessonId} ${p.phase} [${p.code}] ${p.text}`).join('\n')}`).join('\n'));
  });
});
