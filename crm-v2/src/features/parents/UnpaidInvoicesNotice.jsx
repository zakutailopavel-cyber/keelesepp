import { CreditCard, Receipt } from 'lucide-react';
import { useEffect, useState } from 'react';
import { linkpayApi } from '../../services/firebase/linkpayApi.js';
import { invoiceBalanceCents, isInvoiceOverdue } from '../students/studentFinance.js';
import { isRealInvoice } from './parentHome.js';

const money = (cents) => new Intl.NumberFormat('et-EE', { style: 'currency', currency: 'EUR' }).format((Number(cents) || 0) / 100);
// „10.11” as the owner wrote it; the year only when it is not this year's
const shortDate = (iso, today = new Date()) => {
  const [year, month, dayOfMonth] = String(iso || '').slice(0, 10).split('-');
  if (!year || !month || !dayOfMonth) return '';
  return `${dayOfMonth}.${month}${Number(year) === today.getFullYear() ? '' : `.${year}`}`;
};

export function unpaidInvoices(invoices = [], today = new Date()) {
  return invoices
    .filter((invoice) => isRealInvoice(invoice) && invoiceBalanceCents(invoice) > 0)
    .map((invoice) => ({ invoice, overdue: isInvoiceOverdue(invoice, today), cents: invoiceBalanceCents(invoice) }))
    // the late ones first, then by the due date
    .sort((a, b) => Number(b.overdue) - Number(a.overdue) || String(a.invoice.due || '9999').localeCompare(String(b.invoice.due || '9999')));
}

/**
 * „Arve ootab tasumist” (owner 2026-11-09): the family's unpaid invoices at the very top of the parent's home, one line
 * each, in the CRM only (no e-mails). Invoice data only — never how many paid lessons are left (admin and accountant only,
 * owner 2026-11-02). Actions are the existing ones: „Maksa arve” (LHV LinkPay) when the school has card payments on, and
 * „Vaata arveid” opening the family's invoice list below.
 */
export default function UnpaidInvoicesNotice({ invoices = [], nameOf = () => '', readOnly = false, onOpenInvoices, api = linkpayApi, go = (url) => globalThis.location.assign(url), today = new Date() }) {
  const lines = unpaidInvoices(invoices, today);
  const [canPay, setCanPay] = useState(false);
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const wanted = lines.length > 0 && !readOnly;
  useEffect(() => {
    if (!wanted) return undefined;
    let live = true;
    Promise.resolve().then(() => api.config()).then((config) => live && setCanPay(Boolean(config?.enabled))).catch(() => {});
    return () => { live = false; };
  }, [api, wanted]);
  if (!lines.length) return null;

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
  const anyOverdue = lines.some((line) => line.overdue);

  return <section className={`pd-pay ${anyOverdue ? 'is-overdue' : ''}`} aria-label="Tasumata arved">
    <ul className="pd-pay__list">{lines.map(({ invoice, overdue, cents }) => {
      const due = shortDate(invoice.due, today);
      const name = nameOf(invoice);
      return <li key={invoice.id} className={overdue ? 'is-overdue' : ''}>
        <Receipt size={18} aria-hidden="true" />
        <div className="pd-pay__text">
          <strong>{['Arve ootab tasumist', invoice.num || '', money(cents)].filter(Boolean).join(' · ')}
            {due ? <> · <span className={overdue ? 'pd-pay__late' : ''}>{overdue ? `tähtaeg möödus ${due}` : `tähtaeg ${due}`}</span></> : null}</strong>
          <small>{name ? `${name} · ` : ''}<span lang="ru">{overdue ? 'срок оплаты прошёл' : 'счёт ждёт оплаты'}</span></small>
        </div>
        {canPay && !readOnly ? <button type="button" className="pd-pay__btn" disabled={Boolean(busy)} onClick={() => pay(invoice)}>
          <CreditCard size={16} aria-hidden="true" /> {busy === invoice.id ? 'Avan…' : 'Maksa arve'}
        </button> : null}
      </li>;
    })}</ul>
    {error ? <p className="form-error" role="alert">{error}</p> : null}
    {onOpenInvoices ? <button type="button" className="pd-linkbtn" data-preview-allowed onClick={onOpenInvoices}>Vaata arveid<span className="pd-ru" lang="ru"> · счета</span></button> : null}
  </section>;
}
