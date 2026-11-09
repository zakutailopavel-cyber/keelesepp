import { describe, expect, it, vi } from 'vitest';
import { fixMarkError, fixOccurrenceMark, markOccurrence, schoolCoveredError } from './lessonActions.js';

const item = { id: 'e1', studentId: 's1', occurrenceDate: '2026-11-03', recurring: true, record: { id: 'L1' } };
const user = { uid: 't1' };

describe('lessonActions: the one marking path of the calendar and the drawer', () => {
  it('marks the lesson, then „kooli kulul” and the homework', async () => {
    const lessonRepository = { completeFromSchedule: vi.fn(async () => ({ id: 'L1' })) };
    const financeRepository = { setLessonBillingDisposition: vi.fn(async () => ({})) };
    const libraryRepository = { assign: vi.fn(async () => ({})) };
    const homework = { id: 'h1', title: 'Partitiiv' };
    await markOccurrence({ lessonRepository, financeRepository, libraryRepository }, item, user, { status: 'Toimunud', topic: 'Partitiiv', notes: '', homework, schoolCoveredReason: 'proovitund' }, { id: 's1' });
    expect(lessonRepository.completeFromSchedule).toHaveBeenCalledWith(item, user, { status: 'Toimunud', topic: 'Partitiiv', notes: '' });
    expect(financeRepository.setLessonBillingDisposition).toHaveBeenCalledWith('L1', 'school_covered', 'proovitund');
    expect(libraryRepository.assign).toHaveBeenCalledWith(expect.objectContaining({ item: homework, students: [{ id: 's1' }], note: 'Tund: Partitiiv' }));
  });

  it('a failed „kooli kulul” after the mark says the lesson is marked', async () => {
    const error = await markOccurrence({ lessonRepository: { completeFromSchedule: async () => ({ id: 'L1' }) }, financeRepository: { setLessonBillingDisposition: async () => { throw new Error('võrk'); } } }, item, user, { status: 'Toimunud', schoolCoveredReason: 'x' }).catch((caught) => caught);
    expect(error.marked).toBe(true);
    expect(error.message).toMatch(/Tund märgiti toimunuks, kuid „kooli kulul” ei salvestunud \(võrk\)/);
  });

  it('„Paranda märge” keeps the series flag; the refusals read as the calendar says them', async () => {
    const lessonRepository = { changeMark: vi.fn(), removeMark: vi.fn() };
    await fixOccurrenceMark(lessonRepository, item, user, 'change', 'Puudus_p');
    await fixOccurrenceMark(lessonRepository, item, user, 'remove');
    expect(lessonRepository.changeMark).toHaveBeenCalledWith(item.record, 'Puudus_p', user, { scheduleRecurring: true });
    expect(lessonRepository.removeMark).toHaveBeenCalledWith(item.record, user, { scheduleRecurring: true });
    expect(fixMarkError({ code: 'permission-denied' })).toMatch(/tund on arvel/);
    expect(schoolCoveredError(new Error('period closed'))).toBe('Periood on suletud: seda tundi ei saa enam muuta.');
  });
});
