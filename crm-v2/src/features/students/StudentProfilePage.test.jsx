import { render, screen, within } from '@testing-library/react';
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

describe('student profile access and real data sections', () => {
  it('renders schedule and detailed finance history for an administrator', async () => {
    renderProfile({
      invoices: [
        { id: 'i1', num: 'KS-101', date: '2026-08-01', due: '2026-08-10', amountCents: 8000, paidAmountCents: 3000, balanceDueCents: 5000, status: 'Ootel' },
        { id: 'i2', num: 'KS-100', date: '2026-07-01', due: '2026-07-10', amountCents: 4000, paidAmountCents: 4000, balanceDueCents: 0, status: 'Makstud' },
      ],
      schedule: [{ id: 'sc1', date: '2026-08-10', time: '15:00', teacher: 'Pavel' }],
    });
    expect(await screen.findByText('Graafik')).toBeInTheDocument();
    expect(screen.getByText('2026-08-10 · 15:00')).toBeInTheDocument();
    const finance = screen.getByRole('heading', { name: 'Arved ja maksed' }).closest('section, article, div');
    expect(screen.getByText('KS-101')).toBeInTheDocument();
    expect(screen.getByText('KS-100')).toBeInTheDocument();
    expect(screen.getByText('Osaliselt makstud')).toBeInTheDocument();
    expect(screen.getByText('Makstud')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Loo arve/ })).toHaveAttribute('href', '/finance#tunniarvestus');
    expect(within(finance).getByText('50,00 €')).toBeInTheDocument();
  });

  it('shows a clear empty finance state when the student has no invoices', async () => {
    renderProfile();
    expect(await screen.findByText('Õpilasel ei ole veel arveid')).toBeInTheDocument();
    expect(screen.getByText('0,00 €')).toBeInTheDocument();
  });

  it('blocks a teacher from another teacher’s student before loading related data', async () => {
    const apis = renderProfile({ actor: { roles: ['teacher'], displayName: 'Pavel Zakutailo' }, student: { id: 's1', name: 'Mari', teacher: 'Jelena' } });
    expect(await screen.findByText('Ligipääs puudub')).toBeInTheDocument();
    expect(apis.lessonApi.listByStudent).not.toHaveBeenCalled();
    expect(apis.scheduleApi.listByStudent).not.toHaveBeenCalled();
    expect(apis.invoiceApi.listByStudent).not.toHaveBeenCalled();
  });

  it('shows an assigned student to a teacher without loading finance', async () => {
    const apis = renderProfile({ actor: { roles: ['teacher'], displayName: 'Pavel Zakutailo' }, schedule: [{ id: 'sc1', day: 'Mon', time: '12:00' }] });
    expect(await screen.findByText('Mari Maas')).toBeInTheDocument();
    expect(screen.getByText('Iganädalane · Mon · 12:00')).toBeInTheDocument();
    expect(screen.queryByText('Arved ja maksed')).not.toBeInTheDocument();
    expect(apis.invoiceApi.listByStudent).not.toHaveBeenCalled();
  });
});
