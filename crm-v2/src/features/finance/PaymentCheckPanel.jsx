import { CheckCircle2, FileUp, RefreshCw } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Badge, Button, Card, EmptyState, LoadingState, Modal } from '../../components/ui/index.js';
import { paymentsService } from '../../services/firebase/payments.js';
import { displayDate } from './finance.js';
import { missingPaymentRecord, reconcilePayments } from './paymentReconciliation.js';
import BankReconciliationPanel from './BankReconciliationPanel.jsx';
import './paymentCheck.css';

const money = (value) => new Intl.NumberFormat('et-EE', { style: 'currency', currency: 'EUR' }).format(Number(value || 0) / 100);
const paymentLine = (payment) => `${displayDate(payment.paidAt)} · ${money(payment.amountCents ?? Math.round(Number(payment.amount || 0) * 100))}${payment.createdBy?.name ? ` · ${payment.createdBy.name}` : ''}`;

const SECTIONS = [
  ['duplicate', 'Sama makse on sisestatud kaks korda', 'Tühista korduv kirje: arve jääb makstuks.'],
  ['overpaid', 'Makstud rohkem kui arve summa', 'Kanna ülejääk maksja ettemaksuks (järgmise arve jaoks).'],
  ['missingPayment', 'Arve on makstud, makse kirje puudub', 'Vanad arved, mis märgiti makstuks enne maksete registreerimist. Lisa makse kirje: summa ja kuupäev arvelt.'],
  ['statusMismatch', 'Arve olek ei vasta maksetele', 'Kontrolli arvet: osa makset puudub või olek on vale.'],
  ['cancelledWithPayment', 'Tühistatud arvel on makse', 'Raha on laekunud tühistatud arvele: seo see uue arvega või tagasta.'],
  ['unknownInvoice', 'Makse arvele, mida ei leita', 'Makse kirje viitab arvele, mida enam ei ole.'],
  ['unapplied', 'Raha ilma arveta', 'Pangast laekunud raha, mis ei ole veel ühelgi arvel: seo see vaates „Ette makstud”.'],
];

// „Kontroll”: invoices against payment records and the bank (owner 2026-10-15). Fixes go through the finance API.
export default function PaymentCheckPanel({ invoices = [], transactions = [], students = [], financeRepository, paymentRepository = paymentsService, onAllocate, onReload, onOpenCredits, onNotice }) {
  const [payments, setPayments] = useState(null);
  const [loadError, setLoadError] = useState('');
  const [busy, setBusy] = useState('');
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [importOpen, setImportOpen] = useState(false);

  const load = useCallback(async () => {
    setLoadError('');
    try { setPayments(await paymentRepository.listAll()); } catch (caught) { setLoadError(caught.message || 'Makseid ei saanud laadida.'); }
  }, [paymentRepository]);
  useEffect(() => { load(); }, [load]);

  const report = useMemo(() => (payments ? reconcilePayments({ invoices, payments, transactions }) : null), [invoices, payments, transactions]);
  const refresh = async () => { await onReload?.(); await load(); };
  const act = async (key, work, done) => {
    setBusy(key); setError(''); setNotice('');
    // the page shows the notice (a reload of the finance data re-mounts this panel)
    try { await work(); if (onNotice) onNotice(done); else setNotice(done); await refresh(); } catch (caught) { setError(caught.message || 'Muudatust ei saanud salvestada.'); } finally { setBusy(''); }
  };
  const addMissing = (item) => act(`missing-${item.invoice.id}`, () => financeRepository.recordPayment(item.invoice.id, missingPaymentRecord(item.invoice)), `Arvele ${item.label} lisati makse kirje.`);
  const addAllMissing = (items) => act('missing-all', async () => {
    for (const item of items) await financeRepository.recordPayment(item.invoice.id, missingPaymentRecord(item.invoice));
  }, `Makse kirje lisati ${items.length} arvele.`);
  const voidDuplicate = (item, payment) => {
    if (!globalThis.confirm(`Tühistada korduv makse ${paymentLine(payment)} arvelt ${item.label}?`)) return;
    act(`void-${payment.id}`, () => financeRepository.voidPayment(payment.id, 'Kontroll: sama makse oli sisestatud kaks korda'), `Korduv makse arvelt ${item.label} tühistati.`);
  };
  const moveOverpayment = (item) => act(`over-${item.invoice.id}`, () => financeRepository.resolveInvoiceOverpayment(item.invoice.id, 'Kontroll: ülemakse maksja ettemaksuks'), `Arve ${item.label} ülejääk kanti ettemaksuks.`);

  const actions = (kind, item) => {
    if (kind === 'duplicate') return item.duplicates.map((payment) => <Button key={payment.id} variant="danger" loading={busy === `void-${payment.id}`} disabled={Boolean(busy)} onClick={() => voidDuplicate(item, payment)}>Tühista korduv</Button>);
    if (kind === 'overpaid') return <Button variant="secondary" loading={busy === `over-${item.invoice.id}`} disabled={Boolean(busy)} onClick={() => moveOverpayment(item)}>Ülejääk ettemaksuks</Button>;
    if (kind === 'missingPayment') return <Button variant="secondary" loading={busy === `missing-${item.invoice.id}`} disabled={Boolean(busy)} onClick={() => addMissing(item)}>Lisa makse kirje</Button>;
    if (kind === 'unapplied' && onOpenCredits) return <Button variant="secondary" onClick={onOpenCredits}>Ava „Ette makstud”</Button>;
    return null;
  };
  const describe = (kind, item) => {
    if (kind === 'unapplied') return <><strong>{item.label}</strong><small>{displayDate(item.transaction.paidAt)} · {item.transaction.reference || 'selgituseta'}{item.transaction.creditStudentName ? ` · ettemaks: ${item.transaction.creditStudentName}` : ''}</small></>;
    if (kind === 'unknownInvoice') return <><strong>{item.label}</strong><small>{paymentLine(item.payment)}</small></>;
    const invoice = item.invoice;
    return <><strong>{item.label} · {invoice.studentName || invoice.payerName || '—'}</strong>
      <small>Arve {displayDate(invoice.date)} · {money(item.amountCents)} · maksetes {money(item.paidCents)}{item.note ? ` · ${item.note}` : ''}</small>
      {item.payments.length ? <small>{item.payments.map(paymentLine).join(' | ')}</small> : null}</>;
  };

  return <Card className="payment-check">
    <div className="payment-check__heading">
      <div><span className="eyebrow">Kontroll</span><h2>Arved ja maksed</h2><p>Iga arve võrreldakse maksete kirjetega; pangast laekunud raha, mis ei ole arvel, on eraldi.</p></div>
      <div><Button variant="secondary" onClick={() => setImportOpen(true)}><FileUp size={17} /> Impordi LHV väljavõte</Button><Button variant="secondary" aria-label="Värskenda" onClick={refresh}><RefreshCw size={16} /></Button></div>
    </div>
    {loadError ? <p className="action-error" role="alert">{loadError}</p> : null}
    {!report && !loadError ? <LoadingState label="Laen makseid…" /> : null}
    {report ? <>
      <dl className="payment-check__summary">
        <div><dt>Arved kokku</dt><dd>{money(report.invoicedCents)}</dd></div>
        <div><dt>Maksete kirjed</dt><dd>{money(report.recordedCents)}</dd></div>
        <div><dt>Leitud erinevusi</dt><dd>{report.count}</dd></div>
      </dl>
      {notice ? <p className="payment-check__notice" role="status">{notice}</p> : null}
      {error ? <p className="action-error" role="alert">{error}</p> : null}
      {!report.count ? <EmptyState title="Kõik klapib" description="Iga arve olek vastab maksetele ja kogu laekunud raha on arvetel." action={<CheckCircle2 size={28} />} /> : null}
      {SECTIONS.filter(([kind]) => report.issues[kind].length).map(([kind, title, hint]) => <section key={kind} className="payment-check__section" aria-label={title}>
        <header><div><h3>{title} <Badge tone={kind === 'unapplied' || kind === 'missingPayment' ? 'info' : 'danger'}>{report.issues[kind].length}</Badge></h3><p>{hint}</p></div>
          {kind === 'missingPayment' && report.issues[kind].length > 1 ? <Button loading={busy === 'missing-all'} disabled={Boolean(busy)} onClick={() => addAllMissing(report.issues[kind])}>Lisa kõigile ({report.issues[kind].length})</Button> : null}</header>
        {report.issues[kind].map((item) => <div className="payment-check__row" key={item.invoice?.id || item.payment?.id || item.transaction?.id}>
          <span>{describe(kind, item)}</span><span className="payment-check__actions">{actions(kind, item)}</span>
        </div>)}
      </section>)}
    </> : null}
    <Modal open={importOpen} title="Impordi LHV pangaväljavõte (CSV)" className="finance-bank-modal" onClose={() => { setImportOpen(false); refresh(); }} footer={<Button variant="secondary" onClick={() => { setImportOpen(false); refresh(); }}>Sulge</Button>}>
      <p className="form-hint">LHV internetipank → Konto → Väljavõte → vali periood → „Laadi alla CSV”. Süsteem leiab arve viitenumbri, arve numbri, maksja või lapse nime ja summa järgi; kontrolli ja kinnita.</p>
      <BankReconciliationPanel invoices={invoices} students={students} transactions={transactions} onAllocate={onAllocate} onReload={refresh} />
    </Modal>
  </Card>;
}
