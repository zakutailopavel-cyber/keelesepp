import { fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { AuthContext } from '../../app/AuthContext.jsx';
import TeacherLoadPage from './TeacherLoadPage.jsx';

const NOW = new Date('2026-11-04T10:00:00Z'); // Wednesday 12:00 in Tallinn
const data = {
  teachers: [
    { id: 't1', name: 'Mari Mets', role: 'teacher', workHourlyRateCents: 1500 },
    { id: 't2', name: 'Jüri Saar', role: 'teacher' },
  ],
  students: [
    { id: 's1', name: 'Anna', teacher: 'Mari Mets', teacherUid: 't1', active: true },
    { id: 's3', name: 'Carl', teacher: 'Jüri Saar', teacherUid: 't2', active: true },
  ],
  schedule: [{ id: 'w1', studentId: 's1', teacher: 'Mari Mets', teacherUid: 't1', recurring: true, day: 'Mon', startDate: '2026-11-02', date: '2026-11-02', time: '10:00', duration: 60, status: 'Planeeritud' }],
  groups: [],
  lessons: [{ id: 'j1', scheduleId: 'w1', studentId: 's1', date: '2026-11-02', status: 'Toimunud', teacherUid: 't1', time: '10:00' }],
  availability: [{ teacherUid: 't1', slots: [{ id: 'a', kind: 'free', day: 'Thu', start: '09:00', end: '11:00' }] }],
  submissions: [{ id: 'x', studentId: 's3', reviewStatus: 'pending', completedAt: '2026-10-30T09:00:00.000Z', source: {} }],
};

const renderPage = (roles, repository) => render(<MemoryRouter><AuthContext.Provider value={{ user: { uid: 'u', roles } }}>
  <TeacherLoadPage repository={repository} now={NOW} />
</AuthContext.Provider></MemoryRouter>);

describe('TeacherLoadPage', () => {
  it('shows one row per teacher with lessons, free time, reviews and pay', async () => {
    const repository = { load: vi.fn().mockResolvedValue(data) };
    renderPage(['admin'], repository);
    const table = await screen.findByRole('table', { name: 'Õpetajate koormus' });
    expect(repository.load).toHaveBeenCalledWith({ period: expect.objectContaining({ from: '2026-11-01', to: '2026-11-30' }), today: '2026-11-04' });
    const [, mari, juri] = within(table).getAllByRole('row');
    expect(mari).toHaveTextContent('Mari Mets');
    expect(within(mari).getByText('1 h')).toBeInTheDocument();
    expect(mari).toHaveTextContent('15,00'); // 1 h × 15 €/h
    expect(juri).toHaveTextContent('määramata');
    expect(juri).toHaveTextContent('vanim 5 päeva');
    // free time: Thursdays 5 and 12 Nov, 2 × 60 min each
    fireEvent.click(within(mari).getByRole('button', { name: /4/ }));
    expect(await screen.findByText(/Broneerimata vabad ajad/)).toBeInTheDocument();
    expect(screen.getAllByText(/09:00–11:00/)).toHaveLength(2);
  });

  it('switches to the week and moves between periods', async () => {
    const repository = { load: vi.fn().mockResolvedValue(data) };
    renderPage(['admin'], repository);
    await screen.findByRole('table', { name: 'Õpetajate koormus' });
    fireEvent.click(screen.getByRole('button', { name: 'Nädal' }));
    expect(await screen.findByText('02.11–08.11.2026')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Eelmine' }));
    expect(await screen.findByText('26.10–01.11.2026')).toBeInTheDocument();
    expect(repository.load).toHaveBeenLastCalledWith({ period: expect.objectContaining({ from: '2026-10-26', to: '2026-11-01' }), today: '2026-11-04' });
  });

  it('is closed to a teacher and reads nothing', async () => {
    const repository = { load: vi.fn() };
    renderPage(['teacher'], repository);
    expect(await screen.findByText('Ainult administraatorile')).toBeInTheDocument();
    expect(repository.load).not.toHaveBeenCalled();
    expect(screen.queryByRole('table')).toBeNull();
  });
});
