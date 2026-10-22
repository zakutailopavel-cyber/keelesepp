import { wordGrowth } from './wordGrowth.js';

const now = Date.parse('2026-10-23T10:00:00Z');
describe('word growth (owner 2026-10-23)', () => {
  it('counts learned words, new ones this month and own mistakes fixed', () => {
    const words = [
      { word: 'kass', translation: 'кот', box: 3, reviews: 3, createdAt: '2026-09-01' },
      { word: 'koer', translation: 'собака', box: 1, reviews: 1, createdAt: '2026-10-20' },
      { word: 'maja', translation: 'дом', box: 0, reviews: 0, createdAt: '2026-10-21' },
      { word: 'Ma elan siin.', translation: 'Sinu lause: Ma elab siin.', box: 4, createdAt: '2026-10-01' },
      { word: 'Ta on kodus.', translation: 'Sinu lause: Ta olen kodus.', box: 1, createdAt: '2026-10-22' },
    ];
    expect(wordGrowth(words, now)).toEqual({ words: 3, learned: 1, newThisMonth: 2, learning: 1, mistakes: 2, fixed: 1 });
  });
});
