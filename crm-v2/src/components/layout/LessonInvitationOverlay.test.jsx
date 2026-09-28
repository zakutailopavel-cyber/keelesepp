import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { AuthContext } from '../../app/AuthContext.jsx';
import LessonInvitationOverlay from './LessonInvitationOverlay.jsx';

function LocationProbe() {
  const location = useLocation();
  return <div data-testid="location">{location.pathname}{location.search}</div>;
}

function renderOverlay(service, authOverrides = {}) {
  const auth = {
    user: { uid: 'student-uid', displayName: 'Mari', roles: ['student'] },
    ...authOverrides,
  };
  return render(<AuthContext.Provider value={auth}><MemoryRouter><LessonInvitationOverlay service={service} /><LocationProbe /></MemoryRouter></AuthContext.Provider>);
}

describe('lesson invitation overlay', () => {
  it('appears in the student cabinet and accepts the exact invitation', async () => {
    const service = {
      subscribeIncoming: vi.fn((uid, onChange) => { onChange([{ id: 'invite-1', teacherName: 'Pavel', title: 'Eesti keel', status: 'pending', expiresAt: new Date(Date.now() + 60_000).toISOString() }]); return vi.fn(); }),
      respond: vi.fn().mockResolvedValue(undefined),
    };
    renderOverlay(service);
    expect(screen.getByRole('dialog', { name: 'Pavel kutsub sind tundi' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Liitu tunniga' }));
    await waitFor(() => expect(service.respond).toHaveBeenCalledWith('invite-1', 'accepted', expect.objectContaining({ uid: 'student-uid' })));
    await waitFor(() => expect(screen.getByTestId('location')).toHaveTextContent('/live-classroom?invitation=invite-1'));
  });

  it('allows the student to decline without navigating', async () => {
    const service = {
      subscribeIncoming: vi.fn((uid, onChange) => { onChange([{ id: 'invite-2', teacherName: 'Jelena', title: 'Matemaatika', status: 'pending', expiresAt: new Date(Date.now() + 60_000).toISOString() }]); return vi.fn(); }),
      respond: vi.fn().mockResolvedValue(undefined),
    };
    renderOverlay(service);
    fireEvent.click(screen.getByRole('button', { name: 'Praegu ei saa' }));
    await waitFor(() => expect(service.respond).toHaveBeenCalledWith('invite-2', 'declined', expect.anything()));
    expect(screen.getByTestId('location')).toHaveTextContent('/');
  });

  it('hides actions completely in admin read-only preview', () => {
    const service = { subscribeIncoming: vi.fn() };
    renderOverlay(service, { preview: { readOnly: true } });
    expect(service.subscribeIncoming).not.toHaveBeenCalled();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('removes an expired invitation without waiting for another Firestore snapshot', () => {
    vi.useFakeTimers();
    const service = {
      subscribeIncoming: vi.fn((uid, onChange) => {
        onChange([{ id: 'invite-expiring', teacherName: 'Pavel', title: 'Eesti keel', status: 'pending', expiresAt: new Date(Date.now() + 500).toISOString() }]);
        return vi.fn();
      }),
    };
    renderOverlay(service);
    expect(screen.getByRole('dialog', { name: 'Pavel kutsub sind tundi' })).toBeInTheDocument();
    act(() => { vi.advanceTimersByTime(1100); });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    vi.useRealTimers();
  });
});
