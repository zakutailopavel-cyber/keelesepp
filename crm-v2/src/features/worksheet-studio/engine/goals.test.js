import { describe, expect, it } from 'vitest';
import { goalEntries } from './goals.js';

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
