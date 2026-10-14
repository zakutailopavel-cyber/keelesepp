import { analyzeWorksheet } from './quality.js';

const thin = { meta: { title: 'Minu päev', level: 'B1', phase: 'practice', goals: { g: 'x' } }, blocks: [
  { id: 'g', type: 'gaps', data: { title: 'Lüngad.', instruction: 'Täida.', sentences: 'Ma [olen] kodus.\nTa [on] tööl.' } },
  { id: 's', type: 'speaking', data: { title: 'Räägi.', instruction: 'Räägi.', minSec: 120, maxSec: 240 } },
] };

describe('constructor check and depth', () => {
  it('a thin lesson sheet gets depth warnings, but publishing is not blocked', () => {
    const result = analyzeWorksheet(thin);
    expect(result.warnings.map((issue) => issue.code)).toEqual(expect.arrayContaining(['depth:thin', 'depth:short-tasks']));
    expect(result.errors.filter((issue) => issue.code.startsWith('depth:'))).toEqual([]);
  });

  it('a short sheet a teacher makes for one task is not measured as a lesson', () => {
    expect(analyzeWorksheet({ ...thin, meta: { ...thin.meta, phase: '' } }).warnings.some((issue) => issue.code.startsWith('depth:'))).toBe(false);
    expect(analyzeWorksheet({ ...thin, meta: { ...thin.meta, shortSheet: true } }).warnings.some((issue) => issue.code.startsWith('depth:'))).toBe(false);
  });
});
