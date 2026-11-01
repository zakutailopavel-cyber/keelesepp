import { fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthContext } from '../../app/AuthContext.jsx';
import { localDate } from '../../utils/localDate.js';
import HomeworkPage from './HomeworkPage.jsx';

globalThis.ResizeObserver = globalThis.ResizeObserver || class { observe() {} disconnect() {} };

const today = localDate();
const shift = (days) => localDate(new Date(Date.now() + days * 864e5));
const sheetDoc = { meta: { title: 'Minu päev', canDo: 'Ma räägin oma päevast.', goals: { a: 'Õpilane mõistab teksti.' } }, blocks: [{ id: 'g', type: 'gaps', data: { sentences: Array(20).fill('Ma [loen].').join('\n') } }] };
const sheet = (id, extra = {}) => ({ id, studentId: 'c1', studentName: 'Mia', lessonTitle: 'Minu päev', title: 'Minu päev · Harjuta', phase: 'practice', subject: 'Eesti keel', status: 'new', answers: {}, worksheetDoc: sheetDoc, ...extra });
const homework = (id, extra = {}) => ({ id, studentId: 'c1', studentName: 'Mia', task: 'Õpi luuletus', status: 'Ootel', due: shift(3), ...extra });
const reviewedWork = { id: 'done-1', submissionKind: 'worksheet', studentId: 'c1', studentName: 'Mia', title: 'Vana tund · Avasta', status: 'done', completedAt: '2026-10-20T10:00:00.000Z', percentage: 90, reviewStatus: 'reviewed', teacherGrade: 5, teacherFeedback: 'Väga hea töö!', reviewedAt: new Date().toISOString(), answers: {} };

function repositories({ records = [{ id: 'c1', name: 'Mia Tamm' }], items = [], sheets = [], submissions = [] } = {}) {
  return {
    repository: {
      listByStudentIds: vi.fn().mockResolvedValue(items),
      listSubmissionsByStudentIds: vi.fn().mockResolvedValue(submissions),
      listWorksheetAssignmentsByStudentIds: vi.fn().mockResolvedValue(sheets),
      setStatus: vi.fn().mockResolvedValue(undefined),
    },
    studentRepository: { listOwned: vi.fn().mockResolvedValue(records), getById: vi.fn(async (id) => records.find((item) => item.id === id) || null), list: vi.fn() },
    interactiveRepository: { list: vi.fn().mockResolvedValue([]) },
  };
}
const asStudent = { uid: 'child-1', displayName: 'Mia', roles: ['student'] };
const asParent = { uid: 'parent-1', displayName: 'Ema', roles: ['parent'] };
function renderPage(user, data, extra = {}, initial = '/homework') {
  return render(<MemoryRouter initialEntries={[initial]}><AuthContext.Provider value={{ user, ...extra }}><HomeworkPage {...data} /></AuthContext.Provider></MemoryRouter>);
}

beforeEach(() => window.localStorage.clear());

describe('„Ülesanded”: one list for the child', () => {
  it('sheets, homework and results stand in three groups, with no word about where they live', async () => {
    const data = repositories({
      items: [homework('h1', { due: shift(-2), task: 'Õpi luuletus' }), homework('h2', { task: 'Kirjuta kolm lauset', status: 'Tehtud', submittedAt: '2026-10-30T10:00:00.000Z' }), homework('h3', { task: 'Keegi ei tee', status: 'Suletud' })],
      sheets: [sheet('s1', { dueDate: shift(1) }), { ...sheet('s2', { source: 'self_study', lessonTitle: 'Ise avatud' }) }],
      submissions: [reviewedWork],
    });
    renderPage(asStudent, data);
    const todo = (await screen.findByRole('heading', { name: /Tee nüüd/ })).closest('section');
    expect(within(todo).getAllByRole('article').map((card) => within(card).getByRole('heading').textContent)).toEqual(['Õpi luuletus', 'Minu päev']);
    const waiting = screen.getByRole('heading', { name: /^Tehtud/ }).closest('section');
    expect(within(waiting).getByText('Kirjuta kolm lauset')).toBeInTheDocument();
    const reviewed = screen.getByRole('heading', { name: /Õpetaja vaatas üle/ }).closest('section');
    expect(within(reviewed).getByText('Vana tund')).toBeInTheDocument();
    expect(within(reviewed).getByText(/Hinne 5/)).toBeInTheDocument();
    expect(screen.queryByText('Keegi ei tee')).not.toBeInTheDocument();
    expect(screen.queryByText('Ise avatud')).not.toBeInTheDocument();
    const page = document.body.textContent;
    ['Tööleht', 'tööleht', 'Määratud', 'Kodutöö', 'kodutöö', 'esitus', 'Interaktiivne', 'Pooleli', 'Alustamata'].forEach((word) => expect(page).not.toContain(word));
    expect(screen.queryByRole('searchbox')).not.toBeInTheDocument();
    expect(screen.queryByPlaceholderText(/Otsi/)).not.toBeInTheDocument();
  });

  it('every card says what, why, how long, by when, and gives one main button', async () => {
    const data = repositories({ sheets: [sheet('s1', { dueDate: today })] });
    renderPage(asStudent, data);
    const card = await screen.findByRole('article');
    expect(within(card).getByRole('heading')).toHaveTextContent('Minu päev');
    expect(card).toHaveTextContent('Harjuta: tee harjutusi');
    expect(card).toHaveTextContent('Ma räägin oma päevast.');
    expect(card).not.toHaveTextContent('Õpilane mõistab');
    expect(card).toHaveTextContent('umbes 10 min');
    expect(card).toHaveTextContent('Tähtaeg täna');
    expect(within(card).getAllByRole('button')).toHaveLength(1);
    expect(within(card).getByRole('button', { name: 'Alusta' })).toBeInTheDocument();
  });

  it('says nothing it does not know: no goal, no time, no deadline, no teacher text', async () => {
    const data = repositories({ items: [homework('h1', { due: '' })] });
    renderPage(asStudent, data);
    const card = await screen.findByRole('article');
    expect(card).not.toHaveTextContent('min');
    expect(card).not.toHaveTextContent('Tähtaeg');
    expect(card).not.toHaveTextContent('Õpetaja');
  });

  it('shows the teacher\'s own words on a sheet given in the lesson, as one task', async () => {
    const data = repositories({ items: [homework('h1', { task: 'Tee see leht lõpuni', worksheetAssignmentId: 's1', note: 'Lehekülg 2' })], sheets: [sheet('s1')] });
    renderPage(asStudent, data);
    expect(await screen.findAllByRole('article')).toHaveLength(1);
    expect(screen.getByText('Õpetaja: Tee see leht lõpuni')).toBeInTheDocument();
    expect(screen.getByText('Õpetaja: Lehekülg 2')).toBeInTheDocument();
  });

  it('a done task can be taken back; new feedback says „Uus” once and counts as seen', async () => {
    const data = repositories({ items: [homework('h1', { status: 'Tehtud', studentAnswer: 'Minu vastus' })], submissions: [reviewedWork] });
    const view = renderPage(asStudent, data);
    expect(await screen.findByText('Uus')).toBeInTheDocument();
    expect(Number(window.localStorage.getItem('ks-feedback-seen-child-1'))).toBeGreaterThan(0);
    expect(screen.getByText('Sinu vastus')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Võta tagasi' }));
    expect(data.repository.setStatus).toHaveBeenCalledWith('h1', 'Ootel');
    view.unmount();
    window.localStorage.setItem('ks-feedback-seen-child-1', String(Date.now() + 1000));
    renderPage(asStudent, data);
    await screen.findByRole('heading', { name: /Õpetaja vaatas üle/ });
    expect(screen.queryByText('Uus')).not.toBeInTheDocument();
  });

  it('nothing given yet: says what to do', async () => {
    renderPage(asStudent, repositories());
    expect(await screen.findByText('Praegu ülesandeid ei ole')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Ava sõnad' })).toHaveAttribute('href', '/student/sonavara');
  });

  it('an administrator\'s look through a child\'s eyes reads that card and acts on nothing', async () => {
    const data = repositories({ items: [homework('h1')], sheets: [sheet('s1')] });
    renderPage({ uid: 'preview-student:c1', displayName: 'Mia', roles: ['student'] }, data, { preview: { studentId: 'c1' } });
    await screen.findAllByRole('article');
    expect(data.studentRepository.getById).toHaveBeenCalledWith('c1');
    expect(data.studentRepository.listOwned).not.toHaveBeenCalled();
    expect(data.interactiveRepository.list).not.toHaveBeenCalled();
    expect(screen.queryByRole('button', { name: 'Tehtud' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Vaata' })).toBeInTheDocument();
    expect(window.localStorage.getItem('ks-feedback-seen-preview-student:c1')).toBeNull();
  });
});

describe('„Ülesanded” for a parent', () => {
  const family = () => repositories({
    records: [{ id: 'c1', name: 'Mia Tamm' }, { id: 'c2', name: 'Oskar Tamm' }],
    items: [homework('h1', { task: 'Mia ülesanne' }), homework('h2', { studentId: 'c2', studentName: 'Oskar', task: 'Oskari ülesanne' })],
    sheets: [sheet('s1')],
  });

  it('one child at a time, read only, without the child\'s imperative', async () => {
    const data = family();
    renderPage(asParent, data);
    expect(await screen.findByRole('heading', { name: /Vaja teha/ })).toBeInTheDocument();
    expect(screen.getByText('Mia ülesanne')).toBeInTheDocument();
    expect(screen.queryByText('Oskari ülesanne')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Tehtud' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Alusta' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Vaata' })).toBeInTheDocument();
    expect(data.interactiveRepository.list).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('tab', { name: /Oskar/ }));
    expect(screen.getByText('Oskari ülesanne')).toBeInTheDocument();
    expect(screen.queryByText('Mia ülesanne')).not.toBeInTheDocument();
  });

  it('one child: no switch', async () => {
    renderPage(asParent, repositories({ items: [homework('h1')] }));
    await screen.findByRole('article');
    expect(screen.queryByRole('tablist')).not.toBeInTheDocument();
  });
});
