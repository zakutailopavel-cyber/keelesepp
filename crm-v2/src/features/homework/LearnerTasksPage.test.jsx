import { fireEvent, render, screen, within, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthContext } from '../../app/AuthContext.jsx';
import { localDate } from '../../utils/localDate.js';
import HomeworkPage from './HomeworkPage.jsx';

globalThis.ResizeObserver = globalThis.ResizeObserver || class { observe() {} disconnect() {} };

const shift = (days) => localDate(new Date(Date.now() + days * 864e5));
const stamp = (days) => new Date(Date.now() + days * 864e5).toISOString();
const sheetDoc = { meta: { title: 'Minu päev', canDo: 'Ma räägin oma päevast.', goals: { a: 'Õpilane mõistab teksti.' } }, blocks: [{ id: 'g', type: 'gaps', data: { sentences: Array(20).fill('Ma [loen].').join('\n') } }] };
const sheet = (id, extra = {}) => ({ id, studentId: 'c1', studentName: 'Mia', lessonTitle: 'Minu päev', title: 'Minu päev · Harjuta', phase: 'practice', subject: 'Eesti keel', status: 'new', answers: {}, worksheetDoc: sheetDoc, ...extra });
const homework = (id, extra = {}) => ({ id, studentId: 'c1', studentName: 'Mia', task: 'Õpi luuletus', status: 'Ootel', due: shift(3), ...extra });
const reviewedWork = { id: 'done-1', submissionKind: 'worksheet', studentId: 'c1', studentName: 'Mia', title: 'Vana tund · Avasta', status: 'done', completedAt: '2026-10-20T10:00:00.000Z', percentage: 90, reviewStatus: 'reviewed', teacherGrade: 5, teacherFeedback: 'Väga hea töö!', reviewedAt: new Date().toISOString(), answers: {} };
// one lesson given a month ago: three sheets, each with the same teacher line (the owner's screenshot, 2026-11-10)
const oldLesson = (lessonId, title, daysAgo, extra = {}) => ['discover', 'practice', 'transfer'].map((phase) => sheet(`${lessonId}-${phase}`, {
  lessonId, lessonTitle: title, title: `${title} · ${phase}`, phase, assignedAt: stamp(-daysAgo), dueDate: shift(-daysAgo + 2), ...extra,
}));
const linkedLines = (sheets, task, extra = {}) => sheets.map((item) => homework(`hw-${item.id}`, { task, worksheetAssignmentId: item.id, due: item.dueDate, ...extra }));

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
const nextCard = () => screen.findByRole('region', { name: 'Järgmine samm' });
const openFold = (name) => fireEvent.click(screen.getByRole('button', { name }));

beforeEach(() => window.localStorage.clear());

describe('„Ülesanded” as a path (owner 2026-11-10: „делай как дуалинго”)', () => {
  it('one next step on top with one big button and how long; the path below; done folded; nothing about where things live', async () => {
    const data = repositories({
      items: [homework('h1', { due: shift(-2), task: 'Õpi luuletus' }), homework('h2', { task: 'Kirjuta kolm lauset', status: 'Tehtud', submittedAt: '2026-10-30T10:00:00.000Z' }), homework('h3', { task: 'Keegi ei tee', status: 'Suletud' })],
      sheets: [sheet('s1', { dueDate: shift(5), assignedAt: stamp(-1), lessonId: 'b1-01' }), { ...sheet('s2', { source: 'self_study', lessonTitle: 'Ise avatud' }) }],
      submissions: [{ ...reviewedWork, reviewedAt: '2026-01-01T10:00:00.000Z' }],
    });
    window.localStorage.setItem('ks-feedback-seen-child-1', String(Date.parse('2026-02-01')));
    renderPage(asStudent, data);
    // a deadline missed two days ago leads (recent, not old), gently: „hilinenud”, never „Tähtaeg oli … tagasi” in red
    const next = await nextCard();
    expect(next).toHaveTextContent('Õpi luuletus');
    expect(next).toHaveTextContent('umbes 5 min');
    expect(next).toHaveTextContent('hilinenud');
    expect(within(next).getAllByRole('button')).toHaveLength(1);
    const path = screen.getByRole('heading', { name: /Sinu tee/ }).closest('section');
    expect(within(path).getByRole('region', { name: 'Tund: Minu päev' })).toBeInTheDocument();
    expect(within(path).getByRole('button', { name: 'Alusta' })).toBeInTheDocument();
    // done work is folded; opening shows the teacher's real grade
    expect(screen.queryByText('Kirjuta kolm lauset')).not.toBeInTheDocument();
    openFold(/^Tehtud \(2\)/);
    expect(screen.getByText('Kirjuta kolm lauset')).toBeInTheDocument();
    expect(screen.getByText(/Hinne 5/)).toBeInTheDocument();
    expect(screen.getByText('Väga hea töö!')).toBeInTheDocument();
    expect(screen.queryByText('Keegi ei tee')).not.toBeInTheDocument();
    expect(screen.queryByText('Ise avatud')).not.toBeInTheDocument();
    const page = document.body.textContent;
    ['Tööleht', 'tööleht', 'Määratud', 'Kodutöö', 'kodutöö', 'esitus', 'Interaktiivne', 'Pooleli', 'Alustamata', 'päeva tagasi'].forEach((word) => expect(page).not.toContain(word));
    expect(screen.queryByRole('searchbox')).not.toBeInTheDocument();
  });

  it('a lesson is ONE node: Avasta 1/3 · Harjuta 2/3 · Kasuta 3/3, the teacher line once; a month-old lesson waits folded', async () => {
    const fresh = oldLesson('b1-12', 'Tervis', 1, { dueDate: shift(5) });
    const old = oldLesson('b1-07', 'Minu nädal', 32);
    const data = repositories({ sheets: [...old, ...fresh], items: [...linkedLines(old, 'Testülesanne'), ...linkedLines(fresh, 'Tee lehed järjest')] });
    renderPage(asStudent, data);
    const next = await nextCard();
    expect(next).toHaveTextContent('Tervis · Avasta 1/3');
    expect(within(next).getByRole('button', { name: 'Alusta' })).toBeInTheDocument();
    const node = screen.getByRole('region', { name: 'Tund: Tervis' });
    expect(within(node).getAllByRole('article').map((step) => step.getAttribute('aria-label'))).toEqual(['Avasta: Tervis', 'Harjuta: Tervis', 'Kasuta: Tervis']);
    expect(within(node).getAllByText('Õpetaja: Tee lehed järjest')).toHaveLength(1);
    expect(within(node).getByText('0/3')).toBeInTheDocument();
    // the step that is next does not repeat the big button
    expect(within(node).getByText('Järgmine samm ↑')).toBeInTheDocument();
    expect(within(node).getAllByRole('button', { name: 'Alusta' })).toHaveLength(2);
    // the old lesson: folded, still doable, nothing red
    expect(screen.queryByRole('region', { name: 'Tund: Minu nädal' })).not.toBeInTheDocument();
    openFold(/Vanad ülesanded \(3\)/);
    const oldNode = screen.getByRole('region', { name: 'Tund: Minu nädal' });
    expect(within(oldNode).getAllByText('Õpetaja: Testülesanne')).toHaveLength(1);
    expect(within(oldNode).getAllByText('hilinenud')).toHaveLength(3);
    expect(within(oldNode).getAllByRole('button', { name: 'Alusta' })).toHaveLength(3);
    fireEvent.click(within(oldNode).getAllByRole('button', { name: 'Alusta' })[1]);
    expect(await screen.findByRole('dialog')).toBeInTheDocument();
  });

  it('everything a month old: the newest old lesson is the next step, the rest folded', async () => {
    const a = oldLesson('b1-07', 'Minu nädal', 32);
    const b = oldLesson('b1-08', 'Ilm', 30);
    renderPage(asStudent, repositories({ sheets: [...a, ...b] }));
    expect(await nextCard()).toHaveTextContent('Ilm · Avasta 1/3');
    expect(screen.getByRole('button', { name: /Vanad ülesanded \(3\)/ })).toHaveAttribute('aria-expanded', 'false');
  });

  it('a word-card task opens its cards in „Harjuta”; „Tehtud” and „Lisa vastus” stay', async () => {
    const data = repositories({ items: [homework('hw-w', { task: 'Korda tunni sõnu sõnakaartidega 10 minutit', due: shift(1), invitationId: 'inv-1' })] });
    renderPage(asStudent, data);
    const next = await nextCard();
    expect(next).toHaveTextContent('umbes 10 min');
    expect(within(next).getByRole('link', { name: /Ava kaardid/ })).toHaveAttribute('href', '/student/harjuta?kaardid=hw-w');
    const step = screen.getByRole('article', { name: /Korda tunni sõnu/ });
    expect(within(step).getByRole('button', { name: /Lisa vastus/ })).toBeInTheDocument();
    fireEvent.click(within(step).getByRole('button', { name: /^Tehtud$/ }));
    await waitFor(() => expect(data.repository.setStatus).toHaveBeenCalledWith('hw-w', 'Tehtud'));
  });

  it('a written task: the big button opens its answer form in place; its own „Tehtud” stays', async () => {
    const data = repositories({ items: [homework('h1', { task: 'Kirjuta 5 lauset', due: shift(1) })] });
    renderPage(asStudent, data);
    fireEvent.click(within(await nextCard()).getByRole('button', { name: /Tee ära/ }));
    expect(screen.getByLabelText('Vastus (valikuline)')).toBeInTheDocument();
  });

  it('`?ava=` from „Täna” starts that sheet at once', async () => {
    renderPage(asStudent, repositories({ sheets: [sheet('s1', { dueDate: shift(1) })] }), {}, '/homework?ava=sheet-s1');
    expect(await screen.findByRole('dialog')).toBeInTheDocument();
  });

  it('says nothing it does not know: no goal, no deadline, no teacher text', async () => {
    renderPage(asStudent, repositories({ items: [homework('h1', { due: '' })] }));
    const step = await screen.findByRole('article', { name: 'Õpi luuletus' });
    expect(step).not.toHaveTextContent('Tähtaeg');
    expect(step).not.toHaveTextContent('Õpetaja');
    expect(step).not.toHaveTextContent('hilinenud');
  });

  it('a done task can be taken back; new feedback opens „Tehtud”, says „Uus” once and counts as seen', async () => {
    const data = repositories({ items: [homework('h1', { status: 'Tehtud', studentAnswer: 'Minu vastus' })], submissions: [reviewedWork] });
    const view = renderPage(asStudent, data);
    expect(await screen.findByText('Uus')).toBeInTheDocument();
    await waitFor(() => expect(Number(window.localStorage.getItem('ks-feedback-seen-child-1'))).toBeGreaterThan(0));
    expect(screen.getByText('Sinu vastus')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Võta tagasi' }));
    expect(data.repository.setStatus).toHaveBeenCalledWith('h1', 'Ootel');
    view.unmount();
    window.localStorage.setItem('ks-feedback-seen-child-1', String(Date.now() + 1000));
    renderPage(asStudent, data);
    fireEvent.click(await screen.findByRole('button', { name: /^Tehtud/ }));
    expect(screen.queryByText('Uus')).not.toBeInTheDocument();
  });

  it('nothing given yet: says what to do', async () => {
    renderPage(asStudent, repositories());
    expect(await screen.findByText('Praegu ülesandeid ei ole')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Ava sõnad' })).toHaveAttribute('href', '/student/sonavara');
  });

  it('all done: the next step says so and leads to „Harjuta”', async () => {
    renderPage(asStudent, repositories({ items: [homework('h1', { status: 'Tehtud' })] }));
    const next = await nextCard();
    expect(next).toHaveTextContent('Kõik on tehtud. Tubli!');
    expect(within(next).getByRole('link', { name: /Ava Harjuta/ })).toHaveAttribute('href', '/student/harjuta');
  });

  it('an administrator\'s look through a child\'s eyes reads that card and acts on nothing', async () => {
    const data = repositories({ items: [homework('h1')], sheets: [sheet('s1')] });
    renderPage({ uid: 'preview-student:c1', displayName: 'Mia', roles: ['student'] }, data, { preview: { studentId: 'c1' } });
    await screen.findAllByRole('article');
    expect(data.studentRepository.getById).toHaveBeenCalledWith('c1');
    expect(data.studentRepository.listOwned).not.toHaveBeenCalled();
    expect(data.interactiveRepository.list).not.toHaveBeenCalled();
    expect(screen.queryByRole('button', { name: 'Tehtud' })).not.toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: 'Vaata' }).length).toBeGreaterThan(0);
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
    expect(screen.getByRole('region', { name: 'Järgmine samm' })).toHaveTextContent('Järgmisena');
    expect(screen.getAllByText('Mia ülesanne').length).toBeGreaterThan(0);
    expect(screen.queryByText('Oskari ülesanne')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Tehtud' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Alusta' })).not.toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: 'Vaata' }).length).toBeGreaterThan(0);
    expect(data.interactiveRepository.list).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('tab', { name: /Oskar/ }));
    expect(screen.getAllByText('Oskari ülesanne').length).toBeGreaterThan(0);
    expect(screen.queryByText('Mia ülesanne')).not.toBeInTheDocument();
  });

  it('one child: no switch', async () => {
    renderPage(asParent, repositories({ items: [homework('h1')] }));
    await screen.findAllByRole('article');
    expect(screen.queryByRole('tablist')).not.toBeInTheDocument();
  });
});

describe('„Ülesanded” from a hint in „Minu areng” (?oskus=…)', () => {
  const listening = { meta: { title: 'Kuula' }, blocks: [{ id: 'l', type: 'listening', data: { sentences: 'Ta tuleb [kell 7].' } }] };

  it('shows only the tasks of that skill and a way back to all', async () => {
    renderPage(asStudent, repositories({ items: [homework('h1', { task: 'Õpi luuletus' })], sheets: [sheet('s1'), sheet('s2', { lessonTitle: 'Kuulamine: Gert', title: 'Kuulamine: Gert', phase: '', worksheetDoc: listening })] }), {}, '/homework?oskus=Kuulamine');
    expect((await screen.findAllByText('Kuulamine: Gert')).length).toBeGreaterThan(0);
    expect(screen.queryByText('Minu päev')).not.toBeInTheDocument();
    expect(screen.queryByText('Õpi luuletus')).not.toBeInTheDocument();
    expect(screen.getAllByRole('status')[0]).toHaveTextContent('Kuulamine: 1 ülesanne teha');
    expect(screen.getByRole('link', { name: 'Näita kõiki ülesandeid' })).toHaveAttribute('href', '/homework');
  });

  it('none of that skill: says so and opens the course to practise meanwhile, never an unrelated list', async () => {
    renderPage(asStudent, repositories({ items: [homework('h1', { task: 'Õpi luuletus' })], sheets: [sheet('s1')] }), {}, '/homework?oskus=Kuulamine');
    expect(await screen.findByText(/praegu kuulamisülesandeid ei ole/)).toBeInTheDocument();
    expect(screen.queryByText('Õpi luuletus')).not.toBeInTheDocument();
    expect(screen.queryByText('Praegu ülesandeid ei ole')).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Ava „Minu kursus”' })).toHaveAttribute('href', '/student/kursus');
  });

  it('an unknown skill in the address is ignored', async () => {
    renderPage(asStudent, repositories({ items: [homework('h1', { task: 'Õpi luuletus' })] }), {}, '/homework?oskus=Rääkimine');
    expect((await screen.findAllByText('Õpi luuletus')).length).toBeGreaterThan(0);
  });
});

describe('„Kuu monoloog” in the task list', () => {
  const b1 = [{ id: 'c1', name: 'Mia Tamm', subject: 'Eesti keel', level: 'B1' }];
  const monthNow = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;

  it('is one step with one button to its page while this month is not recorded', async () => {
    const monologueRepository = { listByStudent: vi.fn().mockResolvedValue([]) };
    renderPage(asStudent, { ...repositories({ records: b1 }), monologueRepository });
    const next = await nextCard();
    expect(monologueRepository.listByStudent).toHaveBeenCalledWith('c1');
    expect(next).toHaveTextContent(/Kuu monoloog/);
    expect(within(next).getByRole('link', { name: /Salvesta/ })).toHaveAttribute('href', '/student/monoloog');
  });

  it('done this month: under „Tehtud”', async () => {
    const monologueRepository = { listByStudent: vi.fn().mockResolvedValue([{ id: `c1_${monthNow}`, studentId: 'c1', month: monthNow, createdAt: new Date().toISOString() }]) };
    renderPage(asStudent, { ...repositories({ records: b1 }), monologueRepository });
    fireEvent.click(await screen.findByRole('button', { name: /^Tehtud \(1\)/ }));
    expect(screen.getByRole('article', { name: /Kuu monoloog/ })).toBeInTheDocument();
  });

  it('no task for A1, for a parent, or when the list cannot be read', async () => {
    const failing = { listByStudent: vi.fn().mockRejectedValue(new Error('permission-denied')) };
    const { unmount } = renderPage(asStudent, { ...repositories({ records: b1, items: [homework('h1')] }), monologueRepository: failing });
    expect((await screen.findAllByText('Õpi luuletus')).length).toBeGreaterThan(0);
    expect(screen.queryByText(/Kuu monoloog/)).not.toBeInTheDocument();
    unmount();
    const parentRepo = { listByStudent: vi.fn().mockResolvedValue([]) };
    const second = renderPage(asParent, { ...repositories({ records: b1, items: [homework('h1')] }), monologueRepository: parentRepo });
    expect((await screen.findAllByText('Õpi luuletus')).length).toBeGreaterThan(0);
    expect(parentRepo.listByStudent).not.toHaveBeenCalled();
    expect(screen.queryByText(/Kuu monoloog/)).not.toBeInTheDocument();
    second.unmount();
    const a1Repo = { listByStudent: vi.fn().mockResolvedValue([]) };
    renderPage(asStudent, { ...repositories({ records: [{ ...b1[0], level: 'A1' }], items: [homework('h1')] }), monologueRepository: a1Repo });
    expect((await screen.findAllByText('Õpi luuletus')).length).toBeGreaterThan(0);
    expect(a1Repo.listByStudent).not.toHaveBeenCalled();
  });
});
