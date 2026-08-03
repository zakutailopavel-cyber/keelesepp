import { fireEvent, render, screen, waitFor } from '@testing-library/react';
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
    renderPage(service, { roles: ['teacher'], displayName: 'Pavel' });
    await waitFor(() => expect(service.list).toHaveBeenCalledWith(expect.objectContaining({ scopeTeacher: 'Pavel Zakutailo' })));
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
  });

  it('forces a teacher’s own canonical name when creating a student', async () => {
    const service = {
      list: vi.fn().mockResolvedValue({ items: [{ id: 'existing', name: 'Olemas', teacher: 'Pavel', active: true }], cursor: null, hasMore: false }),
      create: vi.fn().mockResolvedValue({ id: 'new' }),
    };
    renderPage(service, { roles: ['teacher'], displayName: 'Pavel' });
    await screen.findAllByText('Olemas');
    fireEvent.click(screen.getByRole('button', { name: 'Lisa õpilane' }));
    fireEvent.change(screen.getByLabelText('Õpilase nimi *'), { target: { value: 'Uus Õpilane' } });
    fireEvent.click(screen.getByRole('button', { name: 'Salvesta' }));
    await waitFor(() => expect(service.create).toHaveBeenCalledWith(expect.objectContaining({ name: 'Uus Õpilane', teacher: 'Pavel Zakutailo' })));
  });
});
