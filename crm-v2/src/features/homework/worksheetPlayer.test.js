import { describe, expect, it } from 'vitest';
import { calculateWorksheetResult, parseFillText, worksheetProgress } from './worksheetPlayer.js';

const blocks = [
  { id: 'fill', type: 'fill', text: 'Minu [ema] ja [isa].' },
  { id: 'choice', type: 'choice', questions: [{ q: 'Pealinn?', opts: ['Tallinn', 'Tartu'], correct: 0 }] },
  { id: 'match', type: 'match', pairs: [{ l: 'ema', r: 'mother' }] },
  { id: 'writing', type: 'writing', task: 'Kirjuta perest.' },
];

describe('worksheet player model', () => {
  it('parses legacy bracket answers without changing their order', () => {
    expect(parseFillText('Minu [ema] ja [isa].')).toEqual([
      { type: 'text', value: 'Minu ' },
      { type: 'blank', answer: 'ema', index: 0 },
      { type: 'text', value: ' ja ' },
      { type: 'blank', answer: 'isa', index: 1 },
      { type: 'text', value: '.' },
    ]);
  });

  it('counts zero-valued choice answers as completed', () => {
    expect(worksheetProgress(blocks, { fill_0: 'ema', fill_1: 'isa', choice_0: 0, match_0: 'mother', writing: 'Minu pere.' })).toEqual({ answered: 5, total: 5, complete: true });
  });

  it('calculates a compatible score and a concrete error log', () => {
    expect(calculateWorksheetResult(blocks, { fill_0: 'EMA', fill_1: 'vend', choice_0: 0, match_0: 'father', writing: 'Minu pere.' })).toEqual({
      score: { correct: 2, total: 4, pct: 50 },
      errorLog: [
        expect.objectContaining({ type: 'fill', correct: 'isa', given: 'vend' }),
        expect.objectContaining({ type: 'match', correct: 'mother', given: 'father' }),
      ],
    });
  });
});
