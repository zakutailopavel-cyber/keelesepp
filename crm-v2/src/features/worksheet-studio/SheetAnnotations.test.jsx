/* global setTimeout */
import { act, fireEvent, render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import SheetAnnotations from './SheetAnnotations.jsx';
import { offsetsOf, rangeOf } from './sheetAnnotationsModel.js';

globalThis.ResizeObserver = globalThis.ResizeObserver || class { observe() {} disconnect() {} };

const page = (answer = 'koer') => (
  <div className="ws-page">
    <section data-block="b1"><p>Minu <b>koer</b> on suur.</p><input className="ws-line" readOnly value={answer} /></section>
  </div>
);

const flush = () => act(() => new Promise((resolve) => setTimeout(resolve, 30)));

describe('sheet annotation model', () => {
  it('turns a selection into offsets inside the block and back', () => {
    const { container } = render(page());
    const card = container.querySelector('[data-block="b1"]');
    const bold = card.querySelector('b').firstChild;
    const range = document.createRange();
    range.setStart(bold, 0); range.setEnd(bold, 4);
    const offsets = offsetsOf(card, range);
    expect(offsets).toEqual({ start: 5, end: 9 });
    expect(rangeOf(card, { ...offsets, selectedText: 'koer' }).toString()).toBe('koer');
    // text moved: found again by the quote
    expect(rangeOf(card, { start: 0, end: 4, selectedText: 'suur' }).toString()).toBe('suur');
    expect(rangeOf(card, { start: 0, end: 4, selectedText: 'kass' })).toBeNull();
  });
});

describe('SheetAnnotations', () => {
  it('shows a numbered mark on the answer box with its comment', async () => {
    render(<SheetAnnotations annotations={[{ id: 'a1', kind: 'field', color: 'error', blockId: 'b1', fieldIndex: 0, start: 0, end: 4, selectedText: 'koer', parandus: 'koera', selgitus: 'osastav' }]}>{page()}</SheetAnnotations>);
    await flush();
    fireEvent.click(screen.getByRole('button', { name: 'Märkus 1: koera' }));
    expect(screen.getByRole('dialog', { name: 'Märkus' })).toHaveTextContent('koera');
    expect(screen.queryByRole('button', { name: /Eemalda/ })).toBeNull();
  });

  it('lets the teacher mark a learner answer and saves it with the other marks', async () => {
    const onChange = vi.fn().mockResolvedValue([]);
    const old = { id: 'old', blockId: 'w', start: 0, end: 1, selectedText: 'a', parandus: 'b' };
    const { container } = render(<SheetAnnotations annotations={[old]} editable onChange={onChange}>{page()}</SheetAnnotations>);
    fireEvent.mouseUp(container.querySelector('input.ws-line'));
    const composer = screen.getByRole('dialog', { name: 'Uus märkus' });
    expect(composer).toHaveTextContent('„koer”');
    await flush();
    fireEvent.click(screen.getByRole('button', { name: 'Lisa märkus' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('õige variant');
    fireEvent.change(screen.getByLabelText('Õige variant'), { target: { value: 'koera' } });
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: 'Lisa märkus' })); });
    const saved = onChange.mock.calls[0][0];
    expect(saved[0]).toBe(old);
    expect(saved[1]).toMatchObject({ kind: 'field', blockId: 'b1', fieldIndex: 0, selectedText: 'koer', parandus: 'koera', color: 'error' });
    expect(saved[1].at).toBeUndefined();
  });

  it('does not open a whole-answer mark on a plain click in a longer answer', async () => {
    const { container } = render(<SheetAnnotations annotations={[]} editable onChange={vi.fn()}>{page('Minu koer on suur')}</SheetAnnotations>);
    fireEvent.mouseUp(container.querySelector('input.ws-line'));
    expect(screen.queryByRole('dialog', { name: 'Uus märkus' })).toBeNull();
    const input = container.querySelector('input.ws-line');
    input.setSelectionRange(5, 9);
    fireEvent.mouseUp(input);
    expect(screen.getByRole('dialog', { name: 'Uus märkus' })).toHaveTextContent('„koer”');
  });
});
