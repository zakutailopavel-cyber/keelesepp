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

function renderPage(repository) {
  const user = { uid: 'teacher-1', displayName: 'Õpetaja', roles: ['teacher'] };
  return render(
    <MemoryRouter initialEntries={['/library/lessons/a2b1-016/worksheets/practice']}>
      <AuthContext.Provider value={{ user }}>
        <Routes>
          <Route path="/library/lessons/:lessonId/worksheets/:worksheetId" element={<LessonWorksheetStudioPage repository={repository} />} />
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
});
