const DAY_IDS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function toIsoDate(value = new Date()) {
  const date = value instanceof Date ? value : new Date(`${value}T12:00:00`);
  return [date.getFullYear(), String(date.getMonth() + 1).padStart(2, '0'), String(date.getDate()).padStart(2, '0')].join('-');
}

export function shiftDate(value, amount) {
  const date = new Date(`${value}T12:00:00`);
  date.setDate(date.getDate() + amount);
  return toIsoDate(date);
}

export function startOfWeek(value) {
  const date = new Date(`${value}T12:00:00`);
  const distance = (date.getDay() + 6) % 7;
  date.setDate(date.getDate() - distance);
  return toIsoDate(date);
}

export function datesForView(anchor, view) {
  if (view === 'day') return [anchor];
  if (view === 'week') {
    const start = startOfWeek(anchor);
    return Array.from({ length: 7 }, (_, index) => shiftDate(start, index));
  }
  const month = new Date(`${anchor}T12:00:00`);
  const first = toIsoDate(new Date(month.getFullYear(), month.getMonth(), 1, 12));
  const start = startOfWeek(first);
  return Array.from({ length: 42 }, (_, index) => shiftDate(start, index));
}

export function eventOccursOn(event, date) {
  if (event.status === 'Tühistatud') return false;
  if (!event.recurring) return event.date === date;
  const start = event.startDate || event.date;
  if (!start || date < start || (event.endDate && date > event.endDate)) return false;
  if ((event.excludedDates || []).includes(date)) return false;
  return (event.day || DAY_IDS[new Date(`${start}T12:00:00`).getDay()]) === DAY_IDS[new Date(`${date}T12:00:00`).getDay()];
}

export function occurrencesForDates(events, dates) {
  return dates.flatMap((date) => events.filter((event) => eventOccursOn(event, date)).map((event) => ({ ...event, occurrenceDate: date, occurrenceId: `${event.id}:${date}` })))
    .sort((left, right) => `${left.occurrenceDate} ${left.time}`.localeCompare(`${right.occurrenceDate} ${right.time}`, 'et'));
}

export function groupCalendarEvents(groups = []) {
  return groups.flatMap((group) => (group.lessons || []).map((lesson) => {
    const studentIds = (group.students || []).filter((studentId) => {
      const selected = group.studentLessonMap?.[studentId];
      return Array.isArray(selected) ? selected.includes(lesson.id) : true;
    });
    return {
      id: `group:${group.id}:${lesson.id}`,
      groupId: group.id,
      groupLessonId: lesson.id,
      isGroup: true,
      studentName: group.name,
      studentIds,
      teacher: group.teacher || 'Õpetaja määramata',
      teacherUid: group.teacherUid || '',
      date: lesson.date || '',
      day: lesson.day || 'Mon',
      time: lesson.time || '09:00',
      duration: Number(lesson.duration) || 60,
      status: lesson.status || 'Planeeritud',
      recurring: lesson.recurring !== false,
      startDate: lesson.startDate || toIsoDate(),
      attendance: lesson.attendance || {},
    };
  }));
}

export function filterCalendarEvents(events, filters = {}) {
  const query = String(filters.search || '').trim().toLocaleLowerCase('et');
  return events.filter((event) => {
    if (filters.teacher && event.teacherUid !== filters.teacher && event.teacher !== filters.teacher) return false;
    if (filters.student && event.studentId !== filters.student && !(event.studentIds || []).includes(filters.student)) return false;
    if (query && !`${event.studentName || ''} ${event.teacher || ''}`.toLocaleLowerCase('et').includes(query)) return false;
    return true;
  });
}
