// The marks of one lesson occurrence, shared by the calendar's lesson panel and the side drawer (owner 2026-11-09:
// „во всплывающих панелях, не уходя со страницы”): one path for „Tund toimus” / „Puudus”, the topic and note,
// „Paranda märge” and „Kooli kulul”, so the drawer never books or bills a lesson differently from the calendar.

import { announceEntityChanged, onEntityChanged } from '../../components/entityDrawer/entityDrawer.js';

// a lesson marked in the side drawer: the list under it („Märkimata tunnid”) takes the row away without a reload, the
// calendar and the dashboard read their journal again in place (entityDrawer.js `announceEntityChanged`)
export function announceLessonMarked(occurrenceId) { announceEntityChanged('lesson', { occurrenceId: occurrenceId || '', change: 'marked' }); }
// another change of a lesson's mark (fixed, removed, „Kooli kulul”, topic/note): the pages under the drawer reload
export function announceLessonChanged(occurrenceId) { announceEntityChanged('lesson', { occurrenceId: occurrenceId || '', change: 'changed' }); }
export function onLessonMarked(listener) { return onEntityChanged('lesson', (change) => { if (change.change === 'marked') listener(change.occurrenceId); }); }

// a „Toimunud” mark whose „kooli kulul” step failed: the lesson is marked, the panel says what is left to do
export class SchoolCoverError extends Error {
  constructor(cause) {
    super(`Tund märgiti toimunuks, kuid „kooli kulul” ei salvestunud (${cause?.message || 'viga'}). Ava tund ja vajuta „Kooli kulul” uuesti.`);
    this.marked = true;
  }
}

/**
 * „Tund toimus” / „Puudus” from the panel: the journal entry (lessons.completeFromSchedule), then right away „kooli
 * kulul” (Oleksiy 2026-10-19: held for the teacher, free for the student; the audited finance route also gives back a
 * credit the lesson took) and the homework picked from Õppevara. `details` is what LessonPanel's onDone passes.
 */
export async function markOccurrence({ lessonRepository, financeRepository, libraryRepository }, item, user, details = {}, student = null) {
  const { homework, schoolCoveredReason = '', ...fields } = details;
  const lesson = await lessonRepository.completeFromSchedule(item, user, fields);
  if (schoolCoveredReason && lesson?.id) {
    try { await financeRepository.setLessonBillingDisposition(lesson.id, 'school_covered', schoolCoveredReason); }
    catch (cause) { throw new SchoolCoverError(cause); }
  }
  if (homework && student) await libraryRepository.assign({ item: homework, students: [student], dueDate: '', note: fields.topic ? `Tund: ${fields.topic}` : '', user });
  return lesson;
}

// „Paranda märge”: another status, or the mark removed (the lesson is planned again)
export function fixOccurrenceMark(lessonRepository, item, user, action, status) {
  if (action === 'remove') return lessonRepository.removeMark(item.record, user, { scheduleRecurring: Boolean(item.recurring) });
  return lessonRepository.changeMark(item.record, status, user, { scheduleRecurring: Boolean(item.recurring) });
}
export const fixMarkError = (error) => (error?.code === 'permission-denied' ? 'Seda märget ei saa siin muuta: tund on arvel või periood on suletud. Paranda see Finantsides.' : (error?.message || 'Parandamine ebaõnnestus.'));
export const schoolCoveredError = (error) => (/closed|suletud/i.test(error?.message || '') ? 'Periood on suletud: seda tundi ei saa enam muuta.' : (error?.message || 'Muutmine ebaõnnestus.'));
