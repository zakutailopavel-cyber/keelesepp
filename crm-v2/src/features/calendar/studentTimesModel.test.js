import { candidateTimes, clashesAt, dayOfDate, lessonsOn, overlayBandsOn, planningWarnings, studentBandsOn, studentStateAt, timesLine, usualDuration, usualOnline } from './studentTimesModel.js';

// week of Mon 2026-11-02 … Sun 2026-11-08; the poll stores an hour as two half hours
const hours = (day, from, to) => Array.from({ length: (to - from) * 2 }, (_, index) => `${day}-${String(from + Math.floor(index / 2)).padStart(2, '0')}:${index % 2 ? '30' : '00'}`);
const mari = { slots: [...hours('Mon', 16, 19), ...hours('Wed', 10, 12)], preferred: hours('Mon', 17, 18) };
const week = ['2026-11-02', '2026-11-03', '2026-11-04', '2026-11-05', '2026-11-06', '2026-11-07', '2026-11-08'];
const past = new Date('2026-10-01T12:00:00');
const lesson = (extra) => ({ id: 'x', studentId: 's9', studentName: 'Keegi', teacher: 'Pavel', teacherUid: 't1', date: '2026-11-02', time: '16:00', duration: 60, recurring: false, status: 'Planeeritud', ...extra });

describe('student times × teacher windows × lessons', () => {
  it('reads a lesson against the half hours: ★, suits, partly, not, no times', () => {
    expect(studentStateAt(mari, { date: '2026-11-02', time: '17:00', duration: 60 })).toBe('best');
    expect(studentStateAt(mari, { date: '2026-11-02', time: '16:00', duration: 60 })).toBe('ok');
    expect(studentStateAt(mari, { date: '2026-11-02', time: '18:30', duration: 60 })).toBe('partial');
    expect(studentStateAt(mari, { date: '2026-11-02', time: '16:15', duration: 45 })).toBe('ok');
    expect(studentStateAt(mari, { date: '2026-11-03', time: '16:00', duration: 60 })).toBe('none');
    expect(studentStateAt(null, { date: '2026-11-02', time: '16:00' })).toBe('unknown');
  });

  it('shades a date: ranges in minutes, ★ apart, weekly by weekday', () => {
    expect(studentBandsOn(mari, '2026-11-02')).toEqual([{ start: 960, end: 1020, kind: 'ok' }, { start: 1020, end: 1080, kind: 'best' }, { start: 1080, end: 1140, kind: 'ok' }]);
    expect(studentBandsOn(mari, '2026-11-09')).toEqual(studentBandsOn(mari, '2026-11-02'));
    expect(studentBandsOn(mari, '2026-11-03')).toEqual([]);
  });

  it('keeps the weekday in a DST week (EU: clocks back on Sun 2026-10-25, forward on Sun 2026-03-29)', () => {
    expect(['2026-10-24', '2026-10-25', '2026-10-26'].map(dayOfDate)).toEqual(['Sat', 'Sun', 'Mon']);
    expect(['2026-03-28', '2026-03-29', '2026-03-30'].map(dayOfDate)).toEqual(['Sat', 'Sun', 'Mon']);
    const sunday = { slots: hours('Sun', 10, 12), preferred: [] };
    expect(studentBandsOn(sunday, '2026-10-25')).toEqual([{ start: 600, end: 720, kind: 'ok' }]);
    expect(studentBandsOn(sunday, '2026-03-29')).toEqual([{ start: 600, end: 720, kind: 'ok' }]);
    // a weekly lesson checked over a DST change keeps its weekday
    const sundayLesson = lesson({ id: 'sun', studentId: 'm', recurring: true, startDate: '2026-10-18', date: '2026-10-18', day: 'Sun', time: '10:00' });
    expect(clashesAt([sundayLesson], { date: '2026-10-18', time: '10:30', recurring: true, weeks: 3 }, { studentIds: ['m'] }).map((entry) => entry.date)).toEqual(['2026-10-18', '2026-10-25', '2026-11-01']);
  });

  it('several students: where all can, where only some can', () => {
    const jaan = { slots: hours('Mon', 17, 20), preferred: hours('Mon', 17, 18) };
    const bands = overlayBandsOn([{ name: 'Mari', availability: mari }, { name: 'Jaan', availability: jaan }, { name: 'Uus', availability: null }], '2026-11-02');
    expect(bands.map(({ start, end, kind }) => [start, end, kind])).toEqual([[960, 1020, 'some'], [1020, 1080, 'best'], [1080, 1140, 'ok'], [1140, 1200, 'some']]);
    expect(bands[0].names).toEqual(['Mari']);
  });

  it('finds the teacher\'s and the student\'s lessons, groups included', () => {
    const group = { id: 'g', isGroup: true, studentIds: ['s1'], studentName: 'Grupp A', teacher: 'Jelena', teacherUid: 't2', recurring: true, startDate: '2026-10-05', day: 'Mon', time: '18:00', duration: 90, status: 'Planeeritud' };
    const events = [lesson({ id: 'a' }), lesson({ id: 'b', teacherUid: 't3', teacher: 'Olga', studentId: 's1', time: '16:30' }), group, lesson({ id: 'c', status: 'Tühistatud' })];
    expect(lessonsOn(events, '2026-11-02', { teacherUid: 't1', studentIds: ['s1'] }).map((entry) => entry.event.id)).toEqual(['a', 'b', 'g']);
    expect(lessonsOn(events, '2026-11-02', { teacherUid: 't1', studentIds: ['s1'], ignoreId: 'a' }).map((entry) => entry.event.id)).toEqual(['b', 'g']);
  });

  it('candidate times: student ★ first, teacher green before unmarked, no red, no clash of teacher, student, group or room', () => {
    const teacherAvailability = { slots: [{ id: 'w1', kind: 'free', day: 'Mon', start: '16:00', end: '18:00' }, { id: 'w2', kind: 'busy', day: 'Wed', start: '10:00', end: '11:00' }] };
    const events = [
      lesson({ id: 'teacher', time: '16:00', duration: 30, studentId: 'other' }), // teacher busy 16:00–16:30 Mon
      { id: 'grp', isGroup: true, studentIds: ['s1'], studentName: 'Grupp', teacher: 'Jelena', teacherUid: 't2', recurring: true, startDate: '2026-10-07', day: 'Wed', time: '11:30', duration: 30, status: 'Planeeritud' },
    ];
    const list = candidateTimes({ studentId: 's1', studentAvailability: mari, teacherUid: 't1', teacherName: 'Pavel', teacherAvailability, events, dates: week, duration: 60, now: past });
    expect(list.map((item) => `${item.date.slice(-2)} ${item.time} ${item.student} ${item.teacher}`)).toEqual([
      '02 17:00 best free',
      '02 16:30 ok free',
      '02 17:30 ok open',
      '02 18:00 ok open',
    ]);
    // Wed 10:00 red, 11:00 group lesson at 11:30 → nothing on Wednesday; online-only window allows an online lesson only
    const yellow = { slots: [{ id: 'y', kind: 'online', day: 'Wed', start: '10:00', end: '12:00' }] };
    expect(candidateTimes({ studentId: 's1', studentAvailability: mari, teacherUid: 't1', teacherAvailability: yellow, dates: ['2026-11-04'], now: past })).toEqual([]);
    expect(candidateTimes({ studentId: 's1', studentAvailability: mari, teacherUid: 't1', teacherAvailability: yellow, dates: ['2026-11-04'], online: true, now: past }).map((item) => item.time)).toEqual(['10:00', '10:30', '11:00']);
    // no times saved → no candidates; past times are skipped
    expect(candidateTimes({ studentId: 's1', studentAvailability: null, dates: week })).toEqual([]);
    expect(candidateTimes({ studentId: 's1', studentAvailability: mari, dates: week, now: new Date('2026-11-04T10:15:00') }).map((item) => `${item.date.slice(-2)} ${item.time}`)).toEqual(['04 10:30', '04 11:00']);
  });

  it('candidate times: a weekly lesson must be free on the next weeks too; on site needs a free room', () => {
    const later = lesson({ id: 'later', teacherUid: 't1', studentId: 'other', date: '2026-11-16', time: '17:00' });
    const one = candidateTimes({ studentId: 's1', studentAvailability: mari, teacherUid: 't1', events: [later], dates: ['2026-11-02'], duration: 60, recurring: false, now: past }).map((item) => item.time);
    const weekly = candidateTimes({ studentId: 's1', studentAvailability: mari, teacherUid: 't1', events: [later], dates: ['2026-11-02'], duration: 60, recurring: true, now: past }).map((item) => item.time);
    expect(one).toContain('17:00');
    expect(weekly).not.toContain('17:00');
    expect(weekly).not.toContain('16:30');
    const rooms = [{ id: 'r1', name: 'Kabinet 1' }];
    const bookings = [{ scheduleId: 'z', roomId: 'r1', recurring: false, date: '2026-11-02', time: '16:00', duration: 120, status: 'Planeeritud' }];
    expect(candidateTimes({ studentId: 's1', studentAvailability: mari, dates: ['2026-11-02'], rooms, bookings, recurring: false, now: past }).map((item) => item.time)).toEqual(['18:00']);
    expect(candidateTimes({ studentId: 's1', studentAvailability: mari, dates: ['2026-11-02'], rooms, bookings, recurring: false, online: true, now: past })).toHaveLength(5);
  });

  it('warnings: outside the student\'s times, a clash of the student or the teacher, the teacher\'s windows', () => {
    const student = { id: 's1', name: 'Mari' };
    const events = [lesson({ id: 'own', studentId: 's1', teacherUid: 't2', teacher: 'Jelena', time: '10:00', date: '2026-11-04' }), lesson({ id: 'other', studentId: 's7', studentName: 'Jaan', time: '19:00' })];
    const teacherAvailability = { slots: [{ id: 'f', kind: 'free', day: 'Mon', start: '16:00', end: '18:00' }, { id: 'b', kind: 'busy', day: 'Mon', start: '19:00', end: '20:00' }] };
    const kinds = (lessonFields, extra = {}) => planningWarnings({ lesson: { duration: 60, ...lessonFields }, student, studentAvailability: mari, teacherUid: 't1', teacherName: 'Pavel', teacherAvailability, events, ...extra }).map((item) => item.kind);
    expect(kinds({ date: '2026-11-02', time: '16:00' })).toEqual([]);
    expect(kinds({ date: '2026-11-02', time: '18:30' })).toEqual(['student-time', 'teacher-lesson', 'teacher-window']);
    expect(kinds({ date: '2026-11-04', time: '10:30' })).toEqual(['student-lesson']);
    expect(kinds({ date: '2026-11-02', time: '17:30' })).toEqual(['teacher-window']);
    expect(kinds({ date: '2026-11-02', time: '19:00', id: 'other' })).toEqual(['student-time', 'teacher-window']);
    expect(kinds({ date: '2026-11-02', time: '18:30' }, { includeTeacherLessons: false })).toEqual(['student-time', 'teacher-window']);
    const text = planningWarnings({ lesson: { date: '2026-11-04', time: '10:30', duration: 60 }, student, studentAvailability: mari, teacherUid: 't1', teacherName: 'Pavel', events })[0].text;
    expect(text).toBe('Mari: samal ajal on õpilasel teine tund — 10:00 Keegi (Jelena).');
    // no times saved: nothing about the student's times
    expect(planningWarnings({ lesson: { date: '2026-11-03', time: '09:00' }, student, studentAvailability: null, events: [] })).toEqual([]);
  });

  it('usual length and format, and a short line of times', () => {
    const events = [lesson({ id: '1', studentId: 's1', duration: 45, online: true, date: '2026-10-01' }), lesson({ id: '2', studentId: 's1', duration: 45, date: '2026-10-08' }), lesson({ id: '3', studentId: 's1', duration: 90, teacherUid: 't2', date: '2026-09-01' })];
    expect(usualDuration(events, 's1')).toBe(45);
    expect(usualDuration(events, 's1', 't2')).toBe(90);
    expect(usualDuration(events, 'nobody')).toBe(60);
    expect(usualOnline(events, 's1')).toBe(false);
    expect(usualOnline(events, 'nobody')).toBe(null);
    expect(timesLine(mari)).toBe('E 16–19 (★ 17–18) · K 10–12');
    expect(timesLine(null)).toBe('');
  });
});
