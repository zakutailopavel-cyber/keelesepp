import { afterEach } from 'vitest';
import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthContext } from '../../app/AuthContext.jsx';
import { announceLessonChanged, announceLessonMarked } from './lessonActions.js';
import UnmarkedLessonsPage from './UnmarkedLessonsPage.jsx';

const base = { studentId: 's1', teacherUid: 't1', teacher: 'Anna', time: '10:00', duration: 60, recurring: false, status: 'Planeeritud' };
const items = [
  { ...base, id: 'c', studentName: 'Ott', occurrenceDate: '2026-11-02', occurrenceId: 'c:2026-11-02', kind: 'teacher', evidence: null, duplicateOf: null },
  { ...base, id: 'b', studentName: 'Timur', occurrenceDate: '2026-11-03', occurrenceId: 'b:2026-11-03', kind: 'duplicate', evidence: null, duplicateOf: { source: 'lesson', time: '15:00', status: 'Toimunud', teacher: 'Anna' } },
  { ...base, id: 'a', studentName: 'Mia', occurrenceDate: '2026-11-04', occurrenceId: 'a:2026-11-04', kind: 'evidence', evidence: { date: '2026-11-04', time: '10:03', endTime: '10:58', sources: ['summary'], teacherName: 'Anna' }, duplicateOf: null },
  { ...base, id: 'd', studentName: 'Liis', time: '12:00', occurrenceDate: '2026-11-04', occurrenceId: 'd:2026-11-04', kind: 'teacher', evidence: null, duplicateOf: null },
];
const loaded = (extra = {}) => ({ items, adminItems: [], schedule: [], olderCount: 0, ...extra });
const repo = (extra = {}) => ({ load: vi.fn(async () => loaded()), mark: vi.fn(async (item) => ({ id: `rec-${item.id}`, accountingSource: 'crm_v2' })), unmark: vi.fn(async () => {}), cancel: vi.fn(async () => {}), ...extra });

function renderPage(repository, roles = ['admin'], path = '/calendar/markimata') {
  const auth = { user: { uid: 'u1', displayName: 'Admin', roles }, signOut: vi.fn() };
  return render(<AuthContext.Provider value={auth}><MemoryRouter initialEntries={[path]}><UnmarkedLessonsPage repository={repository} today="2026-11-05" /></MemoryRouter></AuthContext.Provider>);
}
const dayOf = (name) => screen.getByRole('region', { name: new RegExp(name, 'i') });

describe('UnmarkedLessonsPage (phone-first, owner 2026-11-09)', () => {
  afterEach(() => { vi.useRealTimers(); });
  it('oldest day first, grouped by day; a tap marks through the calendar\'s path and offers a 5-second undo', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const repository = repo();
    renderPage(repository);
    expect(await screen.findByText(/Mia/)).toBeInTheDocument();
    expect(repository.load).toHaveBeenCalledWith(expect.objectContaining({ isAdmin: true, today: '2026-11-05' }));
    const days = screen.getAllByRole('heading', { level: 2 }).map((heading) => heading.textContent);
    expect(days.slice(0, 3).map((text) => text.replace(/\s*\d+$/, ''))).toEqual(['esmaspäev, 2. november', 'teisipäev, 3. november', 'kolmapäev, 4. november']);
    expect(screen.getByText(/Live-tund .* kell 10:03–10:58/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Toimus: Mia' }));
    await waitFor(() => expect(repository.mark).toHaveBeenCalledWith(items[2], expect.objectContaining({ uid: 'u1' }), 'Toimunud'));
    await waitFor(() => expect(screen.queryByText(/^10:00 · Mia$/)).not.toBeInTheDocument());
    const toast = document.querySelector('.qm-toast');
    expect(toast.textContent).toMatch(/Mia .*: Toimus/);
    fireEvent.click(within(toast).getByRole('button', { name: /Võta tagasi/ }));
    await waitFor(() => expect(repository.unmark).toHaveBeenCalledWith({ id: 'rec-a', accountingSource: 'crm_v2' }, expect.anything(), { recurring: false }));
    expect(await screen.findByText(/^10:00 · Mia$/)).toBeInTheDocument();
    // the toast goes away by itself after 5 s
    fireEvent.click(screen.getByRole('button', { name: 'Toimus: Ott' }));
    await waitFor(() => expect(document.querySelector('.qm-toast')?.textContent).toMatch(/Ott .*: Toimus/));
    await act(async () => {});
    await act(async () => { vi.advanceTimersByTime(8100); }); // the Toimus toast with „Maksis sularahas” stays 8 s (owner 2026-11-11)
    expect(document.querySelector('.qm-toast')).toBeNull();
    vi.useRealTimers();
  });

  it('a lesson someone else had marked already: no „Võta tagasi” that would remove their mark (Fable T6)', async () => {
    const repository = repo({ mark: vi.fn(async (item) => ({ id: `rec-${item.id}`, accountingSource: 'crm_v2', alreadyMarked: true })) });
    renderPage(repository);
    fireEvent.click(await screen.findByRole('button', { name: 'Toimus: Mia' }));
    await waitFor(() => expect(repository.mark).toHaveBeenCalled());
    await waitFor(() => expect(screen.queryByText(/^10:00 · Mia$/)).not.toBeInTheDocument());
    expect(document.querySelector('.qm-toast')).toBeNull();
    expect(repository.unmark).not.toHaveBeenCalled();
  });

  it('„Puudus ▾” opens the two absences; the billable one is never the default', async () => {
    const repository = repo();
    renderPage(repository, ['teacher']);
    await screen.findByText(/Ott/);
    expect(repository.load).toHaveBeenCalledWith(expect.objectContaining({ isAdmin: false }));
    fireEvent.click(screen.getByRole('button', { name: 'Puudus: Ott' }));
    const menu = screen.getByRole('menu', { name: 'Puudus: Ott' });
    fireEvent.click(within(menu).getByRole('menuitem', { name: /Ei teatanud/ }));
    await waitFor(() => expect(repository.mark).toHaveBeenCalledWith(items[0], expect.anything(), 'Puudus_eta'));
    // a teacher sees no Live / duplicate filters, no admin section
    expect(screen.queryByRole('button', { name: /Live-tund leitud/ })).not.toBeInTheDocument();
    expect(screen.queryByRole('region', { name: 'Vajab admini' })).not.toBeInTheDocument();
  });

  it('„Märgi kõik selle päeva tunnid toimunuks”: a confirm list, then one mark after another', async () => {
    const order = [];
    const repository = repo({ mark: vi.fn(async (item) => { order.push(item.id); return { id: `rec-${item.id}` }; }) });
    renderPage(repository, ['teacher']);
    await screen.findByText(/Liis/);
    fireEvent.click(within(dayOf('kolmapäev, 4. november')).getByRole('button', { name: 'Märgi kõik selle päeva tunnid toimunuks' }));
    const dialog = screen.getByRole('dialog');
    expect(within(dialog).getByRole('list', { name: 'Märgitavad tunnid' }).textContent).toMatch(/Mia.*Liis/);
    expect(repository.mark).not.toHaveBeenCalled();
    fireEvent.click(within(dialog).getByRole('button', { name: 'Märgi 2 tundi toimunuks' }));
    await waitFor(() => expect(order).toEqual(['a', 'd']));
    expect(repository.mark).toHaveBeenNthCalledWith(1, items[2], expect.anything(), 'Toimunud');
    await waitFor(() => expect(screen.queryByText(/^12:00 · Liis$/)).not.toBeInTheDocument());
  });

  it('a bulk run stops at the first refusal and says so', async () => {
    const repository = repo({ mark: vi.fn().mockRejectedValueOnce(Object.assign(new Error('denied'), { code: 'permission-denied' })) });
    renderPage(repository, ['teacher']);
    await screen.findByText(/Liis/);
    fireEvent.click(within(dayOf('kolmapäev, 4. november')).getByRole('button', { name: 'Märgi kõik selle päeva tunnid toimunuks' }));
    fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: /Märgi 2 tundi/ }));
    expect(await screen.findByRole('alert')).toHaveTextContent(/periood on suletud.*Ülejäänud jäid märkimata/);
    expect(repository.mark).toHaveBeenCalledTimes(1);
  });

  it('admin: „Märgi Live-tunnid toimunuks” marks only the rows with Live evidence after the confirm', async () => {
    const repository = repo();
    renderPage(repository);
    fireEvent.click(await screen.findByRole('button', { name: 'Märgi Live-tunnid toimunuks (1)' }));
    fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Märgi 1 tundi toimunuks' }));
    await waitFor(() => expect(repository.mark).toHaveBeenCalledTimes(1));
    expect(repository.mark).toHaveBeenCalledWith(items[2], expect.anything(), 'Toimunud');
  });

  it('admin: „Vajab admini” lists the excluded entries with the reason; „Lõpeta sari” asks, writes and can be undone', async () => {
    const series = { ...base, id: 'w', studentName: 'Arhiivis Anu', recurring: true, endDate: '', occurrenceId: 'w:2026-11-02', occurrenceDate: '2026-11-02', reason: 'student-archived' };
    const repository = repo({
      load: vi.fn(async () => loaded({ adminItems: [series, { ...series, occurrenceId: 'w:2026-11-09', occurrenceDate: '2026-11-09' }, { ...base, id: 'n', studentName: 'Ilma õpetajata', teacherUid: '', teacher: '', occurrenceId: 'n:2026-11-03', occurrenceDate: '2026-11-03', reason: 'no-teacher' }], olderCount: 7, context: { staff: [{ id: 't9', role: 'teacher', displayName: 'Uus Õpetaja' }] } })),
      endSeries: vi.fn(async () => ({ previous: '' })),
      restoreSeriesEnd: vi.fn(async () => {}),
      assignTeacher: vi.fn(async () => {}),
    });
    const confirm = vi.spyOn(globalThis, 'confirm').mockReturnValue(true);
    renderPage(repository);
    const admin = await screen.findByRole('region', { name: 'Vajab admini' });
    expect(within(admin).getByText('Õpilane on arhiivis')).toBeInTheDocument();
    expect(within(admin).getByText('Tunnil pole õpetajat')).toBeInTheDocument();
    expect(within(admin).getByText(/2 tundi/)).toBeInTheDocument();
    fireEvent.click(within(admin).getByRole('button', { name: 'Lõpeta sari' }));
    await waitFor(() => expect(repository.endSeries).toHaveBeenCalledWith(expect.objectContaining({ id: 'w' }), '2026-11-01', expect.anything()));
    expect(confirm).toHaveBeenCalled();
    fireEvent.click(await screen.findByRole('button', { name: /Võta tagasi/ }));
    await waitFor(() => expect(repository.restoreSeriesEnd).toHaveBeenCalledWith(expect.objectContaining({ id: 'w' }), ''));
    // „Määra õpetaja”
    fireEvent.click(within(admin).getByRole('button', { name: 'Määra õpetaja' }));
    fireEvent.change(within(screen.getByRole('dialog')).getByRole('combobox', { name: 'Õpetaja' }), { target: { value: 't9' } });
    fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Salvesta' }));
    await waitFor(() => expect(repository.assignTeacher).toHaveBeenCalledWith(expect.objectContaining({ id: 'n' }), { id: 't9', name: 'Uus Õpetaja' }));
    // the older ones: a small link with the count
    expect(screen.getByRole('link', { name: 'Vanemad (enne 1.11): 7' })).toBeInTheDocument();
    confirm.mockRestore();
  });

  it('the rows show first, the Live evidence follows (two-step load)', async () => {
    let finish;
    const repository = repo({
      load: vi.fn(async () => loaded({ items: items.map((item) => ({ ...item, kind: 'teacher', evidence: null })) })),
      withEvidence: vi.fn(() => new Promise((resolve) => { finish = resolve; })),
    });
    renderPage(repository);
    await screen.findByText(/Mia/);
    expect(repository.load).toHaveBeenCalledWith(expect.objectContaining({ withEvidence: false }));
    expect(screen.getByText('Otsin Live-tunde…')).toBeInTheDocument();
    await act(async () => { finish(loaded()); });
    expect(screen.getByText(/Live-tund .* kell 10:03–10:58/)).toBeInTheDocument();
    expect(screen.queryByText('Otsin Live-tunde…')).not.toBeInTheDocument();
  });

  it('a likely duplicate is cancelled with the raw calendar entry after a confirmation', async () => {
    const raw = { id: 'b', studentId: 's1', date: '2026-11-03', status: 'Planeeritud' };
    const repository = repo({ load: vi.fn(async () => loaded({ schedule: [raw] })) });
    const confirm = vi.spyOn(globalThis, 'confirm').mockReturnValue(true);
    renderPage(repository);
    fireEvent.click(await screen.findByRole('button', { name: 'Tühista' }));
    await waitFor(() => expect(repository.cancel).toHaveBeenCalledWith(items[1], raw));
    confirm.mockRestore();
  });

  it('shows the calendar\'s message when the rules refuse (invoice / closed period)', async () => {
    const repository = repo({ mark: vi.fn(async () => { throw Object.assign(new Error('denied'), { code: 'permission-denied' }); }) });
    renderPage(repository);
    fireEvent.click(await screen.findByRole('button', { name: 'Toimus: Mia' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('tund on arvel või periood on suletud');
    expect(screen.getByText(/^10:00 · Mia$/)).toBeInTheDocument();
  });

  it('filters by suggestion (admin)', async () => {
    renderPage(repo());
    await screen.findByText(/Mia/);
    fireEvent.click(screen.getByRole('button', { name: /Tõenäoliselt topelt/ }));
    expect(screen.queryByText(/Mia/)).not.toBeInTheDocument();
    expect(screen.getByText(/Timur/)).toBeInTheDocument();
  });

  it('the drawer: a mark drops the row at once; another change reads the list again in place, the filter stays', async () => {
    const load = vi.fn().mockResolvedValueOnce(loaded()).mockResolvedValue(loaded({ items: items.filter((item) => item.id !== 'c') }));
    renderPage(repo({ load }));
    await screen.findByText(/Mia/);
    act(() => { announceLessonMarked('a:2026-11-04'); });
    expect(screen.queryByText(/^10:00 · Mia$/)).not.toBeInTheDocument();
    expect(load).toHaveBeenCalledTimes(1);
    const filter = screen.getByRole('button', { name: /Õpetaja otsustab/ });
    fireEvent.click(filter);
    expect(screen.getByText(/Ott/)).toBeInTheDocument();
    act(() => { announceLessonChanged('c'); });
    await waitFor(() => expect(load).toHaveBeenCalledTimes(2));
    await waitFor(() => expect(screen.queryByText(/Ott/)).not.toBeInTheDocument());
    expect(filter).toHaveAttribute('aria-pressed', 'true');
    expect(screen.queryByText('Otsin märkimata tunde…')).not.toBeInTheDocument();
  });

  it('„Maksab sularahas” card (owner 2026-11-11): one tap marks the lesson held and records the cash; undo reverts both', async () => {
    const repository = repo();
    const cashApi = {
      lessonCashMine: vi.fn().mockResolvedValue({ marks: {}, payers: { s1: { all: true, subjects: [], mainSubject: 'Eesti keel', main: { unitCents: 2500, minutes: 60 }, prices: {} } } }),
      recordLessonCash: vi.fn().mockResolvedValue({ entry: { id: 'lessoncash_c', amountCents: 2500, status: 'open' } }),
      undoLessonCash: vi.fn().mockResolvedValue({}),
    };
    const auth = { user: { uid: 't1', displayName: 'Anna', roles: ['teacher'] }, signOut: vi.fn() };
    render(<AuthContext.Provider value={auth}><MemoryRouter><UnmarkedLessonsPage repository={repository} cashApi={cashApi} today="2026-11-05" /></MemoryRouter></AuthContext.Provider>);
    // no separate cash buttons any more
    await screen.findByText(/Ott/);
    expect(screen.queryByRole('button', { name: /^Makstud sularahas/ })).not.toBeInTheDocument();
    const button = await screen.findByRole('button', { name: 'Toimus · makstud sularahas 25 €: Ott' });
    fireEvent.click(button);
    await waitFor(() => expect(cashApi.recordLessonCash).toHaveBeenCalledWith(items[0]));
    expect(repository.mark).toHaveBeenCalledWith(items[0], expect.objectContaining({ uid: 't1' }), 'Toimunud');
    expect((await screen.findAllByText(/Ott .*: Toimus · makstud sularahas 25 €/)).length).toBeGreaterThan(0);
    fireEvent.click(screen.getByRole('button', { name: /Võta tagasi/ }));
    await waitFor(() => expect(repository.unmark).toHaveBeenCalled());
    expect(cashApi.undoLessonCash).toHaveBeenCalledWith(items[0]);
    expect(cashApi.undoLessonCash.mock.invocationCallOrder[0]).toBeLessThan(repository.unmark.mock.invocationCallOrder[0]);
  });

  it('other cards: plain „Toimus ✓”, then the undo strip offers „Maksis sularahas” (same server call)', async () => {
    const repository = repo();
    const cashApi = {
      lessonCashMine: vi.fn().mockResolvedValue({ marks: {}, payers: {} }),
      recordLessonCash: vi.fn().mockResolvedValue({ entry: { id: 'lessoncash_c', amountCents: 2500, status: 'open' } }),
    };
    const auth = { user: { uid: 't1', displayName: 'Anna', roles: ['teacher'] }, signOut: vi.fn() };
    render(<AuthContext.Provider value={auth}><MemoryRouter><UnmarkedLessonsPage repository={repository} cashApi={cashApi} today="2026-11-05" /></MemoryRouter></AuthContext.Provider>);
    fireEvent.click(await screen.findByRole('button', { name: 'Toimus: Ott' }));
    fireEvent.click(await screen.findByRole('button', { name: /Maksis sularahas/ }));
    await waitFor(() => expect(cashApi.recordLessonCash).toHaveBeenCalledWith(items[0]));
    expect(await screen.findByText(/Toimus · makstud sularahas 25 €/)).toBeInTheDocument();
  });

  it('another teacher’s lesson: no cash in the tap or the strip', async () => {
    const cashApi = { lessonCashMine: vi.fn().mockResolvedValue({ marks: {}, payers: { s1: { all: true, subjects: [], main: { unitCents: 2500, minutes: 60 }, prices: {} } } }) };
    const auth = { user: { uid: 't9', displayName: 'Muu', roles: ['teacher'] }, signOut: vi.fn() };
    render(<AuthContext.Provider value={auth}><MemoryRouter><UnmarkedLessonsPage repository={repo()} cashApi={cashApi} today="2026-11-05" /></MemoryRouter></AuthContext.Provider>);
    await screen.findByText(/Ott/);
    expect(screen.queryByRole('button', { name: /sularahas/ })).not.toBeInTheDocument();
  });
});
