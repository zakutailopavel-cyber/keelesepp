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
    expect(dataRepositories.homework.list).not.toHaveBeenCalled();
    expect(dataRepositories.invoices.list).not.toHaveBeenCalled();
    expect(screen.queryByText('Laekumata')).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /tähtaja ületanud arvet/i })).not.toBeInTheDocument();
  });

  it('loads only invoice data for a finance user', async () => {
    const dataRepositories = repositories();
    renderDashboard({ uid: 'finance-1', displayName: 'Finants', roles: ['finance'] }, dataRepositories);

    expect(await screen.findByText('Laekumata')).toBeInTheDocument();
    expect(dataRepositories.invoices.list).toHaveBeenCalledTimes(1);
    expect(dataRepositories.students.list).not.toHaveBeenCalled();
    expect(dataRepositories.schedule.list).not.toHaveBeenCalled();
    expect(dataRepositories.homework.list).not.toHaveBeenCalled();
    expect(dataRepositories.homework.listByStudentIds).not.toHaveBeenCalled();
    expect(screen.queryByText('Aktiivsed õpilased')).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: /tähtaja ületanud arvet/i })).toHaveAttribute('href', '/finance');
  });
});
