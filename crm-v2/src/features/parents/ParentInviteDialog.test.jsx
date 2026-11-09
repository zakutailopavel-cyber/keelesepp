import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
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
  it('lists archived cards under „Arhiveeritud”, asks, and restores the card after the invite („Taasta ja seo”)', async () => {
    const pool = [
      ...students,
      { id: 'liisa', name: 'Liisa Vana', subject: 'Eesti keel', email: 'liisa@example.ee', phone: '+372 5123 4567', active: false },
      { id: 'trash', name: 'Liisa Prügi', active: false, deletedAt: '2026-11-05T10:00:00Z' },
    ];
    const service = { inviteParent: vi.fn().mockResolvedValue({ uid: 'p1', email: 'olga@example.ee', created: true, mailed: true, link: '' }) };
    const studentRepository = { restore: vi.fn().mockResolvedValue({}) };
    render(<ParentInviteDialog open students={pool} service={service} studentRepository={studentRepository} initial={{ displayName: 'Olga', email: 'olga@example.ee' }} />);
    fireEvent.change(screen.getByLabelText('Otsi last'), { target: { value: 'liisa' } });
    const archivedGroup = screen.getByRole('group', { name: 'Arhiveeritud' });
    expect(screen.queryByText(/Liisa Prügi/)).not.toBeInTheDocument();
    fireEvent.click(within(archivedGroup).getByRole('button', { name: /\+ Liisa Vana/ }));
    expect(screen.getByRole('group', { name: 'Arhiveeritud õpilane' })).toHaveTextContent('Õpilane on arhiveeritud — kas taastada aktiivseks?');
    fireEvent.click(screen.getByRole('button', { name: 'Taasta ja seo' }));
    expect(screen.getByRole('button', { name: /Eemalda Liisa Vana/ })).toHaveTextContent('taastatakse');
    // phone search finds it too
    fireEvent.change(screen.getByLabelText('Otsi last'), { target: { value: '5123' } });
    expect(screen.queryByRole('button', { name: /\+ Liisa Vana/ })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Loo ja saada kutse/ }));
    await waitFor(() => expect(service.inviteParent).toHaveBeenCalledWith(expect.objectContaining({ studentIds: ['liisa'] })));
    await waitFor(() => expect(studentRepository.restore).toHaveBeenCalledWith(['liisa']));
    expect(await screen.findByText(/Taastati arhiivist: Liisa Vana/)).toBeInTheDocument();
  });

  it('„Seo arhiveerituna” links the archived card and restores nothing', async () => {
    const pool = [{ id: 'liisa', name: 'Liisa Vana', parentName: 'Olga Smirnova', active: false }];
    const service = { inviteParent: vi.fn().mockResolvedValue({ uid: 'p1', email: 'olga@example.ee', created: true, mailed: true, link: '' }) };
    const studentRepository = { restore: vi.fn() };
    render(<ParentInviteDialog open students={pool} service={service} studentRepository={studentRepository} initial={{ displayName: 'Olga', email: 'olga@example.ee' }} />);
    fireEvent.change(screen.getByLabelText('Otsi last'), { target: { value: 'smirnova' } });
    fireEvent.click(screen.getByRole('button', { name: /\+ Liisa Vana/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Seo arhiveerituna' }));
    expect(screen.getByRole('button', { name: /Eemalda Liisa Vana/ })).toHaveTextContent('arhiveeritud');
    fireEvent.click(screen.getByRole('button', { name: /Loo ja saada kutse/ }));
    await waitFor(() => expect(service.inviteParent).toHaveBeenCalledWith(expect.objectContaining({ studentIds: ['liisa'] })));
    expect(await screen.findByText(/Konto loodud/)).toBeInTheDocument();
    expect(studentRepository.restore).not.toHaveBeenCalled();
  });
});
