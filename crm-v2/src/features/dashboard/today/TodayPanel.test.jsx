import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import { BalancePanel, CallsPanel, HomeworkPanel, LeadsPanel, TodayTimeline } from './TodayPanel.jsx';
import { todayLessons } from './todayModel.js';

const events = ['08:00', '09:00', '12:30', '13:00', '14:00', '15:00', '16:00'].map((time, index) => ({ id: `e${index}`, date: '2026-11-04', time, duration: 45, studentId: `s${index}`, studentName: `Õpilane ${index}`, teacher: 'Kati', online: index === 2, status: 'Planeeritud' }));
const lessons = todayLessons({ events, today: '2026-11-04', now: '12:40' });
const wrap = (ui) => render(<MemoryRouter>{ui}</MemoryRouter>);

describe('TodayTimeline', () => {
  it('shows the next 3 lessons, the ones over folded; „Näita kõiki” opens the whole day', () => {
    wrap(<TodayTimeline lessons={lessons} allTeachers />);
    const region = screen.getByRole('region', { name: 'Täna' });
    expect(within(region).getAllByRole('listitem')).toHaveLength(3);
    expect(within(region).getByText('Õpilane 2')).toBeInTheDocument();
    expect(within(region).queryByText('Õpilane 0')).not.toBeInTheDocument();
    expect(within(region).queryByText('Õpilane 6')).not.toBeInTheDocument();
    expect(within(region).getByText('Käib')).toBeInTheDocument();
    expect(within(region).getAllByRole('link', { name: /Alusta tundi/ })[0]).toHaveAttribute('href', `/calendar?lesson=${encodeURIComponent('e2:2026-11-04|2026-11-04')}`);
    expect(within(region).getByText('Läbi 2')).toBeInTheDocument();

    fireEvent.click(within(region).getByRole('button', { name: 'Näita kõiki (7)' }));
    expect(within(region).getByText('Õpilane 6')).toBeInTheDocument();
    expect(within(region).getByText('Läbi (2)').closest('details')).not.toHaveAttribute('open');
    expect(within(region).getByRole('button', { name: 'Näita vähem' })).toHaveAttribute('aria-expanded', 'true');
  });

  it('empty day and a day that is over', () => {
    const { unmount } = wrap(<TodayTimeline lessons={[]} />);
    expect(screen.getByText('Täna tunde ei ole.')).toBeInTheDocument();
    unmount();
    wrap(<TodayTimeline lessons={todayLessons({ events, today: '2026-11-04', now: '23:00' })} />);
    expect(screen.getByText('Tänased tunnid on läbi.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Näita kõiki (7)' })).toBeInTheDocument();
  });
});

describe('TodayTimeline — what each lesson needs (owner 2026-11-24)', () => {
  const day = todayLessons({ events, today: '2026-11-04', now: '12:40' });
  it('a lesson ahead says which sheet is on the board, or that none is chosen; „Veebitund” is gone', async () => {
    const sheets = { listPreparedWorksheets: vi.fn(async (id) => (id === day.find((item) => item.phase === 'later').studentId ? [{ id: 'w', lessonTitle: 'Räägin ja põhjendan' }] : [])) };
    wrap(<TodayTimeline lessons={day} sheetsService={sheets} />);
    const region = screen.getByRole('region', { name: 'Täna' });
    expect(await within(region).findByText(/Räägin ja põhjendan · leht tahvlil/)).toBeInTheDocument();
    expect(within(region).queryByText('Veebitund')).not.toBeInTheDocument();
  });
  it('a lesson over and not marked comes to the top with „Toimus”; one tap marks it', async () => {
    const mark = { markHeld: vi.fn(async () => ({})) };
    wrap(<TodayTimeline lessons={day} user={{ uid: 'u' }} markService={mark} sheetsService={{ listPreparedWorksheets: async () => [] }} />);
    const region = screen.getByRole('region', { name: 'Täna' });
    const list = within(region).getByRole('list', { name: 'Märkimata' });
    const buttons = within(list).getAllByRole('button', { name: 'Toimus' });
    fireEvent.click(buttons[0]);
    await waitFor(() => expect(mark.markHeld).toHaveBeenCalledTimes(1));
    expect(mark.markHeld.mock.calls[0][0].source).toBeTruthy();
    await waitFor(() => expect(within(region).getAllByRole('button', { name: 'Toimus' })).toHaveLength(buttons.length - 1));
  });
});

describe('TodayTimeline — cancelled and missed lessons (owner 2026-11-28)', () => {
  const day = [
    { id: 'olivia', recurring: true, day: 'Sat', startDate: '2026-10-10', time: '10:00', duration: 60, studentId: 'o', studentName: 'Olivia', teacher: 'Yelyzaveta', online: true, status: 'Planeeritud' },
    { id: 'aleksandra', recurring: true, day: 'Sat', startDate: '2026-11-14', time: '11:00', duration: 60, studentId: 'a', studentName: 'Aleksandra', teacher: 'Yelyzaveta', online: true, status: 'Planeeritud' },
    { id: 'mari', date: '2026-11-28', time: '12:00', duration: 60, studentId: 'm', studentName: 'Mari', teacher: 'Kati', status: 'Planeeritud', occurrenceStatuses: {} },
    { id: 'jaan', recurring: true, day: 'Sat', startDate: '2026-10-10', time: '10:30', duration: 60, studentId: 'j', studentName: 'Jaan', teacher: 'Kati', status: 'Planeeritud', occurrenceStatuses: { '2026-11-28': { status: 'Tühistatud' } } },
  ];
  const records = [
    { id: 'r1', scheduleId: 'olivia', studentId: 'o', date: '2026-11-28', status: 'Puudus_p' },
    { id: 'r2', scheduleId: 'aleksandra', studentId: 'a', date: '2026-11-28', status: 'Puudus_p' },
  ];
  it('no „Käib” or „Alusta tundi” for them; the lesson really ahead takes the top', () => {
    wrap(<TodayTimeline lessons={todayLessons({ events: day, today: '2026-11-28', now: '10:20', records })} allTeachers sheetsService={{ listPreparedWorksheets: async () => [] }} />);
    const region = screen.getByRole('region', { name: 'Täna' });
    expect(within(region).queryByText('Käib')).not.toBeInTheDocument();
    expect(within(region).getAllByRole('listitem').map((item) => item.textContent)).toEqual([expect.stringContaining('Mari')]);
    expect(within(region).getAllByRole('link', { name: /Alusta tundi/ })).toHaveLength(1);
    fireEvent.click(within(region).getByRole('button', { name: /Näita kõiki/ }));
    const folded = within(region).getByText('Läbi (3)').closest('details');
    expect(within(folded).getAllByText('Õpilane puudus')).toHaveLength(2);
    expect(within(folded).getByText('Tühistatud')).toBeInTheDocument();
    expect(within(folded).getAllByText(/Puudus, teatas ette/)).toHaveLength(2);
    expect(within(folded).queryByRole('link', { name: /Alusta tundi|Ava tund/ })).not.toBeInTheDocument();
    expect(within(folded).queryByRole('button', { name: 'Toimus' })).not.toBeInTheDocument();
  });
});

describe('panels', () => {
  it('homework per teacher', () => {
    wrap(<HomeworkPanel queue={{ waiting: 1, overdue: 2, byTeacher: [{ teacher: 'Kati', waiting: 1, overdue: 2 }] }} />);
    expect(within(screen.getByRole('table', { name: 'Kodutööd õpetajate kaupa' })).getByText('Kati').closest('tr')).toHaveTextContent('Kati12');
  });

  it('leads: list, and a failed read says so', () => {
    const { unmount } = wrap(<LeadsPanel leads={[{ id: 'l1', name: 'Uus Huviline', language: 'Eesti keel', days: 2 }]} />);
    expect(screen.getByText(/Eesti keel · 2 päeva tagasi/)).toBeInTheDocument();
    unmount();
    wrap(<LeadsPanel leads={null} failed />);
    expect(screen.getByText('Andmeid ei saanud praegu laadida.')).toBeInTheDocument();
  });

  it('packages running out; the accountant gets names without links', () => {
    wrap(<BalancePanel runningOut={[{ key: 'p', studentId: 's1', studentName: 'Mari', kind: 'package', left: 1, owed: 0 }]} />);
    expect(screen.getByText('Paketist alles 1 tund')).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Mari' })).not.toBeInTheDocument();
  });

  it('„Helistasin” saves a short note and reports the record', async () => {
    const save = vi.fn(async ({ student, note }) => ({ id: 'f1', studentId: student.id, note }));
    const onCalled = vi.fn();
    const calls = { list: [{ student: { id: 's2', name: 'Jaan', teacher: 'Mart' }, reasons: [{ code: 'absent', text: '2 puudumist 3 nädalaga' }] }], called: [] };
    wrap(<CallsPanel calls={calls} user={{ uid: 'admin-1' }} save={save} onCalled={onCalled} />);
    expect(screen.getByText('2 puudumist 3 nädalaga')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Helistasin' }));
    fireEvent.change(screen.getByLabelText('Märkus kõne kohta'), { target: { value: 'ema helistab reedel' } });
    fireEvent.click(screen.getByRole('button', { name: 'Salvesta' }));
    await waitFor(() => expect(onCalled).toHaveBeenCalledWith(expect.objectContaining({ id: 'f1' })));
    expect(save).toHaveBeenCalledWith(expect.objectContaining({ note: 'ema helistab reedel', student: expect.objectContaining({ id: 's2' }) }), { uid: 'admin-1' });
  });
});
