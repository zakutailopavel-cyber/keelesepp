import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import UnmarkedLessonsCard, { calendarLessonPath } from './UnmarkedLessonsCard.jsx';

const schedule = [
  { id: 'week', studentId: 's1', studentName: 'Mia', recurring: true, day: 'Thu', startDate: '2026-10-01', time: '17:00', duration: 60, teacherUid: 't1' },
];

describe('UnmarkedLessonsCard', () => {
  it('lists past unmarked lessons, marks one held in a click and links the rest to the calendar', async () => {
    const repository = { lessons: vi.fn().mockResolvedValue([{ scheduleId: 'week', occurrenceDate: '2026-10-15', studentId: 's1', date: '2026-10-15' }]), markHeld: vi.fn().mockResolvedValue({}) };
    render(<MemoryRouter><UnmarkedLessonsCard schedule={schedule} today="2026-10-23" teacherUid="t1" user={{ uid: 't1' }} repository={repository} /></MemoryRouter>);
    expect(await screen.findByText('1 märkimata tundi')).toBeTruthy();
    expect(repository.lessons).toHaveBeenCalledWith('t1');
    expect(screen.getByRole('link', { name: 'Muu…' }).getAttribute('href')).toBe(calendarLessonPath({ occurrenceId: 'week:2026-10-22', occurrenceDate: '2026-10-22' }));
    fireEvent.click(screen.getByRole('button', { name: 'Toimunud' }));
    await waitFor(() => expect(repository.markHeld).toHaveBeenCalledWith(expect.objectContaining({ id: 'week', occurrenceDate: '2026-10-22', studentId: 's1' }), { uid: 't1' }));
    await waitFor(() => expect(screen.queryByText(/märkimata tundi/)).toBeNull());
  });

  it('shows nothing when every past lesson is marked', async () => {
    const repository = { lessons: vi.fn().mockResolvedValue([{ scheduleId: 'week', occurrenceDate: '2026-10-22', studentId: 's1' }, { scheduleId: 'week', occurrenceDate: '2026-10-15', studentId: 's1' }]), markHeld: vi.fn() };
    const { container } = render(<MemoryRouter><UnmarkedLessonsCard schedule={schedule} today="2026-10-23" teacherUid="t1" repository={repository} /></MemoryRouter>);
    await waitFor(() => expect(repository.lessons).toHaveBeenCalled());
    expect(container.textContent).toBe('');
  });
});
