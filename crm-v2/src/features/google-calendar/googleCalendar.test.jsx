import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import GoogleCalendarCard from './GoogleCalendarCard.jsx';
import CalendarGoogleChip from './CalendarGoogleChip.jsx';
import { describeConnection, formatSyncTime, isGoogleOwned, lessonSyncState, shouldAutoSync, syncResultMessage } from './googleCalendarModel.js';

const user = { uid: 'teacher-1', displayName: 'Pavel', roles: ['teacher'] };
const now = new Date('2026-10-01T12:00:00Z');
const connected = { connected: true, writeEnabled: true, requiresWriteConsent: false, syncGroups: true, lastSyncAt: '2026-10-01T11:50:00Z', lastSyncCount: 12, lastPushAt: '2026-10-01T11:50:00Z' };

function repository(status = connected, extra = {}) {
  return {
    status: vi.fn().mockResolvedValue(status),
    authUrl: vi.fn().mockResolvedValue('https://accounts.google.com/o/oauth2/auth?x=1'),
    sync: vi.fn().mockResolvedValue({ synced: 2, pushed: 1, pushFailed: 0 }),
    setSyncGroups: vi.fn().mockResolvedValue({ groupsPushed: 0, groupsRemoved: 3 }),
    disconnect: vi.fn().mockResolvedValue({ removed: 4, kept: 7 }),
    ...extra,
  };
}

describe('Google Calendar model', () => {
  it('describes the connection in one line', () => {
    expect(describeConnection(null).label).toBe('Ühendamata');
    expect(describeConnection(connected)).toMatchObject({ tone: 'success', label: 'Kahesuunaline' });
    expect(describeConnection({ ...connected, writeEnabled: false, requiresWriteConsent: true }).label).toBe('Ainult Google → KeeleSepp');
    expect(describeConnection({ ...connected, lastPushError: 'invalid_grant' })).toMatchObject({ tone: 'danger', error: 'invalid_grant' });
  });

  it('auto-syncs only when connected, error-free and older than 15 minutes', () => {
    expect(shouldAutoSync(connected, now)).toBe(false);
    expect(shouldAutoSync({ ...connected, lastSyncAt: '2026-10-01T11:40:00Z' }, now)).toBe(true);
    expect(shouldAutoSync({ ...connected, lastSyncAt: null }, now)).toBe(true);
    expect(shouldAutoSync({ ...connected, lastSyncAt: null, lastSyncError: 'x' }, now)).toBe(false);
    expect(shouldAutoSync({ connected: false }, now)).toBe(false);
  });

  it('formats times and results for people', () => {
    expect(formatSyncTime(null, now)).toBe('veel mitte');
    expect(formatSyncTime('2026-10-01T11:50:00Z', now)).toBe('10 min tagasi');
    expect(syncResultMessage({})).toBe('Kõik on juba ajakohane.');
    expect(syncResultMessage({ synced: 2, pushed: 1, groupsPushed: 2, pushFailed: 1 })).toBe("Google'ist uuendati 2 tundi, Google'isse saadeti 3 tundi. 1 tundi ei õnnestunud Google'isse saata.");
  });

  it('tells where a lesson stands with Google', () => {
    expect(lessonSyncState({ isGroup: true })).toBeNull();
    expect(lessonSyncState({ gcalSyncStatus: 'synced' }).label).toBe('Google Calendaris');
    expect(lessonSyncState({ gcalSyncStatus: 'error', gcalSyncError: 'Forbidden' })).toMatchObject({ tone: 'danger', hint: 'Forbidden' });
    expect(lessonSyncState({ source: 'gcal', gcalSyncStatus: 'synced' }).label).toBe('Algselt Google Calendarist');
    expect(lessonSyncState({})).toBeNull();
    expect(isGoogleOwned({ source: 'gcal' })).toBe(false);
    expect(isGoogleOwned({ source: 'keelesepp-crm-v2' })).toBe(false);
  });
});

describe('GoogleCalendarCard', () => {
  it('starts the Google consent and asks to come back to the settings page', async () => {
    const repo = repository({ connected: false });
    const assign = vi.fn();
    const original = window.location;
    Object.defineProperty(window, 'location', { configurable: true, value: { ...original, origin: 'https://crm.epkoolitus.ee', href: 'https://crm.epkoolitus.ee/settings', assign } });
    try {
      render(<GoogleCalendarCard user={user} repository={repo} />);
      fireEvent.click(await screen.findByRole('button', { name: /Ühenda Google Calendar/ }));
      await waitFor(() => expect(assign).toHaveBeenCalledWith('https://accounts.google.com/o/oauth2/auth?x=1'));
      expect(repo.authUrl).toHaveBeenCalledWith('teacher-1', 'https://crm.epkoolitus.ee/settings');
    } finally {
      Object.defineProperty(window, 'location', { configurable: true, value: original });
    }
  });

  it('shows the state, syncs now, switches group lessons off and disconnects after a confirmation', async () => {
    const repo = repository();
    render(<GoogleCalendarCard user={user} repository={repo} />);
    expect(await screen.findByText('Kahesuunaline')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Sünkrooni kohe/ }));
    expect(await screen.findByRole('status')).toHaveTextContent("Google'ist uuendati 2 tundi");
    expect(repo.sync).toHaveBeenCalledWith('teacher-1');

    fireEvent.click(screen.getByRole('checkbox', { name: /grupitunde/ }));
    await waitFor(() => expect(repo.setSyncGroups).toHaveBeenCalledWith('teacher-1', false));
    expect(await screen.findByRole('status')).toHaveTextContent('eemaldati Google Calendarist (3)');

    fireEvent.click(screen.getByRole('button', { name: /Katkesta ühendus/ }));
    expect(repo.disconnect).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: /Kinnita: katkesta ühendus/ }));
    await waitFor(() => expect(repo.disconnect).toHaveBeenCalledWith('teacher-1'));
    expect(await screen.findByRole('status')).toHaveTextContent('Tunnid jäid KeeleSeppa alles');
  });

  it('asks for write access when the connection is import-only', async () => {
    render(<GoogleCalendarCard user={user} repository={repository({ ...connected, writeEnabled: false, requiresWriteConsent: true })} />);
    expect(await screen.findByRole('button', { name: 'Luba kirjutamine' })).toBeInTheDocument();
    expect(screen.queryByRole('checkbox')).toBeNull();
  });

  it('shows the result of the Google consent once and removes it from the address', async () => {
    window.history.replaceState({}, '', '/settings?gcal=connected');
    render(<GoogleCalendarCard user={user} repository={repository()} />);
    expect(screen.getByRole('status')).toHaveTextContent('Google Calendar on ühendatud');
    expect(window.location.search).toBe('');
    window.history.replaceState({}, '', '/');
  });
});

describe('CalendarGoogleChip', () => {
  it('links to the settings when not connected', async () => {
    render(<MemoryRouter><CalendarGoogleChip user={user} repository={repository({ connected: false })} /></MemoryRouter>);
    expect(await screen.findByRole('link', { name: /Ühenda Google/ })).toHaveAttribute('href', '/settings#google-calendar');
  });

  it('syncs by itself when the last sync is old and reloads the calendar', async () => {
    const repo = repository({ ...connected, lastSyncAt: '2020-01-01T00:00:00Z' });
    const onSynced = vi.fn();
    render(<MemoryRouter><CalendarGoogleChip user={user} repository={repo} onSynced={onSynced} /></MemoryRouter>);
    await waitFor(() => expect(repo.sync).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(onSynced).toHaveBeenCalled());
  });

  it('does not sync by itself after a recent sync, but the button does', async () => {
    const repo = repository({ ...connected, lastSyncAt: new Date().toISOString() });
    const onSynced = vi.fn();
    render(<MemoryRouter><CalendarGoogleChip user={user} repository={repo} onSynced={onSynced} /></MemoryRouter>);
    fireEvent.click(await screen.findByRole('button', { name: 'Sünkrooni Google Calendariga' }));
    await waitFor(() => expect(repo.sync).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(onSynced).toHaveBeenCalled());
  });
});
