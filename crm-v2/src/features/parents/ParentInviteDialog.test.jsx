import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import ParentInviteDialog from './ParentInviteDialog.jsx';

const students = [
  { id: 'misha', name: 'Mihhail Smirnov', subject: 'Eesti keel', parentName: 'Olga Smirnova', parentEmail: 'olga@example.ee' },
  { id: 'anna', name: 'Anna Smirnova', subject: 'Inglise keel' },
];

describe('parent invite dialog', () => {
  it('chooses a child, fills the parent from the card and creates the account', async () => {
    const service = { inviteParent: vi.fn().mockResolvedValue({ uid: 'p1', email: 'olga@example.ee', created: true, mailed: true, link: 'https://x.test/l' }) };
    const onDone = vi.fn();
    render(<ParentInviteDialog open students={students} service={service} onDone={onDone} />);
    fireEvent.change(screen.getByLabelText('Otsi last'), { target: { value: 'mihh' } });
    fireEvent.click(screen.getByRole('button', { name: /\+ Mihhail Smirnov/ }));
    expect(screen.getByLabelText('Lapsevanema nimi')).toHaveValue('Olga Smirnova');
    expect(screen.getByLabelText('E-post (kasutajanimi)')).toHaveValue('olga@example.ee');
    fireEvent.change(screen.getByLabelText('Otsi last'), { target: { value: 'anna' } });
    fireEvent.click(screen.getByRole('button', { name: /\+ Anna Smirnova/ }));
    fireEvent.change(screen.getByLabelText('Telefon'), { target: { value: '+372 555' } });
    fireEvent.click(screen.getByRole('button', { name: /Loo ja saada kutse/ }));
    await waitFor(() => expect(service.inviteParent).toHaveBeenCalledWith(expect.objectContaining({
      displayName: 'Olga Smirnova', email: 'olga@example.ee', phone: '+372 555', studentIds: ['misha', 'anna'], requestId: expect.stringMatching(/^invite-parent-/),
    })));
    expect(await screen.findByText(/Konto loodud: olga@example.ee/)).toBeInTheDocument();
    expect(screen.getByText(/Kiri on saadetud/)).toBeInTheDocument();
    expect(onDone).toHaveBeenCalledWith(expect.objectContaining({ uid: 'p1' }));
  });

  it('says when the login existed and offers the link when the e-mail is not confirmed', async () => {
    const service = { inviteParent: vi.fn().mockResolvedValue({ uid: 'p1', email: 'olga@example.ee', created: false, mailed: false, link: 'https://x.test/l' }) };
    render(<ParentInviteDialog open students={students} service={service} initial={{ displayName: 'Olga', email: 'olga@example.ee', studentIds: ['misha'] }} />);
    expect(screen.getByRole('button', { name: /Eemalda Mihhail Smirnov/ })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Loo ja saada kutse/ }));
    expect(await screen.findByText(/oli juba olemas/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Kopeeri link/ })).toBeInTheDocument();
  });

  it('shows the server refusal and keeps the form', async () => {
    const service = { inviteParent: vi.fn().mockRejectedValue(new Error('See e-post on töötaja konto.')) };
    render(<ParentInviteDialog open students={students} service={service} initial={{ displayName: 'Olga', email: 't@example.ee' }} />);
    fireEvent.click(screen.getByRole('button', { name: /Loo ja saada kutse/ }));
    expect(await screen.findByRole('alert')).toHaveTextContent('töötaja konto');
    expect(screen.getByLabelText('Lapsevanema nimi')).toHaveValue('Olga');
  });
});
