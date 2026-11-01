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
  it('holds what moved from the home page and counts the results as seen', async () => {
    window.localStorage.removeItem('ks-feedback-seen-user-1');
    const data = repositories();
    renderPage(data);
    const growth = await screen.findByRole('region', { name: 'Minu areng' });
    expect(within(growth).getByText('Rääkimine')).toBeInTheDocument();
    expect(screen.getByText('Viimased tulemused')).toBeInTheDocument();
    expect(screen.getByText('Väga tubli!')).toBeInTheDocument();
    expect(screen.getByText('Hinne 5')).toBeInTheDocument();
    expect(data.catalogRepository.listCurriculum).toHaveBeenCalled();
    expect(Number(window.localStorage.getItem('ks-feedback-seen-user-1'))).toBeGreaterThan(0);
  });

  it('an unlinked account gets the same safe message', async () => {
    renderPage(repositories([]));
    expect(await screen.findByText('Õpilase profiil ei ole kontoga seotud')).toBeInTheDocument();
  });
});
