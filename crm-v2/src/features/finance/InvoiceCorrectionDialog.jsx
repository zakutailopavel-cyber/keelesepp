import { useState } from 'react';
import { Button, Modal } from '../../components/ui/index.js';
import { financeRequestId } from '../../services/firebase/financeApi.js';
import { invoiceHasLessonLines, invoiceOpenCreditCents } from './invoiceActions.js';
import './financeDebts.css';

const money = (cents) => new Intl.NumberFormat('et-EE', { style: 'currency', currency: 'EUR' }).format(Number(cents || 0) / 100);
const eurosInput = (cents) => (Number(cents || 0) / 100).toFixed(2).replace('.', ',');
const parseCents = (value) => Math.round(Number(String(value || '').replace(/\s/g, '').replace(',', '.')) * 100);

function localIsoDate(offsetDays = 0) {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

const PAYER_FIELDS = [
  ['payerName', 'Maksja nimi', 'text'],
  ['payerEmail', 'Maksja e-post', 'email'],
  ['payerRegCode', 'Registrikood (ettevõttel)', 'text'],
  ['payerAddress', 'Maksja aadress', 'text'],
];

// Owner decisions 2026-10-23: an issued invoice is never overwritten.
// mode 'full'    → „Krediteeri kogu arve”: one credit note for the whole open amount;
// mode 'correct' → „Paranda summa või maksja”: the same credit note + a new invoice that the family gets.
// onSubmit({ reason, requestId }) or onSubmit({ amount, payer, due, reason, requestId })
export default function InvoiceCorrectionDialog({ invoice, mode, busy = false, error = '', onClose, onSubmit }) {
  const openCents = invoiceOpenCreditCents(invoice || {});
  const lessonLines = invoiceHasLessonLines(invoice || {});
  const label = invoice?.num || invoice?.number || '';
  const [requestId] = useState(() => financeRequestId(mode === 'full' ? 'credit_full' : 'invoice_correction'));
  const [reason, setReason] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [amount, setAmount] = useState(eurosInput(openCents));
  const [due, setDue] = useState(localIsoDate(14));
  // old invoices keep the payer in the parent or student fields (the same fallback as the server's invoicePayer)
  const currentPayer = {
    payerName: String(invoice?.payerName || invoice?.parentName || invoice?.studentName || '').trim(),
    payerEmail: String(invoice?.payerEmail || invoice?.parentEmail || '').trim(),
    payerRegCode: String(invoice?.payerRegCode || '').trim(),
    payerAddress: String(invoice?.payerAddress || invoice?.parentAddress || '').trim(),
  };
  const [payer, setPayer] = useState(currentPayer);
  const validReason = reason.trim().length >= 10;
  const newCents = parseCents(amount);
  const amountChanged = !lessonLines && Number.isFinite(newCents) && newCents !== openCents;
  const payerChanged = PAYER_FIELDS.some(([field]) => payer[field].trim() !== currentPayer[field]);
  const amountValid = lessonLines || (Number.isFinite(newCents) && newCents > 0);
  const somethingChanged = mode === 'full' || amountChanged || payerChanged;
  const ready = Boolean(invoice) && validReason && confirmed && amountValid && somethingChanged && (mode === 'full' || payer.payerName.trim()) && !busy;
  const submit = (event) => {
    event.preventDefault();
    if (!ready) return;
    if (mode === 'full') { onSubmit({ reason: reason.trim(), requestId }); return; }
    onSubmit({
      ...(amountChanged ? { amount: (newCents / 100).toFixed(2) } : {}),
      ...(payerChanged ? { payer: Object.fromEntries(PAYER_FIELDS.map(([field]) => [field, payer[field].trim()])) } : {}),
      due,
      reason: reason.trim(),
      requestId,
    });
  };
  const formId = `invoice-correction-${mode}`;
  const title = mode === 'full' ? `Krediteeri kogu arve · ${label}` : `Paranda summa või maksja · ${label}`;
  const submitLabel = mode === 'full' ? 'Krediteeri kogu arve' : 'Loo kreeditarve ja uus arve';
  return <Modal open={Boolean(invoice)} title={title} onClose={onClose}
    footer={<><Button variant="secondary" disabled={busy} onClick={onClose}>Katkesta</Button><Button type="submit" form={formId} loading={busy} disabled={!ready}>{submitLabel}</Button></>}>
    <form id={formId} className="invoice-correction" onSubmit={submit}>
      {mode === 'correct' ? <>
        <div className="field"><label className="field__label" htmlFor={`${formId}-amount`}>Õige summa (€)</label><input id={`${formId}-amount`} className="field__input" inputMode="decimal" value={amount} disabled={busy || lessonLines} onChange={(event) => setAmount(event.target.value)} />{lessonLines ? <small className="field__hint">Tunniridadega arve summa tuleb hinnakirjast — vale tunni jaoks kasuta „Krediteeri üks tund”. Siin saab muuta maksjat.</small> : null}</div>
        {PAYER_FIELDS.map(([field, text, type]) => <div className="field" key={field}><label className="field__label" htmlFor={`${formId}-${field}`}>{text}</label><input id={`${formId}-${field}`} className="field__input" type={type} value={payer[field]} disabled={busy} onChange={(event) => setPayer((current) => ({ ...current, [field]: event.target.value }))} /></div>)}
        <div className="field"><label className="field__label" htmlFor={`${formId}-due`}>Uue arve maksetähtaeg</label><input id={`${formId}-due`} className="field__input" type="date" min={localIsoDate(0)} value={due} disabled={busy} onChange={(event) => setDue(event.target.value)} /></div>
      </> : null}
      <div className="invoice-correction__summary" aria-live="polite">
        <strong>Mis juhtub</strong>
        <ul>
          <li>Luuakse <b>kreeditarve</b> summas <b>{money(openCents)}</b>, mis krediteerib arve {label || '—'} täies ulatuses. Arve ise jääb muutmata ajalukku, selle jääk muutub nulliks.</li>
          {mode === 'full'
            ? <li>Perele <b>uut arvet ei tehta</b> — võlg kaob nimekirjast.</li>
            : <li>Luuakse <b>uus arve</b> summas <b>{money(amountChanged ? newCents : openCents)}</b> maksjale <b>{payer.payerName.trim() || '—'}</b> uue numbriga. Selle arve saab pere — saada see arvete nimekirjast.</li>}
          <li>Raamatupidamisse tekib automaatne kanne{mode === 'full' ? '' : 'd'} järgmisel sünkroonimisel.</li>
        </ul>
        {mode === 'correct' && !somethingChanged ? <p className="invoice-correction__hint">Muuda summat või maksjat — praegu on kõik sama.</p> : null}
      </div>
      <div className="field"><label className="field__label" htmlFor={`${formId}-reason`}>Põhjus</label><textarea id={`${formId}-reason`} className="field__textarea" rows="3" maxLength="500" value={reason} disabled={busy} onChange={(event) => setReason(event.target.value)} placeholder="Miks arve krediteeritakse (vähemalt 10 märki)" />{!validReason ? <small className="field__hint">Põhjus peab olema vähemalt 10 märki — veel {10 - reason.trim().length}.</small> : null}</div>
      <label className="invoice-correction__confirm"><input type="checkbox" checked={confirmed} disabled={busy} onChange={(event) => setConfirmed(event.target.checked)} /> Saan aru: {mode === 'full' ? 'kreeditarvet ei saa tagasi võtta.' : 'kreeditarvet ei saa tagasi võtta ja pere saab uue arve.'}</label>
      {error ? <p className="form-error" role="alert">{error}</p> : null}
    </form>
  </Modal>;
}
