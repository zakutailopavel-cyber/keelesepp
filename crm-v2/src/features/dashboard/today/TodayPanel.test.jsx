import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import TodayPanel from './TodayPanel.jsx';

const NOW = new Date('2026-11-04T10:40:00Z'); // 12:40 in Tallinn
const DAY = 86400000;

function repository(overrides = {}) {
  return {
    lessons: vi.fn(async () => [{ studentId: 's2', date: '2026-10-28', status: 'Puudus_eta' }, { studentId: 's2', date: '2026-11-02', status: 'Puudus_p' }]),
    seen: vi.fn(async () => new Map()),
    plans: vi.fn(async () => []),
    packages: vi.fn(async () => [{ id: 'p1', studentId: 's1', status: 'active', grantedCredits: 10, consumedCredits: 9, balanceCredits: 1 }]),
    owed: vi.fn(async () => []),
    leads: vi.fn(async () => [{ id: 'l1', status: 'new', name: 'Uus Huviline', language: 'Eesti keel', createdAt: '2026-11-02T08:00:00.000Z' }]),
    worksheetsDue: vi.fn(async () => [{ id: 'w1', studentId: 's1', dueDate: '2026-11-01', status: 'new' }]),
    followups: vi.fn(async () => []),
    addFollowup: vi.fn(async ({ student, note }) => ({ id: 'f1', studentId: student.id, note, byName: 'Pavel', at: NOW.toISOString() })),
    ...overrides,
  };
}
const students = [{ id: 's1', name: 'Mari', teacher: 'Kati', active: true }, { id: 's2', name: 'Jaan', teacher: 'Mart', active: true, phone: '+372 5555 5555' }];
const events = [
  { id: 'a', date: '2026-11-04', time: '12:30', duration: 60, studentId: 's1', studentName: 'Mari', teacher: 'Kati', online: true, status: 'Planeeritud' },
  { id: 'b', recurring: true, day: 'Wed', startDate: '2026-09-02', time: '16:00', duration: 45, studentId: 's2', studentName: 'Jaan', teacher: 'Mart', roomName: 'Klass 2', status: 'Planeeritud' },
];

function renderPanel(props = {}) {
  return render(<MemoryRouter><TodayPanel user={{ uid: 'admin-1', displayName: 'Pavel' }} isAdmin canViewBalance students={students} events={events}
    homework={[]} submissions={[{ studentId: 's2', reviewStatus: 'pending' }]} invoices={[]} today="2026-11-04" now={() => NOW} {...props} /></MemoryRouter>);
}

describe('TodayPanel', () => {
  it('shows the day: lessons with a start link, homework per teacher, leads, packages running out and who needs a call', async () => {
    const repo = repository();
    renderPanel({ repository: repo });
    const lessons = screen.getByRole('heading', { name: /Tänased tunnid \(2\)/ }).closest('.card');
    expect(within(lessons).getByText('Käib')).toBeInTheDocument();
    expect(within(lessons).getByText(/Kati · Veebitund/)).toBeInTheDocument();
    expect(within(lessons).getByText(/Mart · Klass 2/)).toBeInTheDocument();
    expect(within(lessons).getAllByRole('link', { name: /Alusta tundi/ })[0]).toHaveAttribute('href', `/calendar?lesson=${encodeURIComponent('a:2026-11-04|2026-11-04')}`);

    const table = await screen.findByRole('table', { name: 'Kodutööd õpetajate kaupa' });
    expect(within(table).getByText('Kati').closest('tr')).toHaveTextContent('Kati01');
    expect(within(table).getByText('Mart').closest('tr')).toHaveTextContent('Mart10');
    expect(repo.worksheetsDue).toHaveBeenCalledWith('2026-10-05', '2026-11-03');

    expect(screen.getByText('Uus Huviline')).toBeInTheDocument();
    expect(screen.getByText(/Eesti keel · 2 päeva tagasi/)).toBeInTheDocument();
    expect(screen.getByText('Paketist alles 1 tund')).toBeInTheDocument();

    const calls = screen.getByRole('heading', { name: /Vajab kõnet/ }).closest('.card');
    expect(within(calls).getByText('2 puudumist 3 nädalaga')).toBeInTheDocument();
    expect(within(calls).queryByText('Mari')).not.toBeInTheDocument(); // booked, no signals
  });

  it('„Helistasin” saves a short note and moves the student to the called list', async () => {
    const repo = repository();
    renderPanel({ repository: repo });
    const calls = screen.getByRole('heading', { name: /Vajab kõnet/ }).closest('.card');
    fireEvent.click(await within(calls).findByRole('button', { name: 'Helistasin' }));
    fireEvent.change(within(calls).getByLabelText('Märkus kõne kohta'), { target: { value: 'ema helistab reedel' } });
    fireEvent.click(within(calls).getByRole('button', { name: 'Salvesta' }));
    await waitFor(() => expect(repo.addFollowup).toHaveBeenCalledWith(expect.objectContaining({ note: 'ema helistab reedel', student: expect.objectContaining({ id: 's2' }) }), expect.objectContaining({ uid: 'admin-1' })));
    expect(await within(calls).findByText(/Helistatud viimase 14 päeva jooksul \(1\)/)).toBeInTheDocument();
    expect(within(calls).getByText(/ema helistab reedel/)).toBeInTheDocument();
    expect(within(calls).getByText('Praegu ei vaja keegi kõnet.')).toBeInTheDocument();
  });

  it('a failing source leaves only its own section empty', async () => {
    renderPanel({ repository: repository({ leads: vi.fn(async () => { throw new Error('no access'); }), lessons: vi.fn(async () => { throw new Error('x'); }) }) });
    expect(await screen.findByText('Andmeid ei saanud praegu laadida.')).toBeInTheDocument();
    expect(screen.getByText('Paketist alles 1 tund')).toBeInTheDocument();
  });

  it('an accountant sees only the packages running out; no learning data is read', async () => {
    const repo = repository();
    renderPanel({ isAdmin: false, canViewBalance: true, students: [], events: [], repository: repo });
    expect(await screen.findByText('Paketist alles 1 tund')).toBeInTheDocument();
    expect(screen.queryByText(/Tänased tunnid/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Vajab kõnet/)).not.toBeInTheDocument();
    ['lessons', 'seen', 'plans', 'leads', 'worksheetsDue', 'followups'].forEach((name) => expect(repo[name]).not.toHaveBeenCalled());
  });

  it('a teacher sees nothing', () => {
    const { container } = renderPanel({ isAdmin: false, canViewBalance: false, repository: repository() });
    expect(container).toBeEmptyDOMElement();
  });

  it('a call older than 14 days does not hide the student', async () => {
    renderPanel({ repository: repository({ followups: vi.fn(async () => [{ studentId: 's2', at: new Date(NOW.getTime() - 20 * DAY).toISOString(), note: 'vana' }]) }) });
    const calls = screen.getByRole('heading', { name: /Vajab kõnet/ }).closest('.card');
    expect(await within(calls).findByText('Jaan')).toBeInTheDocument();
  });
});
