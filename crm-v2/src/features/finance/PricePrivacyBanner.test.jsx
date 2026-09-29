import { act, fireEvent, render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import { AuthContext } from '../../app/AuthContext.jsx';
import PricePrivacyBanner from './PricePrivacyBanner.jsx';

const withUser = (roles, api) => render(<AuthContext.Provider value={{ user: { uid: 'u', roles } }}><PricePrivacyBanner api={api} /></AuthContext.Provider>);

describe('PricePrivacyBanner', () => {
  it('offers the admin to move the prices and reports the result', async () => {
    const api = {
      previewPricePrivacy: vi.fn().mockResolvedValue({ summary: { students: 4, plansToCreate: 3, conflicts: 1 } }),
      applyPricePrivacy: vi.fn().mockResolvedValue({ summary: { students: 4, plansToCreate: 3, conflicts: 1 } }),
    };
    withUser(['admin'], api);
    expect(await screen.findByText(/4 õpilase kaardil on tunnihind/)).toBeInTheDocument();
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: 'Vii hinnad üle' })); });
    expect(api.applyPricePrivacy).toHaveBeenCalled();
    expect(screen.getByRole('status')).toHaveTextContent('4 õpilase kaart puhastatud');
  });

  it('stays hidden for non-admins and when nothing is left', async () => {
    const api = { previewPricePrivacy: vi.fn().mockResolvedValue({ summary: { students: 0 } }), applyPricePrivacy: vi.fn() };
    withUser(['finance'], api);
    expect(api.previewPricePrivacy).not.toHaveBeenCalled();
    withUser(['admin'], api);
    await act(async () => {});
    expect(screen.queryByRole('region', { name: 'Tunnihindade privaatsus' })).toBeNull();
  });
});
