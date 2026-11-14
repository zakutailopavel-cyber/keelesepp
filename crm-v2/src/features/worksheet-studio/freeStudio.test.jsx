// „Vaba kiht” in the constructor (2026-11-13): only the Õpik sheet offers it; an added item opens its settings, a
// change is one undo step, save carries doc.free, Delete removes the selected item.
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { vi } from 'vitest';
import { AuthContext } from '../../app/AuthContext.jsx';
import WorksheetStudioPage from './WorksheetStudioPage.jsx';
import { sampleDocument } from './engine/sample.js';

vi.setConfig({ testTimeout: 20_000 });
globalThis.ResizeObserver = globalThis.ResizeObserver || class { observe() {} disconnect() {} };
const store = new Map();
Object.defineProperty(window, 'localStorage', { configurable: true, value: { getItem: (k) => store.get(k) ?? null, setItem: (k, v) => store.set(k, String(v)), removeItem: (k) => store.delete(k), clear: () => store.clear() } });

const doc = () => ({ ...sampleDocument(), blocks: [{ id: 'txt', type: 'text', data: { text: 'Üks.' } }] });
const open = (sheet) => {
  const save = vi.fn().mockResolvedValue({ id: 'lesson-1', created: false, title: 'Leht', version: 2 });
  const repository = { load: vi.fn().mockResolvedValue({ document: doc(), source: 'worksheetDoc', lesson: { id: 'lesson-1' } }), save, uploadImage: vi.fn(), uploadAudio: vi.fn() };
  const view = render(
    <MemoryRouter initialEntries={[`/library/lessons/lesson-1/worksheets/${sheet}`]}>
      <AuthContext.Provider value={{ user: { uid: 't', roles: ['admin'] } }}>
        <Routes><Route path="/library/lessons/:lessonId/worksheets/:worksheetId" element={<WorksheetStudioPage repository={repository} templates={{ list: vi.fn().mockResolvedValue([]) }} mediaBank={{ list: vi.fn().mockResolvedValue([]), save: vi.fn() }} />} /></Routes>
      </AuthContext.Provider>
    </MemoryRouter>,
  );
  return { ...view, save };
};

it('Harjuta has no free layer', async () => {
  const { container } = open('practice');
  await waitFor(() => expect(container.querySelector('.ws-page [data-block="txt"]')).not.toBeNull());
  expect(screen.queryByText('Vaba kiht (Õpik)')).toBeNull();
});

it('Õpik: „Tekstikast” adds a box with its settings; a setting is undoable; save carries it; Delete removes it', async () => {
  const { container, save } = open('opik');
  await waitFor(() => expect(container.querySelector('.ws-page [data-block="txt"]')).not.toBeNull());
  fireEvent.click(screen.getByRole('button', { name: /Tekstikast/ }));
  const box = () => container.querySelector('.ws-page .ws-free [data-free]');
  const boxText = () => box().querySelector('.ws-free-text').textContent;
  expect(boxText()).toBe('Kirjuta siia');
  const panel = screen.getByRole('complementary', { name: 'Vaba elemendi seaded' });
  fireEvent.change(panel.querySelector('textarea'), { target: { value: 'Tere, Õpik!' } });
  expect(boxText()).toBe('Tere, Õpik!');
  fireEvent.click(screen.getByRole('button', { name: 'Salvesta' }));
  await waitFor(() => expect(save).toHaveBeenCalled());
  expect(save.mock.calls[0][0].document.free).toEqual([expect.objectContaining({ kind: 'text', text: 'Tere, Õpik!', page: 0 })]);
  fireEvent.click(screen.getByRole('button', { name: 'Võta tagasi' }));
  expect(boxText()).toBe('Kirjuta siia');
  fireEvent.keyDown(window, { key: 'Delete' });
  expect(box()).toBeNull();
});

it('Õpik: „Nool” adds an arrow; its settings change the heads; save carries the line', async () => {
  const { container, save } = open('opik');
  await waitFor(() => expect(container.querySelector('.ws-page [data-block="txt"]')).not.toBeNull());
  fireEvent.click(screen.getByRole('button', { name: /Nool/ }));
  const arrow = () => container.querySelector('.ws-page .ws-free [data-free]');
  expect(arrow().querySelectorAll('polygon')).toHaveLength(1);
  const panel = screen.getByRole('complementary', { name: 'Vaba elemendi seaded' });
  fireEvent.change(panel.querySelector('select'), { target: { value: 'both' } });
  expect(arrow().querySelectorAll('polygon')).toHaveLength(2);
  fireEvent.click(screen.getByRole('button', { name: 'Salvesta' }));
  await waitFor(() => expect(save).toHaveBeenCalled());
  expect(save.mock.calls[0][0].document.free).toEqual([expect.objectContaining({ kind: 'line', heads: 'both', x2: 190 })]);
});

it('Õpik: a double click types in the text box on the sheet; leaving keeps it (one undo step), Esc gives the old text back', async () => {
  const { container } = open('opik');
  await waitFor(() => expect(container.querySelector('.ws-page [data-block="txt"]')).not.toBeNull());
  fireEvent.click(screen.getByRole('button', { name: /Tekstikast/ }));
  const box = () => container.querySelector('.ws-page .ws-free [data-free]');
  const boxText = () => box().querySelector('.ws-free-text').textContent;
  fireEvent.doubleClick(box());
  const input = screen.getByRole('textbox', { name: 'Tekstikasti tekst' });
  expect(input.value).toBe('Kirjuta siia');
  expect(box().querySelector('.ws-free-size')).toBeNull();
  fireEvent.change(input, { target: { value: 'Otse lehel' } });
  fireEvent.keyDown(input, { key: 'Delete' });
  expect(box()).not.toBeNull();
  fireEvent.blur(input);
  expect(boxText()).toBe('Otse lehel');
  expect(screen.getByRole('complementary', { name: 'Vaba elemendi seaded' }).querySelector('textarea').value).toBe('Otse lehel');
  fireEvent.doubleClick(box());
  const again = screen.getByRole('textbox', { name: 'Tekstikasti tekst' });
  fireEvent.change(again, { target: { value: 'Ei jää' } });
  fireEvent.keyDown(again, { key: 'Escape' });
  expect(boxText()).toBe('Otse lehel');
  fireEvent.click(screen.getByRole('button', { name: 'Võta tagasi' }));
  expect(boxText()).toBe('Kirjuta siia');
});

it('Õpik: a text box gets a hand font, centre alignment and a colour from its settings', async () => {
  const { container, save } = open('opik');
  await waitFor(() => expect(container.querySelector('.ws-page [data-block="txt"]')).not.toBeNull());
  fireEvent.click(screen.getByRole('button', { name: /Tekstikast/ }));
  const panel = screen.getByRole('complementary', { name: 'Vaba elemendi seaded' });
  fireEvent.change(screen.getByLabelText('Kiri'), { target: { value: 'hand' } });
  fireEvent.click(screen.getByRole('button', { name: 'Keskel' }));
  fireEvent.change(screen.getByLabelText('Teksti värv'), { target: { value: 'navy' } });
  expect(screen.getByRole('button', { name: 'Keskel' }).getAttribute('aria-pressed')).toBe('true');
  const text = container.querySelector('.ws-page .ws-free-text');
  expect(text.style.fontFamily).toBe('var(--font-hand)');
  expect(text.style.textAlign).toBe('center');
  expect(panel).not.toBeNull();
  fireEvent.click(screen.getByRole('button', { name: 'Salvesta' }));
  await waitFor(() => expect(save).toHaveBeenCalled());
  expect(save.mock.calls[0][0].document.free).toEqual([expect.objectContaining({ kind: 'text', font: 'hand', align: 'center', color: 'navy' })]);
});

it('Õpik: „Keskele ↔” centres the selected box on the page; see-through is a setting', async () => {
  const { container, save } = open('opik');
  await waitFor(() => expect(container.querySelector('.ws-page [data-block="txt"]')).not.toBeNull());
  fireEvent.click(screen.getByRole('button', { name: /Tekstikast/ }));
  fireEvent.click(screen.getByRole('button', { name: 'Paremale' }));
  fireEvent.click(screen.getByRole('button', { name: 'Keskele ↔' }));
  fireEvent.change(screen.getByLabelText('Läbipaistvus'), { target: { value: '0.6' } });
  expect(container.querySelector('.ws-page .ws-free [data-free]').style.opacity).toBe('0.6');
  fireEvent.click(screen.getByRole('button', { name: 'Salvesta' }));
  await waitFor(() => expect(save).toHaveBeenCalled());
  expect(save.mock.calls[0][0].document.free).toEqual([expect.objectContaining({ x: 75, opacity: 0.6 })]);
});

it('Õpik: Shift + tap selects two boxes; the group panel aligns them, Delete removes both, undo brings them back', async () => {
  const { container, save } = open('opik');
  await waitFor(() => expect(container.querySelector('.ws-page [data-block="txt"]')).not.toBeNull());
  fireEvent.click(screen.getByRole('button', { name: /Tekstikast/ }));
  fireEvent.click(screen.getByRole('button', { name: /Kujund/ }));
  const nodes = () => [...container.querySelectorAll('.ws-page .ws-free [data-free]')];
  fireEvent.pointerDown(nodes()[0], { clientX: 0, clientY: 0, pointerId: 1, shiftKey: true });
  const panel = screen.getByRole('complementary', { name: 'Vaba elemendi seaded' });
  expect(panel.textContent).toContain('2 valitud');
  fireEvent.click(screen.getByRole('button', { name: 'Vasakud servad' }));
  fireEvent.click(screen.getByRole('button', { name: 'Salvesta' }));
  await waitFor(() => expect(save).toHaveBeenCalled());
  const xs = save.mock.calls[0][0].document.free.map((f) => f.x);
  expect(xs[0]).toBe(xs[1]);
  fireEvent.keyDown(window, { key: 'Delete' });
  expect(nodes()).toHaveLength(0);
  fireEvent.click(screen.getByRole('button', { name: 'Võta tagasi' }));
  expect(nodes()).toHaveLength(2);
});

it('Õpik: „Vali mitu” makes a tap add to the selection', async () => {
  const { container } = open('opik');
  await waitFor(() => expect(container.querySelector('.ws-page [data-block="txt"]')).not.toBeNull());
  fireEvent.click(screen.getByRole('button', { name: /Tekstikast/ }));
  fireEvent.click(screen.getByRole('button', { name: /Kujund/ }));
  fireEvent.click(screen.getByRole('button', { name: /Vali mitu/ }));
  const nodes = [...container.querySelectorAll('.ws-page .ws-free [data-free]')];
  fireEvent.pointerDown(nodes[0], { clientX: 0, clientY: 0, pointerId: 1 });
  expect(screen.getByRole('complementary', { name: 'Vaba elemendi seaded' }).textContent).toContain('2 valitud');
  fireEvent.click(screen.getByRole('button', { name: 'Tühista valik' }));
  expect(screen.queryByRole('complementary', { name: 'Vaba elemendi seaded' })).toBeNull();
});
