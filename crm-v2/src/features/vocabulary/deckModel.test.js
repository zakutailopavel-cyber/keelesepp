import { buildTest, cardsFromDoc, checkAnswer, choices, deckFromSheets, deckFromWords, learnedCount, learnStep, startLearn, vocabPairs } from './deckModel.js';

const seq = (...values) => { let i = 0; return () => values[i++ % values.length]; };

describe('study decks', () => {
  it('reads a vocabulary list, keeping commas inside a translation', () => {
    expect(vocabPairs('kõigepealt — сначала, kuna — так как, хотя, pärast seda – после этого')).toEqual([
      ['kõigepealt', 'сначала'], ['kuna', 'так как, хотя'], ['pärast seda', 'после этого'],
    ]);
    expect(vocabPairs(['eelarve — бюджет', 'sääst — экономия'])).toEqual([['eelarve', 'бюджет'], ['sääst', 'экономия']]);
  });

  it('takes the vocabulary list and the matching tasks of a sheet', () => {
    const doc = { blocks: [
      { type: 'vocab', data: { words: 'eelarve — бюджет, sääst — экономия' } },
      { type: 'match', data: { pairs: [{ left: 'murda jääd', right: 'teha esimene samm' }, { left: '', right: 'x' }] } },
      { type: 'gaps', data: { sentences: 'x' } },
    ] };
    expect(cardsFromDoc(doc)).toEqual([
      { front: 'eelarve', back: 'бюджет' }, { front: 'sääst', back: 'экономия' }, { front: 'murda jääd', back: 'teha esimene samm' },
    ]);
  });

  it('a lesson deck uses published sheets only and one card per word', () => {
    const sheet = (words, extra = {}) => ({ worksheetDocStatus: 'published', worksheetDoc: { blocks: [{ type: 'vocab', data: { words } }] }, ...extra });
    const deck = deckFromSheets([
      sheet('eelarve — бюджет, sääst — экономия'),
      sheet('Eelarve — бюджет, intress — процент'),
      { worksheetDocStatus: 'draft', worksheetDoc: { blocks: [{ type: 'vocab', data: { words: 'mustand — черновик' } }] } },
    ], 'est-c1-051');
    expect(deck.map((card) => card.front)).toEqual(['eelarve', 'sääst', 'intress']);
    expect(deck[0].id).toBe('est-c1-051:0');
  });

  it('my words become cards when they have a meaning', () => {
    expect(deckFromWords([{ id: 'w1', word: 'kass', translation: 'кошка' }, { id: 'w2', word: 'koer' }]).map((card) => card.front)).toEqual(['kass']);
  });

  it('checks a written answer: case, punctuation, alternatives and one typo in a longer word', () => {
    expect(checkAnswer('Eelarve!', 'eelarve')).toBe('right');
    expect(checkAnswer('maja', 'kodu / maja')).toBe('right');
    expect(checkAnswer('eelarv', 'eelarve')).toBe('almost');
    expect(checkAnswer('kas', 'kass')).toBe('wrong');
    expect(checkAnswer('saast', 'sääst')).toBe('wrong');
    expect(checkAnswer('säast', 'sääst')).toBe('almost');
    expect(checkAnswer('', 'kass')).toBe('wrong');
  });

  it('offers four different choices with the right one among them', () => {
    const deck = ['a', 'b', 'c', 'd', 'e'].map((front, index) => ({ id: String(index), front, back: `${front}-t` }));
    const options = choices(deck[0], deck, 'back', seq(0.1, 0.7, 0.3, 0.9));
    expect(options).toHaveLength(4);
    expect(options).toContain('a-t');
    expect(new Set(options).size).toBe(4);
  });

  it('„Õpi” learns a card after a right choice and a right written answer; a mistake sends it back', () => {
    const deck = [{ id: '1', front: 'a', back: 'b' }, { id: '2', front: 'c', back: 'd' }];
    let state = startLearn(deck);
    state = learnStep(state, '1', true);
    expect(state.queue).toEqual(['2', '1']);
    state = learnStep(state, '2', false);
    state = learnStep(state, '1', true);
    expect(learnedCount(state)).toBe(1);
    expect(state.queue).toEqual(['2']);
    expect(state.mistakes).toBe(1);
  });

  it('a test mixes choice, written and true/false questions', () => {
    const deck = ['a', 'b', 'c', 'd', 'e', 'f'].map((front, index) => ({ id: String(index), front, back: `${front}-t` }));
    const test = buildTest(deck, { size: 6, random: seq(0.2, 0.6, 0.4, 0.8) });
    expect(test).toHaveLength(6);
    expect(new Set(test.map((question) => question.kind))).toEqual(new Set(['choice', 'write', 'truefalse']));
    test.filter((question) => question.kind === 'truefalse').forEach((question) => expect(typeof question.truth).toBe('boolean'));
  });
});
