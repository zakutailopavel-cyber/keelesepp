import { describe, expect, it } from 'vitest';
import { KAANDED_CURRICULUM_ID, KAANDED_LEVEL, KAANDED_VERSION, kaandedCurriculumRecords } from './kaandedCurriculum.js';
import { MODULES } from '../worksheet-generator/admin/course/courseModules.kaanded.js';
import { COURSES, buildCourseSheet, moduleSheets } from '../worksheet-generator/admin/course/registry.js';
import { LOADABLE_COURSES } from '../worksheet-generator/admin/course/courseLoaders.js';
import { courseChoice } from '../self-study/selfStudyModel.js';
import { subjectOfLevel } from '../library/libraryModel.js';
import { scoreDocument } from '../worksheet-studio/engine/registry.js';

const IDS = ['kaanded-001', 'kaanded-002', 'kaanded-003', 'kaanded-004', 'kaanded-005', 'kaanded-006'];

describe('mini-course „Käänded lauses” (course kaanded)', () => {
  const records = kaandedCurriculumRecords(MODULES);
  const sheets = moduleSheets(MODULES[0]);

  it('is its own course with six lessons', () => {
    expect(COURSES.kaanded).toMatchObject({ name: 'Käänded lauses' });
    expect(LOADABLE_COURSES).toContain('kaanded');
    expect(MODULES[0].MODULE).toMatchObject({ id: 'kaanded-module-01', course: 'kaanded', supplement: true });
    expect(Object.keys(MODULES[0].LESSONS)).toEqual(IDS);
  });

  it('files the records under Eesti keel → Käänded lauses, lesson 6 is the control', () => {
    expect(records.map((r) => r.id)).toEqual(IDS);
    expect(subjectOfLevel(KAANDED_LEVEL)).toBe('et');
    records.forEach((r, i) => expect(r).toMatchObject({ type: 'lesson', subject: 'Eesti keel', level: KAANDED_LEVEL, order: i + 1, curriculumId: KAANDED_CURRICULUM_ID, roadmapVersion: KAANDED_VERSION, roadmapManaged: true, roadmapModuleNumber: 1 }));
    expect(records.map((r) => r.roadmapKind)).toEqual(['theme', 'theme', 'theme', 'theme', 'theme', 'check']);
    expect(records.map((r) => r.levelStage)).toEqual(['A2', 'A2', 'A2', 'A2', 'B1', 'B1']);
    records.forEach((r) => expect(Object.keys(r).some((k) => /student|assign/i.test(k))).toBe(false));
  });

  it('a learner sees the course in „Minu kursus” once he has work in it, not before', () => {
    const level = { key: KAANDED_LEVEL, label: KAANDED_LEVEL, modules: [{ key: 'm1', lessons: IDS.map((id) => ({ id })) }] };
    const b1 = { key: 'B1', label: 'B1', modules: [{ key: 'b', lessons: [{ id: 'a2b1-001' }] }] };
    const student = { level: 'A2', targetLevel: 'B1' };
    expect(courseChoice(student, [b1, level]).offered.map((l) => l.key)).toEqual(['B1']);
    expect(courseChoice(student, [b1, level], new Set(['kaanded-003'])).offered.map((l) => l.key)).toContain(KAANDED_LEVEL);
  });

  it('every lesson has three sheets with a scheme picture, a rule box, a form text, a pair task, an exit check and a self-check', () => {
    IDS.forEach((id) => {
      expect(Object.keys(sheets[id])).toEqual(['discover', 'practice', 'transfer']);
      const d = sheets[id].discover.blocks;
      const p = sheets[id].practice.blocks;
      const t = sheets[id].transfer.blocks;
      expect(d.some((b) => b.data.figures?.[0]?.img.src.startsWith('/textbook-art/kaanded/'))).toBe(true);
      expect(d.some((b) => b.type === 'notice' && b.data.title.startsWith('Märka!'))).toBe(true);
      expect(p.some((b) => b.type === 'formtext')).toBe(true);
      expect(p.some((b) => b.type === 'tip' && /Lisaväljakutse/.test(b.data.text))).toBe(true);
      expect(t.some((b) => b.data.taskType && b.data.support?.length && b.data.stretch)).toBe(true);
      expect(t.some((b) => b.type === 'writing' && b.data.title === 'Kirjuta oma laused.')).toBe(true);
      expect(t.some((b) => b.data.exit)).toBe(true);
      expect(t.some((b) => b.type === 'selfcheck' && b.data.evidence)).toBe(true);
      [...d, ...p, ...t].forEach((b) => expect(b.type).not.toBe('dictation'));
    });
  });

  it('v2: every Harjuta has 9 practice blocks of 8–12 items, recognise → choose → produce', () => {
    const items = (b) => b.data.questions?.length || b.data.pairs?.length || (Array.isArray(b.data.rows) ? b.data.rows.length : 0)
      || (typeof b.data.rows === 'string' ? b.data.rows.split('\n').length : 0) || (b.data.groups ? b.data.groups.flatMap((g) => String(g.words).split(/,|\n/)).length : 0)
      || (String(b.data.passage || '').match(/\[/g) || []).length;
    IDS.forEach((id) => {
      const tasks = sheets[id].practice.blocks.filter((b) => b.type !== 'tip');
      expect(tasks).toHaveLength(9);
      tasks.forEach((b) => expect(items(b), `${id} ${b.id}`).toBeGreaterThanOrEqual(8));
      tasks.forEach((b) => expect(items(b), `${id} ${b.id}`).toBeLessThanOrEqual(12));
      const types = tasks.map((b) => b.type);
      expect(types.indexOf('choice')).toBeLessThan(types.indexOf('formtext'));
      expect(types.at(-1)).toBe('translation');
      expect(new Set(types).size).toBeGreaterThanOrEqual(7);
    });
  });

  it('the control of lesson 6 has 8 + 10 + 6 + 6 = 30 points and a full key scores 30', () => {
    const doc = buildCourseSheet(MODULES[0], 'kaanded-006', 'transfer');
    const parts = ['k6_t_c1', 'k6_t_c2', 'k6_t_c3', 'k6_t_c4'].map((id) => doc.blocks.find((b) => b.id === id));
    const answers = {};
    const control = { ...doc, blocks: parts };
    // the right answer of every item: choice = the index of the * option, formtext = first variant, rows = first variant
    parts[0].data.questions.forEach((q, i) => { answers[`${parts[0].id}:${i}`] = q.options.split('\n').findIndex((o) => o.startsWith('*')); });
    [...parts[1].data.passage.matchAll(/\[([^\]]+)\]/g)].forEach((m, i) => { answers[`${parts[1].id}:${i}`] = m[1].split('|')[0]; });
    [parts[2], parts[3]].forEach((b) => b.data.rows.forEach((r, i) => { answers[`${b.id}:${i}`] = r.answer.split('|')[0]; }));
    const items = Object.values(scoreDocument(control, answers).perBlock).flat();
    expect(items.length).toBe(30);
    expect(items.filter((item) => item.ok).length).toBe(30);
    expect(parts.map((b) => Number(b.data.title.match(/\((\d+) punkti\)/)[1]))).toEqual([8, 10, 6, 6]);
  });
});
