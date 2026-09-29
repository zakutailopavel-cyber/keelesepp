import { checkDocument, exampleAnswers } from './registry.js';
import { seededShuffle } from './blocks/tasks.jsx';

const doc = (block) => ({ blocks: [{ id: 'b1', ...block }] });

describe('task modifications', () => {
  it('"Näide" fills the first item with its answer for every main task type', () => {
    expect(exampleAnswers({ type: 'gaps', opts: { example: true }, data: { sentences: 'Ma [ärkan|tõusen] vara.\nTa [sööb].' } })).toEqual({ '0.0': 'ärkan' });
    expect(exampleAnswers({ type: 'choice', opts: { example: true }, data: { questions: [{ q: 'X', options: 'a\n*b\nc' }] } })).toEqual({ 0: 1 });
    expect(exampleAnswers({ type: 'truefalse', opts: { example: true }, data: { statements: [{ text: 'x', answer: 'false' }] } })).toEqual({ 0: 'false' });
    expect(exampleAnswers({ type: 'wordorder', opts: { example: true }, data: { sentences: 'Ma olen kodus.\nTa läheb.' } })).toEqual({ 0: 'Ma olen kodus.' });
    expect(exampleAnswers({ type: 'dialogue', opts: { example: true }, data: { lines: [{ who: 'A', text: 'Tere, [Mari]!' }] } })).toEqual({ '0.0': 'Mari' });
    expect(exampleAnswers({ type: 'gaps', data: { sentences: 'Ma [ärkan].' } })).toEqual({});
  });

  it('the example is not scored — only the student\'s own answers count', () => {
    const block = { type: 'truefalse', opts: { example: true }, data: { statements: [{ text: 'a', answer: 'true' }, { text: 'b', answer: 'false' }] } };
    const { score } = checkDocument(doc(block), { 'b1:1': 'false' });
    expect(score).toMatchObject({ correct: 1, total: 1, pct: 100 });
  });

  it('shuffles options the same way every time for the same block', () => {
    const list = ['a', 'b', 'c', 'd', 'e'];
    expect(seededShuffle(list, 'b1:0')).toEqual(seededShuffle(list, 'b1:0'));
    expect([...seededShuffle(list, 'b1:0')].sort()).toEqual(list);
    expect(seededShuffle(list, 'b1:0')).not.toEqual(list);
  });
});
