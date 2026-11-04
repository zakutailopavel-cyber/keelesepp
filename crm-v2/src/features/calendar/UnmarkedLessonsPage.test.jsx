import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthContext } from '../../app/AuthContext.jsx';
import UnmarkedLessonsPage from './UnmarkedLessonsPage.jsx';

const base = { studentId: 's1', teacherUid: 't1', teacher: 'Anna', time: '10:00', duration: 60, recurring: false, status: 'Planeeritud' };
const items = [
  { ...base, id: 'a', studentName: 'Mia', occurrenceDate: '2026-11-02', occurrenceId: 'a:2026-11-02', kind: 'evidence', evidence: { date: '2026-11-02', time: '10:03', endTime: '10:58', sources: ['summary'], teacherName: 'Anna' }, duplicateOf: null },
  { ...base, id: 'b', studentName: 'Timur', occurrenceDate: '2026-10-30', occurrenceId: 'b:2026-10-30', kind: 'duplicate', evidence: null, duplicateOf: { source: 'lesson', time: '15:00', status: 'Toimunud', teacher: 'Anna' } },
  { ...base, id: 'c', studentName: 'Ott', occurrenceDate: '2026-10-28', occurrenceId: 'c:2026-10-28', kind: 'teacher', evidence: null, duplicateOf: null },
];

function renderPage(repository, roles = ['admin']) {
  const auth = { user: { uid: 'u1', displayName: 'Admin', roles }, signOut: vi.fn() };
  return render(<AuthContext.Provider value={auth}><MemoryRouter><UnmarkedLessonsPage repository={repository} today="2026-11-04" /></MemoryRouter></AuthContext.Provider>);
}

describe('UnmarkedLessonsPage', () => {
  it('shows each lesson with its evidence and suggestion and marks a proven one held', async () => {
    const repository = { load: vi.fn(async () => ({ items, schedule: [] })), mark: vi.fn(async () => ({})), cancel: vi.fn() };
    renderPage(repository);
    expect(await screen.findByText('Mia')).toBeInTheDocument();
    expect(repository.load).toHaveBeenCalledWith(expect.objectContaining({ isAdmin: true, today: '2026-11-04' }));
    expect(screen.getByText(/Live-tund .* kell 10:03–10:58/)).toBeInTheDocument();
    expect(screen.getByText(/juba märgitud tund: Toimunud kell 15:00/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Märgi toimunuks' }));
    await waitFor(() => expect(repository.mark).toHaveBeenCalledWith(items[0], expect.objectContaining({ uid: 'u1' }), 'Toimunud'));
    await waitFor(() => expect(screen.queryByText('Mia')).not.toBeInTheDocument());
  });

  it('a lesson without evidence offers Toimus / Puudus (teatas) / Puudus (ei teatanud)', async () => {
    const repository = { load: vi.fn(async () => ({ items, schedule: [] })), mark: vi.fn(async () => ({})), cancel: vi.fn() };
    renderPage(repository, ['teacher']);
    await screen.findByText('Ott');
    expect(repository.load).toHaveBeenCalledWith(expect.objectContaining({ isAdmin: false }));
    fireEvent.click(screen.getByRole('button', { name: 'Puudus (ei teatanud)' }));
    await waitFor(() => expect(repository.mark).toHaveBeenCalledWith(items[2], expect.anything(), 'Puudus_eta'));
  });

  it('a likely duplicate is cancelled with the raw calendar entry after a confirmation', async () => {
    const raw = { id: 'b', studentId: 's1', date: '2026-10-30', status: 'Planeeritud' };
    const repository = { load: vi.fn(async () => ({ items, schedule: [raw] })), mark: vi.fn(), cancel: vi.fn(async () => {}) };
    const confirm = vi.spyOn(globalThis, 'confirm').mockReturnValue(true);
    renderPage(repository);
    fireEvent.click(await screen.findByRole('button', { name: 'Tühista' }));
    await waitFor(() => expect(repository.cancel).toHaveBeenCalledWith(items[1], raw));
    confirm.mockRestore();
  });

  it('shows the calendar\'s message when the rules refuse (invoice / closed period)', async () => {
    const repository = { load: vi.fn(async () => ({ items, schedule: [] })), mark: vi.fn(async () => { throw Object.assign(new Error('denied'), { code: 'permission-denied' }); }), cancel: vi.fn() };
    renderPage(repository);
    fireEvent.click(await screen.findByRole('button', { name: 'Märgi toimunuks' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('tund on arvel või periood on suletud');
    expect(screen.getByText('Mia')).toBeInTheDocument();
  });

  it('filters by suggestion', async () => {
    renderPage({ load: vi.fn(async () => ({ items, schedule: [] })), mark: vi.fn(), cancel: vi.fn() });
    await screen.findByText('Mia');
    fireEvent.click(screen.getByRole('button', { name: /Tõenäoliselt topelt/ }));
    expect(screen.queryByText('Mia')).not.toBeInTheDocument();
    expect(screen.getByText('Timur')).toBeInTheDocument();
  });
});
