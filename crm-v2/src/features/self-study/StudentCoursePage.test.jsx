import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import { AuthContext } from '../../app/AuthContext.jsx';

vi.mock('../homework/WorksheetPlayer.jsx', () => ({ default: ({ assignment }) => <div>Mängija: {assignment.lessonId} {assignment.phase}</div> }));
vi.mock('../calendar/lessonTopic.js', () => ({
  buildTopicCatalog: () => ({ byId: new Map(), levels: [{ key: 'B2', label: 'B2', modules: [{ key: 'm1', label: 'Moodul 1', lessons: [{ id: 'b1b2-001', title: 'Tervitus', number: 1 }, { id: 'b1b2-002', title: 'Pere', number: 2 }] }] }] }),
}));
const { default: StudentCoursePage } = await import('./StudentCoursePage.jsx');

const repo = (student, assignments = []) => ({
  students: vi.fn().mockResolvedValue([student]),
  curriculum: vi.fn().mockResolvedValue([]),
  assignments: vi.fn().mockResolvedValue(assignments),
  sheets: vi.fn().mockResolvedValue([{ id: 'discover', worksheetDocStatus: 'published', publishedWorksheetDoc: { blocks: [{ id: 'x', type: 'text' }] } }]),
  start: vi.fn(async ({ lesson, phase }) => ({ id: 'new', lessonId: lesson.id, phase })),
});
const renderPage = (repository) => render(<MemoryRouter><AuthContext.Provider value={{ user: { uid: 'u1', roles: ['student'] } }}><StudentCoursePage repository={repository} /></AuthContext.Provider></MemoryRouter>);

describe('Minu kursus (owner 2026-10-23)', () => {
  it('a self-study student starts the next lesson himself', async () => {
    const repository = repo({ id: 's1', name: 'Liudmila', level: 'B2', isSelfStudent: true }, [{ lessonId: 'b1b2-001', phase: 'discover', status: 'done', score: { correct: 9, total: 10 } }, { lessonId: 'b1b2-001', phase: 'practice', status: 'done' }, { lessonId: 'b1b2-001', phase: 'transfer', status: 'done' }]);
    renderPage(repository);
    expect(await screen.findByRole('heading', { name: '2. Pere' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Alusta/ }));
    await waitFor(() => expect(repository.start).toHaveBeenCalledWith(expect.objectContaining({ phase: 'discover', lesson: expect.objectContaining({ id: 'b1b2-002' }) })));
    expect(await screen.findByText('Mängija: b1b2-002 discover')).toBeInTheDocument();
    expect(screen.getByText('1/2 tundi tehtud')).toBeInTheDocument();
  });

  it('a student with a teacher sees the map and his progress but does not start sheets', async () => {
    const repository = repo({ id: 's2', name: 'Mia', level: 'B2' });
    renderPage(repository);
    expect(await screen.findByText('Seda tundi teed koos õpetajaga.')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Alusta/ })).toBeNull();
    screen.getAllByRole('button', { name: /Avasta/ }).forEach((button) => expect(button).toBeDisabled());
  });
});
