vi.mock('./schedule.js', () => ({ scheduleService: { list: vi.fn(async () => []), patch: vi.fn(async () => ({})), cancel: vi.fn(async () => ({})) } }));
vi.mock('./lessons.js', () => ({ lessonsService: { completeFromSchedule: vi.fn(async () => ({ id: 'l1' })), listForCalendar: vi.fn(async () => []) }, normalizeLesson: (id, data) => ({ id, ...data }) }));

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
});
