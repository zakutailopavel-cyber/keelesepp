import { describe, expect, it } from 'vitest';
import { buildRequest, isAbsenceOnly, isLate, proposalSlots, requestFor } from './rescheduleModel.js';

const availability = { slots: [{ kind: 'free', day: 'Fri', start: '14:00', end: '18:00' }, { kind: 'free', day: 'Sat', start: '10:00', end: '12:00' }, { kind: 'busy', day: 'Sat', start: '10:00', end: '11:00' }] };
const lesson = { id: 'sch-1', occurrenceDate: '2026-10-13', time: '16:00', duration: 60, teacherUid: 't1', teacher: 'Pavel' };

describe('lesson rescheduling', () => {
  it('offers one free time per day from the teacher windows, never in the past or on the student\'s own lessons', () => {
    const slots = proposalSlots({ availability, lesson, from: '2026-10-13', days: 7, now: new Date('2026-10-12T12:00:00'), busy: [{ date: '2026-10-16', time: '14:00', duration: 60 }] });
    expect(slots).toEqual([{ date: '2026-10-16', time: '15:00' }, { date: '2026-10-17', time: '10:00' }]);
  });

  it('warns when less than 24 hours are left', () => {
    expect(isLate(lesson, new Date('2026-10-13T10:00:00'))).toBe(true);
    expect(isLate(lesson, new Date('2026-10-11T10:00:00'))).toBe(false);
  });

  it('needs a proposed or written time and keeps at most three', () => {
    const student = { id: 's1', name: 'Полина' };
    const user = { uid: 'u1', displayName: 'Полина' };
    expect(() => buildRequest({ lesson, student, user, role: 'student' })).toThrow('Vali uus aeg');
    const request = buildRequest({ lesson, student, user, role: 'student', proposals: [{ date: 'a', time: '1' }, { date: 'b', time: '2' }, { date: 'c', time: '3' }, { date: 'd', time: '4' }], reason: ' kunstikool ', now: new Date('2026-10-12T12:00:00') });
    expect(request).toMatchObject({ scheduleId: 'sch-1', occurrenceDate: '2026-10-13', teacherUid: 't1', status: 'pending', reason: 'kunstikool', late: false });
    expect(request.proposals).toHaveLength(3);
    expect(isAbsenceOnly(request)).toBe(false);
  });

  it('sends a plain notice of absence with no new time', () => {
    const request = buildRequest({ lesson, student: { id: 's1', name: 'Mia' }, user: { uid: 'p1' }, role: 'parent', absent: true, proposals: [{ date: 'a', time: '1' }], other: 'reedel' });
    expect(request).toMatchObject({ proposals: [], other: '', status: 'pending' });
    expect(isAbsenceOnly(request)).toBe(true);
    expect(isAbsenceOnly({ proposals: [], other: 'reedel' })).toBe(false);
    expect(isAbsenceOnly(null)).toBe(false);
  });

  it('finds the newest request of a lesson occurrence', () => {
    const requests = [{ scheduleId: 'sch-1', occurrenceDate: '2026-10-13', createdAt: '1', status: 'declined' }, { scheduleId: 'sch-1', occurrenceDate: '2026-10-13', createdAt: '2', status: 'pending' }, { scheduleId: 'x', occurrenceDate: '2026-10-13', createdAt: '3' }];
    expect(requestFor(requests, lesson).status).toBe('pending');
    expect(requestFor(requests, null)).toBeNull();
  });
});
