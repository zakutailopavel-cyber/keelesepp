import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { AuthContext } from '../../app/AuthContext.jsx';
import ParentsPage from './ParentsPage.jsx';

const parents = [
  { id: 'p-new', role: 'parent', displayName: 'Olena Polishchuk', email: 'olena@new.ee', approvalStatus: 'approved', lastSeenAt: '2026-11-02T10:00:00.000Z', parentContactStatus: 'active' },
  { id: 'p-old', role: 'parent', displayName: 'olena  polishchuk', email: 'olena@old.ee', approvalStatus: 'approved', parentContactStatus: 'new' },
  { id: 'p-wait', role: 'parent', displayName: 'Uus Vanem', email: 'uus@example.ee', approvalStatus: 'pending', parentContactStatus: 'new' },
];
const students = [
  { id: 's1', name: 'Anna', linkedParentIds: ['p-new'], level: 'B1', subject: 'Eesti keel', teacher: 'Õpetaja', active: true },
];
const authInfo = {
  'p-new': { uid: 'p-new', found: true, email: 'olena@new.ee', methods: ['password', 'google'], emailVerified: true, disabled: false, lastSignInAt: '2026-11-03T08:00:00.000Z' },
  'p-old': { uid: 'p-old', found: true, email: 'olena@old.ee', methods: [], emailVerified: false, disabled: false, lastSignInAt: '' },
  'p-wait': { uid: 'p-wait', found: true, email: 'uus@example.ee', methods: ['google'], emailVerified: true, disabled: false, lastSignInAt: '2026-11-04T07:00:00.000Z' },
};

function setup() {
  return {
    repository: { list: vi.fn().mockResolvedValue(parents) },
    studentRepository: { list: vi.fn().mockResolvedValue({ items: students }) },
    invoiceRepository: { list: vi.fn().mockResolvedValue([]) },
    teacherRepository: { list: vi.fn().mockResolvedValue([]) },
    accountApi: {
      authInfo: vi.fn(async (uids) => uids.map((uid) => authInfo[uid] || { uid, found: false })),
      sendParentPasswordLink: vi.fn().mockResolvedValue({ uid: 'p-new', email: 'olena@new.ee', mailed: true, link: 'https://reset.example/x' }),
      decide: vi.fn().mockResolvedValue({ uid: 'p-wait', approvalStatus: 'approved', mailed: true }),
    },
  };
}

function renderPage(data, { roles = ['admin'], url = '/parents?parent=p-new' } = {}) {
  render(<MemoryRouter initialEntries={[url]}><AuthContext.Provider value={{ user: { uid: 'a', roles } }}><ParentsPage {...data} /></AuthContext.Provider></MemoryRouter>);
}

describe('ParentAccountCard (Lapsevanemad → Konto)', () => {
  it('shows the sign-in facts, the children and the other account with the same name; sends the password link', async () => {
    const data = setup();
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(globalThis.navigator, 'clipboard', { value: { writeText }, configurable: true });
    renderPage(data);
    const block = await screen.findByRole('region', { name: 'Konto' });
    await within(block).findByText('parool ja Google');
    expect(data.accountApi.authInfo).toHaveBeenCalledWith(['p-new', 'p-old']);
    expect(within(block).getByText('kinnitatud')).toBeInTheDocument();
    expect(within(block).getByText('E-post kinnitatud').nextSibling).toHaveTextContent('jah');
    expect(within(block).getByText('Viimati sisse loginud').nextSibling).toHaveTextContent('3.11.2026');
    expect(within(block).getByText('Viimati CRM-is').nextSibling).toHaveTextContent('2.11.2026');
    expect(within(block).getByRole('link', { name: 'Anna' })).toHaveAttribute('href', '/students/s1');
    expect(within(block).getByText('Sama nimega kontod')).toBeInTheDocument();
    expect(within(block).getByText('olena@new.ee (see konto)')).toBeInTheDocument();
    expect(within(block).getByText('olena@old.ee')).toBeInTheDocument();
    expect(within(block).getByText(/parooli pole veel määratud · viimati sisse loginud pole teada/)).toBeInTheDocument();
    expect(within(block).getByRole('link', { name: 'Ava' })).toHaveAttribute('href', '/parents?parent=p-old');
    expect(within(block).queryByRole('button', { name: /Kinnita/ })).toBeNull();

    fireEvent.click(within(block).getByRole('button', { name: /Saada parooli link/ }));
    await within(block).findByText(/Parooli link: olena@new.ee\. Kiri on saadetud\./);
    expect(data.accountApi.sendParentPasswordLink).toHaveBeenCalledWith({ parentUid: 'p-new' });
    fireEvent.click(within(block).getByRole('button', { name: /Kopeeri link/ }));
    await waitFor(() => expect(writeText).toHaveBeenCalledWith('https://reset.example/x'));
    expect(await within(block).findByRole('button', { name: /Kopeeritud/ })).toBeInTheDocument();
  });

  it('a pending parent: „Kinnita” approves through the approval route, and Uued kontod is linked', async () => {
    const data = setup();
    renderPage(data, { url: '/parents?parent=p-wait' });
    const block = await screen.findByRole('region', { name: 'Konto' });
    expect(within(block).getByText('ootab kinnitust')).toBeInTheDocument();
    expect(within(block).getByRole('link', { name: 'Kontod → Uued kontod' })).toHaveAttribute('href', '/accounts');
    fireEvent.click(within(block).getByRole('button', { name: /Kinnita/ }));
    await waitFor(() => expect(data.accountApi.decide).toHaveBeenCalledWith({ uid: 'p-wait', decision: 'approve' }));
    expect(await screen.findByText(/Uus Vanem: Konto kinnitatud\. Lapsevanemale saadeti e-kiri\./)).toBeInTheDocument();
  });

  it('in the list the block opens with „Konto” and loads only then; a teacher never sees it', async () => {
    const data = setup();
    renderPage(data, { url: '/parents' });
    await screen.findByText('Uus Vanem');
    expect(screen.queryByRole('region', { name: 'Konto' })).toBeNull();
    expect(data.accountApi.authInfo).not.toHaveBeenCalled();
    fireEvent.click(screen.getAllByRole('button', { name: /^Konto$/ })[0]);
    expect(await screen.findByRole('region', { name: 'Konto' })).toBeInTheDocument();
    expect(data.accountApi.authInfo).toHaveBeenCalledTimes(1);
  });

  it('a teacher sees no account block and no account data is read', async () => {
    const data = setup();
    renderPage(data, { roles: ['teacher'], url: '/parents?parent=p-new' });
    await screen.findByText('Olena Polishchuk');
    expect(screen.queryByRole('region', { name: 'Konto' })).toBeNull();
    expect(screen.queryByRole('button', { name: /^Konto$/ })).toBeNull();
    expect(data.accountApi.authInfo).not.toHaveBeenCalled();
  });
});
