import { describe, expect, it } from 'vitest';
import katex from 'katex';
import { LAI_12 } from './lai12.js';
import { MATH_MODULES } from './sheets.js';
import { buildCourseSheet } from '../courseSheet.js';
import { BLOCKS } from '../../../../worksheet-studio/engine/registry.js';
import { compileExpr } from '../../../../worksheet-studio/engine/mathExpr.js';
import { mathCurriculumRecords } from '../../../../curriculum/mathCurriculum.js';
import { subjectOfLevel } from '../../../../library/libraryModel.js';

const mod = MATH_MODULES.find((m) => m.MODULE.id === 'ml12-module-01');
// the topic lessons ml12-001…020; the mock exams ml12-021…023 are checked in lai12mocks.test.js
const ids = Object.keys(mod.LESSONS).filter((id) => !mod.LESSONS[id].mock);
const PHASES = ['discover', 'practice', 'transfer'];
const points = (task) => task.parts.reduce((sum, [, p]) => sum + p, 0);
const tasksOf = (id, phase) => mod.LESSONS[id][phase].filter((b) => b.type === 'mathtask');

describe('math lai riigieksam module (ml12)', () => {
  it('has one lesson per exam task type, three sheets each, with the short level „Lai”', () => {
    expect(ids).toHaveLength(LAI_12.lessons.length);
    expect(LAI_12.lessons.length).toBeGreaterThanOrEqual(16);
    expect(ids[0]).toBe('ml12-001');
    expect(ids.at(-1)).toBe(`ml12-${String(LAI_12.lessons.length).padStart(3, '0')}`);
    for (const id of ids) {
      for (const phase of PHASES) {
        const doc = buildCourseSheet(mod, id, phase);
        expect(doc.blocks.length).toBeGreaterThan(0);
        for (const b of doc.blocks) expect(BLOCKS[b.type], `${id} ${b.type}`).toBeTruthy();
      }
      expect(mod.LESSONS[id].level).toBe('Lai');
    }
    expect(buildCourseSheet(mod, 'ml12-001', 'discover').meta.displayLabel).toBe('1 Teooria ja näited');
    expect(buildCourseSheet(mod, 'ml12-001', 'transfer').meta.displayLabel).toBe('3 Eksamiülesanne');
  });

  it('every block id is unique, also across the kitsas module', () => {
    const all = MATH_MODULES.flatMap((m) => Object.values(m.LESSONS).flatMap((l) => PHASES.flatMap((p) => l[p].map((b) => b.id))));
    expect(new Set(all).size).toBe(all.length);
  });

  it('the exam task carries the lai exam points: 5 p for tasks 1–4, 10 p for tasks 5–12 (2027 spec)', () => {
    const covered = new Set();
    for (const lesson of LAI_12.lessons) {
      expect(lesson.slots.length, lesson.title).toBeGreaterThan(0);
      lesson.slots.forEach((s) => { expect(s >= 1 && s <= 12).toBe(true); covered.add(s); });
      const want = lesson.slots.every((s) => s <= 4) ? 5 : 10;
      expect(lesson.examTask.title, lesson.title).toBe(`Eksamiülesanne (${want} punkti)`);
      expect(points(lesson.examTask), lesson.title).toBe(want);
    }
    // every one of the 12 exam tasks is trained by at least one lesson
    expect([...covered].sort((a, b) => a - b)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
  });

  it('every lesson has theory marked valemileht / pähe, a Russian hint, a worked example and 4 practice tasks', () => {
    for (const lesson of LAI_12.lessons) {
      expect(lesson.theory.length, lesson.title).toBeGreaterThanOrEqual(3);
      for (const line of lesson.theory) expect(line, lesson.title).toMatch(/\*(pähe|valemilehel)\*/);
      expect(lesson.ru_hint.some((h) => /лист[еа]? формул/.test(h)), lesson.title).toBe(true);
      expect(lesson.example.steps.length).toBeGreaterThan(0);
      expect(lesson.practice).toHaveLength(4);
      expect(lesson.self.length).toBeGreaterThanOrEqual(3);
    }
  });

  it('every part has a worked solution; each key form is accepted, a wrong answer rejected', () => {
    const { score } = BLOCKS.mathtask;
    for (const id of ids) {
      for (const b of [...tasksOf(id, 'practice'), ...tasksOf(id, 'transfer')]) {
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

  it('a drawing part has a blank grid after its task; a figure is a geometry block', () => {
    for (const id of ids) {
      const blocks = mod.LESSONS[id].transfer;
      blocks.forEach((b, i) => {
        if (b.type !== 'mathtask' || !b.data.parts.some((p) => /Joonesta/.test(p.text))) return;
        expect(blocks[i + 1]?.type, b.id).toBe('graph');
        expect(blocks[i + 1].data.blank).toBe(true);
      });
    }
    const figures = ids.flatMap((id) => PHASES.flatMap((p) => mod.LESSONS[id][p])).filter((b) => b.type === 'geofigure');
    expect(figures.length).toBeGreaterThanOrEqual(4);
    for (const f of figures) expect(['triangle', 'solid']).toContain(f.data.kind);
  });

  it('every graph formula can be drawn', () => {
    for (const id of ids) {
      for (const b of [...mod.LESSONS[id].discover, ...mod.LESSONS[id].transfer].filter((x) => x.type === 'graph')) {
        for (const fn of String(b.data.fns || '').split('\n').filter(Boolean)) {
          const c = compileExpr(fn.replace(/^y\s*=/, ''), b.data.angle === 'deg');
          expect(c.error, `${b.id}: ${fn}`).toBeUndefined();
          expect(Number.isFinite(c.f((b.data.xmin + b.data.xmax) / 2 + 0.123)) || /ln/.test(fn), `${b.id}: ${fn}`).toBe(true);
        }
      }
    }
  });

  it('every formula renders with KaTeX', () => {
    const bad = [];
    for (const lesson of LAI_12.lessons) {
      const tasks = [...lesson.practice, lesson.examTask];
      const texts = [
        ...lesson.theory, lesson.example.task, ...lesson.example.steps, lesson.example.figure?.caption || '',
        ...tasks.flatMap((t) => [t.title, t.context || '', ...t.parts.flatMap((p) => [p[0], p[3]])]),
      ];
      for (const text of texts) {
        for (const f of text.match(/\$[^$\n]+\$/g) || []) {
          try { katex.renderToString(f.slice(1, -1), { throwOnError: true }); } catch (e) { bad.push(`${lesson.title}: ${f}: ${e.message}`); }
        }
      }
    }
    expect(bad).toEqual([]);
  });

  it('the numeric keys are right (recomputed)', () => {
    const rad = (d) => (d * Math.PI) / 180;
    const deg = (x) => (x * 180) / Math.PI;
    const C = (n, k) => { let r = 1; for (let i = 1; i <= k; i += 1) r = (r * (n - k + i)) / i; return r; };
    const lessonOf = (n) => LAI_12.lessons[n - 1];
    const num = (s) => {
      const t = String(s).trim().replace(',', '.');
      const frac = /^(-?\d+)\/(\d+)$/.exec(t);
      return frac ? Number(frac[1]) / Number(frac[2]) : Number(t);
    };
    // the key of practice task t (1-based; 'e' = exam task), part p (0-based); several answers split by ;
    const key = (n, t, p) => {
      const task = t === 'e' ? lessonOf(n).examTask : lessonOf(n).practice[t - 1];
      // the first key form that is all numbers (π and √ forms come with a decimal form too)
      const forms = String(task.parts[p][2]).split('|').map((f) => f.split(';').map((x) => num(x)));
      return forms.find((f) => f.every(Number.isFinite)) || forms[0];
    };
    const check = (n, t, p, values, tol = 0.006) => {
      const got = key(n, t, p);
      const want = [].concat(values);
      expect(got.length, `${n}.${t}.${p}`).toBe(want.length);
      want.forEach((v, i) => expect(Math.abs(got[i] - v) < tol, `lesson ${n} task ${t} part ${p}: ${got[i]} ≠ ${v}`).toBe(true));
    };
    // 1 astmed
    check(1, 1, 0, 16 ** 0.75); check(1, 1, 1, (8 / 27) ** (-2 / 3)); check(1, 1, 2, Math.cbrt(54 / 2));
    expect(Math.abs(Math.sqrt(12) + Math.sqrt(27) - Math.sqrt(48) - Math.sqrt(3)) < 1e-9).toBe(true);
    check(1, 'e', 1, (16 + 2 * 4 + 4) / (4 + 2));
    expect(Math.abs((16 * 4 - 8) / (16 - 4) - 28 / 6) < 1e-9).toBe(true); // A = B at a = 16
    // 2 süsteemid
    expect([2 + 3 + 4, 2 - 3 + 8, 6 + 3 - 4]).toEqual([9, 7, 5]);
    expect([1 + 2 + 3, 2 - 2 + 3, 1 + 4 - 3]).toEqual([6, 3, 2]);
    check(2, 4, 0, [70, 50]); expect(3 * 70 + 2 * 50).toBe(310);
    check(2, 'e', 1, 24); check(2, 'e', 2, 15 * 24 + 40); expect(18 * 24 - 32).toBe(400);
    // 3 võrratused: the bounds solve the equations
    expect([(2 * 3 - 1) / (3 + 2), (3 + 2) * (2 * 3 - 1), (-4.5 + 2) * (2 * -4.5 - 1)]).toEqual([1, 25, 25]);
    // 4 tõenäosus
    check(4, 1, 2, C(10, 4)); check(4, 4, 0, (C(4, 2) * C(6, 1)) / C(10, 3));
    check(4, 2, 0, 5 / 36); check(4, 2, 1, 11 / 36); check(4, 3, 2, 3 * 0.8 ** 2 * 0.2);
    check(4, 'e', 0, C(6, 4) / C(10, 4)); check(4, 'e', 1, (C(4, 3) * C(6, 1) + 1) / C(10, 4));
    // 5 jaotused
    check(5, 1, 2, Math.sqrt(0.3 + 1.6 + 1.8 - 1.7 ** 2)); check(5, 2, 0, 0.75 ** 5); check(5, 2, 1, C(5, 2) * 0.25 ** 2 * 0.75 ** 3);
    check(5, 'e', 0, [1, Math.sqrt(0.95)]); check(5, 'e', 1, 0.95 ** 20);
    check(5, 'e', 2, 1 - 0.95 ** 20 - 20 * 0.05 * 0.95 ** 19);
    // 6 statistika
    const sd = (xs) => { const m = xs.reduce((a, b) => a + b, 0) / xs.length; return Math.sqrt(xs.reduce((a, x) => a + (x - m) ** 2, 0) / xs.length); };
    check(6, 1, 3, sd([3, 5, 5, 6, 8, 9])); check(6, 2, 2, sd([2, 2, 3, 3, 3, 3, 3, ...Array(8).fill(4), ...Array(5).fill(5)]));
    check(6, 4, 0, [172 - 1.96, 172 + 1.96]); check(6, 4, 1, [172 - 0.98, 172 + 0.98]);
    check(6, 'e', 2, sd([12, 15, 15, 17, 18, 20, 22, 25]));
    // 7 jadad
    check(7, 'e', 2, 1000 * 1.06 ** 9, 0.5); check(7, 'e', 3, (1000 * (1.06 ** 10 - 1)) / 0.06, 0.5);
    check(7, 'e', 4, 15600 - (1000 * (1.06 ** 10 - 1)) / 0.06, 0.5);
    expect([(5 + 3) ** 2 === (5 - 1) * (3 * 5 + 1), (-1 + 3) ** 2 === (-1 - 1) * (3 * -1 + 1)]).toEqual([true, true]);
    expect([(6 - 3) * (9 + 3), (6 + 6) * (9 - 6)]).toEqual([36, 36]);
    // 8 piirväärtus
    expect(Math.ceil(Math.log(0.025) / Math.log(0.6))).toBe(8);
    check(8, 'e', 0, 4 * 0.6 ** 3); check(8, 'e', 2, 4 + 2 * 2.4 + 2 * 1.44); check(8, 'e', 3, 4 + (2 * 2.4) / 0.4);
    // 9 trig võrrandid (second key forms are decimals)
    const alt = (n, t, p) => { const task = t === 'e' ? lessonOf(n).examTask : lessonOf(n).practice[t - 1]; return String(task.parts[p][2]).split('|')[1].split(';').map(num); };
    const near = (xs, ys) => xs.length === ys.length && xs.every((x, i) => Math.abs(x - ys[i]) < 0.006);
    expect(near(alt(9, 2, 2), [Math.PI / 3, Math.PI, (5 * Math.PI) / 3])).toBe(true);
    expect(near(alt(9, 4, 1), [Math.PI / 6, (5 * Math.PI) / 6, (3 * Math.PI) / 2])).toBe(true);
    expect([0, Math.PI / 3, Math.PI, (5 * Math.PI) / 3, 2 * Math.PI].every((x) => Math.abs(Math.sin(2 * x) - Math.cos(Math.PI / 2 - x)) < 1e-9)).toBe(true);
    expect(near(alt(9, 'e', 1), [0, Math.PI / 3, Math.PI, (5 * Math.PI) / 3, 2 * Math.PI])).toBe(true);
    // 10 trig funktsioonid
    const f10 = (x) => 2 * Math.sin(x) + Math.cos(2 * x);
    check(10, 'e', 2, [Math.max(...[0, Math.PI / 6, Math.PI / 2, (5 * Math.PI) / 6, Math.PI].map(f10)), Math.min(...[0, Math.PI / 6, Math.PI / 2, (5 * Math.PI) / 6, Math.PI].map(f10))]);
    check(10, 3, 0, 6 * ((2 * Math.PI) / 3)); check(10, 3, 1, (36 * ((2 * Math.PI) / 3)) / 2, 0.01);
    // 11 log
    check(11, 1, 2, Math.log(2) / Math.log(5)); check(11, 2, 1, Math.log(7) / Math.log(2)); check(11, 2, 2, Math.log(5) / 2);
    check(11, 4, 1, [Math.sqrt(8), -Math.sqrt(8)]);
    expect(Math.log2(2 + 2)).toBe(3 - Math.log2(2));
    // 12 tuletis
    check(12, 2, 0, 4 / Math.sqrt(16 + 9)); check(12, 'e', 2, [2, 0.5]);
    expect([2 / 2 + 2 * 2, 2 / 0.5 + 2 * 0.5]).toEqual([5, 5]);
    // 13 uurimine
    const f13 = (x) => 2 * x ** 3 - 3 * x ** 2 - 12 * x;
    check(13, 3, 0, Math.max(f13(-2), f13(-1), f13(2), f13(3))); check(13, 3, 1, Math.min(f13(-2), f13(-1), f13(2), f13(3)));
    check(13, 1, 2, [1 / Math.sqrt(3), -1 / Math.sqrt(3)]);
    const g13 = (x) => -(x ** 3) + 3 * x ** 2 + 9 * x - 2;
    check(13, 'e', 1, Math.max(g13(0), g13(3), g13(4)));
    // 14 ekstreemum
    const r14 = Math.cbrt(500 / Math.PI);
    check(14, 4, 0, r14); check(14, 4, 1, 1000 / (Math.PI * r14 ** 2)); check(14, 2, 1, 5 * 20 ** 2);
    check(14, 'e', 2, [32 / 16, 16 + 128 / 4]);
    // 15 integraal
    check(15, 3, 0, 22 / 3 + 13.5); check(15, 4, 0, 8 * Math.PI); check(15, 4, 1, Math.PI / 5);
    check(15, 2, 1, Math.log(4)); check(15, 1, 2, Math.E - 1);
    expect(Math.abs(27 / 3 - 9)).toBe(0);
    // 16 mudelid
    check(16, 1, 1, 50000 * 0.985 ** 10, 0.5);
    expect(Math.ceil(Math.log(0.8) / Math.log(0.985))).toBe(15);
    check(16, 2, 1, 20 + 70 * Math.exp(-0.5)); check(16, 2, 2, Math.log(3.5) / 0.05);
    check(16, 3, 1, (20 + Math.sqrt(436)) / 10); check(16, 4, 2, [Math.ceil(400 - Math.sqrt(100000)), Math.floor(400 + Math.sqrt(100000))]);
    check(16, 'e', 1, 150 * 0.8 ** 3); check(16, 'e', 2, Math.log(0.2) / Math.log(0.8)); check(16, 'e', 3, -96 * Math.log(0.8));
    // 17 vektorid
    check(17, 1, 2, deg(Math.acos(2 / (5 * Math.sqrt(5))))); check(17, 2, 2, deg(Math.atan(3)));
    check(17, 'e', 4, 40 / Math.sqrt(80));
    expect([(-2 - 2) ** 2 + (1 - 3) ** 2, (4 - 2) ** 2 + (-1 - 3) ** 2, (0 - 2) ** 2 + (7 - 3) ** 2]).toEqual([20, 20, 20]);
    // 18 ruum
    check(18, 2, 1, deg(Math.acos(4 / 9))); check(18, 4, 0, deg(Math.asin(1 / Math.sqrt(3))));
    check(18, 'e', 1, Math.sqrt(61)); check(18, 'e', 2, deg(Math.asin(3 / Math.sqrt(61)))); check(18, 'e', 3, deg(Math.acos(11 / 61)));
    // 19 kolmnurk
    check(19, 2, 0, deg(Math.acos(16 / 176))); check(19, 2, 1, Math.sqrt(1920)); check(19, 2, 2, 13 / (2 * Math.sin(Math.acos(16 / 176))));
    check(19, 3, 0, (12 * Math.sin(rad(40))) / Math.sin(rad(75))); check(19, 3, 1, (12 * Math.sin(rad(65))) / Math.sin(rad(75)));
    const phi = 2 * Math.asin(0.6);
    check(19, 4, 1, deg(phi)); check(19, 4, 2, 50 * phi - 50 * Math.sin(phi));
    const ab = Math.sqrt(4.2 ** 2 + 6.5 ** 2 - 2 * 4.2 * 6.5 * Math.cos(rad(72)));
    check(19, 'e', 0, ab); check(19, 'e', 1, deg(Math.acos((4.2 ** 2 + ab ** 2 - 6.5 ** 2) / (2 * 4.2 * ab))));
    check(19, 'e', 2, 4.2 * Math.sin(rad(72))); check(19, 'e', 3, 0.5 * 4.2 * 6.5 * Math.sin(rad(72)));
    // 20 stereomeetria
    check(20, 1, 0, (Math.sqrt(3) / 4) * 36); check(20, 1, 1, (Math.sqrt(3) / 4) * 360); check(20, 1, 2, (Math.sqrt(3) / 2) * 36 + 180);
    check(20, 2, 0, 4 * Math.sqrt(3)); check(20, 2, 1, (Math.PI * 16 * 4 * Math.sqrt(3)) / 3); check(20, 3, 1, 144 * Math.PI);
    check(20, 4, 1, deg(Math.asin(12 / 13)));
    check(20, 'e', 0, Math.sqrt(81 - 32)); check(20, 'e', 1, 448 / 3); check(20, 'e', 2, deg(Math.atan(7 / 4))); check(20, 'e', 3, 16 * Math.sqrt(65), 0.01);
    expect(Math.abs(deg(Math.atan(4 / (3 * Math.SQRT2))) - 43.31) < 0.006).toBe(true);
  });

  it('library records sit under Õppevara → Matemaatika as the lai course', () => {
    const records = mathCurriculumRecords().filter((r) => ids.includes(r.id));
    expect(records.map((r) => r.id)).toEqual(ids);
    for (const r of records) {
      expect(r.level).toBe('12. klass matemaatika lai');
      expect(subjectOfLevel(r.level)).toBe('ma');
      expect(r.roadmapKind).toBe('theme');
      expect(r.curriculumId).toBe('math-ml12-v1');
      expect(r.description).toMatch(/\(lai\)/);
      expect(r.description).toMatch(/лист формул lai/);
      expect(r.description).toMatch(/Ход/);
    }
    // the kitsas plans keep their own formula sheet
    const kitsas = mathCurriculumRecords().find((r) => r.id === 'mk12-001');
    expect(kitsas.description).toMatch(/лист формул kitsas/);
  });
});
