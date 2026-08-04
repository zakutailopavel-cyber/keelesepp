import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { AuthContext } from '../../app/AuthContext.jsx';
import { shiftDate, toIsoDate } from '../calendar/calendarView.js';
import StudentDashboardPage from './StudentDashboardPage.jsx';

function repositories(students = [{ id: 'student-1', name: 'Mari', subject: 'Eesti keel', level: 'A1', targetLevel: 'A2', teacher: 'Õpetaja', skillMap: { rääkimine: 72 } }]) {
  const today = toIsoDate();
  return {
    studentRepository: { listSelf: vi.fn().mockResolvedValue(students) },
    homeworkRepository: {
      listByStudentIds: vi.fn().mockResolvedValue(students.length ? [{ id: 'homework-1', studentId: 'student-1', studentName: 'Mari', task: 'Õpi sõnad', due: shiftDate(today, 2), status: 'Ootel' }] : []),
      listSubmissionsByStudentIds: vi.fn().mockResolvedValue(students.length ? [{ id: 'submission-1', submissionKind: 'worksheet', studentId: 'student-1', title: 'Minu pere', reviewStatus: 'reviewed', teacherGrade: 5, teacherFeedback: 'Väga tubli!' }] : []),
    },
    scheduleRepository: { listByStudent: vi.fn().mockResolvedValue([{ id: 'schedule-1', studentId: 'student-1', studentName: 'Mari', teacher: 'Õpetaja', date: shiftDate(today, 1), time: '16:00', duration: 60, status: 'Planeeritud' }]) },
    invoiceRepository: { listByStudent: vi.fn().mockResolvedValue([{ id: 'invoice-1', studentId: 'student-1', amount: 40, paidAmount: 10 }]) },
    lessonRepository: { listByStudent: vi.fn().mockResolvedValue([{ id: 'lesson-1', studentId: 'student-1', date: shiftDate(today, -1), time: '16:00', topic: 'Tervitused', status: 'Toimunud' }]) },
  };
}

function renderPage(data) {
  const user = { uid: 'user-1', displayName: 'Mari Õpilane', roles: ['student'] };
  render(<MemoryRouter><AuthContext.Provider value={{ user }}><StudentDashboardPage {...data} /></AuthContext.Provider></MemoryRouter>);
  return user;
}

describe('StudentDashboardPage', () => {
  it('summarizes only explicitly self-owned learning data', async () => {
    const data = repositories();
    renderPage(data);

    expect(await screen.findByRole('heading', { name: 'Tere, Mari Õpilane!' })).toBeInTheDocument();
    expect(screen.getByText('Õpi sõnad')).toBeInTheDocument();
    expect(screen.getByText('Väga tubli!')).toBeInTheDocument();
    expect(screen.getByText('Hinne 5')).toBeInTheDocument();
    expect(screen.getByText('Rääkimine')).toBeInTheDocument();
    expect(screen.getByText(/30,00/)).toBeInTheDocument();
    expect(screen.getByText('Tervitused')).toBeInTheDocument();
    expect(data.studentRepository.listSelf).toHaveBeenCalledWith('user-1');
    expect(data.homeworkRepository.listByStudentIds).toHaveBeenCalledWith(['student-1']);
    expect(data.scheduleRepository.listByStudent).toHaveBeenCalledWith('student-1');
    expect(data.invoiceRepository.listByStudent).toHaveBeenCalledWith('student-1');
    expect(data.lessonRepository.listByStudent).toHaveBeenCalledWith('student-1');
  });

  it('shows a safe linking instruction when no self-owned profile exists', async () => {
    const data = repositories([]);
    renderPage(data);

    expect(await screen.findByText('Õpilase profiil ei ole kontoga seotud')).toBeInTheDocument();
    expect(screen.getByText(/Nime või e-posti põhjal profiili automaatselt ei seostata/)).toBeInTheDocument();
    expect(data.homeworkRepository.listByStudentIds).toHaveBeenCalledWith([]);
    expect(data.scheduleRepository.listByStudent).not.toHaveBeenCalled();
    expect(data.invoiceRepository.listByStudent).not.toHaveBeenCalled();
    expect(data.lessonRepository.listByStudent).not.toHaveBeenCalled();
  });
});
