import { render } from '@testing-library/react';
import { createBlock, scoreDocument } from '../registry.js';
import Sheet from '../Sheet.jsx';
import { sampleDocument } from '../sample.js';
import { clozeGaps } from './exam.jsx';
import { didacticCheck } from '../../didactics/didacticCheck.js';

globalThis.ResizeObserver = globalThis.ResizeObserver || class { observe() {} disconnect() {} };
const doc = (blocks) => ({ ...sampleDocument(), blocks });

describe('cloze (option gaps in a text)', () => {
  it('reads the gaps, prints the options under the text and scores the chosen option', () => {
    const b = createBlock('cloze');
    expect(clozeGaps(b.data.passage).map((g) => g.find((o) => o.correct).text)).toEqual(['alustasin', 'tutvustas', 'meeldib']);
    const { container } = render(<Sheet doc={doc([b])} mode="print" />);
    expect(container.querySelectorAll('.ws-root > .ws-page .ws-cloze-gap')).toHaveLength(3);
    expect(container.querySelectorAll('.ws-root > .ws-page .ws-cloze-options li')).toHaveLength(3);
    const answers = { [`${b.id}:0`]: 0, [`${b.id}:1`]: 2, [`${b.id}:2`]: 0 };
    expect(scoreDocument(doc([b]), answers).perBlock[b.id].map((i) => i.ok)).toEqual([true, false, true]);
  });

  it('is measured as solved sentences with one answer per gap', () => {
    const b = createBlock('cloze');
    const check = didacticCheck({ meta: { level: 'B1' }, blocks: [b] });
    expect(check.checks.find((c) => c.code === `items-${b.id}`)).toBeTruthy();
  });
});
