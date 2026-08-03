import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
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
  it('renders schedule and finance for an administrator', async () => {
    renderProfile({
      invoices: [{ id: 'i1', amountCents: 8000, paidAmountCents: 0, status: 'Ootel' }],
      schedule: [{ id: 'sc1', date: '2026-08-10', time: '15:00', teacher: 'Pavel' }],
    });
    expect(await screen.findByText('Graafik')).toBeInTheDocument();
    expect(screen.getByText('2026-08-10 · 15:00')).toBeInTheDocument();
    expect(screen.getByText('Finantsseis')).toBeInTheDocument();
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
    expect(screen.queryByText('Finantsseis')).not.toBeInTheDocument();
    expect(apis.invoiceApi.listByStudent).not.toHaveBeenCalled();
  });
});
