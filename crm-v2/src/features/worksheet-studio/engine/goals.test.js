import { describe, expect, it } from 'vitest';
import { goalEntries, learnerGoalText } from './goals.js';

describe('goalEntries', () => {
  it('reads the usual map', () => {
    expect(goalEntries({ g_notice: 'Märkan reeglit' })).toEqual([['g_notice', 'Märkan reeglit']]);
  });
  it('reads a stored list of goal objects as text, not objects', () => {
    expect(goalEntries([{ id: 'g_notice', label: 'Parandan oma vead' }, { text: 'Kirjutan' }, 'Räägin'])).toEqual([
      ['g_notice', 'Parandan oma vead'], ['g_2', 'Kirjutan'], ['g_3', 'Räägin'],
    ]);
  });
  it('turns object values of a map into text and survives missing goals', () => {
    expect(goalEntries({ g_use: { id: 'g_use', label: 'Kasutan' } })).toEqual([['g_use', 'Kasutan']]);
    expect(goalEntries(undefined)).toEqual([]);
  });
});

describe('learnerGoalText', () => {
  it('turns a goal written for the teacher into the learner\'s own voice', () => {
    expect(learnerGoalText('Õpilane mõistab lühikese teksti põhiideed.')).toBe('Ma mõistan lühikese teksti põhiideed.');
    expect(learnerGoalText('Õpilane kasutab osastavat käänet')).toBe('Ma kasutan osastavat käänet');
    expect(learnerGoalText('Õpilane on valmis rääkima')).toBe('Ma olen valmis rääkima');
    expect(learnerGoalText('Õpilane ei karda vigu')).toBe('Ma ei karda vigu');
  });
  it('leaves other goals as written', () => {
    expect(learnerGoalText('Ma oskan end tutvustada')).toBe('Ma oskan end tutvustada');
    expect(learnerGoalText('Õpilane läks kooli')).toBe('Õpilane läks kooli');
    expect(learnerGoalText('Õpilased arutavad')).toBe('Õpilased arutavad');
    expect(learnerGoalText(undefined)).toBe('');
  });
});
