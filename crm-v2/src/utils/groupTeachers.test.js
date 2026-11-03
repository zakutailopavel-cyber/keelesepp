import { describe, expect, it } from 'vitest';
import { groupTeacherOn, taughtBy, teacherPeriods, withTeacherChange } from './groupTeachers.js';
import { groupCalendarEvents, occurrencesForDates } from '../features/calendar/calendarView.js';

const group = {
  id: 'g1', name: 'Õhturühm', teacher: 'Uus Õpetaja', teacherUid: 'new', students: ['s1'],
  lessons: [{ id: 'l1', day: 'Tue', time: '17:00', startDate: '2026-10-06', recurring: true }],
  teacherHistory: [{ teacher: 'Vana Õpetaja', teacherUid: 'old', until: '2026-11-02' }],
};

describe('group teacher history', () => {
  it('gives every date the teacher who taught it', () => {
    expect(teacherPeriods(group)).toEqual([
      { teacher: 'Vana Õpetaja', teacherUid: 'old', from: '', until: '2026-11-02' },
      { teacher: 'Uus Õpetaja', teacherUid: 'new', from: '2026-11-03', until: '' },
    ]);
    expect(groupTeacherOn(group, '2026-10-27').teacherUid).toBe('old');
    expect(groupTeacherOn(group, '2026-11-03').teacherUid).toBe('new');
    expect(taughtBy(group, 'old')).toBe(true);
    expect(taughtBy(group, 'other')).toBe(false);
  });

  it('keeps past lessons with the old teacher when the teacher changes', () => {
    const before = { teacher: 'Vana Õpetaja', teacherUid: 'old', lessons: group.lessons };
    expect(withTeacherChange(before, { teacher: 'Uus Õpetaja', teacherUid: 'new', from: '2026-11-03' })).toEqual({
      teacher: 'Uus Õpetaja', teacherUid: 'new', changed: true,
      teacherHistory: [{ teacher: 'Vana Õpetaja', teacherUid: 'old', until: '2026-11-02' }],
    });
    // a group whose lessons start later has no past: no history entry
    expect(withTeacherChange(before, { teacher: 'Uus Õpetaja', teacherUid: 'new', from: '2026-10-01' }).teacherHistory).toEqual([]);
    // the same teacher is no change
    expect(withTeacherChange(before, { teacher: 'Vana Õpetaja', teacherUid: 'old', from: '' }).changed).toBe(false);
    // a change before the previous one is refused
    expect(() => withTeacherChange(group, { teacher: 'Kolmas', teacherUid: 'third', from: '2026-11-01' })).toThrow('hiljem kui eelmine vahetus');
  });

  it('splits the calendar series by teacher period', () => {
    const events = groupCalendarEvents([group]);
    expect(events.map((event) => [event.id, event.teacherUid, event.startDate, event.endDate])).toEqual([
      ['group:g1:l1~2026-11-02', 'old', '2026-10-06', '2026-11-02'],
      ['group:g1:l1', 'new', '2026-11-03', ''],
    ]);
    const occurrences = occurrencesForDates(events, ['2026-10-27', '2026-11-03', '2026-11-10']);
    expect(occurrences.map((item) => [item.occurrenceDate, item.teacher])).toEqual([
      ['2026-10-27', 'Vana Õpetaja'], ['2026-11-03', 'Uus Õpetaja'], ['2026-11-10', 'Uus Õpetaja'],
    ]);
    // a group without history is unchanged: one event with the plain id
    expect(groupCalendarEvents([{ ...group, teacherHistory: [] }]).map((event) => event.id)).toEqual(['group:g1:l1']);
  });
});
