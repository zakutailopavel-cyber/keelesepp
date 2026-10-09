import { personalWorksheet } from './personalWorksheet.js';

describe('personal worksheet', () => {
  const now = Date.parse('2026-10-10T10:00:00Z');
  it('uses the learner\'s errors, due words and weaker productive skill with the level\'s amounts', () => {
    const words = ['vend|брат', 'õde|сестра', 'ema|мама', 'isa|папа', 'kass|кот'].map((x, i) => ({ id: `w${i}`, word: x.split('|')[0], translation: x.split('|')[1], box: i, dueAt: '2026-10-01' }));
    const lessons = [{ startedAt: '2026-10-09T10:00:00Z', analysis: { errors: [{ said: 'Mul on kaks vend.', corrected: 'Mul on kaks venda.' }, { said: 'x y', corrected: 'x z', unsure: true }] } }];
    const skills = [{ skill: 'Rääkimine', pct: 80 }, { skill: 'Kirjutamine', pct: 40 }];
    const { document: doc, summary } = personalWorksheet({ student: { name: 'Ilja', level: 'B1' }, lessons, words, skills, now });
    expect(summary).toEqual({ errors: 1, words: 5, task: 'Kirjutamine' });
    expect(doc.meta.level).toBe('B1');
    expect(doc.blocks.map((b) => b.type)).toEqual(['vocab', 'match', 'errorfix', 'gaps', 'wordforms', 'writing']);
    expect(doc.blocks[5].data).toMatchObject({ minSent: 10, maxSent: 14 });
    expect(Object.keys(doc.meta.goals)).toEqual(['g_words', 'g_errors', 'g_use']);
  });

  it('without data it does not make an empty sheet', () => {
    expect(personalWorksheet({ student: { level: 'A2' } })).toBeNull();
  });
});
