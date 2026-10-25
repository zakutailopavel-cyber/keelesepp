import { describe, expect, it } from 'vitest';
import { distribute, dragMarks, judgeAll, judgeSlot, lessonPayload, moveDraft, nextMonday, openRequests, patternDates, placeRequest, planningRequests, planSummary, plannerContext } from './plannerModel.js';

const START = '2026-11-02'; // a Monday
const times = (slots, preferred = []) => ({ slots, preferred });
const halves = (day, from, to) => {
  const out = [];
  for (let at = from * 60; at < to * 60; at += 30) out.push(`${day}-${String(Math.floor(at / 60)).padStart(2, '0')}:${at % 60 ? '30' : '00'}`);
  return out;
};
const request = (id, extra = {}) => ({ key: `${id}|Eesti keel|t1`, studentId: id, studentName: id, subject: 'Eesti keel', teacherUid: 't1', teacher: 'Pavel', duration: 60, online: true, perWeek: 1, ...extra });
const context = ({ studentTimes = {}, teacherTimes = {}, events = [], rooms = [], bookings = [], startDate = START, replacedIds = [] } = {}) => plannerContext({
  startDate, events, rooms, bookings, replacedIds, studentTimes: new Map(Object.entries(studentTimes)), teacherTimes: (who) => teacherTimes[who.teacherUid] || null,
});

describe('planner: the weekly pattern', () => {
  it('maps every weekday to its first date on or after the start, Monday first; next Monday', () => {
    expect(patternDates('2026-11-04')).toEqual(['2026-11-09', '2026-11-10', '2026-11-04', '2026-11-05', '2026-11-06', '2026-11-07', '2026-11-08']);
    expect(nextMonday('2026-10-25')).toBe('2026-10-26');
    expect(nextMonday('2026-10-26')).toBe('2026-11-02');
  });

  it('is DST-safe: a week over the autumn and the spring change keeps weekdays and wall-clock times', () => {
    expect(patternDates('2026-10-19')).toEqual(['2026-10-19', '2026-10-20', '2026-10-21', '2026-10-22', '2026-10-23', '2026-10-24', '2026-10-25']);
    expect(patternDates('2026-03-23').at(-1)).toBe('2026-03-29');
    const ctx = context({ startDate: '2026-10-19', studentTimes: { a: times(halves('Sun', 16, 18), halves('Sun', 16, 17)) } });
    const { lessons } = distribute(ctx, [request('a')]);
    expect(lessons[0]).toMatchObject({ date: '2026-10-25', day: 'Sun', time: '16:00' });
    expect(lessonPayload(lessons[0])).toMatchObject({ date: '2026-10-25', time: '16:00', recurring: true });
  });
});

describe('planner: „Lisa kõik õpilased”', () => {
  const today = '2026-10-25';
  const students = [
    { id: 'a', name: 'Anna', teacher: 'Pavel', teacherUid: 't1', subject: 'Eesti keel' },
    { id: 'b', name: 'Boris', enrollments: [{ subject: 'Eesti keel', teacher: 'Pavel', teacherUid: 't1' }, { subject: 'Matemaatika', teacher: 'Jelena' }] },
    { id: 'c', name: 'Cärol', teacher: 'Pavel', teacherUid: 't1', planningPausedUntil: '2026-11-30' },
    { id: 'd', name: 'Dora', enrollments: [{ subject: 'Eesti keel', teacherUid: 't1', teacher: 'Pavel', status: 'paused' }] },
    { id: 'e', name: 'Eero', active: false, teacherUid: 't1' },
  ];
  const events = [
    // Anna: a weekly series ahead (planned) with 45 min lessons on site
    { id: 'a-series', studentId: 'a', teacherUid: 't1', teacher: 'Pavel', subject: 'Eesti keel', recurring: true, startDate: '2026-09-01', date: '2026-09-01', day: 'Tue', time: '10:00', duration: 45, online: false },
    // Boris, Eesti keel: two lessons a week until last week, online
    { id: 'b1', studentId: 'b', teacherUid: 't1', teacher: 'Pavel', subject: 'Eesti keel', recurring: true, startDate: '2026-09-01', date: '2026-09-01', day: 'Mon', time: '16:00', duration: 90, online: true, endDate: '2026-10-20' },
    { id: 'b2', studentId: 'b', teacherUid: 't1', teacher: 'Pavel', subject: 'Eesti keel', recurring: true, startDate: '2026-09-01', date: '2026-09-03', day: 'Thu', time: '16:00', duration: 90, online: true, endDate: '2026-10-20' },
  ];
  const teachers = [{ id: 't1', name: 'Pavel' }, { id: 't2', name: 'Jelena' }];

  it('takes every active direction without a weekly lesson ahead, with its teacher, length, format and lessons per week', () => {
    const list = planningRequests({ students, events, today, teachers });
    expect(list.map((item) => item.key)).toEqual(['b|Eesti keel|t1', 'b|Matemaatika|t2']);
    expect(list[0]).toMatchObject({ teacherUid: 't1', duration: 90, online: true, perWeek: 2, planned: false, replaces: [] });
    // Matemaatika: the teacher found by name, nothing before → 60 min, one lesson, the student's newest lesson's format
    expect(list[1]).toMatchObject({ teacherUid: 't2', teacher: 'Jelena', duration: 60, perWeek: 1, online: true });
  });

  it('a full re-plan also takes the planned directions and names the series it replaces; one teacher only', () => {
    const list = planningRequests({ students, events, today, teachers, includePlanned: true, teacherUid: 't1' });
    expect(list.map((item) => item.key)).toEqual(['a|Eesti keel|t1', 'b|Eesti keel|t1']);
    expect(list[0]).toMatchObject({ planned: true, replaces: ['a-series'], duration: 45, online: false, perWeek: 1 });
  });

  it('a group lesson of the same teacher counts as planned (groups are never re-planned)', () => {
    const group = { id: 'group:g:1', isGroup: true, studentIds: ['b'], teacherUid: 't2', teacher: 'Jelena', recurring: true, startDate: '2026-09-01', day: 'Wed', time: '18:00', duration: 60 };
    const list = planningRequests({ students, events: [...events, group], today, teachers, includePlanned: true });
    expect(list.map((item) => item.key)).not.toContain('b|Matemaatika|t2');
  });
});

describe('planner: „Jaota”', () => {
  it('is deterministic and puts ★ times first', () => {
    const studentTimes = { a: times([...halves('Mon', 10, 12), ...halves('Wed', 15, 17)], halves('Wed', 15, 16)) };
    const run = () => distribute(context({ studentTimes }), [request('a')]);
    expect(run()).toEqual(run());
    expect(run().lessons[0]).toMatchObject({ day: 'Wed', time: '15:00' });
  });

  it('never double-books a teacher or a student, also across directions with other teachers and lessons that stay', () => {
    const studentTimes = { a: times(halves('Mon', 16, 18), halves('Mon', 16, 17)), b: times(halves('Mon', 16, 18), halves('Mon', 16, 17)), c: times(halves('Mon', 16, 19)) };
    const stay = { id: 'stay', studentId: 'c', studentName: 'C', teacherUid: 't2', teacher: 'Jelena', recurring: true, startDate: '2026-10-05', day: 'Mon', time: '17:00', duration: 60 };
    const ctx = context({ studentTimes, events: [stay] });
    const { lessons, unplaced } = distribute(ctx, [request('a'), request('b'), request('c', { key: 'c|Inglise keel|t1', subject: 'Inglise keel' })]);
    expect(unplaced).toEqual([]);
    const judged = judgeAll(ctx, lessons);
    expect(judged.every((entry) => entry.status !== 'overlap')).toBe(true);
    const c = lessons.find((lesson) => lesson.studentId === 'c');
    expect(c.time).not.toBe('17:00');
    expect(new Set(lessons.map((lesson) => lesson.time)).size).toBe(3);
  });

  it('respects the teacher: red never chosen while a good time exists, yellow only for online lessons', () => {
    const studentTimes = { a: times(halves('Tue', 9, 13), halves('Tue', 9, 11)), b: times(halves('Tue', 9, 13), halves('Tue', 9, 11)) };
    const teacherTimes = { t1: { slots: [{ id: 'w1', day: 'Tue', kind: 'busy', start: '09:00', end: '10:00' }, { id: 'w2', day: 'Tue', kind: 'online', start: '10:00', end: '11:00' }] } };
    const ctx = context({ studentTimes, teacherTimes });
    const { lessons } = distribute(ctx, [request('a', { online: false }), request('b', { online: true })]);
    const byStudent = Object.fromEntries(lessons.map((lesson) => [lesson.studentId, lesson.time]));
    expect(byStudent.b).toBe('10:00');
    expect(['11:00', '11:30', '12:00']).toContain(byStudent.a);
    expect(judgeSlot(ctx, request('b', { online: true }), { date: '2026-11-03', time: '10:00' }).colour).toBe('yellow');
  });

  it('gives an on-site lesson a free room, and none when every room is taken', () => {
    const studentTimes = { a: times(halves('Mon', 10, 11), halves('Mon', 10, 11)), b: times(halves('Mon', 10, 11), halves('Mon', 10, 11)) };
    const rooms = [{ id: 'r1', name: 'Kabinet 1' }];
    const ctx = context({ studentTimes, rooms });
    const { lessons } = distribute(ctx, [request('a', { online: false }), request('b', { online: false, teacherUid: 't2', teacher: 'Jelena', key: 'b|Eesti keel|t2' })]);
    const judged = judgeAll(ctx, lessons);
    expect(lessons.map((lesson) => lesson.roomId).sort()).toEqual(['', 'r1']);
    expect(judged.find((entry) => !entry.lesson.roomId).fit.noRoom).toBe(true);
    // a room taken by a lesson that stays
    const booked = context({ studentTimes, rooms, bookings: [{ scheduleId: 'x', roomId: 'r1', recurring: true, startDate: '2026-10-05', day: 'Mon', time: '10:00', duration: 60 }] });
    expect(judgeSlot(booked, request('a', { online: false }), { date: START, time: '10:00' }).noRoom).toBe(true);
  });

  it('spreads several lessons a week over different days', () => {
    const studentTimes = { a: times([...halves('Mon', 15, 19), ...halves('Thu', 15, 19)], [...halves('Mon', 15, 19)]) };
    const { lessons } = distribute(context({ studentTimes }), [request('a', { perWeek: 2 })]);
    expect(lessons.map((lesson) => lesson.day).sort()).toEqual(['Mon', 'Thu']);
  });

  it('moves a placed lesson out of the way (one step back) so a harder student keeps a good time', () => {
    // b can only Mon 10; a can Mon 10 (★) or Tue 10. b is harder and goes first anyway; with a pinned order the repair
    // is checked by placing a first by hand-less kept list
    const studentTimes = { a: times([...halves('Mon', 10, 11), ...halves('Tue', 10, 11)], halves('Mon', 10, 11)), b: times(halves('Mon', 10, 11)) };
    const ctx = context({ studentTimes });
    const first = distribute(ctx, [request('a')]).lessons;
    expect(first[0]).toMatchObject({ day: 'Mon', time: '10:00' });
    const { lessons } = distribute(ctx, [request('b')], first.map((lesson) => ({ ...lesson, pinned: false })));
    expect(lessons.map((lesson) => `${lesson.studentId} ${lesson.day} ${lesson.time}`).sort()).toEqual(['a Tue 10:00', 'b Mon 10:00']);
  });

  it('a student who does not fit gets the best partly fitting time over another student (marked), never dropped', () => {
    const studentTimes = { a: times(halves('Mon', 10, 11), halves('Mon', 10, 11)), b: times(halves('Mon', 10, 11), halves('Mon', 10, 11)) };
    const ctx = context({ studentTimes });
    const { lessons, unplaced } = distribute(ctx, [request('a'), request('b')]);
    expect(unplaced).toEqual([]);
    expect(lessons.map((lesson) => lesson.time)).toEqual(['10:00', '10:00']);
    const judged = judgeAll(ctx, lessons);
    expect(judged.map((entry) => entry.status)).toEqual(['overlap', 'overlap']);
    expect(judged[0].fit.reasons.join(' ')).toMatch(/Kattub: (a|b)/);
    expect(planSummary(judged, unplaced)).toEqual({ best: 0, ok: 0, agree: 0, overlap: 2, unplaced: 0, total: 2 });
  });

  it('names why a student is not placed: no „Sobivad ajad”, no teacher', () => {
    const ctx = context({ studentTimes: { a: times(halves('Mon', 10, 11)) } });
    const { lessons, unplaced } = distribute(ctx, [request('a'), request('x'), request('y', { teacherUid: '', teacher: '' })]);
    expect(lessons).toHaveLength(1);
    expect(unplaced).toEqual([{ key: 'x|Eesti keel|t1', reason: 'no-times' }, { key: 'y|Eesti keel|t1', reason: 'no-teacher' }]);
    expect(openRequests([request('a'), request('x')], lessons, unplaced)).toEqual([{ request: request('x'), missing: 1, reason: 'no-times' }]);
  });

  it('keeps lessons moved by hand when distributing again', () => {
    const studentTimes = { a: times(halves('Mon', 10, 12), halves('Mon', 10, 11)) };
    const ctx = context({ studentTimes });
    const first = distribute(ctx, [request('a')]).lessons;
    const moved = moveDraft(ctx, first, first[0].id, { date: '2026-11-03', time: '14:00', duration: 60 });
    expect(moved[0]).toMatchObject({ day: 'Tue', time: '14:00', pinned: true });
    expect(judgeAll(ctx, moved)[0].status).toBe('agree');
    const again = distribute(ctx, [request('a')], moved.filter((lesson) => lesson.pinned));
    expect(again.lessons).toHaveLength(1);
    expect(again.lessons[0].time).toBe('14:00');
  });
});

describe('planner: colours while dragging', () => {
  it('green ★ + teacher free, yellow suitable or online-only, red cannot / overlap', () => {
    const studentTimes = { a: times([...halves('Mon', 10, 13)], halves('Mon', 10, 11)), b: times(halves('Mon', 14, 15)) };
    const teacherTimes = { t1: { slots: [{ id: 'w', day: 'Mon', kind: 'online', start: '12:00', end: '13:00' }] } };
    const ctx = context({ studentTimes, teacherTimes });
    const other = placeRequest(ctx, [], request('b'), { date: START, time: '14:00' });
    const marks = dragMarks(ctx, request('a', { online: true }), START, other);
    const at = (clock) => marks.find((mark) => mark.start === Number(clock.slice(0, 2)) * 60 + Number(clock.slice(3))).kind;
    expect(at('10:00')).toBe('plan-green');
    expect(at('11:00')).toBe('plan-yellow');
    expect(at('12:00')).toBe('plan-yellow');
    expect(at('14:00')).toBe('plan-red');
    expect(at('08:00')).toBe('plan-red');
    expect(marks.find((mark) => mark.start === 14 * 60).title).toMatch(/Kattub: b/);
    expect(dragMarks(context({ studentTimes, teacherTimes }), request('a', { online: false }), START, []).find((mark) => mark.start === 12 * 60).kind).toBe('plan-red');
  });
});
