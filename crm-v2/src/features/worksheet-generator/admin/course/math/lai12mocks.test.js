import { describe, expect, it } from 'vitest';
import katex from 'katex';
import { LAI_12 } from './lai12.js';
import { LAI_12_MOCKS } from './lai12mocks.js';
import { MATH_MODULES } from './sheets.js';
import { buildCourseSheet } from '../courseSheet.js';
import { BLOCKS } from '../../../../worksheet-studio/engine/registry.js';
import { mathCurriculumRecords } from '../../../../curriculum/mathCurriculum.js';
import { subjectOfLevel } from '../../../../library/libraryModel.js';

const mod = MATH_MODULES.find((m) => m.MODULE.id === 'ml12-module-01');
const mockIds = ['ml12-021', 'ml12-022', 'ml12-023'];
const tasksOf = (id, phase) => mod.LESSONS[id][phase].filter((b) => b.type === 'mathtask');
const total = (b) => b.data.parts.reduce((sum, p) => sum + p.points, 0);

describe('math lai mock exams (ml12-021…023)', () => {
  it('come after the 20 topic lessons, three sheets each, level „Lai”', () => {
    expect(LAI_12.mocks).toBe(LAI_12_MOCKS);
    expect(Object.keys(mod.LESSONS).slice(-3)).toEqual(mockIds);
    expect(Object.keys(mod.LESSONS)).toHaveLength(LAI_12.lessons.length + 3);
    for (const id of mockIds) {
      expect(mod.LESSONS[id].mock).toBe(true);
      expect(mod.LESSONS[id].level).toBe('Lai');
      for (const phase of ['discover', 'practice', 'transfer']) {
        const doc = buildCourseSheet(mod, id, phase);
        expect(doc.blocks.length).toBeGreaterThan(0);
        for (const b of doc.blocks) expect(BLOCKS[b.type], `${id} ${b.type}`).toBeTruthy();
      }
    }
  });

  it('each mock is the 2027 format: I osa 5,5,5,5,10,10,10 p and II osa 5 × 10 p = 50 + 50 = 100 p', () => {
    for (const id of mockIds) {
      const p1 = tasksOf(id, 'discover');
      const p2 = tasksOf(id, 'practice');
      expect(p1.map(total), id).toEqual([5, 5, 5, 5, 10, 10, 10]);
      expect(p2.map(total), id).toEqual([10, 10, 10, 10, 10]);
      expect(p1.reduce((s, b) => s + total(b), 0)).toBe(50);
      expect(p2.reduce((s, b) => s + total(b), 0)).toBe(50);
      expect([...p1, ...p2].map((b) => b.data.title)).toEqual([...p1, ...p2].map((b, i) => `${i + 1}. ülesanne (${total(b)} punkti)`));
      expect(tasksOf(id, 'transfer')).toHaveLength(0);
    }
    for (const mock of LAI_12_MOCKS) {
      expect(mock.part1).toHaveLength(7);
      expect(mock.part2).toHaveLength(5);
    }
  });

  it('the mock sheets carry their own phase labels, the lai formula sheet and the self-analysis', () => {
    for (const id of mockIds) {
      expect(buildCourseSheet(mod, id, 'discover').meta.displayLabel).toBe('1 I osa (120 min)');
      expect(buildCourseSheet(mod, id, 'practice').meta.displayLabel).toBe('2 II osa (150 min)');
      const analysis = buildCourseSheet(mod, id, 'transfer');
      expect(analysis.meta.displayLabel).toBe('3 Eneseanalüüs');
      expect(analysis.blocks.some((b) => b.type === 'selfcheck')).toBe(true);
      expect(analysis.blocks.find((b) => b.data.title === 'Minu punktid').data.lines).toMatch(/Kokku: ___ \/ 100 p/);
      const rules = mod.LESSONS[id].discover.find((b) => b.data.title === 'Eksami juhend');
      expect(rules.data.text).toMatch(/laia kursuse valemileht/);
    }
    // the kitsas mocks keep their own formula sheet line
    const kitsas = MATH_MODULES.find((m) => m.MODULE.id === 'mk12-module-01');
    expect(kitsas.LESSONS['mk12-015'].discover[0].data.text).toMatch(/kitsa kursuse valemileht/);
    expect(buildCourseSheet(mod, 'ml12-020', 'transfer').meta.displayLabel).toBe('3 Eksamiülesanne');
  });

  it('a drawing part has a blank grid after its task; triangle and solid tasks have a figure before the task', () => {
    for (const id of mockIds) {
      for (const phase of ['discover', 'practice']) {
        const blocks = mod.LESSONS[id][phase];
        blocks.forEach((b, i) => {
          if (b.type === 'mathtask' && b.data.parts.some((p) => /Joonesta|Skitseeri/.test(p.text))) {
            expect(blocks[i + 1]?.type, b.id).toBe('graph');
            expect(blocks[i + 1].data.blank).toBe(true);
            expect(blocks[i + 1].data.stepY > 0, b.id).toBe(true);
          }
          if (b.type === 'geofigure') {
            expect(['triangle', 'solid']).toContain(b.data.kind);
            expect(blocks[i + 1].type, b.id).toBe('mathtask');
          }
        });
      }
    }
    for (const mock of LAI_12_MOCKS) {
      expect(mock.part1[6].figure.kind).toBe('triangle'); // task 7
      expect(mock.part2[4].figure.kind).toBe('solid'); // task 12
      for (const task of [...mock.part1, ...mock.part2]) if (task.grid) expect(task.grid.stepY === undefined || task.grid.stepY > 0).toBe(true);
    }
  });

  it('every formula renders with KaTeX', () => {
    const bad = [];
    for (const mock of LAI_12_MOCKS) {
      for (const task of [...mock.part1, ...mock.part2]) {
        for (const text of [task.context || '', task.figure?.caption || '', ...task.parts.flatMap((p) => [p[0], p[3]])]) {
          for (const f of text.match(/\$[^$\n]+\$/g) || []) {
            try { katex.renderToString(f.slice(1, -1), { throwOnError: true }); } catch (e) { bad.push(`${f}: ${e.message}`); }
          }
        }
      }
    }
    expect(bad).toEqual([]);
  });

  it('every part has a worked solution; each key form is accepted, a wrong answer rejected', () => {
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

  it('the numeric keys are right (recomputed)', () => {
    const rad = (d) => (d * Math.PI) / 180;
    const deg = (x) => (x * 180) / Math.PI;
    const C = (n, k) => { let v = 1; for (let i = 1; i <= k; i += 1) v = (v * (n - k + i)) / i; return v; };
    const num = (s) => {
      const t = String(s).trim().replace(',', '.').replace(/^[([]|[)\]]$/g, '');
      const frac = /^(-?\d+)\/(\d+)$/.exec(t);
      return frac ? Number(frac[1]) / Number(frac[2]) : Number(t);
    };
    // the key of mock m (1–3), exam task t (1–12), part p (0-based): the first key form that is all numbers
    const key = (m, t, p) => {
      const mock = LAI_12_MOCKS[m - 1];
      const task = [...mock.part1, ...mock.part2][t - 1];
      const forms = String(task.parts[p][2]).split('|').map((f) => f.split(';').map(num));
      return forms.find((f) => f.every(Number.isFinite));
    };
    const check = (m, t, p, values, tol = 0.006) => {
      const got = key(m, t, p);
      const want = [].concat(values);
      expect(got, `mock ${m} task ${t} part ${p}: no numeric key`).toBeTruthy();
      expect(got.length, `mock ${m} task ${t} part ${p}`).toBe(want.length);
      want.forEach((v, i) => expect(Math.abs(got[i] - v) < tol, `mock ${m} task ${t} part ${p}: ${got[i]} ≠ ${v}`).toBe(true));
    };

    // Proovieksam 1
    check(1, 1, 0, (C(5, 3) + C(4, 3) + C(3, 3)) / C(12, 3)); check(1, 1, 1, (5 * 4 * 3) / C(12, 3)); check(1, 1, 2, 1 - C(7, 3) / C(12, 3));
    check(1, 2, 1, [400, 200]); expect(0.2 * 400 + 0.5 * 200).toBeCloseTo(0.3 * 600, 9);
    const s1 = (a, b) => (Math.sqrt(a) / (Math.sqrt(a) - Math.sqrt(b)) - Math.sqrt(b) / (Math.sqrt(a) + Math.sqrt(b))) * ((a - b) / (a + b));
    check(1, 3, 0, s1(7, 3)); expect(Math.abs(s1(2, 11) - 1) < 1e-9).toBe(true);
    check(1, 3, 1, (9 ** 1.5 - 8) / (9 ** 0.5 - 2));
    const q1 = (x) => (x * x - 4 * x - 5) / (x + 2);
    expect([-4.5, -3, -1, 0, 5].every((x) => q1(x) <= 0) && [-1.5, 5.5].every((x) => q1(x) > 0)).toBe(true);
    check(1, 4, 1, [-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5].filter((x) => x !== -2 && q1(x) <= 0).length);
    const f5 = (x) => (x * x - 3) * Math.exp(x);
    check(1, 5, 0, [Math.sqrt(3), -Math.sqrt(3)]);
    const d5 = (x) => (x + 3) * (x - 1) * Math.exp(x);
    check(1, 5, 2, [-3, 1]); expect([d5(-3), d5(1)].every((v) => v === 0)).toBe(true);
    check(1, 5, 4, [Math.max(f5(-4), f5(-3), f5(1), f5(2)), Math.min(f5(-4), f5(-3), f5(1), f5(2))]);
    check(1, 6, 0, [3, -6]); expect([(6 - 3) * (9 + 3), (6 + 6) * (9 - 6)]).toEqual([36, 36]);
    check(1, 6, 1, [2, 3 * 2 ** 7]); check(1, 6, 2, 12 / (1 - 0.5));
    check(1, 6, 3, [...Array(30).keys()].find((n) => 24 * 0.5 ** n < 0.01));
    const AC = (240 * Math.sin(rad(71))) / Math.sin(rad(57));
    check(1, 7, 0, AC); check(1, 7, 1, (240 * Math.sin(rad(52))) / Math.sin(rad(57))); check(1, 7, 2, AC * Math.sin(rad(52)));
    check(1, 7, 3, Math.sqrt(AC ** 2 + 120 ** 2 - 2 * AC * 120 * Math.cos(rad(52))));
    const f8 = (x) => 2 * Math.cos(x) ** 2 + 3 * Math.sin(x) - 3;
    check(1, 8, 1, [Math.PI / 6, Math.PI / 2, (5 * Math.PI) / 6]); expect([Math.PI / 6, Math.PI / 2, (5 * Math.PI) / 6].every((x) => Math.abs(f8(x)) < 1e-9)).toBe(true);
    const d8 = (x) => Math.cos(x) * (3 - 4 * Math.sin(x));
    check(1, 8, 2, [Math.asin(0.75), Math.PI / 2, Math.PI - Math.asin(0.75), (3 * Math.PI) / 2]);
    expect([0.5, 1.2, 2.5].every((x) => Math.abs((f8(x + 1e-6) - f8(x - 1e-6)) / 2e-6 - d8(x)) < 1e-5)).toBe(true);
    check(1, 9, 2, Math.E / 2 - 1);
    check(1, 11, 0, 12 * Math.exp(-1)); check(1, 11, 1, 5 * Math.log(6)); check(1, 11, 2, 5 * Math.log(2)); check(1, 11, 3, -2.4 * Math.exp(-1));
    expect([(6 - 2) ** 2 + (4 - 1) ** 2, (-1 - 2) ** 2 + (-3 - 1) ** 2, 2 * 2 - 3]).toEqual([25, 25, 1]);
    expect([-2.5 + 3, 4 * 6 + 3 * 4 - 36]).toEqual([0.5, 0]);
    check(1, 12, 0, Math.sqrt(169 - 25)); check(1, 12, 1, deg(Math.acos(5 / 13))); check(1, 12, 2, (Math.PI * 25 * 12) / 3);
    check(1, 12, 3, (5 / 13) * 360); check(1, 12, 4, (0.5 * 10 * 12) / 18);

    // Proovieksam 2
    check(2, 1, 0, C(6, 4) * 0.7 ** 4 * 0.3 ** 2); check(2, 1, 1, 6 * 0.7 ** 5 * 0.3 + 0.7 ** 6); check(2, 1, 2, 6 * 0.7);
    check(2, 2, 1, [15, 3]); check(2, 2, 2, 36 / 3); expect([2 * (15 + 3), 3 * (15 - 3)]).toEqual([36, 36]);
    const s2 = (a, b) => (1 / a - 1 / b) / (1 / a ** 2 - 1 / b ** 2);
    expect(Math.abs(s2(3, 7) - 21 / 10) < 1e-9).toBe(true);
    check(2, 3, 1, Math.log2(48) - Math.log2(3) + Math.log(Math.sqrt(27)) / Math.log(3));
    expect(Math.log(4) / Math.log(0.5)).toBeCloseTo(-2, 12);
    expect(4 ** 2 - 3 * 2 ** 2 - 4).toBe(0);
    check(2, 5, 0, 1); check(2, 5, 2, [Math.E, 1 / Math.E]); check(2, 5, 4, Math.exp(1.5));
    const g5 = (x) => Math.log(x) / x;
    expect(g5(Math.E) > g5(Math.E - 0.01) && g5(Math.E) > g5(Math.E + 0.01)).toBe(true);
    check(2, 6, 0, 2 + 14 * 0.5); check(2, 6, 1, ((2 + 9) / 2) * 15); check(2, 6, 2, 2 * 1.1 ** 14);
    check(2, 6, 3, [...Array(40).keys()].map((k) => k + 2).find((n) => 2 * 1.1 ** (n - 1) > 2 + 0.5 * (n - 1)));
    const BC = Math.sqrt(85 ** 2 + 60 ** 2 - 2 * 85 * 60 * Math.cos(rad(110)));
    const S2 = 0.5 * 85 * 60 * Math.sin(rad(110));
    check(2, 7, 0, BC); check(2, 7, 1, deg(Math.asin((60 * Math.sin(rad(110))) / BC))); check(2, 7, 2, S2);
    check(2, 7, 3, (2 * S2) / BC); check(2, 7, 4, (2 * S2) / BC / 1.2);
    const A8 = (x) => Math.sin(x + Math.PI / 6) + Math.sin(x - Math.PI / 6);
    expect([0.3, 1, 2.5].every((x) => Math.abs(A8(x) - Math.sqrt(3) * Math.sin(x)) < 1e-12)).toBe(true);
    check(2, 8, 1, [Math.PI / 3, (2 * Math.PI) / 3]); check(2, 8, 3, Math.sqrt(3) * Math.cos(Math.PI / 3));
    expect([Math.PI / 3, (2 * Math.PI) / 3].every((x) => Math.abs(A8(x) - 1.5) < 1e-9)).toBe(true);
    check(2, 9, 2, 1 / 3); check(2, 9, 3, (512 * Math.PI) / 15);
    const simpson = (f, a, b, n = 1000) => { const h = (b - a) / n; let s = f(a) + f(b); for (let i = 1; i < n; i += 1) s += f(a + i * h) * (i % 2 ? 4 : 2); return (s * h) / 3; };
    expect(Math.abs(Math.PI * simpson((x) => (4 - x * x) ** 2, -2, 2) - (512 * Math.PI) / 15) < 1e-6).toBe(true);
    expect(Math.abs(simpson((x) => -2 * x + 5 - (4 - x * x), 0, 1) - 1 / 3) < 1e-9).toBe(true);
    check(2, 10, 0, [-1, 3]); check(2, 10, 1, [1, 2]);
    check(2, 10, 2, deg(Math.acos((6 * 2 + 2 * 4) / (Math.hypot(6, 2) * Math.hypot(2, 4))))); check(2, 10, 3, Math.abs(6 * 4 - 2 * 2));
    check(2, 11, 0, -1); expect(Math.log2(6 + 2)).toBe(3);
    check(2, 11, 2, [0, 2]); expect([(0 + 2) * (4 - 0), (2 + 2) * (4 - 2)]).toEqual([8, 8]);
    check(2, 11, 3, [1, Math.log2(3)]);
    check(2, 12, 0, (Math.sqrt(3) / 4) * 36 * 8); check(2, 12, 1, Math.sqrt(27 + 64)); check(2, 12, 2, 3 * Math.sqrt(91));
    check(2, 12, 3, deg(Math.atan(8 / (3 * Math.sqrt(3))))); check(2, 12, 4, ((Math.sqrt(3) / 4) * 36 * 8) / 3);

    // Proovieksam 3
    const pairs = [1, 2, 3, 4, 5, 6].flatMap((a) => [1, 2, 3, 4, 5, 6].map((b) => Math.max(a, b)));
    check(3, 1, 0, pairs.filter((x) => x === 6).length / 36); check(3, 1, 1, pairs.filter((x) => x <= 3).length / 36);
    check(3, 1, 2, pairs.reduce((s, x) => s + x, 0) / 36);
    check(3, 2, 1, [2.5, 1.8, 1.6]);
    expect([2.5 + 1.8 + 1.6, 2 * 2.5 + 3 * 1.6, 1.8 + 2 * 1.6].map((x) => Math.round(x * 100) / 100)).toEqual([5.9, 9.8, 5]);
    const s3 = (a) => ((a ** 3 - 8) / (a * a - 4)) / ((a * a + 2 * a + 4) / (a * a + 2 * a));
    expect(Math.abs(s3(5) - 5) < 1e-9 && Math.abs(s3(-3.5) + 3.5) < 1e-9).toBe(true);
    check(3, 3, 1, (2 ** 7 - 2 ** 5) / (3 * 2 ** 4));
    check(3, 4, 0, [5, 10]); expect([5 * 10, 10 * 5]).toEqual([50, 50]);
    check(3, 4, 1, [7.5, Math.hypot(7.5, 7.5)]);
    const f35 = (x) => (x * x + 3) / (x - 1);
    check(3, 5, 0, [0, f35(0)]); check(3, 5, 2, [-1, f35(-1), 3, f35(3)]);
    check(3, 5, 4, [Math.max(f35(2), f35(3), f35(5)), Math.min(f35(2), f35(3), f35(5))]);
    check(3, 6, 0, 8 * (1 / Math.SQRT2) ** 4); check(3, 6, 1, 64 / (1 - 0.5)); check(3, 6, 2, 32 / (1 - 1 / Math.SQRT2));
    check(3, 6, 3, [...Array(30).keys()].map((k) => k + 1).find((n) => 64 * 0.5 ** (n - 1) < 0.1));
    const cosC = (49 + 64 - 81) / (2 * 7 * 8);
    const S3 = 0.5 * 7 * 8 * Math.sin(Math.acos(cosC));
    check(3, 7, 0, deg(Math.acos(cosC))); check(3, 7, 1, S3); check(3, 7, 2, 9 / (2 * Math.sin(Math.acos(cosC))));
    check(3, 7, 3, S3 / 12); check(3, 7, 4, ((S3 - Math.PI * (S3 / 12) ** 2) / S3) * 100);
    const xs8 = [0, (2 * Math.PI) / 3, (4 * Math.PI) / 3, 2 * Math.PI];
    check(3, 8, 0, xs8); expect(xs8.every((x) => Math.abs(Math.cos(2 * x) - Math.cos(x)) < 1e-9)).toBe(true);
    expect([Math.PI, 2.2, 4.1].every((x) => Math.cos(2 * x) > Math.cos(x)) && [1, 2, 4.3, 5].every((x) => Math.cos(2 * x) <= Math.cos(x))).toBe(true);
    check(3, 9, 2, simpson((x) => x / 4 + 1 - Math.sqrt(x), 0, 4, 20000), 0.001); check(3, 9, 2, 2 / 3); check(3, 9, 3, 8 * Math.PI);
    check(3, 10, 2, [2, 1]); expect([2 / 2, -2 * 2 + 5, -2 * -1 + 5]).toEqual([1, 1, 7]);
    check(3, 10, 3, 0.5 * Math.abs(8 * 8 - 4 * 1)); check(3, 10, 4, deg(Math.acos((8 * 1 + 4 * 8) / (Math.hypot(8, 4) * Math.hypot(1, 8)))));
    const k = Math.log(4) / 3;
    check(3, 11, 0, [500, k]); check(3, 11, 1, 500 * Math.exp(5 * k)); check(3, 11, 2, Math.log(200) / k); check(3, 11, 3, k * 2000);
    const H = 5 * Math.SQRT2 * Math.tan(rad(60));
    check(3, 12, 0, H); check(3, 12, 1, (5 * Math.SQRT2) / Math.cos(rad(60))); check(3, 12, 2, deg(Math.atan(H / 5)));
    check(3, 12, 3, 100 + 4 * 0.5 * 10 * Math.sqrt(H * H + 25)); check(3, 12, 4, (100 * H) / 3);
  });

  it('library records: Proovieksam checks under Matemaatika with a Russian lai plan', () => {
    const records = mathCurriculumRecords().filter((r) => mockIds.includes(r.id));
    expect(records.map((r) => r.id)).toEqual(mockIds);
    records.forEach((r, i) => {
      expect(r.title).toBe(`Proovieksam ${i + 1}`);
      expect(r.level).toBe('12. klass matemaatika lai');
      expect(subjectOfLevel(r.level)).toBe('ma');
      expect(r.roadmapKind).toBe('check');
      expect(r.roadmapTag).toBe('Proovieksam');
      expect(r.curriculumId).toBe('math-ml12-v1');
      expect(r.contactMinutes).toBe(270);
      expect(r.description).toMatch(/госэкзамена lai 2027/);
      expect(r.description).toMatch(/120 мин/);
      expect(r.description).toMatch(/150 мин/);
      expect(r.description).toMatch(/лист формул lai/);
      expect(r.description).toMatch(/ml12-001…020/);
      expect(r.description).toMatch(/Всего 100 баллов/);
    });
    // the kitsas mock plan is unchanged
    const kitsas = mathCurriculumRecords().find((r) => r.id === 'mk12-015');
    expect(kitsas.description).toMatch(/госэкзамена kitsas 2027/);
    expect(kitsas.description).toMatch(/лист формул kitsas \(только тригонометрия и таблица производных\)/);
    expect(kitsas.description).toMatch(/mk12-001…014/);
  });
});
