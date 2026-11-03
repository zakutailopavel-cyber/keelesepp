/* global console */
import fs from 'node:fs';
import { COURSE_MODULES, moduleSheets } from './registry.js';
import { academicKey, courseRound2Problems, factDupProblems, factDuplicates, moduleRound2Problems } from './academicValue.js';
import { splitByBaseline } from './quality.js';

// The round-2 academic-value gates (docs/ACADEMIC_VALUE_ROUND2.md, docs/COURSE_DESIGN_COMMUNICATIVE.md §13.9) on every
// module of the B1 and B2 courses. academicValueRound2Baseline.json lists the problems each module had when the round-2
// gates came (shown, not blocking). A new problem blocks; a module with no round-2 problem left must leave the baseline.
// A fixed problem of a module that still has others only warns (B2 round-1 rewrites run in parallel), so regenerate the
// baseline whenever a module is rewritten:
//   UPDATE_ACADEMIC_ROUND2_BASELINE=1 npx vitest run src/features/worksheet-generator/admin/course/academicValueRound2Gate.test.js
// One module's problems (b1 / b2 for a whole course, summary for the counts per gate, dups for the repeated facts):
//   ACADEMIC_ROUND2_REPORT=a2b1-module-05 npx vitest run src/features/worksheet-generator/admin/course/academicValueRound2Gate.test.js --silent=false --reporter=verbose
const env = globalThis.process?.env || {};
const UPDATE = Boolean(env.UPDATE_ACADEMIC_ROUND2_BASELINE);
const REPORT = env.ACADEMIC_ROUND2_REPORT;
const FILE = 'src/features/worksheet-generator/admin/course/academicValueRound2Baseline.json'; // run from crm-v2
const baseline = fs.existsSync(FILE) ? JSON.parse(fs.readFileSync(FILE, 'utf8')) : {};

// enb2: English B2 (academicValue.js LEXICON.en); its facts are compared with the English sheets only by wording
const MODULES = ['b1', 'b2', 'enb2'].flatMap((course) => COURSE_MODULES.filter((mod) => mod.MODULE.course === course && !mod.MODULE.supplement));
// the same fact in two modules of either course (B1 first, then B2): the problem sits with the later module's course
const DUPS = factDuplicates(MODULES.map((mod) => ({ id: mod.MODULE.id, sheets: moduleSheets(mod) })));
const courseOf = Object.fromEntries(MODULES.map((mod) => [mod.MODULE.id, mod.MODULE.course]));
const COURSES = ['b1', 'b2', 'enb2'].map((course) => {
  const modules = MODULES.filter((mod) => mod.MODULE.course === course);
  const groups = modules.map((mod) => [mod.MODULE.id, moduleRound2Problems(moduleSheets(mod))]);
  const dups = factDupProblems(DUPS).filter((p) => courseOf[p.moduleId] === course);
  groups.push([`course:${course}`, [...courseRound2Problems(modules, moduleSheets), ...dups]]);
  return { course, groups };
});
const GROUPS = COURSES.flatMap((c) => c.groups);

describe.skipIf(UPDATE || REPORT)('academic value, round 2', () => {
  it.each(GROUPS)('%s: no round-2 problem beyond the baseline', (group, problems) => {
    const { fresh, fixed } = splitByBaseline(group, problems, baseline);
    expect(fresh.map((p) => `${academicKey(p)}: ${p.text}`)).toEqual([]);
    // a module that passes every round-2 gate leaves the baseline; other fixed problems only warn
    if (!problems.length) expect(fixed).toEqual([]);
    else if (fixed.length) console.warn(`${group}: fixed round-2 problems still in the baseline (regenerate it): ${fixed.join(', ')}`);
  });
});

describe.skipIf(!UPDATE)('academic value round-2 baseline', () => {
  it('writes the current round-2 problems', () => {
    const out = Object.fromEntries(GROUPS.map(([g, problems]) => [g, problems.map(academicKey).sort()]).filter(([, keys]) => keys.length));
    fs.writeFileSync(FILE, `${JSON.stringify(out, null, 1)}\n`);
  });
});

describe.skipIf(!REPORT)('academic value round-2 report', () => {
  it('prints the problems', () => {
    if (REPORT === 'summary') {
      const lines = [];
      for (const { course, groups } of COURSES) {
        const modules = groups.filter(([g]) => !g.startsWith('course:'));
        const codes = [...new Set(groups.flatMap(([, ps]) => ps.map((p) => p.code)))].sort();
        lines.push(`\n${course}: ${modules.filter(([, ps]) => !ps.length).length}/${modules.length} modules pass every round-2 gate`);
        lines.push(`  ${['module', ...codes].join(' | ')}`);
        modules.forEach(([g, ps]) => lines.push(`  ${[g, ...codes.map((c) => ps.filter((p) => p.code === c).length)].join(' | ')}`));
        groups.filter(([g]) => g.startsWith('course:')).forEach(([, ps]) => ps.forEach((p) => lines.push(`  course ${p.code}: ${p.text}`)));
      }
      console.log(lines.join('\n'));
      return;
    }
    if (REPORT === 'dups') {
      console.log(DUPS.map((d) => `${d.kind === 'key' ? `[${d.key}]` : `[${d.similarity}]`} ${d.first.moduleId} ${d.first.blockId} → ${d.again.moduleId} ${d.again.blockId}${d.kind === 'sentence' ? `\n    ${d.first.text}\n    ${d.again.text}` : ''}`).join('\n'));
      return;
    }
    const groups = GROUPS.filter(([g]) => g === REPORT || g.startsWith(`${REPORT === 'b1' ? 'a2b1' : REPORT === 'b2' ? 'b1b2' : REPORT}`) || g === `course:${REPORT}`);
    expect(groups.length, `module or course ${REPORT}`).toBeGreaterThan(0);
    console.log(groups.map(([g, ps]) => `## ${g}: ${ps.length ? '' : 'PASS'}\n${ps.map((p) => `  ${p.lessonId} ${p.phase} [${p.code}] ${p.text}`).join('\n')}`).join('\n'));
  });
});
