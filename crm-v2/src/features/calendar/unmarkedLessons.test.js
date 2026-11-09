import { REMINDER_DAYS, olderUnmarked, unmarkedLessons, unmarkedReminder } from './unmarkedLessons.js';

describe('Märkimata tunnid (owner 2026-10-23)', () => {
  const today = '2026-10-23';
  it('finds past lessons of the last year without a journal record, weekly series included', () => {
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
    // 15 October is in the journal; the lesson of 1 September is older than two weeks and still counted
    expect(result.map((item) => `${item.id}:${item.occurrenceDate}`)).toEqual(['week:2026-10-22', 'one:2026-10-20', 'old:2026-09-01']);
    expect(olderUnmarked(result, today)).toBe(1);
  });

  it('a whole year of a big calendar stays fast enough for the home page', () => {
    const schedule = [
      ...Array.from({ length: 500 }, (_, index) => ({ id: `w${index}`, studentId: `s${index}`, recurring: true, day: 'Mon', startDate: '2025-01-06', time: '10:00', status: 'Planeeritud' })),
      ...Array.from({ length: 3000 }, (_, index) => ({ id: `o${index}`, studentId: `o${index}`, date: '2026-05-05', time: '10:00', status: 'Planeeritud', recurring: false })),
    ];
    const started = Date.now();
    expect(unmarkedLessons({ schedule, lessons: [], today }).length).toBeGreaterThan(3000);
    expect(Date.now() - started).toBeLessThan(5000);
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

describe('teacher reminder (owner 2026-11-09: in the CRM, never an e-mail)', () => {
  const today = '2026-11-09';
  const at = (occurrenceDate) => ({ occurrenceId: occurrenceDate, occurrenceDate });
  it('counts the last 60 days up to yesterday, names the oldest day, and only lessons from before yesterday nudge', () => {
    expect(REMINDER_DAYS).toBe(60);
    const items = [at('2026-11-09'), at('2026-11-08'), at('2026-11-07'), at('2026-10-20'), at('2026-09-10'), at('2026-08-01')];
    // today is not past yet; 1 August is the old backlog beyond 60 days (owner: „308 неотмеченных — пока не делаем”)
    expect(unmarkedReminder(items, today)).toEqual({ total: 4, oldest: '2026-09-10', oldestLabel: '10.09', stale: 3 });
    // only yesterday's lesson: in the bell, but no nudge yet (a day of grace)
    expect(unmarkedReminder([at('2026-11-08')], today)).toMatchObject({ total: 1, stale: 0 });
    expect(unmarkedReminder([], today)).toEqual({ total: 0, oldest: '', oldestLabel: '', stale: 0 });
  });
});
