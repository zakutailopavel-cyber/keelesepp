import { describe, expect, it } from 'vitest';
import { B1EKSP_CURRICULUM_ID, B1EKSP_CURRICULUM_TITLE, B1EKSP_LEVEL, B1EKSP_PHASE_LABELS, B1EKSP_VERSION, b1ekspCurriculumRecords } from './b1ekspCurriculum.js';
import { MODULES } from '../worksheet-generator/admin/course/courseModules.b1eksp.js';
import { COURSE_MODULES, COURSES, buildCourseSheet, moduleSheets } from '../worksheet-generator/admin/course/registry.js';
import { LOADABLE_COURSES } from '../worksheet-generator/admin/course/courseLoaders.js';

describe('B1 eksperimentaalkursus (course b1eksp)', () => {
  const records = b1ekspCurriculumRecords(MODULES);

  it('is its own course: own key, name, module and lesson ids', () => {
    expect(COURSES.b1eksp).toMatchObject({ name: 'B1 eksperimentaalkursus', badge: 'KeeleSepp · B1 eksperimentaalkursus' });
    expect(LOADABLE_COURSES).toContain('b1eksp');
    expect(MODULES.map((mod) => mod.MODULE.id)).toEqual(['b1eksp-module-01']);
    expect(MODULES[0].MODULE).toMatchObject({ course: 'b1eksp', title: 'Tutvus', level: 'A2' });
    expect(Object.keys(MODULES[0].LESSONS)).toEqual(['b1eksp-001', 'b1eksp-002']);
    // the other courses keep their lessons
    expect(COURSE_MODULES.filter((mod) => mod.MODULE.course !== 'b1eksp').flatMap((mod) => Object.keys(mod.LESSONS)).some((id) => id.startsWith('b1eksp'))).toBe(false);
  });

  it('builds one record per lesson with the two sheet names, filed under Eesti keel → B1 eksperimentaalkursus → Tutvus', () => {
    expect(records.map((r) => r.id)).toEqual(['b1eksp-001', 'b1eksp-002']);
    expect(records.map((r) => r.title)).toEqual(['Markus bussis', 'Markuse pere']);
    records.forEach((r, i) => expect(r).toMatchObject({
      type: 'lesson', subject: 'Eesti keel', level: B1EKSP_LEVEL, levelStage: 'A2', topic: '01. Tutvus', order: i + 1,
      curriculumId: B1EKSP_CURRICULUM_ID, curriculumTitle: B1EKSP_CURRICULUM_TITLE, roadmapVersion: B1EKSP_VERSION,
      roadmapModuleId: 'b1eksp-module-01', roadmapModuleNumber: 1, roadmapModuleTitle: 'Tutvus', roadmapLessonNumber: i + 1,
      roadmapManaged: true, phaseLabels: { discover: 'Täiskasvanu', practice: 'Laps' },
    }));
    expect(B1EKSP_CURRICULUM_ID).toBe('est-b1-eksp-v1');
    expect(B1EKSP_CURRICULUM_TITLE).toBe('KeeleSepp B1 eksperimentaalkursus (täiskasvanud ja noored)');
    expect(records[0].goal).toBe('Ma tutvustan ennast: nimi, vanus, kuhu ja millega ma sõidan.');
    expect(records[0].description).toMatch(/сквозной персонаж Маркус; у каждого урока два листа — для взрослых и для школьников/);
    // a record only describes a lesson: nothing in it assigns the lesson to a student
    records.forEach((r) => expect(Object.keys(r).some((k) => /student|assign/i.test(k))).toBe(false));
  });

  it('every lesson has exactly two sheets, adult in discover and school pupil in practice, each in the six steps', () => {
    const sheets = moduleSheets(MODULES[0]);
    Object.values(sheets).forEach((phases) => {
      expect(Object.keys(phases)).toEqual(['discover', 'practice']);
      Object.entries(phases).forEach(([phase, doc]) => {
        expect(doc.meta.displayLabel).toBe(B1EKSP_PHASE_LABELS[phase]);
        expect(doc.meta.phaseLabel).toBe(B1EKSP_PHASE_LABELS[phase]);
        expect(doc.blocks.map((b) => b.type)).toEqual(['reading', 'gaps', 'table', 'gaps', 'speaking', 'writing']);
        expect(doc.blocks.some((b) => b.type === 'dictation')).toBe(false);
      });
    });
  });

  it('keeps the owner\'s texts and puts the lesson picture above the text', () => {
    const adult = buildCourseSheet(MODULES[0], 'b1eksp-001', 'discover');
    const kid = buildCourseSheet(MODULES[0], 'b1eksp-001', 'practice');
    expect(adult.blocks[0].data.passage).toMatch(/^Tere! Minu nimi on Markus\. Ma olen 34-aastane\./);
    expect(kid.blocks[0].data.passage).toMatch(/Ta on alati kiirem kui buss!$/);
    expect(adult.blocks[0].data.figures[0].img.src).toBe('/textbook-art/b1eksp/001-adult.svg');
    expect(kid.blocks[0].data.figures[0].img.src).toBe('/textbook-art/b1eksp/001-kid.svg');
    expect(buildCourseSheet(MODULES[0], 'b1eksp-002', 'discover').blocks[0].data.figures[0].img.src).toBe('/textbook-art/b1eksp/002-adult.svg');
    expect(buildCourseSheet(MODULES[0], 'b1eksp-002', 'practice').blocks[0].data.figures[0].img.src).toBe('/textbook-art/b1eksp/002-kid.svg');
    // the word task names the picture's numbers: adult portfell, kid seljakott
    expect(adult.blocks[1].data.sentences).toMatch(/Number 5 on \[portfell\]/);
    expect(kid.blocks[1].data.sentences).toMatch(/Number 5 on \[seljakott\]/);
    expect(kid.blocks[3].data.sentences).toContain('Karl sõidab [rattaga] (ratas).');
  });
});
