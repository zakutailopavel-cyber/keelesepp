import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock3,
  FilePlus2,
  Printer,
  Mail,
  ReceiptText,
  Search,
  Send,
  Settings2,
  Trash2,
  WalletCards,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
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
import FinanceDebtsPanel from './FinanceDebtsPanel.jsx';
import AdvanceManagementPanel from './AdvanceManagementPanel.jsx';
import DocumentPreviewModal from './DocumentPreviewModal.jsx';
import { legacyFinanceDestination } from './financeSettingsNavigation.js';
import { manualInvoiceApi } from '../../services/firebase/manualInvoiceApi.js';
import { canCancelInvoice } from './invoiceActions.js';
import './financeMonth.css';
import './manualInvoice.css';

const money = (cents) => new Intl.NumberFormat('et-EE', { style: 'currency', currency: 'EUR' }).format(Number(cents || 0) / 100);
const today = () => new Date().toISOString().slice(0, 10);
const STATUS = {
  unpaid: ['Tasumata', 'neutral'], partial: ['Osaliselt', 'info'], overdue: ['Üle tähtaja', 'danger'],
  paid: ['Makstud', 'success'], credit: ['Krediteeritud', 'neutral'], 'email-failed': ['E-post ebaõnnestus', 'danger'], 'no-show': ['Puudumine', 'warning'],
};
const VIEWS = ['invoices', 'paid', 'unpaid', 'credits', 'prepare'];
const creditAvailableCents = (credit) => Number.isInteger(credit?.availableAmountCents)
  ? credit.availableAmountCents : Math.round(Number(credit?.availableAmount || 0) * 100);

function CancelInvoiceDialog({ invoice, busy, error, onClose, onSubmit }) {
  const [reason, setReason] = useState('');
  return <Modal open={Boolean(invoice)} title={`Tühista arve · ${invoice?.num || invoice?.number || ''}`} onClose={onClose}
    footer={<><Button variant="secondary" disabled={busy} onClick={onClose}>Tagasi</Button><Button variant="danger" type="submit" form="finance-month-cancel" loading={busy} disabled={reason.trim().length < 10}>Tühista arve</Button></>}>
    <form id="finance-month-cancel" onSubmit={(event) => { event.preventDefault(); if (reason.trim().length >= 10) onSubmit(reason.trim()); }}>
      <p>Arve eemaldatakse aktiivsest nimekirjast ja summadest. Arve number ning tühistamise põhjus jäävad ajalukku. Seda toimingut ei saa tagasi võtta.</p>
      <div className="field"><label className="field__label" htmlFor="finance-month-cancel-reason">Tühistamise põhjus</label><textarea id="finance-month-cancel-reason" className="field__textarea" rows="3" minLength="10" maxLength="500" required value={reason} onChange={(event) => setReason(event.target.value)} placeholder="Kirjelda, miks arve tühistatakse" /></div>
      {error ? <p className="form-error" role="alert">{error}</p> : null}
    </form>
  </Modal>;
}

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
  manualInvoiceRepository = manualInvoiceApi,
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
  const [activeView, setActiveView] = useState(() => {
    const params = new globalThis.URLSearchParams(location.search);
    const requested = params.get('status') === 'overdue' ? 'unpaid' : (VIEWS.includes(params.get('view')) ? params.get('view') : 'invoices');
    return requested === 'prepare' && !canManage ? 'invoices' : requested;
  });
  const [query, setQuery] = useState('');
  const [paymentInvoice, setPaymentInvoice] = useState(null);
  const [cancelInvoice, setCancelInvoice] = useState(null);
  const [cancelBusy, setCancelBusy] = useState(false);
  const [paymentBusy, setPaymentBusy] = useState(false);
  const [actionBusy, setActionBusy] = useState('');
  const [printBusy, setPrintBusy] = useState('');
  const [documentPreview, setDocumentPreview] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const viewRef = useRef(null);
  const tabRefs = useRef([]);
  const visibleViews = canManage ? VIEWS : VIEWS.slice(0, 4);

  useEffect(() => {
    const destination = legacyFinanceDestination(location.hash);
    if (destination) navigate(destination, { replace: true });
  }, [location.hash, navigate]);

  const invoices = useMemo(() => state.data?.invoices || [], [state.data?.invoices]);
  const monthInvoices = useMemo(() => filterFinanceRows(invoices, { month }).filter((invoice) => invoice.status !== 'Tühistatud'), [invoices, month]);
  const summary = useMemo(() => summarizeFinanceRows(monthInvoices), [monthInvoices]);
  const rows = useMemo(() => sortFinanceRows(filterFinanceRows(monthInvoices.filter((invoice) => {
    const row = financeRowState(invoice);
    if (activeView === 'paid') return row.paidCents > 0;
    if (activeView === 'unpaid') return row.balanceCents > 0;
    return true;
  }), { status: activeView === 'paid' ? 'all' : status, query }), 'dueDate'), [activeView, monthInvoices, query, status]);
  const creditTotal = (state.data?.credits || []).reduce((sum, credit) => sum + creditAvailableCents(credit), 0);

  const selectView = (view, scroll = false) => {
    setActiveView(view);
    setStatus('all');
    setQuery('');
    if (scroll) viewRef.current?.scrollIntoView?.({ behavior: 'smooth', block: 'start' });
  };
  const moveTab = (event, index) => {
    const next = event.key === 'ArrowRight' ? (index + 1) % visibleViews.length
      : event.key === 'ArrowLeft' ? (index + visibleViews.length - 1) % visibleViews.length
        : event.key === 'Home' ? 0 : event.key === 'End' ? visibleViews.length - 1 : null;
    if (next === null) return;
    event.preventDefault();
    selectView(visibleViews[next]);
    tabRefs.current[next]?.focus();
  };

  const showIssuedInvoices = () => {
    selectView('invoices', true);
  };

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
  const openInvoiceForPrint = async (invoice) => {
    setPrintBusy(invoice.id); setError('');
    try { setDocumentPreview(await deliveryRepository.pdf(invoice.id)); }
    catch (caught) { setError(caught.message || 'Arve PDF-i ei saanud avada.'); }
    finally { setPrintBusy(''); }
  };
  const recordPayment = async (form) => {
    setPaymentBusy(true); setError('');
    try {
      await financeRepository.recordPayment(paymentInvoice.id, form);
      setPaymentInvoice(null); announce('Makse registreeriti.'); await state.reload();
    } catch (caught) { setError(caught.message || 'Makse registreerimine ebaõnnestus.'); }
    finally { setPaymentBusy(false); }
  };
  const confirmCancellation = async (reason) => {
    setCancelBusy(true); setError('');
    try {
      await manualInvoiceRepository.cancel(cancelInvoice.id, reason);
      setCancelInvoice(null); announce('Arve tühistati. Number ja põhjus säilitati ajaloos.'); await state.reload();
    } catch (caught) { setError(caught.message || 'Arve tühistamine ebaõnnestus.'); }
    finally { setCancelBusy(false); }
  };

  if (state.loading) return <LoadingState label="Laen finantsandmeid…" />;
  if (state.error) return <ErrorState message={state.error.message} onRetry={state.reload} />;

  return (
    <div className="page-content finance-month-page">
      {showPrivacyBanner ? <PricePrivacyBanner /> : null}
      <header className="finance-month-hero">
        <div><span className="eyebrow">Finantsid</span><h1>Kuu arveldus</h1><p>Koosta arved, jälgi laekumisi ja lahenda erandid ühes vaates.</p></div>
        <div className="finance-month-hero__actions"><Button variant="secondary" onClick={showIssuedInvoices}><ReceiptText size={17} /> Väljastatud arved <span className="finance-month-hero__count">{summary.count}</span></Button><Link className="button button--secondary" to="/finance/seaded"><Settings2 size={17} /> Seaded</Link><Link className="button button--secondary" to="/finance/vana">Vana vaade</Link>{canManage ? <ManualInvoiceDialog onCreated={async () => { announce('Arve loodi.'); await state.reload(); }} /> : null}</div>
      </header>

      <div className="finance-month-switcher">
        <Button variant="secondary" aria-label="Eelmine kuu" onClick={() => setMonth(shiftMonth(month, -1))}><ArrowLeft size={17} /></Button>
        <Input label="Arvelduskuu" type="month" value={month} onChange={(event) => setMonth(event.target.value)} />
        <Button variant="secondary" aria-label="Järgmine kuu" onClick={() => setMonth(shiftMonth(month, 1))}><ArrowRight size={17} /></Button>
      </div>

      {message ? <div className="success-notice" role="status">{message}<button aria-label="Sulge teade" onClick={() => setMessage('')}>×</button></div> : null}
      {error && !paymentInvoice ? <div className="finance-month-alert" role="alert"><AlertTriangle size={18} />{error}</div> : null}

      <section className="finance-month-metrics" role="tablist" aria-label="Finantside vaated">
        {[
          ['invoices', <ReceiptText size={18} />, 'Arveid', summary.count, `${money(summary.amountCents)} kokku`],
          ['paid', <CheckCircle2 size={18} />, 'Laekunud', money(summary.paidCents), `${summary.byStatus.paid} täielikult makstud`],
          ['unpaid', <Clock3 size={18} />, 'Laekumata', money(summary.balanceCents), `${summary.byStatus.overdue} üle tähtaja`],
          ['credits', <WalletCards size={18} />, 'Ette makstud', money(creditTotal), 'kantakse järgmisele arvele'],
          ...(canManage ? [['prepare', <FilePlus2 size={18} />, 'Koosta arved', '', 'Kuuarvete ettevalmistus']] : []),
        ].map(([view, icon, label, value, caption], index) => <button key={view} ref={(node) => { tabRefs.current[index] = node; }} id={`finance-tab-${view}`} type="button" role="tab" aria-selected={activeView === view} aria-controls="finance-view-panel" tabIndex={activeView === view ? 0 : -1} className={`finance-month-metric ${view === 'prepare' ? 'finance-month-metric--prepare' : ''}`} onClick={() => selectView(view)} onKeyDown={(event) => moveTab(event, index)}><span>{icon}{label}</span>{value !== '' ? <strong>{value}</strong> : null}<small>{caption}</small></button>)}
      </section>

      <section ref={viewRef} id="finance-view-panel" className="finance-month-view" role="tabpanel" aria-labelledby={`finance-tab-${activeView}`}>
      {activeView === 'prepare' && canManage ? <MonthlyInvoicePanel students={state.data.students} plans={state.data.plans} lessons={state.data.lessons} invoices={invoices} user={user} month={month} onMonthChange={setMonth} planRepository={planRepository} studentRepository={studentRepository} lessonRepository={lessonRepository} deliveryApi={deliveryRepository} onChanged={state.reload} {...monthlyInvoiceProps} /> : null}

      {activeView === 'credits' ? (canManage ? <AdvanceManagementPanel credits={state.data.credits || []} refunds={state.data.refunds || []} invoices={invoices} onApply={(creditId, invoiceId, amount, note) => financeRepository.applyPayerCredit(creditId, invoiceId, amount, note)} onRefund={(creditId, refund) => financeRepository.refundPayerCredit(creditId, refund)} onReload={state.reload} /> : <Card><EmptyState title="Ettemaksude haldamine" description="See vaade on administraatorile." /></Card>) : null}

      {['invoices', 'paid', 'unpaid'].includes(activeView) ? <Card className="finance-month-ledger">
        <div className="finance-month-ledger__heading"><div><span className="eyebrow">{activeView === 'invoices' ? 'Arved' : activeView === 'paid' ? 'Laekunud' : 'Laekumata'}</span><h2>{activeView === 'invoices' ? 'Kuu arved ja maksed' : activeView === 'paid' ? 'Laekunud maksetega arved' : 'Kuu tasumata arved'}</h2></div><span>{rows.length} kirjet</span></div>
        <div className="finance-month-filters">
          <Input label="Otsi" type="search" placeholder="Õpilane, maksja või arve number" value={query} onChange={(event) => setQuery(event.target.value)} icon={<Search size={17} />} />
          {activeView !== 'paid' ? <Select label="Olek" value={status} onChange={(event) => setStatus(event.target.value)}><option value="all">Kõik olekud</option>{Object.entries(STATUS).filter(([value]) => activeView === 'invoices' || ['unpaid', 'partial', 'overdue', 'email-failed', 'no-show'].includes(value)).map(([value, [label]]) => <option key={value} value={value}>{label}</option>)}</Select> : null}
        </div>
        {!rows.length ? <EmptyState title={activeView === 'paid' ? 'Laekunud makseid ei ole' : activeView === 'unpaid' ? 'Selle kuu võlgnevusi ei ole' : 'Selle kuu arveid ei ole'} description={activeView === 'invoices' ? 'Koosta arved eraldi vaates või vali teine kuu.' : 'Vali teine kuu või muuda filtrit.'} /> : <div className="finance-month-table" role="table" aria-label={`Arved ${month}`}>
          <div className="finance-month-table__head" role="row"><span>Õpilane</span><span>Arve</span><span>Tähtaeg</span><span>Summa</span><span>Jääk</span><span>Olek</span><span>Tegevused</span></div>
          {rows.map((invoice) => { const row = financeRowState(invoice); const [label, tone] = STATUS[row.status]; return <div className="finance-month-table__row" role="row" key={invoice.id}>
            <span><strong>{invoice.studentName || invoice.payerName || '—'}</strong><small>{invoice.payerEmail || ''}</small></span>
            <span>{invoice.num || invoice.number || invoice.invoiceNumber || '—'}</span><span>{displayDate(invoice.due || invoice.dueDate)}</span><span>{money(row.amountCents)}</span><span><strong>{money(row.balanceCents)}</strong></span><span><Badge tone={tone}>{label}</Badge></span>
            <span className="finance-month-table__actions">{canManage && row.balanceCents ? <Button variant="secondary" onClick={() => { setError(''); setPaymentInvoice(invoice); }}>Makse</Button> : null}<Button variant="secondary" loading={printBusy === invoice.id} onClick={() => openInvoiceForPrint(invoice)} aria-label={`Prindi arve ${invoice.num || invoice.number || ''}`}><Printer size={15} /><span>Prindi</span></Button><Button variant="secondary" loading={actionBusy === `send-${invoice.id}`} onClick={() => deliver(invoice, 'send')}><Send size={15} /><span>Saada</span></Button>{row.status === 'overdue' ? <Button variant="secondary" loading={actionBusy === `remind-${invoice.id}`} onClick={() => deliver(invoice, 'remind')}><Mail size={15} /><span>Meeldetuletus</span></Button> : null}{canManage && canCancelInvoice(invoice) ? <Button variant="secondary" onClick={() => { setError(''); setCancelInvoice(invoice); }} aria-label={`Tühista arve ${invoice.num || invoice.number || ''}`}><Trash2 size={15} /><span>Tühista</span></Button> : null}</span>
          </div>; })}
        </div>}
      </Card> : null}
      {activeView === 'unpaid' && canManage ? <FinanceDebtsPanel month={month} invoices={invoices} students={state.data.students} transactions={state.data.bankTransactions} onAllocate={(transaction) => financeRepository.allocateBankTransaction(transaction)} onReload={state.reload} onRemind={async (invoice) => { await deliveryRepository.remind(invoice.id); await state.reload(); }} onCancel={(invoice) => { setError(''); setCancelInvoice(invoice); }} onCorrectDueDate={(invoice, due, reason) => financeRepository.correctInvoiceDueDate(invoice.id, due, reason)} onCreditLessonLine={(invoice, lessonId, reason) => financeRepository.creditInvoiceLessonLine(invoice.id, lessonId, reason)} /> : null}
      </section>
      <PaymentDialog key={paymentInvoice?.id || 'closed'} invoice={paymentInvoice} busy={paymentBusy} error={paymentInvoice ? error : ''} onClose={() => { if (!paymentBusy) { setPaymentInvoice(null); setError(''); } }} onSubmit={recordPayment} />
      <CancelInvoiceDialog key={cancelInvoice?.id || 'closed'} invoice={cancelInvoice} busy={cancelBusy} error={cancelInvoice ? error : ''} onClose={() => { if (!cancelBusy) { setCancelInvoice(null); setError(''); } }} onSubmit={confirmCancellation} />
      <DocumentPreviewModal document={documentPreview} printable onClose={() => setDocumentPreview(null)} />
    </div>
  );
}
