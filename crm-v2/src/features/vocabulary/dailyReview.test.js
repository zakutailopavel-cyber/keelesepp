import { dailyPlan, dailyWords } from './dailyReview.js';

const now = Date.parse('2026-10-23T10:00:00Z');
const w = (id, extra) => ({ id, word: id, translation: `${id}-ru`, createdAt: '2026-10-01', ...extra });

describe('„Päeva 5 minutit” (owner 2026-10-23)', () => {
  it('forgotten words first, then due ones, then at most three new, two own sentences, about ten cards', () => {
    const words = [
      w('due-late', { box: 2, reviews: 3, dueAt: '2026-10-10' }),
      w('forgot', { box: 0, reviews: 2, reviewedAt: '2026-10-20', dueAt: '2026-10-20' }),
      w('due-early', { box: 1, reviews: 1, dueAt: '2026-10-05' }),
      w('later', { box: 3, reviews: 4, dueAt: '2026-11-30' }),
      ...['n1', 'n2', 'n3', 'n4'].map((id) => w(id, { box: 0, reviews: 0 })),
      w('s1', { translation: 'Sinu lause: x', dueAt: '2026-10-01' }), w('s2', { translation: 'Sinu lause: y', dueAt: '2026-10-02' }), w('s3', { translation: 'Sinu lause: z', dueAt: '2026-10-03' }),
    ];
    expect(dailyWords(words, { now }).map((word) => word.id)).toEqual(['s1', 's2', 'forgot', 'due-early', 'due-late', 'n1', 'n2', 'n3']);
    const many = Array.from({ length: 20 }, (_, index) => w(`d${index}`, { box: 1, reviews: 1, dueAt: '2026-10-01' }));
    expect(dailyWords(many, { now })).toHaveLength(10);
  });

  it('tells what is in the set and when the day is done', () => {
    const plan = dailyPlan([w('forgot', { box: 0, reviews: 1, dueAt: '2026-10-20' }), w('n', { box: 0, reviews: 0 })], { now, today: '2026-10-23' });
    expect(plan).toMatchObject({ count: 2, forgotten: 1, fresh: 1, reviewedToday: 0, done: false });
    expect(plan.deck.map((card) => card.front)).toEqual(['forgot', 'n']);
    expect(dailyPlan([], { now }).done).toBe(false);
  });
});
