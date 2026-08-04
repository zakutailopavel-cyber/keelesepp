import { datesForView, eventOccursOn, filterCalendarEvents, groupCalendarEvents, occurrencesForDates, startOfWeek } from './calendarView.js';

describe('calendar view helpers', () => {
  it('builds Monday-based week and six-week month grids', () => {
    expect(startOfWeek('2026-08-05')).toBe('2026-08-03');
    expect(datesForView('2026-08-05', 'week')).toEqual(['2026-08-03', '2026-08-04', '2026-08-05', '2026-08-06', '2026-08-07', '2026-08-08', '2026-08-09']);
    expect(datesForView('2026-08-05', 'month')).toHaveLength(42);
  });

  it('expands recurring events and respects exclusions', () => {
    const recurring = { id: 'one', recurring: true, startDate: '2026-08-03', day: 'Mon', time: '10:00', excludedDates: ['2026-08-10'] };
    expect(eventOccursOn(recurring, '2026-08-03')).toBe(true);
    expect(eventOccursOn(recurring, '2026-08-10')).toBe(false);
    expect(occurrencesForDates([recurring], ['2026-08-03', '2026-08-10'])).toHaveLength(1);
  });

  it('filters by teacher, student and search text', () => {
    const events = [{ id: 'one', studentId: 's1', studentName: 'Mari', teacherUid: 't1', teacher: 'Pavel' }];
    expect(filterCalendarEvents(events, { teacher: 't1', student: 's1', search: 'mari' })).toHaveLength(1);
    expect(filterCalendarEvents(events, { search: 'Karl' })).toHaveLength(0);
  });

  it('expands legacy group lessons and respects per-student lesson selection', () => {
    const events = groupCalendarEvents([{ id: 'group-1', name: 'A1 õhturühm', teacher: 'Õpetaja', teacherUid: 'teacher-1', students: ['student-1', 'student-2'], studentLessonMap: { 'student-1': ['lesson-1'], 'student-2': [] }, lessons: [{ id: 'lesson-1', day: 'Tue', time: '17:30', startDate: '2026-08-04' }] }]);
    expect(events).toEqual([expect.objectContaining({ id: 'group:group-1:lesson-1', isGroup: true, studentName: 'A1 õhturühm', studentIds: ['student-1'], recurring: true })]);
    expect(filterCalendarEvents(events, { student: 'student-1' })).toHaveLength(1);
    expect(filterCalendarEvents(events, { student: 'student-2' })).toHaveLength(0);
    expect(occurrencesForDates(events, ['2026-08-04'])).toHaveLength(1);
  });
});
