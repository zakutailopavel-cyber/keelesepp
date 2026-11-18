import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

const auth = { user: { email: 'teine@example.com' }, signOut: vi.fn(() => Promise.resolve()) };
vi.mock('../../app/AuthContext.jsx', () => ({ useAuth: () => auth }));

import ForbiddenPage from './ForbiddenPage.jsx';

describe('ForbiddenPage', () => {
  it('shows the signed-in e-mail and lets the user sign out to switch accounts', async () => {
    render(
      <MemoryRouter initialEntries={['/kassa']}>
        <Routes>
          <Route path="/kassa" element={<ForbiddenPage />} />
          <Route path="/login" element={<p>Sisselogimine</p>} />
        </Routes>
      </MemoryRouter>,
    );
    expect(screen.getByText(/teine@example\.com/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Logi välja ja vaheta kontot' }));
    await waitFor(() => expect(screen.getByText('Sisselogimine')).toBeInTheDocument());
    expect(auth.signOut).toHaveBeenCalled();
  });
});
