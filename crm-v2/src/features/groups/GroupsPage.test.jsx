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
    expect(screen.getByRole('region', { name: 'Gruppide kokkuvõte' })).toHaveTextContent('Valmis grupid1');
    fireEvent.click(screen.getByRole('button', { name: 'Lisa grupp' }));
    const dialog = screen.getByRole('dialog', { name: 'Uus grupp' });
    fireEvent.change(within(dialog).getByLabelText('Grupi nimi'), { target: { value: 'B1 hommikurühm' } });
    fireEvent.change(within(dialog).getByLabelText('Tase'), { target: { value: 'B1' } });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Salvesta grupp' }));

    await waitFor(() => expect(data.repository.create).toHaveBeenCalledWith({ name: 'B1 hommikurühm', teacherUid: 'teacher-1', teacher: 'Õpetaja', subject: 'Eesti keel', level: 'B1', audience: '', capacity: '' }, user));
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

  it('edits the name and the teacher of an existing group; the new teacher starts from a chosen date', async () => {
    const data = repositories();
    data.repository.update = vi.fn().mockResolvedValue({});
    data.teacherRepository.list.mockResolvedValue([{ id: 'teacher-1', name: 'Õpetaja', disabled: false }, { id: 'teacher-2', name: 'Uus Õpetaja', disabled: false }]);
    const user = { uid: 'admin-1', displayName: 'Admin', roles: ['admin'] };
    renderPage(user, data);
    fireEvent.click(await screen.findByRole('button', { name: 'Muuda gruppi A1 õhturühm' }));
    const dialog = screen.getByRole('dialog', { name: 'Muuda gruppi: A1 õhturühm' });
    fireEvent.change(within(dialog).getByLabelText('Grupi nimi'), { target: { value: 'A1 hommikurühm' } });
    fireEvent.change(within(dialog).getByLabelText('Õpetaja'), { target: { value: 'teacher-2' } });
    fireEvent.change(within(dialog).getByLabelText('Uus õpetaja alates'), { target: { value: '2026-11-10' } });
    expect(within(dialog).getByText(/Varasemad tunnid jäävad endisele õpetajale/)).toBeInTheDocument();
    fireEvent.click(within(dialog).getByRole('button', { name: 'Salvesta muudatused' }));
    await waitFor(() => expect(data.repository.update).toHaveBeenCalledWith(group, expect.objectContaining({ name: 'A1 hommikurühm', teacherUid: 'teacher-2', teacher: 'Uus Õpetaja', level: 'A1' }), user, expect.objectContaining({ teacherFrom: '2026-11-10' })));
    expect(await screen.findByRole('status')).toHaveTextContent('alates 2026-11-10');
  });

  it('adds a group lesson with its length and changes the length of an existing one', async () => {
    const data = repositories();
    data.repository.patchLesson = vi.fn().mockResolvedValue({});
    const user = { uid: 'admin-1', displayName: 'Admin', roles: ['admin'] };
    renderPage(user, data);
    fireEvent.click(await screen.findByRole('button', { name: 'Lisa aeg' }));
    let dialog = screen.getByRole('dialog', { name: 'Lisa tunniaeg: A1 õhturühm' });
    fireEvent.change(within(dialog).getByLabelText('Kestus (min)'), { target: { value: '90' } });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Lisa tunniaeg' }));
    await waitFor(() => expect(data.repository.addLesson).toHaveBeenCalledWith(group, expect.objectContaining({ duration: 90, day: 'Mon', time: '16:00' }), user));

    fireEvent.click(await screen.findByRole('button', { name: 'Muuda A1 õhturühm tunni kestust (Teisipäev 17:30)' }));
    dialog = screen.getByRole('dialog', { name: 'Muuda tunni kestust: A1 õhturühm' });
    fireEvent.change(within(dialog).getByLabelText('Kestus (min)'), { target: { value: '45' } });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Salvesta kestus' }));
    await waitFor(() => expect(data.repository.patchLesson).toHaveBeenCalledWith(group, 'lesson-1', { duration: 45 }, user));
  });

  it('finds archived students in „Halda” with a label and adds them on an explicit choice', async () => {
    const data = repositories();
    const cards = [
      { id: 'student-1', name: 'Mari', level: 'A1', group: 'A1 õhturühm', active: true },
      { id: 'student-3', name: 'Olga', level: 'A1', group: '', active: false },
    ];
    data.studentRepository.list = vi.fn(async ({ status }) => ({ items: cards.filter((card) => (status === 'archived' ? !card.active : card.active)) }));
    data.studentRepository.restore = vi.fn().mockResolvedValue({});
    const user = { uid: 'admin-1', displayName: 'Admin', roles: ['admin'] };
    renderPage(user, data);
    fireEvent.click(await screen.findByRole('button', { name: 'Halda' }));
    let manager = screen.getByRole('dialog', { name: 'Grupi õpilased: A1 õhturühm' });
    expect(within(manager).getByText('Arhiveeritud')).toBeInTheDocument();
    fireEvent.click(within(manager).getByRole('checkbox', { name: /Olga/ }));
    const ask = screen.getByRole('dialog', { name: 'Arhiveeritud õpilane' });
    expect(data.repository.setStudent).not.toHaveBeenCalled();
    fireEvent.click(within(ask).getByRole('button', { name: 'Lisa ja taasta kaart' }));
    await waitFor(() => expect(data.repository.setStudent).toHaveBeenCalledWith(group, expect.objectContaining({ id: 'student-3' }), true, user));
    expect(data.studentRepository.restore).toHaveBeenCalledWith(['student-3']);
    expect(await screen.findByRole('status')).toHaveTextContent('Kaart taastati arhiivist');

    // or the card stays archived
    data.repository.setStudent.mockClear();
    data.studentRepository.restore.mockClear();
    manager = await screen.findByRole('dialog', { name: 'Grupi õpilased: A1 õhturühm' });
    fireEvent.click(within(manager).getByRole('checkbox', { name: /Olga/ }));
    fireEvent.click(within(screen.getByRole('dialog', { name: 'Arhiveeritud õpilane' })).getByRole('button', { name: 'Lisa, kaart jääb arhiivi' }));
    await waitFor(() => expect(data.repository.setStudent).toHaveBeenCalledWith(group, expect.objectContaining({ id: 'student-3' }), true, user));
    expect(data.studentRepository.restore).not.toHaveBeenCalled();
  });

  it('confirms a member\'s participation from the group window', async () => {
    const data = repositories();
    data.studentRepository.saveGroupInterest = vi.fn().mockResolvedValue({});
    const user = { uid: 'admin-1', displayName: 'Admin', roles: ['admin'] };
    renderPage(user, data);
    fireEvent.click(await screen.findByRole('button', { name: 'Ava grupp A1 õhturühm' }));
    const dialog = screen.getByRole('dialog', { name: 'A1 õhturühm' });
    fireEvent.change(within(dialog).getByLabelText('Osalemine: Mari'), { target: { value: 'interested' } });
    await waitFor(() => expect(data.studentRepository.saveGroupInterest).toHaveBeenCalledWith('student-1', expect.objectContaining({ status: 'interested' }), user));
    expect(await screen.findByRole('status')).toHaveTextContent('Mari: osalemine kinnitatud');
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
