import { fireEvent, render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import BlankFillText from './BlankFillText.jsx';
import { blankCount, blankParts, fillPatch, fillable } from './blankFill.js';

describe('gaps in the teacher text (owner 2026-11-25)', () => {
  it('three or more underscores, dots or an ellipsis make a gap; two do not', () => {
    expect(blankCount('a ____ b .... c … d __ e ..')).toBe(3);
    expect(blankParts('Ma ostsin uue ______ (jope).')).toEqual([{ text: 'Ma ostsin uue ' }, { gap: 0, raw: '______' }, { text: ' (jope).' }]);
  });
  it('only a staff text with gaps is fillable', () => {
    expect(fillable({ type: 'text', byStaff: true, text: 'Ma ____' })).toBe(true);
    expect(fillable({ type: 'text', text: 'Ma ____' })).toBe(false);
    expect(fillable({ type: 'text', byStaff: true, text: 'Tere' })).toBe(false);
    expect(fillable({ type: 'note', byStaff: true, text: 'Ma ____' })).toBe(false);
  });
  it('one gap is written at a time', () => {
    expect(fillPatch(3, 'suppi')).toEqual({ 'fills.3': 'suppi' });
  });
  it('shows a box per gap with the saved answer and saves on leaving the box', () => {
    const onSave = vi.fn();
    render(<BlankFillText element={{ text: '1. uue ____ (jope). 2. maitsvat ____ (supp).', fills: { 0: 'jope' } }} onSave={onSave} />);
    expect(screen.getByLabelText('Lünk 1')).toHaveValue('jope');
    const second = screen.getByLabelText('Lünk 2');
    fireEvent.focus(second);
    fireEvent.change(second, { target: { value: 'suppi' } });
    fireEvent.blur(second);
    expect(onSave).toHaveBeenCalledWith(1, 'suppi');
  });
  it('Enter moves on to the next box', () => {
    const { container } = render(<div className="sb-text"><BlankFillText element={{ text: 'a ____ b ____', fills: {} }} onSave={() => {}} /></div>);
    const [first, second] = container.querySelectorAll('.sb-gap');
    first.focus();
    fireEvent.keyDown(first, { key: 'Enter' });
    expect(globalThis.document.activeElement).toBe(second);
  });
});
