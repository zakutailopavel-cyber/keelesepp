import { unmarkedLessons } from './unmarkedLessons.js';

describe('Märkimata tunnid (owner 2026-10-23)', () => {
  const today = '2026-10-23';
  it('finds past lessons of the last two weeks without a journal record, weekly series included', () => {
    const schedule = [
      { id: 'one', studentId: 's1', studentName: 'Mia', date: '2026-10-20', time: '10:00', status: 'Planeeritud', recurring: false },
      { id: 'done', studentId: 's2', date: '2026-10-21', time: '11:00', status: 'Toimunud', recurring: false },
      { id: 'cancel', studentId: 's3', date: '2026-10-21', time: '12:00', status: 'Tühistatud', recurring: false },
      { id: 'week', studentId: 's4', studentName: 'Timur', recurring: true, day: 'Thu', startDate: '2026-10-09', time: '15:00', status: 'Planeeritud' },
      { id: 'old', studentId: 's5', date: '2026-09-01', time: '10:00', status: 'Planeeritud', recurring: false },
      { id: 'future', studentId: 's6', date: '2026-10-25', time: '10:00', status: 'Planeeritud', recurring: false },
    ];
    const lessons = [{ scheduleId: 'week', occurrenceDate: '2026-10-15', date: '2026-10-15', studentId: 's4' }];
    const result = unmarkedLessons({ schedule, lessons, today });
    expect(result.map((item) => `${item.id}:${item.occurrenceDate}`)).toEqual(['week:2026-10-22', 'one:2026-10-20']);
  });

  it('a teacher sees only his own lessons; a student\'s lesson marked by hand on that day counts', () => {
    const schedule = [
      { id: 'a', studentId: 's1', teacherUid: 't1', date: '2026-10-20', time: '10:00', recurring: false },
      { id: 'b', studentId: 's2', teacherUid: 't2', date: '2026-10-20', time: '10:00', recurring: false },
    ];
    expect(unmarkedLessons({ schedule, lessons: [], today, teacherUid: 't1' }).map((item) => item.id)).toEqual(['a']);
    expect(unmarkedLessons({ schedule, lessons: [{ studentId: 's1', date: '2026-10-20' }], today, teacherUid: 't1' })).toEqual([]);
  });
});
