import { act, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import MissingDataSettingsCard from './MissingDataSettingsCard.jsx';
import { DEFAULT_MISSING_SETTINGS, normalizeMissingSettings } from '../../services/firebase/missingData.js';

const admin = { uid: 'adm', displayName: 'Boss', roles: ['admin'] };

describe('Seaded → „Puuduvad andmed”', () => {
  it('defaults: times, e-mail, language and class required; phone and the parent\'s name optional', () => {
    expect(DEFAULT_MISSING_SETTINGS).toEqual({ availability: 'required', email: 'required', phone: 'optional', parentName: 'optional', language: 'required', grade: 'required' });
    expect(normalizeMissingSettings({ items: { phone: 'off', email: 'bogus' } })).toMatchObject({ phone: 'off', email: 'required' });
  });

  it('shows each item with its mode and saves a change', async () => {
    const service = { getSettings: vi.fn().mockResolvedValue({ ...DEFAULT_MISSING_SETTINGS }), saveSettings: vi.fn((items) => Promise.resolve(items)) };
    render(<MemoryRouter><MissingDataSettingsCard user={admin} service={service} /></MemoryRouter>);
    const phone = await screen.findByLabelText(/Telefon/);
    expect(phone).toHaveValue('optional');
    expect(screen.getByLabelText(/Sobivad ajad/)).toHaveValue('required');
    const save = screen.getByRole('button', { name: /Salvesta/ });
    expect(save).toBeDisabled();
    fireEvent.change(phone, { target: { value: 'required' } });
    fireEvent.change(screen.getByLabelText(/Klass või sünniaasta/), { target: { value: 'off' } });
    await act(async () => { fireEvent.click(save); });
    expect(service.saveSettings).toHaveBeenCalledWith({ ...DEFAULT_MISSING_SETTINGS, phone: 'required', grade: 'off' }, admin);
    expect(screen.getByRole('status')).toHaveTextContent('Salvestatud');
  });

  it('falls back to the defaults when the setting cannot be read', async () => {
    const service = { getSettings: vi.fn().mockRejectedValue(Object.assign(new Error('denied'), { code: 'permission-denied' })), saveSettings: vi.fn() };
    render(<MemoryRouter><MissingDataSettingsCard user={admin} service={service} /></MemoryRouter>);
    expect(await screen.findByLabelText(/Sõnumite keel/)).toHaveValue('required');
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });
});
