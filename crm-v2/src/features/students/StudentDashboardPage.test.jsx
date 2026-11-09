import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthContext } from '../../app/AuthContext.jsx';
import { shiftDate, toIsoDate } from '../calendar/calendarView.js';
import StudentDashboardPage from './StudentDashboardPage.jsx';

const today = toIsoDate();
const ago = (days) => new Date(Date.now() - days * 86400000).toISOString();
const dueWords = ['koer', 'kass', 'maja'].map((id) => ({ id, word: id, translation: `t-${id}`, box: 1, reviews: 2, dueAt: ago(1), reviewedAt: ago(4) }));
const ownSentence = { id: 'own-1', word: 'Ma lähen koju', translation: 'Sinu lause: Ma lähen kodus', box: 0, reviews: 1, dueAt: ago(1) };
const wordsOf = (list) => ({ subscribeForStudent: (id, onData) => { onData(list); return () => {}; }, rate: vi.fn().mockResolvedValue({}) });

function repositories(students = [{ id: 'student-1', name: 'Mari', subject: 'Eesti keel', level: 'A1', targetLevel: 'A2', teacher: 'Õpetaja', recordingConsent: true }], extra = {}) {
  return {
    studentRepository: { listSelf: vi.fn().mockResolvedValue(students), getById: vi.fn().mockResolvedValue(students[0]) },
    homeworkRepository: {
      listByStudentIds: vi.fn().mockResolvedValue(students.length ? [{ id: 'homework-1', studentId: 'student-1', studentName: 'Mari', task: 'Õpi sõnad', due: shiftDate(today, 2), status: 'Ootel' }] : []),
      listSubmissionsByStudentIds: vi.fn().mockResolvedValue([]),
      listWorksheetAssignmentsByStudentIds: vi.fn().mockResolvedValue([]),
    },
    scheduleRepository: { listByStudent: vi.fn().mockResolvedValue([{ id: 'schedule-1', studentId: 'student-1', studentName: 'Mari', teacher: 'Õpetaja', date: shiftDate(today, 1), time: '16:00', duration: 60, status: 'Planeeritud' }]) },
    invoiceRepository: { listByStudent: vi.fn().mockResolvedValue([{ id: 'invoice-1', studentId: 'student-1', amount: 40, paidAmount: 10 }, { id: 'invoice-2', studentId: 'student-1', amount: 40, paidAmount: 40 }]) },
    lessonRepository: { listByStudent: vi.fn().mockResolvedValue([{ id: 'lesson-1', studentId: 'student-1', date: shiftDate(today, -1), time: '16:00', topic: 'Tervitused', status: 'Toimunud' }]) },
    petRepository: { get: vi.fn().mockResolvedValue(null) },
    changeRequests: { listForStudents: vi.fn().mockResolvedValue([]) },
    announcementService: { mine: vi.fn().mockResolvedValue({ pending: [], past: [] }) },
    paymentsApi: { config: vi.fn().mockResolvedValue({ enabled: false }) },
    wordsService: wordsOf([]),
    practiceService: { saveToday: vi.fn(async () => null) },
    monologueRepository: { listByStudent: vi.fn().mockResolvedValue([]) },
    // the course of his level: empty here, so a practice lesson is made of his own sentences only
    courseLoaders: { a2: vi.fn(async () => ({ MODULES: [] })), b1: vi.fn(async () => ({ MODULES: [] })) },
    ...extra,
  };
}

function renderPage(data, auth = {}) {
  const user = { uid: 'user-1', displayName: 'Mari Õpilane', roles: ['student'] };
  return render(<MemoryRouter><AuthContext.Provider value={{ user, ...auth }}><StudentDashboardPage {...data} /></AuthContext.Provider></MemoryRouter>);
}
const doneSteps = (region) => [...region.querySelectorAll('.tn-list li.is-done b')].map((node) => node.textContent);

describe('StudentDashboardPage', () => {
  beforeEach(() => { globalThis.sessionStorage?.clear?.(); globalThis.localStorage?.clear?.(); });

  it('while the first data loads: placeholder cards (no spinner) under one busy label, then the page', async () => {
    const data = repositories();
    let release;
    data.studentRepository.listSelf = vi.fn(() => new Promise((resolve) => { release = () => resolve([{ id: 'student-1', name: 'Mari', subject: 'Eesti keel', recordingConsent: true }]); }));
    const { container } = renderPage(data);
    expect(screen.getByRole('status')).toHaveAttribute('aria-busy', 'true');
    expect(screen.getByText('Laen sinu tänast päeva…')).toBeInTheDocument();
    expect(container.querySelector('.state-spinner')).toBeNull();
    expect(screen.getAllByTestId('skeleton').length).toBeGreaterThan(2);
    release();
    expect(await screen.findByRole('heading', { name: 'Tere, Mari!' })).toBeInTheDocument();
    expect(screen.queryByText('Laen sinu tänast päeva…')).not.toBeInTheDocument();
  });

  it('the first screen is „Täna” with ONE button, then the lesson time and the pet card — nothing else', async () => {
    const data = repositories(undefined, {
      petRepository: { get: vi.fn().mockResolvedValue({ kind: 'siil', name: 'Okki', playedAt: ago(5) }), lessonStats: vi.fn().mockResolvedValue([]), update: vi.fn(), publish: vi.fn().mockResolvedValue() },
      wordsService: wordsOf(dueWords),
    });
    const { container } = renderPage(data);
    expect(await screen.findByRole('heading', { name: 'Tere, Mari!' })).toBeInTheDocument();
    const tana = screen.getByRole('region', { name: 'Täna' });
    expect(within(tana).getAllByRole('button')).toHaveLength(1);
    expect(within(tana).getByRole('button', { name: /Alusta tänast/ })).toBeInTheDocument();
    // the steps in order; the course step only for a self-study card
    await waitFor(() => expect([...tana.querySelectorAll('.tn-list b')].map((node) => node.textContent)).toEqual(['Ülesanded', 'Sõnad', 'Laused ja grammatika']));
    expect(within(tana).getByText(/eesmärk 10 min päevas/)).toBeInTheDocument();
    const side = container.querySelector('.sh-side');
    expect([...side.children].map((node) => node.getAttribute('aria-label'))).toEqual(['Tunniplaan', 'Okki']);
    expect(within(side).getByText(/Järgmine tund:/)).toBeInTheDocument();
    expect(within(side).getByRole('button', { name: 'Ei saa tulla?' })).toBeInTheDocument();
    // the pet asks for nothing of its own
    const pet = screen.getByRole('region', { name: 'Okki' });
    expect(within(pet).queryByRole('button', { name: /Kordame|Mängime|Parandame/ })).toBeNull();
    expect(within(pet).getByText('Alustame? Mina olen kohe siin.')).toBeInTheDocument();
    // the old sections and the second next-step block are gone
    expect(screen.queryByRole('region', { name: 'Minu õppimine' })).not.toBeInTheDocument();
    expect(screen.queryByRole('region', { name: 'Järgmine samm' })).not.toBeInTheDocument();
  });

  it('„Alusta tänast” runs the steps in order: homework (later), words, sentences; each is ticked, the pet reacts, the day ends with its thanks', async () => {
    const data = repositories(undefined, { wordsService: wordsOf([...dueWords, ownSentence]) });
    renderPage(data);
    const start = await screen.findByRole('region', { name: 'Täna' });
    await waitFor(() => expect(start.querySelectorAll('.tn-list li')).toHaveLength(3));
    fireEvent.click(within(start).getByRole('button', { name: /Alusta tänast/ }));
    // 1. homework: the teacher's task, opened on „Ülesanded”; „Hiljem” moves on without a tick
    let tana = screen.getByRole('region', { name: 'Täna: Ülesanded' });
    expect(within(tana).getByText('Õpi sõnad')).toBeInTheDocument();
    expect(within(tana).getByRole('link', { name: /Ava ülesanne/ })).toHaveAttribute('href', '/homework');
    fireEvent.click(within(tana).getByRole('button', { name: /Hiljem/ }));
    // 2. words: the SRS queue in the one card UI; his own sentences are not among the cards
    tana = screen.getByRole('region', { name: 'Täna: Sõnad' });
    for (let i = 0; i < 12 && within(tana).queryByRole('button', { name: 'Näita vastust' }); i += 1) {
      fireEvent.click(within(tana).getByRole('button', { name: 'Näita vastust' }));
      fireEvent.click(within(tana).getByRole('button', { name: /^Lihtne/ }));
    }
    await waitFor(() => expect(data.practiceService.saveToday).toHaveBeenCalledWith('user-1', expect.objectContaining({ done: ['words'] })));
    expect(data.wordsService.rate).toHaveBeenCalled();
    expect(data.wordsService.rate.mock.calls.every(([word]) => word.id !== 'own-1')).toBe(true);
    fireEvent.click(within(tana).getByRole('button', { name: 'Edasi' }));
    // the pet between steps
    expect(screen.getByRole('status')).toHaveTextContent('Aitäh! Sõnad on korratud.');
    fireEvent.click(screen.getByRole('button', { name: /Edasi: Laused ja grammatika/ }));
    // 3. sentences: his own sentence as „Paranda viga”
    expect(await screen.findByText('Paranda viga')).toBeInTheDocument();
    ['Ma', 'lähen', 'koju'].forEach((tile) => fireEvent.click(screen.getByRole('button', { name: tile })));
    fireEvent.click(screen.getByRole('button', { name: 'Kontrolli' }));
    fireEvent.click(screen.getByRole('button', { name: 'Edasi' }));
    await waitFor(() => expect(data.practiceService.saveToday).toHaveBeenCalledWith('user-1', expect.objectContaining({ done: ['sentences'] })));
    // his own card moved on its schedule
    await waitFor(() => expect(data.wordsService.rate).toHaveBeenCalledWith(expect.objectContaining({ id: 'own-1' }), expect.objectContaining({ rating: 'good' })));
    fireEvent.click(screen.getByRole('button', { name: 'Edasi' }));
    expect(screen.getByRole('status')).toHaveTextContent('Tubli! Laused tulevad juba paremini.');
    // the homework put off for later is not run again: the day ends
    fireEvent.click(screen.getByRole('button', { name: 'Lõpeta päev' }));
    expect(screen.getByText('Täna on tehtud!')).toBeInTheDocument();
    expect(screen.getByText('Aitäh! Täna on kõik tehtud. Olen sinu üle uhke!')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Valmis' }));
    const overview = screen.getByRole('region', { name: 'Täna' });
    expect(doneSteps(overview)).toEqual(['Sõnad', 'Laused ja grammatika']);
    expect(within(overview).getByRole('button', { name: /Tee ka edasilükatud/ })).toBeInTheDocument();
  });

  it('steps with nothing to do are skipped: no homework, no due words and no course for English → nothing to run', async () => {
    const data = repositories([{ id: 'student-1', name: 'Mari', subject: 'Inglise keel', level: 'B1', recordingConsent: true }], { invoiceRepository: { listByStudent: vi.fn().mockResolvedValue([]) } });
    data.homeworkRepository.listByStudentIds.mockResolvedValue([]);
    renderPage(data);
    const tana = await screen.findByRole('region', { name: 'Täna' });
    expect(within(tana).getByRole('heading', { name: 'Täna pole midagi teha' })).toBeInTheDocument();
    expect(tana.querySelectorAll('.tn-list li')).toHaveLength(0);
    expect(within(tana).queryByRole('button', { name: /Alusta/ })).toBeNull();
    expect(screen.queryByRole('list', { name: 'Sulle on uudiseid' })).not.toBeInTheDocument();
  });

  it('the monthly monologue reaches the homework step (bug: home never passed it to the decider)', async () => {
    const data = repositories([{ id: 'student-1', name: 'Mari', subject: 'Eesti keel', level: 'A2', recordingConsent: true }]);
    data.homeworkRepository.listByStudentIds.mockResolvedValue([]);
    renderPage(data);
    const tana = await screen.findByRole('region', { name: 'Täna' });
    expect(data.monologueRepository.listByStudent).toHaveBeenCalledWith('student-1');
    expect(within(tana).getByText(/Kuu monoloog/)).toBeInTheDocument();
    fireEvent.click(within(tana).getByRole('button', { name: /Alusta tänast/ }));
    expect(screen.getByRole('link', { name: /Ava ülesanne/ })).toHaveAttribute('href', '/student/monoloog');
  });

  it('a lesson going on now interrupts above everything with „Ava tund”', async () => {
    const data = repositories(undefined, { scheduleRepository: { listByStudent: vi.fn().mockResolvedValue([{ id: 'schedule-1', studentId: 'student-1', teacher: 'Tiina', date: today, time: '10:00', duration: 60, status: 'Planeeritud' }]) } });
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date(`${today}T10:10:00`));
    try {
      renderPage(data);
      const live = await screen.findByRole('alert');
      expect(live).toHaveTextContent('Tund käib praegu');
      expect(within(live).getByRole('link', { name: 'Ava tund' })).toHaveAttribute('href', '/live-classroom');
    } finally { vi.useRealTimers(); }
  });

  it('a stored tick of today (another device) shows the step as done', async () => {
    const data = repositories(undefined, { wordsService: wordsOf(dueWords) });
    renderPage(data, { user: { uid: 'user-1', displayName: 'Mari Õpilane', roles: ['student'], profile: { practice: { today: { date: today, day: 1, done: ['words'], xp: 4 }, xp: 40, learnDays: [today] } } } });
    const tana = await screen.findByRole('region', { name: 'Täna' });
    await waitFor(() => expect(doneSteps(tana)).toEqual(['Sõnad']));
    expect(within(tana).getByRole('button', { name: /Jätka/ })).toBeInTheDocument();
  });

  it('a child with a parent linked to the card does not see or even read the family\'s invoices; an adult sees only what is unpaid', async () => {
    const adult = repositories();
    const { unmount } = renderPage(adult);
    expect(await screen.findByText(/Tasumata arve: 30,00/)).toBeInTheDocument();
    unmount();
    const child = repositories([{ id: 'student-1', name: 'Mari', subject: 'Eesti keel', level: 'A1', linkedParentIds: ['parent-1'] }]);
    renderPage(child);
    await screen.findByRole('region', { name: 'Täna' });
    expect(screen.queryByText(/Tasumata/)).not.toBeInTheDocument();
    expect(child.invoiceRepository.listByStudent).not.toHaveBeenCalled();
  });

  it('new teacher feedback and an open announcement get one line each; the teacher\'s text is not repeated or made up', async () => {
    const now = new Date().toISOString();
    const data = repositories(undefined, {
      invoiceRepository: { listByStudent: vi.fn().mockResolvedValue([]) },
      announcementService: { mine: vi.fn().mockResolvedValue({ pending: [{ announcement: { title: 'Vaheaeg', responseType: 'read' } }] }) },
    });
    data.homeworkRepository.listSubmissionsByStudentIds.mockResolvedValue([{ id: 'x', submissionKind: 'worksheet', studentId: 'student-1', title: 'Minu pere', reviewStatus: 'reviewed', teacherGrade: 5, teacherFeedback: 'Väga tubli!', reviewedAt: now }]);
    renderPage(data);
    expect(await screen.findByRole('link', { name: /Õpetaja vaatas üle: Minu pere/ })).toHaveAttribute('href', '/homework#vaadatud');
    expect(await screen.findByRole('link', { name: /Uus teade: Vaheaeg/ })).toHaveAttribute('href', '/student/areng#teated');
    expect(screen.queryByText('Väga tubli!')).not.toBeInTheDocument();
  });

  it('does not load the course or lesson stats on the first screen (they load when the sentences step starts)', async () => {
    const catalogRepository = { listCurriculum: vi.fn() };
    const data = repositories();
    data.petRepository.lessonStats = vi.fn();
    renderPage({ ...data, catalogRepository });
    await screen.findByRole('region', { name: 'Täna' });
    expect(catalogRepository.listCurriculum).not.toHaveBeenCalled();
    expect(data.petRepository.lessonStats).not.toHaveBeenCalled();
    expect(data.courseLoaders.a2).not.toHaveBeenCalled();
  });

  it('home works without a pet when the learner switched it off, and offers the choice when none was chosen', async () => {
    const off = repositories(undefined, { petRepository: { get: vi.fn().mockResolvedValue({ optedOut: true }) } });
    const { unmount } = renderPage(off);
    await screen.findByRole('region', { name: 'Täna' });
    expect(screen.queryByText('Vali endale sõber')).not.toBeInTheDocument();
    unmount();
    renderPage(repositories());
    expect(await screen.findByText('Vali endale sõber')).toBeInTheDocument();
  });

  it('several subjects keep their switcher; staff preview reads the card, saves nothing and offers no reschedule or pet choice', async () => {
    const two = [{ id: 'student-1', name: 'Mari', recordingConsent: true, enrollments: [{ subject: 'Eesti keel', active: true }, { subject: 'Matemaatika', active: true }] }];
    const { unmount } = renderPage(repositories(two));
    expect(await screen.findByRole('tablist', { name: 'Minu õppeained' })).toBeInTheDocument();
    unmount();
    const data = repositories();
    renderPage(data, { preview: { studentId: 'student-1', readOnly: true } });
    await screen.findByRole('region', { name: 'Täna' });
    expect(data.studentRepository.getById).toHaveBeenCalledWith('student-1');
    expect(screen.queryByRole('button', { name: 'Ei saa tulla?' })).not.toBeInTheDocument();
    expect(screen.queryByText('Vali endale sõber')).not.toBeInTheDocument();
    expect(data.announcementService.mine).not.toHaveBeenCalled();
    expect(screen.getByText('Vaade: siit ei salvestata midagi.')).toBeInTheDocument();
  });

  it('shows a safe linking instruction when no self-owned profile exists', async () => {
    const data = repositories([]);
    renderPage(data);
    expect(await screen.findByText('Õpilase profiil ei ole kontoga seotud')).toBeInTheDocument();
    expect(screen.getByText(/Nime või e-posti põhjal profiili automaatselt ei seostata/)).toBeInTheDocument();
    expect(data.scheduleRepository.listByStudent).not.toHaveBeenCalled();
    expect(data.invoiceRepository.listByStudent).not.toHaveBeenCalled();
  });
});
