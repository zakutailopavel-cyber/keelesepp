import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import AccountsPage from './AccountsPage.jsx';

const pending = [{ id: 'u1', displayName: 'Mari Maasikas', email: 'mari@example.ee', role: 'parent', childName: 'Kati', preferredTeacher: 'Jelena', createdAt: '2026-09-29', approvalStatus: 'pending' }];

function service(overrides = {}) {
  return {
    list: vi.fn(async (status) => (status === 'pending' ? pending : [])),
    decide: vi.fn(async () => ({ approvalStatus: 'approved', linkedStudentIds: ['s1'], createdStudentIds: [], mailed: true })),
    ...overrides,
  };
}

describe('new accounts page', () => {
  it('lists waiting accounts with what they registered with', async () => {
    render(<AccountsPage service={service()} />);
    expect(await screen.findByText('Mari Maasikas')).toBeInTheDocument();
    expect(screen.getByText('mari@example.ee')).toBeInTheDocument();
    expect(screen.getByText('Kati')).toBeInTheDocument();
    expect(screen.getByText('Lapsevanem')).toBeInTheDocument();
  });

  it('approves through the server and reports the linked cards and e-mail', async () => {
    const svc = service();
    render(<AccountsPage service={svc} />);
    fireEvent.click(await screen.findByRole('button', { name: /Kinnita/ }));
    await waitFor(() => expect(svc.decide).toHaveBeenCalledWith({ uid: 'u1', decision: 'approve', reason: '' }));
    expect(await screen.findByRole('status')).toHaveTextContent('Seotud õpilase kaarte: 1');
    expect(screen.getByRole('status')).toHaveTextContent('e-kiri');
  });

  it('asks for an optional reason when rejecting and can be cancelled', async () => {
    const svc = service();
    const prompt = vi.spyOn(globalThis, 'prompt').mockReturnValueOnce(null).mockReturnValueOnce('vale e-post');
    render(<AccountsPage service={svc} />);
    fireEvent.click(await screen.findByRole('button', { name: /Keeldu/ }));
    expect(svc.decide).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: /Keeldu/ }));
    await waitFor(() => expect(svc.decide).toHaveBeenCalledWith({ uid: 'u1', decision: 'reject', reason: 'vale e-post' }));
    prompt.mockRestore();
  });

  it('shows the rejected tab', async () => {
    const svc = service();
    render(<AccountsPage service={svc} />);
    await screen.findByText('Mari Maasikas');
    fireEvent.click(screen.getByRole('tab', { name: 'Keeldutud' }));
    await waitFor(() => expect(svc.list).toHaveBeenCalledWith('rejected'));
    expect(await screen.findByText('Keeldutud kontosid pole')).toBeInTheDocument();
  });
});
