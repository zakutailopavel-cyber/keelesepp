import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthContext } from '../../app/AuthContext.jsx';
import SettingsPage from './SettingsPage.jsx';

describe('SettingsPage', () => {
  it('updates only the current profile fields and sends reset to the session email', async () => {
    const user = { uid: 'user-1', displayName: 'Mari', email: 'mari@example.com', roles: ['student'], profile: { phone: '555' } };
    const updateProfile = vi.fn().mockResolvedValue({ ...user, displayName: 'Mari Tamm', profile: { phone: '556' } });
    const sendPasswordReset = vi.fn().mockResolvedValue('mari@example.com');
    render(<MemoryRouter><AuthContext.Provider value={{ user, configured: true, updateProfile, sendPasswordReset }}><SettingsPage /></AuthContext.Provider></MemoryRouter>);
    expect(screen.queryByRole('tablist')).toBeNull();

    expect(screen.getByRole('region', { name: 'Konto kokkuvõte' })).toHaveTextContent('FirebaseÜhendatud');
    fireEvent.change(screen.getByLabelText('Nimi'), { target: { value: ' Mari Tamm ' } });
    fireEvent.change(screen.getByLabelText('Telefon'), { target: { value: '556' } });
    fireEvent.click(screen.getByRole('button', { name: /Salvesta andmed/ }));
    await waitFor(() => expect(updateProfile).toHaveBeenCalledWith({ displayName: ' Mari Tamm ', phone: '556' }));
    expect(await screen.findByRole('status')).toHaveTextContent('salvestati');

    fireEvent.click(screen.getByRole('button', { name: 'Saada parooli taastamise link' }));
    await waitFor(() => expect(sendPasswordReset).toHaveBeenCalledOnce());
    expect(await screen.findByRole('status')).toHaveTextContent('mari@example.com');
  });

  it('shows the Google Calendar card to staff only', async () => {
    const teacher = { uid: 'teacher-1', displayName: 'Pavel', email: 'pavel@example.com', roles: ['teacher'], profile: {} };
    const googleCalendarRepository = { status: vi.fn().mockResolvedValue({ connected: false }) };
    render(<MemoryRouter><AuthContext.Provider value={{ user: teacher, configured: true }}><SettingsPage googleCalendarRepository={googleCalendarRepository} /></AuthContext.Provider></MemoryRouter>);
    expect(screen.getAllByRole('tab').map((tab) => tab.textContent)).toEqual(['Minu konto', 'Minu töö']);
    fireEvent.click(screen.getByRole('tab', { name: 'Minu töö' }));
    expect(screen.getByRole('link', { name: /Ava minu ajad kalendris/ })).toHaveAttribute('href', '/calendar?ajad=1');
    expect(await screen.findByRole('button', { name: /Ühenda Google Calendar/ })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Ava juhend/ })).toHaveAttribute('href', '/guide');
    expect(googleCalendarRepository.status).toHaveBeenCalledWith('teacher-1');
  });

  it('does not show the Google Calendar card to a student', () => {
    const student = { uid: 'student-1', displayName: 'Mari', email: 'mari@example.com', roles: ['student'], profile: {} };
    render(<MemoryRouter><AuthContext.Provider value={{ user: student, configured: true, preview: true }}><SettingsPage /></AuthContext.Provider></MemoryRouter>);
    expect(screen.queryByRole('heading', { name: 'Google Calendar' })).toBeNull();
    expect(screen.queryByRole('link', { name: /Ava juhend/ })).toBeNull();
  });

  it('gives an admin the school and technical tabs, opened from the address', () => {
    const admin = { uid: 'admin-1', displayName: 'Oleksiy', email: 'o@keelesepp.test', roles: ['admin'], profile: {} };
    render(<MemoryRouter initialEntries={['/settings?tab=tehniline']}><AuthContext.Provider value={{ user: admin, configured: true, preview: true }}><SettingsPage /></AuthContext.Provider></MemoryRouter>);
    expect(screen.getAllByRole('tab').map((tab) => tab.textContent)).toEqual(['Minu konto', 'Minu töö', 'Kool', 'Tehniline']);
    expect(screen.getByRole('tab', { name: 'Tehniline' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('heading', { name: 'Firebase' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Minu andmed' })).toBeNull();
  });
});
