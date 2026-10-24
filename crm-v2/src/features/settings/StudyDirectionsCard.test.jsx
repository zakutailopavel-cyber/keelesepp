import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import StudyDirectionsCard from './StudyDirectionsCard.jsx';

const admin = { uid: 'admin', roles: ['admin'], displayName: 'Admin' };

describe('Seaded → Õppesuunad', () => {
  it('shows the built-in list until saved; the first save stores the whole list', async () => {
    const service = { list: vi.fn().mockResolvedValue([]), save: vi.fn().mockResolvedValue({}) };
    const studentService = { list: vi.fn().mockResolvedValue({ items: [{ id: 's1', subject: 'Eesti keel' }, { id: 's2', subject: 'Kunst' }] }) };
    render(<StudyDirectionsCard user={admin} service={service} studentService={studentService} />);
    expect(await screen.findByText(/vaikimisi suunad/)).toBeInTheDocument();
    expect(await screen.findByText(/1 õpilast/)).toBeInTheDocument();
    expect(screen.getByText(/Kaartidel on ka:/).closest('div')).toHaveTextContent('Kunst (1)');
    fireEvent.click(screen.getByRole('button', { name: /Lisa õppesuund/ }));
    fireEvent.change(screen.getByLabelText('Nimi'), { target: { value: 'Keemia' } });
    fireEvent.change(screen.getByLabelText('Tasemed (komaga)'), { target: { value: '8. klass, 9. klass' } });
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: 'Salvesta õppesuund' })); });
    await waitFor(() => expect(service.save).toHaveBeenCalledTimes(6));
    expect(service.save.mock.calls.slice(0, 5).map(([item]) => item.name)).toEqual(['Eesti keel', 'Inglise keel', 'Matemaatika', 'Emakeel', 'Vene keel']);
    expect(service.save.mock.calls[5][0]).toMatchObject({ name: 'Keemia', levels: ['8. klass', '9. klass'], status: 'active' });
  });

  it('archives a stored direction without deleting it', async () => {
    const service = { list: vi.fn().mockResolvedValue([{ id: 'vene-keel', name: 'Vene keel', status: 'active', order: 1 }]), save: vi.fn().mockResolvedValue({}) };
    render(<StudyDirectionsCard user={admin} service={service} studentService={{ list: vi.fn().mockResolvedValue({ items: [] }) }} />);
    const row = (await screen.findByText('Vene keel')).closest('li');
    await act(async () => { fireEvent.click(within(row).getByRole('button', { name: 'Arhiveeri' })); });
    expect(service.save).toHaveBeenCalledTimes(1);
    expect(service.save.mock.calls[0][0]).toMatchObject({ id: 'vene-keel', status: 'archived' });
  });
});
