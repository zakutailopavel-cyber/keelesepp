import { describe, expect, it } from 'vitest';
import katex from 'katex';
import { KITSAS_10 } from './kitsas10.js';
import { MATH_MODULES, MATH_PROGRAMS } from './sheets.js';
import { buildCourseSheet } from '../courseSheet.js';
import { BLOCKS } from '../../../../worksheet-studio/engine/registry.js';
import { compileExpr } from '../../../../worksheet-studio/engine/mathExpr.js';
import { MATH_TOKEN } from '../../../../worksheet-studio/engine/math.jsx';
import { mathCurriculumRecords } from '../../../../curriculum/mathCurriculum.js';
import { subjectOfLevel } from '../../../../library/libraryModel.js';

const mod = MATH_MODULES.find((m) => m.MODULE.id === 'mk10-module-01');
const ids = Object.keys(mod.LESSONS);
const PHASES = ['discover', 'practice', 'transfer'];
const points = (task) => task.parts.reduce((sum, [, p]) => sum + p, 0);
const isTest = (lesson) => /^Kordamine ja kontrolltöö/.test(lesson.title);

describe('math kitsas grade 10 module (mk10)', () => {
  it('is wired as a program next to mk12', () => {
    expect(MATH_PROGRAMS.map((p) => p.id)).toContain('mk10');
    expect(ids).toHaveLength(KITSAS_10.lessons.length);
    expect(ids.length).toBeGreaterThanOrEqual(24);
    expect(ids[0]).toBe('mk10-001');
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
    for (const lesson of KITSAS_10.lessons) {
      expect(lesson.theory.length, lesson.title).toBeGreaterThanOrEqual(3);
      expect(lesson.ru_hint.length, lesson.title).toBeGreaterThanOrEqual(2);
      lesson.ru_hint.forEach((line) => expect(line, lesson.title).toMatch(/[а-я]/));
      expect(lesson.example.steps.length, lesson.title).toBeGreaterThanOrEqual(2);
      expect(lesson.practice, lesson.title).toHaveLength(4);
      expect(lesson.self.length, lesson.title).toBe(3);
      expect(['I', 'II', 'III']).toContain(lesson.course);
    }
  });

  it('a larger task is 5 or 10 p; a review lesson every 6–8 lessons ends with a 20–30 p test', () => {
    let since = 0;
    for (const lesson of KITSAS_10.lessons) {
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
    expect(isTest(KITSAS_10.lessons.at(-1))).toBe(true);
    expect(KITSAS_10.lessons.filter(isTest)).toHaveLength(3);
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
          expect(Number.isNaN(c.f(Number(b.data.xmin) + 0.5)) && !/sqrt/.test(fn), `${b.id}: ${fn}`).toBe(false);
        }
      }
    }
    expect(graphs).toBeGreaterThanOrEqual(10);
  });

  it('the trigonometric and decimal keys are right (recomputed)', () => {
    const near = (a, b, eps = 0.006) => Math.abs(a - b) < eps;
    const rad = (d) => (d * Math.PI) / 180;
    const deg = (x) => (x * 180) / Math.PI;
    const S = Math.sin;
    const C = Math.cos;
    const T = Math.tan;
    // I kursus
    expect(near(3e8 * 365 * 24 * 3600, 9.46e15, 0.01e15)).toBe(true);
    expect(near(500 / 60, 8.33)).toBe(true);
    expect(near(Math.sqrt(89), 9.43)).toBe(true);
    expect(near((20 + Math.sqrt(420)) / 10, 4.05)).toBe(true);
    expect(near(162 * 0.85, 137.7)).toBe(true);
    expect(near(2 * Math.sqrt(3), 3.46)).toBe(true);
    // II kursus
    expect(near(5 * S(rad(70)), 4.70) && near(5 * C(rad(70)), 1.71)).toBe(true);
    expect(near(deg(Math.asin(0.6)), 36.87)).toBe(true);
    expect(near(12 * S(rad(35)), 6.88) && near(12 * C(rad(35)), 9.83)).toBe(true);
    expect(near(30 * T(rad(40)), 25.17)).toBe(true);
    const slope = Math.atan(0.08);
    expect(near(deg(slope), 4.57)).toBe(true);
    expect(near(1200 * S(slope), 95.69)).toBe(true);
    expect(near(1200 * C(slope), 1196.18)).toBe(true);
    expect(near(S(rad(160)), 0.34) && near(C(rad(250)), -0.34)).toBe(true);
    expect(near(deg(Math.acos(-0.8)), 143.13)).toBe(true);
    expect(near(deg(2), 114.59)).toBe(true);
    expect(near(2 * C(rad(135)), -1.41)).toBe(true);
    expect(near((S(rad(30)) + C(rad(30))) ** 2, 1.87)).toBe(true);
    expect(near(1 / Math.sqrt(5), 0.45) && near(2 / Math.sqrt(5), 0.89)).toBe(true);
    expect(near((7 * S(rad(60))) / S(rad(45)), 8.57) && near((7 * S(rad(75))) / S(rad(45)), 9.56)).toBe(true);
    expect(near((6 * S(rad(105))) / S(rad(30)), 11.59) && near((6 * S(rad(45))) / S(rad(30)), 8.49)).toBe(true);
    const alpha = deg(Math.asin((8 * S(rad(50))) / 10));
    expect(near(alpha, 37.79) && near(180 - 50 - alpha, 92.21)).toBe(true);
    expect(near((200 * S(rad(48))) / S(rad(70)), 158.17)).toBe(true);
    const AP = (500 * S(rad(54))) / S(rad(55));
    expect(near(AP, 493.81) && near((500 * S(rad(71))) / S(rad(55)), 577.13)).toBe(true);
    expect(near(AP * S(rad(71)), 466.91)).toBe(true);
    expect(near(deg(Math.acos(-0.2)), 101.54)).toBe(true);
    expect(near(Math.sqrt(49 + 81 - 126 * C(rad(40))), 5.79)).toBe(true);
    const c = Math.sqrt(144 + 225 - 360 * C(rad(110)));
    expect(near(c, 22.18) && near(deg(Math.asin((12 * S(rad(110))) / c)), 30.55)).toBe(true);
    expect(near(Math.sqrt(129), 11.36)).toBe(true);
    const perHour = Math.sqrt(18 ** 2 + 24 ** 2 - 2 * 18 * 24 * C(rad(75)));
    expect(near(2 * perHour, 52.01) && near(78 / perHour, 3, 0.01)).toBe(true);
    expect(near(Math.sqrt(216), 14.70) && near(24 * Math.sqrt(3), 41.57)).toBe(true);
    expect(near(4 * Math.PI, 12.57) && near(20 * Math.PI, 62.83) && near(0.4 * Math.PI, 1.26)).toBe(true);
    expect(near(3 * Math.PI, 9.42) && near(6 * Math.PI, 18.85) && near(8 + 3 * Math.PI, 17.42) && near(8 * S(rad(135)), 5.66)).toBe(true);
    expect(near(Math.sqrt(36 + 81 - 108 * C(rad(48))), 6.69)).toBe(true);
    expect(near(900 / (3 * Math.PI), 95.49)).toBe(true);
    expect(near(15 * S(rad(28)), 7.04) && near(0.28 / -0.96, -0.29)).toBe(true);
    expect(near(Math.sqrt(100 + 196 - 280 * C(rad(65))), 13.33) && near(70 * S(rad(65)), 63.44)).toBe(true);
    expect(near((9 * S(rad(75))) / S(rad(40)), 13.52) && near(10 * Math.PI, 31.42)).toBe(true);
    // III kursus
    expect(near(Math.sqrt(18), 4.24) && near(Math.sqrt(10), 3.16) && near(4 + Math.sqrt(18) + Math.sqrt(10), 11.41)).toBe(true);
    expect(near(Math.sqrt(26), 5.10) && near(Math.sqrt(13), 3.61) && near(2 * Math.sqrt(89), 18.87)).toBe(true);
    expect(near(deg(Math.acos(14 / (Math.sqrt(29) * 5))), 58.67)).toBe(true);
    expect(near(deg(Math.acos(8 / 17)), 61.93)).toBe(true);
    expect(near(deg(Math.acos(40 / Math.sqrt(40 * 50))), 26.57) && near(deg(Math.atan(0.5)), 26.57)).toBe(true);
    expect(near(deg(Math.atan(3)), 71.57)).toBe(true);
    expect(near(Math.sqrt(4.8 ** 2 + 2.4 ** 2), 5.37)).toBe(true);
    expect(near(6 + Math.sqrt(21), 10.58) && near(6 - Math.sqrt(21), 1.42)).toBe(true);
    expect(near(Math.sqrt(50), 7.07)).toBe(true);
    expect(near(deg(Math.acos(5 / (Math.sqrt(13) * Math.sqrt(17)))), 70.35)).toBe(true);
  });

  it('library records sit under Õppevara → Matemaatika; the three tests are check lessons', () => {
    const records = mathCurriculumRecords().filter((r) => r.id.startsWith('mk10-'));
    expect(records.map((r) => r.id)).toEqual(ids);
    for (const r of records) {
      expect(r.level).toBe('10. klass matemaatika kitsas');
      expect(subjectOfLevel(r.level)).toBe('ma');
      expect(r.description).toMatch(/Ход занятия/);
      expect(r.description).not.toMatch(/государственному экзамену/);
      expect(r.curriculumId).toBe('math-mk10-v1');
    }
    expect(records.filter((r) => r.roadmapKind === 'check').map((r) => r.order)).toEqual(
      KITSAS_10.lessons.map((l, i) => (isTest(l) ? i + 1 : 0)).filter(Boolean),
    );
  });
});
