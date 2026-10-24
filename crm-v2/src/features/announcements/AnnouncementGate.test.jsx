import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { vi } from 'vitest';
import { AuthContext } from '../../app/AuthContext.jsx';
import AppShell from '../../components/layout/AppShell.jsx';
import AnnouncementGate from './AnnouncementGate.jsx';
import { isLearnerAccount } from './announcementModel.js';

const student = { uid: 'stu1', displayName: 'Mari', roles: ['student'] };
const parent = { uid: 'par1', displayName: 'Ema', roles: ['parent'] };
const item = (id, title, extra = {}, target = { key: 'u_stu1', kind: 'student', studentId: 's1', studentName: 'Mari' }) => ({
  announcement: { id, title, body: 'Tere!\nLoe: https://epkoolitus.ee/info', responseType: 'read', question: { mode: 'text', options: [], allowOther: false }, allowChange: false, activeFrom: '2026-10-20', activeTo: '', ...extra },
  target, response: null,
});
const serviceWith = (pending) => ({ mine: vi.fn().mockResolvedValue({ pending, past: [] }), respond: vi.fn().mockResolvedValue({ ok: true }) });
const app = <p>Rakendus avatud</p>;

describe('„Teated” gate', () => {
  it('only students and parents are gated', () => {
    expect(isLearnerAccount(['student'])).toBe(true);
    expect(isLearnerAccount(['parent'])).toBe(true);
    expect(isLearnerAccount(['admin'])).toBe(false);
    expect(isLearnerAccount(['teacher', 'parent'])).toBe(false);
    expect(isLearnerAccount(['finance'])).toBe(false);
  });

  it('staff pass straight through without asking the server', () => {
    const service = serviceWith([item('a1', 'Teade')]);
    render(<AnnouncementGate enabled={false} user={student} service={service}>{app}</AnnouncementGate>);
    expect(screen.getByText('Rakendus avatud')).toBeInTheDocument();
    expect(service.mine).not.toHaveBeenCalled();
  });

  it('blocks the app until every announcement is answered, one after another in the server order', async () => {
    const service = serviceWith([
      item('a1', 'Uus õppeaasta'),
      item('a2', 'Kas tuled laagrisse?', { responseType: 'question', question: { mode: 'single', options: ['Jah', 'Ei'], allowOther: true } }),
    ]);
    render(<AnnouncementGate enabled user={student} service={service}>{app}</AnnouncementGate>);
    expect(await screen.findByRole('heading', { name: 'Uus õppeaasta' })).toBeInTheDocument();
    expect(screen.queryByText('Rakendus avatud')).toBeNull();
    expect(screen.getByLabelText('Teade 1 / 2')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'https://epkoolitus.ee/info' })).toHaveAttribute('rel', 'noopener noreferrer');

    await act(async () => { fireEvent.click(screen.getByRole('button', { name: /Sain aru/ })); });
    expect(service.respond).toHaveBeenCalledWith({ announcementId: 'a1', targetKey: 'u_stu1', answer: {} });
    expect(await screen.findByRole('heading', { name: 'Kas tuled laagrisse?' })).toBeInTheDocument();
    expect(screen.getByLabelText('Teade 2 / 2')).toBeInTheDocument();
    expect(screen.queryByText('Rakendus avatud')).toBeNull();

    const send = screen.getByRole('button', { name: /Saada vastus/ });
    expect(send).toBeDisabled();
    fireEvent.click(screen.getByLabelText('Jah'));
    fireEvent.change(screen.getByLabelText(/Muu/), { target: { value: 'Võib-olla' } });
    expect(screen.getByLabelText('Jah')).not.toBeChecked();
    await act(async () => { fireEvent.click(send); });
    expect(service.respond).toHaveBeenLastCalledWith({ announcementId: 'a2', targetKey: 'u_stu1', answer: { choices: [], other: 'Võib-olla' } });
    expect(await screen.findByText('Rakendus avatud')).toBeInTheDocument();
  });

  it('a failed answer keeps the gate and shows why', async () => {
    const service = { ...serviceWith([item('a1', 'Teade', { responseType: 'question', question: { mode: 'text', options: [], allowOther: false } })]), respond: vi.fn().mockRejectedValue(new Error('Vastus on juba saadetud.')) };
    render(<AnnouncementGate enabled user={student} service={service}>{app}</AnnouncementGate>);
    fireEvent.change(await screen.findByLabelText(/Sinu vastus/), { target: { value: 'Jah' } });
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: /Saada vastus/ })); });
    expect(screen.getByRole('alert')).toHaveTextContent('Vastus on juba saadetud.');
    expect(screen.queryByText('Rakendus avatud')).toBeNull();
  });

  it('a parent confirms the suitable times for each child separately', async () => {
    const service = serviceWith([
      item('t1', 'Märgi sobivad ajad', { responseType: 'availability' }, { key: 'c_s1', kind: 'parent', studentId: 's1', studentName: 'Mari' }),
      item('t1', 'Märgi sobivad ajad', { responseType: 'availability' }, { key: 'c_s2', kind: 'parent', studentId: 's2', studentName: 'Jüri' }),
    ]);
    const saved = { slots: ['Mon-17:00', 'Mon-17:30'], preferred: [], message: 'pärast trenni' };
    const availability = { get: vi.fn((id) => Promise.resolve(id === 's1' ? saved : null)), save: vi.fn().mockResolvedValue({}) };
    render(<AnnouncementGate enabled user={parent} service={service} availabilityService={availability}>{app}</AnnouncementGate>);
    expect(await screen.findByText('Mari')).toBeInTheDocument();
    expect(await screen.findByText(/Varem märgitud ajad/)).toBeInTheDocument();
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: /Kinnita ajad/ })); });
    expect(availability.save).toHaveBeenCalledWith('s1', { slots: ['Mon-17:00', 'Mon-17:30'], preferred: [], message: 'pärast trenni' }, parent, saved);
    expect(service.respond).toHaveBeenCalledWith({ announcementId: 't1', targetKey: 'c_s1', answer: {} });

    expect(await screen.findByText('Jüri')).toBeInTheDocument();
    const confirm = await screen.findByRole('button', { name: /Kinnita ajad/ });
    expect(confirm).toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: 'Tööpäeva õhtud 17–21' }));
    await act(async () => { fireEvent.click(confirm); });
    expect(availability.save.mock.calls[1][0]).toBe('s2');
    expect(availability.save.mock.calls[1][1].slots).toContain('Fri-20:30');
    expect(service.respond).toHaveBeenLastCalledWith({ announcementId: 't1', targetKey: 'c_s2', answer: {} });
    expect(await screen.findByText('Rakendus avatud')).toBeInTheDocument();
  });

  it('logging out stays possible', async () => {
    const signOut = vi.fn();
    render(<AnnouncementGate enabled user={student} service={serviceWith([item('a1', 'Teade')])} onSignOut={signOut}>{app}</AnnouncementGate>);
    fireEvent.click(await screen.findByRole('button', { name: /Logi välja/ }));
    expect(signOut).toHaveBeenCalled();
  });

  it('opens the app when the server cannot be reached', async () => {
    const service = { mine: vi.fn().mockRejectedValue(new Error('404')), respond: vi.fn() };
    render(<AnnouncementGate enabled user={student} service={service}>{app}</AnnouncementGate>);
    expect(await screen.findByText('Rakendus avatud')).toBeInTheDocument();
  });

  it('the shell gates a student but not an administrator or the admin preview', async () => {
    const service = serviceWith([item('a1', 'Uus õppeaasta')]);
    const shell = (auth) => render(
      <AuthContext.Provider value={auth}>
        <MemoryRouter initialEntries={['/']}><Routes><Route path="*" element={<AppShell announcements={service} approvals={{}} messages={{}} />}><Route path="*" element={app} /></Route></Routes></MemoryRouter>
      </AuthContext.Provider>,
    );
    const view = shell({ user: student, signOut: vi.fn() });
    expect(await screen.findByRole('heading', { name: 'Uus õppeaasta' })).toBeInTheDocument();
    expect(screen.queryByText('Rakendus avatud')).toBeNull();
    view.unmount();
    shell({ user: { ...student, roles: ['admin'] }, signOut: vi.fn() });
    expect(screen.getByText('Rakendus avatud')).toBeInTheDocument();
  });

  it('the administrator looking as a student is not stopped', async () => {
    const service = serviceWith([item('a1', 'Uus õppeaasta')]);
    render(
      <AuthContext.Provider value={{ user: student, signOut: vi.fn(), preview: { readOnly: true }, stopPreview: vi.fn() }}>
        <MemoryRouter initialEntries={['/']}><Routes><Route path="*" element={<AppShell announcements={service} approvals={{}} messages={{}} />}><Route path="*" element={app} /></Route></Routes></MemoryRouter>
      </AuthContext.Provider>,
    );
    await waitFor(() => expect(screen.getByText('Rakendus avatud')).toBeInTheDocument());
    expect(service.mine).not.toHaveBeenCalled();
  });
});
