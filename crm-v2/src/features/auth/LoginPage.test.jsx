import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthContext } from '../../app/AuthContext.jsx';
import LoginPage from './LoginPage.jsx';
import { modeFromLocation } from './loginMode.js';

function renderLogin(authValue, { entry = '/login', initialMode } = {}) {
  const value = { configured: true, user: null, signIn: vi.fn(), signInWithGoogle: vi.fn(), register: vi.fn(), resetPasswordFor: vi.fn(), ...authValue };
  render(
    <AuthContext.Provider value={value}>
      <MemoryRouter initialEntries={[entry]}><LoginPage initialMode={initialMode} /></MemoryRouter>
    </AuthContext.Provider>,
  );
  return value;
}

describe('login page', () => {
  it('uses the existing Firebase Google provider', async () => {
    const signInWithGoogle = vi.fn().mockRejectedValue({ code: 'auth/popup-closed-by-user' });
    renderLogin({ signInWithGoogle });

    fireEvent.click(screen.getByRole('button', { name: 'Jätka Google’iga' }));

    await waitFor(() => expect(signInWithGoogle).toHaveBeenCalledWith(null));
    expect(await screen.findByRole('alert')).toHaveTextContent('Google’i sisselogimisaken suleti.');
  });

  it('opens registration from old links', () => {
    expect(modeFromLocation({ hash: '#registreeru', search: '' })).toBe('register');
    expect(modeFromLocation({ hash: '', search: '?mode=register' })).toBe('register');
    expect(modeFromLocation({ hash: '', search: '' })).toBe('login');
    expect(modeFromLocation({ hash: '', search: '' }, 'register')).toBe('register');
  });

  it('registers a parent after the terms are accepted', async () => {
    const auth = renderLogin({ register: vi.fn().mockResolvedValue({}) }, { initialMode: 'register' });
    fireEvent.change(screen.getByLabelText('Täisnimi'), { target: { value: 'Mari Maasikas' } });
    fireEvent.change(screen.getByLabelText('E-post'), { target: { value: 'mari@example.ee' } });
    fireEvent.change(screen.getByLabelText('Parool'), { target: { value: 'salasona1' } });
    fireEvent.change(screen.getByLabelText('Korda parooli'), { target: { value: 'salasona1' } });
    fireEvent.change(screen.getByLabelText('Lapse nimi (mitu last komaga)'), { target: { value: 'Kati' } });

    fireEvent.click(screen.getByRole('button', { name: 'Loo konto' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('nõustu kasutustingimustega');
    expect(auth.register).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('checkbox'));
    fireEvent.click(screen.getByRole('button', { name: 'Loo konto' }));
    await waitFor(() => expect(auth.register).toHaveBeenCalledWith(expect.objectContaining({
      role: 'parent', displayName: 'Mari Maasikas', email: 'mari@example.ee', childName: 'Kati', preferredTeacher: 'Pavel', acceptedTerms: true,
    })));
  });

  it('switches a new Google account to registration instead of a dead end', async () => {
    const signInWithGoogle = vi.fn().mockRejectedValue({ code: 'auth/profile-missing', message: 'Vali roll ja nõustu tingimustega.' });
    renderLogin({ signInWithGoogle });
    fireEvent.click(screen.getByRole('button', { name: 'Jätka Google’iga' }));
    expect(await screen.findByRole('status')).toHaveTextContent('Vali roll');
    expect(screen.getByRole('heading', { name: 'Loo konto' })).toBeInTheDocument();
  });

  it('sends a password reset link', async () => {
    const auth = renderLogin({ resetPasswordFor: vi.fn().mockResolvedValue('mari@example.ee') });
    fireEvent.click(screen.getByRole('button', { name: 'Unustasid parooli?' }));
    fireEvent.change(screen.getByLabelText('E-post'), { target: { value: 'mari@example.ee' } });
    fireEvent.click(screen.getByRole('button', { name: 'Saada taastamislink' }));
    await waitFor(() => expect(auth.resetPasswordFor).toHaveBeenCalledWith('mari@example.ee'));
    expect(await screen.findByRole('status')).toHaveTextContent('mari@example.ee');
  });
});
