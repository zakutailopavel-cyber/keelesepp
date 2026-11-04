import { fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { AuthContext } from '../../app/AuthContext.jsx';
import { toIsoDate } from '../calendar/calendarView.js';
import { demoFamily, demoRepositories } from '../../test/parentLab/demoFamily.js';
import ParentDashboardPage from './ParentDashboardPage.jsx';

const user = { uid: 'demo-parent', displayName: 'Jelena Smirnova', roles: ['parent'] };
const renderPage = (repositories) => render(<MemoryRouter><AuthContext.Provider value={{ user }}><ParentDashboardPage {...repositories} /></AuthContext.Provider></MemoryRouter>);
const TODAY = '2026-11-04';

// teacher-only things a record could carry: none of them may reach the parent's screen
const SECRET = {
  analysis: { errors: [{ said: 'SALAJANE VIGA', corrected: 'x' }] },
  teacherNotes: 'SALAJANE MÄRKUS',
  callNote: 'SALAJANE KÕNE',
};

describe('„Minu pere” with the „Keeleoskus” curve (demo family)', () => {
  it('two children: chips with name + levels; the curve from the coursework 43 % → 62 %, the mock exam as a marker; no lesson balance', async () => {
    vi.useFakeTimers({ now: new Date(`${TODAY}T12:00:00`), toFake: ['Date'] });
    try {
      const data = demoFamily(toIsoDate(), 'two');
      // a package balance on the cards and secret fields on the records: the page must not show any of it
      data.students = data.students.map((student) => ({ ...student, lessonsLeft: 7, packageLessonsLeft: 7, balanceLessons: 7, ...SECRET }));
      data.lessons = data.lessons.map((lesson) => ({ ...lesson, ...SECRET }));
      data.assignments = data.assignments.map((item) => ({ ...item, ...SECRET }));
      data.progressPoints = data.progressPoints.map((item) => ({ ...item, ...SECRET }));
      const repositories = demoRepositories(data);
      const read = vi.spyOn(repositories.pointsService, 'listForStudents');
      renderPage(repositories);

      const switcher = await screen.findByRole('tablist', { name: /Laps/ });
      expect(within(switcher).getByRole('tab', { name: /Aleksandr/ })).toHaveTextContent('A1 → B1');
      expect(within(switcher).getByRole('tab', { name: /Sofia/ })).toHaveTextContent('A2 → B1');

      const areng = await screen.findByRole('region', { name: 'Areng' });
      expect(await within(areng).findByText('62 %', { selector: '.pf-now strong' }, { timeout: 4000 })).toBeInTheDocument();
      expect(within(areng).getByRole('heading', { name: /B1 keeleoskus/ })).toBeInTheDocument();
      expect(areng).toHaveTextContent('+19 % alates juulist');
      expect(areng).toHaveTextContent('Hinnang tasemele B1: kursuse eesmärgid');
      // one chart, the start labelled, the exam a labelled marker, the goal line named
      expect(within(areng).getAllByRole('img')).toHaveLength(1);
      expect(areng).toHaveTextContent('Algus 43 %');
      expect(areng).toHaveTextContent('Proovieksam 64 %');
      expect(areng).toHaveTextContent('B1 tase');
      expect(within(areng).getByRole('table')).toBeInTheDocument();
      expect(read).toHaveBeenCalledWith(['demo-aleksandr']);
      fireEvent.click(areng.querySelector('.pf-hit[data-point*="Proovieksam"]'));
      expect(areng.querySelector('.pf-caption')).toHaveTextContent('23. okt · Proovieksam · 64 % (kontroll)');

      const now = screen.getByRole('region', { name: 'Mida õpime praegu' });
      expect(now.querySelectorAll(".nl-steps em")).not.toHaveLength(0);
      now.querySelectorAll(".nl-steps em").forEach((label) => expect(label.textContent).not.toMatch(/\d+\s?%/)); // no per-goal percentages

      expect(screen.getByRole('region', { name: 'Järgmised tunnid' })).toHaveTextContent('Kadri Õpetaja');
      expect(screen.getByRole('region', { name: 'Kodutööd' })).toHaveTextContent('vaja teha');
      expect(screen.getByRole('region', { name: 'Arved' })).toHaveTextContent('Tasumata 200,00');

      const text = document.body.textContent;
      ['alles', 'Pakett', 'pakett', 'jääk', 'SALAJANE'].forEach((word) => expect(text).not.toContain(word));
    } finally { vi.useRealTimers(); }
  });

  it('a child with only the start point: the value, no curve yet', async () => {
    renderPage(demoRepositories(demoFamily(toIsoDate(), 'two')));
    fireEvent.click(await screen.findByRole('tab', { name: /Sofia/ }));
    const areng = screen.getByRole('region', { name: 'Areng' });
    expect(await within(areng).findByText('35 %', { selector: '.pf-now strong' }, { timeout: 4000 })).toBeInTheDocument();
    expect(areng).toHaveTextContent('Kõver tekib, kui mõõtmisi on vähemalt kaks');
    expect(within(areng).queryAllByRole('img')).toHaveLength(0);
  });

  it('a child with nothing yet: „Andmeid veel pole”, no invented numbers', async () => {
    renderPage(demoRepositories(demoFamily(toIsoDate(), 'empty')));
    const areng = await screen.findByRole('region', { name: 'Areng' });
    expect(await within(areng).findByText(/Andmeid veel pole/, {}, { timeout: 4000 })).toBeInTheDocument();
    expect(areng.textContent).not.toMatch(/\d+\s?%/);
    expect(screen.getByRole('region', { name: 'Mida õpime praegu' })).toHaveTextContent('Andmeid veel pole');
    expect(screen.queryByRole('tablist', { name: /Laps/ })).toBeNull();
    expect(screen.getByRole('region', { name: 'Arved' })).toHaveTextContent('Arveid ei ole');
  });

  it('reads only what a linked parent may read (no staff-only collections); a failed points read still shows the coursework', async () => {
    const repositories = demoRepositories(demoFamily(toIsoDate(), 'two'));
    const staffOnly = { listFollowups: vi.fn(), listAnalysis: vi.fn(), listNotes: vi.fn(), listSkillEstimates: vi.fn() };
    renderPage({ ...repositories, homeworkRepository: { ...repositories.homeworkRepository, ...staffOnly }, pointsService: { listForStudents: vi.fn().mockRejectedValue(new Error('permission-denied')) } });
    const areng = await screen.findByRole('region', { name: 'Areng' });
    expect(await within(areng).findByRole('img', {}, { timeout: 4000 })).toBeInTheDocument();
    expect(areng.querySelector('.pf-exam')).toBeNull();
    Object.values(staffOnly).forEach((fn) => expect(fn).not.toHaveBeenCalled());
  });
});
