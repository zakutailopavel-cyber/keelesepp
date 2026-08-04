import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { AuthContext } from '../../app/AuthContext.jsx';
import GroupsPage from './GroupsPage.jsx';

const group = {
  id: 'group-1', name: 'A1 õhturühm', teacher: 'Õpetaja', teacherUid: 'teacher-1', subject: 'Eesti keel', level: 'A1', active: true,
  students: ['student-1'], lessons: [{ id: 'lesson-1', day: 'Tue', time: '17:30', startDate: '2026-08-04' }], studentLessonMap: { 'student-1': ['lesson-1'] },
};

function repositories() {
  return {
    repository: {
      list: vi.fn().mockResolvedValue([group]),
      create: vi.fn().mockResolvedValue({ id: 'group-new' }),
      remove: vi.fn().mockResolvedValue(undefined),
      setStudent: vi.fn().mockResolvedValue(undefined),
      addLesson: vi.fn().mockResolvedValue(undefined),
      removeLesson: vi.fn().mockResolvedValue(undefined),
      setStudentLesson: vi.fn().mockResolvedValue(undefined),
    },
    studentRepository: { list: vi.fn().mockResolvedValue({ items: [
      { id: 'student-1', name: 'Mari', email: 'mari@example.com', level: 'A1', teacher: 'Õpetaja', group: 'A1 õhturühm', active: true },
      { id: 'student-2', name: 'Jaan', email: 'jaan@example.com', level: 'A1', teacher: 'Õpetaja', group: '', active: true },
    ] }) },
    teacherRepository: { list: vi.fn().mockResolvedValue([{ id: 'teacher-1', name: 'Õpetaja', disabled: false }]) },
  };
}

function renderPage(user, data) {
  render(<MemoryRouter><AuthContext.Provider value={{ user }}><GroupsPage {...data} /></AuthContext.Provider></MemoryRouter>);
}

describe('GroupsPage', () => {
  it('lets an administrator create a group using a real teacher UID', async () => {
    const data = repositories();
    const user = { uid: 'admin-1', displayName: 'Admin', roles: ['admin'] };
    renderPage(user, data);
    await screen.findByText('A1 õhturühm');
    fireEvent.click(screen.getByRole('button', { name: 'Lisa grupp' }));
    const dialog = screen.getByRole('dialog', { name: 'Uus grupp' });
    fireEvent.change(within(dialog).getByLabelText('Grupi nimi'), { target: { value: 'B1 hommikurühm' } });
    fireEvent.change(within(dialog).getByLabelText('Tase'), { target: { value: 'B1' } });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Salvesta grupp' }));

    await waitFor(() => expect(data.repository.create).toHaveBeenCalledWith({ name: 'B1 hommikurühm', teacherUid: 'teacher-1', teacher: 'Õpetaja', subject: 'Eesti keel', level: 'B1' }, user));
    expect(await screen.findByRole('status')).toHaveTextContent('Grupp lisati');
  });

  it('atomically adds a student through the member manager', async () => {
    const data = repositories();
    const user = { uid: 'admin-1', displayName: 'Admin', roles: ['admin'] };
    renderPage(user, data);
    fireEvent.click(await screen.findByRole('button', { name: 'Halda' }));
    const dialog = screen.getByRole('dialog', { name: 'Grupi õpilased: A1 õhturühm' });
    fireEvent.click(within(dialog).getByRole('checkbox', { name: /Jaan/ }));

    await waitFor(() => expect(data.repository.setStudent).toHaveBeenCalledWith(group, expect.objectContaining({ id: 'student-2' }), true, user));
  });

  it('scopes a teacher to their own groups and hides administrator actions', async () => {
    const data = repositories();
    renderPage({ uid: 'teacher-1', displayName: 'Õpetaja', roles: ['teacher'] }, data);
    await screen.findByText('A1 õhturühm');
    expect(data.repository.list).toHaveBeenCalledWith({ teacherUid: 'teacher-1', teacherName: 'Õpetaja' });
    expect(data.studentRepository.list).toHaveBeenCalledWith(expect.objectContaining({ scopeTeacherUid: 'teacher-1' }));
    expect(data.teacherRepository.list).not.toHaveBeenCalled();
    expect(screen.queryByRole('button', { name: 'Lisa grupp' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Halda' })).not.toBeInTheDocument();
  });
});
