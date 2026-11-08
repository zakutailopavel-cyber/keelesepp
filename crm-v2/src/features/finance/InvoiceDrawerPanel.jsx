import { CreditCard, Printer } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../app/AuthContext.jsx';
import { Badge, Button, EmptyState, ErrorState, LoadingState } from '../../components/ui/index.js';
import { useAsyncData } from '../../hooks/useAsyncData.js';
import { financeApi, invoiceDeliveryApi } from '../../services/firebase/financeApi.js';
import { invoicesService } from '../../services/firebase/invoices.js';
import { base64DocumentBlob } from '../../services/firebase/paymentDocuments.js';
import { hasAnyRole, ROLES } from '../../utils/roles.js';
import { displayDate } from './finance.js';
import { FINANCE_STATUS_LABELS, financeRowState } from './financeRows.js';
import { invoiceShownEmail } from './invoicePayer.js';
import PaymentDialog from './PaymentDialog.jsx';
import { isOverpaymentRefusal, paymentRecordedNotice, recordPaymentWithAdvance } from './paymentEntry.js';

const money = (cents) => new Intl.NumberFormat('et-EE', { style: 'currency', currency: 'EUR' }).format(Number(cents || 0) / 100);
const METHOD = { bank: 'pangaülekanne', cash: 'sularaha', card: 'kaardimakse', other: 'muu' };
const paymentCents = (payment) => Math.round(Number(payment.amountCents ?? Number(payment.amount || 0) * 100) || 0);
const numberOf = (invoice) => invoice?.num || invoice?.number || invoice?.invoiceNumber || '';

// the invoice's PDF inside the panel (the server makes it for the administrator only, as „Prindi”)
function InvoicePdf({ invoiceId, deliveryRepository }) {
  const state = useAsyncData(() => deliveryRepository.pdf(invoiceId), [deliveryRepository, invoiceId]);
  const url = useMemo(() => (state.data ? (state.data.url || URL.createObjectURL(base64DocumentBlob(state.data))) : ''), [state.data]);
  useEffect(() => (url && !state.data?.url ? () => URL.revokeObjectURL(url) : undefined), [url, state.data?.url]);
  if (state.error) return <p className="form-error" role="alert">Arve PDF-i ei saanud avada: {state.error.message || 'viga'}</p>;
  if (!url) return <LoadingState label="Valmistan arve eelvaadet…" />;
  return <>
    <iframe className="invoice-drawer__pdf" src={url} title={`Arve ${state.data.filename || ''}`} />
    <div className="invoice-drawer__actions"><a className="button button--secondary" href={url} target="_blank" rel="noopener noreferrer"><Printer size={16} /> Prindi PDF</a></div>
  </>;
}

/**
 * One invoice in the side drawer (owner 2026-11-09: right-click → „Ava arve (siinsamas)” in Finantsid): the sums,
 * the payments, the e-mail state and, for the administrator, the document itself and „Lisa makse” — the same window
 * and the same recording path as the month's list (PaymentDialog.jsx, paymentEntry.js). The accountant sees the
 * invoice; the payments and the PDF are the administrator's, as on the page.
 */
export default function InvoiceDrawerPanel({ invoiceId, invoiceRepository = invoicesService, financeRepository = financeApi, deliveryRepository = invoiceDeliveryApi }) {
  const { user } = useAuth();
  const isAdmin = hasAnyRole(user?.roles || [], [ROLES.ADMIN]);
  const state = useAsyncData(() => invoiceRepository.get(invoiceId), [invoiceRepository, invoiceId]);
  const [paying, setPaying] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [overpaymentQuestion, setOverpaymentQuestion] = useState('');
  const [notice, setNotice] = useState('');

  if (!state.data) {
    if (state.error) return <div className="entity-drawer__note"><ErrorState message={state.error.code === 'permission-denied' ? 'Seda arvet ei saa sinu kontoga avada.' : state.error.message} onRetry={state.reload} /></div>;
    if (state.loading) return <LoadingState label="Laen arvet…" />;
    return <div className="entity-drawer__note"><EmptyState title="Arvet ei leitud" description="See võib olla kustutatud. Ava Finantsid." /></div>;
  }
  const invoice = state.data;
  const row = financeRowState(invoice);
  const [label, tone] = row.status === 'cancelled' ? ['Tühistatud', 'neutral'] : FINANCE_STATUS_LABELS[row.status] || ['—', 'neutral'];
  const number = numberOf(invoice);
  const payments = Array.isArray(invoice.payments) ? invoice.payments : [];
  const email = invoiceShownEmail(invoice);
  const canPay = isAdmin && row.balanceCents > 0 && row.status !== 'cancelled';

  const recordPayment = async (form) => {
    setBusy(true); setError(''); setOverpaymentQuestion('');
    try {
      const outcome = await recordPaymentWithAdvance(financeRepository, invoice.id, form);
      setPaying(false); setNotice(paymentRecordedNotice(outcome, number)); await state.reload();
    } catch (caught) {
      // more than the open balance (another person may have just registered it): ask, the server records nothing yet
      if (isOverpaymentRefusal(caught)) setOverpaymentQuestion(caught.message);
      else setError(caught.message || 'Makse registreerimine ebaõnnestus.');
    } finally { setBusy(false); }
  };

  return <div className="invoice-drawer">
    <header className="invoice-drawer__head">
      <span className="eyebrow">Arve {number || '—'}</span>
      <h2>{invoice.studentName || invoice.payerName || '—'} <Badge tone={tone}>{label}</Badge></h2>
      <p>{[invoice.payerName && invoice.payerName !== invoice.studentName ? `Maksja: ${invoice.payerName}` : '', email, invoice.subject].filter(Boolean).join(' · ')}</p>
    </header>
    {notice ? <p className="lp-hint" role="status">{notice}</p> : null}
    <dl className="invoice-drawer__sums">
      <div><dt>Summa</dt><dd>{money(row.amountCents)}</dd></div>
      <div><dt>Makstud</dt><dd>{money(row.paidCents)}</dd></div>
      <div><dt>Jääk</dt><dd>{money(row.balanceCents)}</dd></div>
    </dl>
    <p className="invoice-drawer__dates"><span>Kuupäev: <b>{displayDate(invoice.date || invoice.createdAt)}</b></span><span>Tähtaeg: <b>{displayDate(invoice.due || invoice.dueDate)}</b></span>{invoice.emailStatus ? <span>E-post: <b>{invoice.emailStatus === 'sent' ? 'saadetud' : invoice.emailStatus === 'failed' ? 'ebaõnnestus' : invoice.emailStatus}</b></span> : null}</p>
    {canPay ? <div className="invoice-drawer__actions"><Button onClick={() => { setError(''); setNotice(''); setPaying(true); }}><CreditCard size={16} /> Lisa makse</Button></div> : null}
    <section aria-label="Maksed">
      <h3>Maksed</h3>
      {payments.length ? <ul className="invoice-drawer__payments">{payments.map((payment, index) => <li key={payment.id || payment.requestId || index}><span>{displayDate(payment.paidAt || payment.date)}{payment.method ? ` · ${METHOD[payment.method] || payment.method}` : ''}{payment.reference ? ` · ${payment.reference}` : ''}</span><strong>{money(paymentCents(payment))}</strong></li>)}</ul> : <p className="lp-hint">{row.paidCents ? 'Makstud (makse üksikasju arvel pole).' : 'Makseid veel pole.'}</p>}
    </section>
    {isAdmin ? <section aria-label="Arve dokument"><h3>Arve</h3><InvoicePdf invoiceId={invoice.id} deliveryRepository={deliveryRepository} /></section> : <p className="lp-hint">Arve PDF-i ja makse lisamise teeb administraator.</p>}
    <PaymentDialog key={paying ? `pay-${invoice.id}` : 'pay-closed'} invoice={paying ? invoice : null} busy={busy} error={paying ? error : ''} overpaymentQuestion={overpaymentQuestion} onDismissOverpayment={() => setOverpaymentQuestion('')} onClose={() => { if (!busy) { setPaying(false); setError(''); setOverpaymentQuestion(''); } }} onSubmit={recordPayment} />
  </div>;
}
