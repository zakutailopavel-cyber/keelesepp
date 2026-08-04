import { beforeEach, describe, expect, it, vi } from 'vitest';

const firestore = vi.hoisted(() => ({
  addDoc: vi.fn(),
  collection: vi.fn((_db, name) => name),
  deleteDoc: vi.fn(),
  doc: vi.fn((...parts) => parts.join(':')),
  getDocs: vi.fn(),
  query: vi.fn((name, ...constraints) => ({ name, constraints })),
  updateDoc: vi.fn(),
  where: vi.fn((field, operator, value) => ({ field, operator, value })),
  batch: { set: vi.fn(), commit: vi.fn().mockResolvedValue(undefined) },
  writeBatch: vi.fn(),
}));

vi.mock('firebase/firestore', () => firestore);
vi.mock('./client.js', () => ({ requireFirebaseClient: () => ({ db: 'firebase-db' }) }));

import { homeworkService, normalizeSubmission } from './homework.js';

describe('homeworkService submissions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    firestore.writeBatch.mockReturnValue(firestore.batch);
  });

  it('normalizes legacy automatic scores', () => {
    expect(normalizeSubmission('result-1', {
      exerciseTitle: 'Tegusõnad',
      score: { correct: 8, total: 10 },
      completedAt: '2026-08-04T08:00:00.000Z',
    }, 'exercise')).toMatchObject({
      id: 'result-1',
      title: 'Tegusõnad',
      percentage: 80,
      reviewStatus: 'pending',
    });
    expect(normalizeSubmission('worksheet-1', { score: null }, 'worksheet').percentage).toBeNull();
  });

  it('loads completed worksheets and exercise results in ten-student query chunks', async () => {
    firestore.getDocs.mockImplementation(async ({ name, constraints }) => {
      const ids = constraints[0].value;
      if (name === 'worksheetAssignments' && ids.includes('student-1')) return {
        docs: [
          { id: 'worksheet-done', data: () => ({ studentId: 'student-1', lessonTitle: 'Pere tööleht', status: 'done', completedAt: '2026-08-04T09:00:00.000Z' }) },
          { id: 'worksheet-open', data: () => ({ studentId: 'student-1', lessonTitle: 'Pooleli', status: 'new' }) },
        ],
      };
      if (name === 'exerciseResults' && ids.includes('student-11')) return {
        docs: [{ id: 'exercise-1', data: () => ({ studentId: 'student-11', exerciseTitle: 'Sõnavara', pct: 90, completedAt: '2026-08-04T10:00:00.000Z' }) }],
      };
      return { docs: [] };
    });

    const result = await homeworkService.listSubmissionsByStudentIds(Array.from({ length: 11 }, (_, index) => `student-${index + 1}`));

    expect(firestore.getDocs).toHaveBeenCalledTimes(4);
    expect(result.map((item) => item.id)).toEqual(['exercise-1', 'worksheet-done']);
    expect(result).not.toEqual(expect.arrayContaining([expect.objectContaining({ id: 'worksheet-open' })]));
  });

  it('saves the review on the original record and writes one audit event', async () => {
    const submission = { id: 'worksheet-1', submissionKind: 'worksheet', studentId: 'student-1', title: 'Pere tööleht' };
    const user = { uid: 'teacher-1', displayName: 'Õpetaja' };

    await expect(homeworkService.reviewSubmission({
      submission,
      teacherGrade: '5',
      teacherFeedback: 'Väga hea töö!',
      user,
    })).resolves.toMatchObject({ reviewStatus: 'reviewed', teacherGrade: 5, teacherFeedback: 'Väga hea töö!' });

    expect(firestore.batch.set).toHaveBeenCalledTimes(2);
    expect(firestore.batch.set.mock.calls[0]).toEqual([
      'firebase-db:worksheetAssignments:worksheet-1',
      expect.objectContaining({ reviewStatus: 'reviewed', teacherGrade: 5, reviewedBy: 'teacher-1', seenByTeacher: true }),
      { merge: true },
    ]);
    expect(firestore.batch.set.mock.calls[1][1]).toMatchObject({
      type: 'homework.reviewed',
      byUid: 'teacher-1',
      meta: { submissionId: 'worksheet-1', submissionKind: 'worksheet', studentId: 'student-1', teacherGrade: 5 },
    });
    expect(firestore.batch.commit).toHaveBeenCalledOnce();
  });

  it('requires a valid grade or written feedback', async () => {
    const submission = { id: 'result-1', submissionKind: 'exercise' };
    await expect(homeworkService.reviewSubmission({ submission, teacherGrade: '6', teacherFeedback: '', user: { uid: 'teacher-1' } })).rejects.toThrow('1–5');
    await expect(homeworkService.reviewSubmission({ submission, teacherGrade: '', teacherFeedback: ' ', user: { uid: 'teacher-1' } })).rejects.toThrow('Lisa hinne või tagasiside');
    expect(firestore.batch.commit).not.toHaveBeenCalled();
  });

  it('loads open worksheet assignments and preserves their worksheet data', async () => {
    firestore.getDocs.mockResolvedValue({ docs: [{ id: 'assignment-1', data: () => ({ studentId: 'student-1', lessonTitle: 'Pere tööleht', status: 'new', worksheetData: { blocks: [{ id: 'fill-1', type: 'fill' }] } }) }] });
    await expect(homeworkService.listWorksheetAssignmentsByStudentIds(['student-1'])).resolves.toEqual([
      expect.objectContaining({ id: 'assignment-1', title: 'Pere tööleht', status: 'new', worksheetData: { blocks: [{ id: 'fill-1', type: 'fill' }] } }),
    ]);
  });

  it('submits answers on the original assignment and flags them for teacher review', async () => {
    await homeworkService.submitWorksheet({ assignmentId: 'assignment-1', answers: { 'fill-1_0': 'ema' }, score: { correct: 1, total: 1, pct: 100 }, errorLog: [] });
    expect(firestore.updateDoc).toHaveBeenCalledWith('firebase-db:worksheetAssignments:assignment-1', expect.objectContaining({
      status: 'done', answers: { 'fill-1_0': 'ema' }, score: { correct: 1, total: 1, pct: 100 }, seenByTeacher: false,
    }));
  });

  it('stores a bounded student self-assessment on the same assignment', async () => {
    await expect(homeworkService.saveSelfAssessment({ assignmentId: 'assignment-1', difficulty: '4', comment: 'Lugemine oli raske.' })).resolves.toMatchObject({ difficulty: 4, comment: 'Lugemine oli raske.' });
    expect(firestore.updateDoc).toHaveBeenCalledWith('firebase-db:worksheetAssignments:assignment-1', expect.objectContaining({ selfAssessment: expect.objectContaining({ difficulty: 4 }) }));
    await expect(homeworkService.saveSelfAssessment({ assignmentId: 'assignment-1', difficulty: '7', comment: '' })).rejects.toThrow('raskusaste');
  });
});
