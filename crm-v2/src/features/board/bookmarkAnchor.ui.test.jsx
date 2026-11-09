/* global setTimeout */
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, vi } from 'vitest';
import StudentBoard from './StudentBoard.jsx';
import BookmarkDialog from './BookmarkDialog.jsx';
import SheetAnnotations from '../worksheet-studio/SheetAnnotations.jsx';

globalThis.PointerEvent = globalThis.PointerEvent || class PointerEvent extends globalThis.MouseEvent {};
globalThis.ResizeObserver = globalThis.ResizeObserver || class { observe() {} disconnect() {} };

// the same in-memory board as board.test.jsx
function fakeService(initial = {}) {
  const listeners = new Map();
  const data = { board: [], pages: initial.pages || [], ...Object.fromEntries(Object.entries(initial).filter(([key]) => key.startsWith('page:'))) };
  const keyOf = (pageId) => (pageId ? `page:${pageId}` : 'board');
  const emit = (key) => listeners.get(key)?.([...(data[key] || [])]);
  return {
    data,
    root: 'whiteboards',
    subscribePages: vi.fn((_s, onChange) => { onChange(data.pages); return () => {}; }),
    subscribeElements: vi.fn((_s, pageId, onChange) => { listeners.set(keyOf(pageId), onChange); onChange([...(data[keyOf(pageId)] || [])]); return () => listeners.delete(keyOf(pageId)); }),
    add: vi.fn(async (_s, pageId, element) => { const id = `new-${(data[keyOf(pageId)] || []).length + 1}`; data[keyOf(pageId)] = [...(data[keyOf(pageId)] || []), { id, ...element }]; emit(keyOf(pageId)); return id; }),
    update: vi.fn(async (_s, pageId, element, patch) => { data[keyOf(pageId)] = data[keyOf(pageId)].map((item) => (item.id === element.id ? { ...item, ...patch } : item)); emit(keyOf(pageId)); }),
    remove: vi.fn(async (_s, pageId, id) => { data[keyOf(pageId)] = data[keyOf(pageId)].filter((item) => item.id !== id); emit(keyOf(pageId)); }),
    clear: vi.fn(async () => 0),
    addPage: vi.fn(async () => 'pg-x'),
    renamePage: vi.fn(async () => {}),
  };
}

const student = { uid: 'stud-1', displayName: 'Mari', roles: ['student'] };
const teacher = { uid: 't1', displayName: 'Kati', roles: ['teacher'] };
const reading = <div className="ws-page"><section data-block="t1"><h3>Lugemine</h3><p>Mari elab <b>Tallinnas</b>. Ta käib koolis iga päev.</p></section></div>;
const sheetPage = { pages: [{ id: 'pg-a', title: 'Tööleht: Avasta' }] };
const notes = () => ({ add: vi.fn(async () => 'note-1'), update: vi.fn(async () => {}) });
const flush = () => act(() => new Promise((resolve) => setTimeout(resolve, 20)));
const select = (node, start, end) => {
  const range = document.createRange();
  range.setStart(node, start); range.setEnd(node, end);
  const selection = window.getSelection(); selection.removeAllRanges(); selection.addRange(range);
};

afterEach(() => { window.getSelection().removeAllRanges(); delete document.caretRangeFromPoint; });

describe('anchored bookmark on the board (owner 2026-11-09)', () => {
  it('a student selects a word in the sheet → „Järjehoidja” → the note keeps the word, its sentence and the page', async () => {
    const service = fakeService(sheetPage);
    const noteService = notes();
    const { container } = render(<StudentBoard studentId="s-1" user={student} variant="room" service={service} noteService={noteService}
      worksheets={[{ id: 'as-1', title: 'Avasta', content: reading }]} initialPageId="pg-a" />);
    const word = (await screen.findByText('Tallinnas')).firstChild;
    select(word, 0, 9);
    fireEvent.mouseUp(word.parentElement);
    await flush();
    fireEvent.click(screen.getByRole('button', { name: 'Järjehoidja' }));
    const dialog = screen.getByRole('dialog', { name: 'Järjehoidja' });
    expect(dialog).toHaveTextContent('Sõna: „Tallinnas” — Mari elab Tallinnas.');
    fireEvent.click(screen.getByRole('button', { name: /Trüki/ }));
    fireEvent.change(screen.getByLabelText('Järjehoidja tekst'), { target: { value: 'pealinn' } });
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: 'Salvesta' })); });
    const anchor = expect.objectContaining({ kind: 'word', quote: 'Tallinnas', sentence: 'Mari elab Tallinnas.', blockId: 't1', start: 18, end: 27 });
    expect(noteService.add).toHaveBeenCalledWith(expect.objectContaining({ text: 'pealinn', pageId: 'pg-a', pageTitle: 'Tööleht: Avasta', anchor }));
    await waitFor(() => expect(service.add).toHaveBeenCalledWith('s-1', 'pg-a', expect.objectContaining({ type: 'note', bookmark: true, w: 22, h: 22, noteId: 'note-1', anchor }), student));
    // on the board: a marker (no free sheet) that opens the note again
    const marker = await screen.findByRole('button', { name: 'Järjehoidja: „Tallinnas”' });
    expect(container.querySelector('.sb-note--bookmark')).toBeNull();
    fireEvent.pointerDown(marker, { button: 0 });
    expect(screen.getByRole('dialog', { name: 'Järjehoidja' })).toHaveTextContent('Sõna: „Tallinnas”');
    expect(screen.getByLabelText('Järjehoidja tekst')).toHaveValue('pealinn');
  });

  it('the bookmark tool takes the tapped word; a second tap on it its whole sentence', async () => {
    const service = fakeService(sheetPage);
    const { container } = render(<StudentBoard studentId="s-1" user={student} variant="room" service={service} noteService={notes()}
      worksheets={[{ id: 'as-1', title: 'Avasta', content: reading }]} initialPageId="pg-a" />);
    const text = (await screen.findByText(/Ta käib koolis/)).childNodes[2];
    document.caretRangeFromPoint = () => { const r = document.createRange(); r.setStart(text, 10); return r; };
    fireEvent.click(screen.getByRole('button', { name: 'Järjehoidja / Kleebis' }));
    const svg = container.querySelector('svg[aria-label="Õpilase tahvel"]');
    fireEvent.pointerDown(svg, { clientX: 200, clientY: 120, button: 0 });
    fireEvent.pointerUp(svg, { clientX: 200, clientY: 120 });
    expect(screen.queryByRole('dialog', { name: 'Järjehoidja' })).toBeNull(); // waits for a possible second tap
    expect(await screen.findByRole('dialog', { name: 'Järjehoidja' })).toHaveTextContent('Sõna: „koolis” — Ta käib koolis iga päev.');
    fireEvent.click(screen.getByRole('button', { name: 'Loobu' }));

    fireEvent.pointerDown(svg, { clientX: 200, clientY: 120, button: 0 });
    fireEvent.pointerUp(svg, { clientX: 200, clientY: 120 });
    fireEvent.pointerDown(svg, { clientX: 201, clientY: 121, button: 0 });
    expect(screen.getByRole('dialog', { name: 'Järjehoidja' })).toHaveTextContent('Lause: „Ta käib koolis iga päev.”');
  });

  it('the teacher\'s „Märkus / Analüüs” popup has „Järjehoidja”; one closes the other', async () => {
    const service = fakeService(sheetPage);
    const noteService = notes();
    const sheet = <SheetAnnotations annotations={[]} editable onChange={vi.fn()}>{reading}</SheetAnnotations>;
    render(<StudentBoard studentId="s-1" user={teacher} staff variant="room" service={service} noteService={noteService}
      worksheets={[{ id: 'as-1', title: 'Avasta', content: sheet }]} initialPageId="pg-a" />);
    const word = (await screen.findByText('Tallinnas')).firstChild;
    select(word, 0, 9);
    fireEvent.mouseUp(word.parentElement);
    expect(screen.getByRole('dialog', { name: 'Uus märkus' })).toBeInTheDocument();
    await flush();
    // the board's own chip is not shown over the teacher's popup
    expect(document.querySelector('.sb-anchor-chip')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: /Järjehoidja$/ }));
    expect(screen.queryByRole('dialog', { name: 'Uus märkus' })).toBeNull();
    expect(screen.getByRole('dialog', { name: 'Järjehoidja' })).toHaveTextContent('Sõna: „Tallinnas”');

    // a new popup of the sheet closes the bookmark sheet
    select(word, 0, 9);
    fireEvent.mouseUp(word.parentElement);
    expect(screen.getByRole('dialog', { name: 'Uus märkus' })).toBeInTheDocument();
    await waitFor(() => expect(screen.queryByRole('dialog', { name: 'Järjehoidja' })).toBeNull());
    // and the bookmark tool closes the popup
    fireEvent.click(screen.getByRole('button', { name: 'Järjehoidja / Kleebis' }));
    fireEvent.pointerDown(document.querySelector('svg[aria-label="Õpilase tahvel"]'), { clientX: 20, clientY: 20, button: 0 });
    expect(screen.getByRole('dialog', { name: 'Järjehoidja' })).toBeInTheDocument();
    expect(screen.queryByRole('dialog', { name: 'Uus märkus' })).toBeNull();
  });

  it('a student opens the teacher\'s anchored bookmark read only', async () => {
    const anchor = { kind: 'sentence', quote: 'Ta käib koolis iga päev.', before: '', after: '', sentence: 'Ta käib koolis iga päev.', blockId: 't1', start: 29, end: 53 };
    const service = fakeService({ ...sheetPage, 'page:pg-a': [{ id: 'bm1', type: 'note', bookmark: true, x: 10, y: 10, w: 22, h: 22, text: 'Korda', ink: [], color: '#FEF3C7', byStaff: true, anchor }] });
    render(<StudentBoard studentId="s-1" user={student} variant="room" service={service} noteService={notes()}
      worksheets={[{ id: 'as-1', title: 'Avasta', content: reading }]} initialPageId="pg-a" />);
    fireEvent.pointerDown(await screen.findByRole('button', { name: 'Järjehoidja: „Ta käib koolis iga päev.”' }), { button: 0 });
    const dialog = screen.getByRole('dialog', { name: 'Järjehoidja' });
    expect(dialog).toHaveTextContent('Lause: „Ta käib koolis iga päev.”');
    expect(screen.queryByRole('button', { name: 'Salvesta' })).toBeNull();
    expect(screen.getByLabelText('Järjehoidja tekst')).toHaveAttribute('readonly');
  });
});

describe('BookmarkDialog', () => {
  it('keeps free bookmarks as before: no quote', () => {
    render(<BookmarkDialog onSave={vi.fn()} onCancel={vi.fn()} />);
    expect(screen.getByRole('dialog', { name: 'Järjehoidja' })).not.toHaveTextContent('Sõna:');
    expect(screen.getByRole('dialog', { name: 'Järjehoidja' })).toHaveAttribute('data-letters-box');
  });
});
