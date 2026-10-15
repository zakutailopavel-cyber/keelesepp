import { useState } from 'react';
import { Button, Input, Modal } from '../../components/ui/index.js';

// The administrator's list of rooms (Oleksiy 2026-10-15). A room is never deleted (its lessons keep its name); it is
// switched off and then no new lesson takes it.
export default function RoomsDialog({ rooms = [], user, repository, onClose, onChanged }) {
  const [name, setName] = useState('');
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const run = async (key, work) => {
    setBusy(key); setError('');
    try { await work(); await onChanged?.(); } catch (caught) { setError(caught.message || 'Ei õnnestunud salvestada.'); } finally { setBusy(''); }
  };
  const add = (event) => {
    event.preventDefault();
    if (!name.trim()) return;
    run('add', async () => { await repository.save({ name, active: true, order: rooms.length + 1, user }); setName(''); });
  };
  return <Modal open title="Kabinetid" onClose={onClose} footer={<Button variant="secondary" onClick={onClose}>Valmis</Button>}>
    <p className="form-hint">Kohapealne tund saab vaba kabineti (automaatselt või valikuga). Kui kõik kabinetid on sel ajal hõivatud, saab tunni panna ainult veebitunniks. Kui ühtegi kabinetti pole, kabinette ei kontrollita.</p>
    <ul className="rooms-list">{rooms.map((room) => <li key={room.id} className={room.active === false ? 'is-off' : ''}>
      <strong>{room.name}</strong><span>{room.active === false ? 'välja lülitatud' : 'kasutusel'}</span>
      <Button variant="secondary" loading={busy === room.id} disabled={Boolean(busy)} onClick={() => run(room.id, () => repository.save({ ...room, active: room.active === false, user }))}>{room.active === false ? 'Lülita sisse' : 'Lülita välja'}</Button>
    </li>)}</ul>
    <form className="rooms-add" onSubmit={add}><Input label="Uus kabinet" value={name} placeholder="nt Kabinet 1" onChange={(event) => setName(event.target.value)} /><Button type="submit" loading={busy === 'add'}>Lisa</Button></form>
    {error ? <p className="action-error" role="alert">{error}</p> : null}
  </Modal>;
}
