import { attendanceMarks, calendarStatusOf, markLabel, markValue, plannedStartMs, suggestMark } from './roomAttendance.js';
import { handoffFields, saveLessonHandoff, takeLessonHandoff } from './lessonHandoff.js';
import { lessonTimingFor, rememberLessonTiming } from './lessonLink.js';

const start = new Date(2026, 10, 4, 16, 0).getTime();
const at = (minutes) => new Date(start + minutes * 60_000).toISOString();

describe('in-room attendance: prefill from who joined and when', () => {
  it('suggests Kohal, Hilines (minutes after the start) or Puudub', () => {
    expect(suggestMark({ joinedAt: at(2) }, start)).toMatchObject({ status: 'present', lateMinutes: 0, joinedAt: at(2) });
    expect(suggestMark({ joinedAt: at(5) }, start).status).toBe('present');
    expect(suggestMark({ joinedAt: at(12) }, start)).toMatchObject({ status: 'late', lateMinutes: 12 });
    expect(suggestMark({ joinedAt: null, online: false }, start)).toMatchObject({ status: 'absent', lateMinutes: 0 });
    // online without a known join time (a group member seen in the room): present
    expect(suggestMark({ online: true }, start).status).toBe('present');
    // Firestore Timestamp-like values work too
    expect(suggestMark({ joinedAt: { toMillis: () => start + 20 * 60_000 } }, start)).toMatchObject({ status: 'late', lateMinutes: 20 });
  });

  it('the teacher’s saved mark wins over the suggestion', () => {
    const participants = [{ studentId: 's1', name: 'Mari', joinedAt: at(1) }, { studentId: 's2', name: 'Jaan' }, { studentId: '' }];
    const marks = attendanceMarks(participants, { s1: { status: 'late', lateMinutes: 7, name: 'Mari' } }, start);
    expect(marks).toEqual([
      { studentId: 's1', name: 'Mari', status: 'late', lateMinutes: 7, joinedAt: '', auto: false },
      { studentId: 's2', name: 'Jaan', status: 'absent', lateMinutes: 0, joinedAt: '', auto: true },
    ]);
    expect(markLabel(marks[0])).toBe('Hilines 7 min');
    expect(markLabel(marks[1])).toBe('Puudub');
  });

  it('a saved mark carries minutes only when late', () => {
    expect(markValue({ name: 'Mari', joinedAt: at(1) }, 'present', 9)).toEqual({ name: 'Mari', status: 'present', lateMinutes: 0, joinedAt: at(1) });
    expect(markValue({ name: 'Mari' }, 'late', '15')).toMatchObject({ status: 'late', lateMinutes: 15 });
    expect(markValue({ name: 'Mari' }, 'late', 0).lateMinutes).toBe(6);
    expect(markValue({}, 'bogus').status).toBe('present');
  });

  it('the planned start comes from the calendar lesson (day + time) remembered with the room', () => {
    rememberLessonTiming('inv-1', { date: '2026-11-04', time: '16:00', duration: 45 });
    expect(lessonTimingFor('inv-1')).toEqual({ date: '2026-11-04', time: '16:00', duration: 45 });
    expect(plannedStartMs(lessonTimingFor('inv-1'))).toBe(start);
    expect(plannedStartMs(null)).toBe(0);
    expect(lessonTimingFor('nope')).toBeNull();
  });
});

describe('in-room attendance → the calendar’s existing „Toimunud” flow', () => {
  const memory = () => { const data = {}; return { getItem: (k) => data[k] ?? null, setItem: (k, v) => { data[k] = String(v); } }; };
  const KEY = 'sched-1:2026-11-04|2026-11-04';

  it('maps Kohal / Hilines → Toimunud and Puudub → Puudus_eta (the calendar’s own statuses)', () => {
    expect(calendarStatusOf({ status: 'present' })).toBe('Toimunud');
    expect(calendarStatusOf({ status: 'late', lateMinutes: 10 })).toBe('Toimunud');
    expect(calendarStatusOf({ status: 'absent' })).toBe('Puudus_eta');
    expect(calendarStatusOf(null)).toBeNull();
  });

  it('the handoff carries the status into completeFromSchedule’s fields; anything else is dropped', () => {
    const store = memory();
    saveLessonHandoff(KEY, { notes: '', lessonIds: [], status: 'Puudus_eta' }, store, 1000);
    const handoff = takeLessonHandoff(KEY, store, 2000);
    expect(handoff.status).toBe('Puudus_eta');
    expect(handoffFields({ topic: 'T', notes: '' }, handoff)).toEqual({ topic: 'T', notes: '', status: 'Puudus_eta' });
    saveLessonHandoff(KEY, { status: 'Puudus_p' }, store, 1000);
    const other = takeLessonHandoff(KEY, store, 2000);
    expect(other.status).toBeUndefined();
    expect(handoffFields({ topic: 'T' }, other)).toEqual({ topic: 'T' });
    expect(handoffFields({ topic: 'T' }, null)).toEqual({ topic: 'T' });
  });
});
