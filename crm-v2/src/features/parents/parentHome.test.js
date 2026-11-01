import { describe, expect, it } from 'vitest';
import { childSummary, latestFeedback, moneyDue } from './parentHome.js';

describe('latestFeedback', () => {
  it('the newest of a reviewed work and a lesson note, word for word', () => {
    const feedback = latestFeedback({
      submissions: [{ id: 'w', title: 'Minu päev · Avasta', reviewStatus: 'reviewed', teacherFeedback: 'Väga hea!', teacherGrade: 5, reviewedAt: '2026-10-20T10:00:00.000Z' }],
      lessons: [{ id: 'l', date: '2026-10-25', time: '16:00', status: 'Toimunud', notes: 'Rääkis julgelt.', topic: 'Pere' }],
    });
    expect(feedback).toMatchObject({ text: 'Rääkis julgelt.', about: 'Pere', date: '2026-10-25' });
    expect(latestFeedback({ submissions: [{ id: 'w', title: 'Minu päev · Avasta', reviewStatus: 'reviewed', teacherFeedback: 'Väga hea!', teacherGrade: 5, reviewedAt: '2026-10-20T10:00:00.000Z' }] })).toMatchObject({ text: 'Väga hea!', grade: '5', about: 'Minu päev' });
  });

  it('an automatic percentage, a work not yet reviewed and a missed lesson are not the teacher\'s feedback', () => {
    expect(latestFeedback({
      submissions: [{ id: 'w', reviewStatus: 'pending', percentage: 90 }],
      lessons: [{ id: 'l', date: '2026-10-25', status: 'Puudus_p', notes: 'Haige' }, { id: 'e', date: '2026-10-26', status: 'Toimunud', notes: '  ' }],
    })).toBeNull();
  });
});

describe('childSummary', () => {
  it('counts the merged list: a homework and its sheet are one, a course sheet of his own none', () => {
    const summary = childSummary({
      today: '2026-11-10',
      homework: [{ id: 'h', task: 'Tee leht', status: 'Ootel', due: '2026-11-01', worksheetAssignmentId: 's' }, { id: 'p', task: 'Õpi', status: 'Tehtud' }],
      assignments: [{ id: 's', title: 'Leht', status: 'new', dueDate: '2026-11-01' }, { id: 'own', title: 'Ise', status: 'new', source: 'self_study' }],
    });
    expect(summary.todo.map((task) => task.title)).toEqual(['Leht']);
    expect(summary).toMatchObject({ total: 2, late: 1, done: 1 });
  });
});

describe('moneyDue', () => {
  it('only what is really unpaid: not paid, cancelled or credited invoices', () => {
    expect(moneyDue([
      { id: 'a', amountCents: 9000, paidAmountCents: 9000, status: 'Makstud' },
      { id: 'b', amountCents: 9000, paidAmountCents: 1000, status: 'Ootel', due: '2099-01-01' },
      { id: 'c', amountCents: 9000, status: 'Tühistatud' },
      { id: 'd', amountCents: 9000, status: 'Krediteeritud' },
    ])).toEqual({ cents: 8000, count: 1, overdue: false });
    expect(moneyDue([]).cents).toBe(0);
  });
});
