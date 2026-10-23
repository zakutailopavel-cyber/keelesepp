import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import SheetAnnotations from './SheetAnnotations.jsx';

globalThis.ResizeObserver = globalThis.ResizeObserver || class { observe() {} disconnect() {} };
vi.mock('./editor/useMacRequest.js', () => ({ useMacRequest: () => ({ state: { phase: 'done', result: { sentences: 1, corrections: [{ said: 'ma käis poes', corrected: 'ma käisin poes' }] }, error: '', slow: false }, run: () => {} }) }));
import TextAnalysisPane from './TextAnalysisPane.jsx';

const result = { sentences: 2, corrections: [{ said: 'olen ära teinud kliendi kirjad', corrected: 'olen ära teinud kliendi kirjad läbi' }, { said: 'Käis koos Brunoga', corrected: 'Käisin koos Brunoga' }], evaluation: null };
const fakeRequest = (run) => () => ({ state: { phase: 'done', result, error: '', slow: false }, run });

describe('„Analüüs” in the mark composer', () => {
  it('checks the selected text and turns a correction (or all) into „Viga” marks', async () => {
    const run = vi.fn();
    const onMark = vi.fn(async () => {});
    render(<TextAnalysisPane text="Tere Anna! olen ära teinud kliendi kirjad. Käis koos Brunoga." level="A2" onMark={onMark} useRequest={fakeRequest(run)} />);
    expect(run).toHaveBeenCalledWith('Tere Anna! olen ära teinud kliendi kirjad. Käis koos Brunoga.', 'A2');
    expect(screen.getByText('2 lauset · 2 parandust')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Märgi veaks: Käis koos Brunoga' }));
    await waitFor(() => expect(onMark).toHaveBeenCalledWith(result.corrections[1]));
    expect(await screen.findByText('Märgitud')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Märgi kõik/ })).toBeNull();
  });

  it('the tab appears only for a text of five words or more and only where analysis is on', () => {
    const { rerender } = render(<SheetAnnotations annotations={[]} editable onChange={vi.fn()}><div /></SheetAnnotations>);
    expect(screen.queryByRole('button', { name: 'Analüüs' })).toBeNull();
    rerender(<SheetAnnotations annotations={[]} editable onChange={vi.fn()} analysis={{ level: 'B1' }}><div /></SheetAnnotations>);
    expect(screen.queryByRole('button', { name: 'Analüüs' })).toBeNull(); // no selection yet
  });

  it('a correction becomes a „Viga” on its own words of the answer and a sentence in „Minu vead”', async () => {
    const onChange = vi.fn().mockResolvedValue([]);
    const words = { lookup: vi.fn(), add: vi.fn(), addError: vi.fn().mockResolvedValue({}) };
    const answer = 'Eile mul oli vaba päev ja ma käis poes';
    const { container } = render(<SheetAnnotations annotations={[]} editable onChange={onChange} words={words} analysis={{ level: 'A2' }}>
      <div className="ws-page"><section data-block="b1"><textarea className="ws-line" readOnly value={answer} /></section></div>
    </SheetAnnotations>);
    const field = container.querySelector('textarea');
    field.setSelectionRange(0, answer.length);
    fireEvent.mouseUp(field);
    await act(async () => {});
    fireEvent.click(await screen.findByRole('button', { name: 'Analüüs' }));
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: 'Märgi veaks: ma käis poes' })); });
    await waitFor(() => expect(onChange).toHaveBeenCalled());
    const start = answer.indexOf('ma käis poes');
    expect(onChange.mock.calls[0][0][0]).toMatchObject({ kind: 'field', blockId: 'b1', start, end: start + 'ma käis poes'.length, selectedText: 'ma käis poes', parandus: 'ma käisin poes', color: 'error' });
    expect(words.addError).toHaveBeenCalledWith({ said: 'ma käis poes', corrected: 'ma käisin poes' });
  });
});
