import { monthSteps } from './monthSteps.js';

const now = Date.parse('2026-10-23T12:00:00Z');
const day = (n) => new Date(now - n * 86400000).toISOString();
const doc = (goals) => ({ meta: { title: 'X', goals }, blocks: [] });

describe('Kuu sammud (owner 2026-10-23)', () => {
  it('the month\'s lesson steps, the three sheets of one lesson together, each with its mastery', () => {
    const goals = { g1: 'Ma oskan ennast tutvustada', g2: 'Ma saan aru lühikesest tekstist' };
    const result = monthSteps([
      { lessonTitle: 'Tutvumine', status: 'done', completedAt: day(3), worksheetDoc: doc(goals), score: { perGoal: { g1: { ok: 9, total: 10 }, g2: { ok: 2, total: 5 } } } },
      { lessonTitle: 'Tutvumine', status: 'done', completedAt: day(2), worksheetDoc: doc(goals), score: { perGoal: { g2: { ok: 3, total: 5 } } } },
      { lessonTitle: 'Pere', status: 'new', assignedAt: day(1), worksheetDoc: doc({ g1: 'Ma räägin oma perest' }) },
      { lessonTitle: 'Vana', status: 'done', completedAt: day(50), worksheetDoc: doc({ g1: 'Vana samm' }), score: { perGoal: { g1: { ok: 1, total: 1 } } } },
    ], { now });
    expect(result.steps.map((step) => [step.lesson, step.goal, step.pct, step.state])).toEqual([
      ['Tutvumine', 'Ma oskan ennast tutvustada', 90, 'mastered'],
      ['Tutvumine', 'Ma saan aru lühikesest tekstist', 50, 'practise'],
      ['Pere', 'Ma räägin oma perest', null, 'todo'],
    ]);
    expect(result).toMatchObject({ total: 3, mastered: 1, practise: 1, review: 0, todo: 1 });
  });
});
