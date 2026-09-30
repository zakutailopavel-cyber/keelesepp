import { beforeEach, describe, expect, it, vi } from 'vitest';

const firestore = vi.hoisted(() => ({
  collection: vi.fn((_db, name) => ({ name })),
  doc: vi.fn((...parts) => parts.length === 1 ? { id: 'activity-1' } : { path: parts.map((part) => part?.name || part).join(':'), id: String(parts.at(-1)) }),
  getDoc: vi.fn(),
  getDocs: vi.fn(),
  query: vi.fn((reference, ...constraints) => ({ reference, constraints })),
  where: vi.fn((field, operator, value) => ({ field, operator, value })),
  batch: { set: vi.fn(), update: vi.fn(), delete: vi.fn(), commit: vi.fn().mockResolvedValue(undefined) },
  writeBatch: vi.fn(),
}));

vi.mock('firebase/firestore', () => firestore);
vi.mock('./client.js', () => ({ requireFirebaseClient: () => ({ db: 'firebase-db' }) }));
const financeApi = vi.hoisted(() => ({ deleteLessonJournal: vi.fn().mockResolvedValue({ deleted: true }) }));
vi.mock('./financeApi.js', () => ({ financeApi }));

import { lessonsService, normalizeLesson } from './lessons.js';

describe('lessonsService accounting', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    firestore.writeBatch.mockReturnValue(firestore.batch);
    firestore.getDoc.mockResolvedValue({ exists: () => false });
  });

  it('normalizes teacher aliases in financial lesson records', () => {
    expect(normalizeLesson('lesson-1', { teacher: 'Elizaveta', status: 'Toimunud' })).toMatchObject({
      id: 'lesson-1', teacher: 'Yelyzaveta Lukiianchuk', status: 'Toimunud',
    });
  });

  it('atomically records a completed calendar occurrence for accounting', async () => {
    const user = { uid: 'teacher-1', displayName: 'Pavel', roles: ['teacher'] };
    const result = await lessonsService.completeFromSchedule({
      id: 'schedule-1', occurrenceDate: '2026-08-04', studentId: 'student-1', studentName: 'Mari', teacher: 'Pavel', teacherUid: 'teacher-1', time: '10:00', duration: 60, recurring: false,
    }, user);

    expect(result).toMatchObject({ studentId: 'student-1', date: '2026-08-04', status: 'Toimunud', accountingSource: 'crm_v2' });
    expect(firestore.batch.set).toHaveBeenCalledTimes(3);
    expect(firestore.batch.set.mock.calls[0][1]).toMatchObject({ scheduleId: 'schedule-1', accountingSource: 'crm_v2', teacher: 'Pavel Zakutailo' });
    expect(firestore.batch.set.mock.calls[1][1]).toMatchObject({ status: 'Toimunud' });
    expect(firestore.batch.set.mock.calls[2][1]).toMatchObject({ type: 'lesson.completed', studentId: 'student-1' });
    expect(firestore.batch.commit).toHaveBeenCalledOnce();
  });

  it('does not duplicate an existing occurrence record', async () => {
    firestore.getDoc.mockResolvedValue({ exists: () => true, id: 'existing', data: () => ({ studentId: 'student-1', status: 'Toimunud' }) });
    await lessonsService.completeFromSchedule({ id: 'schedule-1', occurrenceDate: '2026-08-04', studentId: 'student-1' }, { uid: 'teacher-1' });
    expect(firestore.writeBatch).not.toHaveBeenCalled();
  });

  it('fixes a CRM v2 mark in place and sets a one-off schedule back to planned when removed', async () => {
    const user = { uid: 'teacher-1', displayName: 'Pavel', roles: ['teacher'] };
    const record = { id: 'rec-1', scheduleId: 'schedule-1', studentId: 's1', date: '2026-08-04', status: 'Toimunud', accountingSource: 'crm_v2' };
    await lessonsService.changeMark(record, 'Puudus_p', user, { scheduleRecurring: false });
    expect(firestore.batch.update.mock.calls[0][1]).toMatchObject({ status: 'Puudus_p', updatedByUid: 'teacher-1' });
    expect(firestore.batch.set.mock.calls[0][1]).toMatchObject({ status: 'Puudus_p' });
    vi.clearAllMocks();
    await lessonsService.removeMark(record, user, { scheduleRecurring: false });
    expect(firestore.batch.delete).toHaveBeenCalledTimes(1);
    expect(firestore.batch.set.mock.calls[0][1]).toMatchObject({ status: 'Planeeritud' });
    expect(financeApi.deleteLessonJournal).not.toHaveBeenCalled();
  });

  it('sends older marks to the server journal and refuses invoiced lessons', async () => {
    await lessonsService.removeMark({ id: 'old-1', status: 'Toimunud', accountingSource: 'journal' }, {});
    expect(financeApi.deleteLessonJournal).toHaveBeenCalledWith('old-1');
    expect(firestore.batch.delete).not.toHaveBeenCalled();
    await expect(lessonsService.removeMark({ id: 'inv-1', invoiceId: 'A-1' }, {})).rejects.toThrow('arvel');
    await expect(lessonsService.changeMark({ id: 'inv-1', billingStatus: 'invoiced' }, 'Puudus_p', {})).rejects.toThrow('arvel');
  });
});
