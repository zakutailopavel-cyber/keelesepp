import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import StudentsPage from './StudentsPage.jsx';

function renderPage(service, actor) {
  return render(<MemoryRouter><StudentsPage service={service} actor={actor} /></MemoryRouter>);
}

describe('students list states', () => {
  it('shows loading while the service is pending', () => {
    renderPage({ list: () => new Promise(() => {}) });
    expect(screen.getByText('Laen õpilasi…')).toBeInTheDocument();
  });

  it('shows the empty state', async () => {
    renderPage({ list: async () => ({ items: [], cursor: null, hasMore: false }) });
    expect(await screen.findByText('Õpilasi ei leitud')).toBeInTheDocument();
  });

  it('shows an error returned by the service', async () => {
    renderPage({ list: async () => { throw new Error('Firestore unavailable'); } });
    expect(await screen.findByText('Firestore unavailable')).toBeInTheDocument();
  });

  it('renders students returned by the service', async () => {
    renderPage({ list: async () => ({ items: [{ id: 's1', name: 'Mari Maas', email: 'mari@example.com', active: true, skillMap: {} }], cursor: null, hasMore: false }) });
    expect(await screen.findAllByText('Mari Maas')).not.toHaveLength(0);
    expect(screen.getByRole('region', { name: 'Õpilaste kokkuvõte' })).toHaveTextContent('Aktiivsed1');
    expect(screen.getAllByText('MM').length).toBeGreaterThan(0);
  });

  it('merges legacy spellings into one teacher name and one filter option', async () => {
    renderPage({ list: async () => ({
      items: [
        { id: 's1', name: 'Mari', teacher: 'Pavel', active: true },
        { id: 's2', name: 'Jaan', teacher: 'Pavel Zakutailo', active: true },
        { id: 's3', name: 'Kati', teacher: 'Elizaveta', active: true },
      ],
      cursor: null,
      hasMore: false,
    }) });
    const teacherFilter = await screen.findByLabelText('Õpetaja');
    expect(within(teacherFilter).getAllByRole('option', { name: 'Pavel Zakutailo' })).toHaveLength(1);
    expect(within(teacherFilter).getAllByRole('option', { name: 'Yelyzaveta Lukiianchuk' })).toHaveLength(1);
    expect(screen.queryByText(/^Pavel$/)).not.toBeInTheDocument();
    expect(screen.queryByText(/^Elizaveta$/)).not.toBeInTheDocument();
  });

  it('can continue when a filtered first page contains no matches', async () => {
    const service = {
      list: vi.fn()
        .mockResolvedValueOnce({ items: [], cursor: 'page-1', hasMore: true })
        .mockResolvedValueOnce({ items: [{ id: 's2', name: 'Jaan Tamm', active: true }], cursor: null, hasMore: false }),
    };
    renderPage(service);
    fireEvent.click(await screen.findByRole('button', { name: 'Laadi veel' }));
    expect(await screen.findAllByText('Jaan Tamm')).not.toHaveLength(0);
    expect(service.list).toHaveBeenLastCalledWith(expect.objectContaining({ cursor: 'page-1' }));
  });

  it('scopes teacher requests to the signed-in teacher', async () => {
    const service = { list: vi.fn().mockResolvedValue({ items: [], cursor: null, hasMore: false }) };
    renderPage(service, { uid: 'teacher-pavel', roles: ['teacher'], displayName: 'Pavel' });
    await waitFor(() => expect(service.list).toHaveBeenCalledWith(expect.objectContaining({ scopeTeacher: 'Pavel Zakutailo', scopeTeacherUid: 'teacher-pavel' })));
    expect(screen.queryByLabelText('Õpetaja')).not.toBeInTheDocument();
  });

  it('debounces search requests and keeps hidden contacts out of the UI', async () => {
    const service = { list: vi.fn().mockResolvedValue({ items: [{ id: 's3', name: 'Kati', email: 'private@example.com', hiddenFields: { email: true }, active: true }], cursor: null, hasMore: false }) };
    renderPage(service);
    expect(await screen.findAllByText('Kati')).not.toHaveLength(0);
    expect(screen.queryByText('private@example.com')).not.toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Otsi nime, telefoni või e-posti järgi'), { target: { value: 'Mari' } });
    const callsBeforeDebounce = service.list.mock.calls.length;
    expect(service.list).toHaveBeenCalledTimes(callsBeforeDebounce);
    await waitFor(() => expect(service.list).toHaveBeenCalledWith(expect.objectContaining({ search: 'Mari' })), { timeout: 1000 });
    await new Promise((resolve) => window.setTimeout(resolve, 400));
    expect(service.list).toHaveBeenLastCalledWith(expect.objectContaining({ search: 'Mari' }));
  });

  it('forces a teacher’s own canonical name when creating a student', async () => {
    const service = {
      list: vi.fn().mockResolvedValue({ items: [{ id: 'existing', name: 'Olemas', teacher: 'Pavel', active: true }], cursor: null, hasMore: false }),
      create: vi.fn().mockResolvedValue({ id: 'new' }),
    };
    renderPage(service, { uid: 'teacher-pavel', roles: ['teacher'], displayName: 'Pavel' });
    await screen.findAllByText('Olemas');
    fireEvent.click(screen.getByRole('button', { name: 'Lisa õpilane' }));
    fireEvent.change(screen.getByLabelText('Õpilase nimi *'), { target: { value: 'Uus Õpilane' } });
    fireEvent.click(screen.getByRole('button', { name: 'Salvesta' }));
    await waitFor(() => expect(service.create).toHaveBeenCalledWith(expect.objectContaining({ name: 'Uus Õpilane', teacher: 'Pavel Zakutailo' })));
  });

  it('lets an admin edit and add learning directions without creating another student', async () => {
    const items = [{
      id: 's1',
      name: 'Georg',
      linkedParentId: 'p1',
      active: true,
      subject: 'Eesti keel',
      level: 'A1',
      targetLevel: 'A2',
      teacher: 'Pavel',
      enrollments: [{ id: 'estonian', subject: 'Eesti keel', level: 'A1', targetLevel: 'A2', teacher: 'Pavel Zakutailo', active: true }],
    }];
    const service = {
      list: vi.fn().mockResolvedValue({ items, cursor: null, hasMore: false }),
      updateEnrollment: vi.fn().mockResolvedValue(undefined),
      addEnrollment: vi.fn().mockResolvedValue(undefined),
    };
    renderPage(service, { uid: 'admin-1', roles: ['admin'], displayName: 'Admin' });
    await screen.findAllByText('Georg');
    fireEvent.click(screen.getAllByRole('button', { name: 'Õppesuunad' })[0]);
    const dialog = screen.getByRole('dialog', { name: 'Õppesuunad: Georg' });
    fireEvent.change(within(dialog).getAllByLabelText('Õppeaine')[0], { target: { value: 'Matemaatika' } });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Salvesta õppesuund' }));
    await waitFor(() => expect(service.updateEnrollment).toHaveBeenCalledWith('s1', expect.any(String), expect.objectContaining({ subject: 'Matemaatika' })));

    fireEvent.change(within(dialog).getAllByLabelText('Õppeaine')[1], { target: { value: 'Inglise keel' } });
    fireEvent.change(within(dialog).getAllByLabelText('Õpetaja')[1], { target: { value: 'Yelyzaveta Lukiianchuk' } });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Lisa õppesuund' }));
    await waitFor(() => expect(service.addEnrollment).toHaveBeenCalledWith('s1', expect.objectContaining({ subject: 'Inglise keel', teacher: 'Yelyzaveta Lukiianchuk' })));
    expect(service.create).toBeUndefined();
  });

  it('requires confirmation before non-destructive archive and refreshes the list', async () => {
    const service = {
      list: vi.fn()
        .mockResolvedValueOnce({ items: [{ id: 's1', personId: 'mari', name: 'Mari', teacher: 'Pavel', active: true }, { id: 's2', personId: 'mari', name: 'Mari', teacher: 'Jelena', active: true }], cursor: null, hasMore: false })
        .mockResolvedValue({ items: [], cursor: null, hasMore: false }),
      archive: vi.fn().mockResolvedValue(undefined),
    };
    renderPage(service);
    await screen.findAllByText('Mari');

    fireEvent.click(screen.getAllByRole('button', { name: 'Arhiveeri Mari' })[0]);
    expect(service.archive).not.toHaveBeenCalled();
    const dialog = screen.getByRole('dialog', { name: 'Arhiveeri õpilane' });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Arhiveeri' }));

    await waitFor(() => expect(service.archive).toHaveBeenCalledWith(['s1', 's2']));
    await waitFor(() => expect(service.list).toHaveBeenCalledTimes(2));
    expect(await screen.findByText('Õpilane on arhiveeritud.')).toBeInTheDocument();
  });

  it('restores every physical record represented by an archived person', async () => {
    const service = {
      list: vi.fn().mockResolvedValue({ items: [{ id: 's1', personId: 'mari', name: 'Mari', active: false }, { id: 's2', personId: 'mari', name: 'Mari', active: false }], cursor: null, hasMore: false }),
      restore: vi.fn().mockResolvedValue(undefined),
    };
    renderPage(service);
    fireEvent.click((await screen.findAllByRole('button', { name: 'Taasta Mari' }))[0]);
    fireEvent.click(within(screen.getByRole('dialog', { name: 'Taasta õpilane' })).getByRole('button', { name: 'Taasta' }));
    await waitFor(() => expect(service.restore).toHaveBeenCalledWith(['s1', 's2']));
  });

  it('lists possible duplicate cards side by side, hides a pair marked „Pole sama inimene” and opens the merge with the pair', async () => {
    const items = [
      { id: 'a1', name: 'Milan', active: true, linkedParentId: 'p1', subject: 'Inglise keel', phone: '+372 5123 4567', email: 'milan.g@example.com' },
      { id: 'b2', name: 'Milan Grozovski', active: true, linkedParentIds: ['p1'], subject: 'Eesti keel' },
      { id: 'c3', name: 'Maria', active: true },
      { id: 'd4', name: 'Maria', active: true },
      { id: 'e5', name: 'Sofia', active: true, linkedParentId: 'p1' },
    ];
    const service = { list: vi.fn().mockResolvedValue({ items, cursor: null, hasMore: false }), markNotDuplicate: vi.fn().mockResolvedValue({}), recordCounts: vi.fn(async (id) => (id === 'a1' ? { lessons: 12, invoices: 3 } : { lessons: 0, invoices: 0 })) };
    const mergeService = { mergeStudents: vi.fn(async ({ apply }) => ({ applied: Boolean(apply), keep: { id: 'a1', name: 'Milan', accounts: [] }, source: { id: 'b2', name: 'Milan Grozovski', accounts: [] }, names: ['Milan', 'Milan Grozovski'], keepName: 'Milan', move: [{ collection: 'lessons', field: 'studentId', count: 4, kind: 'learner' }], totals: { learner: 4 }, documents: [], conflicts: [], skipped: [], price: { action: 'none' } })) };
    render(<MemoryRouter><StudentsPage service={service} mergeService={mergeService} actor={{ uid: 'admin', roles: ['admin'] }} /></MemoryRouter>);
    fireEvent.click(await screen.findByRole('button', { name: /Võimalikud topeltkaardid/ }));
    const dialog = await screen.findByRole('dialog', { name: 'Võimalikud topeltkaardid' });
    expect(await within(dialog).findByText('Milan / Milan Grozovski')).toBeInTheDocument();
    expect(within(dialog).getByText(/Sarnane nimi · Sama lapsevanema konto/)).toBeInTheDocument();
    expect(within(dialog).getByText(/Sama inimene, eri ained \(Inglise keel \/ Eesti keel\)/)).toBeInTheDocument();
    expect(within(dialog).getByText('Maria / Maria')).toBeInTheDocument();
    expect(within(dialog).queryByText(/Sofia/)).toBeNull();
    // both cards side by side with their history; contacts never in full
    const milanCards = within(dialog).getByText('Milan / Milan Grozovski').closest('section');
    expect(await within(milanCards).findByText('12')).toBeInTheDocument();
    expect(within(milanCards).queryAllByText('kontot pole')).toHaveLength(0);
    expect(within(milanCards).getAllByText('ainult lapsevanema konto')).toHaveLength(2);
    expect(within(milanCards).getByText('m•••@example.com · •••• 67')).toBeInTheDocument();
    expect(within(dialog).queryByText(/5123|milan\.g@/)).toBeNull();
    expect(service.recordCounts).toHaveBeenCalledWith('a1');
    // two children called Maria
    const maria = within(dialog).getByText('Maria / Maria').closest('section');
    fireEvent.click(within(maria).getByRole('button', { name: 'Pole sama inimene' }));
    await waitFor(() => expect(service.markNotDuplicate).toHaveBeenCalledWith('c3', 'd4'));
    await waitFor(() => expect(within(dialog).queryByText('Maria / Maria')).toBeNull());
    const milan = within(dialog).getByText('Milan / Milan Grozovski').closest('section');
    fireEvent.click(within(milan).getByRole('button', { name: 'Ava ühendamine' }));
    const merge = await screen.findByRole('dialog', { name: 'Liida kaardid: Milan' });
    expect(await within(merge).findByText(/Tunnid: 4/)).toBeInTheDocument();
    expect(mergeService.mergeStudents).toHaveBeenCalledWith({ keepId: 'a1', sourceId: 'b2' });
    fireEvent.click(within(merge).getByRole('checkbox', { name: /Kontrollisin eelvaadet/ }));
    fireEvent.click(within(merge).getByRole('button', { name: 'Liida kaardid' }));
    await waitFor(() => expect(mergeService.mergeStudents).toHaveBeenLastCalledWith({ keepId: 'a1', sourceId: 'b2', apply: true, confirmed: true }));
    expect(await screen.findByText(/Kaardid on liidetud/)).toBeInTheDocument();
  });

  it('two ARCHIVED cards of one child are listed (2026-11-06) and „Ava ühendamine” opens the merge with both archived', async () => {
    const items = [
      { id: 'old1', name: 'Mia Saar', active: false, parentEmail: 'ema@example.com' },
      { id: 'old2', name: 'Mia Saar', active: false, parentEmail: 'ema@example.com' },
    ];
    const service = { list: vi.fn().mockResolvedValue({ items, cursor: null, hasMore: false }), markNotDuplicate: vi.fn() };
    const mergeService = { mergeStudents: vi.fn(async () => ({ applied: false, keep: { id: 'old1', name: 'Mia Saar', active: false, accounts: [] }, source: { id: 'old2', name: 'Mia Saar', active: false, accounts: [] }, names: ['Mia Saar'], keepName: 'Mia Saar', activeAfter: false, move: [{ collection: 'invoices', field: 'studentId', count: 2, kind: 'finance' }], totals: { finance: 2 }, documents: [], conflicts: [{ code: 'archived_result', label: 'Pärast liitmist on kaart arhiveeritud' }], skipped: [], price: { action: 'none' } })) };
    render(<MemoryRouter><StudentsPage service={service} mergeService={mergeService} actor={{ uid: 'admin', roles: ['admin'] }} /></MemoryRouter>);
    fireEvent.click(await screen.findByRole('button', { name: /Võimalikud topeltkaardid/ }));
    const dialog = await screen.findByRole('dialog', { name: 'Võimalikud topeltkaardid' });
    const pair = (await within(dialog).findByText('Mia Saar / Mia Saar')).closest('section');
    expect(within(pair).getAllByText('Arhiveeritud')).toHaveLength(2);
    fireEvent.click(within(pair).getByRole('button', { name: 'Ava ühendamine' }));
    const merge = await screen.findByRole('dialog', { name: 'Liida kaardid: Mia Saar' });
    expect(await within(merge).findByText(/Arved: 2 \(summad ja numbrid ei muutu\)/)).toBeInTheDocument();
    expect(mergeService.mergeStudents).toHaveBeenCalledWith({ keepId: 'old1', sourceId: 'old2' });
    expect(within(merge).getByRole('radio', { name: 'Arhiveeritud' })).toBeChecked();
  });
});

describe('students list: last visit', () => {
  it('shows when the student was last in the CRM', async () => {
    const presenceApi = { forStudents: vi.fn(async () => new Map([['s1', { lastSeenAt: Date.now(), practice: null }]])) };
    render(<MemoryRouter><StudentsPage service={{ list: async () => ({ items: [{ id: 's1', name: 'Mari Maas', active: true, linkedUserId: 'u1', skillMap: {} }], cursor: null, hasMore: false }) }} presenceApi={presenceApi} actor={{ uid: 'admin', roles: ['admin'] }} /></MemoryRouter>);
    expect((await screen.findAllByText(/sees täna/)).length).toBeGreaterThan(0);
    expect(presenceApi.forStudents).toHaveBeenCalledWith([expect.objectContaining({ id: 's1' })]);
  });
});

describe('„Ilma ajata” (owner 2026-10-27)', () => {
  it('the button opens the students without suitable times, with the parent contact', async () => {
    const service = { list: vi.fn().mockResolvedValue({ items: [], cursor: null, hasMore: false }) };
    const noTimesApi = {
      students: { list: vi.fn(async () => ({ items: [{ id: 's1', name: 'Mia', active: true, parentName: 'Ema', parentPhone: '5551 111', teacher: 'Pavel' }] })) },
      times: { list: vi.fn(async () => []) }, leads: { list: vi.fn(async () => []) }, lessons: { listForCalendar: vi.fn(async () => []) },
    };
    render(<MemoryRouter><StudentsPage service={service} actor={{ uid: 'a1', roles: ['admin'], displayName: 'Admin' }} noTimesApi={noTimesApi} /></MemoryRouter>);
    fireEvent.click(await screen.findByRole('button', { name: 'Ilma ajata' }));
    const panel = await screen.findByRole('region', { name: 'Ilma ajata' });
    expect(await within(panel).findByText('Vanem: Ema')).toBeInTheDocument();
    expect(within(panel).getByRole('heading', { name: 'Ilma ajata (1)' })).toBeInTheDocument();
  });
});
