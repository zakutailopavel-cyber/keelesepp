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
