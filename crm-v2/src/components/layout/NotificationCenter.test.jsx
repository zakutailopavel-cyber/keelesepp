import { act, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import NotificationCenter from './NotificationCenter.jsx';

const admin = { uid: 'bell-admin', roles: ['admin'] };
const task = { id: 't1', title: 'Helista', status: 'open', assigneeUid: 'bell-admin', due: '2026-01-01' };
const invoice = (id) => ({ id, status: 'Saadetud', due: '2020-01-01', amountCents: 1000, total: 10, balanceCents: 1000 });

function repositories(overrides = {}) {
  return {
    students: { list: vi.fn(async () => ({ items: [] })) },
    messages: { list: vi.fn(async () => []), listUnread: vi.fn(async () => []), listByStudentIds: vi.fn(async () => []) },
    homework: { listSubmissionsByStudentIds: vi.fn(async () => []) },
    invoices: { list: vi.fn(async () => [invoice('i1'), invoice('i2')]) },
    tasks: { subscribe: (onData) => { onData([task]); return () => {}; } },
    ...overrides,
  };
}

describe('NotificationCenter', () => {
  it('shows no count until the sources have come, so the bell does not jump from a small number to the real one', async () => {
    let finish;
    const repos = repositories({ students: { list: vi.fn(() => new Promise((resolve) => { finish = resolve; })) } });
    render(<MemoryRouter><NotificationCenter user={admin} repositories={repos} /></MemoryRouter>);
    expect(screen.getByRole('button', { name: /^Teavitused/ }).querySelector('.nc-count')).toBeNull();
    expect(screen.getByRole('button', { name: /^Teavitused/ }).querySelector('.nc-dot')).toBeNull();
    await act(async () => { finish({ items: [] }); });
    expect(await screen.findByRole('button', { name: /uut$/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /uut$/ }).querySelector('.nc-count')).not.toBeNull();
  });

  it('asks an administrator only for the unread messages', async () => {
    const repos = repositories();
    render(<MemoryRouter><NotificationCenter user={admin} repositories={repos} /></MemoryRouter>);
    await screen.findByRole('button', { name: /uut$/ });
    expect(repos.messages.listUnread).toHaveBeenCalledTimes(1);
    expect(repos.messages.list).not.toHaveBeenCalled();
  });

  it('a teacher sees own unmarked lessons as one line „N tundi märkimata (vanim DD.MM)” that opens the list', async () => {
    const teacher = { uid: 'bell-teacher', roles: ['teacher'] };
    const reminder = vi.fn(async () => ({ total: 3, oldest: '2026-10-20', oldestLabel: '20.10', stale: 2 }));
    render(<MemoryRouter><NotificationCenter user={teacher} repositories={repositories({ unmarked: { reminder } })} /></MemoryRouter>);
    fireEvent.click(await screen.findByRole('button', { name: /uut$/ }));
    expect(await screen.findByRole('button', { name: /3 tundi märkimata \(vanim 20\.10\)/ })).toBeInTheDocument();
    expect(reminder).toHaveBeenCalledWith({ user: teacher });
  });

  it('an administrator keeps the school-wide count on „Kalender”: no own reminder is read', async () => {
    const reminder = vi.fn(async () => ({ total: 3, oldestLabel: '20.10', stale: 2 }));
    render(<MemoryRouter><NotificationCenter user={admin} repositories={repositories({ unmarked: { reminder } })} /></MemoryRouter>);
    await screen.findByRole('button', { name: /uut$/ });
    expect(reminder).not.toHaveBeenCalled();
  });
});
