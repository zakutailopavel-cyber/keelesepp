import { act, fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import CampaignsPage from './CampaignsPage.jsx';

vi.mock('../../app/AuthContext.jsx', () => ({ useAuth: () => ({ user: { uid: 'admin-1', displayName: 'Admin', roles: ['admin'] } }) }));

describe('CampaignsPage', () => {
  it('starts the pre-school campaign from the template and saves it; a due post can be marked posted', async () => {
    const stored = { id: 'old', title: 'Jõulu-üritus', kind: 'event', status: 'ready', channels: ['facebook'], posts: [{ channel: 'facebook', lang: 'ru', text: 'Приглашаем!', postDate: '2026-10-27' }], checklist: [] };
    const repository = {
      list: vi.fn(async () => [stored]),
      create: vi.fn(async (values) => ({ ...values, id: 'new' })),
      update: vi.fn(async (campaign, values) => ({ ...campaign, ...values })),
    };
    render(<CampaignsPage repository={repository} groupsRepository={{ list: async () => [{ id: 'g1', name: 'Eelkool P' }] }} today="2026-10-27" />);
    expect(await screen.findByRole('region', { name: 'Täna postitada' })).toHaveTextContent('Jõulu-üritus');
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: 'Postitatud' })); });
    expect(repository.update.mock.calls[0][1].posts[0].posted).toBe(true);
    expect(screen.queryByRole('region', { name: 'Täna postitada' })).toBeNull();

    fireEvent.click(screen.getByRole('button', { name: /Eelkool 5–6 a/ }));
    expect(screen.getByLabelText('Nimi *')).toHaveValue('Eelkool pühapäeviti (5–6-aastased)');
    expect(screen.getByLabelText('Postituse 2 tekst').value).toMatch(/Подготовишка по воскресеньям/);
    fireEvent.change(screen.getByLabelText('Grupp'), { target: { value: 'g1' } });
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: 'Salvesta' })); });
    expect(repository.create).toHaveBeenCalledWith(expect.objectContaining({ title: 'Eelkool pühapäeviti (5–6-aastased)', groupId: 'g1', targetSignups: 5 }), expect.objectContaining({ uid: 'admin-1' }));
    expect(screen.getByRole('status')).toHaveTextContent('Salvestatud: Eelkool pühapäeviti');
    expect(screen.getByRole('button', { name: /Eelkool pühapäeviti \(5–6-aastased\)/ })).toHaveTextContent('Registreerunud 0/5');
  });
});
