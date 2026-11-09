import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import PayrollPage from './PayrollPage.jsx';

vi.mock('../../app/AuthContext.jsx', () => ({ useAuth: () => ({ user: { uid: 'admin-1', displayName: 'Admin', roles: ['admin'] } }) }));

const teacher = {
  id: 'teacher-1',
  name: 'Pavel Õpetaja',
  email: 'teacher@example.com',
  workHourlyRateCents: 2000,
};

const pendingSession = {
  id: 'session-1',
  staffUid: 'teacher-1',
  staffName: 'Pavel Õpetaja',
  startedAt: '2026-08-03T08:00:00.000Z',
  endedAt: '2026-08-03T10:00:00.000Z',
  durationMinutes: 120,
  breakMinutes: 0,
  status: 'closed',
  approvalStatus: 'pending',
};

function repositories({ payouts = [], approved = false } = {}) {
  return {
    lessonRepository: { load: vi.fn().mockResolvedValue({ teachers: [teacher], students: [], schedule: [], groups: [], lessons: [] }) },
    payoutRepository: {
      listMonth: vi.fn().mockResolvedValue(payouts),
      mark: vi.fn().mockResolvedValue({}),
      cancel: vi.fn().mockResolvedValue({}),
    },
    teacherRepository: { list: vi.fn().mockResolvedValue([teacher]) },
    timeRepository: {
      listAll: vi.fn().mockResolvedValue({
        sessions: approved ? [{ ...pendingSession, approvalStatus: 'approved', payAmountCents: 82000 }] : [pendingSession],
        programDays: [{ staffUid: 'teacher-1', activeSeconds: 3600 }],
      }),
      setHourlyRate: vi.fn().mockResolvedValue({}),
      reviewSession: vi.fn().mockResolvedValue({}),
      adjustSession: vi.fn().mockResolvedValue({}),
    },
  };
}

function renderPage(data) {
  render(<MemoryRouter><PayrollPage now={new Date('2026-11-09T10:00:00Z')} {...data} /></MemoryRouter>);
}

describe('PayrollPage', () => {
  it('approves a pending work session with a snapshotted hourly rate', async () => {
    const data = repositories();
    renderPage(data);
    expect(await screen.findByText('Pavel Õpetaja')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Kinnita/ }));
    const dialog = screen.getByRole('dialog', { name: 'Kinnita tööaja kirje' });
    expect(within(dialog).getByLabelText('Tunnitasu (€)')).toHaveValue('20');
    fireEvent.change(within(dialog).getByLabelText('Administraatori märkus'), { target: { value: 'Augusti kontroll' } });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Kinnita ja arvuta tasu' }));
    await waitFor(() => expect(data.timeRepository.reviewSession).toHaveBeenCalledWith(
      'session-1',
      'approve',
      { reason: 'Augusti kontroll', hourlyRate: '20' },
    ));
    expect(await screen.findByRole('status')).toHaveTextContent('tasu arvutati');
  });

  it('requires a rejection reason before sending the decision', async () => {
    const data = repositories();
    renderPage(data);
    await screen.findByText('Pavel Õpetaja');
    fireEvent.click(screen.getByRole('button', { name: /Lükka tagasi/ }));
    const dialog = screen.getByRole('dialog', { name: 'Lükka tööaja kirje tagasi' });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Lükka tagasi' }));
    expect(await within(dialog).findByRole('alert')).toHaveTextContent('põhjus');
    expect(data.timeRepository.reviewSession).not.toHaveBeenCalled();
    fireEvent.change(within(dialog).getByLabelText('Tagasilükkamise põhjus'), { target: { value: 'Puuduv tööpäeva märkus' } });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Lükka tagasi' }));
    await waitFor(() => expect(data.timeRepository.reviewSession).toHaveBeenCalledWith(
      'session-1',
      'reject',
      { reason: 'Puuduv tööpäeva märkus', hourlyRate: '' },
    ));
  });

  it('sends an audited correction and returns the session to review', async () => {
    const data = repositories();
    renderPage(data);
    await screen.findByText('Pavel Õpetaja');
    fireEvent.click(screen.getByRole('button', { name: /Paranda/ }));
    const dialog = screen.getByRole('dialog', { name: 'Paranda tööaega: Pavel Õpetaja' });
    fireEvent.change(within(dialog).getByLabelText('Paus (min)'), { target: { value: '15' } });
    fireEvent.change(within(dialog).getByLabelText('Märkus'), { target: { value: 'Koosolek' } });
    fireEvent.change(within(dialog).getByLabelText('Paranduse põhjus'), { target: { value: 'Paus jäi märkimata' } });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Salvesta parandus' }));
    await waitFor(() => expect(data.timeRepository.adjustSession).toHaveBeenCalledWith(
      'session-1',
      expect.objectContaining({
        breakMinutes: 15,
        note: 'Koosolek',
        reason: 'Paus jäi märkimata',
        startedAt: expect.stringMatching(/^2026-08-03T08:00:00\.000Z$/),
        endedAt: expect.stringMatching(/^2026-08-03T10:00:00\.000Z$/),
      }),
    ));
    expect(await screen.findByRole('status')).toHaveTextContent('uuesti kinnitamisele');
  });

  it('updates the future hourly rate without changing approved history', async () => {
    const data = repositories();
    renderPage(data);
    await screen.findByText('Pavel Õpetaja');
    fireEvent.click(screen.getByRole('button', { name: /20,00/ }));
    const dialog = screen.getByRole('dialog', { name: 'Tunnitasu: Pavel Õpetaja' });
    fireEvent.change(within(dialog).getByLabelText('Tunnitasu (€)'), { target: { value: '22,50' } });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Salvesta tunnitasu' }));
    await waitFor(() => expect(data.timeRepository.setHourlyRate).toHaveBeenCalledWith('teacher-1', '22,50'));
  });

  it('shows one pay figure with the lesson check and marks the month paid', async () => {
    const data = repositories({ approved: true });
    renderPage(data);
    await screen.findByText('Pavel Õpetaja');
    expect(data.lessonRepository.load).toHaveBeenCalledWith(expect.objectContaining({ lessonsOnly: true, today: '2026-11-09', period: expect.objectContaining({ from: '2026-11-01', to: '2026-11-30' }) }));
    expect(screen.getAllByText('Väljamaksmisele')[0].nextSibling).toHaveTextContent('820,00');
    expect(screen.getByRole('note')).toHaveTextContent('Erinevus 820,00');
    expect(screen.getByLabelText('Kuu väljamaksed')).toHaveTextContent(/Maksmata\s*820,00/);
    fireEvent.click(screen.getByRole('button', { name: 'Märgi makstuks: Pavel Õpetaja' }));
    const dialog = screen.getByRole('dialog', { name: 'Märgi makstuks: Pavel Õpetaja' });
    expect(within(dialog).getByLabelText('Makstud summa (€)')).toHaveValue('820,00');
    expect(within(dialog).getByLabelText('Maksmise kuupäev')).toHaveValue('2026-11-09');
    fireEvent.change(within(dialog).getByLabelText('Makseviis'), { target: { value: 'sularaha' } });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Märgi makstuks' }));
    await waitFor(() => expect(data.payoutRepository.mark).toHaveBeenCalledWith(
      { teacher, month: '2026-11', value: { amountCents: 82000, paidAt: '2026-11-09', method: 'sularaha', note: '' } },
      expect.objectContaining({ uid: 'admin-1' }),
    ));
    expect(await screen.findByRole('status')).toHaveTextContent('märgiti makstuks');
  });

  it('shows a paid mark and undoes it only with a reason', async () => {
    const data = repositories({ approved: true, payouts: [{ id: '2026-11_teacher-1', teacherUid: 'teacher-1', month: '2026-11', status: 'paid', amountCents: 82000, paidAt: '2026-11-05', method: 'pank' }] });
    renderPage(data);
    expect(await screen.findByText('Makstud 05.11 · 820,00 €')).toBeInTheDocument();
    expect(screen.getByLabelText('Kuu väljamaksed')).toHaveTextContent(/Makstud\s*820,00/);
    fireEvent.click(screen.getByRole('button', { name: /Tühista märge/ }));
    const dialog = screen.getByRole('dialog', { name: 'Tühista märge: Pavel Õpetaja' });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Tühista märge' }));
    expect(await within(dialog).findByRole('alert')).toHaveTextContent('põhjus');
    expect(data.payoutRepository.cancel).not.toHaveBeenCalled();
    fireEvent.change(within(dialog).getByLabelText('Tühistamise põhjus'), { target: { value: 'Vale summa' } });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Tühista märge' }));
    await waitFor(() => expect(data.payoutRepository.cancel).toHaveBeenCalledWith(
      { teacherUid: 'teacher-1', teacherName: 'Pavel Õpetaja', month: '2026-11', reason: 'Vale summa' },
      expect.objectContaining({ uid: 'admin-1' }),
    ));
  });

  it('keeps the page working when the marks cannot be read (rules not deployed) and hides the mark action', async () => {
    const data = repositories({ approved: true });
    data.payoutRepository.listMonth.mockRejectedValue(new Error('permission-denied'));
    data.lessonRepository.load.mockRejectedValue(new Error('offline'));
    renderPage(data);
    await screen.findByText('Pavel Õpetaja');
    expect(screen.getByRole('alert')).toHaveTextContent('märkeid ei õnnestunud lugeda');
    expect(screen.queryByRole('button', { name: /Märgi makstuks/ })).not.toBeInTheDocument();
    expect(screen.getByText(/Antud tundide andmeid ei õnnestunud lugeda/)).toBeInTheDocument();
  });

  it('downloads the month as CSV', async () => {
    const data = repositories({ approved: true });
    const created = vi.fn(() => 'blob:x');
    globalThis.URL.createObjectURL = created;
    globalThis.URL.revokeObjectURL = vi.fn();
    const click = vi.spyOn(globalThis.HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
    renderPage(data);
    await screen.findByText('Pavel Õpetaja');
    fireEvent.click(screen.getByRole('button', { name: /Laadi CSV/ }));
    expect(created).toHaveBeenCalledTimes(1);
    expect(click).toHaveBeenCalledTimes(1);
    click.mockRestore();
  });
});
