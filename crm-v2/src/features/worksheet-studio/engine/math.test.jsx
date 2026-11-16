import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { Md } from './ui.jsx';
import { stripMarks } from './richText.js';

describe('formulas in sheet text', () => {
  it('renders $…$ with KaTeX and keeps the other marks', () => {
    const html = renderToStaticMarkup(<Md text={'Lahenda **võrrand** $x^2-5x+6=0$.'} />);
    expect(html).toContain('class="ws-math"');
    expect(html).toContain('katex');
    expect(html).toContain('<strong>võrrand</strong>');
  });
  it('does not read * or _ inside a formula as emphasis', () => {
    const html = renderToStaticMarkup(<Md text={'$a*b*c$ ja $x_1$'} />);
    expect(html).not.toContain('<em>');
  });
  it('puts $$…$$ on its own line', () => {
    expect(renderToStaticMarkup(<Md text={'$$\\frac{1}{2}$$'} />)).toContain('ws-math--display');
  });
  it('shows a broken formula instead of throwing', () => {
    expect(() => renderToStaticMarkup(<Md text={'$\\frac{1$'} />)).not.toThrow();
  });
  it('leaves text without formulas as before', () => {
    const html = renderToStaticMarkup(<Md text={'*Tere* 5 €'} />);
    expect(html).toContain('<em>Tere</em>');
    expect(html).not.toContain('ws-math');
  });
  it('strips the dollar signs for search', () => {
    expect(stripMarks('Arvuta $2^3$.')).toBe('Arvuta 2^3.');
  });
});
