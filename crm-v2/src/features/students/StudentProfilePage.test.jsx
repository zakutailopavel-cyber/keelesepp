import { fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, beforeAll, vi } from 'vitest';
import StudentProfilePage from './StudentProfilePage.jsx';

// Invoice fixtures are dated October 2026: pin the clock (Date only) so "partly paid" does not turn into "overdue".
beforeAll(() => { vi.useFakeTimers({ toFake: ['Date'] }); vi.setSystemTime(new Date('2026-10-01T09:00:00Z')); });
afterAll(() => { vi.useRealTimers(); });

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

    expect(await screen.findByRole('tab', { name: 'Ülevaade' }, { timeout: 4000 })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('heading', { name: 'Mari Maas' })).toBeInTheDocument();
    expect(screen.getByText('MM')).toBeInTheDocument();
    expect(screen.getByText('1', { selector: '.student-profile-hero__stats strong' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Põhiandmed' })).toBeInTheDocument();
    expect(screen.queryByText('2026-08-10 · 15:00')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('tab', { name: 'Tunniplaan' }));

    expect(screen.getByRole('tab', { name: 'Tunniplaan' })).toHaveAttribute('aria-selected', 'true');
    expect(await screen.findByText('2026-08-10 · 15:00', {}, { timeout: 4000 })).toBeInTheDocument();
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

    await screen.findByRole('tab', { name: 'Õppetöö' }, { timeout: 4000 });
    expect(screen.queryByText('2026-08-04 · 14:00')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('tab', { name: 'Õppetöö' }));

    expect(await screen.findByText('2026-08-04 · 14:00', {}, { timeout: 4000 })).toBeInTheDocument();
    expect(screen.getByText('Lugemine')).toBeInTheDocument();
    expect(screen.getByText('82%')).toBeInTheDocument();
  });

  it('renders detailed finance history only after an administrator opens the finance tab', async () => {
    renderProfile({
      invoices: [
        { id: 'i1', num: 'KS-101', date: '2026-10-01', due: '2026-10-10', amountCents: 8000, paidAmountCents: 3000, balanceDueCents: 5000, status: 'Ootel' },
        { id: 'i2', num: 'KS-100', date: '2026-07-01', due: '2026-07-10', amountCents: 4000, paidAmountCents: 4000, balanceDueCents: 0, status: 'Makstud' },
      ],
    });

    await screen.findByRole('tab', { name: 'Finantsid' }, { timeout: 4000 });
    expect(screen.queryByText('KS-101')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('tab', { name: 'Finantsid' }));

    const finance = (await screen.findByRole('heading', { name: 'Arved ja maksed' }, { timeout: 4000 })).closest('section');
    expect(await screen.findByText('KS-101', {}, { timeout: 4000 })).toBeInTheDocument();
    expect(screen.getByText('KS-100')).toBeInTheDocument();
    expect(screen.getByText('Osaliselt makstud')).toBeInTheDocument();
    expect(screen.getAllByText('Makstud').length).toBeGreaterThan(0);
    expect(screen.getByRole('link', { name: /Loo arve/ })).toHaveAttribute('href', '/finance#kuuarved');
    expect(within(finance).getAllByText('50,00 €').length).toBeGreaterThan(0);
  });

  it('shows a clear empty finance state in the finance tab', async () => {
    renderProfile();
    await screen.findByRole('tab', { name: 'Finantsid' }, { timeout: 4000 });
    fireEvent.click(screen.getByRole('tab', { name: 'Finantsid' }));

    expect(await screen.findByText('Õpilasel ei ole veel arveid', {}, { timeout: 4000 })).toBeInTheDocument();
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
    expect(await screen.findByText('Iganädalane · Mon · 12:00', {}, { timeout: 4000 })).toBeInTheDocument();
    expect(apis.invoiceApi.listByStudent).not.toHaveBeenCalled();
  });
});
