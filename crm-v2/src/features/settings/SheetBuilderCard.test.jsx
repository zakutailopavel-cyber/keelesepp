import { act, fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import SheetBuilderCard from './SheetBuilderCard.jsx';

describe('ChatGPT töölehed (settings)', () => {
  it('makes a key, shows it once and revokes a key', async () => {
    const keys = [{ id: 'a'.repeat(64), label: 'ChatGPT', hint: 'kss_abcd…wxyz', createdAt: '2026-10-26T10:00:00Z', revokedAt: '' }];
    const service = { list: vi.fn().mockResolvedValue(keys), create: vi.fn().mockResolvedValue({ id: 'b'.repeat(64), key: 'kss_secret_value_1234567890', label: 'Pavel' }), revoke: vi.fn().mockResolvedValue({ ok: true }) };
    render(<SheetBuilderCard service={service} />);
    expect(await screen.findByText(/kss_abcd…wxyz/)).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Võtme nimi'), { target: { value: 'Pavel' } });
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: /Loo uus võti/ })); });
    expect(service.create).toHaveBeenCalledWith('Pavel');
    expect(screen.getByText('kss_secret_value_1234567890')).toBeInTheDocument();
    vi.spyOn(globalThis, 'confirm').mockReturnValue(true);
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: /Tühista/ })); });
    expect(service.revoke).toHaveBeenCalledWith('a'.repeat(64));
  });
});
