import { describe, expect, it } from 'vitest';
import katex from 'katex';
import { LAI_10 } from './lai10.js';
import { MATH_MODULES, MATH_PROGRAMS } from './sheets.js';
import { buildCourseSheet } from '../courseSheet.js';
import { BLOCKS } from '../../../../worksheet-studio/engine/registry.js';
import { compileExpr } from '../../../../worksheet-studio/engine/mathExpr.js';
import { MATH_TOKEN } from '../../../../worksheet-studio/engine/math.jsx';
import { solveTriangle } from '../../../../worksheet-studio/engine/blocks/geofigureModel.js';
import { mathCurriculumRecords } from '../../../../curriculum/mathCurriculum.js';
import { subjectOfLevel } from '../../../../library/libraryModel.js';

const mod = MATH_MODULES.find((m) => m.MODULE.id === 'ml10-module-01');
const ids = Object.keys(mod.LESSONS);
const PHASES = ['discover', 'practice', 'transfer'];
const points = (task) => task.parts.reduce((sum, [, p]) => sum + p, 0);
const isTest = (lesson) => /^Kordamine ja kontrolltöö/.test(lesson.title);
const graphsOf = (id) => [...mod.LESSONS[id].discover, ...mod.LESSONS[id].transfer].filter((b) => b.type === 'graph');

describe('math lai grade 10 module (ml10)', () => {
  it('is wired as a program next to the other math programs', () => {
    expect(MATH_PROGRAMS.map((p) => p.id)).toEqual(expect.arrayContaining(['mk12', 'mk10', 'mk11', 'ml12', 'ml10']));
    expect(ids).toHaveLength(LAI_10.lessons.length);
    expect(ids.length).toBeGreaterThanOrEqual(35);
    expect(ids[0]).toBe('ml10-001');
    expect(ids.at(-1)).toBe(`ml10-${String(LAI_10.lessons.length).padStart(3, '0')}`);
    expect(mod.MODULE.phases.transfer.label).toBe('3 Kontrollülesanne');
    expect(mod.MODULE.phases.discover.label).toBe('1 Teooria ja näited');
    expect(mod.MODULE.level).toBe('Lai 10');
  });

  it('every lesson builds three sheets of known blocks', () => {
    for (const id of ids) {
      for (const phase of PHASES) {
        const doc = buildCourseSheet(mod, id, phase);
        expect(doc.blocks.length, `${id} ${phase}`).toBeGreaterThan(0);
        for (const b of doc.blocks) expect(BLOCKS[b.type], `${id} ${b.type}`).toBeTruthy();
      }
    }
    expect(buildCourseSheet(mod, 'ml10-001', 'transfer').meta.displayLabel).toBe('3 Kontrollülesanne');
  });

  it('lesson ids and block ids are unique across all math modules', () => {
    const lessonIds = MATH_MODULES.flatMap((m) => Object.keys(m.LESSONS));
    expect(new Set(lessonIds).size).toBe(lessonIds.length);
    const all = MATH_MODULES.flatMap((m) => Object.values(m.LESSONS).flatMap((l) => PHASES.flatMap((p) => l[p].map((b) => b.id))));
    expect(new Set(all).size).toBe(all.length);
  });

  it('every lesson has marked theory, a Russian hint on the formula sheet, a worked example, 4 tasks and a self-check', () => {
    for (const lesson of LAI_10.lessons) {
      expect(lesson.theory.length, lesson.title).toBeGreaterThanOrEqual(3);
      for (const line of lesson.theory) expect(line, lesson.title).toMatch(/\*(pähe|valemilehel)\*$/);
      expect(lesson.ru_hint.length, lesson.title).toBeGreaterThanOrEqual(2);
      lesson.ru_hint.forEach((line) => expect(line, lesson.title).toMatch(/[а-я]/));
      expect(lesson.ru_hint.some((h) => /лист[еа]? формул/.test(h)), lesson.title).toBe(true);
      expect(lesson.example.steps.length, lesson.title).toBeGreaterThanOrEqual(2);
      expect(lesson.practice, lesson.title).toHaveLength(4);
      expect(lesson.self.length, lesson.title).toBe(3);
      expect(['I', 'II', 'III', 'IV', 'V']).toContain(lesson.course);
    }
    // the valemileht holds trigonometry only: algebra, vectors and lines are never marked as on the sheet
    for (const lesson of LAI_10.lessons.filter((l) => ['I', 'II'].includes(l.course))) {
      for (const line of lesson.theory) expect(line, lesson.title).toMatch(/\*pähe\*$/);
    }
  });

  it('a larger task is 5 or 10 p; every course ends with a 25 p test after 6–8 lessons', () => {
    let since = 0;
    for (const lesson of LAI_10.lessons) {
      const want = Number(/\((\d+) punkti\)/.exec(lesson.examTask.title)[1]);
      expect(points(lesson.examTask), lesson.title).toBe(want);
      lesson.examTask.parts.forEach((p) => expect(Number.isInteger(p[1]) && p[1] > 0, `${lesson.title}: ${p[0]}`).toBe(true));
      if (isTest(lesson)) {
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
    expect(isTest(LAI_10.lessons.at(-1))).toBe(true);
    expect(LAI_10.lessons.filter(isTest).map((l) => l.course)).toEqual(['I', 'II', 'III', 'IV', 'V']);
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
          expect(score(b.data, (k) => right[k], b).every((x) => x.ok), `${b.id} form ${form}`).toBe(true);
        }
        for (const wrongAnswer of ['123456', '-987', '(99;99)', '-7,5']) {
          expect(score(b.data, () => wrongAnswer, b).some((x) => x.ok), `${b.id} ${wrongAnswer}`).toBe(false);
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
    expect(count).toBeGreaterThan(1500);
    expect(bad).toEqual([]);
  });

  it('no formula lost its backslashes (a plain string instead of r`…` turns \\angle into „angle”)', () => {
    const lost = /(^|[^\\a-zA-Z])(frac|dfrac|circ|angle|cdot|alpha|beta|gamma|infty|overrightarrow|varnothing|setminus|Rightarrow|sqrt\{|begin\{|text\{)/;
    const bad = [];
    const walk = (v) => {
      if (typeof v === 'string') (v.match(MATH_TOKEN) || []).filter((m) => lost.test(m)).forEach((m) => bad.push(m));
      else if (v && typeof v === 'object') Object.values(v).forEach(walk);
    };
    walk(mod.LESSONS);
    expect(bad).toEqual([]);
  });

  it('every graph formula can be drawn and every graph has positive steps', () => {
    let graphs = 0;
    for (const id of ids) {
      for (const b of graphsOf(id)) {
        graphs += 1;
        expect(b.data.step > 0 && b.data.stepY > 0, b.id).toBe(true);
        expect(b.data.xmin < b.data.xmax && b.data.ymin < b.data.ymax, b.id).toBe(true);
        for (const fn of String(b.data.fns || '').split('\n').filter(Boolean)) {
          const c = compileExpr(fn, b.data.angle === 'deg');
          expect(c.error, `${b.id}: ${fn}`).toBeUndefined();
          expect(Number.isFinite(c.f((b.data.xmin + b.data.xmax) / 2 + 0.123)) || /sqrt/.test(fn), `${b.id}: ${fn}`).toBe(true);
        }
      }
    }
    expect(graphs).toBeGreaterThanOrEqual(15);
  });

  it('a drawing part has a blank grid after its task; every figure is a consistent geometry block', () => {
    for (const id of ids) {
      const blocks = mod.LESSONS[id].transfer;
      blocks.forEach((b, i) => {
        if (b.type !== 'mathtask' || !b.data.parts.some((p) => /Joonesta/.test(p.text))) return;
        expect(blocks[i + 1]?.type, b.id).toBe('graph');
        expect(blocks[i + 1].data.blank).toBe(true);
      });
    }
    const figures = ids.flatMap((id) => PHASES.flatMap((p) => mod.LESSONS[id][p])).filter((b) => b.type === 'geofigure');
    expect(figures.length).toBeGreaterThanOrEqual(6);
    for (const f of figures) {
      expect(['triangle', 'circle', 'polygon'], f.id).toContain(f.data.kind);
      if (f.data.kind === 'triangle') expect(solveTriangle(f.data).inconsistent, f.id).toBe(false);
    }
  });

  it('the numeric keys are right (recomputed)', () => {
    const rad = (d) => (d * Math.PI) / 180;
    const deg = (x) => (x * 180) / Math.PI;
    const num = (s) => {
      const t = String(s).trim().replace(',', '.');
      const frac = /^(-?\d+)\/(\d+)$/.exec(t);
      return frac ? Number(frac[1]) / Number(frac[2]) : Number(t);
    };
    // the key of practice task t (1-based; 'e' = the larger task), part p (0-based); several answers split by ;
    const key = (n, t, p) => {
      const lesson = LAI_10.lessons[n - 1];
      const task = t === 'e' ? lesson.examTask : lesson.practice[t - 1];
      // the first key form that is all numbers (√ and π forms come with a decimal form too)
      const forms = String(task.parts[p][2]).split('|').map((f) => f.split(';').map((x) => num(x)));
      return forms.find((f) => f.every(Number.isFinite)) || forms[0];
    };
    let checked = 0;
    const check = (n, t, p, values, tol = 0.006) => {
      checked += 1;
      const got = key(n, t, p);
      const want = [].concat(values);
      expect(got.length, `${n}.${t}.${p}`).toBe(want.length);
      want.forEach((v, i) => expect(Math.abs(got[i] - v) < tol, `lesson ${n} task ${t} part ${p}: ${got[i]} ≠ ${v}`).toBe(true));
    };
    check(1, 'e', 0, 34 + 29 - (60 - 8)); check(1, 'e', 2, (34 - 11) + (29 - 11));
    check(2, 2, 2, 195 / 90); check(2, 'e', 0, 81 / 99);
    check(3, 2, 0, Math.sqrt(10) - 3, 0.01); check(3, 2, 2, Math.sqrt(3) - 1, 0.01);
    check(4, 2, 3, 5.97e24 / 7.35e22); check(4, 3, 3, 13 - 4 * Math.sqrt(3), 0.01); check(4, 4, 0, 6 / Math.sqrt(3), 0.01);
    check(4, 4, 1, 4 / (Math.sqrt(5) - 1), 0.01); check(4, 4, 2, Math.cbrt(54) - Math.cbrt(16), 0.01);
    check(4, 'e', 1, (5e6 * 5e6 * 7.5e-6) / 1000); check(4, 'e', 2, (5e6 * 5e6 * 7.5e-6) / 1000 / 40000);
    check(5, 1, 0, 32 ** 0.6); check(5, 1, 1, 0.001 ** (-2 / 3)); check(5, 1, 2, (27 / 64) ** (-1 / 3)); check(5, 1, 3, 9 ** 1.5 * 81 ** -0.25);
    check(5, 4, 0, 1 / (Math.sqrt(3) - Math.sqrt(2)) - 1 / (Math.sqrt(3) + Math.sqrt(2)), 0.01); check(5, 4, 1, Math.sqrt(7 + 4 * Math.sqrt(3)), 0.01);
    { const A5 = (a) => (a - 9) / (Math.sqrt(a) + 3) + (a * Math.sqrt(a) - 27) / (a + 3 * Math.sqrt(a) + 9); check(5, 'e', 3, A5(16)); expect(Math.abs(A5(25) - 4) < 1e-9).toBe(true); }
    check(6, 4, 1, 1001 ** 3 - 999 ** 3, 1);
    { const B6 = (a) => ((a + 2) / (a - 2) - (a - 2) / (a + 2)) / ((4 * a) / (a * a - 4)); check(6, 'e', 2, B6(3.7)); }
    check(7, 1, 1, (42 / 56) * 100); check(7, 1, 2, 21 / 0.35); check(7, 2, 2, (1 - 0.85 * 1.15) * 100); check(7, 3, 0, 37.2 / 1.24);
    check(7, 3, 2, 100 / 24); check(7, 4, 0, Math.round(48000 * 0.985 ** 5)); check(7, 4, 1, (1 - 0.985 ** 10) * 100);
    check(7, 'e', 2, 60 * 1.45 * 0.7 * 0.8); check(7, 'e', 3, (1 - 0.7 * 0.8) * 100); check(7, 'e', 4, (1 - (60 * 1.45 * 0.56) / 60) * 100);
    check(8, 2, 0, 12 / 99); check(8, 'e', 3, 33 / 90); check(8, 'e', 5, 0.25 ** -1.5 + 27 ** (2 / 3) - 0.5 ** -3);
    check(8, 'e', 6, 6 / (Math.sqrt(7) - 1), 0.01); check(8, 'e', 9, (1.08 * 1.05 - 1) * 100); check(8, 'e', 10, (1.2 / (1.08 * 1.05) - 1) * 100);
    // lesson 9
    check(9, 2, 2, (12 + 3 * 3 + 2 * 1) / (3 - 2));
    check(9, 3, 0, (5 - 3) / (5 - 2));
    check(9, 4, 1, 1001 ** 2 - 999 ** 2);
    check(9, 'e', 0, (5 + 3) / (5 ** 2 - 9)); check(9, 'e', 4, 3 + 1 / 0.25);
    // lesson 10
    check(10, 1, 0, [(7 + Math.sqrt(49 - 24)) / 4, (7 - Math.sqrt(49 - 24)) / 4]); check(10, 1, 2, [0, -4 / 5]);
    check(10, 2, 2, 5 ** 2 - 2 * -14); check(10, 2, 3, 5 / -14);
    check(10, 3, 1, [-((2 + Math.sqrt(3)) + (2 - Math.sqrt(3))), (2 + Math.sqrt(3)) * (2 - Math.sqrt(3))]);
    check(10, 4, 1, -(9 + 6)); check(10, 4, 2, -2 - 3);
    check(10, 'e', 0, 1 / 4); check(10, 'e', 1, 24 / 4); check(10, 'e', 2, 4 / (2 * 4));
    check(10, 'e', 4, [(4 + Math.sqrt(16 - 12)) / 6, (4 - Math.sqrt(16 - 12)) / 6]);
    // lesson 11
    check(11, 1, 1, (12 + 2) / (4 - 3));
    check(11, 2, 0, [Math.sqrt(10), -Math.sqrt(10)]); check(11, 2, 1, -2);
    check(11, 3, 0, [2, 0.5]); check(11, 3, 1, [1 / (2 - 1), 1 / (0.5 - 1)]);
    check(11, 4, 1, (48 + Math.sqrt(48 ** 2 + 400)) / 10);
    check(11, 'e', 1, [(17 + Math.sqrt(289 - 120)) / 2, (17 - Math.sqrt(289 - 120)) / 2]); check(11, 'e', 2, 15 - 5); check(11, 'e', 3, (6 / 10) * 100);
    // lesson 12
    check(12, 1, 1, [4, -4]); check(12, 1, 2, (-2) ** 3 + 2);
    check(12, 2, 1, (9 + Math.sqrt(81 - 32)) / 2);
    check(12, 4, 0, 9.81 * (2 / (2 * Math.PI)) ** 2);
    check(12, 'e', 0, (3 + Math.sqrt(9 + 16)) / 2); check(12, 'e', 1, 2 ** 2 - 3);
    // lesson 13
    check(13, 1, 1, [3, -3, 1, -1]); check(13, 2, 0, [-4, 2 / 3]); check(13, 3, 0, [(1 - 7) / 2, (7 + 1) / 2]); check(13, 4, 2, 4);
    check(13, 'e', 2, (1 + 1) / 2); check(13, 'e', 3, [3, -3]);
    // lesson 14
    check(14, 4, 1, 25 - 26 / 2); check(14, 4, 2, (39 - 2 * 12) / 3); check(14, 4, 3, 13 - 5);
    check(14, 'e', 1, [1, -3, 4]); check(14, 'e', 2, [1.5, 1.5 ** 2 - 3 * 1.5 + 4]);
    // lesson 15
    check(15, 3, 1, [1 / 3, 1 / 2.5]);
    check(15, 4, 0, [(17 + Math.sqrt(289 - 240)) / 2, (17 - Math.sqrt(289 - 240)) / 2]); check(15, 4, 1, 34);
    check(15, 'e', 1, 2 * 8 - 4); check(15, 'e', 2, 16); check(15, 'e', 3, 96 / 12 + 96 / 16);
    // lesson 16
    check(16, 1, 0, 0.5); check(16, 2, 0, (11 + Math.sqrt(121 - 96)) / 2); check(16, 2, 1, [2, -4 / 3]);
    check(16, 4, 1, -(3 + 12 / 3));
    check(16, 'e', 1, [(5 + 7) / 6, (5 - 7) / 6]); check(16, 'e', 2, [8, -8]); check(16, 'e', 3, -9); check(16, 'e', 4, 1);
    check(16, 'e', 5, [-2, 3]); check(16, 'e', 7, [(14 - Math.sqrt(196 - 192)) / 2, (14 + Math.sqrt(196 - 192)) / 2]);
    // III kursus (17–24)
    check(17, 'e', 1, 16.5 / 0.9); check(17, 'e', 2, [13 / 1.15, 23 / 1.15]);
    expect(Math.abs((-5.5) / 3 - (-8) / 4 - 1 / 6) < 1e-9).toBe(true); // example: x = -4,5 is the bound
    check(18, 'e', 3, 10 * (20 - 10));
    expect([4 * 16, 20 * 4 - 16]).toEqual([64, 64]);
    check(20, 'e', 0, -(-1 + 14 - 24)); check(20, 'e', 4, [7, -49 + 98 - 24]);
    check(21, 1, 3, deg(Math.atan(5 / 12))); check(21, 2, 0, 0.25 + 1); check(21, 2, 2, 3 - 1 / 3);
    check(21, 3, 0, deg(Math.asin(0.6))); check(21, 3, 1, deg(Math.atan(2))); check(21, 4, 0, 5 * Math.SQRT2);
    check(21, 'e', 0, 6 * Math.sin(rad(70))); check(21, 'e', 1, deg(Math.acos(0.3)));
    check(22, 1, 2, 1 + (0.8 / 0.6) ** 2); check(22, 2, 0, 1 / (1 + 4));
    check(22, 'e', 0, Math.sqrt(1 - 25 / 169)); check(22, 'e', 2, (12 - 5) / (12 + 5)); check(22, 'e', 5, deg(Math.acos(5 / 13)));
    expect(Math.abs(Math.sqrt(1 - 0.28 ** 2) - 0.96) < 1e-9).toBe(true);
    check(23, 1, 0, 15 * Math.sin(rad(38))); check(23, 1, 1, 15 * Math.cos(rad(38)));
    check(23, 2, 0, Math.sqrt(130)); check(23, 2, 1, deg(Math.atan(7 / 9))); check(23, 2, 2, 63 / Math.sqrt(130));
    check(23, 3, 0, deg(Math.asin(21 / 300))); check(23, 3, 1, (100 * 21) / Math.sqrt(300 ** 2 - 21 ** 2));
    check(23, 4, 1, 2 * deg(Math.atan(5 / 12)));
    const h23 = 60 * Math.tan(rad(35));
    check(23, 'e', 0, h23); check(23, 'e', 1, h23 - 60 * Math.tan(rad(28))); check(23, 'e', 2, h23 / Math.tan(rad(20)));
    check(23, 'e', 3, Math.hypot(h23, 25)); check(23, 'e', 4, deg(Math.atan(h23 / 25)));
    check(24, 3, 0, 12 / 13); check(24, 3, 1, 5 / 12);
    check(24, 4, 0, 20 * Math.sin(rad(25))); check(24, 4, 1, 20 * Math.cos(rad(25)));
    check(24, 'e', 6, [0.8, 0.8 / 0.6]); check(24, 'e', 8, deg(Math.asin(120 / 450))); check(24, 'e', 9, Math.sqrt(450 ** 2 - 120 ** 2));
    // IV kursus (lessons 25–32)
    check(25, 1, 0, (3 * Math.PI) / 4); check(25, 1, 1, (7 * Math.PI) / 6); check(25, 1, 2, Math.PI / 10);
    check(25, 2, 1, deg(1.2)); check(25, 3, 1, deg(1.5)); check(25, 3, 2, (10 * 15) / 2);
    check(25, 4, 0, (2 * Math.PI) / 3); check(25, 4, 1, (12 * 2 * Math.PI) / 3); check(25, 4, 2, (144 / 2) * ((2 * Math.PI) / 3));
    check(25, 'e', 0, (16 * 1.2) / 2); check(25, 'e', 2, 8 * Math.sin(0.6)); check(25, 'e', 3, 9.6 - 8 * Math.sin(1.2)); check(25, 'e', 4, 4.8 + 8 * Math.sin(0.6));
    check(26, 1, 0, -12 / 13); check(26, 1, 1, 5 / 13);
    check(26, 2, 0, [deg(Math.acos(0.4)), 360 - deg(Math.acos(0.4))]); check(26, 2, 1, [deg(Math.atan(-2)) + 180, deg(Math.atan(-2)) + 360]);
    check(26, 2, 2, [deg(Math.asin(0.5)), 180 - deg(Math.asin(0.5))]);
    check(26, 3, 0, -Math.sqrt(1 - (5 / 13) ** 2)); check(26, 3, 1, (5 / 13) / -Math.sqrt(1 - (5 / 13) ** 2));
    check(26, 'e', 0, 1 / Math.sqrt(1 + 9 / 16)); check(26, 'e', 1, -0.75 * 0.8); check(26, 'e', 2, 360 - deg(Math.atan(0.75)));
    check(26, 'e', 3, (2 * -0.6 - 0.8) / (-0.6 + 3 * 0.8));
    check(27, 1, 0, Math.sin(rad(240))); check(27, 1, 1, Math.cos(rad(315))); check(27, 1, 2, Math.tan(rad(300))); check(27, 1, 3, Math.sin(rad(-150)));
    check(27, 2, 0, Math.cos(rad(1140))); check(27, 2, 1, Math.sin(rad(-405))); check(27, 2, 2, Math.tan(rad(1200)));
    check(27, 3, 0, Math.sin((5 * Math.PI) / 6)); check(27, 3, 1, Math.cos((4 * Math.PI) / 3)); check(27, 3, 2, Math.tan((7 * Math.PI) / 4));
    check(27, 'e', 0, Math.sin(rad(120)) * Math.cos(rad(330)));
    check(27, 'e', 1, (Math.sin(rad(120)) * Math.cos(rad(330)) - Math.tan(rad(225))) / Math.cos(rad(240)));
    check(28, 1, 0, Math.sin(rad(75))); check(28, 1, 1, Math.cos(rad(105))); check(28, 1, 2, Math.tan(rad(105)));
    check(28, 2, 0, Math.sin(Math.asin(0.6) - Math.acos(5 / 13))); check(28, 2, 1, Math.cos(Math.asin(0.6) + Math.acos(5 / 13)));
    check(28, 2, 2, Math.tan(Math.asin(0.6) - Math.acos(5 / 13)));
    check(28, 3, 1, Math.cos(rad(70)) * Math.cos(rad(10)) + Math.sin(rad(70)) * Math.sin(rad(10)));
    check(28, 3, 2, Math.sin(rad(50)) * Math.cos(rad(20)) - Math.cos(rad(50)) * Math.sin(rad(20)));
    check(28, 3, 3, (Math.tan(rad(25)) + Math.tan(rad(20))) / (1 - Math.tan(rad(25)) * Math.tan(rad(20))));
    check(28, 4, 1, Math.sin(rad(90)) * Math.sin(rad(30)));
    check(28, 'e', 0, Math.tan(Math.atan(1 / 2) + Math.atan(1 / 3))); check(28, 'e', 1, deg(Math.atan(1 / 2) + Math.atan(1 / 3)));
    check(28, 'e', 2, Math.sin(Math.atan(1 / 2))); check(28, 'e', 3, Math.cos(Math.atan(1 / 2) - Math.atan(1 / 3)));
    check(29, 1, 0, Math.sin(2 * (Math.PI + Math.acos(5 / 13)))); check(29, 1, 1, Math.cos(2 * (Math.PI + Math.acos(5 / 13))));
    check(29, 1, 2, Math.tan(2 * (Math.PI + Math.acos(5 / 13))));
    check(29, 2, 0, 2 * Math.sin(rad(15)) * Math.cos(rad(15))); check(29, 2, 1, Math.cos(rad(22.5)) ** 2 - Math.sin(rad(22.5)) ** 2);
    check(29, 2, 2, 1 - 2 * Math.sin(rad(75)) ** 2); check(29, 2, 3, (2 * Math.tan(rad(15))) / (1 - Math.tan(rad(15)) ** 2));
    // sin α + cos α = 1/3 in quadrant II: sin α = (1 + √17)/6, cos α = (1 − √17)/6
    check(29, 'e', 0, 2 * ((1 + Math.sqrt(17)) / 6) * ((1 - Math.sqrt(17)) / 6)); check(29, 'e', 1, ((1 + Math.sqrt(17)) / 6) * ((1 - Math.sqrt(17)) / 6));
    check(29, 'e', 2, (1 - Math.sqrt(17)) / 6 - (1 + Math.sqrt(17)) / 6); check(29, 'e', 3, ((1 - Math.sqrt(17)) / 6) ** 2 - ((1 + Math.sqrt(17)) / 6) ** 2);
    check(30, 1, 0, (12 * Math.sin(rad(35))) / Math.sin(rad(65))); check(30, 1, 1, (12 * Math.sin(rad(80))) / Math.sin(rad(65)));
    check(30, 1, 2, 12 / (2 * Math.sin(rad(65))));
    check(30, 2, 0, 10 / (2 * Math.sin(rad(30)))); check(30, 2, 1, 20 * Math.sin(rad(45)));
    check(30, 4, 0, (500 * Math.sin(rad(48))) / Math.sin(rad(70))); check(30, 4, 1, (500 * Math.sin(rad(62))) / Math.sin(rad(70)));
    check(30, 4, 2, ((500 * Math.sin(rad(48))) / Math.sin(rad(70))) * Math.sin(rad(62)));
    check(30, 'e', 0, (8 * Math.sin(rad(42))) / 6);
    check(30, 'e', 1, [deg(Math.asin((8 * Math.sin(rad(42))) / 6)), 180 - deg(Math.asin((8 * Math.sin(rad(42))) / 6))]);
    check(30, 'e', 2, [(6 * Math.sin(Math.PI - rad(42) - Math.asin((8 * Math.sin(rad(42))) / 6))) / Math.sin(rad(42)),
    (6 * Math.sin(Math.asin((8 * Math.sin(rad(42))) / 6) - rad(42))) / Math.sin(rad(42))]);
    check(30, 'e', 3, 6 / (2 * Math.sin(rad(42))));
    check(31, 1, 0, Math.sqrt(25 + 64 - 80 * Math.cos(rad(60)))); check(31, 1, 1, 0.5 * 5 * 8 * Math.sin(rad(60)));
    check(31, 1, 2, (2 * 0.5 * 5 * 8 * Math.sin(rad(60))) / 7);
    check(31, 2, 0, deg(Math.acos((16 + 25 - 49) / 40))); check(31, 2, 2, Math.sqrt(8 * 4 * 3 * 1));
    check(31, 3, 0, Math.sqrt(136 - 120 * Math.cos(rad(50)))); check(31, 3, 1, Math.sqrt(136 + 120 * Math.cos(rad(50)))); check(31, 3, 2, 60 * Math.sin(rad(50)));
    check(31, 4, 2, Math.sqrt(21 * 8 * 7 * 6));
    check(31, 'e', 0, Math.sqrt(120 ** 2 + 90 ** 2 - 2 * 120 * 90 * Math.cos(rad(75)))); check(31, 'e', 1, 0.5 * 120 * 90 * Math.sin(rad(75)), 0.5);
    check(31, 'e', 2, deg(Math.acos((120 ** 2 + (120 ** 2 + 90 ** 2 - 2 * 120 * 90 * Math.cos(rad(75))) - 90 ** 2) / (2 * 120 * Math.sqrt(120 ** 2 + 90 ** 2 - 2 * 120 * 90 * Math.cos(rad(75)))))));
    check(31, 'e', 3, (120 * 90 * Math.sin(rad(75))) / Math.sqrt(120 ** 2 + 90 ** 2 - 2 * 120 * 90 * Math.cos(rad(75))));
    check(32, 1, 0, (108 * Math.PI) / 180); check(32, 1, 1, deg(2.5)); check(32, 2, 0, Math.cos(rad(-240))); check(32, 2, 1, Math.sin(rad(135)));
    check(32, 3, 0, Math.sin(rad(15))); check(32, 4, 0, Math.sqrt(72 - 72 * Math.cos(rad(120)))); check(32, 4, 1, 18 * Math.sin(rad(120)));
    check(32, 'e', 0, (2 * 15) / 25); check(32, 'e', 2, Math.sin(Math.PI + Math.acos(0.6))); check(32, 'e', 3, Math.tan(Math.PI + Math.acos(0.6)));
    check(32, 'e', 4, Math.sin(2 * (Math.PI + Math.acos(0.6)))); check(32, 'e', 5, Math.cos(2 * (Math.PI + Math.acos(0.6))));
    check(32, 'e', 6, [deg(Math.atan(2.5)), deg(Math.atan(2.5)) + 180], 0.06); check(32, 'e', 7, Math.cos(rad(75)));
    check(32, 'e', 9, Math.sqrt(81 + 144 - 216 * Math.cos(rad(50)))); check(32, 'e', 10, 54 * Math.sin(rad(50)));
    check(32, 'e', 11, (10 * Math.sin(rad(75))) / Math.sin(rad(40))); check(32, 'e', 12, 10 / (2 * Math.sin(rad(40))));
    // V kursus (lessons 33–40)
    check(33, 2, 2, [5 / 13, -12 / 13]);
    check(33, 4, 2, Math.sqrt(50));
    check(34, 1, 2, Math.sqrt(58));
    check(34, 4, 1, Math.sqrt(17));
    check(35, 1, 2, Math.sqrt(65));
    check(35, 2, 1, deg(Math.acos(5 / Math.sqrt(50))));
    check(35, 'e', 0, 16 / Math.sqrt(40 * 32));
    check(35, 'e', 1, Math.sqrt(1 - 16 ** 2 / (40 * 32)));
    check(35, 'e', 2, 0.5 * Math.sqrt(40) * Math.sqrt(32) * Math.sqrt(1 - 16 ** 2 / (40 * 32)));
    check(35, 'e', 3, deg(Math.acos(16 / Math.sqrt(40 * 32))));
    check(36, 1, 2, 180 + deg(Math.atan(-3)));
    check(36, 3, 0, 2 / 3);
    check(36, 4, 2, 2 / Math.sqrt(3));
    check(37, 3, 0, deg(Math.atan(Math.abs((-3 - 2) / (1 + 2 * -3)))));
    check(37, 3, 1, deg(Math.atan(Math.abs((-0.5 - 3) / (1 + 3 * -0.5)))));
    check(37, 4, 1, 2 / 3);
    check(37, 'e', 3, Math.hypot(1 - 3.2, 6 - 1.6));
    check(37, 'e', 4, 0.5 * Math.hypot(8, 4) * Math.hypot(1 - 3.2, 6 - 1.6), 0.01);
    check(38, 'e', 2, [2 + Math.sqrt(24), 2 - Math.sqrt(24)]);
    check(39, 4, 0, [Math.sqrt(36 / 64), -Math.sqrt(36 / 64)]);
    check(40, 2, 1, Math.hypot(6, 2));
    check(40, 'e', 3, deg(Math.acos(3 / (Math.sqrt(10) * Math.sqrt(13)))));
    expect(checked).toBeGreaterThanOrEqual(150);
  });

  it('library records sit under Õppevara → Matemaatika as the lai school course; the five tests are check lessons', () => {
    const records = mathCurriculumRecords().filter((r) => r.id.startsWith('ml10-'));
    expect(records.map((r) => r.id)).toEqual(ids);
    for (const r of records) {
      expect(r.level).toBe('10. klass matemaatika lai');
      expect(subjectOfLevel(r.level)).toBe('ma');
      expect(r.description).toMatch(/Ход занятия/);
      expect(r.description).toMatch(/широкая математика \(lai\)/);
      expect(r.description).toMatch(/лист формул lai/);
      expect(r.description).not.toMatch(/государственному экзамену/);
      expect(r.curriculumId).toBe('math-ml10-v1');
      expect(r.contactMinutes).toBe(90);
    }
    const checks = records.filter((r) => r.roadmapKind === 'check');
    expect(checks.map((r) => r.order)).toEqual(LAI_10.lessons.map((l, i) => (isTest(l) ? i + 1 : 0)).filter(Boolean));
    checks.forEach((r) => expect(r.roadmapTag).toBe('Kontrolltöö'));
    // the kitsas school course keeps its own text
    const kitsas = mathCurriculumRecords().find((r) => r.id === 'mk10-001');
    expect(kitsas.description).toMatch(/узкая математика \(kitsas\)/);
    expect(kitsas.description).not.toMatch(/лист формул lai/);
  });
});
