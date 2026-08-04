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

function repositories(submissions = [completedWork], assignments = [], homeworkItems = [{ id: 'homework-1', studentId: 'student-1', studentName: 'Mari', task: 'Õpi sõnad', status: 'Ootel', due: '2026-08-10' }]) {
  return {
    repository: {
      listByStudentIds: vi.fn().mockResolvedValue(homeworkItems),
      listSubmissionsByStudentIds: vi.fn().mockResolvedValue(submissions),
      listWorksheetAssignmentsByStudentIds: vi.fn().mockResolvedValue(assignments),
      create: vi.fn().mockResolvedValue({ id: 'new-homework' }),
      setStatus: vi.fn().mockResolvedValue(undefined),
      remove: vi.fn().mockResolvedValue(undefined),
      reviewSubmission: vi.fn().mockResolvedValue(undefined),
      submitWorksheet: vi.fn().mockResolvedValue(undefined),
      saveSelfAssessment: vi.fn().mockResolvedValue(undefined),
      getExercise: vi.fn().mockResolvedValue({ id: 'exercise-1', title: 'Tegusõnad', type: 'fill', text: 'Ma [lähen] kooli.' }),
      submitExerciseResult: vi.fn().mockResolvedValue(undefined),
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

  it('lets a student complete and submit an assigned worksheet in CRM v2', async () => {
    const assignment = {
      id: 'assignment-1', studentId: 'student-1', studentName: 'Mari', title: 'Pere tööleht', status: 'new', subject: 'Eesti keel', level: 'A1', dueDate: '2026-08-10', answers: {},
      worksheetData: { blocks: [
        { id: 'fill-1', type: 'fill', instruction: 'Täida lünk', text: 'Minu [ema] nimi on Mari.' },
        { id: 'choice-1', type: 'choice', questions: [{ q: 'Kus Mari elab?', opts: ['Tallinnas', 'Tartus'], correct: 0 }] },
      ] },
    };
    const data = repositories([], [assignment]);
    renderPage({ uid: 'student-user-1', displayName: 'Mari', roles: ['student'] }, data);

    fireEvent.click(await screen.findByRole('button', { name: /Pere tööleht/ }));
    const dialog = screen.getByRole('dialog', { name: 'Pere tööleht' });
    fireEvent.change(within(dialog).getByLabelText('Lünk 1'), { target: { value: 'ema' } });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Tallinnas' }));
    fireEvent.click(within(dialog).getByRole('button', { name: /Esita tööleht/ }));

    await waitFor(() => expect(data.repository.submitWorksheet).toHaveBeenCalledWith({
      assignmentId: 'assignment-1',
      answers: { 'fill-1_0': 'ema', 'choice-1_0': 0 },
      score: { correct: 2, total: 2, pct: 100 },
      errorLog: [],
    }));
    expect(dialog).toHaveTextContent('100% · 2/2 õiget');
    expect(data.repository.listWorksheetAssignmentsByStudentIds).toHaveBeenCalledWith(['student-1']);
  });

  it('opens an assigned exercise and stores the result without leaving CRM v2', async () => {
    const exerciseHomework = { id: 'homework-exercise', studentId: 'student-1', studentName: 'Mari', task: 'Tegusõnad', status: 'Ootel', due: '2026-08-10', isExercise: true, exerciseId: 'exercise-1', exerciseTitle: 'Tegusõnad' };
    const data = repositories([], [], [exerciseHomework]);
    const user = { uid: 'student-user-1', displayName: 'Mari', roles: ['student'] };
    renderPage(user, data);

    fireEvent.click(await screen.findByRole('button', { name: 'Alusta harjutust Tegusõnad' }));
    const dialog = await screen.findByRole('dialog', { name: 'Tegusõnad' });
    fireEvent.change(within(dialog).getByLabelText('Lünk 1'), { target: { value: 'lähen' } });
    fireEvent.click(within(dialog).getByRole('button', { name: /Esita tulemus/ }));

    await waitFor(() => expect(data.repository.submitExerciseResult).toHaveBeenCalledWith({
      exercise: { id: 'exercise-1', title: 'Tegusõnad', type: 'fill', text: 'Ma [lähen] kooli.' },
      homework: exerciseHomework,
      result: { answers: { 0: 'lähen' }, correct: 1, total: 1 },
      user,
    }));
    expect(dialog).toHaveTextContent('100% · 1/1 õiget');
    expect(data.repository.getExercise).toHaveBeenCalledWith('exercise-1');
  });

  it('does not let a student manually reopen a completed exercise homework', async () => {
    const completedExercise = { id: 'homework-exercise', studentId: 'student-1', studentName: 'Mari', task: 'Tegusõnad', status: 'Tehtud', isExercise: true, exerciseId: 'exercise-1', exerciseTitle: 'Tegusõnad' };
    const data = repositories([], [], [completedExercise]);
    renderPage({ uid: 'student-user-1', displayName: 'Mari', roles: ['student'] }, data);
    await screen.findByText('Tegusõnad');
    expect(screen.queryByRole('button', { name: /Märgi pooleliolevaks/ })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Alusta harjutust/ })).not.toBeInTheDocument();
  });
});
