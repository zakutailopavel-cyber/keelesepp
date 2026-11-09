export function canQuickCompleteLesson(item = {}) {
  return Boolean(
    item.id
    && !item.recordProblem
    && !item.isGroup
    && !item.lessonRecordId
    && item.status !== 'Toimunud'
    && item.status !== 'Tühistatud'
    && item.occurrenceDate,
  );
}

export function quickAttendanceLabel(item = {}) {
  if (item.lessonRecordId || item.status === 'Toimunud') return 'Tund arvestatud';
  if (item.status === 'Tühistatud') return 'Tund tühistatud';
  if (item.isGroup) return 'Ava kohalolu';
  return 'Märgi toimunuks';
}

// the school's clock now ("HH:MM", Europe/Tallinn)
export const tallinnClock = (date = new Date()) => new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Tallinn', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(date);

// a lesson whose day is over, or today's lesson that has started (the phone agenda's inline buttons)
export function isPastLesson(item = {}, today = '', nowClock = '') {
  if (!item.occurrenceDate || !today) return false;
  if (item.occurrenceDate < today) return true;
  return item.occurrenceDate === today && Boolean(item.time) && Boolean(nowClock) && String(item.time).padStart(5, '0') <= nowClock;
}
