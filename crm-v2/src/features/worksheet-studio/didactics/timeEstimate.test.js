import { SHEET_MINUTES, blockMinutes, sheetMinutes } from './timeEstimate.js';

describe('sheet working time', () => {
  it('counts items, text length and writing', () => {
    expect(blockMinutes({ type: 'gaps', data: { sentences: 'a [b]\nc [d]\ne [f]' } })).toBeCloseTo(1.05);
    expect(blockMinutes({ type: 'writing', data: { minSent: 6, maxSent: 8 } })).toBeCloseTo(7.7);
    const reading = { type: 'reading', data: { passage: Array(120).fill('sõna').join(' '), questions: 'a\nb\nc\nd\ne' } };
    expect(blockMinutes(reading, 'A2')).toBeCloseTo(6);
    expect(blockMinutes(reading, 'B1')).toBeLessThan(blockMinutes(reading, 'A2'));
  });
  it('a short sheet is far from a lesson; the constructor tip says so', async () => {
    const doc = { meta: { level: 'A2', title: 'T', goals: { g: 'x' } }, blocks: [{ id: 'a', type: 'gaps', data: { title: 'G', instruction: 'i', sentences: 'a [b]' } }] };
    expect(sheetMinutes(doc)).toBeLessThan(SHEET_MINUTES.min);
    const { analyzeWorksheet } = await import('../quality.js');
    const quality = analyzeWorksheet(doc);
    expect(quality.minutes).toBe(sheetMinutes(doc));
    expect(quality.issues.some((i) => i.code === 'minutes')).toBe(true);
  });
});
