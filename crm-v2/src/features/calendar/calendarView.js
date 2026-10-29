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

const RESULT_STATUSES = new Set(['Toimunud', 'Puudus_eta', 'Puudus_p']);

export function occurrenceStatus(event, date) {
  const occurrence = event.occurrenceStatuses?.[date];
  if (occurrence?.status) return occurrence.status;
  if (!event.recurring || !RESULT_STATUSES.has(event.status)) return event.status;
  // Older journals wrote an occurrence result onto the entire series. Keep the dated result only.
  return (event.lessonOccurrenceDate || event.date) === date ? event.status : 'Planeeritud';
}

// the traffic light of a lesson (team 2026-10-29, #high_priority: „визуально неотличимы проведённые и отменённые
// уроки — ленточка в углу: зелёная, жёлтая, красная”): 'done' green (held), 'absent' yellow (the student missed it),
// 'cancelled' red (cancelled), 'planned' no ribbon. A lesson record decides first: before, any record — also a
// cancelled one — showed as held.
export const LESSON_STATE_LABELS = { done: 'Toimunud', absent: 'Õpilane puudus', cancelled: 'Tühistatud', planned: '' };
export function lessonState(item = {}) {
  const status = item.record?.status || item.status || '';
  if (status === 'Tühistatud') return 'cancelled';
  if (status === 'Puudus_eta' || status === 'Puudus_p') return 'absent';
  if (status === 'Toimunud' || item.lessonRecordId) return 'done';
  return 'planned';
}

// the mark in the corner of a lesson (owner 2026-10-29: „справа вверху по символу или ленточке отличать проведённый,
// проведённый за счёт школы и т.д., чтобы админу не открывать каждый урок”): one key, a symbol and a label
export const LESSON_MARKS = Object.freeze({
  cancelled: { symbol: '✕', label: 'Tühistatud' },
  absentLate: { symbol: '!', label: 'Puudus, ei teatanud (tasuline)' },
  absentNotified: { symbol: 'T', label: 'Puudus, teatas ette' },
  covered: { symbol: 'K', label: 'Toimunud kooli kulul (tasuta)' },
  verified: { symbol: '✓✓', label: 'Toimunud ja kontrollitud' },
  done: { symbol: '✓', label: 'Toimunud' },
  unmarked: { symbol: '?', label: 'Möödunud, märkimata' },
});
export function lessonMark(item = {}, today = '') {
  const record = item.record || {};
  const status = record.status || item.status || '';
  if (status === 'Tühistatud') return 'cancelled';
  if (status === 'Puudus_eta') return 'absentLate';
  if (status === 'Puudus_p') return 'absentNotified';
  if (status === 'Toimunud' || item.lessonRecordId) {
    if (['school_covered', 'covered', 'free'].includes(record.billingStatus || item.billingStatus)) return 'covered';
    if (record.verified || item.verified) return 'verified';
    return 'done';
  }
  if (!item.isGroup && today && item.occurrenceDate && item.occurrenceDate < today) return 'unmarked';
  return '';
}

export function resolveOccurrenceRecord(item, records = []) {
  if (item.isGroup) return item;
  const date = item.occurrenceDate;
  const reference = item.occurrenceStatuses?.[date]?.lessonEntryId
    || ((!item.recurring || (item.lessonOccurrenceDate || item.date) === date) ? item.lessonEntryId : '');
  const candidates = records.filter((record) => record.date === date
    && record.studentId === item.studentId
    && (record.scheduleId === item.id || (reference && record.id === reference)));
  if (candidates.length === 1) {
    const record = candidates[0];
    return { ...item, status: record.status || 'Toimunud', lessonRecordId: record.id, record };
  }
  return { ...item, recordProblem: candidates.length > 1 ? 'duplicate' : RESULT_STATUSES.has(item.status) ? 'missing' : '' };
}

// a lesson keeps the student's name from the day it was planned; the calendar shows the name on the student's card
// now, so a renamed student is shown with the new name (the stored name stays as a fallback for a deleted card)
// A student moved to the archive keeps the lessons imported from Google Calendar (owner 2026-10-27: „Martin, Людмила и
// Роберт постоянно появляются в календаре, убери их пока”): from today on their lessons are not shown. Nothing is
// deleted (a change would also go to Google Calendar); taking the card out of the archive shows them again.
export function withoutArchivedFuture(events = [], archivedIds = new Set(), today) {
  if (!archivedIds.size) return events;
  const yesterday = shiftDate(today, -1);
  return events.flatMap((event) => {
    if (event.isGroup || !archivedIds.has(event.studentId)) return [event];
    if (!event.recurring) return (event.date || '') < today ? [event] : [];
    const start = event.startDate || event.date || '';
    if (start >= today) return [];
    return [{ ...event, endDate: event.endDate && event.endDate < yesterday ? event.endDate : yesterday }];
  });
}

export function withCurrentStudentNames(events, studentMap) {
  return events.map((event) => {
    const name = event.studentId && !event.isGroup ? String(studentMap.get(event.studentId)?.name || '').trim() : '';
    return name && name !== event.studentName ? { ...event, studentName: name } : event;
  });
}

// the subject a lesson teaches (owner chat 2026-10-17: „в календаре нигде не отображается, какой предмет ведёт учитель”):
// the lesson's own subject, else the student's study track with this teacher, else the only track, else the card's subject
export function lessonSubjectOf(event, student) {
  if (event.subject) return String(event.subject);
  const tracks = (student?.enrollments || []).filter((track) => track && track.active !== false && track.subject);
  return tracks.find((track) => track.teacherUid && track.teacherUid === event.teacherUid)?.subject
    || (tracks.length === 1 ? tracks[0].subject : '')
    || String(student?.subject || '');
}

export function withLessonSubjects(events, studentMap) {
  return events.map((event) => {
    if (event.isGroup) return event;
    const subject = lessonSubjectOf(event, studentMap.get(event.studentId));
    return subject && subject !== event.subject ? { ...event, subject } : event;
  });
}

// a short pictogram for the subject: ET / EN / MA / RU / FI / DE, else the first two letters
const SUBJECT_CODES = [[/^eesti/, 'ET'], [/^inglise/, 'EN'], [/^mate/, 'MA'], [/^vene/, 'RU'], [/^soome/, 'FI'], [/^saksa/, 'DE']];
export function subjectCode(subject) {
  const text = String(subject || '').trim().toLocaleLowerCase('et');
  if (!text || text === 'muu') return '';
  return SUBJECT_CODES.find(([pattern]) => pattern.test(text))?.[1] || text.slice(0, 2).toUpperCase();
}

export function occurrencesForDates(events, dates) {
  return dates.flatMap((date) => events.filter((event) => eventOccursOn(event, date)).map((event) => ({ ...event, status: occurrenceStatus(event, date), occurrenceDate: date, occurrenceId: `${event.id}:${date}` })))
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
      endDate: lesson.endDate || '',
      excludedDates: lesson.excludedDates || [],
      attendance: lesson.attendance || {},
      occurrenceStatuses: lesson.occurrenceStatuses || {},
      lessonOccurrenceDate: lesson.lessonOccurrenceDate || '',
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
