import { render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { AuthContext } from '../../app/AuthContext.jsx';
import { shiftDate, toIsoDate } from '../calendar/calendarView.js';
import StudentDashboardPage from './StudentDashboardPage.jsx';

const today = toIsoDate();
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
    wordsService: { subscribeForStudent: (id, onData) => { onData([]); return () => {}; } },
    ...extra,
  };
}

function renderPage(data, auth = {}) {
  const user = { uid: 'user-1', displayName: 'Mari Õpilane', roles: ['student'] };
  return render(<MemoryRouter><AuthContext.Provider value={{ user, ...auth }}><StudentDashboardPage {...data} /></AuthContext.Provider></MemoryRouter>);
}

describe('StudentDashboardPage', () => {
  it('first the greeting, one next step with one button and the next lesson; progress has moved away', async () => {
    const data = repositories();
    renderPage(data);
    expect(await screen.findByRole('heading', { name: 'Tere, Mari!' })).toBeInTheDocument();
    const step = screen.getByRole('region', { name: 'Järgmine samm' });
    expect(within(step).getByText('Õpi sõnad')).toBeInTheDocument();
    expect(within(step).getAllByRole('link')).toHaveLength(1);
    expect(within(step).getByRole('link', { name: /Tee ära/ })).toHaveAttribute('href', '/homework');
    expect(screen.getByText(/Järgmine tund:/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Ei saa tulla?' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Minu areng/ })).toHaveAttribute('href', '/student/areng');
    expect(screen.queryByRole('region', { name: 'Minu areng' })).not.toBeInTheDocument();
    expect(screen.queryByText('Viimased tulemused')).not.toBeInTheDocument();
    expect(screen.queryByText('Millal sulle tund sobib?')).not.toBeInTheDocument();
  });

  it('below the first screen: one short row per section with a small count, and the timetable with „Ei saa tulla?”', async () => {
    const data = repositories(undefined, { wordsService: { subscribeForStudent: (id, onData) => { onData([{ id: 's', word: 'Ma lähen koju.', translation: 'Sinu lause: x', box: 0, reviews: 1 }]); return () => {}; } } });
    renderPage(data);
    const sections = await screen.findByRole('region', { name: 'Minu õppimine' });
    const row = (name) => within(sections).getByRole('link', { name });
    await waitFor(() => expect(row(/Minu vead/)).toHaveTextContent('1'));
    expect(row(/Ülesanded/)).toHaveAttribute('href', '/homework');
    expect(row(/Ülesanded/)).toHaveTextContent('1');
    expect(row(/Sõnad/)).toHaveAttribute('href', '/student/sonavara');
    expect(row(/Minu vead/)).toHaveAttribute('href', '/student/vead');
    expect(row(/Minu vead/)).toHaveTextContent('1');
    expect(row(/Tunni tahvlid/)).toHaveAttribute('href', '/board');
    expect(row(/Minu areng/)).toHaveAttribute('href', '/student/areng');
    expect(within(sections).getByRole('heading', { name: /Tunniplaan/ })).toBeInTheDocument();
    expect(within(sections).getByText(/Järgmine tund:/)).toBeInTheDocument();
    expect(within(sections).getByRole('button', { name: 'Ei saa tulla?' })).toBeInTheDocument();
    expect(within(sections).queryByText(/Mängi|sõber/)).not.toBeInTheDocument();
  });

  it('the first screen is the next step first and the pet\'s one request with its mood, nothing else', async () => {
    const ago = (days) => new Date(Date.now() - days * 86400000).toISOString();
    const words = ['koer', 'kass', 'maja'].map((id) => ({ id, word: id, translation: `t-${id}`, box: 1, reviews: 2, dueAt: ago(1), reviewedAt: ago(4) }));
    const data = repositories(undefined, {
      petRepository: { get: vi.fn().mockResolvedValue({ kind: 'siil', name: 'Okki', playedAt: ago(5) }), lessonStats: vi.fn().mockResolvedValue([]), update: vi.fn(), publish: vi.fn().mockResolvedValue() },
      wordsService: { subscribeForStudent: (id, onData) => { onData(words); return () => {}; } },
    });
    const { container } = renderPage(data);
    const pet = await screen.findByRole('region', { name: 'Okki' });
    const hero = container.querySelector('.sh-hero');
    expect([...hero.children].map((node) => node.getAttribute('aria-label'))).toEqual(['Järgmine samm', 'Okki']);
    await waitFor(() => expect(within(pet).getByText(/Tuju: näljane/)).toBeInTheDocument());
    expect(within(pet).getByRole('button', { name: /Kordame 3 sõna/ })).toBeInTheDocument();
    expect(within(hero).queryByText(/Järgmine tund:/)).not.toBeInTheDocument();
  });

  it('a lesson later today is the next step when no homework is close, and its button leads to the timetable', async () => {
    const data = repositories(undefined, {
      invoiceRepository: { listByStudent: vi.fn().mockResolvedValue([]) },
      scheduleRepository: { listByStudent: vi.fn().mockResolvedValue([{ id: 'schedule-1', studentId: 'student-1', teacher: 'Tiina', date: today, time: '23:59', duration: 60, status: 'Planeeritud' }]) },
    });
    data.homeworkRepository.listByStudentIds.mockResolvedValue([]);
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date(`${today}T10:00:00`));
    try {
      renderPage(data);
      const step = await screen.findByRole('region', { name: 'Järgmine samm' });
      expect(within(step).getByText('Täna kell 23:59 on tund')).toBeInTheDocument();
      expect(within(step).getByRole('link', { name: /Vaata tunniplaani/ })).toHaveAttribute('href', '#tunniplaan');
      expect(document.getElementById('tunniplaan')).not.toBeNull();
    } finally { vi.useRealTimers(); }
  });

  it('a child with a parent linked to the card does not see or even read the family\'s invoices; an adult sees only what is unpaid', async () => {
    const adult = repositories();
    const { unmount } = renderPage(adult);
    expect(await screen.findByText(/Tasumata arve: 30,00/)).toBeInTheDocument();
    unmount();
    const child = repositories([{ id: 'student-1', name: 'Mari', subject: 'Eesti keel', level: 'A1', linkedParentIds: ['parent-1'] }]);
    renderPage(child);
    await screen.findByRole('region', { name: 'Järgmine samm' });
    expect(screen.queryByText(/Tasumata/)).not.toBeInTheDocument();
    expect(child.invoiceRepository.listByStudent).not.toHaveBeenCalled();
  });

  it('shows no empty blocks: without news there are no lines, and a section with nothing waiting has no count', async () => {
    const data = repositories(undefined, { invoiceRepository: { listByStudent: vi.fn().mockResolvedValue([]) } });
    data.homeworkRepository.listByStudentIds.mockResolvedValue([]);
    const { container } = renderPage(data);
    await screen.findByRole('region', { name: 'Järgmine samm' });
    expect(screen.queryByRole('list', { name: 'Sulle on uudiseid' })).not.toBeInTheDocument();
    expect(container.querySelectorAll('.sh-sections li em')).toHaveLength(0);
    expect(screen.getByText('Praegu on kõik tehtud')).toBeInTheDocument();
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

  it('does not load the course or lesson stats on the first screen', async () => {
    const catalogRepository = { listCurriculum: vi.fn() };
    const data = repositories();
    data.petRepository.lessonStats = vi.fn();
    renderPage({ ...data, catalogRepository });
    await screen.findByRole('region', { name: 'Minu õppimine' });
    expect(catalogRepository.listCurriculum).not.toHaveBeenCalled();
    expect(data.petRepository.lessonStats).not.toHaveBeenCalled();
  });

  it('home works without a pet when the learner switched it off, and offers the choice when none was chosen', async () => {
    const off = repositories(undefined, { petRepository: { get: vi.fn().mockResolvedValue({ optedOut: true }) } });
    const { unmount } = renderPage(off);
    await screen.findByRole('region', { name: 'Järgmine samm' });
    expect(screen.queryByText('Vali endale sõber')).not.toBeInTheDocument();
    unmount();
    renderPage(repositories());
    expect(await screen.findByText('Vali endale sõber')).toBeInTheDocument();
  });

  it('several subjects keep their switcher; staff preview reads the card and offers no reschedule or pet choice', async () => {
    const two = [{ id: 'student-1', name: 'Mari', recordingConsent: true, enrollments: [{ subject: 'Eesti keel', active: true }, { subject: 'Matemaatika', active: true }] }];
    const { unmount } = renderPage(repositories(two));
    expect(await screen.findByRole('tablist', { name: 'Minu õppeained' })).toBeInTheDocument();
    unmount();
    const data = repositories();
    renderPage(data, { preview: { studentId: 'student-1', readOnly: true } });
    await screen.findByRole('region', { name: 'Järgmine samm' });
    expect(data.studentRepository.getById).toHaveBeenCalledWith('student-1');
    expect(screen.queryByRole('button', { name: 'Ei saa tulla?' })).not.toBeInTheDocument();
    expect(screen.queryByText('Vali endale sõber')).not.toBeInTheDocument();
    expect(data.announcementService.mine).not.toHaveBeenCalled();
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
