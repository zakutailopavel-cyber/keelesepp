import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { AuthContext } from '../../app/AuthContext.jsx';
import AppShell from './AppShell.jsx';

function LocationProbe() {
  const location = useLocation();
  return <div data-testid="location">{location.pathname}{location.search}</div>;
}

describe('application shell', () => {
  it('turns the global search into a Students URL instead of a dead control', () => {
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
    fireEvent.change(screen.getByLabelText('Otsi õpilast'), { target: { value: 'Mari Maas' } });
    fireEvent.submit(screen.getByRole('search'));
    expect(screen.getByTestId('location')).toHaveTextContent('/students?search=Mari%20Maas');
  });
});
