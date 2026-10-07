import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock3,
  Mail,
  ReceiptText,
  Search,
  Send,
  Settings2,
  WalletCards,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../app/AuthContext.jsx';
import { Badge, Button, Card, EmptyState, ErrorState, Input, LoadingState, Modal, Select } from '../../components/ui/index.js';
import {
  bankTransactionsService,
  creditNotesService,
  financeApi,
  financialAuditService,
  financialPeriodsService,
  invoiceDeliveryApi,
  invoicesService,
  lessonsService,
  payerCreditsService,
  revenuePlansService,
  studentsService,
} from '../../services/firebase/index.js';
import { hasAnyRole, ROLES } from '../../utils/roles.js';
import { displayDate, validatePayment } from './finance.js';
import { filterFinanceRows, financeRowState, sortFinanceRows, summarizeFinanceRows } from './financeRows.js';
import ManualInvoiceDialog from './ManualInvoiceDialog.jsx';
import MonthlyInvoicePanel from './MonthlyInvoicePanel.jsx';
import PricePrivacyBanner from './PricePrivacyBanner.jsx';
import { defaultBillingMonth, shiftMonth } from './monthlyBilling.js';
import { useFinanceData } from './useFinanceData.js';
import { legacyFinanceDestination } from './financeSettingsNavigation.js';
import './financeMonth.css';
import './manualInvoice.css';

const money = (cents) => new Intl.NumberFormat('et-EE', { style: 'currency', currency: 'EUR' }).format(Number(cents || 0) / 100);
const today = () => new Date().toISOString().slice(0, 10);
const STATUS = {
  unpaid: ['Tasumata', 'neutral'], partial: ['Osaliselt', 'info'], overdue: ['Üle tähtaja', 'danger'],
  paid: ['Makstud', 'success'], credit: ['Krediteeritud', 'neutral'], 'email-failed': ['E-post ebaõnnestus', 'danger'], 'no-show': ['Puudumine', 'warning'],
};

function PaymentDialog({ invoice, busy, error, onClose, onSubmit }) {
  const state = financeRowState(invoice || {});
  const [form, setForm] = useState(() => ({
    amount: (state.balanceCents / 100).toFixed(2), paidAt: today(), method: 'bank',
    reference: invoice?.paymentReference || invoice?.num || invoice?.number || '', note: '',
  }));
  const [errors, setErrors] = useState({});
  const submit = (event) => {
    event.preventDefault();
    const validation = validatePayment(form);
    setErrors(validation.errors);
    if (validation.valid) onSubmit({ ...form, amount: validation.amount });
  };
  return (
    <Modal open={Boolean(invoice)} title={`Registreeri makse · ${invoice?.studentName || ''}`} onClose={onClose}
      footer={<><Button variant="secondary" disabled={busy} onClick={onClose}>Loobu</Button><Button type="submit" form="finance-month-payment" loading={busy}>Registreeri</Button></>}>
      <form id="finance-month-payment" className="form-grid" onSubmit={submit}>
        <Input label="Summa (€)" type="number" min="0.01" step="0.01" value={form.amount} error={errors.amount} onChange={(event) => setForm({ ...form, amount: event.target.value })} />
        <Input label="Makse kuupäev" type="date" value={form.paidAt} error={errors.paidAt} onChange={(event) => setForm({ ...form, paidAt: event.target.value })} />
        <Select label="Makseviis" value={form.method} onChange={(event) => setForm({ ...form, method: event.target.value })}><option value="bank">Pangaülekanne</option><option value="cash">Sularaha</option><option value="card">Kaardimakse</option><option value="other">Muu</option></Select>
        <Input label="Viide" value={form.reference} onChange={(event) => setForm({ ...form, reference: event.target.value })} />
        {error ? <p className="form-error form-grid__wide" role="alert">{error}</p> : null}
      </form>
    </Modal>
  );
}

export default function FinanceMonthPage({
  invoiceRepository = invoicesService,
  financeRepository = financeApi,
  deliveryRepository = invoiceDeliveryApi,
  planRepository = revenuePlansService,
  studentRepository = studentsService,
  lessonRepository = lessonsService,
  bankRepository = bankTransactionsService,
  periodRepository = financialPeriodsService,
  creditRepository = payerCreditsService,
  creditNoteRepository = creditNotesService,
  auditRepository = financialAuditService,
  monthlyInvoiceProps,
  showPrivacyBanner = true,
}) {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const canManage = hasAnyRole(user.roles, [ROLES.ADMIN]);
  const state = useFinanceData({ canManageFinance: canManage, invoiceRepository, planRepository, studentRepository, lessonRepository, bankRepository, periodRepository, creditRepository, creditNoteRepository, auditRepository });
  const [month, setMonth] = useState(() => defaultBillingMonth());
  const [status, setStatus] = useState(() => new globalThis.URLSearchParams(location.search).get('status') || 'all');
  const [query, setQuery] = useState('');
  const [paymentInvoice, setPaymentInvoice] = useState(null);
  const [paymentBusy, setPaymentBusy] = useState(false);
  const [actionBusy, setActionBusy] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const destination = legacyFinanceDestination(location.hash);
    if (destination) navigate(destination, { replace: true });
  }, [location.hash, navigate]);

  const invoices = useMemo(() => state.data?.invoices || [], [state.data?.invoices]);
  const monthInvoices = useMemo(() => filterFinanceRows(invoices, { month }), [invoices, month]);
  const summary = useMemo(() => summarizeFinanceRows(monthInvoices), [monthInvoices]);
  const rows = useMemo(() => sortFinanceRows(filterFinanceRows(monthInvoices, { status, query }), 'dueDate'), [monthInvoices, query, status]);

  const announce = (value) => { setMessage(value); setError(''); };
  const deliver = async (invoice, mode) => {
    setActionBusy(`${mode}-${invoice.id}`); setError('');
    try {
      if (mode === 'remind') await deliveryRepository.remind(invoice.id);
      else await deliveryRepository.send(invoice.id);
      announce(mode === 'remind' ? 'Maksemeeldetuletus saadeti.' : 'Arve saadeti maksjale.');
      await state.reload();
    } catch (caught) { setError(caught.message || 'E-kirja saatmine ebaõnnestus.'); }
    finally { setActionBusy(''); }
  };
  const recordPayment = async (form) => {
    setPaymentBusy(true); setError('');
    try {
      await financeRepository.recordPayment(paymentInvoice.id, form);
      setPaymentInvoice(null); announce('Makse registreeriti.'); await state.reload();
    } catch (caught) { setError(caught.message || 'Makse registreerimine ebaõnnestus.'); }
    finally { setPaymentBusy(false); }
  };

  if (state.loading) return <LoadingState label="Laen finantsandmeid…" />;
  if (state.error) return <ErrorState message={state.error.message} onRetry={state.reload} />;

  return (
    <div className="page-content finance-month-page">
      {showPrivacyBanner ? <PricePrivacyBanner /> : null}
      <header className="finance-month-hero">
        <div><span className="eyebrow">Finantsid</span><h1>Kuu arveldus</h1><p>Koosta arved, jälgi laekumisi ja lahenda erandid ühes vaates.</p></div>
        <div className="finance-month-hero__actions"><Link className="button button--secondary" to="/finance/seaded"><Settings2 size={17} /> Seaded</Link><Link className="button button--secondary" to="/finance/vana">Vana vaade</Link>{canManage ? <ManualInvoiceDialog onCreated={async () => { announce('Arve loodi.'); await state.reload(); }} /> : null}</div>
      </header>

      <div className="finance-month-switcher">
        <Button variant="secondary" aria-label="Eelmine kuu" onClick={() => setMonth(shiftMonth(month, -1))}><ArrowLeft size={17} /></Button>
        <Input label="Arvelduskuu" type="month" value={month} onChange={(event) => setMonth(event.target.value)} />
        <Button variant="secondary" aria-label="Järgmine kuu" onClick={() => setMonth(shiftMonth(month, 1))}><ArrowRight size={17} /></Button>
      </div>

      {message ? <div className="success-notice" role="status">{message}<button aria-label="Sulge teade" onClick={() => setMessage('')}>×</button></div> : null}
      {error && !paymentInvoice ? <div className="finance-month-alert" role="alert"><AlertTriangle size={18} />{error}</div> : null}

      <section className="finance-month-metrics" aria-label="Kuu kokkuvõte">
        <Card><span><ReceiptText size={18} /> Arveid</span><strong>{summary.count}</strong><small>{money(summary.amountCents)} kokku</small></Card>
        <Card><span><CheckCircle2 size={18} /> Laekunud</span><strong>{money(summary.paidCents)}</strong><small>{summary.byStatus.paid} täielikult makstud</small></Card>
        <Card><span><Clock3 size={18} /> Laekumata</span><strong>{money(summary.balanceCents)}</strong><small>{summary.byStatus.overdue} üle tähtaja</small></Card>
        <Card><span><WalletCards size={18} /> Ette makstud</span><strong>{money((state.data.credits || []).reduce((sum, item) => sum + Number(item.balanceCents || 0), 0))}</strong><small>kantakse järgmisele arvele</small></Card>
      </section>

      {canManage ? <MonthlyInvoicePanel students={state.data.students} plans={state.data.plans} lessons={state.data.lessons} invoices={invoices} user={user} month={month} onMonthChange={setMonth} planRepository={planRepository} studentRepository={studentRepository} lessonRepository={lessonRepository} deliveryApi={deliveryRepository} onChanged={state.reload} {...monthlyInvoiceProps} /> : null}

      <Card className="finance-month-ledger">
        <div className="finance-month-ledger__heading"><div><span className="eyebrow">Arved</span><h2>Kuu arved ja maksed</h2></div><span>{rows.length} kirjet</span></div>
        <div className="finance-month-filters">
          <Input label="Otsi" type="search" placeholder="Õpilane, maksja või arve number" value={query} onChange={(event) => setQuery(event.target.value)} icon={<Search size={17} />} />
          <Select label="Olek" value={status} onChange={(event) => setStatus(event.target.value)}><option value="all">Kõik olekud</option>{Object.entries(STATUS).map(([value, [label]]) => <option key={value} value={value}>{label}</option>)}</Select>
        </div>
        {!rows.length ? <EmptyState title="Selle kuu arveid ei ole" description="Koosta arved ülal olevast kuuplaanist või vali teine kuu." /> : <div className="finance-month-table" role="table" aria-label={`Arved ${month}`}>
          <div className="finance-month-table__head" role="row"><span>Õpilane</span><span>Arve</span><span>Tähtaeg</span><span>Summa</span><span>Jääk</span><span>Olek</span><span>Tegevused</span></div>
          {rows.map((invoice) => { const row = financeRowState(invoice); const [label, tone] = STATUS[row.status]; return <div className="finance-month-table__row" role="row" key={invoice.id}>
            <span><strong>{invoice.studentName || invoice.payerName || '—'}</strong><small>{invoice.payerEmail || ''}</small></span>
            <span>{invoice.num || invoice.number || invoice.invoiceNumber || '—'}</span><span>{displayDate(invoice.due || invoice.dueDate)}</span><span>{money(row.amountCents)}</span><span><strong>{money(row.balanceCents)}</strong></span><span><Badge tone={tone}>{label}</Badge></span>
            <span className="finance-month-table__actions">{canManage && row.balanceCents ? <Button variant="secondary" onClick={() => { setError(''); setPaymentInvoice(invoice); }}>Makse</Button> : null}<Button variant="secondary" loading={actionBusy === `send-${invoice.id}`} onClick={() => deliver(invoice, 'send')}><Send size={15} /><span>Saada</span></Button>{row.status === 'overdue' ? <Button variant="secondary" loading={actionBusy === `remind-${invoice.id}`} onClick={() => deliver(invoice, 'remind')}><Mail size={15} /><span>Meeldetuletus</span></Button> : null}</span>
          </div>; })}
        </div>}
      </Card>
      <PaymentDialog key={paymentInvoice?.id || 'closed'} invoice={paymentInvoice} busy={paymentBusy} error={paymentInvoice ? error : ''} onClose={() => { if (!paymentBusy) { setPaymentInvoice(null); setError(''); } }} onSubmit={recordPayment} />
    </div>
  );
}
