import { act, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import EmailPreferencesPage from './EmailPreferencesPage.jsx';

const renderAt = (service, token = 'abc.def') => render(<MemoryRouter initialEntries={[`/e-kirjad/${token}`]}><Routes><Route path="/e-kirjad/:token" element={<EmailPreferencesPage service={service} />} /></Routes></MemoryRouter>);

describe('/e-kirjad/<token> — the recipient\'s own e-mail settings', () => {
  it('turns the notifications off without a login and says that invoices still come', async () => {
    const service = {
      preferenceStatus: vi.fn().mockResolvedValue({ email: 'ma••@example.com', optOut: false, language: 'both' }),
      savePreferences: vi.fn().mockResolvedValue({ email: 'ma••@example.com', optOut: true, language: 'both' }),
    };
    renderAt(service);
    expect(await screen.findByText('Aadress: ma••@example.com')).toBeInTheDocument();
    expect(service.preferenceStatus).toHaveBeenCalledWith('abc.def');
    expect(screen.getByText(/Arved ja maksemeeldetuletused tulevad edasi/)).toBeInTheDocument();
    fireEvent.click(screen.getByLabelText(/Saada mulle neid teavitusi/));
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: 'Salvesta' })); });
    expect(service.savePreferences).toHaveBeenCalledWith('abc.def', { optOut: true, language: 'both' });
    expect(await screen.findByText(/enam ei saadeta/)).toBeInTheDocument();
  });

  it('opens in Russian for a Russian choice and saves the language', async () => {
    const service = {
      preferenceStatus: vi.fn().mockResolvedValue({ email: 'em••@example.com', optOut: false, language: 'ru' }),
      savePreferences: vi.fn().mockResolvedValue({ email: 'em••@example.com', optOut: false, language: 'et' }),
    };
    renderAt(service);
    expect(await screen.findByText('Письма KeeleSepp')).toBeInTheDocument();
    fireEvent.click(screen.getByLabelText(/Только эстонский/));
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: 'Сохранить' })); });
    expect(service.savePreferences).toHaveBeenCalledWith('abc.def', { optOut: false, language: 'et' });
    expect(await screen.findByText(/будут приходить/)).toBeInTheDocument();
  });

  it('a broken link shows a clear message', async () => {
    renderAt({ preferenceStatus: vi.fn().mockRejectedValue(new Error('Link ei kehti.')), savePreferences: vi.fn() }, 'forged');
    expect(await screen.findByRole('alert')).toHaveTextContent('See link ei kehti');
    expect(screen.queryByRole('button', { name: 'Salvesta' })).not.toBeInTheDocument();
  });
});
