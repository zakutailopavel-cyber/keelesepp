import { useEffect, useState } from 'react';
import { Button, Card, Input } from '../../components/ui/index.js';
import { linkpayApi } from '../../services/firebase/linkpayApi.js';

/**
 * Finance settings → „Kaardimaksed”: the LHV LinkPay switch. Off: no „Maksa arve” for families and no pay link on PDFs
 * and e-mails (staff can still try a link). The API keys are not here — they live in Secret Manager on the server.
 */
export default function LinkpaySettings({ api = linkpayApi, go = (url) => globalThis.location.assign(url) }) {
  const [state, setState] = useState({ loading: true });
  const [token, setToken] = useState('');
  const [message, setMessage] = useState('');
  const [testId, setTestId] = useState('');
  useEffect(() => {
    let live = true;
    api.settings().then((config) => { if (live) { setState(config); setToken(config.linkpayToken || ''); } })
      .catch((error) => live && setState({ error: error?.message || 'Seadeid ei saanud laadida.' }));
    return () => { live = false; };
  }, [api]);

  const save = async (enabled) => {
    setMessage('');
    try {
      const next = await api.settings({ enabled, environment: state.environment || 'sandbox', linkpayToken: token.trim() });
      setState(next);
      setMessage(next.enabled ? 'Kaardimaksed on sisse lülitatud.' : 'Salvestatud.');
    } catch (error) { setMessage(error?.message || 'Salvestamine ebaõnnestus.'); }
  };

  // staff only: a payment for one invoice while the switch is off (families see nothing); sandbox money is not real,
  // so use a test invoice (e.g. of „Test Õpilane”)
  const testPay = async () => {
    setMessage('');
    try { go((await api.startForInvoice(testId.trim())).url); } catch (error) { setMessage(error?.message || 'Testmakset ei saanud alustada.'); }
  };

  if (state.loading) return <Card><p>Laen…</p></Card>;
  if (state.error) return <Card><p className="form-error" role="alert">{state.error}</p></Card>;
  return <Card>
    <div className="section-heading"><div><span className="eyebrow">LHV LinkPay</span><h2>Kaardi- ja pangalingimaksed</h2></div></div>
    <p>Keskkond: <strong>{state.environment === 'production' ? 'päris maksed' : 'testkeskkond (sandbox)'}</strong> · olek: <strong>{state.enabled ? 'sees' : 'väljas'}</strong></p>
    <p className="form-hint">Kui sees: lapsevanem ja õpilane näevad oma kabinetis „Maksa arve”, arve PDF ja e-kiri saavad makselingi. Summa on alati arve jääk.</p>
    <Input label="LinkPay lingi token" value={token} onChange={(event) => setToken(event.target.value)} placeholder="näiteks b3uagr8a5v" />
    <div className="form-actions">
      <Button variant="secondary" onClick={() => save(state.enabled)}>Salvesta token</Button>
      {state.enabled ? <Button variant="secondary" onClick={() => save(false)}>Lülita välja</Button> : <Button onClick={() => save(true)} disabled={!token.trim()}>Lülita sisse</Button>}
    </div>
    <h3>Testmakse (ainult administraator)</h3>
    <p className="form-hint">Ava panga makseleht ühe arve jaoks ka siis, kui maksed on välja lülitatud. Testkeskkonnas kasuta ainult testarvet.</p>
    <Input label="Arve ID" value={testId} onChange={(event) => setTestId(event.target.value)} placeholder="arve dokumendi ID" />
    <div className="form-actions"><Button variant="secondary" disabled={!testId.trim()} onClick={testPay}>Ava testmakse</Button></div>
    {message ? <p className="form-hint" role="status">{message}</p> : null}
  </Card>;
}
