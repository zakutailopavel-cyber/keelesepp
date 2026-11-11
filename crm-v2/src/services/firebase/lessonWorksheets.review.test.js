// „Õpik” (owner 2026-11-11): teachers save the textbook page, only an admin publishes or turns it down.
import { beforeEach, describe, expect, it, vi } from 'vitest';

const firestore = vi.hoisted(() => ({
  collection: vi.fn((...parts) => ({ path: parts.slice(1).join('/') })),
  doc: vi.fn((...parts) => ({ id: parts.at(-1), path: parts.slice(1).join('/') })),
  getDoc: vi.fn(), getDocs: vi.fn(), query: vi.fn((ref) => ref), where: vi.fn(), runTransaction: vi.fn(), setDoc: vi.fn(),
}));
vi.mock('firebase/firestore', () => firestore);
vi.mock('./client.js', () => ({ requireFirebaseClient: () => ({ db: 'db' }) }));

import { canPublishSheet, lessonWorksheetsService, needsPublishApproval, phaseSummary } from './lessonWorksheets.js';
import { sampleDocument } from '../../features/worksheet-studio/engine/sample.js';

const teacher = { uid: 'teacher-1', displayName: 'Mari', roles: ['teacher'] };
const admin = { uid: 'admin-1', displayName: 'Pavel', roles: ['admin'] };
const lessonSnapshot = { exists: () => true, data: () => ({ title: 'Tund' }) };
function transactionWith(current = null) {
  const set = vi.fn();
  firestore.runTransaction.mockImplementation(async (_db, callback) => callback({
    get: vi.fn(async (ref) => (ref.path === 'curriculumLessons/lesson-1' ? lessonSnapshot : current ? { exists: () => true, data: () => current } : { exists: () => false })),
    set,
  }));
  return set;
}
const published = { worksheetDocUpdatedAt: 'pub-at', worksheetDocVersion: 2, worksheetDocStatus: 'published', publishedWorksheetDoc: sampleDocument(), publishedWorksheetDocVersion: 2, publishedWorksheetDocUpdatedAt: 'pub-at' };

describe('Õpik publishing needs the admin', () => {
  beforeEach(() => vi.clearAllMocks());

  it('only the Õpik page needs approval, and only an admin publishes it', () => {
    expect(needsPublishApproval('opik')).toBe(true);
    expect(needsPublishApproval('practice')).toBe(false);
    expect(canPublishSheet('opik', teacher)).toBe(false);
    expect(canPublishSheet('opik', admin)).toBe(true);
    expect(canPublishSheet('discover', teacher)).toBe(true);
  });

  it('a teacher\'s save waits for the admin; the published copy and the lesson summary say so', async () => {
    const set = transactionWith(published);
    const edited = sampleDocument();
    edited.meta.title = 'Parandatud';
    const record = await lessonWorksheetsService.saveDraft({ lessonId: 'lesson-1', worksheetId: 'opik', role: 'focus', worksheetDoc: edited, user: teacher, baseUpdatedAt: 'pub-at' });
    expect(record.review).toMatchObject({ state: 'pending', byUid: 'teacher-1', byName: 'Mari' });
    expect(record.worksheetDocStatus).toBe('draft');
    expect(record.publishedWorksheetDocVersion).toBe(2);
    expect(record.publishedWorksheetDoc.meta.title).not.toBe('Parandatud');
    const summary = set.mock.calls.find(([ref]) => ref.path === 'curriculumLessons/lesson-1')[1].worksheetPhases.opik;
    expect(summary).toMatchObject({ review: 'pending', reviewBy: 'Mari', status: 'draft', publishedVersion: 2 });
  });

  it('publishing clears the review; the other sheets never get one', async () => {
    transactionWith({ ...published, review: { state: 'pending', byUid: 'teacher-1' } });
    const record = await lessonWorksheetsService.publish({ lessonId: 'lesson-1', worksheetId: 'opik', role: 'focus', worksheetDoc: sampleDocument(), user: admin, baseUpdatedAt: 'pub-at' });
    expect(record.review).toBeUndefined();
    expect(phaseSummary(record).review).toBeUndefined();
    transactionWith(null);
    const practice = await lessonWorksheetsService.saveDraft({ lessonId: 'lesson-1', worksheetId: 'practice', role: 'practice', worksheetDoc: sampleDocument(), user: teacher });
    expect(practice.review).toBeUndefined();
  });

  it('the admin turns a waiting change down with a note; the draft stays for the teacher', async () => {
    const waiting = { ...published, worksheetDocStatus: 'draft', worksheetDocUpdatedAt: 'draft-at', review: { state: 'pending', byUid: 'teacher-1', byName: 'Mari', at: 'x' } };
    const set = transactionWith(waiting);
    const record = await lessonWorksheetsService.rejectReview({ lessonId: 'lesson-1', worksheetId: 'opik', note: 'Tabelis on viga.', user: admin, baseUpdatedAt: 'draft-at' });
    expect(record.review).toMatchObject({ state: 'rejected', note: 'Tabelis on viga.', byUid: 'teacher-1', rejectedBy: 'admin-1', rejectedByName: 'Pavel' });
    expect(record.worksheetDocUpdatedAt).toBe('draft-at');
    expect(set.mock.calls.find(([ref]) => ref.path === 'curriculumLessons/lesson-1')[1].worksheetPhases.opik.review).toBe('rejected');
    await expect(lessonWorksheetsService.rejectReview({ lessonId: 'lesson-1', worksheetId: 'opik', note: 'x', user: admin })).rejects.toThrow(/põhjus/);
    transactionWith(published);
    await expect(lessonWorksheetsService.rejectReview({ lessonId: 'lesson-1', worksheetId: 'opik', note: 'Pole vaja.', user: admin })).rejects.toThrow(/ootavat/);
  });
});
