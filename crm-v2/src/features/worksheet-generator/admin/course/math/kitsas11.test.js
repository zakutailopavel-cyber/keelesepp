import { describe, expect, it } from 'vitest';
import katex from 'katex';
import { KITSAS_11 } from './kitsas11.js';
import { MATH_MODULES, MATH_PROGRAMS } from './sheets.js';
import { buildCourseSheet } from '../courseSheet.js';
import { BLOCKS } from '../../../../worksheet-studio/engine/registry.js';
import { compileExpr } from '../../../../worksheet-studio/engine/mathExpr.js';
import { MATH_TOKEN } from '../../../../worksheet-studio/engine/math.jsx';
import { mathCurriculumRecords } from '../../../../curriculum/mathCurriculum.js';
import { subjectOfLevel } from '../../../../library/libraryModel.js';

const mod = MATH_MODULES.find((m) => m.MODULE.id === 'mk11-module-01');
const ids = Object.keys(mod.LESSONS);
const PHASES = ['discover', 'practice', 'transfer'];
const points = (task) => task.parts.reduce((sum, [, p]) => sum + p, 0);
const isTest = (lesson) => /^Kordamine ja kontrolltöö/.test(lesson.title);

describe('math kitsas grade 11 module (mk11)', () => {
  it('is wired as a program after mk10', () => {
    expect(MATH_PROGRAMS.map((p) => p.id)).toContain('mk11');
    expect(MATH_PROGRAMS.findIndex((p) => p.id === 'mk11')).toBeGreaterThan(MATH_PROGRAMS.findIndex((p) => p.id === 'mk10'));
    expect(ids).toHaveLength(KITSAS_11.lessons.length);
    expect(ids.length).toBeGreaterThanOrEqual(24);
    expect(ids[0]).toBe('mk11-001');
    expect(mod.MODULE.phases.transfer.label).toBe('3 Kontrollülesanne');
    expect(mod.MODULE.phases.discover.label).toBe('1 Teooria ja näited');
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

  it('every lesson has theory, a Russian hint, a worked example, 4 practice tasks and a self-check', () => {
    for (const lesson of KITSAS_11.lessons) {
      expect(lesson.theory.length, lesson.title).toBeGreaterThanOrEqual(3);
      expect(lesson.ru_hint.length, lesson.title).toBeGreaterThanOrEqual(2);
      lesson.ru_hint.forEach((line) => expect(line, lesson.title).toMatch(/[а-я]/));
      expect(lesson.example.steps.length, lesson.title).toBeGreaterThanOrEqual(2);
      expect(lesson.practice, lesson.title).toHaveLength(4);
      expect(lesson.self.length, lesson.title).toBe(3);
      expect(['IV', 'V', 'VI']).toContain(lesson.course);
    }
  });

  it('a larger task is 5 or 10 p; a review lesson every 6–8 lessons ends with a 20–30 p test', () => {
    let since = 0;
    for (const lesson of KITSAS_11.lessons) {
      const want = Number(/\((\d+) punkti\)/.exec(lesson.examTask.title)[1]);
      expect(points(lesson.examTask), lesson.title).toBe(want);
      if (isTest(lesson)) {
        expect(want).toBeGreaterThanOrEqual(20);
        expect(want).toBeLessThanOrEqual(30);
        expect(since, lesson.title).toBeGreaterThanOrEqual(6);
        expect(since, lesson.title).toBeLessThanOrEqual(8);
        since = 0;
      } else {
        expect([5, 10], lesson.title).toContain(want);
        since += 1;
      }
    }
    expect(isTest(KITSAS_11.lessons.at(-1))).toBe(true);
    expect(KITSAS_11.lessons.filter(isTest)).toHaveLength(3);
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
    expect(count).toBeGreaterThan(500);
    expect(bad).toEqual([]);
  });

  it('every graph formula can be drawn', () => {
    let graphs = 0;
    for (const id of ids) {
      for (const b of [...mod.LESSONS[id].discover, ...mod.LESSONS[id].transfer].filter((x) => x.type === 'graph')) {
        graphs += 1;
        for (const fn of String(b.data.fns || '').split('\n').filter(Boolean)) {
          const c = compileExpr(fn, b.data.angle === 'deg');
          expect(c.error, `${b.id}: ${fn}`).toBeUndefined();
          expect(Number.isNaN(c.f(Number(b.data.xmin) + 0.5)) && !/sqrt|ln|log/.test(fn), `${b.id}: ${fn}`).toBe(false);
        }
      }
    }
    expect(graphs).toBeGreaterThanOrEqual(10);
  });

  it('every graph has a positive y step (a stepY of 0 drew a grey band)', () => {
    for (const id of ids) {
      for (const b of [...mod.LESSONS[id].discover, ...mod.LESSONS[id].transfer].filter((x) => x.type === 'graph')) {
        expect(Number(b.data.stepY), b.id).toBeGreaterThan(0);
        expect(Number(b.data.step), b.id).toBeGreaterThan(0);
      }
    }
  });

  it('the decimal keys are right (recomputed)', () => {
    const near = (a, b, eps = 0.006) => Math.abs(a - b) < eps;
    const { log: ln, sqrt, PI, E } = Math;
    const deg = (x) => (x * 180) / PI;
    // IV kursus
    expect(near(PI / 16, 0.2, 0.01) && near(25 * PI, 78.54) && near(PI / 24, 0.13)).toBe(true);
    expect(near(5 / 36, 0.14) && near(11 / 12, 0.92) && near(5 / 6, 0.83)).toBe(true);
    expect(near(sqrt(14 / 5), 1.67) && near(sqrt(2), 1.41) && near(sqrt(22), 4.69)).toBe(true);
    expect(near(122 / 30, 4.07) && near(17 / 30, 0.57) && near(1390 / 20, 69.5)).toBe(true);
    const cor = (xs, ys) => {
      const mx = xs.reduce((a, b) => a + b) / xs.length;
      const my = ys.reduce((a, b) => a + b) / ys.length;
      let sxy = 0; let sxx = 0; let syy = 0;
      xs.forEach((x, i) => { sxy += (x - mx) * (ys[i] - my); sxx += (x - mx) ** 2; syy += (ys[i] - my) ** 2; });
      return sxy / sqrt(sxx * syy);
    };
    expect(near(cor([1, 2, 3, 4, 5], [4, 5, 7, 8, 11]), 0.98)).toBe(true);
    expect(near(cor([1, 2, 3, 4], [3, 1, 2, 0]), -0.8)).toBe(true);
    expect(near(cor([10, 15, 20, 25, 30], [20, 34, 30, 50, 52]), 0.93)).toBe(true);
    expect(near(11 / 36, 0.31) && near(5 / 14, 0.36)).toBe(true);
    // V kursus
    expect(near(ln(10) / ln(2), 3.32) && near(ln(20), 3.0) && near(ln(50) / ln(3), 3.56) && near(10 ** 2.5, 316.23)).toBe(true);
    expect(near(-Math.log10(3e-6), 5.52) && near(E ** 2, 7.39) && near(1 / E, 0.37)).toBe(true);
    expect(near(ln(20) / ln(3), 2.73) && near(ln(2) / ln(1.05), 14.21)).toBe(true);
    expect(near(1000 * 1.04 ** 10, 1480.24) && near(2000 * 1.03 ** 5, 2318.55) && near(20000 * 0.85 ** 3, 12282.5)).toBe(true);
    expect(Math.ceil(ln(1.2) / ln(1.02))).toBe(10);
    expect(near(80 * 0.94 ** 5, 58.71) && near(ln(0.5) / ln(0.94), 11.2)).toBe(true);
    expect(Math.ceil(ln(0.25) / ln(0.94))).toBe(23);
    expect(near(deg(Math.asin(0.3)), 17.46) && near(deg(Math.acos(0.8)), 36.87)).toBe(true);
    expect(near(ln(30) / ln(7), 1.75) && near(ln(12) / ln(2), 3.585) && near(5000 * 1.025 ** 8, 6092.01)).toBe(true);
    expect(Math.ceil(ln(1.4) / ln(1.025))).toBe(14);
    // VI kursus
    const seats = (n) => ((40 + 3 * (n - 1)) * n) / 2;
    expect(seats(9) < 300 && seats(10) >= 300).toBe(true);
    expect(near(10 * 1.1 ** 7, 19.49) && near((10 * (1.1 ** 8 - 1)) / 0.1, 114.36)).toBe(true);
    expect(Math.floor(ln(2.5) / ln(1.1)) + 2).toBe(11);
    const cubic = (x) => x ** 3 - 4 * x;
    expect(near(2 / sqrt(3), 1.15) && near(cubic(-2 / sqrt(3)), 3.08)).toBe(true);
    const profit = (x) => -(x ** 3) + 6 * x ** 2 + 15 * x - 20;
    expect([profit(0), profit(5), profit(8)]).toEqual([-20, 80, -28]);
  });

  it('library records sit under Õppevara → Matemaatika; the three tests are check lessons', () => {
    const records = mathCurriculumRecords().filter((r) => r.id.startsWith('mk11-'));
    expect(records.map((r) => r.id)).toEqual(ids);
    for (const r of records) {
      expect(r.level).toBe('11. klass matemaatika kitsas');
      expect(subjectOfLevel(r.level)).toBe('ma');
      expect(r.description).toMatch(/Ход занятия/);
      expect(r.description).not.toMatch(/государственному экзамену/);
      expect(r.curriculumId).toBe('math-mk11-v1');
    }
    expect(records.filter((r) => r.roadmapKind === 'check').map((r) => r.order)).toEqual(
      KITSAS_11.lessons.map((l, i) => (isTest(l) ? i + 1 : 0)).filter(Boolean),
    );
  });
});
