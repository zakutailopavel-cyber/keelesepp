import { describe, expect, it } from 'vitest';
import { KITSAS_12 } from './kitsas12.js';
import { MATH_MODULES } from './sheets.js';
import { buildCourseSheet } from '../courseSheet.js';
import { BLOCKS } from '../../../../worksheet-studio/engine/registry.js';
import { compileExpr } from '../../../../worksheet-studio/engine/mathExpr.js';
import { mathCurriculumRecords } from '../../../../curriculum/mathCurriculum.js';
import { subjectOfLevel } from '../../../../library/libraryModel.js';

const mod = MATH_MODULES[0];
const ids = Object.keys(mod.LESSONS);
const points = (task) => task.parts.reduce((sum, [, p]) => sum + p, 0);

describe('math kitsas riigieksam module', () => {
  it('has one lesson per exam task type, three sheets each', () => {
    expect(ids).toHaveLength(KITSAS_12.lessons.length);
    expect(ids[0]).toBe('mk12-001');
    for (const id of ids) {
      for (const phase of ['discover', 'practice', 'transfer']) {
        const doc = buildCourseSheet(mod, id, phase);
        expect(doc.blocks.length).toBeGreaterThan(0);
        for (const b of doc.blocks) expect(BLOCKS[b.type], `${id} ${b.type}`).toBeTruthy();
      }
    }
  });

  it('every block id is unique', () => {
    const all = ids.flatMap((id) => ['discover', 'practice', 'transfer'].flatMap((p) => mod.LESSONS[id][p].map((b) => b.id)));
    expect(new Set(all).size).toBe(all.length);
  });

  it('the exam task carries the points its title says (5 or 10, like the real exam)', () => {
    for (const lesson of KITSAS_12.lessons) {
      const want = Number(/\((\d+) punkti\)/.exec(lesson.examTask.title)[1]);
      expect([5, 10]).toContain(want);
      expect(points(lesson.examTask), lesson.title).toBe(want);
    }
  });

  it('every part has a worked solution; a scored part accepts its own key', () => {
    const { score } = BLOCKS.mathtask;
    for (const id of ids) {
      for (const b of [...mod.LESSONS[id].practice, ...mod.LESSONS[id].transfer].filter((x) => x.type === 'mathtask')) {
        b.data.parts.forEach((p) => expect(p.solution, `${b.id}: ${p.text}`).toBeTruthy());
        const right = Object.fromEntries(b.data.parts.map((p, i) => [`p${i}`, String(p.answer).split('|')[0]]));
        const res = score(b.data, (k) => right[k], b);
        expect(res.every((r) => r.ok), b.id).toBe(true);
        const wrong = score(b.data, () => '123456', b);
        expect(wrong.some((r) => r.ok), b.id).toBe(false);
      }
    }
  });

  it('every graph formula can be drawn', () => {
    for (const id of ids) {
      for (const b of [...mod.LESSONS[id].discover, ...mod.LESSONS[id].transfer].filter((x) => x.type === 'graph')) {
        for (const fn of String(b.data.fns || '').split('\n').filter(Boolean)) expect(compileExpr(fn).error, `${b.id}: ${fn}`).toBeUndefined();
      }
    }
  });

  it('the numeric keys are right (recomputed)', () => {
    const near = (a, b) => Math.abs(a - b) < 0.006;
    const rad = (d) => (d * Math.PI) / 180;
    expect(near(2000 * 1.03 ** 5, 2318.55)).toBe(true);
    expect(near(24000 * 0.88 ** 3, 16355.33)).toBe(true);
    expect(near(Math.sqrt(120 ** 2 + 85 ** 2 - 2 * 120 * 85 * Math.cos(rad(52))), 95.21)).toBe(true);
    expect(near(0.5 * 120 * 85 * Math.sin(rad(52)), 4018.86)).toBe(true);
    expect(near((10 * Math.sin(rad(75))) / Math.sin(rad(40)), 15.03)).toBe(true);
    expect(Math.abs((10 * Math.sin(rad(65))) / Math.sin(rad(40)) - 14.1) < 0.01).toBe(true);
    expect(near((Math.acos(0.2) * 180) / Math.PI, 78.46)).toBe(true);
    expect(near(Math.sqrt(148), 12.17)).toBe(true);
    expect(near(0.5 * 48 * Math.sin(rad(120)), 20.78)).toBe(true);
    expect(near(96 * Math.PI, 301.59)).toBe(true);
    expect(near(2 * (Math.asin(0.6) * 180) / Math.PI, 73.74)).toBe(true);
    expect(near(Math.sqrt(3) / 2 - 0.5, 0.366)).toBe(true);
  });

  it('library records sit under Õppevara → Matemaatika', () => {
    const records = mathCurriculumRecords();
    expect(records.map((r) => r.id)).toEqual(ids);
    for (const r of records) {
      expect(subjectOfLevel(r.level)).toBe('ma');
      expect(r.description).toMatch(/Ход занятия/);
    }
  });
});
