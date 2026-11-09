import { RotateCcw, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, LoadingState, Modal } from '../../components/ui/index.js';
import { cardTrashService } from '../../services/firebase/cardTrash.js';
import { blockedReason, dateLabel } from './trashDates.js';
import './trash.css';

const KIND_TEXT = {
  student: { title: 'Kustuta õpilase kaart', who: 'õpilase', lessons: 'Tunnid, arved, maksed, kodutööd ja tulemused' },
  teacher: { title: 'Kustuta õpetaja kaart', who: 'õpetaja', lessons: 'Antud tunnid, tööaeg ja töötasu' },
};

// one lesson or series to move first: „12.11.2026 10:00 · Mari · Eesti keel” / „iga esmaspäev 17:00 · …”
function lessonLine(item, kind) {
  const when = item.date ? `${dateLabel(`${item.date}T12:00:00`)}` : `iga ${item.weekday || 'nädal'}`;
  const who = kind === 'teacher' ? item.studentName : item.teacher;
  return [`${when}${item.time ? ` ${item.time}` : ''}`, who, item.subject].filter(Boolean).join(' · ');
}

const BLOCKED_HINT = {
  'future-lessons': (kind) => (kind === 'teacher' ? 'Ava kalender ja anna need tunnid teisele õpetajale või tühista need.' : 'Ava kalender ja tühista need tunnid või lõpeta sari.'),
  'active-group': (kind) => (kind === 'teacher' ? 'Määra grupile teine õpetaja või arhiveeri grupp.' : 'Eemalda õpilane grupist.'),
};

/**
 * „Kustuta” on a student or teacher card (administrator): the card goes to the „Prügikast” for 7 days. Before the
 * button (2026-11-06) the server's preview lists why it cannot go now (lessons ahead, an active group, an unpaid
 * invoice — with the lessons and groups to move first), what is linked to the card and what the purge will do. The
 * server checks again on „Vii prügikasti”; its refusal is shown here too.
 */
export function CardTrashDialog({ open, kind, id, name, service = cardTrashService, onClose, onDone }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [loaded, setLoaded] = useState({ key: '', data: null, error: '' });
  const text = KIND_TEXT[kind] || KIND_TEXT.student;
  const requestKey = open && typeof service.preview === 'function' && id ? `${kind}:${id}` : '';

  useEffect(() => {
    if (!requestKey) return undefined;
    let alive = true;
    service.preview(kind, id)
      .then((data) => { if (alive) setLoaded({ key: requestKey, data, error: '' }); })
      .catch((reason) => { if (alive) setLoaded({ key: requestKey, data: null, error: reason.message || 'Seotud andmeid ei saanud kontrollida.' }); });
    return () => { alive = false; };
  }, [requestKey, service, kind, id]);
  const current = Boolean(requestKey) && loaded.key === requestKey;
  const preview = { loading: Boolean(requestKey) && !current, data: current ? loaded.data : null, error: current ? loaded.error : '' };

  const close = () => { if (!busy) { setError(''); onClose?.(); } };
  const confirm = async () => {
    setBusy(true); setError('');
    try {
      const result = await service.trash(kind, id);
      onDone?.(result);
    } catch (reason) { setError(reason.message || 'Kustutamine ei õnnestunud.'); } finally { setBusy(false); }
  };
  const data = preview.data;
  const blockers = data?.blockers || [];
  const blocked = blockers.length > 0;
  const links = data?.links || [];
  const financeLinks = links.filter((link) => link.finance);
  return (
    <Modal open={open} title={text.title} onClose={close} footer={<><Button variant="secondary" disabled={busy} onClick={close}>{blocked ? 'Sulge' : 'Loobu'}</Button><Button variant="danger" loading={busy} disabled={blocked || preview.loading} onClick={confirm}><Trash2 size={16} /> Vii prügikasti</Button></>}>
      <p>Kas viia <strong>{name || 'kaart'}</strong> prügikasti?</p>
      {preview.loading ? <LoadingState label="Kontrollin, mis on kaardiga seotud…" /> : null}
      {blocked ? (
        <div className="card-trash-blocked" role="alert" aria-label="Kustutada ei saa">
          <strong>Praegu kustutada ei saa:</strong>
          <ul>{blockers.map((item) => <li key={item.code}>{item.message}{BLOCKED_HINT[item.code] ? ` ${BLOCKED_HINT[item.code](kind)}` : ''}</li>)}</ul>
          {data.lessons?.length ? (
            <>
              <b>{kind === 'teacher' ? 'Anna teisele õpetajale või tühista:' : 'Tühista või lõpeta:'}</b>
              <ul className="card-trash-items" aria-label="Eesootavad tunnid">{data.lessons.map((item, index) => <li key={item.id || index}>{lessonLine(item, kind)}{item.recurring ? ' (korduv)' : ''}</li>)}</ul>
              <Link to="/calendar">Ava kalender</Link>
            </>
          ) : null}
          {data.groups?.length ? (
            <>
              <b>Aktiivsed grupid:</b>
              <ul className="card-trash-items" aria-label="Aktiivsed grupid">{data.groups.map((group) => <li key={group.id}>{group.name}</li>)}</ul>
              <Link to="/groups">Ava grupid</Link>
            </>
          ) : null}
        </div>
      ) : null}
      {data && links.length ? (
        <div className="card-trash-links">
          <b>Kaardiga on seotud:</b>
          <ul aria-label="Seotud andmed">{links.map((link) => <li key={link.collection}>{link.label}: {link.count}{link.more ? '+' : ''}</li>)}</ul>
          {!blocked ? <p>Pärast 7 päeva kaarti ei kustutata täielikult: {financeLinks.length ? 'arved, maksed ja muu finantsajalugu jäävad muutmata (sh nimi arvel), ' : ''}tunnid ja tööd jäävad alles, kaardilt eemaldatakse nimi ja kontaktid. Kui õpilane või õpetaja võib naasta, arhiveeri kaart kustutamise asemel.</p> : null}
        </div>
      ) : null}
      {data && !links.length && !blocked ? <p className="form-hint">Kaardiga pole seotud tunde, arveid ega töid: pärast 7 päeva kustutatakse see täielikult.</p> : null}
      {preview.error ? <p className="form-hint">Seotud andmeid ei saanud kontrollida ({preview.error}). Server kontrollib uuesti, kui vajutad „Vii prügikasti”.</p> : null}
      <ul className="card-trash-rules">
        <li>Kaart kaob kohe kõigist nimekirjadest, otsingust ja valikutest{kind === 'teacher' ? '; õpetaja ei saa enam sisse logida' : ''}.</li>
        <li>7 päeva jooksul saab selle taastada (Inimesed → Prügikast → „Taasta”){data?.purgeAfter ? `; lõplik kustutamine ${dateLabel(data.purgeAfter)}` : ''}.</li>
        <li>Pärast seda kustutatakse kaart lõplikult. Kui {text.who} kaardiga on seotud ajalugu ({text.lessons.toLocaleLowerCase('et')}), jääb ajalugu alles ja kaardilt eemaldatakse ainult nimi ja kontaktid.</li>
        <li>Eesootavate tundidega {kind === 'student' ? 'või tasumata arvetega ' : ''}kaarti kustutada ei saa — tühista või anna tunnid enne üle{kind === 'student' ? '; võlaga kaart arhiveeri' : ''}.</li>
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
      <span><strong>Kaart on prügikastis</strong> — kustutatakse lõplikult {dateLabel(card.purgeAfter)}{card.deletedBy?.name ? ` (kustutas ${card.deletedBy.name})` : ''}.{card.purgeBlocked ? ` Lõplik kustutamine on peatatud: ${blockedReason(card.purgeBlocked)}.` : ''} <Link to="/trash">Ava prügikast</Link></span>
      <Button variant="primary" loading={busy} onClick={restore}><RotateCcw size={16} /> Taasta</Button>
      {error ? <p className="form-error" role="alert">{error}</p> : null}
    </div>
  );
}
