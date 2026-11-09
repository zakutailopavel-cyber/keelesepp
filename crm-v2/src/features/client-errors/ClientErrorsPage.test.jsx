import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import ClientErrorsPage from './ClientErrorsPage.jsx';
import ClientErrorsDigest from './ClientErrorsDigest.jsx';
import { filterGroups, groupErrors, newInLastDay } from './clientErrorsModel.js';

const NOW = Date.UTC(2026, 10, 4, 12);
const H = 60 * 60 * 1000;
const rec = (id, extra = {}) => ({
  id, message: 'TypeError: x is undefined', kind: 'error', route: '/students', build: 'abc1234', role: 'teacher', uid: 'u1',
  browser: 'Chrome 130 · macOS', frame: '/assets/a.js:1:2', count: 1, fingerprint: 'aaaaaaaaaaaaaaaa', status: 'new', firstAt: NOW - 3 * H, lastAt: NOW - 2 * H, ...extra,
});

const records = [
  rec('1', { count: 3 }),
  rec('2', { uid: 'u2', role: 'student', browser: 'Safari 17 · iPhone', route: '/student', lastAt: NOW - H }),
  rec('3', { fingerprint: 'bbbbbbbbbbbbbbbb', message: 'Missing or insufficient permissions (update students/{id})', kind: 'permission', status: 'ack', lastAt: NOW - 30 * H }),
  rec('4', { fingerprint: 'cccccccccccccccc', message: 'Old crash', kind: 'render', status: 'fixed', lastAt: NOW - 5 * 24 * H }),
  rec('5', { fingerprint: 'dddddddddddddddd', message: 'Came back', status: 'fixed', lastAt: NOW - 3 * 24 * H }),
  rec('6', { fingerprint: 'dddddddddddddddd', message: 'Came back', status: 'new', lastAt: NOW - 3 * H }),
];

describe('grouping', () => {
  it('groups by fingerprint: count, users, routes, browsers, last seen', () => {
    const groups = groupErrors(records);
    const first = groups.find((group) => group.fingerprint === 'aaaaaaaaaaaaaaaa');
    expect(first).toMatchObject({ count: 4, users: 2, status: 'new', lastAt: NOW - H, roles: ['student', 'teacher'] });
    expect(first.routes).toEqual(['/students', '/student']);
    expect(first.browsers).toEqual(['Chrome 130 · macOS', 'Safari 17 · iPhone']);
    expect(groups.map((group) => group.fingerprint)).toEqual(['aaaaaaaaaaaaaaaa', 'dddddddddddddddd', 'bbbbbbbbbbbbbbbb', 'cccccccccccccccc']);
  });

  it('status: fixed + newer record = new again („Tuli tagasi”); ack stays ack with new records', () => {
    const groups = groupErrors([...records, rec('7', { fingerprint: 'bbbbbbbbbbbbbbbb', status: 'new', lastAt: NOW })]);
    expect(groups.find((group) => group.fingerprint === 'dddddddddddddddd')).toMatchObject({ status: 'new', cameBack: true });
    expect(groups.find((group) => group.fingerprint === 'bbbbbbbbbbbbbbbb').status).toBe('ack');
    expect(filterGroups(groups, 'fixed').map((group) => group.fingerprint)).toEqual(['cccccccccccccccc']);
  });

  it('dashboard digest: new groups with a record in the last 24 h', () => {
    expect(newInLastDay(groupErrors(records), NOW).map((group) => group.fingerprint)).toEqual(['aaaaaaaaaaaaaaaa', 'dddddddddddddddd']);
  });
});

function service(list = records) {
  return { listRecent: vi.fn().mockResolvedValue(list), setStatus: vi.fn().mockResolvedValue(undefined) };
}

describe('„Vead” page', () => {
  it('lists new groups first with count, people, route and browser; filters by status', async () => {
    render(<MemoryRouter><ClientErrorsPage service={service()} now={() => NOW} /></MemoryRouter>);
    expect(await screen.findByRole('tab', { name: 'Uued (2)' })).toHaveAttribute('aria-selected', 'true');
    const rows = screen.getAllByRole('listitem');
    expect(rows).toHaveLength(2);
    expect(within(rows[0]).getByText('TypeError: x is undefined')).toBeInTheDocument();
    expect(within(rows[0]).getByText('4')).toBeInTheDocument();
    expect(within(rows[0]).getByText('2')).toBeInTheDocument();
    expect(within(rows[0]).getByText('/students, /student')).toBeInTheDocument();
    expect(within(rows[0]).getByText(/Safari 17 · iPhone/)).toBeInTheDocument();
    expect(within(rows[0]).getByText('viimati 1 h tagasi')).toBeInTheDocument();
    expect(within(rows[1]).getByText('Tuli tagasi')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('tab', { name: 'Teada (1)' }));
    expect(screen.getAllByRole('listitem')).toHaveLength(1);
    expect(screen.getByText('Missing or insufficient permissions (update students/{id})')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('tab', { name: 'Parandatud (1)' }));
    expect(screen.getByText('Old crash')).toBeInTheDocument();
  });

  it('„Teada” / „Parandatud” mark every record of the group and reload', async () => {
    const repo = service();
    render(<MemoryRouter><ClientErrorsPage service={repo} now={() => NOW} /></MemoryRouter>);
    const row = (await screen.findAllByRole('listitem'))[0];
    fireEvent.click(within(row).getByRole('button', { name: 'Parandatud' }));
    await waitFor(() => expect(repo.setStatus).toHaveBeenCalledWith(['1', '2'], 'fixed'));
    await waitFor(() => expect(repo.listRecent).toHaveBeenCalledTimes(2));
    fireEvent.click(within((await screen.findAllByRole('listitem'))[1]).getByRole('button', { name: 'Teada' }));
    await waitFor(() => expect(repo.setStatus).toHaveBeenCalledWith(['5', '6'], 'ack'));
  });

  it('empty and failing states', async () => {
    const { unmount } = render(<MemoryRouter><ClientErrorsPage service={service([])} now={() => NOW} /></MemoryRouter>);
    expect(await screen.findByText('Uusi vigu pole')).toBeInTheDocument();
    unmount();
    render(<MemoryRouter><ClientErrorsPage service={{ listRecent: vi.fn().mockRejectedValue(new Error('Sul puudub ligipääs')) }} now={() => NOW} /></MemoryRouter>);
    expect(await screen.findByText('Sul puudub ligipääs')).toBeInTheDocument();
  });
});

describe('dashboard digest', () => {
  it('shows the count of new errors in 24 h with the latest messages and a link', async () => {
    render(<MemoryRouter><ClientErrorsDigest service={service()} now={() => NOW} /></MemoryRouter>);
    expect(await screen.findByText('2 uut viga saidil (24 h)')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Ava vead' })).toHaveAttribute('href', '/vead');
    expect(screen.getByText(/TypeError: x is undefined · 4× · 2 inimest/)).toBeInTheDocument();
  });

  it('renders nothing without new errors or when the read fails', async () => {
    const quiet = service([records[2], records[3]]);
    const { container, unmount } = render(<MemoryRouter><ClientErrorsDigest service={quiet} now={() => NOW} /></MemoryRouter>);
    await waitFor(() => expect(quiet.listRecent).toHaveBeenCalled());
    expect(container).toBeEmptyDOMElement();
    unmount();
    const failing = { listRecent: vi.fn().mockRejectedValue(new Error('denied')) };
    const second = render(<MemoryRouter><ClientErrorsDigest service={failing} now={() => NOW} /></MemoryRouter>);
    await waitFor(() => expect(failing.listRecent).toHaveBeenCalled());
    expect(second.container).toBeEmptyDOMElement();
  });
});
