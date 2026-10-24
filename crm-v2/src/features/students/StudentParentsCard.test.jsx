import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import StudentParentsCard from './StudentParentsCard.jsx';

const admin = { uid: 'admin', roles: ['admin'], displayName: 'Admin' };
const parents = [
  { id: 'p1', displayName: 'Ema Tamm', email: 'ema@example.com', phone: '5551' },
  { id: 'p2', displayName: 'Isa Tamm', email: 'isa@example.com', childName: 'Mari' },
];

function renderCard(student, service) {
  const onChanged = vi.fn();
  render(<MemoryRouter><StudentParentsCard student={student} user={admin} service={service} onChanged={onChanged} /></MemoryRouter>);
  return onChanged;
}

describe('student card „Lapsevanemad”', () => {
  it('lists linked accounts and contacts without an account, links another parent and unlinks one', async () => {
    const service = { list: vi.fn().mockResolvedValue(parents), linkStudent: vi.fn().mockResolvedValue({}), unlinkStudent: vi.fn().mockResolvedValue({}) };
    const student = { id: 's1', name: 'Mari', linkedParentId: 'p1', parentContacts: [{ name: 'Vanaema', phone: '5559' }] };
    const onChanged = renderCard(student, service);
    expect(await screen.findByText('Ema Tamm')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Ava kaart' })).toHaveAttribute('href', '/parents?parent=p1');
    expect(screen.getByText('Vanaema')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Seo lapsevanem/ }));
    fireEvent.change(screen.getByLabelText('Otsi lapsevanemat'), { target: { value: 'isa' } });
    const result = screen.getByText('Isa Tamm').closest('li');
    await act(async () => { fireEvent.click(within(result).getByRole('button', { name: 'Seo' })); });
    expect(service.linkStudent).toHaveBeenCalledWith(parents[1], student, admin);
    const linked = screen.getByText('Ema Tamm').closest('li');
    fireEvent.click(within(linked).getByRole('button', { name: 'Eemalda seos' }));
    await act(async () => { fireEvent.click(within(linked).getByRole('button', { name: 'Kinnita eemaldamine' })); });
    expect(service.unlinkStudent).toHaveBeenCalledWith('p1', student, admin);
    expect(onChanged).toHaveBeenCalledTimes(2);
  });

  it('adds a parent without an account', async () => {
    const service = { list: vi.fn().mockResolvedValue([]), addContact: vi.fn().mockResolvedValue({}) };
    renderCard({ id: 's1', name: 'Mari' }, service);
    expect(await screen.findByText('sidumata')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Lisa kontakt ilma kontota/ }));
    fireEvent.change(screen.getByLabelText('Lapsevanema nimi'), { target: { value: 'Isa' } });
    fireEvent.change(screen.getByLabelText('E-post'), { target: { value: 'isa@example.com' } });
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: 'Salvesta kontakt' })); });
    expect(service.addContact).toHaveBeenCalledWith({ id: 's1', name: 'Mari' }, { name: 'Isa', email: 'isa@example.com', phone: '' }, admin);
  });

  it('shows the error of a refused change', async () => {
    const service = { list: vi.fn().mockResolvedValue([]), addContact: vi.fn().mockRejectedValue(new Error('See kontakt on kaardil juba olemas.')) };
    renderCard({ id: 's1', name: 'Mari' }, service);
    fireEvent.click(await screen.findByRole('button', { name: /Lisa kontakt ilma kontota/ }));
    fireEvent.change(screen.getByLabelText('E-post'), { target: { value: 'isa@example.com' } });
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: 'Salvesta kontakt' })); });
    expect(await screen.findByRole('alert')).toHaveTextContent('juba olemas');
  });
});
