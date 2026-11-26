import { Pencil, Undo2 } from 'lucide-react';
import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../../app/AuthContext.jsx';
import { Button, Card, EmptyState, ErrorState, LoadingState, PageHeader } from '../../components/ui/index.js';
import { useAsyncData } from '../../hooks/useAsyncData.js';
import { announceCashBoxChange } from '../../services/firebase/cashBox.js';
import { financeApi } from '../../services/firebase/financeApi.js';
import { studentsService } from '../../services/firebase/students.js';
import { ROLES } from '../../utils/roles.js';
import { euro } from './cashModel.js';
import { HANDOVER_STATUS, dayLabel, itemLine } from './myCashModel.js';
import { HandoverDialog, HandoverStatus, MyCashSummary, PendingIncoming } from './MyCashParts.jsx';
import TeacherCashDialog from './TeacherCashDialog.jsx';
import './myCash.css';

// „Minu kassa” (owner 2026-11-11): a teacher's own cash — what they hold (from „Toimus · makstud sularahas”), what is
// not handed over yet, their hand-overs to a cash receiver (Pavel / Oleksiy, a Kassa setting) and their state. Only own
// data: no other teacher, no school totals (the full Kassa stays admin + accountant). A receiver also answers here.
// „Sain sularaha” (owner 2026-11-26): the teacher records cash they got from their own student or another payer
// (TeacherCashDialog); it stays off the books and does not change the lesson balance or the invoice.
export default function MyCashPage({ api = financeApi, studentApi = studentsService }) {
  const { user } = useAuth() || {};
  const isAdmin = Boolean(user?.roles?.includes(ROLES.ADMIN));
  const [searchParams, setSearchParams] = useSearchParams();
  const state = useAsyncData(() => api.cashMine(), [api]);
  const [dialog, setDialog] = useState(() => searchParams.get('anna') === '1');
  // „Sain sularaha”: null = closed, 'new', or the entry being edited
  const [receiving, setReceiving] = useState(null);
  const [students, setStudents] = useState({ items: [], loading: false, loaded: false });
  const openReceive = (entry = 'new') => {
    setReceiving(entry);
    if (students.loaded || students.loading || !studentApi?.list) return;
    setStudents((current) => ({ ...current, loading: true }));
    // a teacher: only their own students (the server checks the same); an admin: every active student
    const filters = isAdmin ? { status: 'active', pageSize: 500, exhaustive: true } : { status: 'active', scopeTeacherUid: user?.uid, exhaustive: true };
    Promise.resolve(studentApi.list(filters))
      .then((result) => setStudents({ items: result?.items || [], loading: false, loaded: true }))
      .catch(() => setStudents({ items: [], loading: false, loaded: false }));
  };
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState('');

  const done = async (message) => {
    setDialog(false); setReceiving(null); setNotice(message || ''); setError('');
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
    <div className="page-content my-cash">
      <PageHeader eyebrow="Raha" title="Minu kassa" compact description="Sularaha, mille said tundide eest, ja kellele selle üle andsid. Näed ainult enda kirjeid." />
      {error ? <p className="form-error" role="alert">{error}</p> : null}
      {notice ? <p className="form-hint my-cash__notice" role="status">{notice}</p> : null}

      <MyCashSummary box={box} onHandOver={() => setDialog(true)} onReceive={() => openReceive('new')} />
      <PendingIncoming incoming={box.incoming} api={api} onDone={done} />

      {nothing ? <EmptyState title="Sularaha pole" description="Kui õpilane maksab tunni eest sularahas („Toimus · makstud sularahas”) või märgid ise „Sain sularaha”, näed selle siin." /> : null}

      {box.items?.length ? (
        <Card as="section" className="my-cash-list" aria-label="Käes, üle andmata">
          <h2>Käes, üle andmata</h2>
          <ul>
            {box.items.map((item) => (
              <li key={item.id}>
                <span className="my-cash-list__date">{dayLabel(item.date)}</span>
                <span className="my-cash-list__what">{itemLine(item)}{item.source === 'teacher' ? <small><span className="my-cash-own">lisasid ise</span>{item.note ? ` ${item.note}` : ''}</small> : null}</span>
                <strong>{euro(item.remainingCents)}{item.remainingCents !== item.amountCents ? <small> / {euro(item.amountCents)}</small> : null}</strong>
                {item.canEdit ? <span className="my-cash-list__state"><Button variant="secondary" className="my-cash-list__undo" aria-label={`Paranda kirjet: ${itemLine(item)}`} title="Paranda või tühista (kuni raha pole üle antud)" disabled={Boolean(busy)} onClick={() => openReceive(item)}><Pencil size={15} aria-hidden="true" /></Button></span> : null}
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

      {receiving ? <TeacherCashDialog api={api} students={students.items} studentsLoading={students.loading} entry={receiving === 'new' ? null : receiving}
        onClose={() => setReceiving(null)} onDone={done} /> : null}
      {dialog && box.availableCents > 0 ? <HandoverDialog box={box} api={api} onClose={() => { setDialog(false); if (searchParams.get('anna')) setSearchParams({}, { replace: true }); }} onDone={done} /> : null}
    </div>
  );
}
