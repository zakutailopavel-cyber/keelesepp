import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { AuthContext } from '../../app/AuthContext.jsx';
import SettingsPage from './SettingsPage.jsx';

describe('SettingsPage', () => {
  it('updates only the current profile fields and sends reset to the session email', async () => {
    const user = { uid: 'user-1', displayName: 'Mari', email: 'mari@example.com', roles: ['student'], profile: { phone: '555' } };
    const updateProfile = vi.fn().mockResolvedValue({ ...user, displayName: 'Mari Tamm', profile: { phone: '556' } });
    const sendPasswordReset = vi.fn().mockResolvedValue('mari@example.com');
    render(<AuthContext.Provider value={{ user, configured: true, updateProfile, sendPasswordReset }}><SettingsPage /></AuthContext.Provider>);

    fireEvent.change(screen.getByLabelText('Nimi'), { target: { value: ' Mari Tamm ' } });
    fireEvent.change(screen.getByLabelText('Telefon'), { target: { value: '556' } });
    fireEvent.click(screen.getByRole('button', { name: /Salvesta andmed/ }));
    await waitFor(() => expect(updateProfile).toHaveBeenCalledWith({ displayName: ' Mari Tamm ', phone: '556' }));
    expect(await screen.findByRole('status')).toHaveTextContent('salvestati');

    fireEvent.click(screen.getByRole('button', { name: 'Saada parooli taastamise link' }));
    await waitFor(() => expect(sendPasswordReset).toHaveBeenCalledOnce());
    expect(await screen.findByRole('status')).toHaveTextContent('mari@example.com');
  });
});
