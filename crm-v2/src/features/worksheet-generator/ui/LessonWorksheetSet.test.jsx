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
    fireEvent.click(screen.getByRole('button', { name: /Genereeri 3 töölehte/ }));
    await waitFor(() => expect(repository.saveDraft).toHaveBeenCalledTimes(3));
    expect(repository.saveDraft.mock.calls.map(([input]) => input.worksheetId)).toEqual(['discover', 'practice', 'transfer']);
    expect(new Set(repository.saveDraft.mock.calls.map(([input]) => JSON.stringify(input.worksheetDoc))).size).toBe(3);
    expect(await screen.findByRole('status')).toHaveTextContent('Kolm erinevat töölehte');
    expect(await screen.findAllByRole('link', { name: /Ava konstruktoris/ })).toHaveLength(3);
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
