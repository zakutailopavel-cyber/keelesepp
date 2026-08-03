import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthContext } from '../../app/AuthContext.jsx';
import LoginPage from './LoginPage.jsx';

function renderLogin(authValue) {
  return render(
    <AuthContext.Provider value={{ configured: true, user: null, signIn: vi.fn(), signInWithGoogle: vi.fn(), ...authValue }}>
      <MemoryRouter initialEntries={['/login']}><LoginPage /></MemoryRouter>
    </AuthContext.Provider>,
  );
}

describe('login page', () => {
  it('uses the existing Firebase Google provider', async () => {
    const signInWithGoogle = vi.fn().mockRejectedValue({ code: 'auth/popup-closed-by-user' });
    renderLogin({ signInWithGoogle });

    fireEvent.click(screen.getByRole('button', { name: 'Jätka Google’iga' }));

    await waitFor(() => expect(signInWithGoogle).toHaveBeenCalledOnce());
    expect(await screen.findByRole('alert')).toHaveTextContent('Google’i sisselogimisaken suleti.');
  });
});
