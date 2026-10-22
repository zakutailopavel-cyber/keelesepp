import { teacherReport } from './teacherReport.js';

const now = Date.parse('2026-10-23T12:00:00Z');
const day = (n) => new Date(now - n * 86400000).toISOString();

describe('teacher report (owner 2026-10-23, admin only)', () => {
  it('describes each teacher\'s students over 30 days and shows „—” when there is too little data', () => {
    const teachers = [{ id: 't1', name: 'Anna' }, { id: 't2', name: 'Boris' }, { id: 't3', name: 'Off', disabled: true }];
    const students = [
      { id: 's1', teacherUid: 't1', active: true }, { id: 's2', teacherUid: 't1', active: true },
      { id: 's3', teacherUid: 't2', active: true },
    ];
    const lessons = [
      { teacherUid: 't1', studentId: 's1', date: day(3), status: 'Toimunud' }, { teacherUid: 't1', studentId: 's2', date: day(5), status: 'Puudus_eta' },
      { teacherUid: 't1', studentId: 's1', date: day(40), status: 'Toimunud' },
    ];
    const words = [
      { studentId: 's1', reviewedAt: day(2), createdAt: day(10) }, { studentId: 's1', createdAt: day(12) },
      { studentId: 's2', reviewedAt: day(20), createdAt: day(60) },
    ];
    const assignments = ['a', 'b', 'c'].map((id, i) => ({ id, studentId: 's1', status: 'done', completedAt: day(i + 1), score: { correct: 8 - i, total: 10 } }));
    const rows = teacherReport({ teachers, students, lessons, words, assignments, now });
    expect(rows).toEqual([
      { id: 't1', name: 'Anna', students: 2, held: 1, missedRate: 50, practising: 50, sheets: 3, sheetScore: 70, newWordsPerStudent: 1 },
      { id: 't2', name: 'Boris', students: 1, held: 0, missedRate: null, practising: null, sheets: 0, sheetScore: null, newWordsPerStudent: 0 },
    ]);
  });
});
