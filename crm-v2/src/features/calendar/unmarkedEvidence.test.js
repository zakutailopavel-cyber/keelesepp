import { actionError, findUnmarkedLessons, liveSessions, summarizeUnmarked, tallinnLocal } from './unmarkedLessons.js';

const today = '2026-11-04';
const one = (id, date, time, extra = {}) => ({ id, studentId: 's1', studentName: 'Mia', teacherUid: 't1', teacher: 'Anna', date, time, duration: 60, status: 'Planeeritud', recurring: false, ...extra });
const summary = (invitationId, startedAt, extra = {}) => ({ id: invitationId, invitationId, studentId: 's1', teacherUid: 't1', teacherName: 'Anna', startedAt, endedAt: '', ...extra });
const kinds = (items) => items.map((item) => `${item.id}:${item.occurrenceDate}:${item.kind}`);

describe('tallinnLocal: UTC ISO → Europe/Tallinn date and time', () => {
  it('summer time (UTC+3) and winter time (UTC+2)', () => {
    expect(tallinnLocal('2026-10-20T07:02:00.000Z')).toEqual({ date: '2026-10-20', time: '10:02' });
    expect(tallinnLocal('2026-11-02T08:05:00.000Z')).toEqual({ date: '2026-11-02', time: '10:05' });
  });
  it('crosses midnight into the local next day', () => {
    expect(tallinnLocal('2026-10-20T22:30:00.000Z')).toEqual({ date: '2026-10-21', time: '01:30' });
  });
  it('empty or broken values give null', () => {
    expect(tallinnLocal('')).toBeNull();
    expect(tallinnLocal('eile')).toBeNull();
  });
});

describe('liveSessions', () => {
  it('a summary and a recording of the same room are one session, the earlier start wins', () => {
    const sessions = liveSessions({
      summaries: [summary('inv1', '2026-10-20T07:05:00.000Z', { endedAt: '2026-10-20T07:58:00.000Z' })],
      recordings: [{ id: 'inv1_1', invitationId: 'inv1', studentId: 's1', teacherUid: 't1', startedAt: '2026-10-20T07:03:00.000Z' }],
    });
    expect(sessions).toHaveLength(1);
    expect(sessions[0]).toMatchObject({ date: '2026-10-20', time: '10:03', endTime: '10:58', sources: ['summary', 'recording'] });
  });
  it('a summary without a start time uses its end time', () => {
    expect(liveSessions({ summaries: [summary('inv2', '', { endedAt: '2026-10-20T08:00:00.000Z' })] })[0]).toMatchObject({ time: '11:00' });
  });
});

describe('findUnmarkedLessons (last 60 days, up to yesterday)', () => {
  it('a live session within ±3 h proves the lesson; one 4 h away does not', () => {
    const schedule = [one('a', '2026-10-20', '10:00'), one('b', '2026-10-22', '10:00')];
    const sessions = liveSessions({ summaries: [summary('i1', '2026-10-20T09:40:00.000Z'), summary('i2', '2026-10-22T11:30:00.000Z')] });
    const items = findUnmarkedLessons({ schedule, sessions, today });
    expect(kinds(items)).toEqual(['b:2026-10-22:teacher', 'a:2026-10-20:evidence']);
    expect(items[1].evidence).toMatchObject({ time: '12:40' });
  });

  it('the window works across midnight', () => {
    const schedule = [one('late', '2026-10-20', '23:30')];
    const sessions = liveSessions({ summaries: [summary('i1', '2026-10-20T22:10:00.000Z')] }); // 01:10 on the 21st
    expect(kinds(findUnmarkedLessons({ schedule, sessions, today }))).toEqual(['late:2026-10-20:evidence']);
  });

  it('weekly series: each past occurrence counts on its own, excluded dates and the future are left out', () => {
    const schedule = [{ id: 'w', studentId: 's1', studentName: 'Mia', teacherUid: 't1', recurring: true, day: 'Mon', startDate: '2026-10-19', time: '15:00', excludedDates: ['2026-10-26'], status: 'Planeeritud' }];
    const sessions = liveSessions({ recordings: [{ id: 'r1', invitationId: 'x', studentId: 's1', teacherUid: 't1', startedAt: '2026-11-02T13:01:00.000Z' }] });
    const items = findUnmarkedLessons({ schedule, sessions, today });
    expect(kinds(items)).toEqual(['w:2026-11-02:evidence', 'w:2026-10-19:teacher']);
    expect(items[0].occurrenceId).toBe('w:2026-11-02');
  });

  it('marked, cancelled, group, older than 60 days and today are not listed', () => {
    const schedule = [
      one('marked', '2026-10-20', '10:00'),
      one('cancelled', '2026-10-21', '10:00', { status: 'Tühistatud' }),
      one('group', '2026-10-21', '12:00', { isGroup: true }),
      one('old', '2026-08-01', '10:00'),
      one('today', today, '08:00'),
    ];
    const lessons = [{ id: 'l1', scheduleId: 'marked', occurrenceDate: '2026-10-20', date: '2026-10-20', studentId: 's1', status: 'Toimunud' }];
    expect(findUnmarkedLessons({ schedule, lessons, today })).toEqual([]);
  });

  it('an older mark of that student at the same time (no schedule id) is this lesson\'s own mark', () => {
    const schedule = [one('a', '2026-10-20', '10:00')];
    const lessons = [{ id: 'old', studentId: 's1', teacherUid: 't1', date: '2026-10-20', time: '10:00', status: 'Toimunud' }];
    expect(findUnmarkedLessons({ schedule, lessons, today })).toEqual([]);
  });

  it('a leftover planned entry on a day with a marked lesson at another time is a likely duplicate; the session belongs to the marked one', () => {
    const schedule = [one('left', '2026-10-20', '10:00'), one('moved', '2026-10-20', '12:00')];
    const lessons = [{ id: 'l1', scheduleId: 'moved', occurrenceDate: '2026-10-20', date: '2026-10-20', time: '12:00', studentId: 's1', teacherUid: 't1', teacher: 'Anna', status: 'Toimunud' }];
    const sessions = liveSessions({ summaries: [summary('i1', '2026-10-20T09:00:00.000Z')] }); // 12:00, also within 3 h of 10:00
    const items = findUnmarkedLessons({ schedule, lessons, sessions, today });
    expect(kinds(items)).toEqual(['left:2026-10-20:duplicate']);
    expect(items[0].duplicateOf).toMatchObject({ source: 'lesson', time: '12:00', status: 'Toimunud' });
  });

  it('two sessions that day: the second lesson is proven, not a duplicate', () => {
    const schedule = [one('second', '2026-10-20', '16:00')];
    const lessons = [{ id: 'l1', scheduleId: 'first', date: '2026-10-20', time: '10:00', studentId: 's1', teacherUid: 't1', status: 'Toimunud' }];
    const sessions = liveSessions({ summaries: [summary('i1', '2026-10-20T07:00:00.000Z'), summary('i2', '2026-10-20T13:00:00.000Z')] });
    expect(kinds(findUnmarkedLessons({ schedule, lessons, sessions, today }))).toEqual(['second:2026-10-20:evidence']);
  });

  it('two unmarked entries and one session: the closer one gets it, the other is a duplicate of it', () => {
    const schedule = [one('near', '2026-10-20', '12:00'), one('far', '2026-10-20', '10:00')];
    const sessions = liveSessions({ summaries: [summary('i1', '2026-10-20T09:05:00.000Z')] }); // 12:05
    const items = findUnmarkedLessons({ schedule, sessions, today });
    expect(kinds(items)).toEqual(['near:2026-10-20:evidence', 'far:2026-10-20:duplicate']);
    expect(items[1].duplicateOf).toMatchObject({ source: 'planned', time: '12:00' });
  });

  it('another teacher\'s session or another student\'s session is not evidence', () => {
    const schedule = [one('a', '2026-10-20', '10:00')];
    const sessions = liveSessions({ summaries: [summary('i1', '2026-10-20T07:00:00.000Z', { teacherUid: 't2' }), summary('i2', '2026-10-20T07:00:00.000Z', { studentId: 's2' })] });
    expect(kinds(findUnmarkedLessons({ schedule, sessions, today }))).toEqual(['a:2026-10-20:teacher']);
  });

  it('a teacher sees only his own lessons', () => {
    const schedule = [one('mine', '2026-10-20', '10:00'), one('theirs', '2026-10-20', '11:00', { teacherUid: 't2', studentId: 's2' })];
    expect(findUnmarkedLessons({ schedule, today, teacherUid: 't1' }).map((item) => item.id)).toEqual(['mine']);
  });

  it('summarizeUnmarked counts by suggestion', () => {
    expect(summarizeUnmarked([{ kind: 'evidence' }, { kind: 'teacher' }, { kind: 'teacher' }, { kind: 'duplicate' }])).toEqual({ total: 4, evidence: 1, duplicate: 1, teacher: 2 });
  });

  it('a lesson refused by the rules shows the calendar\'s message', () => {
    expect(actionError({ code: 'permission-denied' }, 'x')).toMatch(/arvel või periood on suletud/);
    expect(actionError(new Error('Muu viga'), 'x')).toBe('Muu viga');
  });
});
