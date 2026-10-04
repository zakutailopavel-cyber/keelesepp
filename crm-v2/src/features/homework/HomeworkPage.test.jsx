import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { AuthContext } from '../../app/AuthContext.jsx';
import HomeworkPage from './HomeworkPage.jsx';
import { sampleDocument } from '../worksheet-studio/engine/sample.js';

globalThis.ResizeObserver = globalThis.ResizeObserver || class { observe() {} disconnect() {} };

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
      saveSubmissionAnnotations: vi.fn().mockImplementation(async ({ annotations }) => annotations),
      submitWorksheet: vi.fn().mockResolvedValue(undefined),
      saveSelfAssessment: vi.fn().mockResolvedValue(undefined),
      getExercise: vi.fn().mockResolvedValue({ id: 'exercise-1', title: 'Tegusõnad', type: 'fill', text: 'Ma [lähen] kooli.' }),
      getAssignedMaterial: vi.fn().mockResolvedValue({ id: 'material-1', title: 'Perekonna materjal', type: 'material', description: 'Loe materjali.', files: [{ name: 'pere.pdf', url: 'https://files.example/pere.pdf', type: 'application/pdf' }] }),
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

    expect(await screen.findByRole('region', { name: 'Kodutööde kokkuvõte' })).toHaveTextContent('Ootab kontrolli1');
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
    const reviewed = { ...completedWork, reviewStatus: 'reviewed', teacherGrade: 4, teacherFeedback: 'Harjuta veel käändeid.', reviewedAt: '2026-08-04T10:00:00.000Z', reviewedByName: 'Õpetaja', annotations: [{ id: 'note-1', blockId: 'first', start: 5, end: 8, selectedText: 'ema', parandus: 'ema nimi', selgitus: 'Täpsusta väljendit.', createdAt: '2026-08-04T10:00:00.000Z', dismissed: false }] };
    const data = repositories([reviewed]);
    renderPage({ uid: 'student-user-1', displayName: 'Mari', roles: ['student'] }, data);

    fireEvent.click(await screen.findByRole('button', { name: /Pere tööleht/ }));
    const dialog = screen.getByRole('dialog', { name: 'Pere tööleht' });
    expect(dialog).toHaveTextContent('Harjuta veel käändeid.');
    expect(dialog).toHaveTextContent('Hinne 4');
    expect(dialog).toHaveTextContent('ema nimi');
    expect(dialog).toHaveTextContent('Täpsusta väljendit.');
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

  it('previews an assigned PDF inside CRM v2 without downloading it', async () => {
    const materialHomework = {
      id: 'homework-material',
      studentId: 'student-1',
      studentName: 'Mari',
      task: 'Perekonna materjal',
      status: 'Ootel',
      due: '2026-08-10',
      sourceType: 'curriculum',
      sourceId: 'material-1',
      fileUrl: 'https://files.example/pere.pdf',
      fileName: 'pere.pdf',
      attachments: [{ name: 'pere.pdf', url: 'https://files.example/pere.pdf', type: 'application/pdf' }],
    };
    const data = repositories([], [], [materialHomework]);
    renderPage({ uid: 'student-user-1', displayName: 'Mari', roles: ['student'] }, data);

    fireEvent.click(await screen.findByRole('button', { name: 'Eelvaade: Perekonna materjal' }));

    await waitFor(() => expect(data.repository.getAssignedMaterial).toHaveBeenCalledWith(materialHomework));
    const dialog = await screen.findByRole('dialog', { name: 'Eelvaade: Perekonna materjal' });
    expect(within(dialog).getByTitle('PDF: pere.pdf')).toHaveAttribute('src', 'https://files.example/pere.pdf#toolbar=0&navpanes=0');
    expect(within(dialog).queryByRole('link', { name: /laadi/i })).not.toBeInTheDocument();
  });

  it('does not let a student manually reopen a completed exercise homework', async () => {
    const completedExercise = { id: 'homework-exercise', studentId: 'student-1', studentName: 'Mari', task: 'Tegusõnad', status: 'Tehtud', isExercise: true, exerciseId: 'exercise-1', exerciseTitle: 'Tegusõnad' };
    const data = repositories([], [], [completedExercise]);
    renderPage({ uid: 'student-user-1', displayName: 'Mari', roles: ['student'] }, data);
    await screen.findByText('Tegusõnad');
    expect(screen.queryByRole('button', { name: /Märgi pooleliolevaks/ })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Alusta harjutust/ })).not.toBeInTheDocument();
  });

  it('keeps a submitted studio worksheet and its result on screen while the list reloads', async () => {
    const assignment = { id: 'assignment-2', studentId: 'student-1', studentName: 'Mari', title: 'Minu päev', status: 'new', dueDate: '2099-01-01', answers: {}, worksheetDoc: sampleDocument() };
    const data = repositories([], [assignment], []);
    data.repository.saveWorksheetDraft = vi.fn().mockResolvedValue(undefined);
    globalThis.confirm = vi.fn(() => true);
    renderPage({ uid: 'student-user-1', displayName: 'Mari', roles: ['student'] }, data);

    const summary = await screen.findByRole('region', { name: /Minu kodutööd|Kodutööd/ }).catch(() => null);
    if (summary) expect(summary).toHaveTextContent(/Kõik ülesanded\s*1/);
    fireEvent.click(await screen.findByRole('button', { name: /Minu päev/ }));
    fireEvent.click(await screen.findByRole('button', { name: /Esita tööleht/ }));
    await waitFor(() => expect(data.repository.submitWorksheet).toHaveBeenCalled());
    await waitFor(() => expect(data.repository.listWorksheetAssignmentsByStudentIds).toHaveBeenCalledTimes(2));
    expect(await screen.findByText('Esitatud')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Esita tööleht/ })).toBeNull();
  });

  it('counts worksheets in the summary and shows a started one as in progress', async () => {
    const started = { id: 'a-3', studentId: 'student-1', studentName: 'Mari', title: 'Pooleli leht', status: 'in_progress', dueDate: '2099-01-01', answers: { 'b1:0': 'x' }, worksheetDoc: sampleDocument() };
    const late = { id: 'a-4', studentId: 'student-1', studentName: 'Mari', title: 'Hiline leht', status: 'new', dueDate: '2000-01-01', answers: {}, worksheetDoc: sampleDocument() };
    renderPage({ uid: 'student-user-1', displayName: 'Mari', roles: ['student'] }, repositories([], [started, late], []));
    const button = await screen.findByRole('button', { name: /Pooleli leht/ });
    expect(button).toHaveTextContent('Pooleli');
    expect(screen.getByText('2 töölehte')).toBeInTheDocument();
    expect(screen.queryByText(/õpilast/)).toBeNull();
  });

  it('a student finishes an interactive lesson from CRM v1 and sends it to the teacher', async () => {
    const lesson = { title: 'A2 tund', activities: [
      { id: 'a1', title: 'Tutvustus', prompt: 'Kirjuta oma nimi.', assets: [], response: { schemaVersion: 1, mode: 'short_text', required: true } },
      { id: 'a2', title: 'Lüngad', prompt: 'Ma ___ Tallinnas.', assets: [], response: { schemaVersion: 1, mode: 'gaps', required: true, items: [{ id: 'g1', label: 'Lünk 1' }] } },
      { id: 'a3', title: 'Vali', prompt: 'Mis päev on täna?', assets: [], response: { schemaVersion: 1, mode: 'single_choice', required: false, items: [{ id: 'c1', label: 'esmaspäev' }, { id: 'c2', label: 'teisipäev' }] } },
    ] };
    const record = { id: 'ia-1', title: 'A2 tund', status: 'active', revision: 3, answers: {}, currentActivityId: 'a1', route: 'core', lesson };
    const interactiveRepository = {
      list: vi.fn().mockResolvedValue([{ id: 'ia-1', title: 'A2 tund', status: 'active', studentName: 'Mari' }]),
      get: vi.fn().mockResolvedValue(record),
      save: vi.fn().mockImplementation(async (_record, answers, currentActivityId) => { interactiveRepository.get.mockResolvedValue({ ...record, answers, currentActivityId, revision: 4 }); return { revision: 4 }; }),
      submit: vi.fn().mockResolvedValue({ revision: 5, status: 'submitted' }),
    };
    globalThis.confirm = vi.fn(() => true);
    renderPage({ uid: 'student-user-1', displayName: 'Mari', roles: ['student'] }, { ...repositories([], [], []), interactiveRepository });

    fireEvent.click(await screen.findByRole('button', { name: /A2 tund/ }));
    const dialog = await screen.findByRole('dialog', { name: 'A2 tund' });
    fireEvent.click(within(dialog).getByRole('button', { name: /Saada õpetajale/ }));
    expect(await within(dialog).findByRole('alert')).toHaveTextContent('Vasta enne saatmist: Tutvustus, Lüngad');
    expect(interactiveRepository.submit).not.toHaveBeenCalled();

    fireEvent.change(within(dialog).getByLabelText('Sinu vastus'), { target: { value: 'Mari' } });
    fireEvent.click(within(dialog).getByRole('button', { name: /Järgmine/ }));
    fireEvent.change(within(dialog).getByLabelText('Lünk 1'), { target: { value: 'elan' } });
    fireEvent.click(within(dialog).getByRole('button', { name: /Järgmine/ }));
    fireEvent.click(within(dialog).getByLabelText('teisipäev'));
    fireEvent.click(within(dialog).getByRole('button', { name: /Salvesta/ }));
    await waitFor(() => expect(interactiveRepository.save).toHaveBeenCalledWith(record, { a1: 'Mari', a2: { g1: 'elan' }, a3: 'c2' }, 'a3'));
    fireEvent.click(within(dialog).getByRole('button', { name: /Saada õpetajale/ }));
    await waitFor(() => expect(interactiveRepository.submit).toHaveBeenCalledWith(expect.objectContaining({ id: 'ia-1', revision: 4 }), { a1: 'Mari', a2: { g1: 'elan' }, a3: 'c2' }, 'a3'));
  });

  it('a teacher reads a submitted interactive lesson with the expected answer and sends feedback', async () => {
    const lesson = { title: 'A2 tund', activities: [{ id: 'a1', title: 'Tutvustus', prompt: 'Kirjuta oma nimi.', assets: [], response: { schemaVersion: 1, mode: 'short_text', required: true } }] };
    const record = { id: 'ia-2', title: 'A2 tund', status: 'submitted', revision: 5, studentName: 'Mari', answers: { a1: 'Mina olen Mari' }, currentActivityId: 'a1', route: 'core', lesson,
      teacherContent: { activities: [{ id: 'a1', routes: { core: { expected: 'Mina olen …', teacherInstruction: 'Paranda suur algustäht.' } } }] } };
    const interactiveRepository = {
      list: vi.fn().mockResolvedValue([{ id: 'ia-2', title: 'A2 tund', status: 'submitted', studentName: 'Mari' }, { id: 'ia-3', title: 'Pooleli', status: 'active', studentName: 'Jaan' }]),
      get: vi.fn().mockResolvedValue(record),
      review: vi.fn().mockResolvedValue({ revision: 6, status: 'reviewed' }),
    };
    renderPage({ uid: 'teacher-1', displayName: 'Pavel', roles: ['teacher'] }, { ...repositories([], [], []), interactiveRepository });

    expect(await screen.findByText('Interaktiivsed tunnid ootavad tagasisidet')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Pooleli/ })).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: /A2 tund/ }));
    const dialog = await screen.findByRole('dialog', { name: 'A2 tund' });
    expect(within(dialog).getByText('Mina olen Mari')).toBeInTheDocument();
    expect(within(dialog).getByText(/Paranda suur algustäht/)).toBeInTheDocument();
    fireEvent.change(within(dialog).getByLabelText('Tagasiside õpilasele'), { target: { value: 'Tubli!' } });
    fireEvent.click(within(dialog).getByRole('button', { name: /Saada tagasiside/ }));
    await waitFor(() => expect(interactiveRepository.review).toHaveBeenCalledWith(record, 'Tubli!'));
  });
});

describe('HomeworkPage: homework from a Live Classroom lesson', () => {
  it('the student opens the attached board page from the task', async () => {
    const data = repositories([], [], [{ id: 'h1', studentId: 'student-1', studentName: 'Mari', task: 'Korda tunni sõnu', status: 'Ootel', due: '2026-10-11', source: 'live-classroom', boardPageId: 'p1', boardPageTitle: 'Tund 1', worksheetTitle: 'Minevik' }]);
    renderPage({ uid: 'student-uid', displayName: 'Mari', roles: ['student'] }, data);
    expect(await screen.findByRole('link', { name: 'Ava tahvlileht „Tund 1”' })).toHaveAttribute('href', '/board?page=p1');
    expect(screen.getByText(/Tööleht „Minevik”/)).toBeInTheDocument();
    expect(screen.getByText(/Tunnist/)).toBeInTheDocument();
  });
});
