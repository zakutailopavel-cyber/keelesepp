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
  it('reports a committed approval with a lost response as a notice, not an error', async () => {
    const svc = service({ decide: vi.fn().mockResolvedValue({ approvalStatus: 'approved', mailed: false, responseLost: true }) });
    render(<AccountsPage service={svc} />);
    fireEvent.click(await screen.findByRole('button', { name: /Kinnita/ }));
    expect(await screen.findByRole('status')).toHaveTextContent('Konto kinnitati, kuid vastust ei saadud. E-kiri võis jääda saatmata.');
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    await waitFor(() => expect(svc.list).toHaveBeenCalledTimes(2));
    expect(screen.getByRole('status')).not.toHaveTextContent('automaatselt ei leitud');
  });

  it('does not claim an e-mail was sent while delivery is pending', async () => {
    render(<AccountsPage service={service({ decide: vi.fn().mockResolvedValue({ approvalStatus: 'approved', mailed: false, mailPending: true }) })} />);
    fireEvent.click(await screen.findByRole('button', { name: /Kinnita/ }));
    expect(await screen.findByRole('status')).toHaveTextContent('E-kirja saatmine ei ole veel kinnitatud.');
    expect(screen.getByRole('status')).not.toHaveTextContent('saadeti e-kiri');
  });

  it('keeps unresolved network failures as errors', async () => {
    render(<AccountsPage service={service({ decide: vi.fn().mockRejectedValue(new Error('Ühendus puudub')) })} />);
    fireEvent.click(await screen.findByRole('button', { name: /Kinnita/ }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Ühendus puudub');
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });
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
