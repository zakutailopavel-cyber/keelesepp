import fs from 'node:fs';
import { COURSE_MODULES, moduleSheets } from './registry.js';
import { finalShapeKey, finalShapeProblems, lessonsFromModules } from '../../../worksheet-studio/didactics/finalShape.js';

// Each course against its final shape (docs/COURSE_FINAL_SHAPE_B1.md §8, gates V1–V16; the B1→B2 course with the B2
// profile, docs/COURSE_FINAL_SHAPE_B2.md; the B2→C1 course, docs/COURSE_FINAL_SHAPE_C1.md). The problems a course has today are listed in its baseline file (shown, not
// blocking); a NEW problem fails, and a fixed one must leave the baseline. After fixing content (or when a rule changes)
// rewrite the baselines:
//   UPDATE_FINAL_SHAPE_BASELINE=1 npx vitest run src/features/worksheet-generator/admin/course/finalShape.test.js
// What to fix, per rule and module: node tools/course-audit/final-shape.mjs [--course b2] (or npm run course:final-shape).
const UPDATE = Boolean(globalThis.process?.env?.UPDATE_FINAL_SHAPE_BASELINE);
const DIR = 'src/features/worksheet-generator/admin/course'; // run from crm-v2
const formsOf = (levels) => new Set(levels.flatMap((level) => String(JSON.parse(fs.readFileSync(`src/features/worksheet-studio/didactics/levelForms.${level}.json`, 'utf8')).forms || '').split('\n')));
// the EKI etLex word forms stand in for the põhisõnavara list (V14); a supplement module (MODULE.supplement) is not on
// the course path and is left out
const COURSES = [
  { course: 'b1', file: `${DIR}/finalShapeBaseline.json`, forms: ['A1', 'A2', 'B1'] },
  { course: 'b2', file: `${DIR}/finalShapeBaselineB2.json`, forms: ['A1', 'A2', 'B1', 'B2'] },
  { course: 'a2', file: `${DIR}/finalShapeBaselineA2.json`, forms: ['A1', 'A2'] },
  // no modules yet (docs/COURSE_FINAL_SHAPE_C1.md §8): no groups until the first module is registered
  { course: 'b2c1', file: `${DIR}/finalShapeBaselineB2C1.json`, forms: ['A1', 'A2', 'B1', 'B2', 'C1'] },
].map((c) => {
  const modules = COURSE_MODULES.filter((mod) => mod.MODULE.course === c.course && !mod.MODULE.supplement);
  const problems = finalShapeProblems(lessonsFromModules(modules, moduleSheets), { forms: formsOf(c.forms), profile: c.course });
  const baseline = fs.existsSync(c.file) ? JSON.parse(fs.readFileSync(c.file, 'utf8')) : {};
  return { ...c, problems, baseline, groups: modules.length ? [...modules.map((mod) => mod.MODULE.id), 'course'] : [] };
});

function split({ problems, baseline }, group) {
  const left = new Map();
  (baseline[group] || []).forEach((k) => left.set(k, (left.get(k) || 0) + 1));
  const fresh = [];
  problems.filter((p) => p.moduleId === group).forEach((p) => {
    const k = finalShapeKey(p);
    if (left.get(k)) left.set(k, left.get(k) - 1); else fresh.push(p);
  });
  return { fresh, fixed: [...left].flatMap(([k, n]) => Array(n).fill(k)) };
}

describe.skipIf(UPDATE).each(COURSES.flatMap((c) => c.groups.map((group) => [c.course, group, c])))('final shape %s: %s', (_course, group, c) => {
  it('has no problem beyond the baseline, and every fixed problem has left it', () => {
    const { fresh, fixed } = split(c, group);
    expect(fresh.map((p) => `${p.lessonId} ${p.phase} ${p.check}: ${p.text}`)).toEqual([]);
    expect(fixed).toEqual([]);
  });
});

describe.skipIf(!UPDATE)('final-shape baselines', () => {
  it.each(COURSES.map((c) => [c.course, c]))('writes the current problems of course %s', (_course, c) => {
    const baseline = Object.fromEntries(c.groups.map((g) => [g, c.problems.filter((p) => p.moduleId === g).map(finalShapeKey).sort()]).filter(([, keys]) => keys.length));
    fs.writeFileSync(c.file, `${JSON.stringify(baseline, null, 1)}\n`);
  });
});
