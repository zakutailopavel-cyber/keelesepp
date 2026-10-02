import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { vi } from 'vitest';
import { AuthContext } from '../../../app/AuthContext.jsx';
import LessonWorksheetSet from './LessonWorksheetSet.jsx';

const lesson = { id: 'a2b1-016', title: 'Ajamäärused ja päevaplaan', goal: 'Kirjeldan oma päevaplaani.', levelStage: 'A2' };
const user = { uid: 'teacher-1', displayName: 'Õpetaja', roles: ['teacher'] };

function renderPage(repository) {
  return render(
    <MemoryRouter initialEntries={['/library/lessons/a2b1-016/worksheets']}>
      <AuthContext.Provider value={{ user }}>
        <Routes><Route path="/library/lessons/:lessonId/worksheets" element={<LessonWorksheetSet repository={repository} />} /></Routes>
      </AuthContext.Provider>
    </MemoryRouter>,
  );
}

describe('LessonWorksheetSet', () => {
  it('generates and saves three distinct lesson drafts, then shows their cards', async () => {
    let records = [];
    const repository = {
      loadLesson: vi.fn().mockResolvedValue(lesson),
      list: vi.fn(async () => records),
      saveDraft: vi.fn(async (input) => {
        const record = { ...input, id: input.worksheetId, worksheetDocStatus: 'draft', worksheetDocVersion: 1, worksheetDocUpdatedAt: '2026-10-02T12:00:00Z' };
        records = [...records.filter((item) => item.id !== record.id), record];
        return record;
      }),
    };
    renderPage(repository);
    await screen.findByRole('heading', { name: 'Ajamäärused ja päevaplaan' });
    fireEvent.change(screen.getByLabelText('Töölehtede raskus'), { target: { value: 'challenge' } });
    fireEvent.click(screen.getByRole('button', { name: /Genereeri 3 töölehte/ }));
    await waitFor(() => expect(repository.saveDraft).toHaveBeenCalledTimes(3));
    expect(repository.saveDraft.mock.calls.map(([input]) => input.worksheetId)).toEqual(['discover', 'practice', 'transfer']);
    expect(new Set(repository.saveDraft.mock.calls.map(([input]) => JSON.stringify(input.worksheetDoc))).size).toBe(3);
    repository.saveDraft.mock.calls.forEach(([input]) => {
      expect(input.generation.variant).toBe(1);
      expect(input.generation.didacticPlanVersion).toBe(1);
      expect(input.generation.activityIds).toHaveLength(5);
      expect(input.generation.contextId).toBeTruthy();
      expect(input.generation.difficulty).toBe('challenge');
      expect(input.generation.lessonDna).toMatchObject({ lessonId: 'a2b1-016', difficulty: 'challenge', variant: 1 });
    });
    expect(await screen.findByRole('status')).toHaveTextContent('Kolm erinevat töölehte');
    expect(await screen.findAllByRole('link', { name: /Ava konstruktoris/ })).toHaveLength(3);
  });


  it('generates a separate worksheet for one selected lesson focus', async () => {
    let records = [];
    const repository = {
      loadLesson: vi.fn().mockResolvedValue(lesson),
      list: vi.fn(async () => records),
      saveDraft: vi.fn(async (input) => {
        const record = { ...input, id: input.worksheetId, worksheetDocStatus: 'draft', worksheetDocVersion: 1, worksheetDocUpdatedAt: '2026-10-02T12:00:00Z' };
        records = [...records.filter((item) => item.id !== record.id), record];
        return record;
      }),
    };

    renderPage(repository);
    await screen.findByRole('heading', { name: 'Ajamäärused ja päevaplaan' });
    fireEvent.change(screen.getByLabelText('Töölehe fookus'), { target: { value: 'before-after' } });
    fireEvent.click(screen.getByRole('button', { name: 'Genereeri fookuse tööleht' }));

    await waitFor(() => expect(repository.saveDraft).toHaveBeenCalledTimes(1));
    const saved = repository.saveDraft.mock.calls[0][0];
    expect(saved.worksheetId).toBe('focus-full-before-after');
    expect(saved.role).toBe('focus');
    expect(saved.slot).toBeNull();
    expect(saved.displayLabel).toBe('Enne ja pärast · Täistööleht');
    expect(saved.generation).toMatchObject({
      scope: 'focus',
      phase: 'full',
      focusIds: ['before-after'],
      difficulty: 'core',
      variant: 1,
    });
    expect(saved.generation.contextId).toBeTruthy();
    expect(saved.generation.activityIds).toHaveLength(5);
    expect(await screen.findByRole('status')).toHaveTextContent('Fookuse tööleht');
    expect(await screen.findByRole('heading', { name: 'Enne ja pärast · Täistööleht' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Genereeri 3 töölehte/ })).toBeInTheDocument();
  });

  it('does not offer generation for a lesson without a curated profile', async () => {
    const repository = { loadLesson: vi.fn().mockResolvedValue({ id: 'other', title: 'Muu tund' }), list: vi.fn().mockResolvedValue([]), saveDraft: vi.fn() };
    render(
      <MemoryRouter initialEntries={['/library/lessons/other/worksheets']}>
        <AuthContext.Provider value={{ user }}><Routes><Route path="/library/lessons/:lessonId/worksheets" element={<LessonWorksheetSet repository={repository} />} /></Routes></AuthContext.Provider>
      </MemoryRouter>,
    );
    expect(await screen.findByText(/Generaator pole selle tunni jaoks veel valmis/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Genereeri 3 töölehte/ })).toBeDisabled();
  });
});
