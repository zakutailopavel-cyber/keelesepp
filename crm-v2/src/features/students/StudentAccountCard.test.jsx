import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import StudentAccountCard from './StudentAccountCard.jsx';

const childCard = { id: 'misha', name: 'Mihhail Smirnov', parentEmail: 'mum@example.ee', email: 'mum@example.ee', linkedParentIds: ['mum'] };

describe('student account card', () => {
  it('invites a student who logs in with the parent account: the parent e-mail is not suggested', async () => {
    const service = { inviteStudent: vi.fn().mockResolvedValue({ uid: 'u1', email: 'misha@example.ee', created: true, mailed: true, link: 'https://x.test/l' }) };
    const onInvited = vi.fn();
    render(<StudentAccountCard student={childCard} service={service} onInvited={onInvited} />);
    expect(screen.getByText(/lapsevanema kontoga/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Õpilasele oma konto/ }));
    const input = screen.getByLabelText('Õpilase e-post');
    expect(input).toHaveValue('');
    fireEvent.change(input, { target: { value: 'misha@example.ee' } });
    fireEvent.click(screen.getByRole('button', { name: /^Saada$/ }));
    await waitFor(() => expect(service.inviteStudent).toHaveBeenCalledWith({ studentId: 'misha', email: 'misha@example.ee' }));
    expect(await screen.findByText(/Konto loodud: misha@example.ee/)).toBeInTheDocument();
    expect(screen.getByText(/Kiri on saadetud/)).toBeInTheDocument();
    expect(onInvited).toHaveBeenCalledWith(expect.objectContaining({ uid: 'u1' }));
  });

  it('sends a new password link to the student\'s own account and offers the link when the e-mail is not confirmed', async () => {
    const service = { inviteStudent: vi.fn().mockResolvedValue({ uid: 'u1', email: 'anna@example.ee', created: false, mailed: false, link: 'https://x.test/l' }) };
    render(<StudentAccountCard student={{ id: 'anna', name: 'Anna', studentUid: 'u1' }} service={service} />);
    fireEvent.click(screen.getByRole('button', { name: /Saada parooli link/ }));
    await waitFor(() => expect(service.inviteStudent).toHaveBeenCalledWith({ studentId: 'anna', email: '' }));
    expect(await screen.findByText(/saada link õpilasele ise/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Kopeeri link/ })).toBeInTheDocument();
  });

  it('shows the server refusal', async () => {
    const service = { inviteStudent: vi.fn().mockRejectedValue(new Error('Sellel e-postil on juba konto.')) };
    render(<StudentAccountCard student={childCard} service={service} />);
    fireEvent.click(screen.getByRole('button', { name: /Õpilasele oma konto/ }));
    fireEvent.change(screen.getByLabelText('Õpilase e-post'), { target: { value: 'taken@example.ee' } });
    fireEvent.click(screen.getByRole('button', { name: /^Saada$/ }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Sellel e-postil on juba konto.');
  });
});

describe('student account card: parent login', () => {
  it('creates a parent login from the card\'s parent name and e-mail', async () => {
    const service = { inviteParent: vi.fn().mockResolvedValue({ uid: 'p1', email: 'olga@example.ee', created: true, mailed: true, link: 'l' }) };
    const onParentInvited = vi.fn();
    render(<StudentAccountCard student={{ id: 'misha', name: 'Misha', parentName: 'Olga', parentEmail: 'olga@example.ee' }} service={service} onParentInvited={onParentInvited} />);
    // „Saada kutse” goes to the parent's e-mail by default (team 2026-10-29)
    expect(screen.getByText(/lapsevanema e-postile \(olga@example.ee\)/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Saada kutse/ }));
    expect(screen.getByLabelText(/E-post/i)).toHaveValue('olga@example.ee');
    expect(screen.getByLabelText('Lapsevanema nimi')).toHaveValue('Olga');
    fireEvent.click(screen.getByRole('button', { name: /Loo ja saada kutse/ }));
    await waitFor(() => expect(service.inviteParent).toHaveBeenCalledWith(expect.objectContaining({ email: 'olga@example.ee', studentIds: ['misha'] })));
    expect(onParentInvited).toHaveBeenCalledWith(expect.objectContaining({ uid: 'p1' }));
  });

  it('a card with a parent login offers no second one', () => {
    render(<StudentAccountCard student={childCard} service={{}} />);
    expect(screen.queryByRole('button', { name: /Loo lapsevanema konto/ })).not.toBeInTheDocument();
    expect(screen.getByText(/Lapsevanema konto on kaardiga seotud/)).toBeInTheDocument();
  });
});

describe('student account card: no parent e-mail', () => {
  it('invites the student directly and offers a parent login', () => {
    render(<StudentAccountCard student={{ id: 'anna', name: 'Anna', email: 'anna@example.ee' }} service={{}} />);
    fireEvent.click(screen.getByRole('button', { name: /Saada kutse/ }));
    expect(screen.getByLabelText('Õpilase e-post')).toHaveValue('anna@example.ee');
    expect(screen.getByRole('button', { name: /Loo lapsevanema konto/ })).toBeInTheDocument();
  });
});
