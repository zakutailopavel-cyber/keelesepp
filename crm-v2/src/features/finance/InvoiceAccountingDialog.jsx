import { BookCheck, BookX } from 'lucide-react';
import { useState } from 'react';
import { Button, Modal } from '../../components/ui/index.js';

const numberOf = (invoice) => invoice?.num || invoice?.number || invoice?.invoiceNumber || '';
const stamp = (iso) => {
  const date = new Date(iso || '');
  return Number.isNaN(date.getTime()) ? '' : date.toLocaleString('et-EE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};

// the small icon on an invoice row, beside the note icon: administrator and bookkeeper
export function InvoiceAccountingButton({ invoice, onOpen }) {
  const excluded = invoice.accountingExcluded === true;
  const num = numberOf(invoice);
  return <button type="button" className={`finance-note-button${excluded ? ' finance-note-button--set' : ''}`}
    title={excluded ? `Ei kuulu raamatupidamisse: ${invoice.accountingExcludedReason || ''}` : 'Märgi: ei kuulu raamatupidamisse'}
    aria-label={excluded ? `Taasta arve ${num} raamatupidamisse` : `Märgi arve ${num}: ei kuulu raamatupidamisse`} onClick={() => onOpen(invoice)}>
    {excluded ? <BookX size={14} aria-hidden="true" /> : <BookCheck size={14} aria-hidden="true" />}
  </button>;
}

// „Ei kuulu raamatupidamisse” (the accountant 2026-10-30): the invoice stays in Finantsid and the student's balance does
// not change; its entries become tombstones and no new ones are made. Undoable while the period is open.
export default function InvoiceAccountingDialog({ invoice, onClose, onSave }) {
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const excluded = invoice?.accountingExcluded === true;
  const num = numberOf(invoice);
  const submit = async (event) => {
    event.preventDefault();
    const clean = reason.trim();
    if (!clean) { setError('Põhjus on kohustuslik.'); return; }
    setBusy(true); setError('');
    try { await onSave(invoice, clean); }
    catch (caught) { setError(caught.message || 'Muudatust ei saanud salvestada.'); setBusy(false); }
  };
  return <Modal open={Boolean(invoice)} title={`${excluded ? 'Taasta raamatupidamisse' : 'Ei kuulu raamatupidamisse'} · ${num}`} onClose={() => { if (!busy) onClose(); }}
    footer={<><Button variant="secondary" disabled={busy} onClick={onClose}>Loobu</Button><Button type="submit" form="invoice-accounting-form" loading={busy}>{excluded ? 'Taasta' : 'Märgi'}</Button></>}>
    <form id="invoice-accounting-form" className="invoice-note-form" onSubmit={submit}>
      <p className="form-hint"><strong>{invoice?.studentName || invoice?.payerName || ''}</strong>{invoice?.desc ? ` · ${invoice.desc}` : ''}</p>
      {excluded ? <p className="invoice-note-meta">Märkis {invoice.accountingExcludedBy?.name || invoice.accountingExcludedBy?.email || 'töötaja'} · {stamp(invoice.accountingExcludedAt)} · „{invoice.accountingExcludedReason || ''}”</p> : null}
      <p className="form-hint">{excluded
        ? 'Arve kanded hakkavad jälle kehtima samade numbritega; puuduvad kanded tekivad järgmisel „Uuenda kanded”.'
        : 'Arve jääb Finantsidesse ja õpilase saldo ei muutu. Arve, selle maksete ja kreeditarvete kanded märgitakse kustutatuks (numbrid jäävad, näha „Näita kustutatud” all) ja uusi kandeid ei tehta. Suletud perioodis ei saa.'}</p>
      <div className="field">
        <label className="field__label" htmlFor="invoice-accounting-reason">Põhjus</label>
        <textarea id="invoice-accounting-reason" className="field__textarea" rows="3" maxLength={300} value={reason} onChange={(event) => setReason(event.target.value)} />
        <small className="field__hint">Jääb auditisse ja kannete ajalukku. Kirjuta neutraalselt: tehniliselt on see arve dokumendi väli.</small>
      </div>
      {error ? <p className="form-error" role="alert">{error}</p> : null}
    </form>
  </Modal>;
}
