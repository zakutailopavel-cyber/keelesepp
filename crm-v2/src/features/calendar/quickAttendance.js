export function canQuickCompleteLesson(item = {}) {
  return Boolean(
    item.id
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
