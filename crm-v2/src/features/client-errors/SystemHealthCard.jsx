import { useEffect, useState } from 'react';
import { systemHealthService } from '../../services/firebase/systemHealth.js';
import { agoLabel } from './clientErrorsModel.js';
import { healthAt as at, healthView, healthWhen as when } from './systemHealthModel.js';

/**
 * „Süsteemi olek” (owner 2026-11-09) on the „Vead” page: green / red, when it was last checked, each checked part and
 * the last incident. Reads `systemHealth/current` (admin only); the scheduled function checks every 10 minutes.
 */
export default function SystemHealthCard({ service = systemHealthService, now = () => Date.now() }) {
  const [state, setState] = useState({ loading: true, current: null, failed: false });
  useEffect(() => {
    let alive = true;
    Promise.resolve().then(() => service.current())
      .then((current) => { if (alive) setState({ loading: false, current, failed: false }); })
      .catch(() => { if (alive) setState({ loading: false, current: null, failed: true }); });
    return () => { alive = false; };
  }, [service]);
  if (state.loading) return null;
  const nowMs = now();
  const view = state.failed ? { tone: 'unknown', title: 'Olekut ei saanud lugeda', note: '' } : healthView(state.current, nowMs);
  const current = state.current;
  const targets = Object.entries(current?.targets || {});
  const last = current?.lastIncident;
  const history = [...(current?.history || [])].slice(0, 48).reverse();
  return (
    <section className={`system-health system-health--${view.tone}`} aria-label="Süsteemi olek">
      <header className="system-health__head">
        <span className="system-health__dot" aria-hidden="true" />
        <div>
          <span className="system-health__eyebrow">Süsteemi olek</span>
          <strong>{view.title}</strong>
          {view.note ? <span className="system-health__note">{view.note}</span> : null}
        </div>
        {current?.checkedAt ? <span className="system-health__checked" title={current.checkedAt}>kontrollitud {agoLabel(at(current.checkedAt), nowMs)}</span> : null}
      </header>
      {targets.length ? (
        <ul className="system-health__targets">
          {targets.map(([id, target]) => (
            <li key={id} className={target.ok ? 'is-ok' : 'is-down'}>
              <span>{target.label || id}</span>
              <small>{target.ok ? `${target.ms ?? '—'} ms` : (target.error || 'ei vasta')}</small>
            </li>
          ))}
        </ul>
      ) : null}
      {history.length ? (
        <div className="system-health__history" role="img" aria-label={`Viimased ${history.length} kontrolli: ${history.filter((item) => !item.ok).length} ebaõnnestus`}>
          {history.map((item) => <span key={item.at} className={item.ok ? 'is-ok' : 'is-down'} title={`${when(item.at)}${item.ok ? '' : ` · ${(item.failing || []).join(', ')}`}`} />)}
        </div>
      ) : null}
      <p className="system-health__last">
        {last?.resolvedAt
          ? <>Viimane rike: {(last.failingLabels || last.failing || []).join(', ')} · {when(last.startedAt)} – {when(last.resolvedAt)}</>
          : current ? 'Rikkeid pole olnud.' : null}
      </p>
    </section>
  );
}
