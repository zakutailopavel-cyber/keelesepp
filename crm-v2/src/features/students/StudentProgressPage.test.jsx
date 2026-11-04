import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { AuthContext } from '../../app/AuthContext.jsx';
import StudentProgressPage from './StudentProgressPage.jsx';

const students = [{ id: 'student-1', name: 'Mari', subject: 'Eesti keel', level: 'A1', targetLevel: 'A2', skillMap: { rääkimine: 72 } }];
const repositories = (list = students) => ({
  studentRepository: { listSelf: vi.fn().mockResolvedValue(list) },
  homeworkRepository: {
    listWorksheetAssignmentsByStudentIds: vi.fn().mockResolvedValue([]),
    listByStudentIds: vi.fn().mockResolvedValue([]),
    listSubmissionsByStudentIds: vi.fn().mockResolvedValue(list.length ? [{ id: 'submission-1', submissionKind: 'worksheet', studentId: 'student-1', title: 'Minu pere', reviewStatus: 'reviewed', teacherGrade: 5, teacherFeedback: 'Väga tubli!' }] : []),
  },
  lessonRepository: { listByStudent: vi.fn().mockResolvedValue([]) },
  petRepository: { lessonStats: vi.fn().mockResolvedValue([]) },
  catalogRepository: { listCurriculum: vi.fn().mockResolvedValue([]) },
  wordsService: { subscribeForStudent: (id, onData) => { onData([]); return () => {}; } },
  summaryService: { subscribeForStudent: (id, onData) => { onData([]); return () => {}; } },
  announcementService: { mine: vi.fn().mockResolvedValue({ pending: [], past: [] }) },
});
const renderPage = (data) => render(<MemoryRouter initialEntries={['/student/areng']}><AuthContext.Provider value={{ user: { uid: 'user-1', displayName: 'Mari', roles: ['student'] } }}><StudentProgressPage {...data} /></AuthContext.Provider></MemoryRouter>);

describe('StudentProgressPage', () => {
  it('holds what moved from the home page; the feedback lives on „Ülesanded”', async () => {
        const data = repositories();
    renderPage(data);
    const growth = await screen.findByRole('region', { name: 'Minu areng' });
    expect(within(growth).getByText('Rääkimine')).toBeInTheDocument();
    expect(screen.queryByText('Viimased tulemused')).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Õpetaja tagasiside/ })).toHaveAttribute('href', '/homework#vaadatud');
    expect(data.catalogRepository.listCurriculum).toHaveBeenCalled();
  });

  it('„Sinu B1 keeleoskus” at the top of „Minu areng”: the same curve as the parents see', async () => {
    const data = repositories([{ ...students[0], level: 'A2', targetLevel: 'B1' }]);
    const goals = ['l1|g_read', 'l2|g_read'];
    const sheet = (lesson, phase, day) => ({ id: `${lesson}-${phase}`, studentId: 'student-1', status: 'done', completedAt: `${day}T12:00:00Z`, worksheetDoc: { id: `ws_${lesson}_${phase}` }, score: { perGoal: { g_read: { ok: 9, total: 10 } } } });
    data.homeworkRepository.listWorksheetAssignmentsByStudentIds.mockResolvedValue([sheet('l1', 'discover', '2026-10-05'), sheet('l1', 'practice', '2026-10-06')]);
    const pointsService = { listForStudents: vi.fn().mockResolvedValue([{ id: 'p1', studentId: 'student-1', date: '2026-10-01', level: 'B1', percent: 40, kind: 'teacher', label: 'Algus' }]) };
    renderPage({ ...data, pointsService, goalsLoader: vi.fn().mockResolvedValue(goals) });
    const curve = await screen.findByRole('region', { name: 'Areng' });
    expect(await within(curve).findByRole('heading', { name: /Sinu B1 keeleoskus/ })).toBeInTheDocument();
    // 40 + 60 × 1 / 2 = 70 % now
    expect(await within(curve).findByText('70 %', { selector: '.pf-now strong' })).toBeInTheDocument();
    expect(pointsService.listForStudents).toHaveBeenCalledWith(['student-1']);
    // it comes before the older „Minu areng” card
    const order = [...document.querySelectorAll('section[aria-label]')].map((node) => node.getAttribute('aria-label'));
    expect(order.indexOf('Areng')).toBeLessThan(order.indexOf('Minu areng'));
  });

  it('an unlinked account gets the same safe message', async () => {
    renderPage(repositories([]));
    expect(await screen.findByText('Õpilase profiil ei ole kontoga seotud')).toBeInTheDocument();
  });
});
