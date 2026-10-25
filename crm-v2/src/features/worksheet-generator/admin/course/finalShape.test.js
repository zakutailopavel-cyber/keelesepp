import fs from 'node:fs';
import { COURSE_MODULES, moduleSheets } from './registry.js';
import { finalShapeKey, finalShapeProblems, lessonsFromModules } from '../../../worksheet-studio/didactics/finalShape.js';

// The B1 course against its final shape (docs/COURSE_FINAL_SHAPE_B1.md §8, gates V1–V15). The problems the course has
// today are listed in finalShapeBaseline.json (shown, not blocking); a NEW problem fails, and a fixed one must leave the
// baseline. After fixing content (or when a rule changes) rewrite the baseline:
//   UPDATE_FINAL_SHAPE_BASELINE=1 npx vitest run src/features/worksheet-generator/admin/course/finalShape.test.js
// What to fix, per rule and module: node tools/course-audit/final-shape.mjs (or npm run course:final-shape).
const UPDATE = Boolean(globalThis.process?.env?.UPDATE_FINAL_SHAPE_BASELINE);
const BASELINE_FILE = 'src/features/worksheet-generator/admin/course/finalShapeBaseline.json'; // run from crm-v2
const BASELINE = fs.existsSync(BASELINE_FILE) ? JSON.parse(fs.readFileSync(BASELINE_FILE, 'utf8')) : {};

// the EKI etLex A1–B1 word forms stand in for the põhisõnavara list (V14)
const forms = new Set(['A1', 'A2', 'B1'].flatMap((level) => String(JSON.parse(fs.readFileSync(`src/features/worksheet-studio/didactics/levelForms.${level}.json`, 'utf8')).forms || '').split('\n')));
const B1 = COURSE_MODULES.filter((mod) => mod.MODULE.course === 'b1');
const problems = finalShapeProblems(lessonsFromModules(B1, moduleSheets), { forms });
const groups = [...B1.map((mod) => mod.MODULE.id), 'course'];

function split(group) {
  const left = new Map();
  (BASELINE[group] || []).forEach((k) => left.set(k, (left.get(k) || 0) + 1));
  const fresh = [];
  problems.filter((p) => p.moduleId === group).forEach((p) => {
    const k = finalShapeKey(p);
    if (left.get(k)) left.set(k, left.get(k) - 1); else fresh.push(p);
  });
  return { fresh, fixed: [...left].flatMap(([k, n]) => Array(n).fill(k)) };
}

describe.skipIf(UPDATE).each(groups)('B1 final shape: %s', (group) => {
  it('has no problem beyond the baseline, and every fixed problem has left it', () => {
    const { fresh, fixed } = split(group);
    expect(fresh.map((p) => `${p.lessonId} ${p.phase} ${p.check}: ${p.text}`)).toEqual([]);
    expect(fixed).toEqual([]);
  });
});

describe.skipIf(!UPDATE)('final-shape baseline', () => {
  it('writes the current problems of the B1 course', () => {
    const baseline = Object.fromEntries(groups.map((g) => [g, problems.filter((p) => p.moduleId === g).map(finalShapeKey).sort()]).filter(([, keys]) => keys.length));
    fs.writeFileSync(BASELINE_FILE, `${JSON.stringify(baseline, null, 1)}\n`);
  });
});
