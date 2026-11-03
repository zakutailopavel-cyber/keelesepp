import { RotateCcw, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, Modal } from '../../components/ui/index.js';
import { cardTrashService } from '../../services/firebase/cardTrash.js';
import { dateLabel } from './trashDates.js';
import './trash.css';

const KIND_TEXT = {
  student: { title: 'Kustuta õpilase kaart', who: 'õpilase', lessons: 'Tunnid, arved, maksed, kodutööd ja tulemused' },
  teacher: { title: 'Kustuta õpetaja kaart', who: 'õpetaja', lessons: 'Antud tunnid, tööaeg ja töötasu' },
};


/**
 * „Kustuta” on a student or teacher card (administrator): the card goes to the „Prügikast” for 7 days. The server
 * refuses while the card has lessons ahead or an active group, and says so — the message is shown here.
 */
export function CardTrashDialog({ open, kind, id, name, service = cardTrashService, onClose, onDone }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const text = KIND_TEXT[kind] || KIND_TEXT.student;
  const close = () => { if (!busy) { setError(''); onClose?.(); } };
  const confirm = async () => {
    setBusy(true); setError('');
    try {
      const result = await service.trash(kind, id);
      onDone?.(result);
    } catch (reason) { setError(reason.message || 'Kustutamine ei õnnestunud.'); } finally { setBusy(false); }
  };
  return (
    <Modal open={open} title={text.title} onClose={close} footer={<><Button variant="secondary" disabled={busy} onClick={close}>Loobu</Button><Button variant="danger" loading={busy} onClick={confirm}><Trash2 size={16} /> Vii prügikasti</Button></>}>
      <p>Kas viia <strong>{name || 'kaart'}</strong> prügikasti?</p>
      <ul className="card-trash-rules">
        <li>Kaart kaob kohe kõigist nimekirjadest, otsingust ja valikutest{kind === 'teacher' ? '; õpetaja ei saa enam sisse logida' : ''}.</li>
        <li>7 päeva jooksul saab selle taastada (Inimesed → Prügikast → „Taasta”).</li>
        <li>Pärast seda kustutatakse kaart lõplikult. Kui {text.who} kaardiga on seotud ajalugu ({text.lessons.toLocaleLowerCase('et')}), jääb ajalugu alles ja kaardilt eemaldatakse ainult nimi ja kontaktid.</li>
        <li>Eesootavate tundidega kaarti kustutada ei saa — tühista või anna tunnid enne üle.</li>
      </ul>
      {error ? <p className="form-error" role="alert">{error}</p> : null}
    </Modal>
  );
}

/** The notice on a card that is in the trash (or was purged), with „Taasta” while it can still come back. */
export function CardTrashNotice({ kind, card, service = cardTrashService, onRestored }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  if (!card?.deletedAt && !card?.purgedAt) return null;
  if (card.purgedAt) {
    return <div className="card-trash-notice" role="status"><Trash2 size={17} aria-hidden="true" /><span><strong>Kaart on lõplikult kustutatud</strong> ({dateLabel(card.purgedAt)}). Isikuandmed on eemaldatud, ajalugu ja ID on alles.</span></div>;
  }
  const restore = async () => {
    setBusy(true); setError('');
    try { const result = await service.restore(kind, card.id); onRestored?.(result); } catch (reason) { setError(reason.message || 'Taastamine ei õnnestunud.'); } finally { setBusy(false); }
  };
  return (
    <div className="card-trash-notice" role="status">
      <Trash2 size={17} aria-hidden="true" />
      <span><strong>Kaart on prügikastis</strong> — kustutatakse lõplikult {dateLabel(card.purgeAfter)}{card.deletedBy?.name ? ` (kustutas ${card.deletedBy.name})` : ''}.{card.purgeBlocked ? ' Lõplik kustutamine on peatatud: kaardil on eesootavad tunnid või aktiivne grupp.' : ''} <Link to="/trash">Ava prügikast</Link></span>
      <Button variant="primary" loading={busy} onClick={restore}><RotateCcw size={16} /> Taasta</Button>
      {error ? <p className="form-error" role="alert">{error}</p> : null}
    </div>
  );
}
