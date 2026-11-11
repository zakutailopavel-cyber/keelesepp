import { Undo2 } from 'lucide-react';
import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Button, Card, EmptyState, ErrorState, LoadingState, PageHeader } from '../../components/ui/index.js';
import { useAsyncData } from '../../hooks/useAsyncData.js';
import { announceCashBoxChange } from '../../services/firebase/cashBox.js';
import { financeApi } from '../../services/firebase/financeApi.js';
import { euro } from './cashModel.js';
import { HANDOVER_STATUS, dayLabel, itemLine } from './myCashModel.js';
import { HandoverDialog, HandoverStatus, MyCashSummary, PendingIncoming } from './MyCashParts.jsx';
import './myCash.css';

// „Minu kassa” (owner 2026-11-11): a teacher's own cash — what they hold (from „Toimus · makstud sularahas”), what is
// not handed over yet, their hand-overs to a cash receiver (Pavel / Oleksiy, a Kassa setting) and their state. Only own
// data: no other teacher, no school totals (the full Kassa stays admin + accountant). A receiver also answers here.
export default function MyCashPage({ api = financeApi }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const state = useAsyncData(() => api.cashMine(), [api]);
  const [dialog, setDialog] = useState(() => searchParams.get('anna') === '1');
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState('');

  const done = async (message) => {
    setDialog(false); setNotice(message || ''); setError('');
    if (searchParams.get('anna')) setSearchParams({}, { replace: true });
    announceCashBoxChange();
    await state.reload();
  };
  const cancel = async (entry) => {
    if (!globalThis.confirm?.(`Võtad tagasi üleandmise ${entry.toName || ''} ${euro(entry.amountCents)}?`)) return;
    setBusy(entry.id); setError('');
    try { await api.cancelCashHandover(entry.id); await done('Üleandmine on tagasi võetud — raha on jälle sinu kassas.'); } catch (caught) { setError(caught.message || 'Ei õnnestunud.'); } finally { setBusy(''); }
  };

  if (state.loading && !state.data) return <LoadingState label="Laen sinu kassat…" />;
  if (state.error) return <ErrorState message={state.error.message} onRetry={state.reload} />;
  const box = state.data;
  const nothing = !box.ever && !box.incoming?.length;

  return (
    <div className="my-cash">
      <PageHeader eyebrow="Raha" title="Minu kassa" compact description="Sularaha, mille said tundide eest, ja kellele selle üle andsid. Näed ainult enda kirjeid." />
      {error ? <p className="form-error" role="alert">{error}</p> : null}
      {notice ? <p className="form-hint my-cash__notice" role="status">{notice}</p> : null}

      <MyCashSummary box={box} onHandOver={() => setDialog(true)} />
      <PendingIncoming incoming={box.incoming} api={api} onDone={done} />

      {nothing ? <EmptyState title="Sularaha pole" description="Kui õpilane maksab tunni eest sularahas („Toimus · makstud sularahas”), näed selle siin." /> : null}

      {box.items?.length ? (
        <Card as="section" className="my-cash-list" aria-label="Käes, üle andmata">
          <h2>Käes, üle andmata</h2>
          <ul>
            {box.items.map((item) => (
              <li key={item.id}>
                <span className="my-cash-list__date">{dayLabel(item.date)}</span>
                <span className="my-cash-list__what">{itemLine(item)}</span>
                <strong>{euro(item.remainingCents)}{item.remainingCents !== item.amountCents ? <small> / {euro(item.amountCents)}</small> : null}</strong>
              </li>
            ))}
          </ul>
        </Card>
      ) : null}

      {box.handovers?.length ? (
        <Card as="section" className="my-cash-list" aria-label="Minu üleandmised">
          <h2>Minu üleandmised</h2>
          <ul>
            {box.handovers.map((entry) => (
              <li key={entry.id} className={`is-${entry.status}`}>
                <span className="my-cash-list__date">{dayLabel(entry.handedAt)}</span>
                <span className="my-cash-list__what">→ {entry.toName || '—'}{entry.status === 'rejected' && entry.rejectNote ? <small>„{entry.rejectNote}”</small> : entry.note ? <small>{entry.note}</small> : null}</span>
                <strong>{euro(entry.amountCents)}</strong>
                <span className="my-cash-list__state">
                  <HandoverStatus status={entry.status} labels={HANDOVER_STATUS} />
                  {entry.status === 'pending' ? <Button variant="secondary" className="my-cash-list__undo" aria-label="Võta üleandmine tagasi" title="Võta tagasi (vale saaja)" loading={busy === entry.id} disabled={Boolean(busy)} onClick={() => cancel(entry)}><Undo2 size={15} aria-hidden="true" /></Button> : null}
                </span>
              </li>
            ))}
          </ul>
        </Card>
      ) : null}

      {box.received?.length ? (
        <Card as="section" className="my-cash-list" aria-label="Said kolleegidelt">
          <h2>Said kolleegidelt</h2>
          <ul>
            {box.received.map((entry) => (
              <li key={entry.id} className={`is-${entry.status}`}>
                <span className="my-cash-list__date">{dayLabel(entry.handedAt)}</span>
                <span className="my-cash-list__what">{entry.fromName || '—'} →{entry.rejectNote ? <small>„{entry.rejectNote}”</small> : null}</span>
                <strong>{euro(entry.amountCents)}</strong>
                <span className="my-cash-list__state"><HandoverStatus status={entry.status} labels={HANDOVER_STATUS} /></span>
              </li>
            ))}
          </ul>
        </Card>
      ) : null}

      {dialog && box.availableCents > 0 ? <HandoverDialog box={box} api={api} onClose={() => { setDialog(false); if (searchParams.get('anna')) setSearchParams({}, { replace: true }); }} onDone={done} /> : null}
    </div>
  );
}
