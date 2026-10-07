import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { vi } from 'vitest';
import { AuthContext } from '../../../app/AuthContext.jsx';
import LessonWorksheetStudioPage from './LessonWorksheetStudioPage.jsx';
import { generateLessonBundle } from '../engine/generator.js';
import profile from '../fixtures/a2b1-016.generator-profile.json';

globalThis.ResizeObserver = globalThis.ResizeObserver || class { observe() {} disconnect() {} };

function generatedPracticeRecord() {
  const result = generateLessonBundle({
    lesson: { id: 'a2b1-016', tag: 'Грамматика', levelStage: 'A2', title: 'Ajamäärused ja päevaplaan' },
    profile,
    seed: 'studio-regeneration',
    difficulty: 'core',
    variant: 4,
  });
  const sheet = result.sheets.find((item) => item.phase === 'practice');
  return {
    worksheetDoc: sheet.worksheetDoc,
    worksheetDocUpdatedAt: '2026-10-02T19:00:00.000Z',
    worksheetDocVersion: 4,
    worksheetDocStatus: 'draft',
    generation: {
      generatorVersion: sheet.generatorVersion,
      seed: sheet.seed,
      phase: sheet.phase,
      focusIds: sheet.focusIds,
      profileVersion: sheet.profileVersion,
      activityIds: sheet.activityIds,
      difficulty: sheet.difficulty,
      lessonDna: sheet.lessonDna,
      variant: 4,
    },
  };
}

function renderPage(repository, path = '/library/lessons/a2b1-016/worksheets/practice', vocabularyRepository = undefined) {
  const user = { uid: 'teacher-1', displayName: 'Õpetaja', roles: ['teacher'] };
  return render(
    <MemoryRouter initialEntries={[path]}>
      <AuthContext.Provider value={{ user }}>
        <Routes>
          <Route path="/library/lessons/:lessonId/worksheets/:worksheetId" element={<LessonWorksheetStudioPage repository={repository} vocabularyRepository={vocabularyRepository} />} />
          <Route path="/library/lessons/:lessonId/worksheets" element={<div>worksheet-set</div>} />
        </Routes>
      </AuthContext.Provider>
    </MemoryRouter>,
  );
}

describe('LessonWorksheetStudioPage task regeneration', () => {
  it('regenerates locally and writes only after the teacher saves', async () => {
    const record = generatedPracticeRecord();
    const repository = {
      load: vi.fn().mockResolvedValue(record),
      saveDraft: vi.fn().mockImplementation(async ({ worksheetDoc }) => ({
        ...record,
        worksheetDoc,
        title: worksheetDoc.meta.title,
        worksheetDocUpdatedAt: '2026-10-02T20:00:00.000Z',
        worksheetDocVersion: 5,
        worksheetDocStatus: 'draft',
      })),
      publish: vi.fn(),
      listVersions: vi.fn().mockResolvedValue([]),
    };

    const { container } = renderPage(repository);
    await screen.findByText('Töölehe konstruktor');
    const original = record.worksheetDoc.blocks[0];
    fireEvent.click(container.querySelector('.ws-page .ws-card'));
    fireEvent.click(screen.getByRole('button', { name: 'Genereeri uus variant' }));

    await screen.findByRole('status');
    expect(repository.saveDraft).not.toHaveBeenCalled();
    const currentCard = container.querySelector('.ws-page .ws-card');
    expect(currentCard).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'Salvesta' }));
    await waitFor(() => expect(repository.saveDraft).toHaveBeenCalledTimes(1));
    const saved = repository.saveDraft.mock.calls[0][0];
    expect(saved.lessonId).toBe('a2b1-016');
    expect(saved.worksheetId).toBe('practice');
    const replaced = saved.worksheetDoc.blocks.find((block) => block.id === original.id);
    expect(replaced).toBeTruthy();
    expect({ type: replaced.type, data: replaced.data }).not.toEqual({ type: original.type, data: original.data });
  });

  it('opens a missing core sheet in the constructor and generates the three sheets from the top strip', async () => {
    const lesson = { id: 'a2b1-016', tag: 'Грамматика', levelStage: 'A2', title: 'Ajamäärused ja päevaplaan' };
    const repository = {
      load: vi.fn().mockRejectedValue(new Error('Töölehte ei leitud.')),
      loadLesson: vi.fn().mockResolvedValue(lesson),
      list: vi.fn().mockResolvedValue([]),
      saveDraft: vi.fn().mockImplementation(async ({ worksheetDoc }) => ({ title: worksheetDoc.meta.title, worksheetDocUpdatedAt: '2026-10-05T10:00:00.000Z', worksheetDocVersion: 1, worksheetDocStatus: 'draft' })),
      publish: vi.fn(),
      listVersions: vi.fn().mockResolvedValue([]),
    };
    const vocabularyRepository = { load: vi.fn().mockResolvedValue({ lexicon: [], source: '', wordCount: 0 }) };
    renderPage(repository, '/library/lessons/a2b1-016/worksheets/discover', vocabularyRepository);

    await screen.findByText('Töölehe konstruktor');
    expect(await screen.findByRole('link', { name: '1 Avasta' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('link', { name: '2 Harjuta' })).toHaveAttribute('href', '/library/lessons/a2b1-016/worksheets/practice');
    const generate = screen.getByRole('button', { name: /Genereeri 3 töölehte/ });

    fireEvent.click(generate);
    await waitFor(() => expect(repository.saveDraft).toHaveBeenCalledTimes(3));
    expect(repository.saveDraft.mock.calls.map(([input]) => input.worksheetId).sort()).toEqual(['discover', 'practice', 'transfer']);
    expect(repository.saveDraft.mock.calls.every(([input]) => input.generation?.scope === 'lesson-bundle')).toBe(true);
    expect(await screen.findByText(/Kolm töölehte genereeriti/)).toBeInTheDocument();
    await waitFor(() => expect(repository.load.mock.calls.length).toBeGreaterThan(1));
  });

  it('puts the lesson words on the sheet from the lesson strip', async () => {
    const lesson = { id: 'a2b1-016', tag: 'Грамматика', levelStage: 'A2', title: 'Ajamäärused ja päevaplaan' };
    const record = generatedPracticeRecord();
    const repository = {
      load: vi.fn().mockResolvedValue(record),
      loadLesson: vi.fn().mockResolvedValue(lesson),
      list: vi.fn().mockResolvedValue([]),
      saveDraft: vi.fn(),
      publish: vi.fn(),
      listVersions: vi.fn().mockResolvedValue([]),
    };
    const vocabularyRepository = { load: vi.fn().mockResolvedValue({ lexicon: [], source: '', wordCount: 0 }) };
    const { container } = renderPage(repository, '/library/lessons/a2b1-016/worksheets/practice', vocabularyRepository);
    await screen.findByText('Töölehe konstruktor');
    const count = container.querySelectorAll('.ws-page .ws-card').length;
    fireEvent.click(await screen.findByRole('button', { name: /Sõnavara kast/ }));
    await waitFor(() => expect(container.querySelectorAll('.ws-page .ws-card')).toHaveLength(count + 1));
    expect(container.querySelector('.ws-page')).toHaveTextContent('hommikul');
    fireEvent.click(screen.getByRole('button', { name: 'Ühenda: sõna – tõlge' }));
    await waitFor(() => expect(container.querySelectorAll('.ws-page .ws-card')).toHaveLength(count + 2));
    expect(container.querySelector('.ws-page')).toHaveTextContent('утром');
  });
});

describe('LessonWorksheetStudioPage student view', () => {
  it('opens a published sheet in the student view with a clear button back to editing', async () => {
    const record = { ...generatedPracticeRecord(), worksheetDocStatus: 'published' };
    const repository = { load: vi.fn().mockResolvedValue(record), saveDraft: vi.fn(), publish: vi.fn(), listVersions: vi.fn().mockResolvedValue([]) };
    renderPage(repository, '/library/lessons/a2b1-016/worksheets/practice?vaade=opilane');
    expect(await screen.findByRole('button', { name: 'Kontrolli vastuseid' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Muuda lehte/ }));
    expect(screen.getByRole('tab', { name: 'Koosta' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.queryByRole('button', { name: /Muuda lehte/ })).not.toBeInTheDocument();
  });
});
