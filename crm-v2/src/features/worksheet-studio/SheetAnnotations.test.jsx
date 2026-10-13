/* global setTimeout */
import { act, fireEvent, render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import SheetAnnotations, { correctedAnswer } from './SheetAnnotations.jsx';
import { liveWordTools, threeForms } from './liveWordTools.js';
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

describe('word tools in the live lesson', () => {
  const words = () => ({
    lookup: vi.fn().mockResolvedValue({ word: 'koer', translation: 'собака', forms: ['koer', 'koera', 'koera'], formItems: [] }),
    add: vi.fn().mockResolvedValue({ id: 'w1' }),
    addError: vi.fn().mockResolvedValue({ id: 'e1' }),
  });

  it('a double-clicked word of the task shows its three forms and goes to the student\'s words', async () => {
    const tools = words();
    const { container } = render(<SheetAnnotations annotations={[]} editable onChange={vi.fn()} words={tools}>{page()}</SheetAnnotations>);
    const bold = container.querySelector('b').firstChild;
    const range = document.createRange(); range.setStart(bold, 0); range.setEnd(bold, 4);
    const selection = window.getSelection(); selection.removeAllRanges(); selection.addRange(range);
    fireEvent.mouseUp(container.querySelector('b'));
    expect(screen.getByRole('button', { name: 'Sõna' })).toHaveAttribute('aria-pressed', 'true');
    expect(await screen.findByLabelText('Kolm põhivormi')).toHaveTextContent('koerkoerakoera');
    expect(tools.lookup).toHaveBeenCalledWith('koer');
    fireEvent.change(screen.getByLabelText('Tõlge'), { target: { value: 'пёс' } });
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: /Lisa õpilase sõnadesse/ })); });
    expect(tools.add).toHaveBeenCalledWith({ word: 'koer', translation: 'пёс', forms: 'koer, koera, koera', formItems: [] });
    expect(screen.getByRole('button', { name: /Lisatud/ })).toBeDisabled();
  });

  it('a corrected word in the answer is a mark and, by default, a sentence in „Minu vead”', async () => {
    const tools = words();
    const onChange = vi.fn().mockResolvedValue([]);
    const { container } = render(<SheetAnnotations annotations={[]} editable onChange={onChange} words={tools}>{page('Mul on koer')}</SheetAnnotations>);
    const input = container.querySelector('input.ws-line');
    input.setSelectionRange(7, 11);
    fireEvent.mouseUp(input);
    await flush();
    expect(screen.getByRole('button', { name: 'Viga' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByLabelText('Lisa õpilase „Minu vigadesse”')).toBeChecked();
    fireEvent.change(screen.getByLabelText('Õige variant'), { target: { value: 'koera' } });
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: 'Lisa märkus' })); });
    expect(onChange.mock.calls[0][0][0]).toMatchObject({ kind: 'field', selectedText: 'koer', parandus: 'koera' });
    expect(onChange.mock.calls[0][0][0].value).toBeUndefined();
    expect(tools.addError).toHaveBeenCalledWith({ said: 'Mul on koer', corrected: 'Mul on koera' });
  });

  it('builds the corrected answer and the three key forms', () => {
    expect(correctedAnswer('Ma näen  koer.', 9, 13, 'koera')).toBe('Ma näen koera.');
    expect(threeForms([{ code: 'Sup', value: 'tegema' }, { code: 'Inf', value: 'teha' }, { code: 'IndPrSg3', value: 'teeb' }])).toEqual(['tegema', 'teha', 'teeb']);
    expect(threeForms([{ code: 'SgN', value: 'kass' }, { code: 'SgG', value: 'kassi' }])).toEqual([]);
  });

  it('adds a word once and saves a corrected answer as an error card', async () => {
    const service = { listForStudent: vi.fn().mockResolvedValue([{ word: 'Koer' }]), add: vi.fn().mockResolvedValue({ id: 'x' }) };
    const tools = liveWordTools({ studentId: 's1', invitationId: 'room', user: { uid: 't' }, tools: { lookupWord: vi.fn().mockResolvedValue({ translation: 'есть', forms: { found: true, headword: 'sööma', forms: [{ code: 'Sup', label: 'ma', value: 'sööma' }, { code: 'Inf', label: 'da', value: 'süüa' }, { code: 'IndPrSg3', label: 'b', value: 'sööb' }] } }) }, words: service });
    expect(await tools.lookup('sõin')).toMatchObject({ word: 'sööma', translation: 'есть', forms: ['sööma', 'süüa', 'sööb'] });
    expect(await tools.add({ word: 'koer' })).toEqual({ already: true });
    await tools.addError({ said: 'Mul on koer', corrected: 'Mul on koera' });
    expect(service.add).toHaveBeenCalledWith({ studentId: 's1', invitationId: 'room', user: { uid: 't' }, word: 'Mul on koera', translation: 'Sinu lause: Mul on koer' });
  });
});
