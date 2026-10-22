import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import TeachersPage from './TeachersPage.jsx';

describe('TeachersPage', () => {
  it('summarises active teachers, assigned students and upcoming work', async () => {
    // local date, like the page (toISOString is UTC and is "yesterday" just after midnight in Tallinn)
    const now = new Date();
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    render(<MemoryRouter><TeachersPage
      teacherRepository={{ list: vi.fn().mockResolvedValue([
        { id: 'teacher-1', name: 'Õpetaja Üks', email: 'one@example.com', disabled: false },
        { id: 'teacher-2', name: 'Õpetaja Kaks', email: 'two@example.com', disabled: true },
      ]) }}
      studentRepository={{ list: vi.fn().mockResolvedValue({ items: [{ id: 'student-1', name: 'Mari', teacherUid: 'teacher-1', teacher: 'Õpetaja Üks' }] }) }}
      scheduleRepository={{ list: vi.fn().mockResolvedValue([{ id: 'schedule-1', studentName: 'Mari', teacherUid: 'teacher-1', teacher: 'Õpetaja Üks', date: today, startDate: today, time: '10:00', duration: 60 }]) }}
    /></MemoryRouter>);

    const overview = await screen.findByRole('region', { name: 'Õpetajate kokkuvõte' });
    expect(overview).toHaveTextContent('Aktiivsed1');
    expect(overview).toHaveTextContent('Õpilasi1');
    expect(overview).toHaveTextContent('Täna1');
  });
});

describe('TeachersPage: „Õpetajate võrdlus” (owner 2026-10-23)', () => {
  const props = {
    teacherRepository: { list: vi.fn().mockResolvedValue([{ id: 't1', name: 'Anna' }]) },
    studentRepository: { list: vi.fn().mockResolvedValue({ items: [{ id: 's1', name: 'Mari', teacherUid: 't1', active: true }] }) },
    scheduleRepository: { list: vi.fn().mockResolvedValue([]) },
    reportRepository: { lessons: vi.fn().mockResolvedValue([]), words: vi.fn().mockResolvedValue([]), assignments: vi.fn().mockResolvedValue([]) },
  };
  it('only an administrator sees the comparison', async () => {
    const { AuthContext } = await import('../../app/AuthContext.jsx');
    const { unmount } = render(<MemoryRouter><AuthContext.Provider value={{ user: { uid: 't1', roles: ['teacher'] } }}><TeachersPage {...props} /></AuthContext.Provider></MemoryRouter>);
    await screen.findByRole('region', { name: 'Õpetajate kokkuvõte' });
    expect(screen.queryByText('Õpetajate võrdlus')).toBeNull();
    unmount();
    render(<MemoryRouter><AuthContext.Provider value={{ user: { uid: 'a', roles: ['admin'] } }}><TeachersPage {...props} /></AuthContext.Provider></MemoryRouter>);
    expect(await screen.findByText('Õpetajate võrdlus')).toBeInTheDocument();
    expect(await screen.findByRole('table', { name: 'Õpetajate võrdlus' })).toHaveTextContent('Anna');
  });
});
