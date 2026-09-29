import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { AuthContext } from './AuthContext.jsx';
import AppRoutes from './routes.jsx';

function Where() { const l = useLocation(); return <output data-testid="path">{l.pathname}</output>; }

function renderAt(roles) {
  const user = { uid: 'u1', displayName: 'Mari', email: 'mari@example.com', roles };
  return render(
    <MemoryRouter initialEntries={['/']}>
      <AuthContext.Provider value={{ user, loading: false, configured: true }}>
        <AppRoutes /><Where />
      </AuthContext.Provider>
    </MemoryRouter>,
  );
}

describe('landing after sign-in', () => {
  it('sends a student from the start page to "Minu õpingud" instead of "Ligipääs puudub"', async () => {
    renderAt(['student']);
    await waitFor(() => expect(screen.getByTestId('path')).toHaveTextContent('/student'));
    expect(screen.queryByText('Ligipääs puudub')).toBeNull();
  });

  it('sends a parent to "Minu pere"', async () => {
    renderAt(['parent']);
    await waitFor(() => expect(screen.getByTestId('path')).toHaveTextContent('/parent'));
  });
});
