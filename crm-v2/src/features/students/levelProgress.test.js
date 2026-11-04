import { describe, expect, it } from 'vitest';
import { coursePath, courseKeyFor } from './levelProgress.js';

describe('coursePath', () => {
  it('the course he works on is the next level\'s, for a card learning English too; a school grade is not a language level', () => {
    expect(coursePath('A2', 'B1')).toMatchObject({ from: 'A2', to: 'B1', step: 'B1', levels: ['A2', 'B1'] });
    expect(coursePath('A1', 'B1')).toMatchObject({ step: 'A2', levels: ['A1', 'A2', 'B1'] });
    expect(coursePath('B2', 'B2')).toMatchObject({ reached: true, step: 'B2' });
    expect(coursePath('9. klass', '')).toMatchObject({ from: 'A1', known: false });
    expect(courseKeyFor('B1', 'Inglise keel')).toBe('English B1');
    expect(courseKeyFor('B1', 'Eesti keel')).toBe('B1');
  });
});
