import { RotateCcw } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Badge, Button, Card, EmptyState, ErrorState, LoadingState, PageHeader } from '../../components/ui/index.js';
import { useAsyncData } from '../../hooks/useAsyncData.js';
import { cardTrashService } from '../../services/firebase/cardTrash.js';
import { dateLabel, daysLeft } from './trashDates.js';
import './trash.css';

const KIND = { student: 'Õpilane', teacher: 'Õpetaja' };
const cardLink = (item) => (item.kind === 'teacher' ? `/teachers/${encodeURIComponent(item.id)}` : `/students/${encodeURIComponent(item.id)}`);

/**
 * „Prügikast” (administrator Oleksiy 2026-11-03): student and teacher cards deleted in the last 7 days, with the date
 * each one is purged and „Taasta”. Below: purged cards — deleted, or anonymised when history had to stay.
 */
export default function TrashPage({ service = cardTrashService }) {
  const state = useAsyncData(() => service.list(), [service]);
  const [busyId, setBusyId] = useState('');
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  const restore = async (item) => {
    setBusyId(item.id); setError(''); setNotice('');
    try {
      await service.restore(item.kind, item.id);
      setNotice(`${item.name} on taastatud.`);
      await state.reload();
    } catch (reason) { setError(reason.message || 'Taastamine ei õnnestunud.'); } finally { setBusyId(''); }
  };

  const header = <PageHeader eyebrow="Inimesed" title="Prügikast" description="Kustutatud õpilaste ja õpetajate kaardid jäävad siia 7 päevaks. Pärast seda kustutatakse kaart lõplikult; kui sellega on seotud tunnid, arved, maksed või tööd, jääb ajalugu alles ja kaardilt eemaldatakse nimi ja kontaktid." />;
  if (state.loading) return <div className="page-content">{header}<Card><LoadingState label="Laen prügikasti…" /></Card></div>;
  if (state.error) return <div className="page-content">{header}<Card><ErrorState message={state.error.message} onRetry={state.reload} /></Card></div>;
  const { waiting = [], purged = [] } = state.data || {};

  return (
    <div className="page-content">
      {header}
      {notice ? <div className="success-notice" role="status">{notice}<button onClick={() => setNotice('')} aria-label="Sulge teade">×</button></div> : null}
      {error ? <div className="action-error" role="alert">{error}<button onClick={() => setError('')} aria-label="Sulge teade">×</button></div> : null}
      <Card>
        <h2>Prügikastis ({waiting.length})</h2>
        {waiting.length ? (
          <ul className="trash-list" aria-label="Prügikastis olevad kaardid">
            {waiting.map((item) => (
              <li key={`${item.kind}-${item.id}`} className="trash-row">
                <div className="trash-row__who">
                  <Badge tone="neutral">{KIND[item.kind]}</Badge>
                  <Link to={cardLink(item)}><strong>{item.name}</strong></Link>
                  {item.detail ? <small>{item.detail}</small> : null}
                </div>
                <div className="trash-row__when">
                  <span>Kustutatud {dateLabel(item.deletedAt)}{item.deletedBy ? ` · ${item.deletedBy}` : ''}</span>
                  <strong>Lõplikult {dateLabel(item.purgeAfter)} ({daysLeft(item.purgeAfter)} p)</strong>
                  {item.purgeBlocked ? <small className="trash-row__blocked">Peatatud: kaardil on eesootavad tunnid või aktiivne grupp.</small> : null}
                </div>
                <Button variant="secondary" loading={busyId === item.id} disabled={Boolean(busyId) && busyId !== item.id} onClick={() => restore(item)} aria-label={`Taasta ${item.name}`}><RotateCcw size={16} /> Taasta</Button>
              </li>
            ))}
          </ul>
        ) : <EmptyState title="Prügikast on tühi" description="Kaardi kustutamiseks ava õpilase või õpetaja kaart ja vali „Kustuta”." />}
      </Card>
      {purged.length ? (
        <Card>
          <h2>Lõplikult kustutatud, ajalugu alles ({purged.length})</h2>
          <ul className="trash-list" aria-label="Anonüümitud kaardid">
            {purged.map((item) => (
              <li key={`${item.kind}-${item.id}`} className="trash-row">
                <div className="trash-row__who"><Badge tone="neutral">{KIND[item.kind]}</Badge><Link to={cardLink(item)}><strong>{item.name}</strong></Link></div>
                <div className="trash-row__when"><span>Isikuandmed eemaldatud {dateLabel(item.purgedAt)}</span></div>
              </li>
            ))}
          </ul>
        </Card>
      ) : null}
    </div>
  );
}
