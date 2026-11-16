import { describe, expect, it } from 'vitest';
import katex from 'katex';
import { LAI_11 } from './lai11.js';
import { MATH_MODULES, MATH_PROGRAMS } from './sheets.js';
import { buildCourseSheet } from '../courseSheet.js';
import { BLOCKS } from '../../../../worksheet-studio/engine/registry.js';
import { compileExpr } from '../../../../worksheet-studio/engine/mathExpr.js';
import { MATH_TOKEN } from '../../../../worksheet-studio/engine/math.jsx';
import { mathCurriculumRecords } from '../../../../curriculum/mathCurriculum.js';
import { subjectOfLevel } from '../../../../library/libraryModel.js';

const mod = MATH_MODULES.find((m) => m.MODULE.id === 'ml11-module-01');
const ids = Object.keys(mod.LESSONS);
const PHASES = ['discover', 'practice', 'transfer'];
const COURSES = ['VI', 'VII', 'VIII', 'IX', 'X'];
const points = (task) => task.parts.reduce((sum, [, p]) => sum + p, 0);
const isTest = (lesson) => /^Kordamine ja kontrolltöö/.test(lesson.title);

describe('math lai grade 11 module (ml11)', () => {
  it('is wired as a program with its own ids, short level and course-test phase label', () => {
    expect(MATH_PROGRAMS.map((p) => p.id)).toContain('ml11');
    expect(ids).toHaveLength(LAI_11.lessons.length);
    expect(ids.length).toBeGreaterThanOrEqual(35);
    expect(ids[0]).toBe('ml11-001');
    expect(ids.at(-1)).toBe(`ml11-${String(LAI_11.lessons.length).padStart(3, '0')}`);
    expect(mod.MODULE.phases.transfer.label).toBe('3 Kontrollülesanne');
    expect(mod.MODULE.phases.discover.label).toBe('1 Teooria ja näited');
    for (const id of ids) expect(mod.LESSONS[id].level).toBe('Lai 11');
  });

  it('every lesson builds three sheets of known blocks', () => {
    for (const id of ids) {
      for (const phase of PHASES) {
        const doc = buildCourseSheet(mod, id, phase);
        expect(doc.blocks.length, `${id} ${phase}`).toBeGreaterThan(0);
        for (const b of doc.blocks) expect(BLOCKS[b.type], `${id} ${b.type}`).toBeTruthy();
      }
    }
  });

  it('lesson ids and block ids are unique across all math modules', () => {
    const lessonIds = MATH_MODULES.flatMap((m) => Object.keys(m.LESSONS));
    expect(new Set(lessonIds).size).toBe(lessonIds.length);
    const all = MATH_MODULES.flatMap((m) => Object.keys(m.LESSONS).flatMap((id) => PHASES.flatMap((p) => m.LESSONS[id][p].map((b) => b.id))));
    expect(new Set(all).size).toBe(all.length);
  });

  it('every lesson has theory marked valemileht / pähe, a Russian hint naming the lai sheet, a worked example, 4 tasks and a self-check', () => {
    for (const lesson of LAI_11.lessons) {
      expect(lesson.theory.length, lesson.title).toBeGreaterThanOrEqual(3);
      for (const line of lesson.theory) expect(line, lesson.title).toMatch(/\*(pähe|valemilehel)\*$/);
      expect(lesson.ru_hint.length, lesson.title).toBeGreaterThanOrEqual(2);
      lesson.ru_hint.forEach((line) => expect(line, lesson.title).toMatch(/[а-я]/));
      expect(lesson.ru_hint.some((h) => /лист[еа]? формул lai/.test(h)), lesson.title).toBe(true);
      expect(lesson.example.steps.length, lesson.title).toBeGreaterThanOrEqual(2);
      expect(lesson.practice, lesson.title).toHaveLength(4);
      expect(lesson.self.length, lesson.title).toBe(3);
      expect(COURSES).toContain(lesson.course);
    }
    // the courses come in order VI → X
    const order = LAI_11.lessons.map((l) => COURSES.indexOf(l.course));
    expect(order).toEqual([...order].sort((a, b) => a - b));
  });

  it('only the trigonometry and derivative lines are marked as on the lai formula sheet', () => {
    for (const lesson of LAI_11.lessons) {
      for (const line of lesson.theory.filter((l) => /\*valemilehel\*$/.test(l))) {
        expect(line, lesson.title).toMatch(/sin|cos|tan|tuletis/);
      }
    }
  });

  it('a larger task is 5 or 10 p; a review lesson every 6–8 lessons ends with a 25 p test, one per course', () => {
    let since = 0;
    for (const lesson of LAI_11.lessons) {
      const want = Number(/\((\d+) punkti\)/.exec(lesson.examTask.title)[1]);
      expect(points(lesson.examTask), lesson.title).toBe(want);
      if (isTest(lesson)) {
        expect(want, lesson.title).toBe(25);
        expect(lesson.examTask.title).toBe('Kontrolltöö (25 punkti)');
        expect(since, lesson.title).toBeGreaterThanOrEqual(6);
        expect(since, lesson.title).toBeLessThanOrEqual(8);
        since = 0;
      } else {
        expect([5, 10], lesson.title).toContain(want);
        expect(lesson.examTask.title).toBe(`Kontrollülesanne (${want} punkti)`);
        since += 1;
      }
    }
    expect(isTest(LAI_11.lessons.at(-1))).toBe(true);
    expect(LAI_11.lessons.filter(isTest).map((l) => l.course)).toEqual(COURSES);
  });

  it('every part has a worked solution; every key form is accepted and a wrong answer rejected', () => {
    const { score } = BLOCKS.mathtask;
    for (const id of ids) {
      for (const b of [...mod.LESSONS[id].practice, ...mod.LESSONS[id].transfer].filter((x) => x.type === 'mathtask')) {
        b.data.parts.forEach((p) => expect(p.solution, `${b.id}: ${p.text}`).toBeTruthy());
        const most = Math.max(...b.data.parts.map((p) => String(p.answer).split('|').length));
        for (let form = 0; form < most; form += 1) {
          const right = Object.fromEntries(b.data.parts.map((p, i) => {
            const forms = String(p.answer).split('|');
            return [`p${i}`, forms[Math.min(form, forms.length - 1)]];
          }));
          const res = score(b.data, (k) => right[k], b);
          expect(res.every((r) => r.ok), `${b.id} form ${form}`).toBe(true);
        }
        for (const wrongAnswer of ['123456', '-987', '(99;99)']) {
          const wrong = score(b.data, () => wrongAnswer, b);
          expect(wrong.some((r) => r.ok), `${b.id} ${wrongAnswer}`).toBe(false);
        }
      }
    }
  });

  it('the practice sheets are auto-checked: at least 3 of 4 tasks have a scored part', () => {
    for (const id of ids) {
      const scored = mod.LESSONS[id].practice.filter((b) => b.data.parts.some((p) => String(p.answer).trim()));
      expect(scored.length, id).toBeGreaterThanOrEqual(3);
    }
  });

  it('every $…$ formula on the sheets renders in KaTeX', () => {
    const bad = [];
    let count = 0;
    const walk = (v) => {
      if (typeof v === 'string') {
        for (const m of v.match(MATH_TOKEN) || []) {
          count += 1;
          const tex = m.replace(/^\$\$?|\$\$?$/g, '');
          try { katex.renderToString(tex, { throwOnError: true }); } catch (e) { bad.push(`${tex} :: ${e.message}`); }
        }
      } else if (v && typeof v === 'object') Object.values(v).forEach(walk);
    };
    walk(mod.LESSONS);
    expect(count).toBeGreaterThan(800);
    expect(bad).toEqual([]);
  });

  it('every graph formula can be drawn and every graph has a positive x and y step', () => {
    let graphs = 0;
    for (const id of ids) {
      for (const b of [...mod.LESSONS[id].discover, ...mod.LESSONS[id].transfer].filter((x) => x.type === 'graph')) {
        graphs += 1;
        expect(Number(b.data.stepY), b.id).toBeGreaterThan(0);
        expect(Number(b.data.step), b.id).toBeGreaterThan(0);
        for (const fn of String(b.data.fns || '').split('\n').filter(Boolean)) {
          const c = compileExpr(fn, b.data.angle === 'deg');
          expect(c.error, `${b.id}: ${fn}`).toBeUndefined();
          expect(Number.isNaN(c.f(Number(b.data.xmin) + 0.5)) && !/sqrt|ln|log/.test(fn), `${b.id}: ${fn}`).toBe(false);
        }
      }
    }
    expect(graphs).toBeGreaterThanOrEqual(25);
  });

  it('the decimal keys are right (recomputed)', () => {
    const near = (a, b, eps = 0.006) => Math.abs(a - b) < eps;
    const { log: ln, sqrt, PI, E, asin, acos, atan } = Math;
    const C = (n, k) => { let c = 1; for (let i = 1; i <= k; i += 1) c = (c * (n - k + i)) / i; return c; };
    const binom = (n, k, p) => C(n, k) * p ** k * (1 - p) ** (n - k);
    const cor = (xs, ys) => {
      const mx = xs.reduce((a, b) => a + b) / xs.length;
      const my = ys.reduce((a, b) => a + b) / ys.length;
      let sxy = 0; let sxx = 0; let syy = 0;
      xs.forEach((x, i) => { sxy += (x - mx) * (ys[i] - my); sxx += (x - mx) ** 2; syy += (ys[i] - my) ** 2; });
      return sxy / sqrt(sxx * syy);
    };
    // VI kursus
    expect(near(9 * PI / 100, 0.28) && near(15 / 36, 0.42) && near(11 / 36, 0.31)).toBe(true);
    expect([C(7, 2) * 2, C(9, 3), C(12, 10), C(12, 4), C(5, 2) * C(7, 2), C(12, 4) - C(7, 4)]).toEqual([42, 84, 66, 495, 210, 460]);
    expect([C(20, 3), C(16, 3), 4 * C(16, 2)]).toEqual([1140, 560, 480]);
    expect(near(560 / 1140, 0.49) && near(480 / 1140, 0.42) && near(1 - 560 / 1140, 0.51)).toBe(true);
    expect(near(0.9 * 0.8 * 0.3 + 0.9 * 0.2 * 0.7 + 0.1 * 0.8 * 0.7, 0.398, 1e-9)).toBe(true);
    expect(near(sqrt(1.1 - 0.01), 1.04) && near(sqrt(1.8 - 1.44), 0.6) && near(sqrt(3.5 - 1.7 ** 2), 0.78)).toBe(true);
    expect(near(binom(5, 2, 0.25), 0.26) && near(binom(5, 4, 0.8), 0.41) && near(binom(5, 5, 0.8), 0.33)).toBe(true);
    expect(near(binom(5, 4, 0.8) + binom(5, 5, 0.8), 0.74) && near(sqrt(0.9), 0.95) && near(0.9 ** 10, 0.35)).toBe(true);
    expect(near(binom(6, 1, 1 / 6), 0.4) && near(1 - (5 / 6) ** 6, 0.67) && near(binom(6, 3, 0.5), 0.31)).toBe(true);
    expect(near(binom(5, 0, 0.2), 0.33) && near(binom(5, 2, 0.2), 0.2) && near(1 - binom(5, 0, 0.2) - binom(5, 1, 0.2), 0.26) && near(sqrt(0.8), 0.89)).toBe(true);
    expect(near(2 * 0.8413 - 1, 0.68) && near(2000 * (1 - 0.9772), 46, 0.5) && near(2 * 0.6915 - 1, 0.38)).toBe(true);
    expect(near(1.96 * sqrt(0.24 / 400), 0.048, 0.001) && near(0.6 - 0.048, 0.55) && near(0.6 + 0.048, 0.65)).toBe(true);
    expect(near(sqrt(10 / 5), 1.41) && near(498 - 1.96 * 0.5, 497.02) && near(498 + 1.96 * 0.5, 498.98)).toBe(true);
    expect(near(cor([1, 2, 3, 4, 5], [2, 3, 5, 4, 6]), 0.9) && near(cor([1, 2, 3], [5, 3, 1]), -1)).toBe(true);
    expect(near(cor([2, 4, 6, 8], [10, 14, 15, 21]), 0.97) && near(cor([1, 2, 3, 4, 5], [8, 8, 6, 5, 3]), -0.97)).toBe(true);
    expect(near(cor([1, 2, 3, 4, 5], [52, 60, 58, 70, 75]), 0.95) && near(cor([1, 2, 3], [3, 5, 7]), 1)).toBe(true);
    // VII kursus
    const sumA = (a1, d, n) => ((2 * a1 + (n - 1) * d) * n) / 2;
    expect([sumA(7, 4, 25), sumA(-20, 3, 7), sumA(20, 2, 15), sumA(4, 3, 10), sumA(4, 5, 12)]).toEqual([1375, -77, 510, 175, 378]);
    expect(sumA(4, 3, 17) < 500 && sumA(4, 3, 18) > 500).toBe(true);
    expect([(994 - 105) / 7 + 1, ((105 + 994) * 128) / 2]).toEqual([128, 70336]);
    expect([(2 * (3 ** 6 - 1)) / 2, 6 * (2 ** 7 - 1), 5 * (2 ** 6 - 1), 2 * 3 ** 5, 5 * 2 ** 5]).toEqual([728, 762, 315, 486, 160]);
    expect(near(10 * 0.6 ** 3, 2.16) && near(10 + 2 * (6 / 0.4), 40) && near(45 / 99, 5 / 11)).toBe(true);
    expect(near(1.1 ** 10, 2.59) && near(1.001 ** 1000, 2.72) && near(37 / 12, 3.08)).toBe(true);
    expect(near(sqrt(1e6 + 1e3) - 1e3, 0.5, 0.001)).toBe(true);
    // VIII kursus
    expect(near(5000 * 1.035 ** 6, 6146.28) && near(2000 * 1.04 ** 5, 2433.31) && near(2000 * 1.04 ** 10, 2960.49)).toBe(true);
    expect(near(18000 * 0.88 ** 3, 12266.5) && near(100 * (1 - 0.88 ** 3), 31.85) && near(40000 * 1.02 ** 5, 44163, 0.5)).toBe(true);
    expect(Math.ceil(ln(1.25) / ln(1.02))).toBe(12);
    expect(near(100 * (2 ** (1 / 3) - 1), 26, 0.01)).toBe(true);
    expect(500 * 2 ** 8).toBe(128000);
    expect(near(8000 * 1.025 ** 4, 8830.5)).toBe(true);
    expect(Math.ceil(ln(1.25) / ln(1.025))).toBe(10);
    expect(near(100 * (1.125 ** 0.25 - 1), 2.99)).toBe(true);
    expect(near(E ** 1.5, 4.48) && near(ln(20) / ln(3), 2.73) && near(ln(50) / ln(7), 2.01) && near(ln(10) / ln(0.5), -3.32)).toBe(true);
    expect(near(ln(10) / ln(2), 3.32) && near(ln(5) / ln(5 / 3), 3.15) && near(5 * ln(3), 5.49) && near(E - 2, 0.72)).toBe(true);
    expect(near(6000 * 1.03 ** 5, 6955.64) && near(ln(30) / ln(5), 2.11) && near(1000 * 1.05 ** 3, 1157.63) && near(100 * (1.05 ** 3 - 1), 15.76)).toBe(true);
    expect(near(Math.log10(4 + 3) + Math.log10(4 - 3), Math.log10(7), 1e-9)).toBe(true);
    // IX kursus
    expect(near(asin(0.3), 0.3) && near(acos(0.8), 0.64) && near(acos(-0.5), 2 * PI / 3, 1e-9) && near(atan(sqrt(3)), PI / 3, 1e-9)).toBe(true);
    expect(near(Math.tan(5 * PI / 6), -0.58) && near(2 * Math.sin(7 * PI / 6) + 1, 0, 1e-9) && near(2 * Math.sin(11 * PI / 6) + 1, 0, 1e-9)).toBe(true);
    for (const x of [PI / 6, PI / 2, 5 * PI / 6]) expect(near(Math.cos(2 * x) + 3 * Math.sin(x), 2, 1e-9)).toBe(true);
    for (const x of [PI / 2, 7 * PI / 6, 11 * PI / 6]) expect(near(2 * Math.sin(x) ** 2 - Math.sin(x) - 1, 0, 1e-9)).toBe(true);
    for (const x of [PI / 6, PI / 2, 5 * PI / 6]) expect(near(Math.sin(2 * x), Math.cos(x), 1e-9)).toBe(true);
    expect(near(1 / (sqrt(9) + 3), 1 / 6, 1e-9) && near(-(PI ** 2), -9.87) && near(-2 / E, -0.74) && near(4 * E, 10.87)).toBe(true);
    // X kursus
    expect(near(atan(0.25) * 180 / PI, 14.04) && near(-1 / E, -0.37) && near(4 / E ** 2, 0.54) && near(1 / E, 0.37)).toBe(true);
    expect(near(sqrt(12), 3.46) && near(3 * (2 / 3) ** 4 - 4 * (2 / 3) ** 3, -16 / 27, 1e-9) && near(-16 / 27, -0.59)).toBe(true);
    const f = (x) => x ** 4 - 2 * x ** 2 + 3;
    expect([f(-2), f(-1), f(0), f(1), f(3)]).toEqual([11, 2, 3, 2, 66]);
    const profit = (x) => -2 * x ** 3 + 30 * x ** 2 - 96 * x + 50;
    expect([profit(0), profit(2), profit(8), profit(10)]).toEqual([50, -38, 178, 90]);
    const V = (x) => x * (30 - 2 * x) ** 2;
    expect(V(5)).toBe(2000);
    expect(near(sqrt(1.75), 1.32) && near(sqrt(7) / 2, 1.32)).toBe(true);
    const g = (x) => x ** 3 - 12 * x + 1;
    expect([g(-2), g(2)]).toEqual([17, -15]);
  });

  it('library records sit under Õppevara → Matemaatika with a lai course plan; the five tests are check lessons', () => {
    const records = mathCurriculumRecords().filter((r) => r.id.startsWith('ml11-'));
    expect(records.map((r) => r.id)).toEqual(ids);
    for (const r of records) {
      expect(r.level).toBe('11. klass matemaatika lai');
      expect(subjectOfLevel(r.level)).toBe('ma');
      expect(r.description).toMatch(/Ход занятия/);
      expect(r.description).toMatch(/широкая математика \(lai\)/);
      expect(r.description).toMatch(/лист формул lai/);
      expect(r.description).not.toMatch(/государственному экзамену/);
      expect(r.curriculumId).toBe('math-ml11-v1');
    }
    expect(records.filter((r) => r.roadmapKind === 'check').map((r) => r.order)).toEqual(
      LAI_11.lessons.map((l, i) => (isTest(l) ? i + 1 : 0)).filter(Boolean),
    );
    expect(records.filter((r) => r.roadmapKind === 'check').every((r) => r.roadmapTag === 'Kontrolltöö')).toBe(true);
    // the kitsas course plan is unchanged
    const mk11 = mathCurriculumRecords().find((r) => r.id === 'mk11-001');
    expect(mk11.description).toMatch(/узкая математика \(kitsas\)/);
    expect(mk11.description).not.toMatch(/лист формул/);
  });
});
