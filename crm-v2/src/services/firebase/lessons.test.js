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
  runTransaction: vi.fn(),
}));

vi.mock('firebase/firestore', () => firestore);
vi.mock('./client.js', () => ({ requireFirebaseClient: () => ({ db: 'firebase-db' }) }));
const financeApi = vi.hoisted(() => ({ deleteLessonJournal: vi.fn().mockResolvedValue({ deleted: true }) }));
vi.mock('./financeApi.js', () => ({ financeApi }));

import { lessonHasPackageMovement, lessonsService, normalizeLesson, removeMarkServerError } from './lessons.js';

describe('lessonsService accounting', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    firestore.writeBatch.mockReturnValue(firestore.batch);
    firestore.runTransaction.mockImplementation(async (_db, callback) => {
      const value = await callback({ ...firestore.batch, get: firestore.getDoc });
      await firestore.batch.commit();
      return value;
    });
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

  it('does not duplicate an existing occurrence record and flags it as marked before (T6: no undo of it)', async () => {
    firestore.getDoc.mockResolvedValue({ exists: () => true, id: 'existing', data: () => ({ studentId: 'student-1', status: 'Toimunud' }) });
    const result = await lessonsService.completeFromSchedule({ id: 'schedule-1', occurrenceDate: '2026-08-04', studentId: 'student-1' }, { uid: 'teacher-1' });
    expect(firestore.writeBatch).not.toHaveBeenCalled();
    expect(result).toMatchObject({ id: 'existing', alreadyMarked: true });
  });

  it('a fresh mark is not flagged as marked before', async () => {
    const result = await lessonsService.completeFromSchedule({ id: 'schedule-1', occurrenceDate: '2026-08-04', studentId: 'student-1' }, { uid: 'teacher-1' });
    expect(result.alreadyMarked).toBeUndefined();
  });

  it('changes an older server-journal mark through the server, keeping the topic and the note', async () => {
    const user = { uid: 'teacher-1', displayName: 'Pavel', roles: ['teacher'] };
    const result = await lessonsService.changeMark({
      id: 'scheduled_abc', accountingSource: 'lesson_journal_v2', scheduleId: 'schedule-1', studentId: 'student-1', studentName: 'Mari', date: '2026-08-04',
      teacher: 'Pavel', teacherUid: 'teacher-1', status: 'Puudus_p', topic: 'Kellaajad', notes: 'Hästi', duration: 60, time: '10:00',
    }, 'Toimunud', user, { scheduleRecurring: true });
    expect(financeApi.deleteLessonJournal).toHaveBeenCalledWith('scheduled_abc');
    expect(firestore.batch.update).not.toHaveBeenCalled();
    expect(result).toMatchObject({ status: 'Toimunud', accountingSource: 'crm_v2', topic: 'Kellaajad', notes: 'Hästi', scheduleId: 'schedule-1' });
  });

  it('refuses to change an older mark without a calendar link', async () => {
    await expect(lessonsService.changeMark({ id: 'old-1', studentId: 's', date: '2026-08-04', status: 'Puudus_p' }, 'Toimunud', { uid: 'u' })).rejects.toThrow(/tunnipäevikus/);
    expect(financeApi.deleteLessonJournal).not.toHaveBeenCalled();
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

  it('removes a mark that took a package credit through the server, which gives the credit back (Fable T2)', async () => {
    const record = { id: 'pkg-1', accountingSource: 'crm_v2', status: 'Toimunud', scheduleId: 's-1', packageConsumptionStatus: 'consumed' };
    await lessonsService.removeMark(record, { uid: 'teacher-1' }, { scheduleRecurring: false });
    expect(financeApi.deleteLessonJournal).toHaveBeenCalledWith('pkg-1');
    expect(firestore.batch.delete).not.toHaveBeenCalled();
    expect(firestore.batch.commit).not.toHaveBeenCalled();
    await lessonsService.removeMark({ ...record, id: 'owed-1', packageConsumptionStatus: 'needs_attention' }, {});
    expect(financeApi.deleteLessonJournal).toHaveBeenCalledWith('owed-1');
  });

  it('the undo right after „Toimus”: the record in hand is older than the server credit, so a refused delete goes to the server', async () => {
    firestore.batch.commit.mockRejectedValueOnce(Object.assign(new Error('Missing or insufficient permissions.'), { code: 'permission-denied' }));
    const record = { id: 'fresh-1', accountingSource: 'crm_v2', status: 'Toimunud', scheduleId: 's-1' };
    await lessonsService.removeMark(record, { uid: 'teacher-1' });
    expect(firestore.batch.delete).toHaveBeenCalledTimes(1);
    expect(financeApi.deleteLessonJournal).toHaveBeenCalledWith('fresh-1');
  });

  it('other failures of a direct delete are not sent to the server', async () => {
    firestore.batch.commit.mockRejectedValueOnce(Object.assign(new Error('offline'), { code: 'unavailable' }));
    await expect(lessonsService.removeMark({ id: 'x-1', accountingSource: 'crm_v2', status: 'Toimunud' }, {})).rejects.toThrow('offline');
    expect(financeApi.deleteLessonJournal).not.toHaveBeenCalled();
  });

  it('says why the server refused to remove a mark, in Estonian', async () => {
    financeApi.deleteLessonJournal.mockRejectedValueOnce(Object.assign(new Error('Financial period 2026-08 is closed'), { status: 409 }));
    await expect(lessonsService.removeMark({ id: 'p-1', accountingSource: 'crm_v2', packageConsumptionStatus: 'consumed' }, {})).rejects.toThrow('finantsperiood on suletud');
    expect(removeMarkServerError(new Error('Lesson belongs to another teacher')).message).toMatch('teisele õpetajale');
    expect(removeMarkServerError(new Error('Lesson has a financial status and cannot be deleted')).message).toMatch('arvel');
    expect(removeMarkServerError(new Error('Lesson is paid in cash: take back the cash mark first')).message).toMatch('makstud sularahas');
    const other = new Error('boom');
    expect(removeMarkServerError(other)).toBe(other);
    expect(lessonHasPackageMovement({ packageConsumptionStatus: 'restored' })).toBe(false);
  });

  it('a lesson paid in cash keeps its mark until the cash mark is taken back (owner 2026-11-10)', async () => {
    const record = { id: 'cash-1', accountingSource: 'crm_v2', status: 'Toimunud', cashPaid: { receiptId: 'lessoncash_cash-1' } };
    await expect(lessonsService.changeMark(record, 'Puudus_p', {})).rejects.toThrow('makstud sularahas');
    await expect(lessonsService.removeMark(record, {})).rejects.toThrow('makstud sularahas');
    expect(financeApi.deleteLessonJournal).not.toHaveBeenCalledWith('cash-1');
  });
});
