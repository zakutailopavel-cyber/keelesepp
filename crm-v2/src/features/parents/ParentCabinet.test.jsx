import { fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { AuthContext } from '../../app/AuthContext.jsx';
import { toIsoDate } from '../calendar/calendarView.js';
import { demoFamily, demoRepositories } from '../../test/parentLab/demoFamily.js';
import ParentDashboardPage from './ParentDashboardPage.jsx';

const user = { uid: 'demo-parent', displayName: 'Katrin Tamm', roles: ['parent'] };
const renderPage = (repositories) => render(<MemoryRouter><AuthContext.Provider value={{ user }}><ParentDashboardPage {...repositories} /></AuthContext.Provider></MemoryRouter>);

// teacher-only things a record could carry: none of them may reach the parent's screen
const SECRET = {
  analysis: { errors: [{ said: 'SALAJANE VIGA', corrected: 'x' }] },
  teacherNotes: 'SALAJANE MÄRKUS',
  callNote: 'SALAJANE KÕNE',
};

describe('„Minu pere” with the development chart (demo family)', () => {
  it('two children: chips with name + level, Mia\'s four monthly charts with a table, no lesson balance', async () => {
    const data = demoFamily(toIsoDate(), 'two');
    // a package balance on the cards and secret fields on the records: the page must not show any of it
    data.students = data.students.map((student) => ({ ...student, lessonsLeft: 7, packageLessonsLeft: 7, balanceLessons: 7, ...SECRET }));
    data.lessons = data.lessons.map((lesson) => ({ ...lesson, ...SECRET }));
    data.assignments = data.assignments.map((item) => ({ ...item, ...SECRET }));
    const repositories = demoRepositories(data);
    const subscribe = vi.spyOn(repositories.wordsService, 'subscribeForStudent');
    renderPage(repositories);

    const switcher = await screen.findByRole('tablist', { name: /Laps/ });
    expect(within(switcher).getByRole('tab', { name: /Mia/ })).toHaveTextContent('B1');
    expect(within(switcher).getByRole('tab', { name: /Oskar/ })).toHaveTextContent('A2');

    const areng = await screen.findByRole('region', { name: 'Areng' });
    const charts = within(areng).getAllByRole('img');
    expect(charts).toHaveLength(4);
    expect(charts[0]).toHaveAccessibleName(/^Tunnid: juuli|^Tunnid: /);
    expect(within(areng).getByRole('figure', { name: /Sõnu sõnastikus/ })).toBeInTheDocument();
    expect(within(areng).getByRole('table')).toBeInTheDocument();
    // words come from Mia's own dictionary only (the chosen child)
    expect(subscribe).toHaveBeenCalledWith('demo-mia', expect.any(Function), expect.any(Function));
    expect(subscribe).not.toHaveBeenCalledWith('demo-oskar', expect.anything(), expect.anything());

    // picking a month shows that month in every chart
    fireEvent.click(areng.querySelectorAll('.pc-hit')[0]);
    expect(within(areng).getAllByText(/^juuli/).length).toBeGreaterThan(0);

    const now = screen.getByRole('region', { name: 'Mida õpime praegu' });
    expect(now).toHaveTextContent('Töö ja amet');
    expect(now).toHaveTextContent('Oskan');
    expect(now).toHaveTextContent('Harjutan');
    expect(now).toHaveTextContent('Kordame');
    expect(now.textContent).not.toMatch(/\d+\s?%/); // no percentages for the family

    expect(screen.getByRole('region', { name: 'Järgmised tunnid' })).toHaveTextContent('Kadri Õpetaja');
    expect(screen.getByRole('region', { name: 'Kodutööd' })).toHaveTextContent('vaja teha');
    expect(screen.getByRole('region', { name: 'Arved' })).toHaveTextContent('Tasumata 200,00');

    const text = document.body.textContent;
    ['alles', 'Pakett', 'pakett', 'jääk', 'SALAJANE'].forEach((word) => expect(text).not.toContain(word));
    expect(text).not.toMatch(/\b7 tundi\b.*alles/);
  });

  it('a child with one month: no curve yet, the reason and this month\'s numbers', async () => {
    renderPage(demoRepositories(demoFamily(toIsoDate(), 'two')));
    fireEvent.click(await screen.findByRole('tab', { name: /Oskar/ }));
    const areng = screen.getByRole('region', { name: 'Areng' });
    expect(areng).toHaveTextContent('Graafik tekib, kui andmeid on vähemalt 2 kuu kohta');
    expect(within(areng).queryAllByRole('img')).toHaveLength(0);
    expect(areng).toHaveTextContent('1 tund');
    expect(areng).toHaveTextContent('14');
    expect(areng).toHaveTextContent('andmeid veel pole');
  });

  it('a child with nothing yet: „Andmeid veel pole”, no invented numbers', async () => {
    renderPage(demoRepositories(demoFamily(toIsoDate(), 'empty')));
    const areng = await screen.findByRole('region', { name: 'Areng' });
    expect(areng).toHaveTextContent('Andmeid veel pole');
    expect(screen.getByRole('region', { name: 'Mida õpime praegu' })).toHaveTextContent('Andmeid veel pole');
    expect(screen.queryByRole('tablist', { name: /Laps/ })).toBeNull();
    expect(screen.getByRole('region', { name: 'Arved' })).toHaveTextContent('Arveid ei ole');
  });

  it('reads only what a linked parent may read (no staff-only collections)', async () => {
    const repositories = demoRepositories(demoFamily(toIsoDate(), 'two'));
    const staffOnly = { listFollowups: vi.fn(), listAnalysis: vi.fn(), listNotes: vi.fn(), listSkillEstimates: vi.fn() };
    renderPage({ ...repositories, homeworkRepository: { ...repositories.homeworkRepository, ...staffOnly } });
    await screen.findByRole('region', { name: 'Areng' });
    Object.values(staffOnly).forEach((fn) => expect(fn).not.toHaveBeenCalled());
  });
});
