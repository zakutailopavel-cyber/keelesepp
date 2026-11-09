import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import UnmarkedLessonsCard, { calendarLessonPath } from './UnmarkedLessonsCard.jsx';

const schedule = [
  { id: 'week', studentId: 's1', studentName: 'Mia', recurring: true, day: 'Mon', startDate: '2026-10-19', time: '17:00', duration: 60, teacherUid: 't1' },
];

describe('UnmarkedLessonsCard (the ONE definition: from 1.11 up to yesterday)', () => {
  it('lists past unmarked lessons, marks one held in a click and links the rest to the calendar', async () => {
    const repository = { lessons: vi.fn().mockResolvedValue([{ scheduleId: 'week', occurrenceDate: '2026-11-02', studentId: 's1', date: '2026-11-02' }]), markHeld: vi.fn().mockResolvedValue({}) };
    render(<MemoryRouter><UnmarkedLessonsCard schedule={schedule} today="2026-11-10" teacherUid="t1" user={{ uid: 't1' }} repository={repository} /></MemoryRouter>);
    expect(await screen.findByText('1 märkimata tund')).toBeTruthy();
    expect(screen.getByText(/^Tunnid alates 1\.11 kuni eilseni\. Märgi need/)).toBeTruthy();
    expect(repository.lessons).toHaveBeenCalledWith('t1');
    expect(screen.getByRole('link', { name: 'Muu…' }).getAttribute('href')).toBe(calendarLessonPath({ occurrenceId: 'week:2026-11-09', occurrenceDate: '2026-11-09' }));
    fireEvent.click(screen.getByRole('button', { name: 'Toimunud' }));
    await waitFor(() => expect(repository.markHeld).toHaveBeenCalledWith(expect.objectContaining({ id: 'week', occurrenceDate: '2026-11-09', studentId: 's1' }), { uid: 't1' }));
    await waitFor(() => expect(screen.queryByText(/märkimata tund/)).toBeNull());
  });

  it('lessons before 1.11 and artefacts (archived student) are not counted', async () => {
    const repository = { lessons: vi.fn().mockResolvedValue([]), markHeld: vi.fn() };
    const lessons = [
      { id: 'old', studentId: 's1', teacherUid: 't1', date: '2026-10-20', time: '10:00', recurring: false, status: 'Planeeritud' },
      { id: 'new', studentId: 's1', teacherUid: 't1', date: '2026-11-03', time: '10:00', recurring: false, status: 'Planeeritud' },
      { id: 'arch', studentId: 's-arch', teacherUid: 't1', date: '2026-11-04', time: '10:00', recurring: false, status: 'Planeeritud' },
    ];
    render(<MemoryRouter><UnmarkedLessonsCard schedule={lessons} today="2026-11-10" repository={repository} user={{ uid: 'a' }} context={{ archivedStudentIds: ['s-arch'] }} /></MemoryRouter>);
    expect(await screen.findByText('1 märkimata tund')).toBeTruthy();
  });

  it('shows nothing when every past lesson is marked', async () => {
    const repository = { lessons: vi.fn().mockResolvedValue([{ scheduleId: 'week', occurrenceDate: '2026-11-02', studentId: 's1' }, { scheduleId: 'week', occurrenceDate: '2026-11-09', studentId: 's1' }]), markHeld: vi.fn() };
    const { container } = render(<MemoryRouter><UnmarkedLessonsCard schedule={schedule} today="2026-11-10" teacherUid="t1" repository={repository} /></MemoryRouter>);
    await waitFor(() => expect(repository.lessons).toHaveBeenCalled());
    expect(container.textContent).toBe('');
  });
});
