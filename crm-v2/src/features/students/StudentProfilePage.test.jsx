import { fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { vi } from 'vitest';
import StudentProfilePage from './StudentProfilePage.jsx';

function renderProfile({
  actor = { roles: ['admin'], displayName: 'Admin' },
  student = { id: 's1', name: 'Mari Maas', teacher: 'Pavel', active: true, skillMap: {} },
  lessons = [],
  invoices = [],
  schedule = [],
} = {}) {
  const apis = {
    studentApi: { getById: vi.fn().mockResolvedValue(student), update: vi.fn() },
    lessonApi: { listByStudent: vi.fn().mockResolvedValue(lessons) },
    invoiceApi: { listByStudent: vi.fn().mockResolvedValue(invoices) },
    scheduleApi: { listByStudent: vi.fn().mockResolvedValue(schedule) },
  };
  render(
    <MemoryRouter initialEntries={['/students/s1']}>
      <Routes>
        <Route path="/students/:studentId" element={<StudentProfilePage {...apis} actor={actor} />} />
      </Routes>
    </MemoryRouter>,
  );
  return apis;
}

describe('student profile tabs and role access', () => {
  it('shows a concise overview first and switches to the schedule tab', async () => {
    renderProfile({
      schedule: [{ id: 'sc1', date: '2026-08-10', time: '15:00', teacher: 'Pavel' }],
    });

    expect(await screen.findByRole('tab', { name: 'Ülevaade' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('heading', { name: 'Põhiandmed' })).toBeInTheDocument();
    expect(screen.queryByText('2026-08-10 · 15:00')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('tab', { name: 'Tunniplaan' }));

    expect(screen.getByRole('tab', { name: 'Tunniplaan' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByText('2026-08-10 · 15:00')).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Põhiandmed' })).not.toBeInTheDocument();
  });

  it('shows lessons and progress only inside the learning tab', async () => {
    renderProfile({
      student: {
        id: 's1',
        name: 'Mari Maas',
        teacher: 'Pavel',
        active: true,
        skillMap: { Lugemine: 82 },
      },
      lessons: [{ id: 'l1', date: '2026-08-04', time: '14:00', status: 'Toimunud', subject: 'Eesti keel' }],
    });

    await screen.findByRole('tab', { name: 'Õppetöö' });
    expect(screen.queryByText('2026-08-04 · 14:00')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('tab', { name: 'Õppetöö' }));

    expect(screen.getByText('2026-08-04 · 14:00')).toBeInTheDocument();
    expect(screen.getByText('Lugemine')).toBeInTheDocument();
    expect(screen.getByText('82%')).toBeInTheDocument();
  });

  it('renders detailed finance history only after an administrator opens the finance tab', async () => {
    renderProfile({
      invoices: [
        { id: 'i1', num: 'KS-101', date: '2026-08-01', due: '2026-08-10', amountCents: 8000, paidAmountCents: 3000, balanceDueCents: 5000, status: 'Ootel' },
        { id: 'i2', num: 'KS-100', date: '2026-07-01', due: '2026-07-10', amountCents: 4000, paidAmountCents: 4000, balanceDueCents: 0, status: 'Makstud' },
      ],
    });

    await screen.findByRole('tab', { name: 'Finantsid' });
    expect(screen.queryByText('KS-101')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('tab', { name: 'Finantsid' }));

    const finance = screen.getByRole('heading', { name: 'Arved ja maksed' }).closest('section, article, div');
    expect(screen.getByText('KS-101')).toBeInTheDocument();
    expect(screen.getByText('KS-100')).toBeInTheDocument();
    expect(screen.getByText('Osaliselt makstud')).toBeInTheDocument();
    expect(screen.getByText('Makstud')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Loo arve/ })).toHaveAttribute('href', '/finance#tunniarvestus');
    expect(within(finance).getByText('50,00 €')).toBeInTheDocument();
  });

  it('shows a clear empty finance state in the finance tab', async () => {
    renderProfile();
    await screen.findByRole('tab', { name: 'Finantsid' });
    fireEvent.click(screen.getByRole('tab', { name: 'Finantsid' }));

    expect(screen.getByText('Õpilasel ei ole veel arveid')).toBeInTheDocument();
    expect(screen.getAllByText('0,00 €')).toHaveLength(3);
  });

  it('blocks a teacher from another teacher’s student before loading related data', async () => {
    const apis = renderProfile({
      actor: { roles: ['teacher'], displayName: 'Pavel Zakutailo' },
      student: { id: 's1', name: 'Mari', teacher: 'Jelena' },
    });

    expect(await screen.findByText('Ligipääs puudub')).toBeInTheDocument();
    expect(apis.lessonApi.listByStudent).not.toHaveBeenCalled();
    expect(apis.scheduleApi.listByStudent).not.toHaveBeenCalled();
    expect(apis.invoiceApi.listByStudent).not.toHaveBeenCalled();
  });

  it('shows an assigned student to a teacher without exposing the finance tab', async () => {
    const apis = renderProfile({
      actor: { roles: ['teacher'], displayName: 'Pavel Zakutailo' },
      schedule: [{ id: 'sc1', day: 'Mon', time: '12:00' }],
    });

    expect(await screen.findByText('Mari Maas')).toBeInTheDocument();
    expect(screen.queryByRole('tab', { name: 'Finantsid' })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('tab', { name: 'Tunniplaan' }));
    expect(screen.getByText('Iganädalane · Mon · 12:00')).toBeInTheDocument();
    expect(apis.invoiceApi.listByStudent).not.toHaveBeenCalled();
  });
});
