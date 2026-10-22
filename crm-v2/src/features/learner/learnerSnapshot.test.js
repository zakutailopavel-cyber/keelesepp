import { agoLabel, isForgotten, learnerSnapshot, reviewPageText } from './learnerSnapshot.js';

const now = Date.parse('2026-10-23T12:00:00Z');
const daysAgo = (n) => new Date(now - n * 86400000).toISOString();

describe('learner snapshot (owner 2026-10-23)', () => {
  it('says when the student last practised and what he did this week', () => {
    const snap = learnerSnapshot({
      now,
      words: [{ id: 'w1', word: 'kass', box: 2, reviews: 3, reviewedAt: daysAgo(1) }, { id: 'w2', word: 'koer', box: 0, reviews: 0 }],
      assignments: [{ id: 'a1', status: 'done', completedAt: daysAgo(3), title: 'Avasta', score: { correct: 9, total: 10 }, errorLog: [] }],
      homework: [{ id: 'h1', status: 'Tehtud', submittedAt: daysAgo(10) }],
    });
    expect(snap.lastActivity).toMatchObject({ label: 'eile', kind: 'sõnu' });
    expect(snap.week).toEqual({ total: 2, words: 1, sheets: 1, homework: 0 });
    expect(snap.words).toMatchObject({ total: 2, learned: 0, neverPractised: 1 });
    expect(snap.signals).toEqual([{ tone: 'success', text: 'Õpib järjepidevalt — võib minna uue teemaga edasi.' }]);
  });

  it('warns about a student who has not practised, forgotten words, late homework and a weak sheet', () => {
    const snap = learnerSnapshot({
      now,
      words: [
        { id: 'w1', word: 'eelarve', translation: 'бюджет', box: 0, reviews: 4, reviewedAt: daysAgo(20) },
        { id: 'w2', word: 'sääst', box: 4, reviews: 5, reviewedAt: daysAgo(30) },
      ],
      assignments: [{ id: 'a1', status: 'done', completedAt: daysAgo(9), title: 'Harjuta', score: { correct: 5, total: 10 }, errorLog: [{ key: 'b1:0' }, { key: 'b1:1' }] }],
      homework: [{ id: 'h1', status: 'Ootel', task: 'Kirjuta kiri', due: '2026-10-15' }, { id: 'h2', status: 'Suletud', due: '2026-10-01' }],
      lessons: [{ date: '2026-10-20', status: 'Toimunud', topic: 'Pank', notes: 'Kordame osastavat' }, { date: '2026-10-22', status: 'Puudus_eta' }],
      describe: (doc, log) => log.map((entry, index) => ({ text: `Viga ${index + 1}` })),
    });
    expect(snap.signals.map((signal) => signal.text)).toEqual([
      'Pole iseseisvalt õppinud 9 päeva tagasi.',
      '1 sõna ununeb — alusta tundi nende kordamisega.',
      '1 kodutööd on tähtajast üle.',
      'Tööleht „Harjuta”: 50% — vaata vead üle.',
    ]);
    expect(snap.words.forgotten).toEqual([{ id: 'w1', word: 'eelarve', translation: 'бюджет' }]);
    expect(snap.words.learned).toBe(1);
    expect(snap.sheets[0]).toMatchObject({ title: 'Harjuta', score: 50, errors: 2, details: ['Viga 1', 'Viga 2'] });
    expect(snap.homework).toEqual({ open: 1, overdue: [{ id: 'h1', task: 'Kirjuta kiri', due: '2026-10-15' }] });
    // an absence is not the last lesson
    expect(snap.lastLesson).toEqual({ date: '2026-10-20', topic: 'Pank', notes: 'Kordame osastavat' });
    expect(reviewPageText(snap)).toBe('Kordame:\neelarve — бюджет');
  });

  it('a student with no work at all gets one clear sentence, and a broken error reader does not stop the card', () => {
    const snap = learnerSnapshot({ now, assignments: [{ id: 'a', status: 'done', completedAt: daysAgo(1), errorLog: [{ key: 'x' }] }], describe: () => { throw new Error('bad doc'); } });
    expect(snap.sheets[0].details).toEqual([]);
    expect(learnerSnapshot({ now }).signals).toEqual([{ tone: 'warning', text: 'Pole veel iseseisvalt õppinud.' }]);
    expect(reviewPageText(learnerSnapshot({ now }))).toBe('');
  });

  it('labels time like a person and knows a forgotten word', () => {
    expect(agoLabel(now, now)).toBe('täna');
    expect(agoLabel(now - 2 * 86400000, now)).toBe('2 päeva tagasi');
    expect(agoLabel(now - 21 * 86400000, now)).toBe('3 nädalat tagasi');
    expect(agoLabel(0, now)).toBe('');
    expect(isForgotten({ box: 0, reviews: 1 })).toBe(true);
    expect(isForgotten({ box: 0, reviews: 0 })).toBe(false);
  });
});
