import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import PayrollPage from './PayrollPage.jsx';

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

function repositories() {
  return {
    teacherRepository: { list: vi.fn().mockResolvedValue([teacher]) },
    timeRepository: {
      listAll: vi.fn().mockResolvedValue({
        sessions: [pendingSession],
        programDays: [{ staffUid: 'teacher-1', activeSeconds: 3600 }],
      }),
      setHourlyRate: vi.fn().mockResolvedValue({}),
      reviewSession: vi.fn().mockResolvedValue({}),
      adjustSession: vi.fn().mockResolvedValue({}),
    },
  };
}

function renderPage(data) {
  render(<MemoryRouter><PayrollPage {...data} /></MemoryRouter>);
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
});
