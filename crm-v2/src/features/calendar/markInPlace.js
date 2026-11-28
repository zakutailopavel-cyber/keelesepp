// A lesson just marked in the calendar, put into the data the calendar already holds (audit 2026-11-28, „отметка
// урока за 10 секунд”): the phone agenda used to wait for a full reload — the schedule, two student lists, the groups
// and every lesson ever marked — before the next lesson could be tapped. The mark now shows at once; the full
// reload still follows in the background and replaces this with what the server has.
//
// `data` is CalendarPage's loaded tuple [scheduleEvents, students, groups, lessonRecords, archived]; `record` is what
// lessons.completeFromSchedule returned; `item` is the calendar occurrence that was marked.
export function withMarkedLesson(data, record, item = {}) {
  if (!Array.isArray(data) || !record?.id) return data;
  const next = [...data];
  const lessons = Array.isArray(data[3]) ? data[3] : [];
  // the journal list is newest first; an already known record (alreadyMarked) is replaced in place
  next[3] = lessons.some((lesson) => lesson.id === record.id)
    ? lessons.map((lesson) => (lesson.id === record.id ? { ...lesson, ...record } : lesson))
    : [record, ...lessons];
  // a one-off lesson carries its status on the schedule entry too (lessons.completeFromSchedule writes both)
  if (!item.recurring && item.id && Array.isArray(data[0])) {
    next[0] = data[0].map((event) => (event.id === item.id ? { ...event, status: record.status } : event));
  }
  return next;
}
