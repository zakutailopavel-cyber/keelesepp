import { describe, expect, it } from 'vitest';
import katex from 'katex';
import { KITSAS_12 } from './kitsas12.js';
import { KITSAS_12_MOCKS } from './kitsas12mocks.js';
import { MATH_MODULES, MATH_GOALS } from './sheets.js';
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
    expect(ids).toHaveLength(KITSAS_12.lessons.length + KITSAS_12_MOCKS.length);
    expect(ids[0]).toBe('mk12-001');
    expect(ids.slice(-3)).toEqual(['mk12-015', 'mk12-016', 'mk12-017']);
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
    const records = mathCurriculumRecords().filter((r) => r.id.startsWith('mk12-'));
    expect(records.map((r) => r.id)).toEqual(ids);
    for (const r of records) {
      expect(subjectOfLevel(r.level)).toBe('ma');
      expect(r.description).toMatch(/Ход/);
    }
    const mocks = records.filter((r) => r.roadmapKind === 'check');
    expect(mocks.map((r) => r.id)).toEqual(['mk12-015', 'mk12-016', 'mk12-017']);
    for (const r of mocks) {
      expect(r.level).toBe('12. klass matemaatika kitsas');
      expect(r.roadmapTag).toBe('Proovieksam');
      expect(r.description).toMatch(/120 мин/);
      expect(r.description).toMatch(/150 мин/);
      expect(r.description).toMatch(/по шагам/);
    }
    expect(records.filter((r) => r.roadmapKind === 'theme')).toHaveLength(KITSAS_12.lessons.length);
  });

  it('the exam goal reads right in the first person', () => {
    expect(MATH_GOALS.g_exam).toBe('Õpilane lahendab eksamiülesande samm-sammult.');
  });
});

describe('math kitsas mock exams (mk12-015…017)', () => {
  const mockIds = ['mk12-015', 'mk12-016', 'mk12-017'];
  const tasksOf = (id, phase) => mod.LESSONS[id][phase].filter((b) => b.type === 'mathtask');
  const total = (b) => b.data.parts.reduce((sum, p) => sum + p.points, 0);

  it('each mock is the 2027 format: I osa 5,5,5,5,10,10,10 p and II osa 5 × 10 p = 100 p', () => {
    for (const id of mockIds) {
      const p1 = tasksOf(id, 'discover');
      const p2 = tasksOf(id, 'practice');
      expect(p1.map(total), id).toEqual([5, 5, 5, 5, 10, 10, 10]);
      expect(p2.map(total), id).toEqual([10, 10, 10, 10, 10]);
      expect([...p1, ...p2].map((b) => b.data.title)).toEqual([...p1, ...p2].map((b, i) => `${i + 1}. ülesanne (${total(b)} punkti)`));
      expect([...p1, ...p2].reduce((s, b) => s + total(b), 0)).toBe(100);
      expect(tasksOf(id, 'transfer')).toHaveLength(0);
    }
    for (const mock of KITSAS_12_MOCKS) expect(mock.part1.length + mock.part2.length).toBe(12);
  });

  it('the mock sheets carry their own phase labels; a topic lesson keeps the module ones', () => {
    for (const id of mockIds) {
      expect(buildCourseSheet(mod, id, 'discover').meta.displayLabel).toBe('1 I osa (120 min)');
      expect(buildCourseSheet(mod, id, 'practice').meta.displayLabel).toBe('2 II osa (150 min)');
      const analysis = buildCourseSheet(mod, id, 'transfer');
      expect(analysis.meta.displayLabel).toBe('3 Eneseanalüüs');
      expect(analysis.blocks.some((b) => b.type === 'selfcheck')).toBe(true);
      const grades = analysis.blocks.find((b) => b.type === 'notice' && b.data.title === 'Hindamine');
      expect(grades.data.lines).toMatch(/orienteeruv/);
    }
    expect(buildCourseSheet(mod, 'mk12-001', 'discover').meta.displayLabel).toBe('1 Teooria ja näited');
    expect(buildCourseSheet(mod, 'mk12-014', 'transfer').meta.displayLabel).toBe('3 Eksamiülesanne');
  });

  it('a drawing part has a blank grid right after its task', () => {
    for (const id of mockIds) {
      for (const phase of ['discover', 'practice']) {
        const blocks = mod.LESSONS[id][phase];
        blocks.forEach((b, i) => {
          if (b.type !== 'mathtask' || !b.data.parts.some((p) => /Joonesta|Skitseeri/.test(p.text))) return;
          expect(blocks[i + 1]?.type, b.id).toBe('graph');
          expect(blocks[i + 1].data.blank).toBe(true);
        });
      }
    }
  });

  it('the mock numeric keys are right (recomputed)', () => {
    const near = (a, b) => Math.abs(a - b) < 0.006;
    const rad = (d) => (d * Math.PI) / 180;
    const deg = (x) => (x * 180) / Math.PI;
    const key = (id, phase, n, part) => tasksOf(id, phase)[n].data.parts[part].answer.split('|')[0];
    const num = (s) => Number(String(s).replace(',', '.'));
    const check = (id, phase, n, part, value, tol = 0.006) => expect(Math.abs(num(key(id, phase, n, part)) - value) < tol, `${id} ${phase} ${n + 1}${'abcdef'[part]}`).toBe(true);
    // Proovieksam 1
    check('mk12-015', 'discover', 1, 0, 0.16 * 1.25 * 0.8);
    check('mk12-015', 'discover', 1, 1, ((380 * 0.16 * 1.25 - 450 * 0.16) / (450 * 0.16)) * 100);
    expect(near((12 / 20) * (11 / 19), 33 / 95) && near((2 * 12 * 8) / 380, 48 / 95)).toBe(true);
    expect([4, -8].every((x) => (x + 5) * (x - 1) === 27) && 2 ** 6 - 2 ** 3 === 56).toBe(true);
    expect([4, -1].map((x) => Math.sqrt(x + 5) === x - 1)).toEqual([true, false]);
    check('mk12-015', 'discover', 5, 1, Math.hypot(6, 2));
    expect(-6 * -2 + -2 * 6).toBe(0);
    const S = (n) => (n * (36 + 3 * (n - 1))) / 2;
    expect([18 + 19 * 3, S(20), S(13) < 500, S(14) >= 500, 18 + 3 * 10 < 50, 18 + 3 * 11 >= 50]).toEqual([75, 930, true, true, true, true]);
    const c = Math.sqrt(144 + 81 - 216 * Math.cos(rad(64)));
    check('mk12-015', 'practice', 1, 0, c);
    check('mk12-015', 'practice', 1, 1, deg(Math.asin((9 * Math.sin(rad(64))) / c)));
    check('mk12-015', 'practice', 1, 2, 54 * Math.sin(rad(64)));
    const f1 = (x) => x ** 3 - 3 * x ** 2 - 9 * x + 5;
    expect([f1(-1), f1(3), f1(1)]).toEqual([10, -22, -6]);
    expect(near(-27 / 3 + (3 * 9) / 2, 4.5)).toBe(true);
    check('mk12-015', 'practice', 4, 0, 3.6 * Math.PI);
    check('mk12-015', 'practice', 4, 1, 0.8 * 3.6 * Math.PI * 1000, 0.5);
    check('mk12-015', 'practice', 4, 2, 2 * Math.PI * 1.2 * 3.7, 0.01);
    expect(Math.ceil((2 * Math.PI * 1.2 * 3.7) / 8)).toBe(4);
    // Proovieksam 2
    check('mk12-016', 'discover', 0, 1, 9 * 27 ** (-2 / 3) + Math.sqrt(0.16));
    check('mk12-016', 'discover', 2, 0, 120000 * 1.06 ** 4);
    expect(Math.ceil(Math.log(5 / 3) / Math.log(1.06))).toBe(9);
    expect([124 / 8, (16 + 18) / 2]).toEqual([15.5, 17]);
    expect([near(3 * 2.7 + 2 * 1.6, 11.3), near(2 * 2.7 + 5 * 1.6, 13.4)]).toEqual([true, true]);
    check('mk12-016', 'discover', 4, 2, 3 * 2.7 * 1.1 + 2 * 1.6 * 0.75);
    expect([2 * Math.cos(rad(120)) + 1, 2 * Math.cos(rad(240)) + 1].every((y) => Math.abs(y) < 1e-9)).toBe(true);
    expect([2 * 2.8 - 4, -0.5 * 2.8 + 3].every((y) => near(y, 1.6))).toBe(true);
    check('mk12-016', 'discover', 6, 4, Math.sqrt(1.2 ** 2 + 0.6 ** 2));
    check('mk12-016', 'practice', 0, 0, 2400 * 1.15 ** 5, 0.5);
    check('mk12-016', 'practice', 0, 1, (2400 * (1.15 ** 6 - 1)) / 0.15, 0.5);
    expect(1 + Math.ceil(Math.log(10000 / 2400) / Math.log(1.15))).toBe(12);
    expect(3 * (4800 + 1800)).toBe(19800);
    check('mk12-016', 'practice', 1, 0, deg(Math.acos((25 + 64 - 49) / 80)));
    check('mk12-016', 'practice', 1, 1, 20 * Math.sin(rad(60)));
    check('mk12-016', 'practice', 1, 2, deg(Math.acos(1 / 7)));
    const f2 = (x) => -(x ** 3) + 6 * x ** 2 - 9 * x + 2;
    expect([f2(1), f2(3), f2(0)]).toEqual([-2, 2, 2]);
    const F = (x) => x ** 3 / 3 - x ** 2 - 3 * x;
    expect(near(-(F(3) - F(-1)), 32 / 3)).toBe(true);
    expect([Math.hypot(4, 3), 4 * 0.5 * 6 * 5, (36 * 4) / 3]).toEqual([5, 60, 48]);
    check('mk12-016', 'practice', 4, 3, deg(Math.atan(4 / 3)));
    // Proovieksam 3
    expect(near((4 ** 1.5 * 2 ** -2) / Math.cbrt(8), 1)).toBe(true);
    expect([(2 * 2 + 6) / (2 - 1), Math.sqrt(3 * 8 + 1) - (8 - 3)]).toEqual([10, 0]);
    expect([160 * 0.75 * 0.9, ((160 - 108) / 160) * 100, ((108 - 80) / 80) * 100]).toEqual([108, 32.5, 35]);
    expect([(9 + 14 + 15) / 25, 12 / 25]).toEqual([1.52, 0.48]);
    check('mk12-017', 'discover', 4, 2, deg(Math.acos(24 / 40)));
    expect(near(180 / 60 - 180 / 75, 0.6)).toBe(true);
    const M = (n) => (n * (100 + 5 * (n - 1))) / 2;
    expect([50 + 11 * 5, M(12), M(20) < 2000, M(21) >= 2000]).toEqual([105, 930, true, true]);
    check('mk12-017', 'discover', 6, 3, (50 * (1.08 ** 12 - 1)) / 0.08);
    expect([20 - 18 * Math.cos(rad(120)), 20 - 18 * Math.cos(rad(240))].every((v) => near(v, 29))).toBe(true);
    const AP = (50 * Math.sin(rad(63))) / Math.sin(rad(45));
    check('mk12-017', 'practice', 1, 1, AP);
    check('mk12-017', 'practice', 1, 2, (50 * Math.sin(rad(72))) / Math.sin(rad(45)));
    check('mk12-017', 'practice', 1, 3, AP * Math.sin(rad(72)));
    check('mk12-017', 'practice', 1, 4, 25 * AP * Math.sin(rad(72)), 0.5);
    const f3 = (x) => 2 * x ** 3 + 3 * x ** 2 - 12 * x - 4;
    expect([f3(-2), f3(1), f3(2), f3(-3)]).toEqual([16, -11, 0, 5]);
    expect(near(-125 / 3 + 125 / 2, 125 / 6)).toBe(true);
    const h = 2 * Math.tan(rad(50));
    const l = 2 / Math.cos(rad(50));
    check('mk12-017', 'practice', 4, 0, h);
    check('mk12-017', 'practice', 4, 1, l);
    check('mk12-017', 'practice', 4, 2, (Math.PI * 4 * h) / 3);
    check('mk12-017', 'practice', 4, 3, Math.PI * 2 * l);
    check('mk12-017', 'practice', 4, 4, Math.PI * 2 * l * 1.15);
  });

  it('every mock formula renders with KaTeX', () => {
    const bad = [];
    for (const mock of KITSAS_12_MOCKS) {
      for (const task of [...mock.part1, ...mock.part2]) {
        for (const text of [task.context || '', ...task.parts.flatMap((p) => [p[0], p[3]])]) {
          for (const f of text.match(/\$[^$\n]+\$/g) || []) {
            try { katex.renderToString(f.slice(1, -1), { throwOnError: true }); } catch (e) { bad.push(`${f}: ${e.message}`); }
          }
        }
      }
    }
    expect(bad).toEqual([]);
  });

  it('every mock part has a worked solution; each key form is accepted, a wrong answer rejected', () => {
    const { score } = BLOCKS.mathtask;
    for (const id of mockIds) {
      for (const b of [...tasksOf(id, 'discover'), ...tasksOf(id, 'practice')]) {
        b.data.parts.forEach((p) => expect(p.solution, `${b.id}: ${p.text}`).toBeTruthy());
        const forms = Math.max(...b.data.parts.map((p) => String(p.answer).split('|').length));
        for (let alt = 0; alt < forms; alt += 1) {
          const right = Object.fromEntries(b.data.parts.map((p, i) => { const a = String(p.answer).split('|'); return [`p${i}`, a[Math.min(alt, a.length - 1)]]; }));
          expect(score(b.data, (k) => right[k], b).every((x) => x.ok), `${b.id} form ${alt}`).toBe(true);
        }
        expect(score(b.data, () => '123456', b).some((x) => x.ok), b.id).toBe(false);
        expect(score(b.data, () => '-7,5', b).some((x) => x.ok), b.id).toBe(false);
      }
    }
  });
});
