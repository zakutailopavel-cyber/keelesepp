import { ArrowRight, CircleCheck, Clock3, CreditCard, ReceiptText, Search, WalletCards } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../app/AuthContext.jsx';
import { Badge, Button, Card, EmptyState, ErrorState, Input, LoadingState, Modal, PageHeader, Select } from '../../components/ui/index.js';
import { useAsyncData } from '../../hooks/useAsyncData.js';
import { financeApi, invoicesService, paymentsService } from '../../services/firebase/index.js';
import { hasAnyRole, ROLES } from '../../utils/roles.js';
import { invoiceBalanceCents } from '../students/studentFinance.js';
import { displayDate, invoiceAmountCents, invoicePaidCents, invoiceStatus, validatePayment } from './finance.js';

const money = (value) => new Intl.NumberFormat('et-EE', { style: 'currency', currency: 'EUR' }).format(Number(value || 0) / 100);
const today = () => new Date().toISOString().slice(0, 10);
const statusLabel = { paid: 'Makstud', overdue: 'Üle tähtaja', partial: 'Osaliselt', unpaid: 'Tasumata' };
const methodLabel = { bank: 'Pangaülekanne', cash: 'Sularaha', card: 'Kaardimakse', other: 'Muu' };
const badgeTone = (value) => value === 'paid' ? 'success' : value === 'overdue' ? 'danger' : value === 'partial' ? 'info' : 'neutral';

function paymentDraft(invoice) {
  return {
    amount: (invoiceBalanceCents(invoice) / 100).toFixed(2),
    paidAt: today(),
    method: 'bank',
    reference: invoice.paymentReference || invoice.num || invoice.number || '',
    note: '',
  };
}

export default function FinancePage({ invoiceRepository = invoicesService, paymentRepository = paymentsService, financeRepository = financeApi }) {
  const { user } = useAuth();
  const canRegisterPayment = hasAnyRole(user.roles, [ROLES.ADMIN]);
  const state = useAsyncData(() => invoiceRepository.list(), [invoiceRepository]);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');
  const [selected, setSelected] = useState(null);
  const [payments, setPayments] = useState({ loading: false, items: [], error: '' });
  const [paymentMode, setPaymentMode] = useState(false);
  const [form, setForm] = useState(null);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [actionError, setActionError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    let active = true;
    if (!selected || !canRegisterPayment) {
      setPayments({ loading: false, items: [], error: '' });
      return () => { active = false; };
    }
    setPayments({ loading: true, items: [], error: '' });
    paymentRepository.listByInvoice(selected.id).then((items) => {
      if (active) setPayments({ loading: false, items, error: '' });
    }).catch((error) => {
      if (active) setPayments({ loading: false, items: [], error: error.message });
    });
    return () => { active = false; };
  }, [canRegisterPayment, paymentRepository, selected]);

  const filtered = useMemo(() => (state.data || []).filter((item) => {
    const haystack = `${item.studentName || ''} ${item.payerName || item.parentName || ''} ${item.num || item.number || item.invoiceNumber || ''}`.toLocaleLowerCase('et');
    return haystack.includes(query.toLocaleLowerCase('et')) && (status === 'all' || invoiceStatus(item) === status);
  }), [state.data, query, status]);

  const openInvoice = (invoice) => {
    setSelected(invoice);
    setPaymentMode(false);
    setForm(paymentDraft(invoice));
    setErrors({});
    setActionError('');
  };
  const closeInvoice = () => { if (!saving) { setSelected(null); setPaymentMode(false); } };
  const submitPayment = async (event) => {
    event.preventDefault();
    const validation = validatePayment(form);
    setErrors(validation.errors);
    if (!validation.valid) return;
    setSaving(true);
    setActionError('');
    try {
      await financeRepository.recordPayment(selected.id, { ...form, amount: validation.amount });
      const invoiceNumber = selected.num || selected.number || selected.invoiceNumber || '';
      setSelected(null);
      setPaymentMode(false);
      setSuccess(`Makse arvele ${invoiceNumber} on registreeritud.`);
      await state.reload();
    } catch (error) {
      setActionError(error.message || 'Makse registreerimine ebaõnnestus.');
    } finally {
      setSaving(false);
    }
  };

  if (state.loading) return <LoadingState label="Laen finantsandmeid…" />;
  if (state.error) return <ErrorState message={state.error.message} onRetry={state.reload} />;
  const invoices = state.data || [];
  const paid = invoices.reduce((sum, item) => sum + invoicePaidCents(item), 0);
  const balance = invoices.reduce((sum, item) => sum + invoiceBalanceCents(item), 0);
  const overdue = invoices.filter((item) => invoiceStatus(item) === 'overdue');
  const selectedStatus = selected ? invoiceStatus(selected) : null;
  const selectedBalance = selected ? invoiceBalanceCents(selected) : 0;

  return <div className="page-content">
    <PageHeader eyebrow="Finantsid" title="Arved ja maksed" description="Reaalne ülevaade laekumistest, võlgadest ja arvete olekust." />
    {success ? <div className="success-notice" role="status">{success}<button aria-label="Sulge teade" onClick={() => setSuccess('')}>×</button></div> : null}
    <section className="metric-grid metric-grid--three">
      <Card className="metric-card metric-card--green"><div className="metric-card__top"><span>Laekunud</span><i><CircleCheck size={19} /></i></div><strong>{money(paid)}</strong><small>kõigi arvete lõikes</small></Card>
      <Card className="metric-card metric-card--amber"><div className="metric-card__top"><span>Laekumata</span><i><Clock3 size={19} /></i></div><strong>{money(balance)}</strong><small>{overdue.length} tähtaja ületanud</small></Card>
      <Card className="metric-card metric-card--blue"><div className="metric-card__top"><span>Arveid kokku</span><i><ReceiptText size={19} /></i></div><strong>{invoices.length}</strong><small>andmebaasis</small></Card>
    </section>
    <Card className="list-card finance-list">
      <div className="list-toolbar"><div className="search-field"><Search size={18} /><input aria-label="Otsi arvet" placeholder="Otsi õpilase, maksja või arve numbri järgi" value={query} onChange={(event) => setQuery(event.target.value)} /></div><Select aria-label="Arve staatus" value={status} onChange={(event) => setStatus(event.target.value)}><option value="all">Kõik staatused</option><option value="unpaid">Tasumata</option><option value="partial">Osaliselt</option><option value="overdue">Üle tähtaja</option><option value="paid">Makstud</option></Select></div>
      {filtered.length ? <><div className="students-table-wrap"><table className="students-table finance-table"><thead><tr><th>Arve</th><th>Õpilane</th><th>Kuupäev</th><th>Tähtaeg</th><th>Summa</th><th>Jääk</th><th>Staatus</th><th><span className="sr-only">Tegevus</span></th></tr></thead><tbody>{filtered.map((item) => { const value = invoiceStatus(item); return <tr key={item.id} onClick={() => openInvoice(item)}><td><button className="invoice-link" onClick={(event) => { event.stopPropagation(); openInvoice(item); }}>{item.num || item.number || item.invoiceNumber || `#${item.id.slice(0, 6)}`}</button></td><td>{item.studentName || '—'}</td><td>{displayDate(item.date || item.createdAt)}</td><td>{displayDate(item.due || item.dueDate)}</td><td>{money(invoiceAmountCents(item))}</td><td><strong>{money(invoiceBalanceCents(item))}</strong></td><td><Badge tone={badgeTone(value)}>{statusLabel[value]}</Badge></td><td><ArrowRight size={17} aria-hidden="true" /></td></tr>; })}</tbody></table></div><div className="students-mobile-list">{filtered.map((item) => { const value = invoiceStatus(item); return <button className="finance-mobile-card" key={item.id} onClick={() => openInvoice(item)}><div><strong>{item.num || item.number || item.invoiceNumber || `#${item.id.slice(0, 6)}`}</strong><Badge tone={badgeTone(value)}>{statusLabel[value]}</Badge></div><span>{item.studentName || 'Õpilane määramata'}</span><dl><div><dt>Summa</dt><dd>{money(invoiceAmountCents(item))}</dd></div><div><dt>Jääk</dt><dd>{money(invoiceBalanceCents(item))}</dd></div></dl></button>; })}</div></> : <EmptyState title="Sobivaid arveid ei leitud" description="Muuda otsingut või filtrit." />}
    </Card>
    <Modal open={Boolean(selected)} title={paymentMode ? 'Registreeri makse' : `Arve ${selected?.num || selected?.number || selected?.invoiceNumber || ''}`} onClose={closeInvoice} footer={selected && !paymentMode ? <><Button variant="secondary" onClick={closeInvoice}>Sulge</Button>{canRegisterPayment && selectedBalance > 0 ? <Button onClick={() => setPaymentMode(true)}><CreditCard size={17} /> Registreeri makse</Button> : null}</> : paymentMode ? <><Button variant="secondary" disabled={saving} onClick={() => { setPaymentMode(false); setActionError(''); }}>Tagasi</Button><Button type="submit" form="payment-form" loading={saving}><WalletCards size={17} /> Kinnita makse</Button></> : null}>
      {selected && !paymentMode ? <div className="invoice-detail">
        <div className="invoice-detail__hero"><div><span className="eyebrow">Tasumisele kuuluv jääk</span><strong>{money(selectedBalance)}</strong><small>Kogusumma {money(invoiceAmountCents(selected))}</small></div><Badge tone={badgeTone(selectedStatus)}>{statusLabel[selectedStatus]}</Badge></div>
        <dl className="invoice-detail__facts"><div><dt>Õpilane</dt><dd>{selected.studentId ? <Link to={`/students/${selected.studentId}`}>{selected.studentName || 'Ava õpilane'} <ArrowRight size={14} /></Link> : selected.studentName || '—'}</dd></div><div><dt>Maksja</dt><dd>{selected.payerName || selected.parentName || '—'}</dd></div><div><dt>Arve kuupäev</dt><dd>{displayDate(selected.date || selected.createdAt)}</dd></div><div><dt>Maksetähtaeg</dt><dd>{displayDate(selected.due || selected.dueDate)}</dd></div><div><dt>Viitenumber</dt><dd className="mono">{selected.paymentReference || '—'}</dd></div><div><dt>Tunde</dt><dd>{selected.lessonCount ?? selected.lessonIds?.length ?? '—'}</dd></div></dl>
        {selected.desc ? <div className="invoice-description"><span>Kirjeldus</span><p>{selected.desc}</p></div> : null}
        <section className="payment-history"><div className="section-heading"><div><span className="eyebrow">Maksed</span><h2>Laekumiste ajalugu</h2></div><strong>{money(invoicePaidCents(selected))}</strong></div>{!canRegisterPayment ? <p className="form-hint">Makseajalugu on nähtav administraatorile.</p> : payments.loading ? <p className="form-hint">Laen makseid…</p> : payments.error ? <p className="form-error">{payments.error}</p> : payments.items.length ? <div className="payment-list">{payments.items.map((payment) => <div key={payment.id} className={payment.status === 'voided' ? 'is-voided' : ''}><CreditCard size={18} /><div><strong>{money(invoiceAmountCents(payment))}</strong><span>{displayDate(payment.paidAt)} · {methodLabel[payment.method] || payment.method || 'Makse'}</span>{payment.reference ? <small>Viide: {payment.reference}</small> : null}</div><Badge tone={payment.status === 'voided' ? 'danger' : 'success'}>{payment.status === 'voided' ? 'Tühistatud' : 'Kinnitatud'}</Badge></div>)}</div> : <p className="form-hint">Sellele arvele ei ole veel makseid registreeritud.</p>}</section>
      </div> : null}
      {selected && paymentMode ? <form id="payment-form" className="payment-form" onSubmit={submitPayment}>
        <div className="payment-context"><span>Arve {selected.num || selected.number || selected.invoiceNumber}</span><strong>Jääk {money(selectedBalance)}</strong></div>
        {actionError ? <div className="action-error" role="alert">{actionError}<button type="button" aria-label="Sulge viga" onClick={() => setActionError('')}>×</button></div> : null}
        <div className="form-grid"><Input id="payment-amount" label="Laekunud summa (€)" inputMode="decimal" value={form.amount} error={errors.amount} onChange={(event) => setForm({ ...form, amount: event.target.value })} required /><Input id="payment-date" label="Makse kuupäev" type="date" value={form.paidAt} error={errors.paidAt} onChange={(event) => setForm({ ...form, paidAt: event.target.value })} required /><Select id="payment-method" label="Makseviis" value={form.method} onChange={(event) => setForm({ ...form, method: event.target.value })}><option value="bank">Pangaülekanne</option><option value="cash">Sularaha</option><option value="card">Kaardimakse</option><option value="other">Muu</option></Select><Input id="payment-reference" label="Viide" value={form.reference} onChange={(event) => setForm({ ...form, reference: event.target.value })} /><label className="field form-grid__wide"><span className="field__label">Märkus</span><textarea rows="3" value={form.note} onChange={(event) => setForm({ ...form, note: event.target.value })} placeholder="Valikuline sisemine märkus" /></label></div>
        {Number(String(form.amount || '').replace(',', '.')) > selectedBalance / 100 ? <p className="payment-warning">Sisestatud summa ületab arve jääki. Ülejääk registreeritakse ettemaksuna.</p> : null}
        <p className="payment-confirmation">Kinnitamisel luuakse muutmatu maksekirje ja finantsauditi kanne. Kontrolli summat enne salvestamist.</p>
      </form> : null}
    </Modal>
  </div>;
}
