import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import { AuthContext } from '../../app/AuthContext.jsx';
import { announceLessonMarked } from '../calendar/lessonActions.js';
import DashboardPage from './DashboardPage.jsx';

const NOW = new Date('2026-11-06T10:40:00Z'); // reede 12:40 in Tallinn
const now = () => NOW;

function repositories() {
  return {
    students: { list: vi.fn().mockResolvedValue({ items: [{ id: 'student-1', name: 'Mari', teacher: 'Kati', active: true }] }) },
    schedule: { list: vi.fn().mockResolvedValue([{ id: 'lesson-1', date: '2099-08-10', time: '10:00', duration: 60, status: 'Planeeritud', studentId: 'student-1', studentName: 'Mari' }]) },
    invoices: { list: vi.fn().mockResolvedValue([{ id: 'invoice-1', amountCents: 10000, balanceDueCents: 10000, due: '2020-01-01', status: 'Ootel' }]) },
    homework: {
      list: vi.fn().mockResolvedValue([{ id: 'homework-1', status: 'Ootel' }]),
      listByStudentIds: vi.fn().mockResolvedValue([{ id: 'homework-1', status: 'Ootel' }]),
    },
    groups: { list: vi.fn().mockResolvedValue([]) },
    today: {
      lessons: vi.fn(async () => []), seen: vi.fn(async () => new Map()), plans: vi.fn(async () => []), packages: vi.fn(async () => []), owed: vi.fn(async () => []),
      leads: vi.fn(async () => []), worksheetsDue: vi.fn(async () => []), followups: vi.fn(async () => []), addFollowup: vi.fn(),
    },
    clientErrors: { listRecent: vi.fn(async () => []) },
    retention: { words: vi.fn(async () => []) },
  };
}

function renderDashboard(user, dataRepositories) {
  return render(
    <MemoryRouter>
      <AuthContext.Provider value={{ user }}>
        <DashboardPage repositories={dataRepositories} now={now} />
      </AuthContext.Provider>
    </MemoryRouter>,
  );
}
const attention = () => screen.getByRole('region', { name: 'Vajab tähelepanu' });
const ADMIN = { uid: 'admin-1', displayName: 'Pavel Zakutailo', roles: ['admin'] };

describe('DashboardPage — calm home', () => {
  it('while the first data loads: placeholder cards shaped like the page (no spinner), then the page', async () => {
    const repo = repositories();
    let release;
    repo.students.list = vi.fn(() => new Promise((resolve) => { release = () => resolve({ items: [] }); }));
    const { container } = renderDashboard(ADMIN, repo);
    expect(screen.getByRole('status')).toHaveTextContent('Koostan töölauda…');
    expect(container.querySelector('.state-spinner')).toBeNull();
    expect(container.querySelector('.skeleton-row--kpis').children).toHaveLength(4);
    release();
    expect(await screen.findByRole('heading', { level: 1, name: 'Tere, Pavel' })).toBeInTheDocument();
    expect(screen.queryByText('Koostan töölauda…')).not.toBeInTheDocument();
  });

  it('one-line greeting, no hero; nothing to do → „Kõik on korras ✓”', async () => {
    const { unmount } = renderDashboard(ADMIN, repositories());
    expect(await screen.findByRole('heading', { level: 1, name: 'Tere, Pavel' })).toBeInTheDocument();
    expect(screen.getByText('· reede, 6. november')).toBeInTheDocument();
    expect(screen.queryByText(/Järgmine samm/)).not.toBeInTheDocument();
    // the overdue invoice is the only work
    expect(await within(attention()).findByText('1 tähtaja ületanud arve')).toBeInTheDocument();
    unmount();
    const quiet = repositories();
    quiet.invoices.list.mockResolvedValue([]);
    quiet.schedule.list.mockResolvedValue([{ id: 'next', date: '2026-11-10', time: '10:00', duration: 60, status: 'Planeeritud', studentId: 'student-1', studentName: 'Mari' }]);
    renderDashboard({ ...ADMIN, uid: 'admin-2' }, quiet);
    await waitFor(() => expect(screen.getByText('Kõik on korras ✓')).toBeInTheDocument());
  });

  it('admin: the attention list is ordered by urgency, at most 5 lines, errors only as a count with a link', async () => {
    const repo = repositories();
    repo.schedule.list.mockResolvedValue([
      { id: 'now', date: '2026-11-06', time: '12:30', duration: 45, studentId: 'student-1', studentName: 'Mari', teacher: 'Kati', status: 'Planeeritud' },
      { id: 'old', date: '2026-11-03', time: '10:00', duration: 45, studentId: 'student-1', studentName: 'Mari', teacher: 'Kati', teacherUid: 'teacher-1', status: 'Planeeritud' },
    ]);
    repo.homework.listSubmissionsByStudentIds = vi.fn(async () => [{ id: 'w1', studentId: 'student-1', reviewStatus: 'pending', completedAt: '2026-10-30T10:00:00Z' }]);
    repo.today.leads.mockResolvedValue([{ id: 'l1', status: 'new', name: 'Uus', createdAt: '2026-11-05T10:00:00Z' }]);
    repo.today.packages.mockResolvedValue([{ id: 'p1', studentId: 'student-1', status: 'active', grantedCredits: 10, consumedCredits: 9, balanceCredits: 1 }]);
    repo.clientErrors.listRecent.mockResolvedValue([{ id: 'e1', fingerprint: 'abc', message: 'TypeError: secret raw text', status: 'new', count: 2, lastAt: NOW.getTime() - 1000 }]);
    renderDashboard(ADMIN, repo);
    await waitFor(() => expect(within(attention()).getAllByRole('listitem')).toHaveLength(5));
    const keys = within(attention()).getAllByRole('listitem').map((item) => item.dataset.key);
    expect(keys).toEqual(['soon', 'unmarked', 'reviews', 'invoices', 'leads']);
    expect(within(attention()).getByRole('link', { name: 'Alusta tundi' })).toHaveAttribute('href', `/calendar?lesson=${encodeURIComponent('now:2026-11-06|2026-11-06')}`);
    expect(within(attention()).getByRole('link', { name: /1 märkimata tund/ })).toHaveAttribute('href', '/calendar/markimata');
    expect(within(attention()).getByText(/\+ veel 2 teemat/)).toBeInTheDocument(); // packages, errors
    expect(screen.queryByText(/secret raw text/)).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Vead saidil.*1 uut/ })).toHaveAttribute('href', '/vead');
  });

  it('admin: the four numbers and the quick links sit at the top, before „Vajab tähelepanu”, „Täna” and „Ülevaated”', async () => {
    renderDashboard(ADMIN, repositories());
    const overviews = await screen.findByRole('region', { name: 'Ülevaated' });
    const numbers = screen.getByRole('region', { name: 'Numbrid' });
    const links = screen.getByRole('navigation', { name: 'Kiirvalikud' });
    const order = [screen.getByRole('heading', { level: 1 }), numbers, links, attention(), screen.getByRole('region', { name: 'Täna' }), overviews];
    order.slice(1).forEach((node, index) => expect(order[index].compareDocumentPosition(node) & 4 /* DOCUMENT_POSITION_FOLLOWING */).toBeTruthy());
    expect(within(numbers).getAllByRole('article').map((card) => card.querySelector('.metric-card__top span').textContent))
      .toEqual(['Aktiivsed õpilased', 'Tunnid täna', 'Kodutööd pooleli', 'Laekumata']);
    expect(within(numbers).getByText('kõik õpetajad')).toBeInTheDocument();
    expect(within(numbers).getByText(/kõik kuud · 1 tähtaja ületanud/)).toBeInTheDocument();
    expect(within(links).getAllByRole('link').map((link) => link.getAttribute('href'))).toEqual(['/calendar', '/students', '/library', '/messages', '/finance']);
    // the numbers are no longer a tile, and the old slim link row at the bottom is gone
    expect(within(overviews).queryByRole('button', { name: /Numbrid/ })).not.toBeInTheDocument();
    expect(screen.getAllByRole('navigation')).toHaveLength(1);
  });

  it('admin: details stay closed; a tile opens its panel, „Riskis õpilased” reads the words only when opened', async () => {
    const repo = repositories();
    renderDashboard(ADMIN, repo);
    const overviews = await screen.findByRole('region', { name: 'Ülevaated' });
    await waitFor(() => expect(repo.today.leads).toHaveBeenCalled());
    ['Vajab kõnet', 'Makstud tunnid lõppevad', 'Kodutööd', 'Veebipäringud', 'Märkimata tunnid', 'Riskis õpilased'].forEach((title) => expect(within(overviews).getByRole('button', { name: new RegExp(title) })).toHaveAttribute('aria-expanded', 'false'));
    ['Õpetajate koormus', 'Ilma tulevase tunnita', 'Vead saidil', 'Arved'].forEach((title) => expect(within(overviews).getByRole('link', { name: new RegExp(title) })).toBeInTheDocument());
    expect(screen.queryByText('Riskis õpilased', { selector: 'h2' })).not.toBeInTheDocument();
    expect(repo.retention.words).not.toHaveBeenCalled();
    expect(repo.today.lessons).toHaveBeenCalledTimes(1);
    expect(repo.today.lessons).toHaveBeenCalledWith('');

    fireEvent.click(within(overviews).getByRole('button', { name: /Riskis õpilased/ }));
    await waitFor(() => expect(repo.retention.words).toHaveBeenCalledWith(['student-1']));
    expect(repo.today.lessons).toHaveBeenCalledTimes(1); // the panel reuses the journal read for the counts
    expect(screen.getByRole('region', { name: 'Riskis õpilased' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Sulge' }));
    expect(screen.queryByRole('region', { name: 'Riskis õpilased' })).not.toBeInTheDocument();
  });

  it('admin: „Vajab kõnet” in the attention list opens its panel with „Helistasin”', async () => {
    const repo = repositories();
    repo.invoices.list.mockResolvedValue([]);
    repo.schedule.list.mockResolvedValue([]); // no lesson ahead → needs a call
    renderDashboard(ADMIN, repo);
    await screen.findByRole('region', { name: 'Vajab tähelepanu' });
    fireEvent.click(await within(attention()).findByRole('button', { name: /1 õpilane vajab kõnet/ }));
    const panel = screen.getByRole('region', { name: 'Vajab kõnet' });
    expect(within(panel).getByRole('button', { name: 'Helistasin' })).toBeInTheDocument();
  });

  it('teacher: own data only, the same calm structure, no admin or finance parts', async () => {
    const repo = repositories();
    repo.schedule.list.mockResolvedValue([{ id: 'x', date: '2026-11-06', time: '13:00', duration: 45, studentId: 'student-1', studentName: 'Mari', teacher: 'Kati', teacherUid: 'teacher-1', status: 'Planeeritud' }]);
    renderDashboard({ uid: 'teacher-1', displayName: 'Kati Kask', roles: ['teacher'] }, repo);
    expect(await screen.findByRole('region', { name: 'Täna' })).toHaveTextContent('Mari');
    await waitFor(() => expect(repo.students.list).toHaveBeenCalledWith(expect.objectContaining({ scopeTeacherUid: 'teacher-1', status: 'active' })));
    expect(repo.schedule.list).toHaveBeenCalledWith({ teacherUid: 'teacher-1' });
    expect(repo.homework.listByStudentIds).toHaveBeenCalledWith(['student-1']);
    expect(repo.homework.list).not.toHaveBeenCalled();
    expect(repo.invoices.list).not.toHaveBeenCalled();
    await waitFor(() => expect(repo.today.lessons).toHaveBeenCalledWith('teacher-1'));
    ['seen', 'plans', 'packages', 'owed', 'leads', 'worksheetsDue', 'followups'].forEach((name) => expect(repo.today[name]).not.toHaveBeenCalled());
    expect(repo.clientErrors.listRecent).not.toHaveBeenCalled();
    expect(within(attention()).getByText('1 tund käib või algab tunni jooksul')).toBeInTheDocument();
    expect(within(attention()).getByText('Järgmine: 13:00 Mari')).toBeInTheDocument();
    const overviews = screen.getByRole('region', { name: 'Ülevaated' });
    ['Vajab kõnet', 'Makstud tunnid', 'Veebipäringud', 'Õpetajate koormus', 'Vead saidil', 'Arved'].forEach((title) => expect(within(overviews).queryByText(new RegExp(title))).not.toBeInTheDocument());
    expect(within(overviews).getByRole('link', { name: /Kodutööd/ })).toHaveAttribute('href', '/homework');
    const numbers = screen.getByRole('region', { name: 'Numbrid' });
    expect(within(numbers).getAllByRole('article')).toHaveLength(3);
    expect(within(numbers).getByText('minu õpilased')).toBeInTheDocument();
    expect(within(numbers).queryByText('Laekumata')).not.toBeInTheDocument();
    expect(within(screen.getByRole('navigation', { name: 'Kiirvalikud' })).getAllByRole('link').map((link) => link.getAttribute('href'))).toEqual(['/calendar', '/students', '/library', '/messages']);
    expect(screen.queryByRole('link', { name: /Finantsid/ })).not.toBeInTheDocument();
  });

  it('teacher: own unmarked lessons from before yesterday → a dismissible nudge once a day (owner 2026-11-09, no e-mail)', async () => {
    window.localStorage.removeItem('ks-unmarked-nudge:teacher-2');
    const repo = repositories();
    repo.schedule.list.mockResolvedValue([
      { id: 'a', date: '2026-11-02', time: '10:00', duration: 45, studentId: 'student-1', studentName: 'Mari', teacherUid: 'teacher-2', status: 'Planeeritud' },
      // before 1.11 (MARKING_START, owner 2026-11-09) → not counted
      { id: 'b', date: '2026-10-28', time: '10:00', duration: 45, studentId: 'student-1', studentName: 'Mari', teacherUid: 'teacher-2', status: 'Planeeritud' },
      { id: 'e', date: '2026-11-04', time: '10:00', duration: 45, studentId: 'student-1', studentName: 'Mari', teacherUid: 'teacher-2', status: 'Planeeritud' },
      // marked in the journal → not counted; somebody else's lesson → not counted
      { id: 'c', date: '2026-11-03', time: '10:00', duration: 45, studentId: 'student-1', studentName: 'Mari', teacherUid: 'teacher-2', status: 'Planeeritud' },
      { id: 'd', date: '2026-11-03', time: '12:00', duration: 45, studentId: 'student-2', studentName: 'Jaan', teacherUid: 'other', status: 'Planeeritud' },
    ]);
    repo.today.lessons.mockResolvedValue([{ id: 'l1', scheduleId: 'c', date: '2026-11-03', studentId: 'student-1', status: 'Toimunud' }]);
    const user = { uid: 'teacher-2', displayName: 'Kati Kask', roles: ['teacher'] };
    const { unmount } = renderDashboard(user, repo);
    const nudge = (await screen.findByText(/Märgi need 1 minutiga/)).closest('.calm-nudge');
    expect(within(nudge).getByRole('link', { name: /Sul on 2 märkimata tundi \(vanim 02\.11\)\. Märgi need 1 minutiga →/ })).toHaveAttribute('href', '/calendar/markimata');
    expect(window.localStorage.getItem('ks-unmarked-nudge:teacher-2')).toBe('2026-11-06');
    fireEvent.click(within(nudge).getByRole('button', { name: 'Peida meeldetuletus' }));
    expect(screen.queryByText(/Märgi need 1 minutiga/)).not.toBeInTheDocument();
    unmount();
    // the same day again: not shown (the attention list still counts them)
    renderDashboard(user, repo);
    await screen.findByRole('region', { name: 'Ülevaated' });
    await waitFor(() => expect(repo.today.lessons).toHaveBeenCalledTimes(2));
    await within(attention()).findByRole('link', { name: /2 märkimata tundi/ });
    expect(screen.queryByText(/Märgi need 1 minutiga/)).not.toBeInTheDocument();
  });

  it('admin: no personal nudge (the school-wide count stays in the menu and the attention list)', async () => {
    const repo = repositories();
    repo.schedule.list.mockResolvedValue([{ id: 'old', date: '2026-11-03', time: '10:00', duration: 45, studentId: 'student-1', studentName: 'Mari', teacherUid: 'teacher-1', status: 'Planeeritud' }]);
    renderDashboard(ADMIN, repo);
    await screen.findByRole('region', { name: 'Vajab tähelepanu' });
    await within(attention()).findByRole('link', { name: /1 märkimata tund/ });
    expect(screen.queryByText(/Märgi need 1 minutiga/)).not.toBeInTheDocument();
  });

  it('a lesson marked in the side drawer: the journal is read again in place, the count drops, the page stays', async () => {
    const repo = repositories();
    repo.schedule.list.mockResolvedValue([{ id: 'old', date: '2026-11-03', time: '10:00', duration: 45, studentId: 'student-1', studentName: 'Mari', teacherUid: 'teacher-1', status: 'Planeeritud' }]);
    repo.today.lessons.mockResolvedValueOnce([]).mockResolvedValue([{ id: 'L1', scheduleId: 'old', studentId: 'student-1', date: '2026-11-03', time: '10:00', status: 'Toimunud' }]);
    renderDashboard(ADMIN, repo);
    await screen.findByRole('region', { name: 'Vajab tähelepanu' });
    await within(attention()).findByRole('link', { name: /1 märkimata tund/ });
    // an overview stays open across the reload
    const tile = within(screen.getByRole('region', { name: 'Ülevaated' })).getByRole('button', { name: /Märkimata tunnid/ });
    fireEvent.click(tile);
    act(() => { announceLessonMarked('old:2026-11-03'); });
    await waitFor(() => expect(within(attention()).queryByRole('link', { name: /märkimata tund/ })).not.toBeInTheDocument());
    expect(repo.today.lessons).toHaveBeenCalledTimes(2);
    // no full reload: the first data was read once, the open overview is the same element
    expect(repo.schedule.list).toHaveBeenCalledTimes(1);
    expect(tile).toBeInTheDocument();
    expect(tile).toHaveAttribute('aria-expanded', 'true');
    expect(screen.queryByText('Koostan töölauda…')).not.toBeInTheDocument();
  });

  it('accountant: invoices and packages only; no lessons, no learning reads', async () => {
    const repo = repositories();
    repo.today.packages.mockResolvedValue([{ id: 'p1', studentId: 's9', studentName: 'Jaan', status: 'active', grantedCredits: 10, consumedCredits: 10, balanceCredits: 0 }]);
    renderDashboard({ uid: 'finance-1', displayName: 'Anne', roles: ['finance'] }, repo);
    expect(await within(await screen.findByRole('region', { name: 'Vajab tähelepanu' })).findByText('1 õpilasel lõpevad makstud tunnid')).toBeInTheDocument();
    expect(within(attention()).getByRole('link', { name: /1 tähtaja ületanud arve/ })).toHaveAttribute('href', '/finance?status=overdue');
    expect(screen.queryByRole('region', { name: 'Täna' })).not.toBeInTheDocument();
    expect(repo.invoices.list).toHaveBeenCalledTimes(1);
    ['students', 'schedule'].forEach((name) => expect(repo[name].list).not.toHaveBeenCalled());
    expect(repo.homework.list).not.toHaveBeenCalled();
    ['lessons', 'seen', 'plans', 'leads', 'worksheetsDue', 'followups'].forEach((name) => expect(repo.today[name]).not.toHaveBeenCalled());
    expect(repo.clientErrors.listRecent).not.toHaveBeenCalled();
    fireEvent.click(within(attention()).getByRole('button', { name: /makstud tunnid/ }));
    expect(within(screen.getByRole('region', { name: 'Makstud tunnid lõppevad' })).getByText('Pakett läbi')).toBeInTheDocument();
    const numbers = screen.getByRole('region', { name: 'Numbrid' });
    expect(within(numbers).getAllByRole('article')).toHaveLength(1);
    expect(within(numbers).getByText('Laekumata')).toBeInTheDocument();
    expect(within(numbers).getByText('100,00 €', { normalizer: (text) => text.replace(/\s/g, ' ') })).toBeInTheDocument();
    expect(within(screen.getByRole('navigation', { name: 'Kiirvalikud' })).getAllByRole('link').map((link) => link.getAttribute('href'))).toEqual(['/finance']);
  });
});
