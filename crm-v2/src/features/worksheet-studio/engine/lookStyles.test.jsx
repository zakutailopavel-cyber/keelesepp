import { render } from '@testing-library/react';
import Sheet from './Sheet.jsx';
import { STYLE_PRESETS, styleOf, styleSameType, themedTone, withStyle } from './look.js';
import { TONES } from './schema.js';
import { sampleDocument } from './sample.js';

globalThis.ResizeObserver = globalThis.ResizeObserver || class { observe() {} disconnect() {} };

describe('ready-made styles and sheet themes', () => {
  it('a preset sets tone and look; a style is copied and given to all blocks of the type', () => {
    const grammar = STYLE_PRESETS.find((preset) => preset.key === 'grammar');
    const block = { id: 'a', type: 'gaps', tone: 'blue', look: { icon: 'time' }, width: 'half' };
    expect(withStyle(block, grammar)).toEqual({ id: 'a', type: 'gaps', tone: 'green', width: 'half', look: { frame: 'line', icon: 'idea', head: 'band' } });
    expect(withStyle(block, STYLE_PRESETS.find((preset) => preset.key === 'plain'))).toEqual({ id: 'a', type: 'gaps', tone: 'white', width: 'half' });
    const blocks = [withStyle(block, grammar), { id: 'b', type: 'gaps', tone: 'blue' }, { id: 'c', type: 'match', tone: 'blue' }];
    const next = styleSameType(blocks, blocks[0]);
    expect(next[1]).toMatchObject({ tone: 'green', look: { head: 'band' } });
    expect(next[2]).toEqual(blocks[2]);
    expect(styleOf(blocks[0])).toEqual({ tone: 'green', look: { frame: 'line', icon: 'idea', head: 'band' } });
  });

  it('a theme redraws the tones and the sheet carries the heading look', () => {
    expect(themedTone('', 'blue', TONES.blue)).toBe(TONES.blue);
    expect(themedTone('bw', 'blue', TONES.blue).card).toBe('#ffffff');
    const doc = sampleDocument();
    doc.meta.theme = 'kids';
    const task = doc.blocks.find((b) => b.type === 'gaps' || b.type === 'truefalse' || b.type === 'choice');
    task.look = { head: 'tab', num: 'square' };
    const { container } = render(<Sheet doc={doc} mode="print" />);
    expect(container.querySelector('.ws-root').className).toContain('theme-kids');
    const card = container.querySelector(`.ws-page [data-block="${task.id}"]`);
    expect(card.className).toContain('head-tab');
    expect(card.className).toContain('num-square');
    expect(card.getAttribute('style')).toContain('--ws-badge');
  });
});
