import { occurrencesForDates, resolveOccurrenceRecord } from './calendarView.js';
const item = { id: 's', studentId: 'p', occurrenceDate: '2026-10-05', status: 'Toimunud' };
it('resolves a legacy record link only for the same student and date', () => {
  const record = { id: 'old', studentId: 'p', date: '2026-10-05', status: 'Toimunud' };
  expect(resolveOccurrenceRecord({ ...item, lessonEntryId: 'old' }, [record]).record).toBe(record);
  expect(resolveOccurrenceRecord({ ...item, lessonEntryId: 'old' }, [{ ...record, studentId: 'other' }]).recordProblem).toBe('missing');
});
it('flags missing and duplicate records', () => {
  expect(resolveOccurrenceRecord(item, []).recordProblem).toBe('missing');
  const record = { id: 'a', scheduleId: 's', studentId: 'p', date: '2026-10-05' };
  expect(resolveOccurrenceRecord(item, [record, { ...record, id: 'b' }]).recordProblem).toBe('duplicate');
});
it('does not spread a dated series result into following weeks', () => {
  const event = { id: 's', studentId: 'p', recurring: true, date: '2026-10-05', day: 'Mon', status: 'Toimunud' };
  expect(occurrencesForDates([event], ['2026-10-05', '2026-10-12']).map((entry) => entry.status)).toEqual(['Toimunud', 'Planeeritud']);
});
it('resolves per-date legacy status and record reference', () => {
  const event = { id: 's', studentId: 'p', recurring: true, startDate: '2026-10-05', day: 'Mon', status: 'Planeeritud', occurrenceStatuses: { '2026-10-12': { status: 'Puudus_p', lessonEntryId: 'old' } } };
  const occurrences = occurrencesForDates([event], ['2026-10-05', '2026-10-12']);
  expect(occurrences.map((entry) => entry.status)).toEqual(['Planeeritud', 'Puudus_p']);
  expect(resolveOccurrenceRecord(occurrences[1], [{ id: 'old', studentId: 'p', date: '2026-10-12', status: 'Puudus_p' }]).lessonRecordId).toBe('old');
});
it('blocks quick completion and dragging when accounting links are inconsistent', async () => {
  const { canMove } = await import('./calendarGrid.js');
  const { canQuickCompleteLesson } = await import('./quickAttendance.js');
  const conflicted = { ...item, status: 'Planeeritud', recordProblem: 'duplicate' };
  expect(canMove(conflicted)).toBe(false);
  expect(canQuickCompleteLesson(conflicted)).toBe(false);
});
