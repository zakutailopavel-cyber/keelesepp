import {
  EXCLUSION_REASONS, MARKING_START, exclusionReason, groupByDay, markingContext, markingDates, markingSplit, olderWindow, seriesEndDate,
  startLabel, unmarkedLessons, unmarkedReminder,
} from './unmarkedLessons.js';

// the ONE „märkimata” definition (owner 2026-11-09): from MARKING_START up to yesterday, without artefacts
const today = '2026-11-09';
const one = (id, date, extra = {}) => ({ id, studentId: `s-${id}`, studentName: id, teacherUid: 't1', teacher: 'Anna', date, time: '10:00', duration: 60, status: 'Planeeritud', recurring: false, ...extra });
const ids = (items) => items.map((item) => `${item.id}:${item.occurrenceDate}`);

describe('the counting window', () => {
  it('starts on MARKING_START (1.11) and ends yesterday; today never counts', () => {
    expect(MARKING_START).toBe('2026-11-01');
    expect(startLabel()).toBe('1.11');
    const dates = markingDates(today);
    expect(dates[0]).toBe('2026-11-08');
    expect(dates.at(-1)).toBe('2026-11-01');
    expect(dates).toHaveLength(8);
    expect(markingDates('2026-11-01')).toEqual([]);
  });
  it('lessons before the start are not counted (nothing changes on them); the admin\'s „Vanemad” window is the 60 days before', () => {
    const schedule = [one('old', '2026-10-30'), one('new', '2026-11-03'), one('today', today)];
    expect(ids(unmarkedLessons({ schedule, today }))).toEqual(['new:2026-11-03']);
    expect(olderWindow()).toEqual({ from: '2026-09-02', to: '2026-10-31' });
    expect(ids(markingSplit({ schedule, today, ...olderWindow() }).items)).toEqual(['old:2026-10-30']);
  });
  it('a weekly series counts each past occurrence from the start, oldest first', () => {
    const schedule = [{ ...one('w', '2026-09-07'), recurring: true, day: 'Mon', startDate: '2026-09-07' }, one('x', '2026-11-04')];
    expect(ids(unmarkedLessons({ schedule, today }))).toEqual(['w:2026-11-02', 'x:2026-11-04']);
  });
});

describe('exclusions („Vajab admini”)', () => {
  const schedule = [
    one('ok', '2026-11-03'),
    one('noTeacher', '2026-11-03', { teacherUid: '', teacher: '' }),
    one('gone', '2026-11-04', { teacherUid: 't-left' }),
    one('disabled', '2026-11-04', { teacherUid: 't-off' }),
    one('archived', '2026-11-05', { studentId: 's-arch' }),
    one('closed', '2026-11-02'),
  ];
  const context = {
    archivedStudentIds: ['s-arch'],
    staff: [{ id: 't1', role: 'teacher' }, { id: 't-off', role: 'teacher', disabled: true }, { id: 'adm', role: 'admin' }],
    lockedDates: ['2026-11-02'],
  };
  it('each artefact gets its reason and is not counted', () => {
    const { items, adminItems } = markingSplit({ schedule, today, context });
    expect(ids(items)).toEqual(['ok:2026-11-03']);
    expect(Object.fromEntries(adminItems.map((item) => [item.id, item.reason]))).toEqual({
      noTeacher: 'no-teacher', gone: 'teacher-gone', disabled: 'teacher-gone', archived: 'student-archived', closed: 'period-closed',
    });
    adminItems.forEach((item) => expect(EXCLUSION_REASONS[item.reason]).toBeTruthy());
  });
  it('a teacher never sees an entry without a teacher, nor the admin section', () => {
    const { items, adminItems } = markingSplit({ schedule, today, context, teacherUid: 't1' });
    expect(ids(items)).toEqual(['ok:2026-11-03']);
    expect(adminItems).toEqual([]);
    // without any context the entry without a teacher is still not his
    expect(ids(unmarkedLessons({ schedule: [one('noTeacher', '2026-11-03', { teacherUid: '' })], today, teacherUid: 't1' }))).toEqual([]);
  });
  it('only what is known excludes: no staff list → nobody is „gone”; a card not in the archive counts', () => {
    expect(exclusionReason({ teacherUid: 'anyone', studentId: 's', occurrenceDate: '2026-11-03' }, markingContext({}))).toBe('');
    expect(exclusionReason({ teacherUid: '', occurrenceDate: '2026-11-03' })).toBe('no-teacher');
  });
  it('a deleted (trashed) teacher account is gone; an admin who teaches is not', () => {
    const ctx = markingContext({ staff: [{ id: 'a', role: 'admin' }, { id: 'd', role: 'teacher', deletedAt: '2026-11-01' }] });
    expect(exclusionReason({ teacherUid: 'a', occurrenceDate: '2026-11-03' }, ctx)).toBe('');
    expect(exclusionReason({ teacherUid: 'd', occurrenceDate: '2026-11-03' }, ctx)).toBe('teacher-gone');
  });
});

describe('page helpers', () => {
  it('groupByDay: oldest day first', () => {
    const items = [{ occurrenceDate: '2026-11-04', id: 'b' }, { occurrenceDate: '2026-11-02', id: 'a' }, { occurrenceDate: '2026-11-04', id: 'c' }];
    expect(groupByDay(items).map((day) => [day.date, day.items.map((item) => item.id)])).toEqual([['2026-11-02', ['a']], ['2026-11-04', ['b', 'c']]]);
  });
  it('seriesEndDate: the day before the first listed occurrence; a one-off lesson has none', () => {
    const item = { id: 'w', recurring: true, occurrenceDate: '2026-11-09' };
    expect(seriesEndDate(item, [{ id: 'w', occurrenceDate: '2026-11-02' }, { id: 'other', occurrenceDate: '2026-10-01' }])).toBe('2026-11-01');
    expect(seriesEndDate({ id: 'o', recurring: false, occurrenceDate: '2026-11-02' })).toBe('');
  });
});

describe('teacher reminder (owner 2026-11-09: in the CRM, never an e-mail)', () => {
  const at = (occurrenceDate) => ({ occurrenceId: occurrenceDate, occurrenceDate });
  it('counts from the start up to yesterday, names the oldest day, and only lessons from before yesterday nudge', () => {
    const items = [at('2026-11-09'), at('2026-11-08'), at('2026-11-07'), at('2026-11-02'), at('2026-10-20')];
    expect(unmarkedReminder(items, today)).toEqual({ total: 3, oldest: '2026-11-02', oldestLabel: '02.11', stale: 2 });
    expect(unmarkedReminder([at('2026-11-08')], today)).toMatchObject({ total: 1, stale: 0 });
    expect(unmarkedReminder([], today)).toEqual({ total: 0, oldest: '', oldestLabel: '', stale: 0 });
  });
  it('a big calendar stays fast', () => {
    const schedule = Array.from({ length: 3000 }, (_, index) => ({ ...one(`w${index}`, '2025-01-06'), recurring: true, day: 'Mon', startDate: '2025-01-06' }));
    const started = Date.now();
    expect(unmarkedLessons({ schedule, today }).length).toBe(3000);
    expect(Date.now() - started).toBeLessThan(5000);
  });
});
