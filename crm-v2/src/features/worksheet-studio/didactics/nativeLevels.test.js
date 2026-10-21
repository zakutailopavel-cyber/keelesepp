import { describe, expect, it } from 'vitest';
import { harnoFor, levelKey, nativeStage } from './levels.js';
import { depthProblems } from './depth.js';
import { strictNorm } from '../engine/schema.js';
import { BLOCKS } from '../engine/registry.js';

// Estonian as a mother tongue (docs/NATIVE_ESTONIAN_9_12_PLAN.md): school grades get their own norms
describe('mother-tongue grades', () => {
  it('reads „9. klass” and „12. klass” as their own stages, not as A2', () => {
    expect(nativeStage('9. klass')).toBe('EK9');
    expect(nativeStage('12. klass')).toBe('EK12');
    expect(nativeStage('EK9')).toBe('EK9');
    expect(nativeStage('9. klass emakeel')).toBe('EK9');
    expect(nativeStage('12. klass emakeel')).toBe('EK12');
    expect(nativeStage('B1')).toBe('');
    expect(levelKey('9. klass')).toBe('EK9');
    expect(levelKey('12.klass')).toBe('EK12');
    expect(levelKey('B2')).toBe('B2');
  });

  it('follows the Harno exam descriptions: no listening, essay of 200 / ~400 words', () => {
    expect(harnoFor('9. klass emakeel')).toMatchObject({ longestText: 800, listening: false, writing: [[200, 300]] });
    expect(harnoFor('12. klass')).toMatchObject({ longestText: 1000, listening: false, writing: [[400, 450]] });
  });

  it('allows a spelling gap that shows the masked word („(kor_a)”) — it is the task, not a hint', () => {
    const doc = { meta: { level: '9. klass', phase: 'practice' }, blocks: [{ id: 'g', type: 'gaps', data: { sentences: ['Ta luges kolm [korda] (kor_a).', 'Ta jõi [tassi] (ta_i) teed.', 'Tal oli [prillid] (pri_id) ees.'].join('\n') } }] };
    expect(depthProblems(doc).map((p) => p.code)).not.toContain('hinted');
  });
});

describe('strict spelling scoring', () => {
  it('keeps commas and capitals but forgives spaces and the quote style', () => {
    expect(strictNorm('Ta ütles, et tuleb.')).not.toBe(strictNorm('Ta ütles et tuleb.'));
    expect(strictNorm('Tartu')).not.toBe(strictNorm('tartu'));
    expect(strictNorm('Ta  ütles: „Tere.”')).toBe(strictNorm('Ta ütles: „Tere.“'));
  });

  it('scores an error-fix row strictly when the block says so', () => {
    const data = { rows: [{ wrong: 'Ta ütles et tuleb.', answer: 'Ta ütles, et tuleb.' }] };
    const unfixed = (k) => ({ 0: 'Ta ütles et tuleb.' })[k];
    expect(BLOCKS.errorfix.score(data, unfixed)[0].ok).toBe(true);
    expect(BLOCKS.errorfix.score({ ...data, strict: true }, unfixed)[0].ok).toBe(false);
    expect(BLOCKS.errorfix.score({ ...data, strict: true }, () => 'Ta ütles, et tuleb.')[0].ok).toBe(true);
  });
});
