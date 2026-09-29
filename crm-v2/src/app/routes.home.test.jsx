import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { AuthContext } from './AuthContext.jsx';
import { vi } from 'vitest';
import AppRoutes from './routes.jsx';

// only the routing is under test: pages and shell parts that talk to Firebase are stubbed
vi.mock('../components/layout/LessonInvitationOverlay.jsx', () => ({ default: () => null }));
vi.mock('../features/pet/PetCompanion.jsx', () => ({ default: () => null }));
vi.mock('../features/students/StudentDashboardPage.jsx', () => ({ default: () => <h1>Minu õpingud</h1> }));
vi.mock('../features/parents/ParentDashboardPage.jsx', () => ({ default: () => <h1>Minu pere</h1> }));

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
