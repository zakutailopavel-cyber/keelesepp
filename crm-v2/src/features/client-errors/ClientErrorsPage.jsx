import { useMemo, useState } from 'react';
import { Badge, Button, Card, EmptyState, ErrorState, LoadingState, PageHeader } from '../../components/ui/index.js';
import { useAsyncData } from '../../hooks/useAsyncData.js';
import { clientErrorsService } from '../../services/firebase/clientErrors.js';
import SystemHealthCard from './SystemHealthCard.jsx';
import { KIND_LABELS, STATUS_LABELS, agoLabel, filterGroups, groupErrors } from './clientErrorsModel.js';
import './clientErrors.css';

const FILTERS = [['new', 'Uued'], ['ack', 'Teada'], ['fixed', 'Parandatud'], ['all', 'Kõik']];
const STATUS_TONE = { new: 'danger', ack: 'info', fixed: 'success' };
const ROLE_LABELS = { admin: 'admin', teacher: 'õpetaja', finance: 'raamatupidaja', parent: 'lapsevanem', student: 'õpilane', guest: 'külaline (tunnilink)', none: 'rollita' };

/**
 * „Vead” (admin 2026-11-04): errors the CRM reported from people's browsers in the last 30 days, grouped by
 * fingerprint — how often, how many people, where, which browser. „Teada” / „Parandatud” mark the whole group.
 * The records hold no personal data: a uid, a role, a cleaned message and the page path.
 */
export default function ClientErrorsPage({ service = clientErrorsService, healthService, now = () => Date.now() }) {
  const state = useAsyncData(() => service.listRecent({ days: 30 }), [service]);
  const [filter, setFilter] = useState('new');
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const groups = useMemo(() => groupErrors(state.data || []), [state.data]);
  const counts = useMemo(() => Object.fromEntries(FILTERS.map(([id]) => [id, filterGroups(groups, id).length])), [groups]);
  const shown = filterGroups(groups, filter);
  const at = now();

  const mark = async (group, status) => {
    setBusy(`${group.fingerprint}:${status}`); setError('');
    try {
      await service.setStatus(group.ids, status);
      await state.reload();
    } catch (reason) { setError(reason?.message || 'Olekut ei saanud muuta.'); } finally { setBusy(''); }
  };

  const header = <PageHeader eyebrow="Tehniline" title="Vead" description="Vead, mis tekkisid kasutajate brauserites viimase 30 päeva jooksul. Sama viga on üks rida: mitu korda, mitmel inimesel, millisel lehel ja millises brauseris. Kirjetes ei ole nimesid, e-posti aadresse ega sisestatud andmeid." />;
  if (state.loading && !state.data) return <div className="page-content">{header}<Card><LoadingState label="Laen vigu…" /></Card></div>;
  if (state.error) return <div className="page-content">{header}<Card><ErrorState message={state.error.message} onRetry={state.reload} /></Card></div>;

  return (
    <div className="page-content client-errors">
      {header}
      <SystemHealthCard {...(healthService ? { service: healthService } : {})} now={now} />
      <nav className="settings-tabs" role="tablist" aria-label="Vigade olek">
        {FILTERS.map(([id, label]) => <button type="button" role="tab" key={id} aria-selected={filter === id} className={filter === id ? 'is-active' : ''} onClick={() => setFilter(id)}>{label} ({counts[id]})</button>)}
      </nav>
      {error ? <p className="action-error" role="alert">{error}</p> : null}
      <Card>
        {shown.length === 0 ? <EmptyState title={filter === 'new' ? 'Uusi vigu pole' : 'Siin pole midagi'} description={filter === 'new' ? 'Viimase 30 päeva jooksul pole uusi vigu teatatud.' : undefined} /> : (
          <ul className="client-errors__list">
            {shown.map((group) => (
              <li className="client-errors__row" key={group.fingerprint}>
                <div className="client-errors__main">
                  <div className="client-errors__tags">
                    <Badge tone={STATUS_TONE[group.status]}>{STATUS_LABELS[group.status]}</Badge>
                    <Badge>{KIND_LABELS[group.kind] || group.kind}</Badge>
                    {group.cameBack ? <Badge tone="danger">Tuli tagasi</Badge> : null}
                  </div>
                  <strong className="client-errors__message">{group.message}</strong>
                  {group.frame ? <code className="client-errors__frame">{group.frame}</code> : null}
                  <dl className="client-errors__facts">
                    <div><dt>Leht</dt><dd>{group.routes.join(', ') || '—'}</dd></div>
                    <div><dt>Brauser</dt><dd>{group.browsers.join(', ') || '—'}</dd></div>
                    <div><dt>Kellel</dt><dd>{group.roles.map((role) => ROLE_LABELS[role] || role).join(', ') || '—'}</dd></div>
                    {group.builds.length ? <div><dt>Versioon</dt><dd>{group.builds.join(', ')}</dd></div> : null}
                  </dl>
                </div>
                <div className="client-errors__numbers">
                  <span><strong>{group.count}</strong> korda</span>
                  <span><strong>{group.users}</strong> {group.users === 1 ? 'inimene' : 'inimest'}</span>
                  <span title={new Date(group.lastAt).toISOString()}>viimati {agoLabel(group.lastAt, at)}</span>
                  <div className="client-errors__actions">
                    {group.status !== 'ack' ? <Button variant="secondary" loading={busy === `${group.fingerprint}:ack`} disabled={Boolean(busy)} onClick={() => mark(group, 'ack')}>Teada</Button> : null}
                    {group.status !== 'fixed' ? <Button variant="secondary" loading={busy === `${group.fingerprint}:fixed`} disabled={Boolean(busy)} onClick={() => mark(group, 'fixed')}>Parandatud</Button> : null}
                    {group.status !== 'new' ? <Button variant="secondary" loading={busy === `${group.fingerprint}:new`} disabled={Boolean(busy)} onClick={() => mark(group, 'new')}>Uueks</Button> : null}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
