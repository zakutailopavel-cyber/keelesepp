import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { vi } from 'vitest';
import { AuthContext } from '../../app/AuthContext.jsx';
import NotificationCenter from '../../components/layout/NotificationCenter.jsx';
import { homeworkNotifications, invoiceNotifications, messageNotifications, taskNotifications } from '../notifications/notificationModel.js';
import TasksPage from './TasksPage.jsx';
import { hasUnreadReply, isAssignedTo, isNewForMe, isOverdue, matchesFilter, scopeTasks, sortTasks } from './taskModel.js';
import { normalizeTask } from '../../services/firebase/tasks.js';

const admin = { uid: 'admin-1', displayName: 'Pavel', roles: ['admin'] };
const teacher = { uid: 'teach-1', displayName: 'Jelena', roles: ['teacher'] };
const task = (id, data) => normalizeTask(id, { title: id, status: 'open', createdAt: '2026-10-01', ...data });

function fakeTasks(initial) {
  let items = initial.map((item) => normalizeTask(item.id, item));
  let listener = () => {};
  const emit = () => listener([...items]);
  return {
    get items() { return items; },
    subscribe: vi.fn((onChange) => { listener = onChange; onChange([...items]); return () => {}; }),
    create: vi.fn(async (data, user) => { items = [...items, normalizeTask(`t${items.length + 1}`, { ...data, status: 'open', createdByUid: user.uid, createdByName: user.displayName, createdAt: '2026-10-01', openedByUids: [user.uid] })]; emit(); return `t${items.length}`; }),
    update: vi.fn(async (current, patch) => { items = items.map((item) => (item.id === current.id ? normalizeTask(item.id, { ...item, ...patch }) : item)); emit(); }),
    reply: vi.fn(async (current, text, user) => { items = items.map((item) => (item.id === current.id ? normalizeTask(item.id, { ...item, replies: [...item.replies, { id: 'r', text, byUid: user.uid, byName: user.displayName, createdAt: '2026-10-01T10:00:00Z' }] }) : item)); emit(); }),
    markSeen: vi.fn(async (current, user) => { items = items.map((item) => (item.id === current.id ? normalizeTask(item.id, { ...item, lastReplySeenBy: [...item.lastReplySeenBy, user.uid], openedByUids: [...item.openedByUids, user.uid] }) : item)); emit(); }),
    remove: vi.fn(async (current) => { items = items.filter((item) => item.id !== current.id); emit(); }),
  };
}

function Location() {
  const location = useLocation();
  return <output data-testid="location">{location.pathname}{location.search}</output>;
}

function renderPage(user, service, entry = '/tasks') {
  const staffRepository = { list: vi.fn().mockResolvedValue([{ id: 'teach-1', name: 'Elena Zakutailo' }, { id: 'admin-1', name: 'Pavel Zakutailo' }]) };
  return render(
    <MemoryRouter initialEntries={[entry]}>
      <AuthContext.Provider value={{ user }}>
        <Routes><Route path="/tasks" element={<><TasksPage service={service} staffRepository={staffRepository} /><Location /></>} /></Routes>
      </AuthContext.Provider>
    </MemoryRouter>,
  );
}

describe('task model (same meaning as CRM v1)', () => {
  const tasks = [
    task('a', { assignedTo: 'Jelena', dueDate: '2026-09-30', priority: 'low' }),
    task('b', { assignedTo: 'Pavel Zakutailo', createdByUid: 'teach-1', priority: 'high' }),
    task('c', { assignedTo: 'Pavel Zakutailo', createdByUid: 'admin-1', dueDate: '2026-10-05' }),
    task('d', { assignedTo: 'Elena Zakutailo', status: 'done' }),
  ];

  it('scopes a teacher to tasks assigned to or created by them, the admin sees all', () => {
    expect(scopeTasks(tasks, teacher).map((item) => item.id)).toEqual(['a', 'b', 'd']);
    expect(scopeTasks(tasks, admin)).toHaveLength(4);
    expect(isAssignedTo(task('x', { assignedTo: 'Elena Zakutailo', assignedToUid: 'someone-else' }), teacher)).toBe(true);
  });

  it('filters, finds overdue tasks and puts Kiire first', () => {
    expect(isOverdue(tasks[0], '2026-10-01')).toBe(true);
    expect(isOverdue(tasks[3], '2026-10-01')).toBe(false);
    expect(tasks.filter((item) => matchesFilter(item, 'mine', teacher, '2026-10-01')).map((item) => item.id)).toEqual(['a']);
    expect(tasks.filter((item) => matchesFilter(item, 'done', teacher)).map((item) => item.id)).toEqual(['d']);
    expect(sortTasks(tasks).map((item) => item.id)).toEqual(['b', 'a', 'c', 'd']);
  });

  it('knows about new replies and new tasks for the assignee', () => {
    const replied = task('r', { lastReplyAt: '2026-10-01T09:00:00Z', lastReplyByUid: 'admin-1', lastReplySeenBy: ['admin-1'] });
    expect(hasUnreadReply(replied, teacher)).toBe(true);
    expect(hasUnreadReply(replied, admin)).toBe(false);
    const fresh = task('n', { assignedTo: 'Jelena', createdByUid: 'admin-1', openedByUids: ['admin-1'] });
    expect(isNewForMe(fresh, teacher, '2026-10-02')).toBe(true);
    expect(isNewForMe({ ...fresh, openedByUids: ['teach-1'] }, teacher, '2026-10-02')).toBe(false);
    expect(isNewForMe({ ...fresh, createdAt: '2026-08-01' }, teacher, '2026-10-02')).toBe(false);
  });
});

describe('notifications', () => {
  it('derives task, message, homework and invoice notifications from their sources', () => {
    const items = taskNotifications([
      task('late', { assignedTo: 'Jelena', dueDate: '2026-09-20', createdByUid: 'teach-1' }),
      task('today', { assignedTo: 'Jelena', dueDate: '2026-10-01', createdByUid: 'teach-1' }),
      task('fresh', { assignedTo: 'Jelena', createdByUid: 'admin-1', openedByUids: ['admin-1'] }),
    ], teacher, '2026-10-01');
    expect(items.map((item) => item.title)).toEqual(['Ülesande tähtaeg on möödas', 'Ülesande tähtaeg on täna', 'Uus ülesanne sulle']);
    expect(items[0].to).toBe('/tasks?task=late');

    const messages = messageNotifications([
      { id: 'm1', studentId: 's1', studentName: 'Mari', text: 'Tere', fromUid: 'stud-1', read: false, createdAt: '1' },
      { id: 'm2', studentId: 's1', studentName: 'Mari', text: 'Kas tund toimub?', fromUid: 'stud-1', read: false, createdAt: '2' },
      { id: 'm3', studentId: 's2', text: 'Minu oma', fromUid: 'teach-1', read: false, createdAt: '3' },
    ], teacher);
    expect(messages).toEqual([expect.objectContaining({ title: '2 uut sõnumit · Mari', detail: 'Kas tund toimub?', to: '/messages' })]);

    expect(homeworkNotifications([{ id: 'h1', submissionKind: 'worksheet', studentName: 'Mari', title: 'Tööleht 3', reviewStatus: 'pending', percentage: 80 }, { id: 'h2', reviewStatus: 'reviewed' }]))
      .toEqual([expect.objectContaining({ title: 'Töö ootab kontrolli · Mari', meta: '80%' })]);
    expect(invoiceNotifications([{ id: 'i1', studentName: 'Mari', status: 'Ootel', due: '2026-09-01', amountCents: 5000 }], new Date('2026-10-01T10:00:00Z')))
      .toEqual([expect.objectContaining({ to: '/finance?status=overdue&invoice=i1' })]);
  });

  it('the bell counts notifications and opens the task from the panel', async () => {
    const service = fakeTasks([{ id: 'late', title: 'Helista lapsevanemale', assignedTo: 'Jelena', dueDate: '2020-01-01', status: 'open' }]);
    const repositories = {
      tasks: service,
      students: { list: vi.fn().mockResolvedValue({ items: [{ id: 's1', name: 'Mari' }] }) },
      messages: { listByStudentIds: vi.fn().mockResolvedValue([{ id: 'm1', studentId: 's1', studentName: 'Mari', text: 'Tere!', fromUid: 'stud-1', read: false }]) },
      homework: { listSubmissionsByStudentIds: vi.fn().mockResolvedValue([]) },
      invoices: { list: vi.fn() },
    };
    render(<MemoryRouter><Routes><Route path="*" element={<><NotificationCenter user={teacher} repositories={repositories} /><Location /></>} /></Routes></MemoryRouter>);
    const bell = await screen.findByRole('button', { name: 'Teavitused, 2 uut' });
    expect(repositories.invoices.list).not.toHaveBeenCalled();
    expect(repositories.students.list).toHaveBeenCalledWith(expect.objectContaining({ scopeTeacherUid: 'teach-1' }));
    fireEvent.click(bell);
    const panel = screen.getByRole('dialog', { name: 'Teavituskeskus' });
    fireEvent.click(within(panel).getByRole('tab', { name: /Sõnumid/ }));
    expect(within(panel).getByText('Uus sõnum · Mari')).toBeInTheDocument();
    fireEvent.click(within(panel).getByRole('tab', { name: /Kõik/ }));
    fireEvent.click(within(panel).getByRole('button', { name: /Ülesande tähtaeg on möödas/ }));
    expect(screen.getByTestId('location')).toHaveTextContent('/tasks?task=late');
    expect(screen.queryByRole('dialog', { name: 'Teavituskeskus' })).not.toBeInTheDocument();
  });
});

describe('TasksPage', () => {
  it('adds a task for a colleague and shows it on the board', async () => {
    const service = fakeTasks([]);
    renderPage(admin, service);
    await screen.findByRole('option', { name: 'Elena Zakutailo' });
    fireEvent.change(screen.getByLabelText('Uus ülesanne'), { target: { value: 'Saada arve Marile' } });
    fireEvent.change(screen.getByLabelText('Vastutaja'), { target: { value: 'Elena Zakutailo' } });
    fireEvent.change(screen.getByLabelText('Prioriteet'), { target: { value: 'high' } });
    fireEvent.click(screen.getByRole('button', { name: /Lisa/ }));
    await waitFor(() => expect(service.create).toHaveBeenCalledWith(expect.objectContaining({ title: 'Saada arve Marile', assignedTo: 'Elena Zakutailo', assignedToUid: 'teach-1', priority: 'high' }), admin));
    const column = screen.getByRole('region', { name: 'Uus' });
    expect(within(column).getByText('Saada arve Marile')).toBeInTheDocument();
    expect(within(column).getByText('Kiire')).toBeInTheDocument();
    expect(screen.getByLabelText('Uus ülesanne')).toHaveValue('');
  });

  it('opens a task from the link, marks it seen, changes status and replies', async () => {
    const service = fakeTasks([{ id: 'x', title: 'Uuenda tunniplaani', assignedTo: 'Jelena', createdByUid: 'admin-1', createdByName: 'Pavel', createdAt: '2026-10-01', status: 'open', lastReplyAt: '2026-10-01T08:00:00Z', lastReplyByUid: 'admin-1', lastReplyText: 'Palun täna', lastReplySeenBy: ['admin-1'], replies: [{ id: 'r0', text: 'Palun täna', byUid: 'admin-1', byName: 'Pavel', createdAt: '2026-10-01T08:00:00Z' }] }]);
    renderPage(teacher, service, '/tasks?task=x');
    const dialog = await screen.findByRole('dialog', { name: 'Ülesanne' });
    await waitFor(() => expect(service.markSeen).toHaveBeenCalledTimes(1));
    expect(within(dialog).getByText('Palun täna')).toBeInTheDocument();
    expect(within(dialog).queryByRole('button', { name: /Kustuta/ })).not.toBeInTheDocument();

    fireEvent.change(within(dialog).getByLabelText('Staatus'), { target: { value: 'in_progress' } });
    await waitFor(() => expect(service.update).toHaveBeenCalledWith(expect.objectContaining({ id: 'x' }), { status: 'in_progress' }, teacher));
    fireEvent.change(within(dialog).getByLabelText('Vastus'), { target: { value: 'Teen ära' } });
    await act(async () => { fireEvent.click(within(dialog).getByRole('button', { name: 'Saada' })); });
    expect(service.reply).toHaveBeenCalledWith(expect.objectContaining({ id: 'x' }), 'Teen ära', teacher);
    expect(await within(dialog).findByText('Teen ära')).toBeInTheDocument();
    expect(within(dialog).getByLabelText('Vastus')).toHaveValue('');

    fireEvent.click(within(dialog).getByRole('button', { name: 'Sulge' }));
    expect(screen.getByTestId('location')).toHaveTextContent(/^\/tasks$/);
    expect(within(screen.getByRole('region', { name: 'Töös' })).getByText('Uuenda tunniplaani')).toBeInTheDocument();
  });

  it('ticks a task done, shows overdue tasks under their filter and lets the creator delete', async () => {
    const service = fakeTasks([
      { id: 'late', title: 'Vana ülesanne', assignedTo: 'Pavel', createdByUid: 'admin-1', dueDate: '2020-01-01', status: 'open' },
      { id: 'other', title: 'Teine', assignedTo: 'Pavel', status: 'open' },
    ]);
    vi.spyOn(globalThis, 'confirm').mockReturnValue(true);
    renderPage(admin, service);
    fireEvent.click(await screen.findByRole('tab', { name: /Tähtaeg möödas/ }));
    expect(screen.getByText('Vana ülesanne')).toBeInTheDocument();
    expect(screen.queryByText('Teine')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Märgi tehtuks: Vana ülesanne' }));
    await waitFor(() => expect(service.update).toHaveBeenCalledWith(expect.objectContaining({ id: 'late' }), { status: 'done' }, admin));
    fireEvent.click(screen.getByRole('tab', { name: /^Kõik/ }));
    fireEvent.click(screen.getByRole('button', { name: /^Vana ülesanne/ }));
    fireEvent.click(within(await screen.findByRole('dialog', { name: 'Ülesanne' })).getByRole('button', { name: /Kustuta/ }));
    await waitFor(() => expect(service.remove).toHaveBeenCalledWith(expect.objectContaining({ id: 'late' }), admin));
    expect(screen.queryByRole('dialog', { name: 'Ülesanne' })).not.toBeInTheDocument();
    globalThis.confirm.mockRestore();
  });
});
