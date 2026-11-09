import { FileDown } from 'lucide-react';
import { useState } from 'react';
import { invoiceDeliveryApi } from '../../services/firebase/financeApi.js';
import { base64DocumentBlob } from '../../services/firebase/paymentDocuments.js';

// hands the PDF to the browser as a file (works after the server's answer, where a new window would be blocked)
export function saveDocument(pdf, invoice) {
  const url = pdf.url || URL.createObjectURL(base64DocumentBlob(pdf));
  const link = globalThis.document.createElement('a');
  link.href = url;
  link.download = pdf.filename || `Arve ${invoice?.num || invoice?.id || ''}.pdf`.trim();
  link.rel = 'noopener';
  globalThis.document.body.appendChild(link);
  link.click();
  link.remove();
  if (!pdf.url) globalThis.setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

/**
 * „Arve PDF” in the parent's cabinet (owner 2026-11-09): the same PDF the administrator prints and the e-mail carries,
 * made by the server (invoiceApi /pdf) only for the invoice's owner — never another family's invoice.
 */
export default function InvoicePdfButton({ invoice, api = invoiceDeliveryApi, save = saveDocument, className = 'pd-linkbtn' }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const open = async () => {
    setBusy(true); setError('');
    try { save(await api.pdf(invoice.id), invoice); }
    catch (caught) { setError(caught?.message || 'Arve PDF-i ei saanud avada.'); }
    finally { setBusy(false); }
  };
  return <>
    <button type="button" className={className} disabled={busy} onClick={open} aria-label={`Arve ${invoice.num || ''} PDF`.replace(/\s+/g, ' ')}>
      <FileDown size={16} aria-hidden="true" /> {busy ? 'Avan…' : 'Arve PDF'}
    </button>
    {error ? <span className="form-error" role="alert">PDF-i ei saanud avada: {error}</span> : null}
  </>;
}
