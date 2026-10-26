import { Bot, Copy, KeyRound, Trash2 } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Badge, Button, Card, Input } from '../../components/ui/index.js';
import { SHEET_BUILDER_URL, sheetBuilderKeysService } from '../../services/firebase/sheetBuilderKeys.js';
import { firebaseErrorMessage } from '../../utils/firebaseErrors.js';

const when = (iso) => (iso ? new Intl.DateTimeFormat('et-EE', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }).format(new Date(iso)) : '—');

// Seaded → „ChatGPT töölehed” (owner 2026-10-26): the keys of the Custom GPT that builds worksheets with the constructor
// (docs/GPT_SHEET_BUILDER.md). A key is shown once; the GPT saves only drafts, a person publishes them.
export default function SheetBuilderCard({ service = sheetBuilderKeysService }) {
  const [keys, setKeys] = useState(null);
  const [label, setLabel] = useState('ChatGPT');
  const [fresh, setFresh] = useState(null);
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState('');

  const load = useCallback(async () => {
    try { setKeys(await service.list()); } catch (err) { setKeys([]); setError(firebaseErrorMessage(err)); }
  }, [service]);
  useEffect(() => { load(); }, [load]);

  const create = async () => {
    setBusy('create'); setError('');
    try { const made = await service.create(label); setFresh(made); await load(); } catch (err) { setError(firebaseErrorMessage(err)); } finally { setBusy(''); }
  };
  const revoke = async (item) => {
    if (!globalThis.confirm(`Tühista võti „${item.label}”? GPT ei saa sellega enam lehti salvestada.`)) return;
    setBusy(item.id); setError('');
    try { await service.revoke(item.id); await load(); } catch (err) { setError(firebaseErrorMessage(err)); } finally { setBusy(''); }
  };
  const copy = async (value, what) => {
    try { await globalThis.navigator?.clipboard?.writeText(value); setCopied(what); } catch { setCopied(''); }
  };
  const active = (keys || []).filter((item) => !item.revokedAt);

  return <Card>
    <div className="settings-icon"><Bot /></div>
    <h2>ChatGPT töölehed</h2>
    <p className="settings-copy">ChatGPT koostab töölehti meie konstruktoriga ja salvestab need tunni mustandiks. Õpilased ei näe midagi enne, kui vajutad konstruktoris „Avalda”. Seadistus: docs/GPT_SHEET_BUILDER.md.</p>
    <div className="integration-row"><div><strong>Schema URL (Actions → Import from URL)</strong><span className="mono">{SHEET_BUILDER_URL}/openapi.json</span></div><Button variant="secondary" onClick={() => copy(`${SHEET_BUILDER_URL}/openapi.json`, 'url')}><Copy size={15} /> {copied === 'url' ? 'Kopeeritud' : 'Kopeeri'}</Button></div>
    {fresh ? <div className="integration-row" role="status"><div><strong>Uus võti „{fresh.label}” — kopeeri see kohe, teist korda seda ei näidata</strong><span className="mono">{fresh.key}</span><span>GPT-s: Authentication → API Key → Bearer.</span></div><Button onClick={() => copy(fresh.key, 'key')}><Copy size={15} /> {copied === 'key' ? 'Kopeeritud' : 'Kopeeri võti'}</Button></div> : null}
    <div className="settings-profile-form">
      <Input id="sheet-builder-label" label="Võtme nimi" maxLength="60" value={label} onChange={(event) => setLabel(event.target.value)} />
      <Button loading={busy === 'create'} onClick={create}><KeyRound size={17} /> Loo uus võti</Button>
    </div>
    {keys === null ? <p className="form-hint">Laen võtmeid…</p> : active.length ? <ul className="simple-list" aria-label="Kehtivad võtmed">{active.map((item) => <li key={item.id} className="integration-row">
      <div><strong>{item.label}</strong><span>{item.hint} · loodud {when(item.createdAt)}{item.createdByName ? ` (${item.createdByName})` : ''} · viimati kasutatud {when(item.lastUsedAt)}</span></div>
      <Badge tone="success">Kehtib</Badge>
      <Button variant="danger" loading={busy === item.id} onClick={() => revoke(item)}><Trash2 size={15} /> Tühista</Button>
    </li>)}</ul> : <p className="form-hint">Kehtivaid võtmeid pole.</p>}
    {error ? <p className="form-error" role="alert">{error}</p> : null}
  </Card>;
}
