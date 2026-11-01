import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import UnmarkedLessonsCard, { calendarLessonPath } from './UnmarkedLessonsCard.jsx';

const schedule = [
  { id: 'week', studentId: 's1', studentName: 'Mia', recurring: true, day: 'Thu', startDate: '2026-10-15', time: '17:00', duration: 60, teacherUid: 't1' },
];

describe('UnmarkedLessonsCard', () => {
  it('lists past unmarked lessons, marks one held in a click and links the rest to the calendar', async () => {
    const repository = { lessons: vi.fn().mockResolvedValue([{ scheduleId: 'week', occurrenceDate: '2026-10-15', studentId: 's1', date: '2026-10-15' }]), markHeld: vi.fn().mockResolvedValue({}) };
    render(<MemoryRouter><UnmarkedLessonsCard schedule={schedule} today="2026-10-23" teacherUid="t1" user={{ uid: 't1' }} repository={repository} /></MemoryRouter>);
    expect(await screen.findByText('1 märkimata tund')).toBeTruthy();
    expect(screen.getByText(/^Viimase aasta tunnid\. Märgi need/)).toBeTruthy();
    expect(repository.lessons).toHaveBeenCalledWith('t1');
    expect(screen.getByRole('link', { name: 'Muu…' }).getAttribute('href')).toBe(calendarLessonPath({ occurrenceId: 'week:2026-10-22', occurrenceDate: '2026-10-22' }));
    fireEvent.click(screen.getByRole('button', { name: 'Toimunud' }));
    await waitFor(() => expect(repository.markHeld).toHaveBeenCalledWith(expect.objectContaining({ id: 'week', occurrenceDate: '2026-10-22', studentId: 's1' }), { uid: 't1' }));
    await waitFor(() => expect(screen.queryByText(/märkimata tund/)).toBeNull());
  });

  it('does not lose a lesson older than two weeks: it is in the count and named as older', async () => {
    const repository = { lessons: vi.fn().mockResolvedValue([]), markHeld: vi.fn() };
    const old = [{ id: 'old', studentId: 's1', date: '2026-09-01', time: '10:00', recurring: false, status: 'Planeeritud' }, { id: 'new', studentId: 's1', date: '2026-10-20', time: '10:00', recurring: false, status: 'Planeeritud' }];
    render(<MemoryRouter><UnmarkedLessonsCard schedule={old} today="2026-10-23" repository={repository} user={{ uid: 'a' }} /></MemoryRouter>);
    expect(await screen.findByText('2 märkimata tundi')).toBeTruthy();
    expect(screen.getByText(/neist 1 vanemad kui 2 nädalat/)).toBeTruthy();
  });

  it('shows nothing when every past lesson is marked', async () => {
    const repository = { lessons: vi.fn().mockResolvedValue([{ scheduleId: 'week', occurrenceDate: '2026-10-22', studentId: 's1' }, { scheduleId: 'week', occurrenceDate: '2026-10-15', studentId: 's1' }]), markHeld: vi.fn() };
    const { container } = render(<MemoryRouter><UnmarkedLessonsCard schedule={schedule} today="2026-10-23" teacherUid="t1" repository={repository} /></MemoryRouter>);
    await waitFor(() => expect(repository.lessons).toHaveBeenCalled());
    expect(container.textContent).toBe('');
  });
});
