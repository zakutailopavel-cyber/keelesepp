import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import LearnerEmailsCard from './LearnerEmailsCard.jsx';
import { normalizeEmailSettings } from './learnerEmailModel.js';

const admin = { uid: 'admin-1', roles: ['admin'], displayName: 'Owner', email: 'owner@example.com' };

function makeService(stored = {}) {
  return {
    getSettings: vi.fn().mockResolvedValue(normalizeEmailSettings(stored)),
    saveSettings: vi.fn(async (settings) => settings),
    listLog: vi.fn().mockResolvedValue([{ id: 'l1', kind: 'lessonReminder', status: 'sent', recipientCount: 2, at: '2026-10-24T14:00:00Z' }]),
    preview: vi.fn().mockResolvedValue({ subject: 'Homme kell 16:00: tund (Mari Maasikas) / Завтра в 16:00: урок (Mari Maasikas)', html: '<p>Tuletame meelde</p>', text: '' }),
    sendTest: vi.fn().mockResolvedValue({ sent: true }),
  };
}

describe('Seaded → E-kirjad', () => {
  it('starts with everything off and saves a switched-on type with its time and a changed text', async () => {
    const service = makeService();
    render(<LearnerEmailsCard user={admin} service={service} />);
    expect(await screen.findByText(/Kõik kirjad on välja lülitatud/)).toBeInTheDocument();
    const save = screen.getByRole('button', { name: /Salvesta e-kirjade seaded/ });
    expect(save).toBeDisabled();

    fireEvent.click(screen.getByLabelText('Tunni meeldetuletus: saada'));
    fireEvent.change(screen.getByLabelText('Igapäevaste meeldetuletuste kellaaeg'), { target: { value: '18' } });
    const row = screen.getByLabelText('Tunni meeldetuletus: saada').closest('li');
    fireEvent.click(within(row).getByRole('button', { name: 'Muuda teksti' }));
    expect(within(row).getByLabelText('Teema (eesti)')).toHaveAttribute('placeholder', 'Homme kell {kell}: tund ({õpilane})');
    fireEvent.change(within(row).getByLabelText('Teema (eesti)'), { target: { value: 'Homme {kell} {pealkiri}' } });
    expect(within(row).getByRole('alert')).toHaveTextContent('{pealkiri}');

    await act(async () => { fireEvent.click(save); });
    await waitFor(() => expect(service.saveSettings).toHaveBeenCalledTimes(1));
    const [saved, user] = service.saveSettings.mock.calls[0];
    expect(user).toBe(admin);
    expect(saved.dailyHour).toBe(18);
    expect(saved.types.lessonReminder).toMatchObject({ enabled: true, subjectEt: 'Homme {kell} {pealkiri}' });
    expect(saved.types.lessonReminder.enabledAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    expect(saved.types.announcement.enabled).toBe(false);
    expect(await screen.findByText('E-kirjade seaded on salvestatud.')).toBeInTheDocument();
  });

  it('shows a preview with the unsaved texts and sends a test e-mail to the administrator', async () => {
    const service = makeService({ types: { homeworkDue: { enabled: true, enabledAt: '2026-10-25T10:00:00Z' } } });
    render(<LearnerEmailsCard user={admin} service={service} />);
    expect(await screen.findByText('Sisse lülitatud: 1 / 7.')).toBeInTheDocument();
    const row = screen.getByLabelText('Tunni meeldetuletus: saada').closest('li');
    await act(async () => { fireEvent.click(within(row).getByRole('button', { name: /Eelvaade/ })); });
    expect(service.preview).toHaveBeenCalledWith('lessonReminder', expect.objectContaining({ language: 'both' }));
    expect(await screen.findByTitle('E-kirja eelvaade')).toHaveAttribute('sandbox', '');
    expect(screen.getByText(/Homme kell 16:00: tund/)).toBeInTheDocument();
    await act(async () => { fireEvent.change(screen.getByLabelText('Eelvaate keel'), { target: { value: 'ru' } }); });
    expect(service.preview).toHaveBeenLastCalledWith('lessonReminder', expect.objectContaining({ language: 'ru' }));
    fireEvent.click(screen.getAllByRole('button', { name: 'Sulge' }).at(-1));
    expect(screen.queryByTitle('E-kirja eelvaade')).not.toBeInTheDocument();

    await act(async () => { fireEvent.click(within(row).getByRole('button', { name: /Saada proov mulle/ })); });
    expect(service.sendTest).toHaveBeenCalledWith('lessonReminder', expect.any(Object));
    expect(await screen.findByText(/saadeti sinu aadressile owner@example.com/)).toBeInTheDocument();
    expect(screen.getByText(/Viimased kirjad \(1\)/)).toBeInTheDocument();
  });
});
