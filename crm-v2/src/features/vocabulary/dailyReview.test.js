import { dailyPlan, queueCards } from './dailyReview.js';

const now = Date.parse('2026-10-23T10:00:00Z');
const w = (id, extra) => ({ id, word: id, translation: `${id}-ru`, createdAt: '2026-10-01', ...extra });

describe('„Täna kordamiseks” (the daily queue on spaced repetition)', () => {
  it('forgotten and due words first, then new ones up to the cap, two own sentences one way', () => {
    const words = [
      w('due-late', { box: 2, reviews: 3, dueAt: '2026-10-10' }),
      w('forgot', { box: 0, reviews: 2, reviewedAt: '2026-10-20', dueAt: '2026-10-20' }),
      w('later', { box: 3, reviews: 4, dueAt: '2026-11-30' }),
      ...['n1', 'n2', 'n3'].map((id) => w(id, { box: 0, reviews: 0 })),
      w('s1', { translation: 'Sinu lause: x', box: 1, reviews: 1, dueAt: '2026-10-01' }), w('s2', { translation: 'Sinu lause: y', box: 1, reviews: 1, dueAt: '2026-10-02' }), w('s3', { translation: 'Sinu lause: z', box: 1, reviews: 1, dueAt: '2026-10-03' }),
    ];
    const plan = dailyPlan(words, { now, newPerDay: 4, today: '2026-10-23' });
    expect(plan.items.slice(0, 4).map((item) => item.key)).toEqual(['forgot:r', 's1:r', 's2:r', 'due-late:r']);
    expect(plan).toMatchObject({ due: 4, fresh: 4, forgotten: 1, done: false, count: 8 });
    expect(plan.items.some((item) => item.key.startsWith('s3'))).toBe(false);
    expect(plan.items.filter((item) => item.kind === 'new').map((item) => item.key)).toEqual(['n1:r', 'n2:r', 'n3:r', 'due-late:p']);
  });

  it('turns the queue into cards with a direction each, and tells when the day is done', () => {
    const plan = dailyPlan([w('a', { box: 1, reviews: 1, dueAt: '2026-10-01' })], { now, today: '2026-10-23' });
    expect(plan.cards.map((card) => [card.front, card.dir])).toEqual([['a', 'r'], ['a', 'p']]);
    expect(queueCards([])).toEqual([]);
    const done = dailyPlan([w('b', { box: 2, reviews: 3, reviewedAt: '2026-10-23T09:00:00Z', dueAt: '2026-10-26', srs: { r: { state: 'review', s: 3, due: '2026-10-26T00:00:00.000Z', reps: 3 }, p: { state: 'review', s: 3, due: '2026-10-26T00:00:00.000Z', reps: 1 } } })], { now, today: '2026-10-23' });
    expect(done).toMatchObject({ count: 0, reviewedToday: 1, done: true, nextDue: '2026-10-26T00:00:00.000Z' });
    expect(dailyPlan([], { now }).done).toBe(false);
  });
});
