import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AuthContext } from './AuthContext.jsx';
import ProtectedRoute from './ProtectedRoute.jsx';

function renderRoute(user) {
  return render(
    <AuthContext.Provider value={{ configured: true, loading: false, user, error: null }}>
      <MemoryRouter initialEntries={['/private']}>
        <Routes>
          <Route element={<ProtectedRoute roles={['admin']} />}><Route path="/private" element={<p>Salajane vaade</p>} /></Route>
          <Route path="/forbidden" element={<p>Ligipääs puudub</p>} />
          <Route path="/login" element={<p>Logi sisse</p>} />
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>,
  );
}

describe('protected routes', () => {
  it('allows a matching role', () => {
    renderRoute({ roles: ['admin'] });
    expect(screen.getByText('Salajane vaade')).toBeInTheDocument();
  });

  it('redirects a user without permission', () => {
    renderRoute({ roles: ['student'] });
    expect(screen.getByText('Ligipääs puudub')).toBeInTheDocument();
  });

  it('redirects an anonymous user to login', () => {
    renderRoute(null);
    expect(screen.getByText('Logi sisse')).toBeInTheDocument();
  });

  it('shows the waiting screen instead of the app while the account is not approved', () => {
    renderRoute({ roles: ['parent'], approvalStatus: 'pending', displayName: 'Mari', email: 'mari@example.ee' });
    expect(screen.getByRole('heading', { name: 'Konto ootab kinnitamist' })).toBeInTheDocument();
    expect(screen.queryByText('Salajane vaade')).not.toBeInTheDocument();
    expect(screen.queryByText('Ligipääs puudub')).not.toBeInTheDocument();
  });

  it('tells a rejected account whom to contact', () => {
    renderRoute({ roles: ['admin'], approvalStatus: 'rejected' });
    expect(screen.getByRole('heading', { name: 'Konto ei ole kinnitatud' })).toBeInTheDocument();
    expect(screen.queryByText('Salajane vaade')).not.toBeInTheDocument();
  });
});
