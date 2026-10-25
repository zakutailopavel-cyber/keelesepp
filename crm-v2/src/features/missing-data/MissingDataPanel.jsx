import { Check, Copy, ExternalLink, RefreshCw } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Badge, Button, Input, Modal, Select } from '../../components/ui/index.js';
import { missingDataService } from '../../services/firebase/missingData.js';
import { ACCOUNT_LABELS, FIELD_NAMES, ITEM_LABELS, KIND_LABELS, filterRows, itemCounts } from './missingDataModel.js';
import './missingData.css';

const LANGUAGE_NAMES = { et: 'eesti', ru: 'vene', en: 'inglise' };
const when = (value) => (value ? new Date(value).toLocaleString('et-EE', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : '');
const shown = (change) => (change.field === 'preferredLanguage' ? LANGUAGE_NAMES[change.after] || change.after : String(change.after));

// Õpilased → „Puuduvad andmed” (owner 2026-10-25): per active card what is missing (the Seaded setting decides which
// items count), who has an account and would be asked at login, and the latest fillings to mark as seen. Cards
// without any account never see the form — for them the school sends the /ajad link or calls.
export default function MissingDataPanel({ open, onClose, user, focusSubmission = '', service = missingDataService }) {
  const [state, setState] = useState({ loading: true, error: '', report: null, submissions: [] });
  const [filters, setFilters] = useState({ item: '', account: '', search: '' });
  const [copied, setCopied] = useState('');
  const [busy, setBusy] = useState('');

  const load = useCallback(async () => {
    setState((current) => ({ ...current, loading: true, error: '' }));
    const [report, submissions] = await Promise.all([
      service.report().catch((error) => ({ error })),
      Promise.resolve().then(() => service.listUnreviewed()).catch(() => []),
    ]);
    if (report?.error) setState({ loading: false, error: report.error.message || 'Nimekirja ei saanud laadida.', report: null, submissions });
    else setState({ loading: false, error: '', report, submissions });
  }, [service]);

  useEffect(() => { if (open) load(); }, [load, open]);

  const rows = useMemo(() => state.report?.rows || [], [state.report]);
  const withMissing = useMemo(() => rows.filter((row) => row.missing.length), [rows]);
  const counts = useMemo(() => itemCounts(withMissing), [withMissing]);
  const visible = useMemo(() => filterRows(rows, filters), [rows, filters]);
  const settings = state.report?.settings || {};
  const items = Object.keys(ITEM_LABELS).filter((item) => settings[item] && settings[item] !== 'off');

  const copyLink = async (id) => {
    const link = `${globalThis.location?.origin || ''}/ajad`;
    try { await globalThis.navigator?.clipboard?.writeText(link); setCopied(id); } catch { globalThis.prompt?.('Kopeeri link', link); }
  };
  const review = async (item) => {
    setBusy(item.id);
    try {
      await service.markReviewed(item.id, user);
      setState((current) => ({ ...current, submissions: current.submissions.filter((entry) => entry.id !== item.id) }));
    } catch (error) {
      setState((current) => ({ ...current, error: error.message || 'Ei õnnestunud.' }));
    } finally { setBusy(''); }
  };

  return (
    <Modal open={open} title="Puuduvad andmed" onClose={onClose} className="modal--missing">
      <div className="missing-panel">
        {state.loading ? <p className="form-hint" role="status">Laen…</p> : null}
        {state.error ? <p className="form-error" role="alert">{state.error}</p> : null}

        {state.submissions.length ? (
          <section className="missing-panel__filled" aria-label="Uued täitmised">
            <h3>Uued täitmised ({state.submissions.length})</h3>
            <ul>{state.submissions.map((item) => (
              <li key={item.id} className={item.id === focusSubmission ? 'is-focus' : ''}>
                <div>
                  <strong>{item.studentIds.length === 1 ? <Link to={`/students/${encodeURIComponent(item.studentIds[0])}`}>{item.studentNames[0] || 'Õpilane'}</Link> : item.studentNames.join(', ')}</strong>
                  {' · '}<span className="missing-panel__meta">{item.byName}{item.byRole === 'parent' ? ' (lapsevanem)' : ''} · {when(item.at)}</span>
                  <ul className="missing-panel__changes">{item.changes.map((change, index) => (
                    <li key={`${change.id}-${change.field}-${index}`}>{change.target === 'profile' ? 'lapsevanema profiil: ' : ''}{FIELD_NAMES[change.field] || change.field}: {change.before ? `${change.before} → ` : ''}{shown(change)}</li>
                  ))}</ul>
                </div>
                <Button variant="secondary" loading={busy === item.id} onClick={() => review(item)}><Check size={14} /> Vaadatud</Button>
              </li>
            ))}</ul>
          </section>
        ) : null}

        {state.report ? <>
          <p className="missing-panel__summary">
            {state.report.totals.cards} aktiivset kaarti · midagi puudub {state.report.totals.withMissing} · sisselogimisel näeks vormi {state.report.totals.wouldSee} · kontota (ei näe vormi) {state.report.totals.missingWithoutAccount}.
            {' '}Mida küsida, määrad <Link to="/settings#puuduvad-andmed">Seadetes</Link>.
          </p>
          <div className="missing-panel__totals" role="group" aria-label="Puuduv andmeväli">
            <button type="button" aria-pressed={!filters.item} onClick={() => setFilters((current) => ({ ...current, item: '' }))}>Kõik <b>{withMissing.length}</b></button>
            {items.map((item) => (
              <button key={item} type="button" aria-pressed={filters.item === item} onClick={() => setFilters((current) => ({ ...current, item: current.item === item ? '' : item }))}>
                {ITEM_LABELS[item]} <b>{counts[item]}</b>{settings[item] === 'required' ? null : <small>(soovi korral)</small>}
              </button>
            ))}
          </div>
          <div className="missing-panel__filters">
            <Input label="Otsi nime või õpetajat" value={filters.search} onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))} />
            <Select label="Konto" value={filters.account} onChange={(event) => setFilters((current) => ({ ...current, account: event.target.value }))}>
              <option value="">Kõik</option>
              <option value="any">Kontoga (näeb vormi)</option>
              <option value="none">Kontota (saada link / helista)</option>
            </Select>
          </div>
          <p className="missing-panel__summary" aria-live="polite">Näitan {visible.length} kaarti.</p>
          <ul className="missing-panel__list" aria-label="Kaardid">{visible.map((row) => (
            <li key={row.studentId} className="missing-panel__row">
              <div>
                <strong><Link to={`/students/${encodeURIComponent(row.studentId)}`}>{row.name || 'Nimeta'}</Link></strong>
                <span className="missing-panel__meta">{KIND_LABELS[row.kind]}{row.teacher ? ` · ${row.teacher}` : ''} · {ACCOUNT_LABELS[row.account]}{row.wouldSee ? ' · küsitakse sisselogimisel' : ''}</span>
                <span className="missing-panel__chips">{row.missing.map((item) => <span key={item} className={row.required.includes(item) ? '' : 'is-optional'}>{ITEM_LABELS[item]}</span>)}</span>
              </div>
              <div className="missing-panel__actions">
                {row.account === 'none' ? <Button variant="secondary" onClick={() => copyLink(row.studentId)}><Copy size={14} /> {copied === row.studentId ? 'Link kopeeritud' : 'Kopeeri /ajad link'}</Button> : null}
                <Link className="button button--secondary" to={`/students/${encodeURIComponent(row.studentId)}`}><ExternalLink size={14} /> Ava kaart</Link>
              </div>
            </li>
          ))}</ul>
          {!visible.length ? <p className="form-hint">Selle valikuga kaarte pole.</p> : null}
        </> : null}
        <div><Button variant="secondary" onClick={load} disabled={state.loading}><RefreshCw size={15} /> Värskenda</Button> {state.submissions.length ? <Badge tone="info">{state.submissions.length} uut täitmist</Badge> : null}</div>
      </div>
    </Modal>
  );
}
