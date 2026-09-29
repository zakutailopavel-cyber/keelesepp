import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { AuthContext } from '../../app/AuthContext.jsx';
import { shiftDate, toIsoDate } from '../calendar/calendarView.js';
import ParentDashboardPage from './ParentDashboardPage.jsx';

describe('ParentDashboardPage', () => {
  it('loads only explicitly owned students and summarizes their lessons, homework and invoices', async () => {
    const today = toIsoDate();
    const studentRepository = { listOwned: vi.fn().mockResolvedValue([{ id: 'student-1', name: 'Mari', subject: 'Eesti keel', level: 'A1', targetLevel: 'A2', teacher: 'Õpetaja' }]) };
    const homeworkRepository = { listByStudentIds: vi.fn().mockResolvedValue([{ id: 'homework-1', studentId: 'student-1', studentName: 'Mari', task: 'Õpi sõnad', due: shiftDate(today, 2), status: 'Ootel' }]) };
    const scheduleRepository = { listByStudent: vi.fn().mockResolvedValue([{ id: 'schedule-1', studentId: 'student-1', studentName: 'Mari', teacher: 'Õpetaja', date: shiftDate(today, 1), time: '16:00', duration: 60, status: 'Planeeritud' }]) };
    const invoiceRepository = { listByStudent: vi.fn().mockResolvedValue([{ id: 'invoice-1', studentId: 'student-1', amount: 40, paidAmount: 10 }]) };
    const user = { uid: 'parent-1', displayName: 'Mari Ema', roles: ['parent'] };

    render(<MemoryRouter><AuthContext.Provider value={{ user }}><ParentDashboardPage studentRepository={studentRepository} homeworkRepository={homeworkRepository} scheduleRepository={scheduleRepository} invoiceRepository={invoiceRepository} /></AuthContext.Provider></MemoryRouter>);

    expect(await screen.findByRole('heading', { name: 'Tere, Mari Ema!' })).toBeInTheDocument();
    expect(screen.getByText('Õpi sõnad')).toBeInTheDocument();
    expect(screen.getByText(/30,00/)).toBeInTheDocument();
    expect(screen.getByText('Eesti keel')).toBeInTheDocument();
    expect(screen.getByText('A1 → A2')).toBeInTheDocument();
    expect(screen.getByText('Õpetaja')).toBeInTheDocument();
    expect(studentRepository.listOwned).toHaveBeenCalledWith('parent-1');
    expect(homeworkRepository.listByStudentIds).toHaveBeenCalledWith(['student-1']);
    expect(scheduleRepository.listByStudent).toHaveBeenCalledWith('student-1');
    expect(invoiceRepository.listByStudent).toHaveBeenCalledWith('student-1');
  });

  it('shows parents what was done in the last lessons: Õppevara topic, note, or "Individuaalne tund"', async () => {
    const studentRepository = { listOwned: vi.fn().mockResolvedValue([{ id: 'student-1', name: 'Mari' }]) };
    const empty = { listByStudentIds: vi.fn().mockResolvedValue([]), listByStudent: vi.fn().mockResolvedValue([]) };
    const lessonRepository = { listByStudent: vi.fn().mockResolvedValue([
      { id: 'l1', studentId: 'student-1', date: '2026-09-28', time: '16:00', status: 'Toimunud', topic: 'Partitiiv toidu juures', topicLevel: 'B1', topicModule: 'Toit ja teenindus', notes: 'Harjutasime tellimist kohvikus.' },
      { id: 'l2', studentId: 'student-1', date: '2026-09-21', time: '16:00', status: 'Toimunud', topic: 'Individuaalne tund', notes: 'Kooli kodutöö.' },
      { id: 'l3', studentId: 'student-1', date: '2026-09-14', time: '16:00', status: 'Puudus_eta', topic: '' },
    ]) };
    const user = { uid: 'parent-1', displayName: 'Mari Ema', roles: ['parent'] };
    render(<MemoryRouter><AuthContext.Provider value={{ user }}><ParentDashboardPage studentRepository={studentRepository} homeworkRepository={empty} scheduleRepository={empty} invoiceRepository={empty} lessonRepository={lessonRepository} /></AuthContext.Provider></MemoryRouter>);

    expect(await screen.findByRole('heading', { name: 'Mida tunnis tehti' })).toBeInTheDocument();
    expect(screen.getByText('Partitiiv toidu juures')).toBeInTheDocument();
    expect(screen.getByText(/B1 · Toit ja teenindus/)).toBeInTheDocument();
    expect(screen.getByText('Harjutasime tellimist kohvikus.')).toBeInTheDocument();
    expect(screen.getByText('Individuaalne tund')).toBeInTheDocument();
    expect(screen.getAllByText('Toimus')).toHaveLength(2);
  });
});
