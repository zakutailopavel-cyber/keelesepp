import { useEffect, useState } from 'react';
import { Button, Card, Input, LoadingState } from '../../../components/ui/index.js';
import { financeApi } from '../../../services/firebase/financeApi.js';
import { fieSettingsErrors } from './fieModel.js';

/**
 * Finantsid → Seaded → „FIE” (owner only, 2026-11-09): the owner's sole proprietorship on his own invoices — only the
 * name and the bank account. Until both are filled, FIE cannot be chosen anywhere. The number series is fixed (FIE-).
 */
export default function FieSettings({ api = financeApi }) {
  const [state, setState] = useState({ loading: true });
  const [form, setForm] = useState({ name: '', iban: '' });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    let live = true;
    api.fieSettings().then((result) => { if (live) { setState(result); setForm({ name: result.settings?.name || '', iban: result.settings?.iban || '' }); } })
      .catch((error) => live && setState({ error: error?.message || 'Seadeid ei saanud laadida.' }));
    return () => { live = false; };
  }, [api]);

  const save = async (event) => {
    event.preventDefault();
    setMessage('');
    const found = fieSettingsErrors(form);
    setErrors(found);
    if (Object.keys(found).length) return;
    setBusy(true);
    try {
      const result = await api.fieSettings(form);
      setState(result);
      setForm({ name: result.settings.name, iban: result.settings.iban });
      setMessage('Salvestatud.');
    } catch (error) {
      setMessage(error?.message || 'Salvestamine ebaõnnestus.');
    } finally {
      setBusy(false);
    }
  };

  if (state.loading) return <Card><LoadingState inline label="Laen…" /></Card>;
  if (state.error) return <Card><p className="form-error" role="alert">{state.error}</p></Card>;
  const fieStudents = (state.students || []).filter((item) => item.issuer === 'fie').length;
  return <Card>
    <div className="section-heading"><div><span className="eyebrow">Ainult sulle</span><h2>FIE arved</h2></div></div>
    <p className="form-hint">Sinu FIE andmed arvel: ainult nimi ja pangakonto. FIE arved on eraldi numbriga ({state.prefix || 'FIE-'}2026-001 …), neid ei näe teised administraatorid ega raamatupidaja ning need ei lähe ettevõtte raamatupidamisse, analüüsi ega pangaga sidumisse. Kaardimakset FIE arvel ei ole.</p>
    <form className="form-grid" onSubmit={save} aria-label="FIE andmed">
      <Input label="Ees- ja perekonnanimi" value={form.name} error={errors.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
      <Input label="Pangakonto (IBAN)" value={form.iban} error={errors.iban} onChange={(event) => setForm({ ...form, iban: event.target.value })} placeholder="EE00 0000 0000 0000 0000" />
      <div className="form-actions form-grid__wide"><Button type="submit" loading={busy}>Salvesta</Button></div>
    </form>
    <p className="form-hint" role="status">{state.ready ? `Olek: valmis. FIE õpilasi: ${fieStudents}. Õpilase kaardil vali „Arve väljastaja: FIE”.` : 'Olek: täitmata — FIE-d ei saa enne valida.'}</p>
    {message ? <p className="form-hint" role="status">{message}</p> : null}
  </Card>;
}
