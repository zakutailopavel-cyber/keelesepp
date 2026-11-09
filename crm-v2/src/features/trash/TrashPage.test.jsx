import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import TrashPage from './TrashPage.jsx';
import { CardTrashDialog, CardTrashNotice } from './CardTrashDialog.jsx';
import { trashItem } from '../../services/firebase/cardTrash.js';

const inDays = (days) => new Date(Date.now() + days * 86400000).toISOString();

function trashData() {
  return {
    waiting: [
      trashItem('student', 's1', { name: 'Mari Maasikas', subject: 'Eesti keel', level: 'A2', deletedAt: inDays(-2), deletedBy: { name: 'Oleksiy' }, purgeAfter: inDays(5) }),
      trashItem('teacher', 't1', { displayName: 'Jelena Tamm', email: 'j@example.com', deletedAt: inDays(-6), purgeAfter: inDays(1), purgeBlocked: 'future-lessons' }),
    ],
    purged: [trashItem('student', 's9', { name: 'Kustutatud õpilane #s9', deletedAt: inDays(-20), purgedAt: inDays(-13) })],
  };
}

describe('TrashPage („Prügikast”, administrator 2026-11-03)', () => {
  it('lists the cards in the trash with the purge date, days left, who deleted, and the purged cards', async () => {
    const service = { list: vi.fn().mockResolvedValue(trashData()), restore: vi.fn() };
    render(<MemoryRouter><TrashPage service={service} /></MemoryRouter>);
    const list = await screen.findByRole('list', { name: 'Prügikastis olevad kaardid' });
    const rows = within(list).getAllByRole('listitem');
    expect(rows).toHaveLength(2);
    expect(rows[0]).toHaveTextContent('Õpilane');
    expect(rows[0]).toHaveTextContent('Mari Maasikas');
    expect(rows[0]).toHaveTextContent('Eesti keel · A2');
    expect(rows[0]).toHaveTextContent('Oleksiy');
    expect(rows[0]).toHaveTextContent('(5 p)');
    expect(within(rows[0]).getByRole('link', { name: 'Mari Maasikas' })).toHaveAttribute('href', '/students/s1');
    expect(rows[1]).toHaveTextContent('Õpetaja');
    expect(within(rows[1]).getByRole('link', { name: 'Jelena Tamm' })).toHaveAttribute('href', '/teachers/t1');
    expect(rows[1]).toHaveTextContent('Peatatud: kaardil on eesootavad tunnid');
    expect(rows[0]).not.toHaveTextContent('Peatatud');
    expect(screen.getByRole('list', { name: 'Anonüümitud kaardid' })).toHaveTextContent('Kustutatud õpilane #s9');
  });

  it('„Taasta” restores the card through the server and reloads the trash', async () => {
    const data = trashData();
    const service = {
      list: vi.fn().mockResolvedValueOnce(data).mockResolvedValue({ waiting: data.waiting.slice(1), purged: [] }),
      restore: vi.fn().mockResolvedValue({ restored: true }),
    };
    render(<MemoryRouter><TrashPage service={service} /></MemoryRouter>);
    fireEvent.click(await screen.findByRole('button', { name: 'Taasta Mari Maasikas' }));
    await waitFor(() => expect(service.restore).toHaveBeenCalledWith('student', 's1'));
    expect(await screen.findByText('Mari Maasikas on taastatud.')).toBeInTheDocument();
    expect(service.list).toHaveBeenCalledTimes(2);
    expect(screen.queryByRole('button', { name: 'Taasta Mari Maasikas' })).not.toBeInTheDocument();
  });

  it('an empty trash says how to delete a card; a failed restore shows the server message', async () => {
    const empty = { list: vi.fn().mockResolvedValue({ waiting: [], purged: [] }), restore: vi.fn() };
    const { unmount } = render(<MemoryRouter><TrashPage service={empty} /></MemoryRouter>);
    expect(await screen.findByText('Prügikast on tühi')).toBeInTheDocument();
    unmount();
    const failing = { list: vi.fn().mockResolvedValue(trashData()), restore: vi.fn().mockRejectedValue(new Error('Kaart on juba lõplikult kustutatud; seda ei saa taastada.')) };
    render(<MemoryRouter><TrashPage service={failing} /></MemoryRouter>);
    fireEvent.click(await screen.findByRole('button', { name: 'Taasta Jelena Tamm' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('lõplikult kustutatud');
  });
});

describe('CardTrashDialog and CardTrashNotice', () => {
  it('„Vii prügikasti” calls the server; a refusal (lessons ahead) is shown and nothing closes', async () => {
    const service = { trash: vi.fn().mockRejectedValueOnce(new Error('Õpilasel on 2 eesootavat tundi või tunnisarja. Tühista need enne või lõpeta sari (Kalender).')).mockResolvedValue({ purgeAfter: inDays(7) }) };
    const onDone = vi.fn();
    render(<MemoryRouter><CardTrashDialog open kind="student" id="s1" name="Mari" service={service} onClose={vi.fn()} onDone={onDone} /></MemoryRouter>);
    expect(screen.getByText(/7 päeva jooksul saab selle taastada/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Vii prügikasti/ }));
    expect(await screen.findByRole('alert')).toHaveTextContent('2 eesootavat tundi');
    expect(onDone).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: /Vii prügikasti/ }));
    await waitFor(() => expect(onDone).toHaveBeenCalledWith({ purgeAfter: expect.any(String) }));
    expect(service.trash).toHaveBeenCalledWith('student', 's1');
  });

  it('teacher with lessons ahead (2026-11-06): the preview lists what to give to another teacher; „Vii prügikasti” is disabled', async () => {
    const service = {
      trash: vi.fn(),
      preview: vi.fn().mockResolvedValue({
        outcome: 'blocked', purgeAfter: inDays(7), links: [{ collection: 'workSessions', label: 'Tööaeg', count: 3, finance: false }],
        blockers: [
          { code: 'future-lessons', count: 2, message: 'Õpetajal on 2 eesootavat tundi või tunnisarja. Anna need enne teisele õpetajale või tühista (Kalender).' },
          { code: 'active-group', count: 1, message: 'Õpetaja juhendab aktiivset gruppi (B1 õhtu). Määra grupile teine õpetaja või arhiveeri grupp.' },
        ],
        lessons: [{ id: 'l1', date: '2026-11-20', time: '10:00', studentName: 'Mari', subject: 'Eesti keel', recurring: false }, { id: 'l2', weekday: 'esmaspäev', time: '17:00', studentName: 'Jaan', recurring: true }],
        groups: [{ id: 'g1', name: 'B1 õhtu' }],
      }),
    };
    render(<MemoryRouter><CardTrashDialog open kind="teacher" id="t1" name="Jelena" service={service} onClose={vi.fn()} /></MemoryRouter>);
    const blocked = await screen.findByRole('alert', { name: 'Kustutada ei saa' });
    expect(service.preview).toHaveBeenCalledWith('teacher', 't1');
    expect(blocked).toHaveTextContent('2 eesootavat tundi');
    const lessons = within(blocked).getByRole('list', { name: 'Eesootavad tunnid' });
    expect(within(lessons).getAllByRole('listitem').map((li) => li.textContent)).toEqual(['20.11.2026 10:00 · Mari · Eesti keel', 'iga esmaspäev 17:00 · Jaan (korduv)']);
    expect(within(blocked).getByRole('list', { name: 'Aktiivsed grupid' })).toHaveTextContent('B1 õhtu');
    expect(within(blocked).getByRole('link', { name: 'Ava kalender' })).toHaveAttribute('href', '/calendar');
    expect(screen.getByRole('button', { name: /Vii prügikasti/ })).toBeDisabled();
    expect(service.trash).not.toHaveBeenCalled();
  });

  it('student with invoices and payments: the preview lists them and says the history stays (anonymised, not deleted)', async () => {
    const service = {
      trash: vi.fn().mockResolvedValue({ purgeAfter: inDays(7) }),
      preview: vi.fn().mockResolvedValue({ outcome: 'anonymise', purgeAfter: '2026-11-13T10:00:00.000Z', blockers: [], lessons: [], groups: [], links: [
        { collection: 'invoices', label: 'Arved', count: 20, more: true, finance: true },
        { collection: 'payments', label: 'Maksed', count: 3, finance: true },
        { collection: 'lessons', label: 'Tunnid', count: 12, finance: false },
      ] }),
    };
    const onDone = vi.fn();
    render(<MemoryRouter><CardTrashDialog open kind="student" id="s1" name="Mari" service={service} onClose={vi.fn()} onDone={onDone} /></MemoryRouter>);
    const links = await screen.findByRole('list', { name: 'Seotud andmed' });
    expect(within(links).getAllByRole('listitem').map((li) => li.textContent)).toEqual(['Arved: 20+', 'Maksed: 3', 'Tunnid: 12']);
    expect(screen.getByText(/arved, maksed ja muu finantsajalugu jäävad muutmata/)).toBeInTheDocument();
    expect(screen.getByText(/lõplik kustutamine 13\.11\.2026/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Vii prügikasti/ }));
    await waitFor(() => expect(onDone).toHaveBeenCalled());
  });

  it('an unpaid invoice: the server message „Kaardil on tasumata arveid — arhiveeri kaart” is shown, nothing is trashed', async () => {
    const service = { trash: vi.fn(), preview: vi.fn().mockResolvedValue({ outcome: 'blocked', blockers: [{ code: 'open-invoices', count: 1, message: 'Kaardil on tasumata arveid (1, kokku 40,00 €) — arhiveeri kaart. Kustutada saab pärast arvete tasumist või tühistamist.' }], lessons: [], groups: [], links: [{ collection: 'invoices', label: 'Arved', count: 1, finance: true }] }) };
    render(<MemoryRouter><CardTrashDialog open kind="student" id="s1" name="Mari" service={service} onClose={vi.fn()} /></MemoryRouter>);
    expect(await screen.findByRole('alert', { name: 'Kustutada ei saa' })).toHaveTextContent('Kaardil on tasumata arveid (1, kokku 40,00 €) — arhiveeri kaart');
    expect(screen.getByRole('button', { name: /Vii prügikasti/ })).toBeDisabled();
  });

  it('the teacher dialog says the teacher can no longer sign in', () => {
    render(<MemoryRouter><CardTrashDialog open kind="teacher" id="t1" name="Jelena" service={{ trash: vi.fn() }} /></MemoryRouter>);
    expect(screen.getByText(/õpetaja ei saa enam sisse logida/)).toBeInTheDocument();
  });

  it('the notice on a trashed card restores it; a purged card has no „Taasta”; a normal card no notice', async () => {
    const service = { restore: vi.fn().mockResolvedValue({ restored: true }) };
    const onRestored = vi.fn();
    const { rerender } = render(<MemoryRouter><CardTrashNotice kind="student" card={{ id: 's1', deletedAt: inDays(-1), purgeAfter: inDays(6), deletedBy: { name: 'Oleksiy' } }} service={service} onRestored={onRestored} /></MemoryRouter>);
    expect(screen.getByRole('status')).toHaveTextContent('Kaart on prügikastis');
    expect(screen.getByRole('status')).toHaveTextContent('kustutas Oleksiy');
    fireEvent.click(screen.getByRole('button', { name: /Taasta/ }));
    await waitFor(() => expect(onRestored).toHaveBeenCalled());
    expect(service.restore).toHaveBeenCalledWith('student', 's1');
    rerender(<MemoryRouter><CardTrashNotice kind="student" card={{ id: 's1', deletedAt: inDays(-9), purgedAt: inDays(-2) }} service={service} /></MemoryRouter>);
    expect(screen.getByRole('status')).toHaveTextContent('lõplikult kustutatud');
    expect(screen.queryByRole('button', { name: /Taasta/ })).not.toBeInTheDocument();
    rerender(<MemoryRouter><CardTrashNotice kind="student" card={{ id: 's1', active: true }} service={service} /></MemoryRouter>);
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });
});
