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

  it('previews and confirms a server-owned duplicate merge', async () => {
    const service = { list: vi.fn().mockResolvedValue({ items: [], cursor: null, hasMore: false }) };
    const group = { key: 'g1', confidence: 'high', reasons: [{ label: 'Sama e-post' }], students: [{ id: 's1', name: 'Mari', email: 'mari@example.com' }, { id: 's2', name: 'Mari', email: 'mari@example.com' }] };
    const mergeApi = {
      previewDataQuality: vi.fn().mockResolvedValue({ duplicateGroups: [group] }),
      previewStudentMerge: vi.fn().mockResolvedValue({ primary: group.students[0], duplicates: [group.students[1]], totalReferenceCount: 3, groupCount: 1, preservedProfileCount: 1, profileConflictCount: 0, profileConflicts: [] }),
      mergeStudents: vi.fn().mockResolvedValue({}),
    };
    render(<MemoryRouter><StudentsPage service={service} mergeApi={mergeApi} actor={{ uid: 'admin', roles: ['admin'] }} /></MemoryRouter>);
    fireEvent.click(await screen.findByRole('button', { name: 'Kontrolli duplikaate' }));
    const dialog = await screen.findByRole('dialog', { name: 'Õpilaste duplikaadid' });
    fireEvent.click((await within(dialog).findAllByRole('button', { name: 'Vaata ja ühenda' })).at(-1));
    fireEvent.click(screen.getByRole('button', { name: 'Koosta eelvaade' }));
    await waitFor(() => expect(mergeApi.previewStudentMerge).toHaveBeenCalledWith('s1', ['s2']));
    // permanent delete is the default and needs the main card's name
    const confirm = await screen.findByRole('button', { name: 'Ühenda ja kustuta duplikaat' });
    expect(confirm).toBeDisabled();
    fireEvent.change(screen.getByLabelText('Kinnitamiseks kirjuta: Mari'), { target: { value: ' mari ' } });
    fireEvent.click(confirm);
    await waitFor(() => expect(mergeApi.mergeStudents).toHaveBeenCalledWith('s1', ['s2'], { permanent: true, confirmName: ' mari ' }));
  });

  it('merges two cards picked by hand and can only archive instead', async () => {
    const items = [{ id: 'a1', name: 'Kati Tamm', active: true, parentEmail: 'x@example.com' }, { id: 'b2', name: 'Katja Tamm', active: true, parentEmail: 'y@example.com' }];
    const service = { list: vi.fn().mockResolvedValue({ items, cursor: null, hasMore: false }) };
    const mergeApi = {
      previewDataQuality: vi.fn().mockResolvedValue({ duplicateGroups: [] }),
      previewStudentMerge: vi.fn().mockResolvedValue({ primary: items[0], duplicates: [items[1]], totalReferenceCount: 1, groupCount: 0, preservedProfileCount: 1, profileConflictCount: 0, profileConflicts: [] }),
      mergeStudents: vi.fn().mockResolvedValue({}),
    };
    render(<MemoryRouter><StudentsPage service={service} mergeApi={mergeApi} actor={{ uid: 'admin', roles: ['admin'] }} /></MemoryRouter>);
    fireEvent.click(await screen.findByRole('button', { name: 'Kontrolli duplikaate' }));
    const dialog = await screen.findByRole('dialog', { name: 'Õpilaste duplikaadid' });
    fireEvent.change(await within(dialog).findByLabelText('Kaart 1'), { target: { value: 'a1' } });
    fireEvent.change(within(dialog).getByLabelText('Kaart 2'), { target: { value: 'b2' } });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Vaata ja ühenda' }));
    fireEvent.click(screen.getByRole('button', { name: 'Koosta eelvaade' }));
    await waitFor(() => expect(mergeApi.previewStudentMerge).toHaveBeenCalledWith('a1', ['b2']));
    fireEvent.click(await screen.findByLabelText(/Kustuta duplikaat jäädavalt/));
    fireEvent.click(screen.getByRole('button', { name: 'Kinnita ühendamine' }));
    await waitFor(() => expect(mergeApi.mergeStudents).toHaveBeenCalledWith('a1', ['b2'], {}));
  });

  it('deletes cards that were only archived by an earlier merge after typing KUSTUTA', async () => {
    const service = { list: vi.fn().mockResolvedValue({ items: [], cursor: null, hasMore: false }) };
    const mergeApi = {
      previewDataQuality: vi.fn().mockResolvedValue({ duplicateGroups: [] }),
      previewArchivedDuplicates: vi.fn().mockResolvedValue({ items: [{ id: 'd1', name: 'Mari (vana)', mainId: 'm1', mainName: 'Mari', mainExists: true }], ready: 1 }),
      purgeArchivedDuplicates: vi.fn().mockResolvedValue({ deleted: 1 }),
    };
    render(<MemoryRouter><StudentsPage service={service} mergeApi={mergeApi} actor={{ uid: 'admin', roles: ['admin'] }} /></MemoryRouter>);
    fireEvent.click(await screen.findByRole('button', { name: 'Kontrolli duplikaate' }));
    expect(await screen.findByText(/Mari \(vana\) → Mari/)).toBeInTheDocument();
    const button = screen.getByRole('button', { name: 'Kustuta jäädavalt' });
    expect(button).toBeDisabled();
    fireEvent.change(screen.getByLabelText('Kinnitamiseks kirjuta KUSTUTA'), { target: { value: 'KUSTUTA' } });
    fireEvent.click(button);
    await waitFor(() => expect(mergeApi.purgeArchivedDuplicates).toHaveBeenCalled());
    expect(await screen.findByText('Kustutatud 1 varem arhiveeritud duplikaati.')).toBeInTheDocument();
  });
});
