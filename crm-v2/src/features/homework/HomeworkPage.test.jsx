import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { AuthContext } from '../../app/AuthContext.jsx';
import HomeworkPage from './HomeworkPage.jsx';

const completedWork = {
  id: 'worksheet-1',
  submissionKind: 'worksheet',
  studentId: 'student-1',
  studentName: 'Mari',
  title: 'Pere tööleht',
  status: 'done',
  completedAt: '2026-08-04T09:00:00.000Z',
  answers: { first: 'Minu ema nimi on Mari.' },
  percentage: 80,
  reviewStatus: 'pending',
};

function repositories(submissions = [completedWork]) {
  return {
    repository: {
      listByStudentIds: vi.fn().mockResolvedValue([{ id: 'homework-1', studentId: 'student-1', studentName: 'Mari', task: 'Õpi sõnad', status: 'Ootel', due: '2026-08-10' }]),
      listSubmissionsByStudentIds: vi.fn().mockResolvedValue(submissions),
      create: vi.fn().mockResolvedValue({ id: 'new-homework' }),
      setStatus: vi.fn().mockResolvedValue(undefined),
      remove: vi.fn().mockResolvedValue(undefined),
      reviewSubmission: vi.fn().mockResolvedValue(undefined),
    },
    studentRepository: {
      list: vi.fn().mockResolvedValue({ items: [{ id: 'student-1', name: 'Mari' }] }),
      listOwned: vi.fn().mockResolvedValue([{ id: 'student-1', name: 'Mari' }]),
    },
  };
}

function renderPage(user, data) {
  render(<MemoryRouter><AuthContext.Provider value={{ user }}><HomeworkPage {...data} /></AuthContext.Provider></MemoryRouter>);
}

describe('HomeworkPage', () => {
  it('scopes a teacher to assigned students and sends a review', async () => {
    const data = repositories();
    const user = { uid: 'teacher-1', displayName: 'Õpetaja', roles: ['teacher'] };
    renderPage(user, data);

    fireEvent.click(await screen.findByRole('button', { name: /Pere tööleht/ }));
    const dialog = screen.getByRole('dialog', { name: 'Pere tööleht' });
    expect(dialog).toHaveTextContent('Minu ema nimi on Mari.');
    fireEvent.change(within(dialog).getByLabelText('Hinne 1–5'), { target: { value: '5' } });
    fireEvent.change(within(dialog).getByLabelText('Kommentaar õpilasele'), { target: { value: 'Väga hea töö!' } });
    fireEvent.click(within(dialog).getByRole('button', { name: /Saada tagasiside/ }));

    await waitFor(() => expect(data.repository.reviewSubmission).toHaveBeenCalledWith({
      submission: completedWork,
      teacherGrade: '5',
      teacherFeedback: 'Väga hea töö!',
      user,
    }));
    expect(await screen.findByRole('status')).toHaveTextContent('saadeti õpilasele');
    expect(data.studentRepository.list).toHaveBeenCalledWith(expect.objectContaining({ scopeTeacherUid: 'teacher-1' }));
    expect(data.repository.listByStudentIds).toHaveBeenCalledWith(['student-1']);
    expect(data.repository.listSubmissionsByStudentIds).toHaveBeenCalledWith(['student-1']);
  });

  it('shows returned feedback to a student without staff actions', async () => {
    const reviewed = { ...completedWork, reviewStatus: 'reviewed', teacherGrade: 4, teacherFeedback: 'Harjuta veel käändeid.', reviewedAt: '2026-08-04T10:00:00.000Z', reviewedByName: 'Õpetaja' };
    const data = repositories([reviewed]);
    renderPage({ uid: 'student-user-1', displayName: 'Mari', roles: ['student'] }, data);

    fireEvent.click(await screen.findByRole('button', { name: /Pere tööleht/ }));
    const dialog = screen.getByRole('dialog', { name: 'Pere tööleht' });
    expect(dialog).toHaveTextContent('Harjuta veel käändeid.');
    expect(dialog).toHaveTextContent('Hinne 4');
    expect(screen.queryByRole('button', { name: 'Uus kodutöö' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Kustuta' })).not.toBeInTheDocument();
    expect(data.studentRepository.listOwned).toHaveBeenCalledWith('student-user-1');
    expect(data.studentRepository.list).not.toHaveBeenCalled();
  });
});
