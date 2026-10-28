import { describe, expect, it } from 'vitest';
import { checkDocument } from './registry.js';
import { norm } from './schema.js';

const doc = { blocks: [
  { id: 'a', type: 'gaps', goal: 'g1', data: { sentences: 'Ma [elan] Tallinnas.\nTa [õpib] koolis.' } },
  { id: 'b', type: 'reading', goal: 'g2', data: { passage: 'x', questions: 'Mis? [ID-kaardiga]\nKes? [Anna]' } },
  { id: 'c', type: 'dictation', goal: 'g1', data: { sentences: 'Ma olen siin.' } },
  { id: 'd', type: 'errorfix', goal: 'g3', data: { rows: [{ wrong: 'X', answer: '' }, { wrong: 'Y', answer: 'Ma lähen kooli.' }] } },
  { id: 'e', type: 'gaps', goal: 'g4', ungraded: true, data: { sentences: 'Ma [olen] kodus.' } },
] };

describe('the result counts only what was really answered and graded (owner 2026-10-27)', () => {
  it('leaves out blocks done in the lesson (no answer), „Ei hinnata” blocks and rows without a right answer', () => {
    const answers = { 'a:0.0': 'elan', 'a:1.0': 'õpib', 'b:0': 'Ta maksis ID kaardiga', 'b:1': 'Mari', 'd:0': 'midagi', 'd:1': 'Ma lähen kooli.', 'e:0.0': 'vale' };
    const { score, skipped, results } = checkDocument(doc, answers);
    expect(skipped).toEqual([{ id: 'c', reason: 'unanswered' }, { id: 'e', reason: 'ungraded' }]);
    expect(score).toMatchObject({ correct: 4, total: 5, skippedBlocks: ['c', 'e'] });
    expect(score.perGoal).toEqual({ g1: { ok: 2, total: 2 }, g2: { ok: 1, total: 2 }, g3: { ok: 1, total: 1 } });
    expect(results['e:0.0']).toBe('bad'); // the mark is still shown on the sheet
  });

  it('a hyphen and a space are the same in answers', () => {
    expect(norm('ID-kaardiga')).toBe(norm('ID kaardiga'));
  });
});

describe('reading checks understanding, not the ending (owner 2026-10-27)', () => {
  it('accepts a full sentence with the right words in another form; a wrong answer stays wrong', async () => {
    const { sameMeaningWords } = await import('./blocks/extra.jsx');
    expect(sameMeaningWords(norm('teisipäeval kell kümme'), norm('Õde pakkus teisipäeva kella kümmet.'))).toBe(true);
    expect(sameMeaningWords(norm('see oleks liiga palju'), norm('Ta ei võtnud kooki, sest seda oleks liiga palju.'))).toBe(true);
    expect(sameMeaningWords(norm('kohvi'), norm('Ta joob teed.'))).toBe(false);
    expect(sameMeaningWords(norm('avada uue konto'), norm('Ta soovis uut kontot.'))).toBe(false);
  });
});
