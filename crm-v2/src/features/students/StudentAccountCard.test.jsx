import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import StudentAccountCard from './StudentAccountCard.jsx';

const childCard = { id: 'misha', name: 'Mihhail Smirnov', parentEmail: 'mum@example.ee', email: 'mum@example.ee', linkedParentIds: ['mum'] };

describe('student account card', () => {
  it('invites a student who logs in with the parent account: the parent e-mail is not suggested', async () => {
    const service = { inviteStudent: vi.fn().mockResolvedValue({ uid: 'u1', email: 'misha@example.ee', created: true, mailed: true, link: 'https://x.test/l' }) };
    const onInvited = vi.fn();
    render(<StudentAccountCard student={childCard} service={service} onInvited={onInvited} />);
    expect(screen.getByText(/lapsevanema kontoga/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Saada kutse/ }));
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
    fireEvent.click(screen.getByRole('button', { name: /Saada kutse/ }));
    fireEvent.change(screen.getByLabelText('Õpilase e-post'), { target: { value: 'taken@example.ee' } });
    fireEvent.click(screen.getByRole('button', { name: /^Saada$/ }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Sellel e-postil on juba konto.');
  });
});
