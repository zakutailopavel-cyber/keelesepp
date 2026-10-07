import { unplannedStudents } from './unplannedStudents.js';

const today = '2026-10-05';
const students = [
  { id: 'a', name: 'Weekly', teacherUid: 't1', active: true },
  { id: 'b', name: 'One-off ahead', teacherUid: 't1', active: true },
  { id: 'c', name: 'Old lesson only', teacherUid: 't1', active: true },
  { id: 'd', name: 'Ended series', teacherUid: 't1', active: true },
  { id: 'e', name: 'In a group', teacherUid: 't1', active: true },
  { id: 'f', name: 'Paused', teacherUid: 't1', active: true, planningPausedUntil: '2026-11-01' },
  { id: 'g', name: 'Other teacher', teacherUid: 't2', active: true },
  { id: 'h', name: 'Archived', teacherUid: 't1', active: false },
  { id: 'i', name: 'Cancelled only', teacherUid: 't1', active: true },
];
const events = [
  { studentId: 'a', recurring: true, startDate: '2026-09-01', status: 'Planeeritud' },
  { studentId: 'b', date: '2026-10-10', status: 'Planeeritud' },
  { studentId: 'c', date: '2026-09-20', status: 'Toimunud' },
  { studentId: 'd', recurring: true, startDate: '2026-06-01', endDate: '2026-09-30', status: 'Planeeritud' },
  { isGroup: true, studentIds: ['e'], recurring: true, startDate: '2026-09-01', status: 'Planeeritud' },
  { studentId: 'i', date: '2026-10-12', status: 'Tühistatud' },
];

describe('students without a lesson ahead', () => {
  it('lists only the teacher\'s active students with nothing planned, the longest-waiting first', () => {
    const rows = unplannedStudents({ students, events, today, teacherUid: 't1' });
    expect(rows.map((row) => row.student.id)).toEqual(['i', 'c', 'd']);
    expect(rows.find((row) => row.student.id === 'c').lastLesson).toBe('2026-09-20');
  });

  it('shows every teacher\'s students to the admin', () => {
    expect(unplannedStudents({ students, events, today }).map((row) => row.student.id)).toContain('g');
  });
});

describe('a student with two teachers', () => {
  it('in one teacher\'s view only that teacher\'s lessons make the student planned', async () => {
    const { unplannedStudents } = await import('./unplannedStudents.js');
    const milan = { id: 's3', name: 'Milan', active: true, teacherUid: 't1', teacherUids: ['t1', 't9'] };
    const events = [{ id: 'a', studentId: 's3', teacherUid: 't1', recurring: true, status: 'Planeeritud' }];
    expect(unplannedStudents({ students: [milan], events, today: '2026-10-07', teacherUid: 't9' }).map((row) => row.student.id)).toEqual(['s3']);
    expect(unplannedStudents({ students: [milan], events, today: '2026-10-07', teacherUid: 't1' })).toEqual([]);
    expect(unplannedStudents({ students: [milan], events, today: '2026-10-07' })).toEqual([]);
  });
});
