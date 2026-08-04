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
    expect(screen.getByText(/Õpetaja: Õpetaja/)).toBeInTheDocument();
    expect(studentRepository.listOwned).toHaveBeenCalledWith('parent-1');
    expect(homeworkRepository.listByStudentIds).toHaveBeenCalledWith(['student-1']);
    expect(scheduleRepository.listByStudent).toHaveBeenCalledWith('student-1');
    expect(invoiceRepository.listByStudent).toHaveBeenCalledWith('student-1');
  });
});
