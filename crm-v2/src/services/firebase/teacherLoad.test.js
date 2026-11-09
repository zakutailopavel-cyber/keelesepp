import { describe, expect, it, vi } from 'vitest';

const calls = [];
vi.mock('firebase/firestore', () => ({
  collection: (_db, name) => ({ name }),
  where: (field, op, value) => ({ field, op, value }),
  query: (reference, ...filters) => ({ name: reference.name, filters }),
  getDocs: vi.fn(async (target) => {
    calls.push(target);
    const rows = {
      lessons: [{ id: 'j1', data: () => ({ studentId: 's1', date: '2026-11-02', status: 'Toimunud' }) }],
      worksheetAssignments: [
        { id: 'w-done', data: () => ({ studentId: 's1', status: 'done', completedAt: '2026-11-01T10:00:00.000Z' }) },
        { id: 'w-open', data: () => ({ studentId: 's1', status: 'new', completedAt: '2026-11-01T10:00:00.000Z' }) },
      ],
      exerciseResults: [{ id: 'e1', data: () => ({ studentId: 's1', completedAt: '2026-11-02T10:00:00.000Z', reviewStatus: 'pending' }) }],
    }[target.name] || [];
    return { docs: rows };
  }),
}));
vi.mock('./client.js', () => ({ requireFirebaseClient: () => ({ db: {} }) }));
vi.mock('./lessons.js', () => ({ normalizeLesson: (id, data) => ({ id, ...data }) }));
vi.mock('./homework.js', () => ({ normalizeSubmission: (id, data, kind) => ({ id, submissionKind: kind, studentId: data.studentId, completedAt: data.completedAt, reviewStatus: data.reviewStatus || 'pending', source: data }) }));
vi.mock('./schedule.js', () => ({ scheduleService: { list: vi.fn(async () => []) } }));
vi.mock('./groups.js', () => ({ groupsService: { list: vi.fn(async () => { throw new Error('no groups'); }) } }));
vi.mock('./students.js', () => ({ studentsService: { list: vi.fn(async () => ({ items: [{ id: 's1' }] })) } }));
vi.mock('./teacherAvailability.js', () => ({ teacherAvailabilityService: { list: vi.fn(async () => []) } }));
vi.mock('./teachers.js', () => ({ teachersService: { list: vi.fn(async () => [{ id: 't1', name: 'Mari' }]) } }));

const { teacherLoadService } = await import('./teacherLoad.js');

describe('teacherLoadService', () => {
  it('reads the journal and the handed-in works by date ranges only', async () => {
    const result = await teacherLoadService.load({ period: { from: '2026-11-01', to: '2026-11-30' }, today: '2026-11-04' });
    const lessons = calls.find((item) => item.name === 'lessons');
    // the journal from MARKING_START (unmarked lessons) or the period's start, whichever is first, to the period's end
    expect(lessons.filters).toEqual([{ field: 'date', op: '>=', value: '2026-11-01' }, { field: 'date', op: '<=', value: '2026-11-30' }]);
    const sheets = calls.find((item) => item.name === 'worksheetAssignments');
    expect(sheets.filters).toEqual([{ field: 'completedAt', op: '>=', value: '2026-05-08T00:00:00.000Z' }]);
    expect(result.submissions.map((item) => item.id)).toEqual(['w-done', 'e1']); // a sheet not handed in is no review
    expect(result.groups).toEqual([]); // a failing optional read does not break the page
    expect(result.students).toEqual([{ id: 's1' }]);
    expect(result.reviewsFailed).toBe(false);
  });
});
