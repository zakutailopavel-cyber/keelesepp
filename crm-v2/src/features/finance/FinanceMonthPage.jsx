import {
  AlertTriangle,
  BookOpen,
  ChevronLeft,
  ChevronRight,
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
import { formatCount, formatMoney } from '../../components/charts/format.js';
import { MoneyValue } from '../../components/charts/MetricCard.jsx';
import { openDrawer } from '../../components/entityDrawer/entityDrawer.js';
import { bankTransactionsService } from '../../services/firebase/bankTransactions.js';
import { creditNotesService } from '../../services/firebase/creditNotes.js';
import FinancialAnalyticsPanel from './FinancialAnalyticsPanel.jsx';
import { financeApi, invoiceDeliveryApi } from '../../services/firebase/financeApi.js';
import { financialAuditService } from '../../services/firebase/financialAudit.js';
import { financialPeriodsService } from '../../services/firebase/financialPeriods.js';
import { invoiceNotesService } from '../../services/firebase/invoiceNotes.js';
import { invoicesService } from '../../services/firebase/invoices.js';
import { lessonsService } from '../../services/firebase/lessons.js';
import { payerCreditsService } from '../../services/firebase/payerCredits.js';
import { revenuePlansService } from '../../services/firebase/revenuePlans.js';
import { studentsService } from '../../services/firebase/students.js';
import { hasAnyRole, ROLES } from '../../utils/roles.js';
import { displayDate } from './finance.js';
import { FINANCE_STATUS_LABELS, filterFinanceRows, financeRowState, sortFinanceRows, summarizeFinanceRows } from './financeRows.js';
import ManualInvoiceDialog from './ManualInvoiceDialog.jsx';
import { invoiceShownEmail } from './invoicePayer.js';
import TokenInvoiceDialog from './TokenInvoiceDialog.jsx';
import { tokenInvoiceCreatedMessage } from './tokenInvoiceRows.js';
import MonthlyInvoicePanel from './MonthlyInvoicePanel.jsx';
import PricePrivacyBanner from './PricePrivacyBanner.jsx';
import { currentMonth, defaultBillingMonth } from './monthlyBilling.js';
import FinanceOverview from './FinanceOverview.jsx';
import { PERIOD_UNITS, moneyFlows, periodInvoices, periodLabel, periodRange, shiftPeriod } from './financeOverview.js';
import { useAsyncData } from '../../hooks/useAsyncData.js';
import { paymentsService } from '../../services/firebase/payments.js';
import { heldByOthers } from '../cash/cashModel.js';
import { useFinanceData } from './useFinanceData.js';
import FinanceDebtsPanel from './FinanceDebtsPanel.jsx';
import FinanceDashboard from './FinanceDashboard.jsx';
import { canCancelInvoice, invoiceWasSent } from './invoiceActions.js';
import AdvanceManagementPanel from './AdvanceManagementPanel.jsx';
import PaymentCheckPanel from './PaymentCheckPanel.jsx';
import PaymentDialog from './PaymentDialog.jsx';
import { isOverpaymentRefusal, paymentRecordedNotice, recordPaymentWithAdvance } from './paymentEntry.js';
import DocumentPreviewModal from './DocumentPreviewModal.jsx';
import InvoiceNoteDialog, { InvoiceNoteButton } from './InvoiceNoteDialog.jsx';
import InvoiceAccountingDialog, { InvoiceAccountingButton } from './InvoiceAccountingDialog.jsx';
import { legacyFinanceDestination } from './financeSettingsNavigation.js';
import { manualInvoiceApi } from '../../services/firebase/manualInvoiceApi.js';
import { lessonTokensService, owedCredits, tokenInvoiceStudentIds, tokenInvoiceUsageLines } from '../../services/firebase/lessonTokens.js';
import { useEntityChanged } from '../../components/entityDrawer/useEntityChanged.js';
import FiePanel from './fie/FiePanel.jsx';
import { useIsOwner } from './fie/useIsOwner.js';
import './financeMonth.css';
import './manualInvoice.css';

const money = (cents) => formatMoney(cents);
const UNIT_NAMES = { month: ['Eelmine kuu', 'Järgmine kuu', 'Praegune kuu'], quarter: ['Eelmine kvartal', 'Järgmine kvartal', 'Praegune kvartal'], year: ['Eelmine aasta', 'Järgmine aasta', 'Praegune aasta'] };
const UNIT_STORE = 'keelesepp.financeMonth.unit';
const unitAtStart = () => { try { const saved = globalThis.localStorage?.getItem(UNIT_STORE); return PERIOD_UNITS.some((item) => item.id === saved) ? saved : 'month'; } catch { return 'month'; } };
const STATUS = FINANCE_STATUS_LABELS;
// „check” (Kontroll, admin): invoices against payment records and the bank (owner 2026-10-15)
const VIEWS = ['invoices', 'paid', 'unpaid', 'credits', 'prepare', 'check'];
const creditAvailableCents = (credit) => Number.isInteger(credit?.availableAmountCents)
  ? credit.availableAmountCents : Math.round(Number(credit?.availableAmount || 0) * 100);

// the e-mail state of an invoice (functions/index.js writes emailStatus, emailSentAt, emailRecipient, lastReminderSentAt)
const stamp = (iso) => { const d = new Date(iso || ''); return Number.isNaN(d.getTime()) ? '' : d.toLocaleString('et-EE', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }); };
export function invoiceEmailLine(invoice = {}) {
  const status = String(invoice.emailStatus || '').toLowerCase();
  if (status === 'sending') return { text: 'Saatmisel…', tone: 'info' };
  if (status === 'failed') return { text: 'Saatmine ebaõnnestus', tone: 'danger', title: invoice.emailLastError || '' };
  const reminder = invoice.lastReminderSentAt ? `Meeldetuletus ${stamp(invoice.lastReminderSentAt)}` : '';
  const sentAt = invoice.invoiceEmailSentAt || invoice.emailSentAt;
  if (status === 'queued' && !sentAt) return { text: `Järjekorras ${stamp(invoice.emailQueuedAt || invoice.emailUpdatedAt)}`, tone: 'info' };
  if (sentAt || status === 'sent') return { text: [`Saadetud ${stamp(sentAt || invoice.emailUpdatedAt)}`, reminder].filter(Boolean).join(' · '), tone: 'success', title: invoice.emailRecipient || '' };
  return { text: 'Saatmata', tone: 'neutral' };
}

function CancelInvoiceDialog({ invoice, busy, error, onClose, onSubmit }) {
  const [reason, setReason] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const sent = invoiceWasSent(invoice || {});
  const recipient = invoice?.emailRecipient || invoice?.payerEmail || invoice?.parentEmail || '';
  const ready = reason.trim().length >= 10 && (!sent || confirmed);
  return <Modal open={Boolean(invoice)} title={`Tühista arve · ${invoice?.num || invoice?.number || ''}`} onClose={onClose}
    footer={<><Button variant="secondary" disabled={busy} onClick={onClose}>Tagasi</Button><Button variant="danger" type="submit" form="finance-month-cancel" loading={busy} disabled={!ready}>Tühista arve</Button></>}>
    <form id="finance-month-cancel" onSubmit={(event) => { event.preventDefault(); if (ready) onSubmit(reason.trim(), { afterSending: sent }); }}>
      <p>Arve eemaldatakse aktiivsest nimekirjast ja summadest. Arve number ning tühistamise põhjus jäävad ajalukku. Seda toimingut ei saa tagasi võtta.</p>
      {sent ? <label className="checkbox-field" style={{ paddingTop: 0, marginBottom: 10 }}><input type="checkbox" checked={confirmed} onChange={(event) => setConfirmed(event.target.checked)} /> <span>Arve on juba saadetud{recipient ? ` aadressile ${recipient}` : ''}. Kinnitan tühistamise (nt vale e-post või vale arve); kui maksja arve kätte sai, teatan talle.</span></label> : null}
      <div className="field"><label className="field__label" htmlFor="finance-month-cancel-reason">Tühistamise põhjus</label><textarea id="finance-month-cancel-reason" className="field__textarea" rows="3" minLength="10" maxLength="500" required value={reason} onChange={(event) => setReason(event.target.value)} placeholder="Kirjelda, miks arve tühistatakse (vähemalt 10 märki)" />{reason.trim().length < 10 ? <small className="field__hint">Põhjus peab olema vähemalt 10 märki — veel {10 - reason.trim().length}.</small> : null}</div>
      {error ? <p className="form-error" role="alert">{error}</p> : null}
    </form>
  </Modal>;
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
  noteRepository = invoiceNotesService,
  dashboardRepository,
  paymentRepository,
  monthlyInvoiceProps,
  showPrivacyBanner = true,
  tokensRepository = lessonTokensService,
}) {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const canManage = hasAnyRole(user.roles, [ROLES.ADMIN]);
  // „FIE” (owner 2026-11-09): the owner's own FIE invoices, apart from every company figure on this page
  const isOwner = useIsOwner();
  // „Sisemine märkus” of an invoice: administrator and bookkeeper (the rules allow exactly these two)
  const canNote = hasAnyRole(user.roles, [ROLES.ADMIN, ROLES.FINANCE]);
  const state = useFinanceData({ canManageFinance: canManage, invoiceRepository, planRepository, studentRepository, lessonRepository, bankRepository, periodRepository, creditRepository, creditNoteRepository, auditRepository });
  // „Ülekanded” / „Sularaha” under „Laekunud” (owner 2026-11-10): the admin only — the payment records (method) and the
  // cash box. The bookkeeper never gets them (rules: payments and cashLedger are admin-only; lesson cash stays off the books).
  const flowState = useAsyncData(async () => {
    if (!canManage) return null;
    const payments = paymentRepository || paymentsService;
    if (!payments.listAll || !financeRepository.cashSummary) return null;
    const [paymentList, cash] = await Promise.all([payments.listAll(), financeRepository.cashSummary().catch(() => null)]);
    return { payments: paymentList || [], cash };
  }, [canManage, paymentRepository, financeRepository]);
  // a payment added in the side drawer (right-click → „Ava arve (siinsamas)”) or a lesson mark changed in a student's
  // card there (the month's billable lessons): the month reads its data again in place — the list stays on screen
  // („Uuendan andmeid…”), the view, filters and scroll are kept
  useEntityChanged(['invoice', 'lesson'], () => { state.reload(); flowState.reload(); });
  // the lists open on this month (owner 2026-10-12: after the 10th the page opened on next month, empty, and the
  // invoices looked gone); preparing invoices opens on the billing month
  const [month, setMonth] = useState(() => (new globalThis.URLSearchParams(location.search).get('view') === 'prepare' ? defaultBillingMonth() : currentMonth()));
  const preparedMonthSet = useRef(false);
  // „Kuu / Kvartal / Aasta” (owner 2026-11-09, Stripe overview): the overview and the list show the period that holds `month`;
  // preparing invoices keeps working on `month` itself
  const [unit, setUnit] = useState(unitAtStart);
  const range = useMemo(() => periodRange(unit, month), [unit, month]);
  const rangeLabel = periodLabel(range);
  const [today] = useState(() => new Date());
  const chooseUnit = (next) => { setUnit(next); try { globalThis.localStorage?.setItem(UNIT_STORE, next); } catch { /* private mode */ } };
  const [status, setStatus] = useState(() => new globalThis.URLSearchParams(location.search).get('status') || 'all');
  const [activeView, setActiveView] = useState(() => {
    const params = new globalThis.URLSearchParams(location.search);
    const requested = params.get('status') === 'overdue' ? 'unpaid' : (VIEWS.includes(params.get('view')) ? params.get('view') : 'invoices');
    return ['prepare', 'check'].includes(requested) && !canManage ? 'invoices' : requested;
  });
  const [query, setQuery] = useState('');
  const [checkTab, setCheckTab] = useState('ledger');
  const [paymentInvoice, setPaymentInvoice] = useState(null);
  const [cancelInvoice, setCancelInvoice] = useState(null);
  const [cancelBusy, setCancelBusy] = useState(false);
  const [paymentBusy, setPaymentBusy] = useState(false);
  const [overpaymentQuestion, setOverpaymentQuestion] = useState('');
  const [actionBusy, setActionBusy] = useState('');
  const [printBusy, setPrintBusy] = useState('');
  const [documentPreview, setDocumentPreview] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [notes, setNotes] = useState(() => new Map());
  const [noteInvoice, setNoteInvoice] = useState(null);
  const viewRef = useRef(null);
  const tabRefs = useRef([]);
  const visibleViews = canManage ? VIEWS : VIEWS.slice(0, 4);

  useEffect(() => {
    const destination = legacyFinanceDestination(location.hash);
    if (destination) navigate(destination, { replace: true });
  }, [location.hash, navigate]);

  // the notes load on their own: a refusal (e.g. rules not yet deployed) never blocks the invoice list
  useEffect(() => {
    if (!canNote) return undefined;
    let live = true;
    Promise.resolve().then(() => noteRepository.list()).then((map) => { if (live) setNotes(map instanceof Map ? map : new Map()); }).catch(() => { if (live) setNotes(new Map()); });
    return () => { live = false; };
  }, [canNote, noteRepository]);
  const saveNote = async (invoice, text) => {
    const saved = await noteRepository.save(invoice.id, text, user);
    setNotes((current) => new Map(current).set(invoice.id, saved));
    setNoteInvoice(null);
    announce(text ? `Sisemine märkus salvestati (${invoice.num || invoice.number || ''}).` : 'Sisemine märkus eemaldati.');
  };
  const noteText = (invoice) => notes.get(invoice.id)?.text || '';
  // „Ei kuulu raamatupidamisse”: the mark and the entries are changed by the server (docs/ACCOUNTING.md)
  const [accountingInvoice, setAccountingInvoice] = useState(null);
  const saveAccountingMark = async (invoice, reason) => {
    const num = invoice.num || invoice.number || '';
    const excluded = invoice.accountingExcluded === true;
    const result = await (excluded ? financeRepository.includeInvoiceInAccounting(invoice.id, reason) : financeRepository.excludeInvoiceFromAccounting(invoice.id, reason));
    setAccountingInvoice(null);
    const count = result?.entries?.length || 0;
    const related = (result?.relatedInvoices || []).map((item) => item.num || item.id).join(', ');
    announce(`${num}: ${excluded ? `taastatud raamatupidamisse, ${count} kannet kehtib taas` : `ei kuulu raamatupidamisse, ${count} kannet märgiti kustutatuks`}.${related ? ` Seotud arve ${related} jäi muutmata — vaata see üle.` : ''}`);
    await state.reload();
  };
  // a note written in „Lisa arve” / „Tunnipakett” is saved right after the invoice; the invoice stands even if it fails
  const rememberNote = (invoice, { note } = {}) => { if (invoice?.id && note) setNotes((current) => new Map(current).set(invoice.id, note)); };
  const noteWarning = ({ noteError } = {}) => (noteError ? ` Sisemist märkust ei saanud salvestada (${noteError}) — lisa see arvete nimekirjas märkuse ikoonist.` : '');

  const invoices = useMemo(() => state.data?.invoices || [], [state.data?.invoices]);
  const flows = useMemo(() => (flowState.data ? moneyFlows({ invoices, payments: flowState.data.payments, cashEntries: flowState.data.cash?.entries || [] }) : null), [flowState.data, invoices]);
  const cashHeld = useMemo(() => {
    if (!flowState.data?.cash) return null;
    const others = heldByOthers(flowState.data.cash.balances || [], user.uid);
    return { cents: others.reduce((sum, row) => sum + row.cents, 0), people: others.length };
  }, [flowState.data, user.uid]);
  // the month's invoice preparation must know the owner's FIE invoices too (a card billed through the FIE this month
  // is not offered again); every other figure on this page stays company-only
  const [fieInvoices, setFieInvoices] = useState([]);
  useEffect(() => {
    if (!isOwner || !invoiceRepository.listFie) return undefined;
    let live = true;
    invoiceRepository.listFie().then((list) => { if (live) setFieInvoices(list); }).catch(() => {});
    return () => { live = false; };
  }, [isOwner, invoiceRepository, state.data?.invoices]);
  const billingInvoices = useMemo(() => (fieInvoices.length ? [...invoices, ...fieInvoices] : invoices), [invoices, fieInvoices]);
  // the note's text joins the search (staff only: it is never written onto the invoice)
  const monthInvoices = useMemo(() => periodInvoices(invoices, range)
    .map((invoice) => (notes.get(invoice.id)?.text ? { ...invoice, internalNote: notes.get(invoice.id).text } : invoice)), [invoices, range, notes]);
  const summary = useMemo(() => summarizeFinanceRows(monthInvoices), [monthInvoices]);
  const rows = useMemo(() => sortFinanceRows(filterFinanceRows(monthInvoices.filter((invoice) => {
    const row = financeRowState(invoice);
    if (activeView === 'paid') return row.paidCents > 0;
    if (activeView === 'unpaid') return row.balanceCents > 0;
    return true;
  }), { status: activeView === 'paid' ? 'all' : status, query }), 'dueDate'), [activeView, monthInvoices, query, status]);
  // lesson tokens: the package of each credited token invoice of the month (bought / held / left) and the lessons each of
  // those students owes (held after the packages were used up), shown on the student's newest token invoice
  const [tokenUsage, setTokenUsage] = useState({ packages: {}, owed: {} });
  // from the invoices, not monthInvoices: the notes arriving a moment later must not repeat these reads
  const tokenInvoices = useMemo(() => periodInvoices(invoices, range).filter((invoice) => invoice.billingMode === 'lesson_tokens_v1'), [invoices, range]);
  useEffect(() => {
    if (!tokenInvoices.length || !tokensRepository?.packagesForInvoices) return undefined;
    let alive = true;
    // a combined package invoice („Ühine tunnipakett”) counts for each of its cards
    const studentIds = [...new Set(tokenInvoices.flatMap(tokenInvoiceStudentIds))];
    Promise.all([
      tokensRepository.packagesForInvoices(tokenInvoices).catch(() => ({})),
      Promise.all(studentIds.map((id) => (tokensRepository.owedByStudent ? tokensRepository.owedByStudent(id) : Promise.resolve([])).then((owed) => [id, owedCredits(owed)]).catch(() => [id, 0]))),
    ]).then(([packages, owed]) => { if (alive) setTokenUsage({ packages, owed: Object.fromEntries(owed) }); });
    return () => { alive = false; };
  }, [tokenInvoices, tokensRepository]);
  // the newest token invoice of each card (a combined one counts for each of its cards): `${invoiceId}|${studentId}`
  const newestTokenInvoice = useMemo(() => {
    const newest = {};
    monthInvoices.filter((invoice) => invoice.billingMode === 'lesson_tokens_v1').forEach((invoice) => {
      tokenInvoiceStudentIds(invoice).forEach((studentId) => {
        const current = newest[studentId];
        if (!current || String(invoice.date || '') > String(current.date || '')) newest[studentId] = invoice;
      });
    });
    return new Set(Object.entries(newest).map(([studentId, invoice]) => `${invoice.id}|${studentId}`));
  }, [monthInvoices]);
  const openCredits = (state.data?.credits || []).filter((credit) => creditAvailableCents(credit) > 0);
  const creditTotal = openCredits.reduce((sum, credit) => sum + creditAvailableCents(credit), 0);

  const selectView = (view, scroll = false) => {
    setActiveView(view);
    if (view === 'prepare' && !preparedMonthSet.current) { preparedMonthSet.current = true; setMonth(defaultBillingMonth()); }
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
  // a card's „Vaata”: the list under the cards, optionally with a status filter (Üle tähtaja → overdue)
  const openView = (view, withStatus) => { selectView(view, true); if (withStatus) setStatus(withStatus); };
  // a row opens the invoice in the side drawer; a page without the drawer (tests, the lab) opens its PDF instead
  const openInvoice = (invoice) => { if (!openDrawer({ kind: 'invoice', invoiceId: invoice.id })) openInvoiceForPrint(invoice); };
  const [previousName, nextName, nowName] = UNIT_NAMES[unit] || UNIT_NAMES.month;
  const nowAnchor = currentMonth();
  const showingNow = periodRange(unit, nowAnchor).from === range.from;

  const announce = (value) => { setMessage(value); setError(''); };
  // lesson tokens: the paid package invoice → the card gets its lessons (the server checks the payment, once only)
  const creditTokens = async (invoice) => {
    setActionBusy(`tokens-${invoice.id}`); setError('');
    try {
      const { studentPackage, studentPackages } = await financeRepository.creditInvoiceTokens(invoice.id);
      // a combined invoice: every line went to its own card
      announce(studentPackages?.length
        ? `Lisati ${studentPackages.reduce((sum, item) => sum + (Number(item.grantedCredits) || 0), 0)} tundi: ${studentPackages.map((item) => `${item.studentName || 'Õpilane'}${item.tokenSubject ? ` (${item.tokenSubject})` : ''} ${item.grantedCredits}`).join(', ')}.`
        : `${invoice.studentName || 'Õpilane'}: lisati ${studentPackage?.grantedCredits ?? invoice.tokenCredits} tundi.`);
      await state.reload();
    } catch (caught) { setError(caught.message || 'Tunde ei saanud lisada.'); } finally { setActionBusy(''); }
  };
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
    setPaymentBusy(true); setError(''); setOverpaymentQuestion('');
    try {
      const outcome = await recordPaymentWithAdvance(financeRepository, paymentInvoice.id, form);
      setPaymentInvoice(null); announce(paymentRecordedNotice(outcome)); await state.reload();
    } catch (caught) {
      // more than the open balance (another person may have just registered it): ask, the server records nothing yet
      if (isOverpaymentRefusal(caught)) setOverpaymentQuestion(caught.message);
      else setError(caught.message || 'Makse registreerimine ebaõnnestus.');
    }
    finally { setPaymentBusy(false); }
  };
  const confirmCancellation = async (reason, options = {}) => {
    setCancelBusy(true); setError('');
    try {
      await manualInvoiceRepository.cancel(cancelInvoice.id, reason, options);
      setCancelInvoice(null); announce('Arve tühistati. Number ja põhjus säilitati ajaloos.'); await state.reload();
    } catch (caught) { setError(caught.message || 'Arve tühistamine ebaõnnestus.'); }
    finally { setCancelBusy(false); }
  };

  if (state.loading && !state.data) return <LoadingState label="Laen finantsandmeid…" />;
  if (state.error) return <ErrorState message={state.error.message} onRetry={state.reload} />;

  return (
    <div className="page-content finance-month-page">
      {state.loading ? <p className="page-refreshing" role="status">Uuendan andmeid…</p> : null}
      {showPrivacyBanner ? <PricePrivacyBanner /> : null}
      <header className="fm-header">
        <div className="fm-header__title"><span className="eyebrow">Finantsid</span><h1>Ülevaade</h1><p>Arved, laekumised ja võlad ühes vaates.</p></div>
        <div className="fm-header__actions">{canManage ? <TokenInvoiceDialog studentCards={state.data.students} plans={state.data.plans} notesRepository={noteRepository} onCreated={async (invoice, extra = {}) => { rememberNote(invoice, extra); announce(`${tokenInvoiceCreatedMessage(invoice)}${noteWarning(extra)}`); await state.reload(); }} /> : null}{canManage ? <ManualInvoiceDialog studentCards={state.data.students} notesRepository={noteRepository} onCreated={async (invoice, extra = {}) => { rememberNote(invoice, extra); announce(`Arve loodi.${noteWarning(extra)}`); await state.reload(); }} /> : null}</div>
      </header>
      <nav className="fm-links" aria-label="Finantside lehed">
        <button type="button" className="fm-link" onClick={showIssuedInvoices}><ReceiptText size={16} aria-hidden="true" /> Väljastatud arved <span className="fm-link__count">{summary.count}</span></button>
        <Link className="fm-link" to="/finance/seaded"><Settings2 size={16} aria-hidden="true" /> Seaded</Link>
        {canManage ? <Link className="fm-link" to="/finance/raamatupidamine"><BookOpen size={16} aria-hidden="true" /> Raamatupidamine</Link> : null}
        {canManage ? <Link className="fm-link" to="/finance/inf3">INF 3</Link> : null}
        {canManage ? <Link className="fm-link" to="/finance/payroll"><WalletCards size={16} aria-hidden="true" /> Palgad</Link> : null}
        <Link className="fm-link" to="/finance/vana">Vana vaade</Link>
      </nav>

      {message ? <div className="success-notice" role="status">{message}<button aria-label="Sulge teade" onClick={() => setMessage('')}>×</button></div> : null}
      {error && !paymentInvoice ? <div className="finance-month-alert" role="alert"><AlertTriangle size={18} />{error}</div> : null}

      <div className="fm-period" role="group" aria-label="Periood">
        <div className="fm-seg" role="group" aria-label="Perioodi pikkus">{PERIOD_UNITS.map((item) => <button key={item.id} type="button" aria-pressed={unit === item.id} onClick={() => chooseUnit(item.id)}>{item.label}</button>)}</div>
        <div className="fm-period__nav">
          <button type="button" className="fm-icon" aria-label={previousName} onClick={() => setMonth(shiftPeriod(unit, month, -1))}><ChevronLeft size={18} /></button>
          <span className="fm-period__label" aria-live="polite">{rangeLabel}</span>
          <button type="button" className="fm-icon" aria-label={nextName} onClick={() => setMonth(shiftPeriod(unit, month, 1))}><ChevronRight size={18} /></button>
        </div>
        {showingNow ? null : <button type="button" className="fm-period__now" onClick={() => setMonth(nowAnchor)}>{nowName}</button>}
      </div>

      <FinanceOverview invoices={invoices} unit={unit} anchor={month} today={today} creditCents={creditTotal} creditCount={openCredits.length} onView={openView}
        flows={flows} cashHeld={cashHeld} onOpenCash={() => navigate('/kassa')} />

      <section className="fm-tabs" role="tablist" aria-label="Finantside vaated">
        {[
          ['invoices', 'Arveid', formatCount(summary.count), `${money(summary.amountCents)} kokku`],
          ['paid', 'Laekunud', money(summary.paidCents), `${summary.byStatus.paid} täielikult makstud`],
          ['unpaid', 'Laekumata', money(summary.balanceCents), `${unit === 'month' ? 'selle kuu arved' : 'perioodi arved'} · ${summary.byStatus.overdue} üle tähtaja`],
          ['credits', 'Ette makstud', money(creditTotal), 'kantakse järgmisele arvele'],
          ...(canManage ? [['prepare', 'Koosta arved', '', 'Kuuarvete ettevalmistus'], ['check', 'Kontroll', '', 'Arved ja maksed, pank']] : []),
        ].map(([view, label, value, caption], index) => <button key={view} ref={(node) => { tabRefs.current[index] = node; }} id={`finance-tab-${view}`} type="button" role="tab" aria-selected={activeView === view} aria-controls="finance-view-panel" tabIndex={activeView === view ? 0 : -1} className={`fm-tab ${['prepare', 'check'].includes(view) ? 'fm-tab--tool' : ''}`} onClick={() => selectView(view)} onKeyDown={(event) => moveTab(event, index)}><span className="fm-tab__label">{label}</span>{' '}{value !== '' ? <><strong className="fm-tab__value">{value}</strong>{' '}</> : null}<small>{caption}</small></button>)}
      </section>

      <section ref={viewRef} id="finance-view-panel" className="finance-month-view" role="tabpanel" aria-labelledby={`finance-tab-${activeView}`}>
      {activeView === 'prepare' && canManage ? <MonthlyInvoicePanel students={state.data.students} plans={state.data.plans} lessons={state.data.lessons} invoices={billingInvoices} user={user} month={month} onMonthChange={setMonth} planRepository={planRepository} studentRepository={studentRepository} lessonRepository={lessonRepository} deliveryApi={deliveryRepository} onChanged={state.reload} {...monthlyInvoiceProps} /> : null}

      {activeView === 'check' && canManage ? <PaymentCheckPanel invoices={invoices} transactions={state.data.bankTransactions || []} students={state.data.students} financeRepository={financeRepository} {...(paymentRepository ? { paymentRepository } : {})} onAllocate={(transaction) => financeRepository.allocateBankTransaction(transaction)} onReload={state.reload} onOpenCredits={() => selectView('credits', true)} onNotice={announce} tab={checkTab} onTabChange={setCheckTab} /> : null}

      {activeView === 'credits' ? (canManage ? <AdvanceManagementPanel credits={state.data.credits || []} refunds={state.data.refunds || []} invoices={invoices} onApply={(creditId, invoiceId, amount, note) => financeRepository.applyPayerCredit(creditId, invoiceId, amount, note)} onRefund={(creditId, refund) => financeRepository.refundPayerCredit(creditId, refund)} onReload={state.reload} /> : <Card><EmptyState title="Ettemaksude haldamine" description="See vaade on administraatorile." /></Card>) : null}

      {['invoices', 'paid', 'unpaid'].includes(activeView) ? <Card className="finance-month-ledger">
        <div className="finance-month-ledger__heading"><div><span className="eyebrow">{activeView === 'invoices' ? 'Arved' : activeView === 'paid' ? 'Laekunud' : 'Laekumata'}</span><h2>{activeView === 'invoices' ? (unit === 'month' ? 'Kuu arved ja maksed' : 'Perioodi arved ja maksed') : activeView === 'paid' ? 'Laekunud maksetega arved' : (unit === 'month' ? 'Kuu tasumata arved' : 'Perioodi tasumata arved')}</h2></div><span>{rangeLabel} · {rows.length} kirjet</span></div>
        <div className="finance-month-filters">
          <Input label="Otsi" type="search" placeholder="Õpilane, maksja, arve number või märkus" value={query} onChange={(event) => setQuery(event.target.value)} icon={<Search size={17} />} />
          {activeView !== 'paid' ? <Select label="Olek" value={status} onChange={(event) => setStatus(event.target.value)}><option value="all">Kõik olekud</option>{Object.entries(STATUS).filter(([value]) => activeView === 'invoices' || ['unpaid', 'partial', 'overdue', 'email-failed', 'no-show'].includes(value)).map(([value, [label]]) => <option key={value} value={value}>{label}</option>)}</Select> : null}
        </div>
        {!rows.length ? <EmptyState title={activeView === 'paid' ? 'Laekunud makseid ei ole' : activeView === 'unpaid' ? 'Selle kuu võlgnevusi ei ole' : 'Selle kuu arveid ei ole'} description={activeView === 'invoices' ? 'Koosta arved eraldi vaates või vali teine kuu.' : 'Vali teine kuu või muuda filtrit.'} /> : <div className="finance-month-table" role="table" aria-label={`Arved ${unit === 'month' ? month : rangeLabel}`}>
          <div className="finance-month-table__head" role="row"><span>Õpilane</span><span>Arve</span><span>Tähtaeg</span><span className="fm-num">Summa</span><span className="fm-num">Jääk</span><span>Olek</span><span>Tegevused</span></div>
          {rows.map((invoice) => { const row = financeRowState(invoice); const [label, tone] = STATUS[row.status]; return <div className="finance-month-table__row" role="row" key={invoice.id} data-entity="invoice" data-invoice-id={invoice.id} data-invoice-number={invoice.num || invoice.number || invoice.invoiceNumber || undefined} data-student-id={invoice.studentId || undefined} data-entity-title={[invoice.studentName || invoice.payerName, invoice.num || invoice.number || invoice.invoiceNumber].filter(Boolean).join(' · ') || undefined}>
            <span><button type="button" className="fm-row-open" onClick={() => openInvoice(invoice)} title="Ava arve">{invoice.studentName || invoice.payerName || '—'}</button><small>{[invoice.subject, invoiceShownEmail(invoice)].filter(Boolean).join(' · ')}</small>{invoice.billingMode === 'lesson_tokens_v1' ? tokenInvoiceUsageLines(invoice, tokenUsage.packages[invoice.id], { owed: tokenUsage.owed[invoice.studentId] || 0, showOwed: newestTokenInvoice.has(`${invoice.id}|${invoice.studentId}`), owedBy: tokenUsage.owed, showOwedFor: (studentId) => newestTokenInvoice.has(`${invoice.id}|${studentId}`) }).map((line) => <small key={line} className="finance-tokens">{line}</small>) : null}{noteText(invoice) ? <small className="finance-note-line" title={noteText(invoice)}>Märkus: {noteText(invoice)}</small> : null}{canNote && invoice.accountingExcluded === true ? <small className="finance-note-line" title={invoice.accountingExcludedReason || ''}>Ei kuulu raamatupidamisse</small> : null}</span>
            <span><span className="finance-month-table__num">{invoice.num || invoice.number || invoice.invoiceNumber || '—'}{canNote ? <InvoiceNoteButton invoice={invoice} note={notes.get(invoice.id)} onOpen={(item) => { setError(''); setNoteInvoice(item); }} /> : null}{canNote ? <InvoiceAccountingButton invoice={invoice} onOpen={setAccountingInvoice} /> : null}</span></span><span>{displayDate(invoice.due || invoice.dueDate)}</span><span className="fm-num"><MoneyValue cents={row.amountCents} /></span><span className={`fm-num ${row.balanceCents ? 'fm-num--strong' : 'fm-num--zero'}`}><MoneyValue cents={row.balanceCents} /></span><span className="finance-month-table__state"><Badge tone={tone}>{label}</Badge>{(() => { const mail = invoiceEmailLine(invoice); return <small className={`finance-mail finance-mail--${mail.tone}`} title={mail.title || undefined}>✉ {mail.text}</small>; })()}</span>
            <span className="finance-month-table__actions">{canManage && invoice.billingMode === 'lesson_tokens_v1' && invoice.tokenStatus !== 'credited' && !row.balanceCents && row.status !== 'cancelled' ? <Button loading={actionBusy === `tokens-${invoice.id}`} data-entity-action="tokens" onClick={() => creditTokens(invoice)}>Lisa tunnid ({invoice.tokenCredits})</Button> : null}{canManage && row.balanceCents ? <Button variant="secondary" data-entity-action="payment" onClick={() => { setError(''); setPaymentInvoice(invoice); }}>Makse</Button> : null}<Button variant="secondary" loading={printBusy === invoice.id} data-entity-action="print" onClick={() => openInvoiceForPrint(invoice)} aria-label={`Prindi arve ${invoice.num || invoice.number || ''}`}><Printer size={15} /><span>Prindi</span></Button><Button variant="secondary" loading={actionBusy === `send-${invoice.id}`} data-entity-action="send" onClick={() => deliver(invoice, 'send')}><Send size={15} /><span>Saada</span></Button>{row.balanceCents > 0 && row.status !== 'cancelled' ? <Button variant="secondary" loading={actionBusy === `remind-${invoice.id}`} data-entity-action="remind" onClick={() => deliver(invoice, 'remind')}><Mail size={15} /><span>Meeldetuletus</span></Button> : null}{canManage && canCancelInvoice(invoice) ? <Button variant="secondary" data-entity-action="cancel" onClick={() => { setError(''); setCancelInvoice(invoice); }} aria-label={`Tühista arve ${invoice.num || invoice.number || ''}`}><Trash2 size={15} /><span>Tühista</span></Button> : null}</span>
          </div>; })}
        </div>}
      </Card> : null}
      {activeView === 'unpaid' && canManage ? <FinanceDebtsPanel canRemoveClaims month={month} invoices={invoices} students={state.data.students} transactions={state.data.bankTransactions} onAllocate={(transaction) => financeRepository.allocateBankTransaction(transaction)} onReload={state.reload} onRemind={(invoice) => deliver(invoice, 'remind')} onCancel={(invoice) => { setError(''); setCancelInvoice(invoice); }} onCorrectDueDate={(invoice, due, reason) => financeRepository.correctInvoiceDueDate(invoice.id, due, reason)} onCreditLessonLine={(invoice, lessonId, reason) => financeRepository.creditInvoiceLessonLine(invoice.id, lessonId, reason)} onCreditInFull={(invoice, reason, requestId) => financeRepository.creditInvoiceInFull(invoice.id, reason, requestId)} onCorrectInvoice={(invoice, correction) => financeRepository.correctIssuedInvoice(invoice.id, correction)} /> : null}
      {/* the bookkeeper: the same list, read-only (the home page's „overdue” link opened an empty month for her) */}
      {activeView === 'unpaid' && !canManage && canNote ? <FinanceDebtsPanel month={month} invoices={invoices} students={state.data.students} /> : null}
      </section>

      {/* more analysis, below the list: „Tulu ja prognoos” counts the calendar's lessons (owner 2026-10-26, administrators);
          „Raha liikumine” is built on demand by the server (audit 2026-11-09); the owner's FIE block stays out of every company figure */}
      {canManage ? <FinanceDashboard user={user} plans={state.data.plans} lessons={state.data.lessons} {...(dashboardRepository ? { repository: dashboardRepository } : {})} /> : null}
      {canManage && financeRepository.previewFinancialAnalytics ? <details className="finance-month-cash"><summary>Raha liikumine: laekumised, kulud, marginaal ja võlgade vanus</summary><FinancialAnalyticsPanel onPreview={(chosen) => financeRepository.previewFinancialAnalytics(chosen)} onOpenInvoice={(invoiceId) => { const found = invoices.find((item) => item.id === invoiceId); if (found) openInvoiceForPrint(found); }} /></details> : null}
      {isOwner ? <details className="finance-month-cash"><summary>FIE arved (ainult sulle, ettevõtte arvestusest väljas)</summary><FiePanel month={month} invoiceRepository={invoiceRepository.listFie ? invoiceRepository : invoicesService} /></details> : null}
      <PaymentDialog key={paymentInvoice?.id ? `pay-${paymentInvoice.id}` : 'pay-closed'} invoice={paymentInvoice} busy={paymentBusy} error={paymentInvoice ? error : ''} overpaymentQuestion={overpaymentQuestion} onDismissOverpayment={() => setOverpaymentQuestion('')} onClose={() => { if (!paymentBusy) { setPaymentInvoice(null); setError(''); setOverpaymentQuestion(''); } }} onSubmit={recordPayment} />
      <CancelInvoiceDialog key={cancelInvoice?.id ? `cancel-${cancelInvoice.id}` : 'cancel-closed'} invoice={cancelInvoice} busy={cancelBusy} error={cancelInvoice ? error : ''} onClose={() => { if (!cancelBusy) { setCancelInvoice(null); setError(''); } }} onSubmit={confirmCancellation} />
      {noteInvoice ? <InvoiceNoteDialog key={`note-${noteInvoice.id}`} invoice={noteInvoice} note={notes.get(noteInvoice.id)} onClose={() => setNoteInvoice(null)} onSave={saveNote} /> : null}
      {accountingInvoice ? <InvoiceAccountingDialog key={`accounting-${accountingInvoice.id}`} invoice={accountingInvoice} onClose={() => setAccountingInvoice(null)} onSave={saveAccountingMark} /> : null}
      <DocumentPreviewModal document={documentPreview} printable onClose={() => setDocumentPreview(null)} />
    </div>
  );
}
