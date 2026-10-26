import { Bot, Check, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Button, Card, ErrorState, LoadingState } from '../../components/ui/index.js';
import { sheetBuilderKeysService } from '../../services/firebase/sheetBuilderKeys.js';

const FIELDS = ['response_type', 'client_id', 'redirect_uri', 'state', 'code_challenge', 'code_challenge_method', 'scope', 'resource'];

// „Ühenda KeeleSepp AI” (owner 2026-10-26): ChatGPT's plugin sends the administrator here (OAuth authorization
// endpoint). „Luba” gives ChatGPT a key that may only read lessons and save sheet drafts (revoked in Seaded).
export default function AiConnectPage({ service = sheetBuilderKeysService, go = (url) => globalThis.location.assign(url) }) {
  const [params] = useSearchParams();
  const request = Object.fromEntries(FIELDS.map((key) => [key, params.get(key) || '']));
  const [info, setInfo] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const query = params.toString();
  useEffect(() => {
    let alive = true;
    service.describeClient(Object.fromEntries(new globalThis.URLSearchParams(query))).then((data) => { if (alive) setInfo(data); }).catch((err) => { if (alive) setError(err.message || 'Päring on vigane.'); });
    return () => { alive = false; };
  }, [service, query]);

  const allow = async () => {
    setBusy(true); setError('');
    try { const { redirect } = await service.approveClient(request); go(redirect); } catch (err) { setError(err.message || 'Ühendamine ebaõnnestus.'); setBusy(false); }
  };
  const deny = () => {
    const url = new globalThis.URL(request.redirect_uri);
    url.searchParams.set('error', 'access_denied');
    if (request.state) url.searchParams.set('state', request.state);
    go(url.toString());
  };

  if (error && !info) return <div className="page-content"><ErrorState title="Ühendust ei saa luua" message={error} /></div>;
  if (!info) return <div className="page-content"><LoadingState label="Kontrollin päringut…" /></div>;
  return <div className="page-content">
    <Card>
      <div className="settings-icon"><Bot /></div>
      <h2>Ühenda KeeleSepp AI</h2>
      <p className="settings-copy"><b>{info.clientName}</b> ({info.redirectHost}) soovib kasutada KeeleSepa konstruktorit: lugeda kursuse tunde ja salvestada töölehtede <b>mustandeid</b> märkega „KeeleSepp AI”. Avaldamine, õpilaste andmed ja finantsid jäävad talle kättesaamatuks. Ühenduse saad tühistada Seadetes („KeeleSepp AI töölehed”).</p>
      {error ? <p className="form-error" role="alert">{error}</p> : null}
      <div className="row-actions">
        <Button loading={busy} onClick={allow}><Check size={17} /> Luba</Button>
        <Button variant="secondary" disabled={busy} onClick={deny}><X size={17} /> Keela</Button>
      </div>
    </Card>
  </div>;
}
