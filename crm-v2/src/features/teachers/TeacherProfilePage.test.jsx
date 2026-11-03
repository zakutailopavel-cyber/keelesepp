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
    await waitFor(() => expect(studentRepository.linkTeacher).toHaveBeenCalledWith(['s-enrollment', 's-name'], { teacherUid: 'teacher-uid', teacherName: 'Anhelina Korotka' }));
    expect(await screen.findByText(/2 õpilast seoti õpetaja kontoga/)).toBeInTheDocument();
  });

  it('does not offer the link to a non-admin', async () => {
    renderPage(['teacher']);
    await screen.findByRole('heading', { name: 'Anhelina Korotka', level: 1 });
    expect(screen.queryByRole('button', { name: /Seo õpetaja kontoga/ })).not.toBeInTheDocument();
  });
});

describe('TeacherProfilePage: „Kustuta” → „Prügikast” (administrator 2026-11-03)', () => {
  function renderTrash(teacher, { roles = ['admin'], url = '/teachers/teacher-uid' } = {}) {
    let current = teacher;
    const teacherRepository = { getById: vi.fn(async () => current) };
    const trashApi = {
      trash: vi.fn(async () => { current = { ...current, disabled: true, deletedAt: '2026-11-03T10:00:00.000Z', purgeAfter: '2026-11-10T10:00:00.000Z', deletedBy: { name: 'Oleksiy' } }; return { purgeAfter: current.purgeAfter }; }),
      restore: vi.fn(async () => { current = teacher; return { restored: true }; }),
    };
    render(<MemoryRouter initialEntries={[url]}><AuthContext.Provider value={{ user: { uid: 'admin-uid', roles } }}><Routes><Route path="/teachers/:teacherId" element={<TeacherProfilePage teacherRepository={teacherRepository} studentRepository={{ list: vi.fn().mockResolvedValue({ items: [] }) }} scheduleRepository={{ list: vi.fn().mockResolvedValue([]) }} timeRepository={{ listByStaff: vi.fn().mockResolvedValue({ sessions: [], programDays: [], summary: {} }) }} trashApi={trashApi} />} /></Routes></AuthContext.Provider></MemoryRouter>);
    return trashApi;
  }

  it('the menu link ?kustuta=1 opens the window; the card goes to the trash and can be restored from the card', async () => {
    const trashApi = renderTrash({ id: 'teacher-uid', name: 'Anhelina Korotka', role: 'teacher' }, { url: '/teachers/teacher-uid?kustuta=1' });
    fireEvent.click(await screen.findByRole('button', { name: /Vii prügikasti/ }));
    await waitFor(() => expect(trashApi.trash).toHaveBeenCalledWith('teacher', 'teacher-uid'));
    expect(await screen.findByText(/Õpetaja kaart on viidud prügikasti/)).toBeInTheDocument();
    expect(screen.getByText('Kaart on prügikastis')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Kustuta/ })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Taasta/ }));
    await waitFor(() => expect(trashApi.restore).toHaveBeenCalledWith('teacher', 'teacher-uid'));
    expect(await screen.findByText(/prügikastist taastatud/)).toBeInTheDocument();
  });

  it('no „Kustuta” for an administrator account', async () => {
    renderTrash({ id: 'teacher-uid', name: 'Admin Kaks', role: 'admin' });
    await screen.findByRole('heading', { name: 'Admin Kaks', level: 1 });
    expect(screen.queryByRole('button', { name: /Kustuta/ })).not.toBeInTheDocument();
  });
});
