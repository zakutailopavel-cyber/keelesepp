import { CreditCard } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Card } from '../../components/ui/index.js';
import { linkpayApi } from '../../services/firebase/linkpayApi.js';
import { invoiceBalanceCents, isInvoiceOverdue } from '../students/studentFinance.js';
import './payments.css';

const money = (cents) => new Intl.NumberFormat('et-EE', { style: 'currency', currency: 'EUR' }).format((Number(cents) || 0) / 100);
const day = (value) => (value ? new Date(`${String(value).slice(0, 10)}T12:00:00`).toLocaleDateString('et-EE', { day: 'numeric', month: 'short' }) : '');

/**
 * The family's / student's open invoices with „Maksa arve” (LHV LinkPay). Shown only when the school has switched card
 * payments on; the button asks the server for a fresh signed link for the invoice's current balance.
 */
export default function OpenInvoicesCard({ invoices = [], api = linkpayApi, go = (url) => globalThis.location.assign(url), readOnly = false }) {
  const [enabled, setEnabled] = useState(false);
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  useEffect(() => {
    let live = true;
    api.config().then((config) => live && setEnabled(Boolean(config?.enabled))).catch(() => {});
    return () => { live = false; };
  }, [api]);

  const open = invoices
    .filter((invoice) => invoice.status !== 'Tühistatud' && invoiceBalanceCents(invoice) > 0)
    .sort((a, b) => String(a.due || '').localeCompare(String(b.due || '')));
  if (!enabled || !open.length) return null;

  const pay = async (invoice) => {
    setError('');
    setBusy(invoice.id);
    try {
      const result = await api.startForInvoice(invoice.id);
      go(result.url);
    } catch (requestError) {
      setError(requestError?.message || 'Makset ei saanud alustada.');
      setBusy('');
    }
  };

  return <Card>
    <div className="section-heading"><div><span className="eyebrow">Arved</span><h2>Tasumata arved</h2></div></div>
    <div className="open-invoices">{open.map((invoice) => {
      const overdue = isInvoiceOverdue(invoice);
      return <article key={invoice.id} className={`open-invoice ${overdue ? 'is-overdue' : ''}`}>
        <div><strong>Arve {invoice.num}</strong><small>{[invoice.studentName, invoice.subject, invoice.due ? `${overdue ? 'tähtaeg oli' : 'tähtaeg'} ${day(invoice.due)}` : ''].filter(Boolean).join(' · ')}</small></div>
        <strong className="open-invoice__sum">{money(invoiceBalanceCents(invoice))}</strong>
        {readOnly ? null : <button type="button" className="open-invoice__pay" disabled={Boolean(busy)} onClick={() => pay(invoice)}><CreditCard size={16} /> {busy === invoice.id ? 'Avan…' : 'Maksa arve'}</button>}
      </article>;
    })}</div>
    {error ? <p className="form-error" role="alert">{error}</p> : null}
  </Card>;
}
