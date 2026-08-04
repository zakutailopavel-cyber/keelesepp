import { describe, expect, it } from 'vitest';
import { evaluateExercise, exerciseProgress, parseExerciseFill } from './exercisePlayer.js';

describe('exercise player model', () => {
  it('parses bracket blanks and evaluates normalized fill answers', () => {
    const exercise = { type: 'fill', text: 'Ma [lähen] [kooli].' };
    expect(parseExerciseFill(exercise.text).filter((part) => part.type === 'blank')).toEqual([
      { type: 'blank', answer: 'lähen', index: 0 },
      { type: 'blank', answer: 'kooli', index: 1 },
    ]);
    expect(exerciseProgress(exercise, { 0: ' Lähen ', 1: 'kooli' })).toEqual({ answered: 2, total: 2 });
    expect(evaluateExercise(exercise, { 0: ' Lähen ', 1: 'koolis' })).toEqual({ answers: { 0: ' Lähen ', 1: 'koolis' }, correct: 1, total: 2 });
  });

  it('counts a first choice option and supports legacy q/opts fields', () => {
    const exercise = { type: 'choice', questions: [{ q: 'Pealinn?', opts: ['Tallinn', 'Tartu'], correct: 0 }] };
    expect(exerciseProgress(exercise, { 0: 0 })).toEqual({ answered: 1, total: 1 });
    expect(evaluateExercise(exercise, { 0: 0 })).toMatchObject({ correct: 1, total: 1 });
  });

  it('keeps writing content for manual teacher review', () => {
    expect(evaluateExercise({ type: 'writing' }, { text: 'Minu vastus on valmis.' })).toEqual({ answers: { text: 'Minu vastus on valmis.' }, text: 'Minu vastus on valmis.', wordCount: 4 });
  });

  it('evaluates order, matching and translation exercises', () => {
    expect(evaluateExercise({ type: 'order', sentence: 'Ma õpin eesti keelt' }, { sentence: 'Ma õpin eesti keelt' })).toMatchObject({ correct: 1, total: 1 });
    expect(evaluateExercise({ type: 'match', pairs: [{ l: 'ema', r: 'mother' }] }, { 0: 'mother' })).toMatchObject({ correct: 1, total: 1 });
    expect(evaluateExercise({ type: 'translate', items: [{ from: 'tere', to: 'hello' }] }, { 0: 'hello' })).toMatchObject({ correct: 1, total: 1 });
  });
});
