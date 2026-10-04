import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
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

describe('AccountsPage: possible duplicates', () => {
  const review = {
    id: 'r1', uid: 'u-polina', displayName: 'Polina', email: 'polina@example.com', relationship: 'student', childName: '', approvalStatus: 'approved',
    reasonText: 'Sama e-postiga kaart on olemas, kuid konto e-post ei ole kinnitatud',
    candidates: [{ id: 'card-1', name: 'Polina Ivanova', email: 'polina@example.com', parentEmail: '' }],
  };

  it('shows the undecided registration and links it to the existing card', async () => {
    const svc = service({
      listReviews: vi.fn().mockResolvedValueOnce([review]).mockResolvedValue([]),
      linkToStudent: vi.fn().mockResolvedValue({}),
    });
    render(<AccountsPage service={svc} />);
    const item = await screen.findByRole('article', { name: 'Otsus: Polina' });
    expect(within(item).getByText(/e-post ei ole kinnitatud/)).toBeInTheDocument();
    fireEvent.click(within(item).getByRole('button', { name: /Seo selle kaardiga/ }));
    await waitFor(() => expect(svc.linkToStudent).toHaveBeenCalledWith({ uid: 'u-polina', studentId: 'card-1', relationship: 'student' }));
    expect(await screen.findByText('Polina on seotud kaardiga „Polina Ivanova”.')).toBeInTheDocument();
    expect(svc.listReviews).toHaveBeenCalledTimes(2);
  });

  it('creates a new card when the registration is a new person', async () => {
    const svc = service({ listReviews: vi.fn().mockResolvedValueOnce([review]).mockResolvedValue([]), createCardForReview: vi.fn().mockResolvedValue({ studentId: 'self_u-polina' }) });
    render(<AccountsPage service={svc} />);
    fireEvent.click(await screen.findByRole('button', { name: /Loo uus kaart/ }));
    await waitFor(() => expect(svc.createCardForReview).toHaveBeenCalledWith('r1'));
    expect(await screen.findByText('Polina: loodi uus õpilase kaart.')).toBeInTheDocument();
  });
});
