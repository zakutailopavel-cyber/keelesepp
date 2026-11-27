import { CheckCircle2, ChevronLeft, ChevronRight, FileUp } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../app/AuthContext.jsx';
import { Button, Card, EmptyState, ErrorState, Input, LoadingState, Modal, PageHeader } from '../../components/ui/index.js';
import { formatMoney } from '../../components/charts/format.js';
import { useAsyncData } from '../../hooks/useAsyncData.js';
import { bankTransactionsService } from '../../services/firebase/bankTransactions.js';
import { financeApi, financeRequestId, invoiceDeliveryApi } from '../../services/firebase/financeApi.js';
import { invoicesService } from '../../services/firebase/invoices.js';
import { lessonsService } from '../../services/firebase/lessons.js';
import { paymentsService } from '../../services/firebase/payments.js';
import { revenuePlansService } from '../../services/firebase/revenuePlans.js';
import { studentsService } from '../../services/firebase/students.js';
import { hasAnyRole, ROLES } from '../../utils/roles.js';
import { todayIso } from '../cash/cashModel.js';
import { amountCents, amountText } from '../cash/lessonCash.js';
import { teacherCashDayRange } from '../cash/myCashModel.js';
import BankReconciliationPanel from './BankReconciliationPanel.jsx';
import { useIsOwner } from './fie/useIsOwner.js';
import { currentMonth, monthDates, shiftMonth } from './monthlyBilling.js';
import { monthLabel, monthReconciliation } from './monthReconciliation.js';
import PaymentDialog from './PaymentDialog.jsx';
import { isOverpaymentRefusal, paymentRecordedNotice, recordPaymentWithAdvance } from './paymentEntry.js';
import './monthReconciliation.css';

const money = (cents) => formatMoney(cents);
const dmy = (iso) => String(iso || '').split('-').reverse().join('.');

// „Sain kätte”: cash from the student for the month's lessons → the existing „Sain sularaha” receipt (off the books,
// in the cash box of the person who records it). The day must be in the reconciled month, else the row would not match.
function CashDialog({ row, month, today, busy, error, onClose, onSubmit }) {
  const allowed = teacherCashDayRange(today);
  const days = monthDates(month);
  const min = days[0] > allowed.min ? days[0] : allowed.min;
  const max = days.at(-1) < allowed.max ? days.at(-1) : allowed.max;
  const possible = min <= max;
  const [amount, setAmount] = useState(() => amountText(row.amountCents));
  const [receivedAt, setReceivedAt] = useState(max);
  const [requestId] = useState(() => financeRequestId('cash_teacher'));
  const cents = amountCents(amount);
  const dayOk = possible && receivedAt >= min && receivedAt <= max;
  return <Modal open title={`Sain kätte · ${row.name}`} onClose={onClose}
    footer={<><Button variant="secondary" disabled={busy} onClick={onClose}>Loobu</Button><Button type="submit" form="month-recon-cash" loading={busy} disabled={!cents || !dayOk}>Sain kätte</Button></>}>
    <form id="month-recon-cash" className="form-grid" onSubmit={(event) => { event.preventDefault(); if (cents && dayOk) onSubmit({ studentId: row.studentId, amount: (cents / 100).toFixed(2), receivedAt, purpose: 'lessons', lessons: row.lessonCount || null, note: `Kuu võrdlus: ${monthLabel(month)}`, requestId }); }}>
      <Input label="Summa (€)" inputMode="decimal" value={amount} onChange={(event) => setAmount(event.target.value)} />
      <Input label="Kuupäev" type="date" min={min} max={max} value={receivedAt} onChange={(event) => setReceivedAt(event.target.value)} />
      <p className="form-hint form-grid__wide">{possible
        ? `Sularaha läheb sinu kassasse („Minu kassa”) ega jõua raamatupidaja raamatutesse. Kuupäev: ${dmy(min)} – ${dmy(max)}.`
        : 'Seda kuud ei saa enam siit märkida: sularaha saab kirja panna kuni 30 päeva tagasi. Lisa kirje Kassas.'}</p>
      {error ? <p className="form-error form-grid__wide" role="alert">{error}</p> : null}
    </form>
  </Modal>;
}

export default function MonthReconciliationPage({
  invoiceRepository = invoicesService,
  planRepository = revenuePlansService,
  studentRepository = studentsService,
  lessonRepository = lessonsService,
  bankRepository = bankTransactionsService,
  paymentRepository = paymentsService,
  financeRepository = financeApi,
  deliveryRepository = invoiceDeliveryApi,
  today = todayIso(),
}) {
  const { user } = useAuth();
  const isAdmin = hasAnyRole(user?.roles, [ROLES.ADMIN]);
  const includeFie = useIsOwner();
  const [month, setMonth] = useState(() => currentMonth(new Date(`${today}T12:00:00`)));
  const [choice, setChoice] = useState(null); // the row whose „Märgi” window is open
  const [cashRow, setCashRow] = useState(null);
  const [payment, setPayment] = useState(null); // { invoice, method }
  const [overpaymentQuestion, setOverpaymentQuestion] = useState('');
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [bank, setBank] = useState(null); // null = closed; { payments } while the statement window is open

  const state = useAsyncData(async () => {
    if (!isAdmin) return null;
    const [invoices, plans, students, lessons, transactions, cash] = await Promise.all([
      invoiceRepository.list(),
      planRepository.list(),
      studentRepository.list({ status: 'active', pageSize: 500, exhaustive: true }),
      lessonRepository.listForBilling(),
      bankRepository.list(),
      // the cash box is extra: without it the screen still works, cash receipts are just not counted
      financeRepository.cashSummary().catch(() => ({ entries: [], failed: true })),
    ]);
    return { invoices, plans, students: students.items || [], lessons, transactions, cashEntries: cash.entries || [], cashFailed: cash.failed === true };
  }, [isAdmin, invoiceRepository, planRepository, studentRepository, lessonRepository, bankRepository, financeRepository]);

  const model = useMemo(() => (state.data ? monthReconciliation({ month, ...state.data, includeFie, today: new Date(`${today}T12:00:00`) }) : null), [state.data, month, includeFie, today]);

  if (!isAdmin) return <EmptyState title="Ainult administraatorile" description="Kuu võrdlust näeb ainult administraator." />;

  const closeAll = () => { setChoice(null); setCashRow(null); setPayment(null); setOverpaymentQuestion(''); setError(''); };
  const done = async (text) => { closeAll(); setNotice(text); await state.reload(); };

  const recordPayment = async (form) => {
    setBusy('payment'); setError('');
    try {
      const outcome = await recordPaymentWithAdvance(financeRepository, payment.invoice.id, form);
      setBusy(''); await done(paymentRecordedNotice(outcome, payment.invoice.num || payment.invoice.number || ''));
    } catch (caught) {
      setBusy('');
      if (isOverpaymentRefusal(caught)) setOverpaymentQuestion(caught.message || 'Arve on juba makstud. Kas registreerida ülemakse ettemaksuna?');
      else setError(caught.message || 'Makset ei saanud salvestada.');
    }
  };
  const recordCash = async (values) => {
    setBusy('cash'); setError('');
    try { await financeRepository.recordTeacherCash(values); setBusy(''); await done(`Sularaha ${money(Math.round(Number(values.amount) * 100))} märgiti kätte saaduks.`); }
    catch (caught) { setBusy(''); setError(caught.message || 'Sularaha ei saanud salvestada.'); }
  };
  const remind = async (item) => {
    setBusy('remind'); setError('');
    try { await deliveryRepository.remind(item.invoice.id); setBusy(''); await done(`Meeldetuletus arve ${item.label} kohta saadeti.`); }
    catch (caught) { setBusy(''); setError(caught.message || 'Meeldetuletust ei saanud saata.'); }
  };
  const openBank = async () => {
    setBank({ payments: [] });
    try { const payments = await paymentRepository.listAll(); setBank((current) => (current ? { payments } : current)); } catch { /* the panel works without the payer memory */ }
  };
  const closeBank = async () => { setBank(null); await state.reload(); };

  const first = choice?.invoices[0];
  return <>
    <PageHeader compact eyebrow="Finantsid" title="Kuu võrdlus" description="Kas selle kuu raha on käes? Üks rida õpilase kohta — ainult need, kus midagi ei klapi."
      actions={<Button variant="secondary" onClick={openBank}><FileUp size={17} /> Laadi väljavõte</Button>} />
    <div className="month-recon__month" role="group" aria-label="Kuu valik">
      <Button variant="secondary" aria-label="Eelmine kuu" onClick={() => setMonth(shiftMonth(month, -1))}><ChevronLeft size={17} /></Button>
      <strong aria-live="polite">{monthLabel(month)}</strong>
      <Button variant="secondary" aria-label="Järgmine kuu" disabled={month >= currentMonth(new Date(`${today}T12:00:00`))} onClick={() => setMonth(shiftMonth(month, 1))}><ChevronRight size={17} /></Button>
    </div>
    {notice ? <div className="success-notice" role="status"><span>{notice}</span><button type="button" aria-label="Sulge teade" onClick={() => setNotice('')}>×</button></div> : null}
    {state.loading && !model ? <LoadingState label="Laen kuu andmeid…" /> : null}
    {state.error ? <ErrorState title="Andmeid ei saanud laadida" description={state.error.message} onRetry={state.reload} /> : null}
    {model ? <>
      {state.data.cashFailed ? <p className="data-notice" role="status">Kassa andmeid ei saanud laadida — „Sain sularaha” kirjeid ei ole arvestatud.</p> : null}
      <Card className="month-recon__hero">
        <span className="eyebrow">Jäänud kontrollida</span>
        <strong className="month-recon__number">{model.open.length}</strong>
        <div className="month-recon__bar" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={model.percent} aria-label="Klapib"><i style={{ width: `${model.percent}%` }} /></div>
        <p>Klapib {model.matched.length} / {model.total}{model.openCents ? ` · kontrollimata ${money(model.openCents)}` : ''}</p>
      </Card>
      {!model.total ? <EmptyState title="Selles kuus pole veel midagi võrrelda" description="Kuus ei ole arveid ega toimunud tunde." /> : null}
      {model.total && !model.open.length ? <EmptyState title="Kõik klapib" description={`${monthLabel(month)}: iga õpilase raha on kirjas.`} action={<CheckCircle2 size={28} />} /> : null}
      {model.open.length ? <Card className="students-card month-recon__list">
        <ul aria-label="Ei klapi">
          {model.open.map((row) => <li key={row.key}>
            <span className="month-recon__who">
              {row.studentId ? <Link to={`/students/${row.studentId}`}>{row.name}</Link> : <strong>{row.name}</strong>}
              <small>{row.reason}{row.detail ? ` · ${row.detail}` : ''}</small>
            </span>
            <strong className="month-recon__amount">{row.amountCents ? money(row.amountCents) : '—'}</strong>
            {row.kind === 'cash'
              ? <Button onClick={() => { setError(''); setCashRow(row); }} aria-label={`Sain kätte: ${row.name}`}>Sain kätte</Button>
              : <Button variant="secondary" onClick={() => { setError(''); setChoice(row); }} aria-label={`Märgi: ${row.name}`}>Märgi</Button>}
          </li>)}
        </ul>
      </Card> : null}
      {model.matched.length ? <details className="month-recon__matched">
        <summary><CheckCircle2 size={17} /> Klapib: {model.matched.length} {model.matched.length === 1 ? 'õpilane' : 'õpilast'}</summary>
        <ul>{model.matched.map((row) => <li key={row.key}><span>{row.name}</span><small>{row.how}{row.amountCents ? ` · ${money(row.amountCents)}` : ''}</small></li>)}</ul>
      </details> : null}
    </> : null}

    <Modal open={Boolean(choice) && !payment && !cashRow} title={choice ? `${choice.name} · ${choice.reason}` : ''} onClose={() => { if (!busy) closeAll(); }} footer={<Button variant="secondary" disabled={Boolean(busy)} onClick={closeAll}>Sulge</Button>}>
      {choice?.kind === 'invoice' && first ? <div className="month-recon__choices">
        <p className="form-hint">Arve {first.label} · tasuda {money(first.balanceCents)}{choice.invoices.length > 1 ? ` · selle kuu arveid kokku ${choice.invoices.length}, alustame vanimast` : ''}</p>
        <Button onClick={() => setPayment({ invoice: first.invoice, method: 'bank' })}>Makstud ülekandega</Button>
        <Button variant="secondary" onClick={() => setPayment({ invoice: first.invoice, method: 'cash' })}>Makstud sularahas</Button>
        <Button variant="secondary" loading={busy === 'remind'} onClick={() => remind(first)}>Saada meeldetuletus</Button>
      </div> : null}
      {choice?.kind === 'lessons' ? <div className="month-recon__choices">
        <p className="form-hint">Tunnid toimusid, aga selle kuu arvet ei ole ja sularaha ei ole märgitud.</p>
        <Button onClick={() => setCashRow(choice)}>Sain sularahas kätte</Button>
        <Link className="button button--secondary" to="/finance">Koosta arve (Finantsid)</Link>
        <Link className="button button--secondary" to={`/students/${choice.studentId}`}>Ava õpilase kaart</Link>
      </div> : null}
      {error && choice && !payment && !cashRow ? <p className="form-error" role="alert">{error}</p> : null}
    </Modal>
    {payment ? <PaymentDialog key={`recon-pay-${payment.invoice.id}-${payment.method}`} invoice={payment.invoice} initialMethod={payment.method} busy={busy === 'payment'} error={error} overpaymentQuestion={overpaymentQuestion}
      onDismissOverpayment={() => setOverpaymentQuestion('')} onClose={() => { if (!busy) closeAll(); }} onSubmit={recordPayment} cashApi={financeRepository} /> : null}
    {cashRow ? <CashDialog key={`recon-cash-${cashRow.key}`} row={cashRow} month={month} today={today} busy={busy === 'cash'} error={error} onClose={() => { if (!busy) closeAll(); }} onSubmit={recordCash} /> : null}
    <Modal open={Boolean(bank)} title="Laadi pangaväljavõte (CSV)" className="finance-bank-modal" onClose={closeBank} footer={<Button variant="secondary" onClick={closeBank}>Sulge</Button>}>
      <p className="form-hint">Firma LHV konto väljavõte: LHV internetipank → Konto → Väljavõte → „Laadi alla CSV”. Süsteem leiab arve viitenumbri, maksja või lapse nime ja summa järgi ning jätab meelde, kes kelle eest maksab; kontrolli ja kinnita.</p>
      {bank && state.data ? <BankReconciliationPanel invoices={state.data.invoices} students={state.data.students} transactions={state.data.transactions} payments={bank.payments} onAllocate={(transaction) => financeRepository.allocateBankTransaction(transaction)} onReload={state.reload} /> : null}
    </Modal>
  </>;
}
