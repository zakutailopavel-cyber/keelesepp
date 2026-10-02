import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, vi } from 'vitest';
import { AuthContext } from '../../app/AuthContext.jsx';
import WorksheetStudioPage from './WorksheetStudioPage.jsx';
import { sampleDocument } from './engine/sample.js';

globalThis.ResizeObserver = globalThis.ResizeObserver || class { observe() {} disconnect() {} };
const draftStore = new Map();
Object.defineProperty(window, 'localStorage', {
  configurable: true,
  value: {
    getItem: (key) => draftStore.get(key) ?? null,
    setItem: (key, value) => draftStore.set(key, String(value)),
    removeItem: (key) => draftStore.delete(key),
    clear: () => draftStore.clear(),
  },
});

function renderAt(path, repository) {
  const user = { uid: 'teacher-1', displayName: 'Õpetaja', roles: ['teacher'] };
  return render(
    <MemoryRouter initialEntries={[path]}>
      <AuthContext.Provider value={{ user }}>
        <Routes>
          <Route path="/library/worksheets/:lessonId" element={<WorksheetStudioPage repository={repository} />} />
          <Route path="/library" element={<div>library</div>} />
        </Routes>
      </AuthContext.Provider>
    </MemoryRouter>,
  );
}

const repo = (overrides = {}) => ({
  load: vi.fn().mockResolvedValue({ document: sampleDocument(), source: 'worksheetDoc', lesson: { id: 'lesson-1' } }),
  save: vi.fn().mockResolvedValue({ id: 'lesson-1', created: false, title: 'Minu päev ja kellaaeg' }),
  uploadImage: vi.fn(),
  uploadAudio: vi.fn(),
  ...overrides,
});

describe('WorksheetStudioPage', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('loads a worksheet, adds a block and saves it to the same lesson', async () => {
    const repository = repo();
    const { container } = renderAt('/library/worksheets/lesson-1', repository);
    await screen.findByText('Töölehe konstruktor');
    expect(repository.load).toHaveBeenCalledWith('lesson-1');
    const before = container.querySelectorAll('.ws-page .ws-card').length;
    fireEvent.click(screen.getByRole('button', { name: /Õige \/ vale/ }));
    await waitFor(() => expect(container.querySelectorAll('.ws-page .ws-card').length).toBe(before + 1));
    fireEvent.click(screen.getByRole('button', { name: 'Salvesta' }));
    await waitFor(() => expect(repository.save).toHaveBeenCalledTimes(1));
    const saved = repository.save.mock.calls[0][0];
    expect(saved.lessonId).toBe('lesson-1');
    expect(saved.document.blocks.some((b) => b.type === 'truefalse')).toBe(true);
    expect(await screen.findByRole('status')).toHaveTextContent('salvestati');
  });

  it('shows a conversion notice for legacy worksheets', async () => {
    renderAt('/library/worksheets/lesson-2', repo({ load: vi.fn().mockResolvedValue({ document: sampleDocument(), source: 'converted', lesson: {} }) }));
    expect(await screen.findByText(/teisendati vanast vormingust/)).toBeInTheDocument();
  });

  it('lets the teacher try the sheet as a student and check answers per goal', async () => {
    renderAt('/library/worksheets/lesson-1', repo());
    await screen.findByText('Töölehe konstruktor');
    fireEvent.click(screen.getByRole('tab', { name: 'Õpilase vaade' }));
    fireEvent.click(screen.getByRole('button', { name: 'Kontrolli vastuseid' }));
    expect(await screen.findByText('Tulemus tunni eesmärkide kaupa')).toBeInTheDocument();
    expect(screen.getByText('Ütlen ja küsin kellaaega (Kell on …).')).toBeInTheDocument();
  });

  it('reports save errors without losing the draft', async () => {
    renderAt('/library/worksheets/new', repo({ save: vi.fn().mockRejectedValue(new Error('Võrguühendus katkes.')) }));
    await screen.findByText('Töölehe konstruktor');
    fireEvent.change(screen.getByLabelText('Pealkiri', { exact: true }), { target: { value: 'Perekond' } });
    fireEvent.click(screen.getByRole('button', { name: 'Salvesta' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Võrguühendus katkes.');
    expect(screen.getByText(/Perekond · salvestamata/)).toBeInTheDocument();
  });

  it('shows a load error with a way back', async () => {
    renderAt('/library/worksheets/missing', repo({ load: vi.fn().mockRejectedValue(new Error('Õppematerjali ei leitud.')) }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Õppematerjali ei leitud.');
  });

  it('opens an image worksheet with the original next to the sheet', async () => {
    const lesson = { id: 'img', files: [{ name: 'leht.png', url: 'https://f.example/leht.png', type: 'image/png' }] };
    renderAt('/library/worksheets/img', repo({ load: vi.fn().mockResolvedValue({ document: sampleDocument(), source: 'new', lesson }) }));
    expect(await screen.findByRole('img', { name: /Originaal/ })).toHaveAttribute('src', 'https://f.example/leht.png');
    expect(screen.getByRole('button', { name: /Lõika foto lehele/ })).toBeDisabled();
    fireEvent.click(screen.getByRole('tab', { name: 'Plokid' }));
    expect(screen.getByRole('button', { name: /Õige \/ vale/ })).toBeInTheDocument();
  });

  it('asks for a title before the first save of a new sheet', async () => {
    const repository = repo();
    renderAt('/library/worksheets/new', repository);
    await screen.findByText('Töölehe konstruktor');
    fireEvent.click(screen.getByRole('button', { name: 'Salvesta' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Anna töölehele pealkiri');
    expect(repository.save).not.toHaveBeenCalled();
  });

  it('undoes and redoes block changes, also with the keyboard', async () => {
    const { container } = renderAt('/library/worksheets/lesson-1', repo());
    await screen.findByText('Töölehe konstruktor');
    const count = () => container.querySelectorAll('.ws-page .ws-card').length;
    const before = count();
    fireEvent.click(screen.getByRole('button', { name: /Õige \/ vale/ }));
    await waitFor(() => expect(count()).toBe(before + 1));
    fireEvent.click(screen.getByRole('button', { name: 'Võta tagasi' }));
    await waitFor(() => expect(count()).toBe(before));
    fireEvent.click(screen.getByRole('button', { name: 'Tee uuesti' }));
    await waitFor(() => expect(count()).toBe(before + 1));
    fireEvent.keyDown(window, { key: 'z', ctrlKey: true });
    await waitFor(() => expect(count()).toBe(before));
  });

  it('a deleted block can be brought back', async () => {
    const { container } = renderAt('/library/worksheets/lesson-1', repo());
    await screen.findByText('Töölehe konstruktor');
    const count = () => container.querySelectorAll('.ws-page .ws-card').length;
    const before = count();
    fireEvent.click(container.querySelector('.ws-page .ws-card'));
    fireEvent.click(container.querySelector('.st-inspector .ed-btn.danger'));
    await waitFor(() => expect(count()).toBe(before - 1));
    expect(screen.getByRole('status')).toHaveTextContent('kustutati');
    fireEvent.click(screen.getByRole('button', { name: 'Võta tagasi' }));
    await waitFor(() => expect(count()).toBe(before));
  });

  it('refuses a JSON file that is not a worksheet and keeps the sheet', async () => {
    const { container } = renderAt('/library/worksheets/lesson-1', repo());
    await screen.findByText('Töölehe konstruktor');
    const before = container.querySelectorAll('.ws-page .ws-card').length;
    const file = new globalThis.File(['{"hello":1}'], 'muu.json', { type: 'application/json' });
    fireEvent.change(container.querySelector('input[type="file"][accept="application/json"]'), { target: { files: [file] } });
    expect(await screen.findByRole('alert')).toHaveTextContent('ei ole KeeleSepa tööleht');
    expect(container.querySelectorAll('.ws-page .ws-card').length).toBe(before);
  });


  it('regenerates one generated task through the repository and keeps undo working', async () => {
    const document = sampleDocument();
    const original = { ...document.blocks[0], id: 'gen_practice_1' };
    document.blocks = [original, ...document.blocks.slice(1)];
    const replacement = { ...original, data: { ...original.data, title: 'Uus kellavariant.' } };
    const repository = repo({
      load: vi.fn().mockResolvedValue({
        document,
        source: 'worksheetDoc',
        lesson: {},
        generation: { phase: 'practice', seed: 'fixed', focusIds: ['time'] },
      }),
      regenerateBlock: vi.fn().mockResolvedValue({ block: replacement, mode: 'activity', diagnostics: [] }),
    });

    const { container } = renderAt('/library/worksheets/lesson-1', repository);
    await screen.findByText('Töölehe konstruktor');
    fireEvent.click(container.querySelector('.ws-page .ws-card'));
    const regenerate = screen.getByRole('button', { name: 'Genereeri uus variant' });
    expect(regenerate).toBeInTheDocument();
    expect(screen.getByText(/Sama fookus ja raskus/)).toBeInTheDocument();

    fireEvent.click(regenerate);
    await waitFor(() => expect(repository.regenerateBlock).toHaveBeenCalledWith({
      document: expect.objectContaining({ id: document.id }),
      blockId: 'gen_practice_1',
      generation: expect.objectContaining({ phase: 'practice' }),
    }));
    await waitFor(() => expect(container.querySelector('.ws-page')).toHaveTextContent('Uus kellavariant.'));
    expect(screen.getByRole('status')).toHaveTextContent('teise ülesandetüübiga');

    fireEvent.click(screen.getByRole('button', { name: 'Võta tagasi' }));
    await waitFor(() => expect(container.querySelector('.ws-page')).toHaveTextContent('Soojendus.'));
  });

  it('asks before leaving through a link with unsaved changes', async () => {
    renderAt('/library/worksheets/lesson-1', repo());
    await screen.findByText('Töölehe konstruktor');
    fireEvent.click(screen.getByRole('button', { name: /Õige \/ vale/ }));
    globalThis.confirm = vi.fn(() => false);
    fireEvent.click(screen.getByRole('link', { name: /Õppevara/ }));
    expect(globalThis.confirm).toHaveBeenCalled();
    expect(screen.getByText('Töölehe konstruktor')).toBeInTheDocument();
    globalThis.confirm = vi.fn(() => true);
    fireEvent.click(screen.getByRole('link', { name: /Õppevara/ }));
    expect(await screen.findByText('library')).toBeInTheDocument();
  });
});
