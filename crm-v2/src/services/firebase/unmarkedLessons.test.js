vi.mock('./schedule.js', () => ({ scheduleService: { list: vi.fn(async () => []), patch: vi.fn(async () => ({})), cancel: vi.fn(async () => ({})) } }));
vi.mock('./lessons.js', () => ({ lessonsService: { completeFromSchedule: vi.fn(async () => ({ id: 'l1' })), removeMark: vi.fn(async () => {}), listForCalendar: vi.fn(async () => []) }, normalizeLesson: (id, data) => ({ id, ...data }) }));
vi.mock('./students.js', () => ({ studentsService: { list: vi.fn(async () => ({ items: [{ id: 'gone', active: false }] })) } }));
vi.mock('./teachers.js', () => ({ teachersService: { list: vi.fn(async () => [{ id: 't1', role: 'teacher' }]) } }));

import { afterEach } from 'vitest';
import { lessonsService } from './lessons.js';
import { scheduleService } from './schedule.js';
import { UNMARKED_CHANGED_EVENT, unmarkedLessonsService } from './unmarkedLessons.js';

describe('unmarkedLessonsService', () => {
  afterEach(() => vi.clearAllMocks());

  it('marks through the calendar\'s completeFromSchedule and tells the badge', async () => {
    const heard = vi.fn();
    globalThis.addEventListener(UNMARKED_CHANGED_EVENT, heard);
    const item = { id: 'a', occurrenceDate: '2026-11-02', studentId: 's1' };
    await unmarkedLessonsService.mark(item, { uid: 'u1' }, 'Puudus_p');
    expect(lessonsService.completeFromSchedule).toHaveBeenCalledWith(item, { uid: 'u1' }, { status: 'Puudus_p' });
    expect(heard).toHaveBeenCalledTimes(1);
    globalThis.removeEventListener(UNMARKED_CHANGED_EVENT, heard);
  });

  it('cancels one lesson of a series by excluding its date, never deleting', async () => {
    await unmarkedLessonsService.cancel({ id: 'w', recurring: true, occurrenceDate: '2026-11-02' }, { id: 'w', excludedDates: ['2026-10-26'] });
    expect(scheduleService.patch).toHaveBeenCalledWith('w', { excludedDates: ['2026-10-26', '2026-11-02'] });
    expect(scheduleService.cancel).not.toHaveBeenCalled();
  });

  it('cancels a one-off lesson with the status „Tühistatud” path, without the page\'s own fields', async () => {
    const raw = { id: 'o', date: '2026-11-02', status: 'Planeeritud' };
    await unmarkedLessonsService.cancel({ ...raw, occurrenceDate: '2026-11-02', recurring: false, kind: 'duplicate' }, { ...raw, kind: 'duplicate', evidence: null, duplicateOf: {} });
    expect(scheduleService.cancel).toHaveBeenCalledWith('o', raw);
  });

  it('the badge takes the number the calendar sends', () => {
    const onCount = vi.fn();
    const stop = unmarkedLessonsService.subscribeCount({ user: { uid: 'a' }, isAdmin: true }, onCount);
    unmarkedLessonsService.notifyChanged(7);
    expect(onCount).toHaveBeenLastCalledWith(7);
    stop();
  });

  it('the undo removes the mark through the calendar\'s „Paranda märge → Eemalda” path', async () => {
    const record = { id: 'l1', accountingSource: 'crm_v2' };
    await unmarkedLessonsService.unmark(record, { uid: 'u1' }, { recurring: false });
    expect(lessonsService.removeMark).toHaveBeenCalledWith(record, { uid: 'u1' }, { scheduleRecurring: false });
  });

  it('„Lõpeta sari” writes an end date and keeps the old one; the undo puts it back; „Määra õpetaja” patches the entry', async () => {
    const result = await unmarkedLessonsService.endSeries({ id: 'w', recurring: true, endDate: '2027-01-01' }, '2026-11-01', { displayName: 'Admin' });
    expect(result).toEqual({ previous: '2027-01-01' });
    expect(scheduleService.patch).toHaveBeenCalledWith('w', expect.objectContaining({ endDate: '2026-11-01', seriesEndedPreviousEndDate: '2027-01-01', seriesEndedBy: 'Admin' }));
    await expect(unmarkedLessonsService.endSeries({ id: 'o', recurring: false }, '2026-11-01')).rejects.toThrow();
    await unmarkedLessonsService.restoreSeriesEnd({ id: 'w' }, '2027-01-01');
    expect(scheduleService.patch).toHaveBeenLastCalledWith('w', expect.objectContaining({ endDate: '2027-01-01' }));
    await unmarkedLessonsService.assignTeacher({ id: 'n' }, { id: 't9', name: 'Uus' });
    expect(scheduleService.patch).toHaveBeenLastCalledWith('n', { teacherUid: 't9', teacher: 'Uus' });
  });

  it('the context: archived cards and (admin) the staff list; a failing read excludes nothing', async () => {
    const context = await unmarkedLessonsService.context({ user: { uid: 'adm' }, isAdmin: true });
    expect(context.archivedStudentIds).toEqual(['gone']);
    expect(context.staff).toEqual([{ id: 't1', role: 'teacher' }]);
    expect(context.lockedDates).toEqual([]); // no Firebase in the test: the read fails, nothing is excluded
    const teacher = await unmarkedLessonsService.context({ user: { uid: 't1' }, isAdmin: false });
    expect(teacher.staff).toBeNull();
  });
});
