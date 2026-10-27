import { datesForView, eventOccursOn, filterCalendarEvents, groupCalendarEvents, occurrencesForDates, startOfWeek, withCurrentStudentNames } from './calendarView.js';

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

it('shows the name on the student card, not the one stored when the lesson was planned', () => {
  const map = new Map([['s1', { id: 's1', name: 'Anna Uus' }]]);
  const [renamed, gone, group] = withCurrentStudentNames([
    { id: 'a', studentId: 's1', studentName: 'Anna Vana' },
    { id: 'b', studentId: 's2', studentName: 'Kustutatud' },
    { id: 'c', studentId: 's1', studentName: 'Grupp A', isGroup: true },
  ], map);
  expect(renamed.studentName).toBe('Anna Uus');
  expect(gone.studentName).toBe('Kustutatud');
  expect(group.studentName).toBe('Grupp A');
});

it('finds the subject of a lesson and its short code', async () => {
  const { lessonSubjectOf, subjectCode, withLessonSubjects } = await import('./calendarView.js');
  const student = { subject: 'Eesti keel', enrollments: [{ subject: 'Eesti keel', teacherUid: 't1' }, { subject: 'Inglise keel', teacherUid: 't2' }] };
  expect(lessonSubjectOf({ subject: 'Matemaatika' }, student)).toBe('Matemaatika');
  expect(lessonSubjectOf({ teacherUid: 't2' }, student)).toBe('Inglise keel');
  expect(lessonSubjectOf({ teacherUid: 'x' }, { subject: 'Eesti keel' })).toBe('Eesti keel');
  expect(subjectCode('Inglise Keel')).toBe('EN');
  expect(subjectCode('Eesti keel')).toBe('ET');
  expect(subjectCode('Muu')).toBe('');
  const [lesson, group] = withLessonSubjects([{ id: 'a', studentId: 's', teacherUid: 't1' }, { id: 'g', isGroup: true }], new Map([['s', student]]));
  expect(lesson.subject).toBe('Eesti keel');
  expect(group.subject).toBeUndefined();
});

describe('archived students in the calendar', () => {
  it('drops their lessons from today on and keeps the past', async () => {
    const { withoutArchivedFuture, eventOccursOn } = await import('./calendarView.js');
    const archived = new Set(['a']);
    const events = [
      { id: 'past', studentId: 'a', date: '2026-10-20', time: '16:00' },
      { id: 'future', studentId: 'a', date: '2026-10-28', time: '16:00' },
      { id: 'weekly', studentId: 'a', recurring: true, day: 'Wed', startDate: '2026-09-02', time: '16:00' },
      { id: 'later', studentId: 'a', recurring: true, day: 'Wed', startDate: '2026-11-04', time: '16:00' },
      { id: 'other', studentId: 'b', date: '2026-10-28', time: '16:00' },
      { id: 'group', isGroup: true, studentIds: ['a'], date: '2026-10-28' },
    ];
    const shown = withoutArchivedFuture(events, archived, '2026-10-27');
    expect(shown.map((event) => event.id)).toEqual(['past', 'weekly', 'other', 'group']);
    const weekly = shown.find((event) => event.id === 'weekly');
    expect(eventOccursOn(weekly, '2026-10-21')).toBe(true);
    expect(eventOccursOn(weekly, '2026-10-28')).toBe(false);
    expect(withoutArchivedFuture(events, new Set(), '2026-10-27')).toBe(events);
  });
});
