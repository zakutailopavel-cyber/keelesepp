import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { AuthContext } from '../../app/AuthContext.jsx';
import AppShell from './AppShell.jsx';

function LocationProbe() {
  const location = useLocation();
  return <div data-testid="location">{location.pathname}{location.search}</div>;
}

describe('application shell', () => {
  it('shows the global student search to an administrator', () => {
    const auth = { user: { displayName: 'Admin', roles: ['admin'] }, signOut: vi.fn() };
    render(
      <AuthContext.Provider value={auth}>
        <MemoryRouter initialEntries={['/']}>
          <Routes>
            <Route path="*" element={<AppShell />}><Route path="*" element={<LocationProbe />} /></Route>
          </Routes>
        </MemoryRouter>
      </AuthContext.Provider>,
    );
    expect(screen.getByLabelText('Otsi õpilast')).toBeInTheDocument();
  });

  it('shows the number of registrations waiting for approval on „Uued kontod”', () => {
    const auth = { user: { uid: 'a1', displayName: 'Admin', roles: ['admin'] }, signOut: vi.fn() };
    const approvals = { subscribePendingCount: vi.fn((onCount) => { onCount(2); return () => {}; }) };
    const messages = { subscribeUnreadCount: vi.fn((who, onCount) => { onCount(5); return () => {}; }) };
    render(
      <AuthContext.Provider value={auth}>
        <MemoryRouter initialEntries={['/']}>
          <Routes>
            <Route path="*" element={<AppShell approvals={approvals} messages={messages} />}><Route path="*" element={<LocationProbe />} /></Route>
          </Routes>
        </MemoryRouter>
      </AuthContext.Provider>,
    );
    expect(screen.getByLabelText('2 ootel')).toHaveTextContent('2');
    expect(screen.getByLabelText('5 lugemata')).toHaveTextContent('5');
    expect(messages.subscribeUnreadCount.mock.calls[0][0]).toMatchObject({ uid: 'a1', all: true });
  });
});
