import { render } from '@testing-library/react';

globalThis.ResizeObserver = globalThis.ResizeObserver || class { observe() {} disconnect() {} };
import Sheet from './Sheet.jsx';
import { newDocument } from './schema.js';
import { gapWidth, LONG_GAP } from './ui.jsx';

// owner 2026-10-13: a sentence written into a 2–3 cm gap did not fit and was hard to read
const docWith = (sentences) => ({ ...newDocument(), blocks: [{ id: 'g', type: 'gaps', width: 'full', data: { title: 'Vali lause.', instruction: '', sentences, bank: '', showBank: 'no' } }] });

describe('answer fields that fit the answer', () => {
  it('a gap whose answer is a sentence gets its own growing line, a short gap keeps its width', () => {
    expect(gapWidth(['koera'], '26mm')).toBe('26mm');
    expect(gapWidth('Esimestel nädalatel jäi ta iga päev tööle hiljaks.', '26mm')).toBe('100%');
    expect(gapWidth(['x'.repeat(LONG_GAP)], '24mm')).toBe('24mm');
    const { container } = render(<Sheet doc={docWith('Uus kolleeg tuli kevadel. [Esimestel nädalatel jäi ta iga päev tööle hiljaks.]\nMa näen [koera].')} mode="interactive" answers={{}} onAnswer={() => {}} />);
    const fields = container.querySelectorAll('[data-block="g"] .ws-line');
    expect(fields[0].tagName).toBe('TEXTAREA');
    expect(fields[1].tagName).toBe('INPUT');
  });

  it('a short field widens with a longer answer but never past its line', () => {
    const { container } = render(<Sheet doc={docWith('Ma näen [koera].')} mode="review" answers={{ 'g:0.0': 'seda väga suurt ja ilusat koera' }} />);
    const field = container.querySelector('[data-block="g"] input.ws-line');
    expect(field.style.maxWidth).toBe('100%');
    expect(field.value).toBe('seda väga suurt ja ilusat koera');
    expect(field.style.width).toMatch(/^max\(.+, 33ch\)$/);
  });
});
