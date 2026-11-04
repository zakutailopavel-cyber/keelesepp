import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import { AuthContext } from '../../app/AuthContext.jsx';
import DashboardPage from './DashboardPage.jsx';

function repositories() {
  return {
    students: {
      list: vi.fn().mockResolvedValue({ items: [{ id: 'student-1', name: 'Mari', active: true }] }),
    },
    schedule: {
      list: vi.fn().mockResolvedValue([{ id: 'lesson-1', date: '2099-08-10', time: '10:00', duration: 60, status: 'Planeeritud', studentName: 'Mari' }]),
    },
    invoices: {
      list: vi.fn().mockResolvedValue([{ id: 'invoice-1', amountCents: 10000, balanceDueCents: 10000, due: '2020-01-01', status: 'Ootel' }]),
    },
    homework: {
      list: vi.fn().mockResolvedValue([{ id: 'homework-1', status: 'Ootel' }]),
      listByStudentIds: vi.fn().mockResolvedValue([{ id: 'homework-1', status: 'Ootel' }]),
    },
  };
}

function renderDashboard(user, dataRepositories) {
  render(
    <MemoryRouter>
      <AuthContext.Provider value={{ user }}>
        <DashboardPage repositories={dataRepositories} />
      </AuthContext.Provider>
    </MemoryRouter>,
  );
}

describe('DashboardPage role scoping', () => {
  it('loads only teacher-owned learning data and never requests finance data', async () => {
    const dataRepositories = repositories();
    renderDashboard({ uid: 'teacher-1', displayName: 'Pavel', roles: ['teacher'] }, dataRepositories);

    expect(await screen.findByText('Aktiivsed õpilased')).toBeInTheDocument();
    await waitFor(() => expect(dataRepositories.students.list).toHaveBeenCalledWith(expect.objectContaining({ scopeTeacherUid: 'teacher-1' })));
    expect(dataRepositories.schedule.list).toHaveBeenCalledWith({ teacherUid: 'teacher-1' });
    expect(dataRepositories.homework.listByStudentIds).toHaveBeenCalledWith(['student-1']);
    expect(dataRepositories.students.list).toHaveBeenCalledWith(expect.objectContaining({ status: 'active' }));
    expect(dataRepositories.homework.list).not.toHaveBeenCalled();
    expect(dataRepositories.invoices.list).not.toHaveBeenCalled();
    expect(screen.queryByText('Laekumata')).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /tähtaja ületanud arvet/i })).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Ava tänane kalender/i })).toHaveAttribute('href', '/calendar');
    expect(screen.getByRole('region', { name: 'Kiirvalikud' })).toBeInTheDocument();
  });

  it('loads only invoice data for a finance user', async () => {
    const dataRepositories = repositories();
    renderDashboard({ uid: 'finance-1', displayName: 'Finants', roles: ['finance'] }, dataRepositories);

    expect(await screen.findByText('Laekumata')).toBeInTheDocument();
    expect(screen.getByText(/^kõik kuud · 1 tähtaja ületanud/)).toBeInTheDocument();
    expect(dataRepositories.invoices.list).toHaveBeenCalledTimes(1);
    expect(dataRepositories.students.list).not.toHaveBeenCalled();
    expect(dataRepositories.schedule.list).not.toHaveBeenCalled();
    expect(dataRepositories.homework.list).not.toHaveBeenCalled();
    expect(dataRepositories.homework.listByStudentIds).not.toHaveBeenCalled();
    expect(screen.queryByText('Aktiivsed õpilased')).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: /tähtaja ületanud arvet/i })).toHaveAttribute('href', '/finance?status=overdue');
    expect(screen.queryByRole('link', { name: /Ava tänane kalender/i })).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Finantsid.*Arved, maksed ja kontroll/i })).toHaveAttribute('href', '/finance');
  });

  it('counts „Kodutööd pooleli” and the works waiting for review like the Kodutööd page: active students only', async () => {
    const dataRepositories = repositories();
    dataRepositories.students.list.mockImplementation(async ({ status }) => ({ items: [{ id: 's1', name: 'Mari', active: true }, ...(status === 'active' ? [] : [{ id: 'archived', name: 'Vana', active: false }])] }));
    dataRepositories.homework.list.mockResolvedValue([{ id: 'h1', studentId: 's1', status: 'Ootel' }, { id: 'h2', studentId: 'archived', status: 'Ootel' }]);
    dataRepositories.homework.listSubmissionsByStudentIds = vi.fn().mockResolvedValue([{ id: 'w1', reviewStatus: 'pending' }, { id: 'w2', reviewStatus: 'pending' }, { id: 'w3', reviewStatus: 'reviewed' }]);
    renderDashboard({ uid: 'admin-1', displayName: 'Pavel', roles: ['admin'] }, dataRepositories);
    expect(await screen.findByRole('link', { name: /2 tööd ootavad kontrolli/ })).toHaveAttribute('href', '/homework');
    expect(dataRepositories.homework.listSubmissionsByStudentIds).toHaveBeenCalledWith(['s1']);
    expect(screen.getByText('Kodutööd pooleli').closest('article')).toHaveTextContent('1');
  });

  it('counts like the pages do: people in Õpilased, weekly lessons of today, homework of known students', async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-10-05T08:00:00'));
    try {
      const dataRepositories = repositories();
      dataRepositories.students.list.mockResolvedValue({ items: [
        { id: 's1', name: 'Mari Maas', parentEmail: 'ema@example.com', active: true },
        { id: 's1b', name: 'Mari Maas', parentEmail: 'ema@example.com', active: true, subject: 'Inglise keel' },
        { id: 's2', name: 'Jaan', active: true },
      ] });
      dataRepositories.schedule.list.mockResolvedValue([
        { id: 'w1', recurring: true, day: 'Mon', startDate: '2026-09-07', time: '16:00', duration: 60, status: 'Planeeritud', studentName: 'Mari' },
        { id: 'o1', date: '2026-10-05', time: '07:00', duration: 60, status: 'Planeeritud', studentName: 'Jaan' },
        { id: 'o2', date: '2026-10-06', time: '10:00', duration: 60, status: 'Planeeritud', studentName: 'Jaan' },
      ]);
      dataRepositories.groups = { list: vi.fn().mockResolvedValue([{ id: 'g1', name: 'A1 grupp', students: ['s2'], lessons: [{ id: 'gl1', day: 'Mon', startDate: '2026-09-07', time: '17:00' }] }]) };
      dataRepositories.homework.list.mockResolvedValue([{ id: 'h1', studentId: 's1', status: 'Ootel' }, { id: 'h2', studentId: 'gone', status: 'Ootel' }, { id: 'h3', studentId: 's2', status: 'Tehtud' }]);
      renderDashboard({ uid: 'admin-1', displayName: 'Pavel', roles: ['admin'] }, dataRepositories);
      const tile = (label) => screen.getByText(label).closest('article');
      expect(await screen.findByText('Tunnid täna')).toBeInTheDocument();
      expect(tile('Tunnid täna')).toHaveTextContent('3');
      expect(tile('Tunnid täna')).toHaveTextContent('2 veel ees · kõik õpetajad');
      expect(tile('Aktiivsed õpilased')).toHaveTextContent('2');
      expect(tile('Kodutööd pooleli')).toHaveTextContent('1');
      expect(screen.getByText('Mari')).toBeInTheDocument();
      expect(screen.getByText('A1 grupp')).toBeInTheDocument();
    } finally {
      vi.useRealTimers();
    }
  });

  it('„Täna” is the admin\'s: a teacher never gets it, the admin gets it with today\'s lessons in it', async () => {
    const teacherRepositories = repositories();
    const { unmount } = render(<MemoryRouter><AuthContext.Provider value={{ user: { uid: 'teacher-1', displayName: 'Kati', roles: ['teacher'] } }}><DashboardPage repositories={teacherRepositories} /></AuthContext.Provider></MemoryRouter>);
    expect(await screen.findByText('Aktiivsed õpilased')).toBeInTheDocument();
    expect(screen.queryByRole('region', { name: 'Täna' })).not.toBeInTheDocument();
    unmount();
    const adminRepositories = repositories();
    const today = { lessons: vi.fn(async () => []), seen: vi.fn(async () => new Map()), plans: vi.fn(async () => []), packages: vi.fn(async () => []), owed: vi.fn(async () => []), leads: vi.fn(async () => []), worksheetsDue: vi.fn(async () => []), followups: vi.fn(async () => []), addFollowup: vi.fn() };
    renderDashboard({ uid: 'admin-1', displayName: 'Pavel', roles: ['admin'] }, { ...adminRepositories, today, retention: { lessons: vi.fn(async () => []), words: vi.fn(async () => []) } });
    expect(await screen.findByRole('region', { name: 'Täna' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Märkimata tunnid/ })).toHaveAttribute('href', '#markimata-tunnid');
    expect(screen.queryByText('Järgmised tunnid täna')).not.toBeInTheDocument();
    await waitFor(() => expect(today.leads).toHaveBeenCalled());
  });
});
