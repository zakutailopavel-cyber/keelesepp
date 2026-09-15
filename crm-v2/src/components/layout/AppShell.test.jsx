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
});
