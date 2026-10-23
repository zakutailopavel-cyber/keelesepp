import { errorCards } from './errorCards.js';

const doc = { blocks: [
  { id: 'g', type: 'gaps', data: { sentences: 'Ma [elan|elangi] Tallinnas.\nTa [on] 34 aastat vana ja [elab] Tartus.' } },
  { id: 't', type: 'transformation', data: { rows: [{ prompt: 'I am happy.', answer: 'I was happy yesterday.|I was happy.' }, { prompt: 'x', answer: 'Yes' }] } },
] };

describe('sheet errors become sentence cards (owner 2026-10-23)', () => {
  it('rebuilds the sentence around a wrong gap and keeps the other gaps right', () => {
    expect(errorCards(doc, [{ key: 'g:0.0', answer: 'elab' }, { key: 'g:1.1', answer: 'elan' }])).toEqual([
      { word: 'Ma elan Tallinnas.', translation: 'Sinu lause: Ma elab Tallinnas.' },
      { word: 'Ta on 34 aastat vana ja elab Tartus.', translation: 'Sinu lause: Ta on 34 aastat vana ja elan Tartus.' },
    ]);
  });

  it('a whole-sentence answer is a card; a short one, an empty answer and an unknown block are not', () => {
    expect(errorCards(doc, [
      { key: 't:0', answer: 'I am happy yesterday.' },
      { key: 't:1', answer: 'No' },
      { key: 'g:0.0', answer: '' },
      { key: 'missing:0', answer: 'x' },
    ])).toEqual([{ word: 'I was happy yesterday.', translation: 'Sinu lause: I am happy yesterday.' }]);
  });

  it('at most five cards per sheet, no doubles', () => {
    const many = Array.from({ length: 8 }, () => ({ key: 'g:0.0', answer: 'elab' }));
    expect(errorCards(doc, many)).toHaveLength(1);
    const lines = Array.from({ length: 8 }, (_, i) => `Lause ${i} [on] hea.`).join('\n');
    expect(errorCards({ blocks: [{ id: 'g', type: 'gaps', data: { sentences: lines } }] }, Array.from({ length: 8 }, (_, i) => ({ key: `g:${i}.0`, answer: 'oli' })))).toHaveLength(5);
  });
});
