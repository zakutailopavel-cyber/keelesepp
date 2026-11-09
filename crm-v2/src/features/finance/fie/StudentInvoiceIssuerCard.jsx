import { useEffect, useState } from 'react';
import { Button, Card, Select } from '../../../components/ui/index.js';
import { financeApi } from '../../../services/firebase/financeApi.js';
import { useIsOwner } from './useIsOwner.js';

/**
 * Student card → Finants → „Arve väljastaja” (owner only, 2026-11-09): E&P Koolitus OÜ (default) or the owner's own FIE.
 * FIE applies only to the owner's own lessons of this student; the other teachers' lessons stay company invoices.
 * Nobody else sees this card or the choice (Firestore: studentInvoiceIssuers is the owner's only).
 */
export default function StudentInvoiceIssuerCard({ student, api = financeApi }) {
  const isOwner = useIsOwner();
  const [state, setState] = useState({ loading: true });
  const [value, setValue] = useState('company');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    if (!isOwner || !student?.id) return undefined;
    let live = true;
    api.fieSettings().then((result) => {
      if (!live) return;
      const current = (result.students || []).find((item) => item.studentId === student.id)?.issuer || 'company';
      setState({ ready: result.ready, current });
      setValue(current);
    }).catch((error) => live && setState({ error: error?.message || 'Andmeid ei saanud laadida.' }));
    return () => { live = false; };
  }, [api, isOwner, student?.id]);
  if (!isOwner) return null;

  const save = async () => {
    setMessage('');
    setBusy(true);
    try {
      const result = await api.setStudentInvoiceIssuer(student.id, value);
      setState((current) => ({ ...current, current: result.issuer }));
      setMessage(result.issuer === 'fie' ? 'Edaspidi: sinu tundide arved FIE nimel.' : 'Edaspidi: arved E&P Koolitus OÜ nimel.');
    } catch (error) {
      setMessage(error?.message || 'Salvestamine ebaõnnestus.');
    } finally {
      setBusy(false);
    }
  };

  return <Card>
    <div className="section-heading"><div><span className="eyebrow">Ainult sulle</span><h2>Arve väljastaja</h2></div></div>
    {state.loading ? <p className="form-hint">Laen…</p> : state.error ? <p className="form-error" role="alert">{state.error}</p> : <>
      <Select id={`invoice-issuer-${student.id}`} label="Arve väljastaja" value={value} onChange={(event) => setValue(event.target.value)}>
        <option value="company">E&P Koolitus OÜ</option>
        <option value="fie" disabled={!state.ready}>FIE (minu){state.ready ? '' : ' — täida enne Seaded → FIE'}</option>
      </Select>
      <p className="form-hint">FIE kehtib ainult sinu enda tundidele selle õpilasega; teiste õpetajate tunnid jäävad ettevõtte arvetele. Juba väljastatud arved ei muutu.</p>
      <div className="form-actions"><Button variant="secondary" loading={busy} disabled={value === state.current} onClick={save}>Salvesta</Button></div>
      {message ? <p className="form-hint" role="status">{message}</p> : null}
    </>}
  </Card>;
}
