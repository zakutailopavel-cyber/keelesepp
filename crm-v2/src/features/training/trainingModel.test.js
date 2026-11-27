import { describe, expect, it } from 'vitest';
import { attendanceFromLessons, blankCourse, missingDocuments, nextDocumentNumber, normalizeCourse, recordOf, reportText, suggestedDocument, validateCourse, volumeBucket, withLessonAttendance, yearReport } from './trainingModel.js';

const person = (name, extra = {}) => ({ studentId: name.toLowerCase(), name, startedOn: '2026-03-02', ...extra });
const course = (extra = {}) => normalizeCourse('c1', { title: 'B1 õhtune rühm', curriculum: 'B1', contactHours: 120, independentHours: 60, startDate: '2026-03-02', ...extra });

describe('trainingModel', () => {
  it('normalizes a course and keeps unknown percentages as -1', () => {
    const value = course({ participants: [person('Anna', { attendancePct: '92', finalTestPct: '' }), { name: '' }], status: 'x' });
    expect(value.status).toBe('active');
    expect(value.curriculumName).toMatch(/B1-taseme/);
    expect(value.participants).toEqual([expect.objectContaining({ name: 'Anna', attendancePct: 92, finalTestPct: -1, document: '', documentNumber: '' })]);
    expect(Object.keys(recordOf(value))).not.toContain('id');
    expect(blankCourse('C1')).toMatchObject({ contactHours: 200, independentHours: 40 });
  });

  it('validates the dates, duplicates and issued documents', () => {
    expect(validateCourse(course({ title: '' }))).toMatch(/nimi/);
    expect(validateCourse(course({ endDate: '2026-01-01' }))).toMatch(/enne algust/);
    expect(validateCourse(course({ status: 'finished' }))).toMatch(/lõpu kuupäev/);
    expect(validateCourse(course({ participants: [person('Anna'), person('Anna')] }))).toMatch(/kaks korda/);
    expect(validateCourse(course({ participants: [person('Anna', { document: 'tunnistus' })] }))).toMatch(/number ja kuupäev/);
    expect(validateCourse(course({ participants: [person('Anna', { document: 'tunnistus', documentNumber: '2026-001', documentDate: '2026-11-20' })] }))).toBe('');
  });

  it('suggests a certificate only with 75 % attendance and 60 % in the final test', () => {
    expect(suggestedDocument({ attendancePct: -1, finalTestPct: 80 })).toBe('');
    expect(suggestedDocument({ attendancePct: 61, finalTestPct: -1 })).toBe('toend');
    expect(suggestedDocument({ attendancePct: 88, finalTestPct: -1 })).toBe('');
    expect(suggestedDocument({ attendancePct: 75, finalTestPct: 60 })).toBe('tunnistus');
    expect(suggestedDocument({ attendancePct: 90, finalTestPct: 59 })).toBe('toend');
  });

  it('numbers documents per year across all courses', () => {
    const courses = [course({ participants: [person('Anna', { document: 'tunnistus', documentNumber: '2026-014', documentDate: '2026-11-20' }), person('Olga', { document: 'toend', documentNumber: '2025-030', documentDate: '2025-12-01' })] })];
    expect(nextDocumentNumber(courses, 2026)).toBe('2026-015');
    expect(nextDocumentNumber(courses, 2027)).toBe('2027-001');
  });

  it('counts the EHIS indicators from the courses that ended in the year', () => {
    const done = course({ status: 'finished', endDate: '2026-11-20', participants: [person('Anna', { document: 'tunnistus', documentNumber: '2026-001', documentDate: '2026-11-20' }), person('Sergei', { document: 'toend', documentNumber: '2026-002', documentDate: '2026-11-20' }), person('Olga')] });
    const short = normalizeCourse('c2', { title: 'Töötuba', curriculum: 'other', curriculumName: 'Suhtluskeel', contactHours: 8, startDate: '2026-05-01', endDate: '2026-05-01', status: 'finished', participants: [person('Mari')] });
    const lastYear = course({ status: 'finished', endDate: '2025-12-19', participants: [person('Jaan')] });
    const running = course({ participants: [person('Tiit')] });
    const report = yearReport([done, short, lastYear, running], 2026);
    expect(report).toMatchObject({ courses: 2, started: 4, certificates: 1, statements: 1, todo: 2, running: 1 });
    expect(report.buckets).toEqual({ upTo8: 1, from9to26: 0, from27to80: 0, from81to240: 1, over240: 0 });
    expect(volumeBucket(done)).toBe('from81to240');
    expect(missingDocuments(running)).toBe(0);
    expect(reportText(report)).toMatch(/alustanud õppijad: 4\nVäljaantud tunnistused: 1/);
  });

  it('reads attendance from the lesson marks inside the course dates', () => {
    const lessons = [
      { studentId: 'anna', date: '2026-03-02', status: 'Toimunud', duration: 60 },
      { studentId: 'anna', date: '2026-03-04', status: 'Puudus_eta', duration: 60 },
      { studentId: 'anna', date: '2026-03-09', status: 'Toimunud', duration: 90 },
      { studentId: 'anna', date: '2026-03-11', status: 'Toimunud', duration: 60 },
      { studentId: 'anna', date: '2026-02-20', status: 'Toimunud', duration: 60 },
      { studentId: 'anna', date: '2026-03-16', status: '', duration: 60 },
      { studentId: 'olga', date: '2026-03-02', status: 'Toimunud', duration: 60 },
    ];
    const value = course({ participants: [{ studentId: 'anna', name: 'Anna' }, { studentId: '', name: 'Külaline', attendancePct: 50 }, { studentId: 'uus', name: 'Uus' }] });
    expect(attendanceFromLessons(lessons, 'anna', value)).toEqual({ attended: 3, absent: 1, attendancePct: 75, academicHours: 5, firstDate: '2026-03-02' });
    const filled = withLessonAttendance(value, lessons);
    expect(filled.participants.map((item) => [item.attendancePct, item.startedOn])).toEqual([[75, '2026-03-02'], [50, ''], [-1, '']]);
  });
});
