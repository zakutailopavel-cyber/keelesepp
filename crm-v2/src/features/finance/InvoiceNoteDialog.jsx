import { StickyNote } from 'lucide-react';
import { useState } from 'react';
import { Button, Modal } from '../../components/ui/index.js';
import { INVOICE_NOTE_MAX } from '../../services/firebase/invoiceNotes.js';

const stamp = (iso) => {
  const date = new Date(iso || '');
  return Number.isNaN(date.getTime()) ? '' : date.toLocaleString('et-EE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};

// the small note icon on an invoice row: filled when there is a note (its text is the tooltip), faint when there is none
export function InvoiceNoteButton({ invoice, note, onOpen }) {
  const text = note?.text || '';
  const num = invoice.num || invoice.number || invoice.invoiceNumber || '';
  return <button type="button" className={`finance-note-button${text ? ' finance-note-button--set' : ''}`} title={text || 'Lisa sisemine märkus'}
    aria-label={text ? `Sisemine märkus arvel ${num}: ${text}` : `Lisa sisemine märkus arvele ${num}`} onClick={() => onOpen(invoice)}>
    <StickyNote size={14} aria-hidden="true" />
  </button>;
}

// „Sisemine märkus” (team 2026-10-29): what the invoice was for — for the administrator and the bookkeeper only. It is
// kept apart from the invoice (invoiceNotes), never printed, never e-mailed, never shown to the student or the parent;
// it does not change the invoice's money, so it can be written on issued and paid invoices too.
export default function InvoiceNoteDialog({ invoice, note, onClose, onSave }) {
  const [text, setText] = useState(note?.text || '');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const num = invoice?.num || invoice?.number || invoice?.invoiceNumber || '';
  const changed = text.trim() !== String(note?.text || '').trim();
  const save = async (event) => {
    event.preventDefault();
    if (!changed) { onClose(); return; }
    setBusy(true); setError('');
    try { await onSave(invoice, text.trim()); }
    catch (caught) { setError(caught.message || 'Märkust ei saanud salvestada.'); setBusy(false); }
  };
  return <Modal open={Boolean(invoice)} title={`Sisemine märkus · ${num}`} onClose={() => { if (!busy) onClose(); }}
    footer={<><Button variant="secondary" disabled={busy} onClick={onClose}>Loobu</Button><Button type="submit" form="invoice-note-form" loading={busy}>Salvesta</Button></>}>
    <form id="invoice-note-form" className="invoice-note-form" onSubmit={save}>
      <p className="form-hint"><strong>{invoice?.studentName || invoice?.payerName || ''}</strong>{invoice?.desc ? ` · ${invoice.desc}` : ''}</p>
      <div className="field">
        <label className="field__label" htmlFor="invoice-note-text">Mille eest arve on (ainult töötajatele)</label>
        <textarea id="invoice-note-text" className="field__textarea" rows="5" maxLength={INVOICE_NOTE_MAX} value={text}
          onChange={(event) => setText(event.target.value)} placeholder="Nt: oktoobri 8 tundi + õpik „Tere!”; kokku lepitud telefonis 12.10" />
        <small className="field__hint">Näevad ainult administraator ja raamatupidaja. Ei ilmu arvele, PDF-ile ega e-kirja ning õpilane ja lapsevanem seda ei näe. {text.length}/{INVOICE_NOTE_MAX}</small>
      </div>
      {note?.updatedAt ? <p className="invoice-note-meta">Viimati muutis {note.updatedByName || 'töötaja'} · {stamp(note.updatedAt)}</p> : null}
      {invoice?.note ? <p className="invoice-note-meta">Arve loomisel lisatud märkus: {invoice.note}</p> : null}
      {error ? <p className="form-error" role="alert">{error}</p> : null}
    </form>
  </Modal>;
}
