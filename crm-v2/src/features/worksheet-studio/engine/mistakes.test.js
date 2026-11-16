import { describe, expect, it } from 'vitest';
import { checkDocument } from './registry.js';
import { mistakesOf } from './mistakes.js';

const doc = {
  blocks: [
    { id: 'm', type: 'mathtask', data: { title: 'Lahenda.', parts: [
      { text: '$2x=6$', points: 2, answer: '3', solution: '$x=6:2=3$' },
      { text: 'Joonesta.', points: 3, answer: '', solution: 'Sirge läbib (0; 0).' },
      { text: '$x^2=4$', points: 5, answer: '2; -2', solution: 'Kaks lahendit: $\\pm2$.' },
    ] } },
    { id: 't', type: 'truefalse', data: { title: 'Õige või vale?', statements: [{ text: 'Tallinn on pealinn.', answer: 'true' }, { text: 'Tartu on saar.', answer: 'false' }], explain: 'Tallinn on Eesti pealinn.\nTartu on linn, mitte saar.' } },
  ],
};

describe('mistakesOf', () => {
  it('lists every wrong answer with what was written, the right answer and why', () => {
    const answers = { 'm:p0': '4', 'm:p2': '2; -2', 't:0': 'true', 't:1': 'true' };
    const { results } = checkDocument(doc, answers);
    const { tasks, points } = mistakesOf(doc, answers, results);
    expect(tasks.map((t) => t.id)).toEqual(['m', 't']);
    const [math, tf] = tasks;
    expect(math.wrong).toHaveLength(1);
    expect(math.wrong[0]).toMatchObject({ key: 'p0', given: '4', right: '3', why: '$x=6:2=3$' });
    expect(math.wrong[0].prompt).toContain('$2x=6$');
    expect(tf.wrong).toHaveLength(1);
    expect(tf.wrong[0].why).toBe('Tartu on linn, mitte saar.');
    // the drawing (no final answer) is the teacher's: 5 of the 7 checked points
    expect(points).toEqual({ got: 5, max: 7 });
  });

  it('is empty when everything is right, and has no points without math tasks', () => {
    const answers = { 't:0': 'true', 't:1': 'false' };
    const only = { blocks: [doc.blocks[1]] };
    const { results } = checkDocument(only, answers);
    expect(mistakesOf(only, answers, results)).toEqual({ tasks: [], points: null });
  });
});
