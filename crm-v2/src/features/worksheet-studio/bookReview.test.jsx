// „Õpiku muudatused ootavad” (owner 2026-11-11): the admin's list of Õpik pages teachers changed.
import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import { AuthContext } from '../../app/AuthContext.jsx';
import BookPage from './BookPage.jsx';
import { pendingTextbookChanges } from './bookProgram.js';

globalThis.ResizeObserver = globalThis.ResizeObserver || class { observe() {} disconnect() {} };
const lessons = [
  { id: 'a2-017', title: 'Kus? Kuhu? Kust?', level: 'A2', roadmapManaged: true, roadmapModuleNumber: 1, roadmapLessonNumber: 1, worksheetPhases: { opik: { title: 'Kus? Kuhu? Kust? — sees', review: 'pending', reviewBy: 'Mari', reviewAt: '2026-11-11T09:00:00Z' } } },
  { id: 'a2-018', title: 'Peal', level: 'A2', roadmapManaged: true, roadmapModuleNumber: 1, roadmapLessonNumber: 2, worksheetPhases: { opik: { review: 'pending', reviewBy: 'Jaan', reviewAt: '2026-11-11T12:00:00Z' } } },
  { id: 'a2-006', title: 'Omastav', level: 'A2', roadmapManaged: true, roadmapModuleNumber: 1, roadmapLessonNumber: 3, worksheetPhases: { opik: { review: 'rejected' }, practice: { review: 'pending' } } },
];
const renderBook = (roles) => render(
  <MemoryRouter>
    <AuthContext.Provider value={{ user: { uid: 'u', roles } }}>
      <BookPage repository={{ list: vi.fn().mockResolvedValue({ curriculumLessons: lessons }) }} worksheetRepository={{ list: vi.fn().mockResolvedValue([]) }} loadExtras={() => Promise.resolve({})} />
    </AuthContext.Provider>
  </MemoryRouter>,
);

describe('Õpik changes waiting for the admin', () => {
  it('lists only waiting Õpik pages, newest first', () => {
    expect(pendingTextbookChanges(lessons)).toEqual([
      { lessonId: 'a2-018', title: 'Peal', by: 'Jaan', at: '2026-11-11T12:00:00Z' },
      { lessonId: 'a2-017', title: 'Kus? Kuhu? Kust? — sees', by: 'Mari', at: '2026-11-11T09:00:00Z' },
    ]);
  });

  it('the admin\'s book shows them with links to each page\'s editor; a teacher does not see the list', async () => {
    const { container, unmount } = renderBook(['admin']);
    const list = within(await screen.findByText(/Õpiku muudatused ootavad/).then(() => container.querySelector('.ws-book-waiting')));
    expect(list.getByText('2')).toBeInTheDocument();
    expect(list.getByRole('link', { name: /Peal/ })).toHaveAttribute('href', '/library/lessons/a2-018/worksheets/opik?tagasi=opik');
    unmount();
    renderBook(['teacher']);
    await screen.findByText('Õpik töölehtedest');
    expect(screen.queryByText(/Õpiku muudatused ootavad/)).toBeNull();
  });
});
