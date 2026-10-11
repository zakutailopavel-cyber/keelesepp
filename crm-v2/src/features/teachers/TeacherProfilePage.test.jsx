import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { vi } from 'vitest';
import { AuthContext } from '../../app/AuthContext.jsx';
import TeacherProfilePage from './TeacherProfilePage.jsx';

function renderPage(roles = ['admin']) {
  const teacherRepository = { getById: vi.fn().mockResolvedValue({ id: 'teacher-uid', name: 'Anhelina Korotka', email: 'a@example.com', role: 'teacher' }) };
  const studentRepository = {
    list: vi.fn().mockResolvedValue({ items: [
      { id: 's-linked', name: 'Mykyta', active: true, teacher: 'Anhelina Korotka', teacherUid: 'teacher-uid', teacherUids: ['teacher-uid'] },
      { id: 's-name', name: 'Maria', active: true, teacher: 'Anhelina Korotka' },
      { id: 's-enrollment', name: 'Emilia', active: true, teacher: 'Pavel Zakutailo', teacherUid: 'pavel', enrollments: [{ teacher: 'Anhelina Korotka', active: true }] },
      { id: 's-other', name: 'Jaan', active: true, teacher: 'Pavel Zakutailo', teacherUid: 'pavel' },
    ] }),
    linkTeacher: vi.fn().mockResolvedValue({ linked: 2 }),
  };
  const scheduleRepository = { list: vi.fn().mockResolvedValue([]) };
  const timeRepository = { listByStaff: vi.fn().mockResolvedValue({ sessions: [], programDays: [], summary: {} }) };
  render(<MemoryRouter initialEntries={['/teachers/teacher-uid']}><AuthContext.Provider value={{ user: { uid: 'admin-uid', roles } }}><Routes><Route path="/teachers/:teacherId" element={<TeacherProfilePage teacherRepository={teacherRepository} studentRepository={studentRepository} scheduleRepository={scheduleRepository} timeRepository={timeRepository} />} /></Routes></AuthContext.Provider></MemoryRouter>);
  return { studentRepository };
}

describe('TeacherProfilePage', () => {
  it('links the students assigned only by name to the teacher account', async () => {
    const { studentRepository } = renderPage();
    expect(await screen.findByText('2 õpilast on määratud ainult nime järgi')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Seo õpetaja kontoga/ }));
    await waitFor(() => expect(studentRepository.linkTeacher).toHaveBeenCalledWith(['s-name', 's-enrollment'], { teacherUid: 'teacher-uid', teacherName: 'Anhelina Korotka' }));
    expect(await screen.findByText(/2 õpilast seoti õpetaja kontoga/)).toBeInTheDocument();
  });

  it('does not offer the link to a non-admin', async () => {
    renderPage(['teacher']);
    await screen.findByRole('heading', { name: 'Anhelina Korotka', level: 1 });
    expect(screen.queryByRole('button', { name: /Seo õpetaja kontoga/ })).not.toBeInTheDocument();
  });
});
