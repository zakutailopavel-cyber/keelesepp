import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthContext } from '../../app/AuthContext.jsx';
import { shiftDate, toIsoDate } from '../calendar/calendarView.js';
import StudentPracticePage from './StudentPracticePage.jsx';

const today = toIsoDate();
const ago = (days) => new Date(Date.now() - days * 86400000).toISOString();
const dueWords = ['koer', 'kass', 'maja'].map((id) => ({ id, word: id, translation: `t-${id}`, box: 1, reviews: 2, dueAt: ago(1), reviewedAt: ago(4) }));
const ownSentence = { id: 'own-1', word: 'Ma lähen koju', translation: 'Sinu lause: Ma lähen kodus', box: 0, reviews: 1, dueAt: ago(1) };
const wordsOf = (list) => ({ subscribeForStudent: (id, onData) => { onData(list); return () => {}; }, rate: vi.fn().mockResolvedValue({}) });

function repositories(students = [{ id: 'student-1', name: 'Mari', subject: 'Eesti keel', level: 'A1', targetLevel: 'A2' }], extra = {}) {
  return {
    studentRepository: { listSelf: vi.fn().mockResolvedValue(students), getById: vi.fn().mockResolvedValue(students[0]) },
    homeworkRepository: {
      listByStudentIds: vi.fn().mockResolvedValue([{ id: 'homework-1', studentId: 'student-1', task: 'Õpi sõnad', due: shiftDate(today, 2), status: 'Ootel' }]),
      listSubmissionsByStudentIds: vi.fn().mockResolvedValue([]),
      listWorksheetAssignmentsByStudentIds: vi.fn().mockResolvedValue([]),
    },
    scheduleRepository: { listByStudent: vi.fn().mockResolvedValue([]) },
    lessonRepository: { listByStudent: vi.fn().mockResolvedValue([]) },
    petRepository: { get: vi.fn().mockResolvedValue(null), lessonStats: vi.fn().mockResolvedValue([]) },
    monologueRepository: { listByStudent: vi.fn().mockResolvedValue([]) },
    wordsService: wordsOf([]),
    practiceService: { saveToday: vi.fn(async () => null) },
    // the course of his level: empty here, so the practice lesson is made of his own sentences only
    courseLoaders: { a2: vi.fn(async () => ({ MODULES: [] })), b1: vi.fn(async () => ({ MODULES: [] })) },
    ...extra,
  };
}
function renderPage(data, auth = {}) {
  const user = { uid: 'user-1', displayName: 'Mari Õpilane', roles: ['student'] };
  return render(<MemoryRouter><AuthContext.Provider value={{ user, ...auth }}><StudentPracticePage {...data} /></AuthContext.Provider></MemoryRouter>);
}
const doneSteps = (region) => [...region.querySelectorAll('.pf-list li.is-done b')].map((node) => node.textContent);

describe('„Harjuta” — the daily practice tab', () => {
  beforeEach(() => { globalThis.sessionStorage?.clear?.(); globalThis.localStorage?.clear?.(); });

  it('lists the steps in order with one button; no underlined text links', async () => {
    const data = repositories(undefined, { wordsService: wordsOf(dueWords) });
    renderPage(data);
    const flow = await screen.findByRole('region', { name: 'Harjuta' });
    // the practice starts with words, never with homework (owner + review 2026-11-11)
    await waitFor(() => expect([...flow.querySelectorAll('.pf-list b')].map((node) => node.textContent)).toEqual(['Sõnad', 'Laused ja grammatika']));
    expect(within(flow).getAllByRole('button')).toHaveLength(1);
    expect(within(flow).getByRole('button', { name: /Alusta tänast/ })).toHaveClass('button', 'button--primary');
    expect(flow.querySelector('.link-button')).toBeNull();
    expect(data.courseLoaders.a2).not.toHaveBeenCalled();
    expect(data.petRepository.lessonStats).not.toHaveBeenCalled();
    // the teacher's next task: a separate card below the practice, opening that very task
    const task = screen.getByRole('region', { name: 'Õpetaja ülesanne' });
    expect(task).toHaveTextContent('Õpi sõnad');
    expect(within(task).getByRole('link', { name: /Ava kaardid/ })).toHaveAttribute('href', '/student/harjuta?kaardid=homework-1');
    expect(flow.compareDocumentPosition(task) & globalThis.Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it('„Alusta tänast” runs words, then sentences; each is ticked, the pet reacts, the day ends with its thanks', async () => {
    const data = repositories(undefined, { wordsService: wordsOf([...dueWords, ownSentence]) });
    renderPage(data);
    const start = await screen.findByRole('region', { name: 'Harjuta' });
    await waitFor(() => expect(start.querySelectorAll('.pf-list li')).toHaveLength(2));
    fireEvent.click(within(start).getByRole('button', { name: /Alusta tänast/ }));
    const flow = screen.getByRole('region', { name: 'Harjuta: Sõnad' });
    expect(within(flow).getByText('Samm 1 / 2')).toBeInTheDocument();
    for (let i = 0; i < 12 && within(flow).queryByRole('button', { name: 'Näita vastust' }); i += 1) {
      fireEvent.click(within(flow).getByRole('button', { name: 'Näita vastust' }));
      fireEvent.click(within(flow).getByRole('button', { name: /^Lihtne/ }));
    }
    await waitFor(() => expect(data.practiceService.saveToday).toHaveBeenCalledWith('user-1', expect.objectContaining({ done: ['words'] })));
    expect(data.wordsService.rate.mock.calls.every(([word]) => word.id !== 'own-1')).toBe(true);
    fireEvent.click(within(flow).getByRole('button', { name: 'Edasi' }));
    expect(screen.getByRole('status')).toHaveTextContent('Aitäh! Sõnad on korratud.');
    fireEvent.click(screen.getByRole('button', { name: /Edasi: Laused ja grammatika/ }));
    expect(await screen.findByText('Paranda viga')).toBeInTheDocument();
    expect(data.petRepository.lessonStats).toHaveBeenCalledWith('user-1');
    ['Ma', 'lähen', 'koju'].forEach((tile) => fireEvent.click(screen.getByRole('button', { name: tile })));
    fireEvent.click(screen.getByRole('button', { name: 'Kontrolli' }));
    fireEvent.click(screen.getByRole('button', { name: 'Edasi' }));
    await waitFor(() => expect(data.practiceService.saveToday).toHaveBeenCalledWith('user-1', expect.objectContaining({ done: ['sentences'] })));
    await waitFor(() => expect(data.wordsService.rate).toHaveBeenCalledWith(expect.objectContaining({ id: 'own-1' }), expect.objectContaining({ rating: 'good' })));
    fireEvent.click(screen.getByRole('button', { name: 'Edasi' }));
    expect(screen.getByRole('status')).toHaveTextContent('Tubli! Laused tulevad juba paremini.');
    fireEvent.click(screen.getByRole('button', { name: 'Lõpeta päev' }));
    expect(screen.getByText('Täna on tehtud!')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Valmis' }));
    const overview = screen.getByRole('region', { name: 'Harjuta' });
    expect(doneSteps(overview)).toEqual(['Sõnad', 'Laused ja grammatika']);
    expect(within(overview).getByRole('heading', { name: 'Kõik on tehtud!' })).toBeInTheDocument();
    // the open homework does not undo the finished day; it waits in its own card
    expect(screen.getByRole('region', { name: 'Õpetaja ülesanne' })).toHaveTextContent('Õpi sõnad');
  });

  it('steps with nothing to do are skipped; English without own sentences → nothing to practise', async () => {
    const data = repositories([{ id: 'student-1', name: 'Mari', subject: 'Inglise keel', level: 'B1' }]);
    data.homeworkRepository.listByStudentIds.mockResolvedValue([]);
    renderPage(data);
    const flow = await screen.findByRole('region', { name: 'Harjuta' });
    expect(within(flow).getByRole('heading', { name: 'Täna pole midagi harjutada' })).toBeInTheDocument();
    expect(within(flow).queryByRole('button', { name: /Alusta/ })).toBeNull();
  });

  it('a lesson going on now shows „Ava tund” above the steps', async () => {
    const data = repositories(undefined, { scheduleRepository: { listByStudent: vi.fn().mockResolvedValue([{ id: 's1', studentId: 'student-1', teacher: 'Tiina', date: today, time: '10:00', duration: 60, status: 'Planeeritud' }]) } });
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date(`${today}T10:10:00`));
    try {
      renderPage(data);
      const live = await screen.findByRole('alert');
      expect(live).toHaveTextContent('Tund käib praegu');
      expect(within(live).getByRole('link', { name: 'Ava tund' })).toHaveAttribute('href', '/live-classroom');
    } finally { vi.useRealTimers(); }
  });

  it('a stored tick of today (another device) shows the step as done; the staff preview saves nothing', async () => {
    const data = repositories(undefined, { wordsService: wordsOf(dueWords) });
    renderPage(data, { user: { uid: 'user-1', displayName: 'Mari', roles: ['student'], profile: { practice: { today: { date: today, day: 1, done: ['words'], xp: 4 }, xp: 40, learnDays: [today] } } } });
    const flow = await screen.findByRole('region', { name: 'Harjuta' });
    await waitFor(() => expect(doneSteps(flow)).toEqual(['Sõnad']));
    expect(within(flow).getByRole('button', { name: /Jätka/ })).toBeInTheDocument();
  });

  it('the staff preview reads the card and says nothing is saved', async () => {
    const data = repositories();
    renderPage(data, { preview: { studentId: 'student-1', readOnly: true } });
    await screen.findByRole('region', { name: 'Harjuta' });
    expect(data.studentRepository.getById).toHaveBeenCalledWith('student-1');
    expect(screen.getByText('Vaade: siit ei salvestata midagi.')).toBeInTheDocument();
  });

  it('the finished screen thanks once: the pet card below does not repeat the line', async () => {
    const pet = { kind: 'siil', name: 'Okki', playedAt: ago(5) };
    const data = repositories([{ id: 'student-1', name: 'Mari', subject: 'Inglise keel', level: 'B1' }], {
      wordsService: wordsOf(dueWords),
      petRepository: { get: vi.fn().mockResolvedValue(pet), lessonStats: vi.fn().mockResolvedValue([]), update: vi.fn(), publish: vi.fn().mockResolvedValue() },
    });
    data.homeworkRepository.listByStudentIds.mockResolvedValue([]);
    renderPage(data);
    const start = await screen.findByRole('region', { name: 'Harjuta' });
    await waitFor(() => expect(start.querySelectorAll('.pf-list li')).toHaveLength(1));
    fireEvent.click(within(start).getByRole('button', { name: /Alusta tänast/ }));
    const flow = screen.getByRole('region', { name: 'Harjuta: Sõnad' });
    for (let i = 0; i < 12 && within(flow).queryByRole('button', { name: 'Näita vastust' }); i += 1) {
      fireEvent.click(within(flow).getByRole('button', { name: 'Näita vastust' }));
      fireEvent.click(within(flow).getByRole('button', { name: /^Lihtne/ }));
    }
    fireEvent.click(within(flow).getByRole('button', { name: 'Edasi' }));
    fireEvent.click(screen.getByRole('button', { name: 'Lõpeta päev' }));
    expect(screen.getByText('Täna on tehtud!')).toBeInTheDocument();
    expect([...document.querySelectorAll("p")].filter((node) => node.textContent.includes("Everything is done today"))).toHaveLength(1);
    expect(screen.getByRole('region', { name: 'Okki' })).toBeInTheDocument();
  });

  describe('a teacher\'s word task opened from „Ülesanded” (?kaardid=, owner 2026-11-10)', () => {
    const lessonWords = ['valutama', 'retsept'].map((id) => ({ id, word: id, translation: `t-${id}`, invitationId: 'inv-1', box: 0, reviews: 0, createdAt: ago(1) }));
    const wordTask = { id: 'hw-w', studentId: 'student-1', task: 'Korda tunni sõnu sõnakaartidega 10 minutit', status: 'Ootel', invitationId: 'inv-1' };
    const openTask = (data, auth) => render(<MemoryRouter initialEntries={['/student/harjuta?kaardid=hw-w']}><AuthContext.Provider value={{ user: { uid: 'user-1', displayName: 'Mari', roles: ['student'] }, ...auth }}><StudentPracticePage {...data} /></AuthContext.Provider></MemoryRouter>);
    const answerAll = (card) => {
      for (let i = 0; i < 12 && within(card).queryByRole('button', { name: 'Näita vastust' }); i += 1) {
        fireEvent.click(within(card).getByRole('button', { name: 'Näita vastust' }));
        fireEvent.click(within(card).getByRole('button', { name: /^Lihtne/ }));
      }
    };

    it('runs that lesson\'s words; the finished session marks the task done (the same „Tehtud” as on „Ülesanded”)', async () => {
      const data = repositories(undefined, { wordsService: wordsOf([...lessonWords, ...dueWords]) });
      data.homeworkRepository.listByStudentIds.mockResolvedValue([wordTask]);
      data.homeworkRepository.setStatus = vi.fn().mockResolvedValue(undefined);
      openTask(data);
      const card = await screen.findByRole('region', { name: 'Õpetaja ülesanne' });
      expect(card).toHaveTextContent('Korda tunni sõnu sõnakaartidega 10 minutit');
      await waitFor(() => expect(within(card).getByRole('button', { name: 'Näita vastust' })).toBeInTheDocument());
      expect(card).not.toHaveTextContent('kordame sinu tänaseid kaarte');
      answerAll(card);
      await waitFor(() => expect(data.homeworkRepository.setStatus).toHaveBeenCalledWith('hw-w', 'Tehtud'));
      expect(data.wordsService.rate.mock.calls.map(([word]) => word.id).every((id) => ['valutama', 'retsept'].includes(id))).toBe(true);
      // lesson words are not today's queue: the words step is not ticked by this
      expect(data.practiceService.saveToday).not.toHaveBeenCalledWith('user-1', expect.objectContaining({ done: ['words'] }));
    });

    it('no words of that lesson: today\'s cards, and the day\'s words step is ticked too', async () => {
      const data = repositories(undefined, { wordsService: wordsOf(dueWords) });
      data.homeworkRepository.listByStudentIds.mockResolvedValue([wordTask]);
      data.homeworkRepository.setStatus = vi.fn().mockResolvedValue(undefined);
      openTask(data);
      const card = await screen.findByRole('region', { name: 'Õpetaja ülesanne' });
      await waitFor(() => expect(card).toHaveTextContent('kordame sinu tänaseid kaarte'));
      answerAll(card);
      await waitFor(() => expect(data.homeworkRepository.setStatus).toHaveBeenCalledWith('hw-w', 'Tehtud'));
      await waitFor(() => expect(data.practiceService.saveToday).toHaveBeenCalledWith('user-1', expect.objectContaining({ done: ['words'] })));
    });

    it('in the staff preview it practises and saves nothing', async () => {
      const data = repositories(undefined, { wordsService: wordsOf(lessonWords) });
      data.homeworkRepository.listByStudentIds.mockResolvedValue([wordTask]);
      data.homeworkRepository.setStatus = vi.fn();
      openTask(data, { preview: { studentId: 'student-1' } });
      const card = await screen.findByRole('region', { name: 'Õpetaja ülesanne' });
      await waitFor(() => expect(within(card).getByRole('button', { name: 'Näita vastust' })).toBeInTheDocument());
      answerAll(card);
      expect(await within(card).findByText(/Vaade: siit ei salvestata midagi/)).toBeInTheDocument();
      expect(data.homeworkRepository.setStatus).not.toHaveBeenCalled();
      expect(data.wordsService.rate).not.toHaveBeenCalled();
    });
  });
});
