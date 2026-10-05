// Students who have no lesson ahead in the calendar, so nobody is forgotten. A student counts as planned when any
// lesson that is not cancelled lies ahead: a weekly series that has not ended, a one-off lesson today or later, or a
// group lesson series the student belongs to. A student the teacher paused („Paus kuni …”) is left out until then.

export function hasLessonAhead(event, today) {
  if (!event || event.status === 'Tühistatud') return false;
  if (event.recurring) return !event.endDate || event.endDate >= today;
  return Boolean(event.date) && event.date >= today;
}

export function unplannedStudents({ students = [], events = [], today, teacherUid = '' }) {
  const planned = new Set();
  for (const event of events) {
    if (!hasLessonAhead(event, today)) continue;
    if (event.isGroup) (event.studentIds || []).forEach((id) => planned.add(id));
    else if (event.studentId) planned.add(event.studentId);
  }
  const lastLesson = new Map();
  for (const event of events) {
    if (event.isGroup || !event.studentId || event.status === 'Tühistatud') continue;
    const date = event.recurring ? (event.endDate || '') : event.date;
    if (date && date < today && date > (lastLesson.get(event.studentId) || '')) lastLesson.set(event.studentId, date);
  }
  return students
    .filter((student) => student.active !== false && !student.convertedToParent)
    .filter((student) => !teacherUid || student.teacherUid === teacherUid || (student.teacherUids || []).includes(teacherUid))
    .filter((student) => !planned.has(student.id))
    .filter((student) => !(student.planningPausedUntil && student.planningPausedUntil >= today))
    .map((student) => ({ student, lastLesson: lastLesson.get(student.id) || '' }))
    .sort((a, b) => (a.lastLesson || '0').localeCompare(b.lastLesson || '0') || String(a.student.name).localeCompare(String(b.student.name), 'et'));
}
