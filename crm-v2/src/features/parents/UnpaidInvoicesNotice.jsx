import { CheckCircle2, CreditCard, Receipt } from 'lucide-react';
import { useEffect, useState } from 'react';
import { invoiceDeliveryApi } from '../../services/firebase/financeApi.js';
import { invoicePaymentClaimsService, PAYMENT_CLAIM_NOTE_MAX } from '../../services/firebase/invoicePaymentClaims.js';
import { linkpayApi } from '../../services/firebase/linkpayApi.js';
import { invoiceBalanceCents, isInvoiceOverdue } from '../students/studentFinance.js';
import InvoicePdfButton from './InvoicePdfButton.jsx';
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
 * Owner 2026-11-09: „Arve PDF” (the invoice document, server-made for the owner only) and „Maksin ära” — a notice to the
 * school (invoicePaymentClaims), NOT a payment: the invoice stays unpaid until the administrator finds the money in the
 * bank and adds the payment. After it the line says „Teade saadetud, kontrollime”. Nothing is e-mailed.
 */
export default function UnpaidInvoicesNotice({ invoices = [], nameOf = () => '', readOnly = false, onOpenInvoices, api = linkpayApi, claimsRepository = invoicePaymentClaimsService, pdfApi = invoiceDeliveryApi, go = (url) => globalThis.location.assign(url), today = new Date() }) {
  const lines = unpaidInvoices(invoices, today);
  const [canPay, setCanPay] = useState(false);
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const [claims, setClaims] = useState(() => new Map());
  const [claiming, setClaiming] = useState('');
  const [claimNote, setClaimNote] = useState('');
  const [claimBusy, setClaimBusy] = useState(false);
  const [claimError, setClaimError] = useState('');
  const wanted = lines.length > 0 && !readOnly;
  const idsKey = lines.map((line) => line.invoice.id).join('|');
  useEffect(() => {
    if (!wanted) return undefined;
    let live = true;
    Promise.resolve().then(() => api.config()).then((config) => live && setCanPay(Boolean(config?.enabled))).catch(() => {});
    return () => { live = false; };
  }, [api, wanted]);
  useEffect(() => {
    if (!idsKey) return undefined;
    let live = true;
    Promise.resolve().then(() => claimsRepository.forInvoices(idsKey.split('|'))).then((found) => live && setClaims(found instanceof Map ? found : new Map())).catch(() => {});
    return () => { live = false; };
  }, [claimsRepository, idsKey]);
  if (!lines.length) return null;

  const sendClaim = async (invoice) => {
    setClaimBusy(true); setClaimError('');
    try {
      const claim = await claimsRepository.create(invoice.id, claimNote, undefined, invoice);
      setClaims((current) => new Map(current).set(invoice.id, claim));
      setClaiming(''); setClaimNote('');
    } catch (caught) {
      // another parent of the family may have sent it a moment ago: then it is there and the line says so
      const existing = await Promise.resolve().then(() => claimsRepository.forInvoices([invoice.id])).catch(() => new Map());
      if (existing?.get?.(invoice.id)) { setClaims((current) => new Map(current).set(invoice.id, existing.get(invoice.id))); setClaiming(''); setClaimNote(''); }
      else setClaimError(caught?.message || 'Teadet ei saanud saata.');
    } finally { setClaimBusy(false); }
  };

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
          {/* an FIE invoice (the owner's own FIE): bank transfer to the account on the invoice, no card payment */}
          {invoice.issuer === 'fie' && invoice.issuerDetails?.iban ? <small className="pd-pay__iban">Pangaülekanne: {invoice.issuerDetails.name}, {invoice.issuerDetails.iban}</small> : null}
        </div>
        {canPay && invoice.issuer !== 'fie' && !readOnly && !claims.get(invoice.id) ? <button type="button" className="pd-pay__btn" disabled={Boolean(busy)} onClick={() => pay(invoice)}>
          <CreditCard size={16} aria-hidden="true" /> {busy === invoice.id ? 'Avan…' : 'Maksa arve'}
        </button> : null}
        <div className="pd-pay__more">
          {readOnly ? null : <InvoicePdfButton invoice={invoice} api={pdfApi} />}
          {claims.get(invoice.id) ? <span className="pd-pay__claimed" role="status"><CheckCircle2 size={16} aria-hidden="true" /> Teade saadetud, kontrollime<span className="pd-ru" lang="ru"> · сообщение отправлено, проверяем</span></span>
            : !readOnly && claiming !== invoice.id ? <button type="button" className="pd-linkbtn" onClick={() => { setClaimError(''); setClaimNote(''); setClaiming(invoice.id); }}>Maksin ära<span className="pd-ru" lang="ru"> · я оплатил(а)</span></button> : null}
        </div>
        {claiming === invoice.id && !claims.get(invoice.id) ? <form className="pd-pay__claim" aria-label={`Teade: arve ${invoice.num || ''} on makstud`} onSubmit={(event) => { event.preventDefault(); sendClaim(invoice); }}>
          <p>Anname koolile teada, et maksite arve {invoice.num || ''} ära. Arve jääb tasumata, kuni kool näeb makset pangas.<span className="pd-ru" lang="ru"> Счёт будет отмечен оплаченным, когда школа увидит платёж в банке.</span></p>
          <label htmlFor={`pd-claim-${invoice.id}`}>Märkus (soovi korral) — nt makse kuupäev või maksja nimi</label>
          <textarea id={`pd-claim-${invoice.id}`} rows="2" maxLength={PAYMENT_CLAIM_NOTE_MAX} value={claimNote} disabled={claimBusy} onChange={(event) => setClaimNote(event.target.value)} />
          {claimError ? <p className="form-error" role="alert">{claimError}</p> : null}
          <div className="pd-pay__claim-actions">
            <button type="submit" className="pd-pay__btn" disabled={claimBusy}>{claimBusy ? 'Saadan…' : 'Saada teade'}</button>
            <button type="button" className="pd-linkbtn" disabled={claimBusy} onClick={() => { setClaiming(''); setClaimError(''); }}>Loobu</button>
          </div>
        </form> : null}
      </li>;
    })}</ul>
    {error ? <p className="form-error" role="alert">{error}</p> : null}
    {onOpenInvoices ? <button type="button" className="pd-linkbtn" data-preview-allowed onClick={onOpenInvoices}>Vaata arveid<span className="pd-ru" lang="ru"> · счета</span></button> : null}
  </section>;
}
