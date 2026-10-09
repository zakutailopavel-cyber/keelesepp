import { selfCompleted, sortHomework, staleHomework } from './homeworkFlow.js';

describe('homework order and housekeeping', () => {
  const today = '2026-10-09';
  const list = [
    { id: 'done', status: 'Tehtud', due: '2026-10-01', submittedAt: '2026-10-02' },
    { id: 'later', status: 'Ootel', due: '2026-10-20' },
    { id: 'late', status: 'Ootel', due: '2026-10-05' },
    { id: 'very-late', status: 'Ootel', due: '2026-06-18' },
    { id: 'none', status: 'Ootel' },
    { id: 'closed', status: 'Suletud', due: '2026-05-01', updatedAt: '2026-10-08' },
  ];
  it('puts late tasks first, then open ones by due date, then finished ones', () => {
    expect(sortHomework(list, today).map((item) => item.id)).toEqual(['very-late', 'late', 'later', 'none', 'closed', 'done']);
  });
  it('finds open tasks overdue for more than 30 days', () => {
    expect(staleHomework(list, today).map((item) => item.id)).toEqual(['very-late']);
  });
  it('an interactive exercise closes itself; other tasks the student finishes', () => {
    expect(selfCompleted({ isExercise: true, exerciseId: 'e1' })).toBe(false);
    expect(selfCompleted({ task: 'Kirjuta' })).toBe(true);
  });
});
