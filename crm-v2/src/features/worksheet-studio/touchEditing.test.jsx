// The constructor and the Õpik book on a tablet (owner 2026-11-11): a finger edits with two taps, the keyboard does not
// cover the field, „Suur tekst” shows the sheet as a column, the book's settings fold away and „Muuda” comes back to
// the same place.
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { afterEach, beforeEach, vi } from 'vitest';
import { AuthContext } from '../../app/AuthContext.jsx';
import Sheet from './engine/Sheet.jsx';
import WorksheetStudioPage from './WorksheetStudioPage.jsx';
import BookPage from './BookPage.jsx';
import LessonGeneratorBar from '../worksheet-generator/ui/LessonGeneratorBar.jsx';
import { sampleDocument } from './engine/sample.js';
import { initialColumnView, keyboardInset } from './editor/touchEditing.js';
import { initialSideOpen, rememberBookPlace, scrollToBookPlace, sheetInView, takeBookPlace } from './bookPlace.js';

vi.setConfig({ testTimeout: 20_000 });
globalThis.ResizeObserver = globalThis.ResizeObserver || class { observe() {} disconnect() {} };
const store = new Map();
const session = new Map();
const fakeStorage = (map) => ({ getItem: (k) => map.get(k) ?? null, setItem: (k, v) => map.set(k, String(v)), removeItem: (k) => map.delete(k), clear: () => map.clear() });
Object.defineProperty(window, 'localStorage', { configurable: true, value: fakeStorage(store) });
Object.defineProperty(window, 'sessionStorage', { configurable: true, value: fakeStorage(session) });
const realMatchMedia = window.matchMedia;
const screenIs = (matches) => { window.matchMedia = (query) => ({ matches: matches(query), media: query, addEventListener() {}, removeEventListener() {} }); };
beforeEach(() => { store.clear(); session.clear(); });
afterEach(() => { window.matchMedia = realMatchMedia; });

const tableDoc = () => ({
  ...sampleDocument(),
  blocks: [{ id: 't1', type: 'table', data: { title: 'Kus? Kuhu? Kust?', instruction: '', headers: 'Rida, Kus?, Kuhu?', rows: 'sees | koolis | kooli\npeal | laual | lauale' } }],
});
// a tap = pointerdown with the finger's pointer type, then the click the browser fires
const tap = (el, pointerType = 'touch') => { fireEvent.pointerDown(el, { pointerType }); fireEvent.click(el); };

describe('Sheet: two taps edit a text with a finger', () => {
  afterEach(() => document.querySelectorAll('.ws-float-edit').forEach((el) => el.remove()));

  it('a tap on a row of the selected table opens its source line in place; Enter saves it', () => {
    const onEditText = vi.fn();
    const onSelect = vi.fn();
    const { container } = render(<Sheet doc={tableDoc()} mode="edit" selectedId="t1" onSelect={onSelect} onEditText={onEditText} />);
    const cell = container.querySelector('.ws-page [data-block="t1"] tbody tr td');
    tap(cell);
    const field = document.querySelector('.ws-float-edit');
    expect(field).not.toBeNull();
    expect(field.value).toBe('sees | koolis | kooli');
    fireEvent.change(field, { target: { value: 'sees | koolis, majas | kooli' } });
    field.value = 'sees | koolis, majas | kooli';
    fireEvent.keyDown(field, { key: 'Enter' });
    expect(onEditText).toHaveBeenCalledWith('t1', ['rows'], 'sees | koolis, majas | kooli\npeal | laual | lauale');
  });

  it('the first tap only selects the block; a mouse click never opens the editor (a double click does)', () => {
    const onSelect = vi.fn();
    const { container, rerender } = render(<Sheet doc={tableDoc()} mode="edit" selectedId={null} onSelect={onSelect} onEditText={vi.fn()} />);
    const cell = () => container.querySelector('.ws-page [data-block="t1"] tbody tr td');
    tap(cell());
    expect(onSelect).toHaveBeenLastCalledWith('t1');
    expect(document.querySelector('.ws-float-edit')).toBeNull();
    rerender(<Sheet doc={tableDoc()} mode="edit" selectedId="t1" onSelect={onSelect} onEditText={vi.fn()} />);
    tap(cell(), 'mouse');
    expect(document.querySelector('.ws-float-edit')).toBeNull();
    fireEvent.doubleClick(cell());
    expect(document.querySelector('.ws-float-edit')).not.toBeNull();
  });

  it('works the same in the column („Suur tekst”), and nothing opens outside the edit mode', () => {
    const { container, rerender } = render(<Sheet flow doc={tableDoc()} mode="edit" selectedId="t1" onSelect={vi.fn()} onEditText={vi.fn()} />);
    tap(container.querySelector('.ws-root.is-flow [data-block="t1"] tbody tr td'));
    expect(document.querySelector('.ws-float-edit')).not.toBeNull();
    document.querySelector('.ws-float-edit').remove();
    rerender(<Sheet flow doc={tableDoc()} mode="interactive" answers={{}} setAnswer={vi.fn()} />);
    tap(container.querySelector('.ws-root.is-flow [data-block="t1"] tbody tr td'));
    expect(document.querySelector('.ws-float-edit')).toBeNull();
  });
});

describe('touchEditing helpers', () => {
  it('keyboardInset: the part of the window the keyboard covers', () => {
    expect(keyboardInset({ height: 600, offsetTop: 0 }, 1000)).toBe(400);
    expect(keyboardInset({ height: 560, offsetTop: 40 }, 1000)).toBe(400);
    expect(keyboardInset({ height: 1000, offsetTop: 0 }, 1000)).toBe(0);
    expect(keyboardInset(null, 1000)).toBe(0);
  });

  it('„Suur tekst” starts on for a touch tablet, off for a computer, and a stored choice wins', () => {
    screenIs((q) => q.includes('pointer: coarse'));
    expect(initialColumnView()).toBe(true);
    screenIs(() => false);
    expect(initialColumnView()).toBe(false);
    store.set('ks-studio-column', 'on');
    expect(initialColumnView()).toBe(true);
  });
});

describe('WorksheetStudioPage on a tablet', () => {
  const repository = () => ({
    load: vi.fn().mockResolvedValue({ document: tableDoc(), source: 'worksheetDoc', lesson: { id: 'lesson-1' }, status: 'published' }),
    save: vi.fn().mockResolvedValue({ id: 'lesson-1', created: false, title: 'Leht' }),
    uploadImage: vi.fn(), uploadAudio: vi.fn(),
  });
  const renderStudio = () => render(
    <MemoryRouter initialEntries={['/library/worksheets/lesson-1']}>
      <AuthContext.Provider value={{ user: { uid: 't', roles: ['teacher'] } }}>
        <Routes><Route path="/library/worksheets/:lessonId" element={<WorksheetStudioPage repository={repository()} templates={{ list: vi.fn().mockResolvedValue([]) }} mediaBank={{ list: vi.fn().mockResolvedValue([]), save: vi.fn() }} />} /></Routes>
      </AuthContext.Provider>
    </MemoryRouter>,
  );

  it('opens with the drawer folded and the sheet as a column; „Suur tekst” switches to the A4 page and is remembered', async () => {
    screenIs((q) => q.includes('pointer: coarse') || q.includes('1180px'));
    const { container } = renderStudio();
    await screen.findByRole('button', { name: 'Suur tekst' });
    expect(container.querySelector('.st-palette')).toBeNull();
    expect(container.querySelector('.st-canvas.ws-narrow .ws-root.is-flow')).not.toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Suur tekst' }));
    expect(container.querySelector('.ws-root.is-flow')).toBeNull();
    expect(container.querySelector('.ws-page')).not.toBeNull();
    expect(store.get('ks-studio-column')).toBe('off');
    // a tap selects, a second tap on a row edits it, the change marks the sheet unsaved
    const cell = () => container.querySelector('.ws-page [data-block="t1"] tbody tr td');
    tap(cell());
    tap(cell());
    const field = document.querySelector('.ws-float-edit');
    expect(field).not.toBeNull();
    field.value = 'sees | majas | majja';
    fireEvent.keyDown(field, { key: 'Enter' });
    expect(await screen.findByText('salvestamata')).toBeInTheDocument();
  });

  it('a computer keeps the drawer open and the A4 page', async () => {
    screenIs(() => false);
    const { container } = renderStudio();
    await screen.findByRole('button', { name: 'Suur tekst' });
    expect(container.querySelector('.st-palette')).not.toBeNull();
    expect(container.querySelector('.ws-root.is-flow')).toBeNull();
  });
});

describe('LessonGeneratorBar on the Õpik sheet', () => {
  it('shows only the lesson\'s sheets — nothing to generate on a textbook page', async () => {
    const sheets = ['discover', 'practice', 'transfer'].map((id) => ({ worksheetId: id, worksheetDocStatus: 'published', publishedWorksheetDoc: { id: `ws_a2-017_${id}`, blocks: [] } }))
      .concat({ worksheetId: 'opik', role: 'focus', displayLabel: 'Õpik', worksheetDocStatus: 'published', publishedWorksheetDoc: { id: 'ws_a2-017_opik', blocks: [] } });
    const repository = { loadLesson: vi.fn().mockResolvedValue({ id: 'a2-017', title: 'Kohakäänded' }), list: vi.fn().mockResolvedValue(sheets) };
    render(<MemoryRouter><AuthContext.Provider value={{ user: { uid: 'a', roles: ['admin'] } }}><LessonGeneratorBar lessonId="a2-017" worksheetId="opik" doc={{ blocks: [] }} onPreviewSheet={vi.fn()} onInsertBlocks={vi.fn()} repository={repository} vocabularyRepository={{ load: vi.fn().mockResolvedValue({ lexicon: [] }) }} flagsService={{ list: vi.fn().mockResolvedValue([]) }} /></AuthContext.Provider></MemoryRouter>);
    expect(await screen.findByRole('link', { name: /Õpik/ })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('link', { name: '1 Avasta' })).toBeInTheDocument();
    expect(screen.queryByText(/Lisaleht/)).toBeNull();
    expect(screen.queryByRole('button', { name: /Kordamisleht/ })).toBeNull();
    expect(screen.queryByLabelText('Töölehtede raskus')).toBeNull();
    expect(screen.getByRole('link', { name: /Seaded/ })).toBeInTheDocument();
  });
});

describe('Õpik book: folding settings and „Muuda”', () => {
  const doc = (title) => ({ ...sampleDocument(), meta: { ...sampleDocument().meta, title, level: 'A2' } });
  const lesson = { id: 'a2-017', title: 'Kus? Kuhu? Kust?', level: 'A2', roadmapManaged: true, roadmapModuleNumber: 1, roadmapModuleTitle: 'Kohad', roadmapLessonNumber: 1, worksheetPhases: { opik: { publishedVersion: 1 } } };
  function Where() { const location = useLocation(); return <p data-testid="where">{location.pathname}{location.search}</p>; }
  const renderBook = () => render(
    <MemoryRouter initialEntries={['/library/worksheets/book']}>
      <Routes>
        <Route path="/library/worksheets/book" element={<BookPage repository={{ list: vi.fn().mockResolvedValue({ curriculumLessons: [lesson] }) }} worksheetRepository={{ list: vi.fn().mockResolvedValue([{ worksheetId: 'opik', publishedWorksheetDoc: doc('Õpiku leht'), worksheetDocStatus: 'published' }]) }} loadExtras={() => Promise.resolve({})} />} />
        <Route path="*" element={<Where />} />
      </Routes>
    </MemoryRouter>,
  );

  it('a tablet starts with the settings folded; the button opens them and the choice is remembered', async () => {
    screenIs((q) => q.includes('pointer: coarse') || q.includes('1180px'));
    const { container } = renderBook();
    const toggle = await screen.findByRole('button', { name: 'Näita seadeid' });
    expect(container.querySelector('.ws-book-side')).toBeNull();
    expect(container.querySelector('.ws-book-studio.is-side-closed')).not.toBeNull();
    fireEvent.click(toggle);
    expect(container.querySelector('.ws-book-side')).not.toBeNull();
    expect(screen.getByRole('button', { name: 'Peida seaded' })).toHaveAttribute('aria-expanded', 'true');
    expect(store.get('ks-book-side')).toBe('open');
    expect(initialSideOpen(true)).toBe(true);
  });

  it('„Muuda” opens the sheet on the screen in its editor in the same tab and keeps the place for the way back', async () => {
    screenIs(() => false);
    const { container } = renderBook();
    await waitFor(() => expect(container.querySelector('[data-book-item="a2-017:opik"]')).not.toBeNull());
    fireEvent.click(screen.getByRole('button', { name: /Muuda$/ }));
    expect(await screen.findByTestId('where')).toHaveTextContent('/library/lessons/a2-017/worksheets/opik?tagasi=opik');
    expect(takeBookPlace()).toMatchObject({ id: 'a2-017:opik' });
    // read once
    expect(takeBookPlace()).toBeNull();
  });
});

describe('bookPlace helpers', () => {
  const box = (top, height) => ({ getBoundingClientRect: () => ({ top, bottom: top + height, height }) });
  it('finds the sheet a third down the area and how far into it the area is', () => {
    const items = [{ ...box(-900, 600), dataset: { bookItem: 'a' } }, { ...box(-300, 900), dataset: { bookItem: 'b' } }, { ...box(600, 900), dataset: { bookItem: 'c' } }];
    const container = { ...box(100, 800), querySelectorAll: () => items };
    expect(sheetInView(container)).toEqual({ id: 'b', offset: 400 });
    expect(sheetInView(null)).toBeNull();
  });

  it('scrolls the area back to the sheet and offset; a stale place is dropped', () => {
    const el = box(1500, 900);
    const container = { ...box(100, 800), scrollTop: 0, scrollHeight: 5000, clientHeight: 800, querySelector: () => el };
    expect(scrollToBookPlace(container, { id: 'b', offset: 400 })).toBe(true);
    expect(container.scrollTop).toBe(1800);
    act(() => rememberBookPlace({ id: 'x', offset: 1 }));
    expect(takeBookPlace(Date.now() + 2 * 3600_000)).toBeNull();
  });
});
