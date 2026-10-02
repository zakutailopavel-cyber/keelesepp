import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { vi } from 'vitest';
import { AuthContext } from '../../../app/AuthContext.jsx';
import LessonWorksheetSet from './LessonWorksheetSet.jsx';

const lesson = { id: 'a2b1-016', title: 'Ajamäärused ja päevaplaan', goal: 'Kirjeldan oma päevaplaani.', levelStage: 'A2' };
const user = { uid: 'teacher-1', displayName: 'Õpetaja', roles: ['teacher'] };
const vocabularyRepository = {
  load: vi.fn().mockResolvedValue({
    lexicon: { A2: { noun: ['kodu'], adverb: ['hommikul', 'õhtul'] } },
    source: 'firebase-storage:eesti_soned.json',
    storagePath: 'eesti_soned.json',
    wordCount: 3,
  }),
};

function renderPage(repository, vocabRepository = vocabularyRepository) {
  return render(
    <MemoryRouter initialEntries={['/library/lessons/a2b1-016/worksheets']}>
      <AuthContext.Provider value={{ user }}>
        <Routes><Route path="/library/lessons/:lessonId/worksheets" element={<LessonWorksheetSet repository={repository} vocabularyRepository={vocabRepository} />} /></Routes>
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
      expect(input.generation.levelVocabulary).toEqual({ source: 'firebase-storage:eesti_soned.json', wordCount: 3 });
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
    expect(saved.generation.levelVocabulary).toEqual({ source: 'firebase-storage:eesti_soned.json', wordCount: 3 });
    expect(await screen.findByRole('status')).toHaveTextContent('Fookuse tööleht');
    expect(await screen.findByRole('heading', { name: 'Enne ja pärast · Täistööleht' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Genereeri 3 töölehte/ })).toBeInTheDocument();
  });


  it('keeps lesson generation available when the shared level lexicon cannot be loaded', async () => {
    const repository = {
      loadLesson: vi.fn().mockResolvedValue(lesson),
      list: vi.fn().mockResolvedValue([]),
      saveDraft: vi.fn(),
    };
    const failingVocabulary = { load: vi.fn().mockRejectedValue(new Error('Storage offline')) };
    renderPage(repository, failingVocabulary);
    expect(await screen.findByText(/Tasemesõnastik: Storage offline/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Genereeri 3 töölehte/ })).toBeEnabled();
  });


  it('authors and saves an embedded generator content-pack draft for a lesson without a code profile', async () => {
    const otherLesson = {
      id: 'other',
      title: 'Arvamuse põhjendamine',
      levelStage: 'B1',
      roadmapKind: 'communication',
      languageFocus: 'Põhjus ja näide',
      successCriteria: 'Õpilane põhjendab oma arvamust.',
    };
    const repository = {
      loadLesson: vi.fn().mockResolvedValue(otherLesson),
      list: vi.fn().mockResolvedValue([]),
      saveDraft: vi.fn(),
      saveGeneratorProfile: vi.fn().mockResolvedValue({
        profile: {},
        revision: 1,
        updatedAt: '2026-10-02T22:00:00Z',
      }),
    };
    render(
      <MemoryRouter initialEntries={['/library/lessons/other/worksheets']}>
        <AuthContext.Provider value={{ user }}>
          <Routes><Route path="/library/lessons/:lessonId/worksheets" element={<LessonWorksheetSet repository={repository} vocabularyRepository={vocabularyRepository} />} /></Routes>
        </AuthContext.Provider>
      </MemoryRouter>,
    );

    expect(await screen.findByText(/Generaator pole selle tunni jaoks veel valmis/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Generaatori sisu' }));
    expect(await screen.findByRole('heading', { name: 'Generaatori sisupakett' })).toBeInTheDocument();
    expect(screen.getByDisplayValue('Põhjus ja näide')).toBeInTheDocument();
    expect(screen.getByText(/Puudu:/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Salvesta sisupakett' }));
    await waitFor(() => expect(repository.saveGeneratorProfile).toHaveBeenCalledTimes(1));
    const input = repository.saveGeneratorProfile.mock.calls[0][0];
    expect(input.lessonId).toBe('other');
    expect(input.baseUpdatedAt).toBe('');
    expect(input.user).toBe(user);
    expect(input.profile).toMatchObject({
      schema: 'keelesepp.worksheet-generator-profile/1',
      version: 1,
      lessonId: 'other',
      level: 'B1',
      lessonKind: 'communication',
      title: 'Arvamuse põhjendamine',
    });
    expect(input.profile.focuses[0]).toMatchObject({ id: 'lesson-focus', label: 'Põhjus ja näide' });
    expect(screen.getByRole('button', { name: /Genereeri 3 töölehte/ })).toBeDisabled();
  });

  it('does not offer generation for a lesson without a curated profile', async () => {
    const repository = { loadLesson: vi.fn().mockResolvedValue({ id: 'other', title: 'Muu tund' }), list: vi.fn().mockResolvedValue([]), saveDraft: vi.fn() };
    render(
      <MemoryRouter initialEntries={['/library/lessons/other/worksheets']}>
        <AuthContext.Provider value={{ user }}><Routes><Route path="/library/lessons/:lessonId/worksheets" element={<LessonWorksheetSet repository={repository} vocabularyRepository={vocabularyRepository} />} /></Routes></AuthContext.Provider>
      </MemoryRouter>,
    );
    expect(await screen.findByText(/Generaator pole selle tunni jaoks veel valmis/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Genereeri 3 töölehte/ })).toBeDisabled();
  });
});
