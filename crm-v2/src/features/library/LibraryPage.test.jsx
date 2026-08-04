import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import { AuthContext } from '../../app/AuthContext.jsx';
import LibraryPage from './LibraryPage.jsx';

const data = {
  curriculumLessons: [
    { id: 'lesson-1', title: 'Pere tunnikava', description: 'Tund perest', subject: 'Eesti keel', level: 'A1', topic: 'Minu pere' },
    { id: 'worksheet-1', title: 'Pere tööleht', subject: 'Eesti keel', level: 'A1', topic: 'Minu pere', worksheetData: { blocks: [{ type: 'fill' }] } },
  ],
  exercises: [
    { id: 'exercise-1', title: 'Family match', subject: 'Inglise keel', level: 'A1', topic: 'My family', type: 'match' },
  ],
};

function renderPage() {
  const repository = { list: vi.fn().mockResolvedValue(data), assign: vi.fn().mockResolvedValue({ count: 1 }) };
  const studentRepository = { list: vi.fn().mockResolvedValue({ items: [{ id: 'student-1', name: 'Mari', subject: 'Eesti keel', level: 'A1', active: true }] }) };
  const user = { uid: 'teacher-1', displayName: 'Õpetaja', roles: ['teacher'] };
  render(<MemoryRouter><AuthContext.Provider value={{ user }}><LibraryPage repository={repository} studentRepository={studentRepository} /></AuthContext.Provider></MemoryRouter>);
  return { repository, studentRepository, user };
}

describe('LibraryPage', () => {
  it('opens the real subject, stage and topic hierarchy', async () => {
    const { repository } = renderPage();
    fireEvent.click(await screen.findByRole('button', { name: /Eesti keel.*2 materjali/ }));
    fireEvent.click(screen.getByRole('button', { name: /A1.*2 materjali/ }));
    fireEvent.click(screen.getByRole('button', { name: /Minu pere.*2 materjali/ }));

    expect(screen.getByRole('button', { name: /Pere tunnikava/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Pere tööleht/ })).toBeInTheDocument();
    expect(repository.list).toHaveBeenCalledOnce();
  });

  it('searches across both Firebase collections and opens material details', async () => {
    renderPage();
    await screen.findByRole('button', { name: /Eesti keel.*2 materjali/ });
    fireEvent.change(screen.getByLabelText('Otsi õppevara'), { target: { value: 'family' } });
    const exercise = screen.getByRole('button', { name: /Family match/ });
    fireEvent.click(exercise);

    const dialog = screen.getByRole('dialog', { name: 'Family match' });
    expect(dialog).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Ava töövahend/ })).toHaveAttribute('href', 'https://www.epkoolitus.ee/haldus-exercises/?exercise=exercise-1');
  });

  it('assigns a material only to students in the teacher UID scope', async () => {
    const { repository, studentRepository, user } = renderPage();
    await screen.findByRole('button', { name: /Eesti keel.*2 materjali/ });
    fireEvent.change(screen.getByLabelText('Otsi õppevara'), { target: { value: 'tööleht' } });
    fireEvent.click(screen.getByRole('button', { name: /Pere tööleht/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Määra õpilastele' }));

    const checkbox = await screen.findByRole('checkbox', { name: /Mari/ });
    fireEvent.click(checkbox);
    fireEvent.change(screen.getByLabelText('Tähtaeg'), { target: { value: '2026-08-10' } });
    fireEvent.change(screen.getByLabelText('Märkus õpilasele'), { target: { value: 'Tee lõpuni' } });
    fireEvent.click(screen.getByRole('button', { name: /Määra 1 õpilasele/ }));

    expect(await screen.findByRole('status')).toHaveTextContent('määrati 1 õpilasele');
    expect(studentRepository.list).toHaveBeenCalledWith(expect.objectContaining({ scopeTeacherUid: 'teacher-1' }));
    expect(repository.assign).toHaveBeenCalledWith(expect.objectContaining({
      students: [expect.objectContaining({ id: 'student-1' })],
      dueDate: '2026-08-10',
      note: 'Tee lõpuni',
      user,
    }));
  });
});
