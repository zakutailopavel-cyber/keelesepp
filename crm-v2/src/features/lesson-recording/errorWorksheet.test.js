import { errorsWorksheet, firstChange } from './errorWorksheet.js';

describe('errorsWorksheet', () => {
  it('finds the changed words and makes a gap of the right form', () => {
    expect(firstChange('Eriti palju räägitakse toit raiskamisest.', 'Eriti palju räägitakse toidu raiskamisest.'))
      .toEqual({ wrong: 'toit', right: 'toidu', gapped: 'Eriti palju räägitakse [toidu] raiskamisest.' });
    expect(firstChange('Mul on kaks vend.', 'Mul on kaks venda.')).toEqual({ wrong: 'vend', right: 'venda', gapped: 'Mul on kaks [venda].' });
    expect(firstChange('Sama lause.', 'Sama lause.')).toBeNull();
  });

  it('builds a draft from the learner\'s own sentences: fix the error, gaps, word forms', () => {
    const doc = errorsWorksheet({ studentName: 'Ilja', date: '9.10', errors: [
      { said: 'Eriti palju räägitakse toit raiskamisest.', corrected: 'Eriti palju räägitakse toidu raiskamisest.' },
      { said: 'Samuti peab arvestama jalgrattur vajadustega.', corrected: 'Samuti peab arvestama jalgratturi vajadustega.' },
      { said: 'Ma ei saa.', corrected: 'Ma ei saanud.', unsure: true },
    ] });
    expect(doc.meta.title).toBe('Minu vead tunnist 9.10');
    expect(doc.blocks.map((b) => b.type)).toEqual(['errorfix', 'gaps', 'wordforms']);
    expect(doc.blocks[0].data.rows).toHaveLength(2);
    expect(doc.blocks[1].data.sentences).toBe('Eriti palju räägitakse [toidu] raiskamisest.\nSamuti peab arvestama [jalgratturi] vajadustega.');
    expect(doc.blocks[2].data.rows[1]).toEqual({ base: 'jalgrattur', prompt: 'õige vorm', answer: 'jalgratturi' });
    expect(errorsWorksheet({ errors: [] })).toBeNull();
  });
});
