import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { vi } from 'vitest';
import { AuthContext } from '../../app/AuthContext.jsx';
import WorksheetStudioPage from './WorksheetStudioPage.jsx';
import { sampleDocument } from './engine/sample.js';

globalThis.ResizeObserver = globalThis.ResizeObserver || class { observe() {} disconnect() {} };

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
    renderAt('/library/worksheets/new', repo({ save: vi.fn().mockRejectedValue(new Error('Sisesta töölehe pealkiri.')) }));
    await screen.findByText('Töölehe konstruktor');
    fireEvent.click(screen.getByRole('button', { name: 'Salvesta' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Sisesta töölehe pealkiri.');
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
});
