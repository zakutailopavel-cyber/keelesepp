// „Märkimata tunnid” (owner 2026-10-23: учителя не отмечают уроки — без журнала врут риск ухода, отчёты и „Õpilase
// pilt”): the calendar's past lessons of the last days that have no journal record yet, weekly series included, so the
// teacher marks them held or missed in one click. A cancelled lesson, a group lesson and a lesson already in the journal
// (the record of completeFromSchedule, or any lesson of that student on that day) are left out.
import { occurrencesForDates, shiftDate } from './calendarView.js';

export const UNMARKED_DAYS = 14;

export function unmarkedLessons({ schedule = [], lessons = [], today, days = UNMARKED_DAYS, teacherUid = '' } = {}) {
  const dates = Array.from({ length: days }, (_, index) => shiftDate(today, -(index + 1)));
  const marked = new Set();
  lessons.forEach((lesson) => {
    if (lesson.scheduleId && (lesson.occurrenceDate || lesson.date)) marked.add(`${lesson.scheduleId}:${lesson.occurrenceDate || lesson.date}`);
    if (lesson.studentId && lesson.date) marked.add(`${lesson.studentId}@${lesson.date}`);
  });
  return occurrencesForDates(schedule.filter((event) => !event.isGroup && event.studentId && (!teacherUid || !event.teacherUid || event.teacherUid === teacherUid)), dates)
    .filter((item) => (item.status || 'Planeeritud') === 'Planeeritud')
    .filter((item) => !marked.has(`${item.id}:${item.occurrenceDate}`) && !marked.has(`${item.studentId}@${item.occurrenceDate}`))
    .sort((a, b) => `${b.occurrenceDate} ${b.time}`.localeCompare(`${a.occurrenceDate} ${a.time}`));
}
