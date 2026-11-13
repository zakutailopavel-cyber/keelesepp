// „Teksti sisse”: a picture block next to a text becomes the text's picture, in one undoable step (owner 2026-11-11).
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

const img = { src: 'https://example.invalid/anna.webp', width: 1600, height: 1067 };
const doc = () => ({ ...sampleDocument(), blocks: [
  { id: 'pic', type: 'image', data: { img, aspect: '4:3', caption: 'Anna', shape: 'circle', border: 'ink' } },
  { id: 'txt', type: 'text', data: { text: 'Üks.\n\nKaks.' } },
] });

it('„Teksti sisse” moves the picture into the next text; „Võta tagasi” brings the block back; save carries the figure', async () => {
  store.clear();
  const save = vi.fn().mockResolvedValue({ id: 'lesson-1', created: false, title: 'Leht', version: 2 });
  const repository = { load: vi.fn().mockResolvedValue({ document: doc(), source: 'worksheetDoc', lesson: { id: 'lesson-1' } }), save, uploadImage: vi.fn(), uploadAudio: vi.fn() };
  const { container } = render(
    <MemoryRouter initialEntries={['/library/worksheets/lesson-1']}>
      <AuthContext.Provider value={{ user: { uid: 't', roles: ['teacher'] } }}>
        <Routes><Route path="/library/worksheets/:lessonId" element={<WorksheetStudioPage repository={repository} templates={{ list: vi.fn().mockResolvedValue([]) }} mediaBank={{ list: vi.fn().mockResolvedValue([]), save: vi.fn() }} />} /></Routes>
      </AuthContext.Provider>
    </MemoryRouter>,
  );
  await waitFor(() => expect(container.querySelector('.ws-page [data-block="pic"]')).not.toBeNull());
  fireEvent.click(container.querySelector('.ws-page [data-block="pic"]'));
  fireEvent.click(await screen.findByRole('button', { name: /Teksti sisse/ }));
  expect(container.querySelector('.ws-page [data-block="pic"]')).toBeNull();
  const figure = container.querySelector('.ws-page [data-block="txt"] .ws-ffig');
  expect(figure.className).toContain('shape-circle border-ink');
  expect(figure.querySelector('figcaption').textContent).toBe('Anna');
  fireEvent.click(screen.getByRole('button', { name: 'Salvesta' }));
  await waitFor(() => expect(save).toHaveBeenCalled());
  const saved = save.mock.calls[0][0].document;
  expect(saved.blocks.map((b) => b.id)).toEqual(['txt']);
  expect(saved.blocks[0].data.figure).toBeNull();
  expect(saved.blocks[0].data.figures[0]).toMatchObject({ mode: 'float', img, caption: 'Anna', shape: 'circle', border: 'ink', side: 'right', at: 0 });
  fireEvent.click(screen.getByRole('button', { name: 'Võta tagasi' }));
  expect(container.querySelector('.ws-page [data-block="pic"]')).not.toBeNull();
  expect(container.querySelector('.ws-page [data-block="txt"] .ws-ffig')).toBeNull();
});

it('„Teksti sisse” also puts a picture into a reading text that already has one (second picture, left side)', async () => {
  store.clear();
  const save = vi.fn().mockResolvedValue({ id: 'lesson-1', created: false, title: 'Leht', version: 2 });
  const first = { mode: 'float', img, caption: 'Esimene', alt: '', side: 'right', width: 33, at: 0, shape: 'rect', border: 'none', locked: false };
  const reading = { ...sampleDocument(), blocks: [
    { id: 'rd', type: 'reading', data: { passageTitle: 'Mari', passage: 'Üks.\n\nKaks.', questions: 'Mis? [a]', figure: first } },
    { id: 'pic', type: 'image', data: { img, aspect: '4:3', caption: 'Teine' } },
  ] };
  const repository = { load: vi.fn().mockResolvedValue({ document: reading, source: 'worksheetDoc', lesson: { id: 'lesson-1' } }), save, uploadImage: vi.fn(), uploadAudio: vi.fn() };
  const { container } = render(
    <MemoryRouter initialEntries={['/library/worksheets/lesson-1']}>
      <AuthContext.Provider value={{ user: { uid: 't', roles: ['teacher'] } }}>
        <Routes><Route path="/library/worksheets/:lessonId" element={<WorksheetStudioPage repository={repository} templates={{ list: vi.fn().mockResolvedValue([]) }} mediaBank={{ list: vi.fn().mockResolvedValue([]), save: vi.fn() }} />} /></Routes>
      </AuthContext.Provider>
    </MemoryRouter>,
  );
  await waitFor(() => expect(container.querySelector('.ws-page [data-block="pic"]')).not.toBeNull());
  fireEvent.click(container.querySelector('.ws-page [data-block="pic"]'));
  fireEvent.click(await screen.findByRole('button', { name: /Teksti sisse/ }));
  expect([...container.querySelectorAll('.ws-page [data-block="rd"] .ws-passage figcaption')].map((el) => el.textContent)).toEqual(['Esimene', 'Teine']);
  fireEvent.click(screen.getByRole('button', { name: 'Salvesta' }));
  await waitFor(() => expect(save).toHaveBeenCalled());
  const data = save.mock.calls[0][0].document.blocks[0].data;
  expect(data.figure).toBeNull();
  expect(data.figures.map((f) => [f.caption, f.side, f.at])).toEqual([['Esimene', 'right', 0], ['Teine', 'left', 1]]);
});
