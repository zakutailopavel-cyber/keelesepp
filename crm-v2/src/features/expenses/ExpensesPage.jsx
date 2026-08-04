import { ArrowLeft, Ban, Eye, FileText, FileUp, Pencil, Plus, ReceiptText, Search, WalletCards } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Badge, Button, Card, EmptyState, ErrorState, Input, LoadingState, Modal, PageHeader, Select } from '../../components/ui/index.js';
import { useAsyncData } from '../../hooks/useAsyncData.js';
import { expensesService } from '../../services/firebase/index.js';
import { categoryLabel, EXPENSE_CATEGORIES, EXPENSE_PAYMENT_METHODS, expenseTotals, filterExpenses, paymentMethodLabel, validateExpenseForm } from './expenses.js';
import './expenses.css';

const today = () => new Date().toISOString().slice(0, 10);
const currentMonth = () => today().slice(0, 7);
const blankForm = () => ({ expenseDate: today(), category: 'other', description: '', amount: '', vatAmount: '0', paymentMethod: 'bank', note: '' });
const money = (cents) => new Intl.NumberFormat('et-EE', { style: 'currency', currency: 'EUR' }).format(Number(cents || 0) / 100);
const dateLabel = (value) => value ? new Date(`${value}T12:00:00`).toLocaleDateString('et-EE') : '—';
const statusMeta = {
  active: ['Aktiivne', 'success'],
  corrected: ['Parandatud', 'neutral'],
  voided: ['Tühistatud', 'danger'],
};

function ExpenseFields({ form, setForm }) {
  return <div className="form-grid">
    <Input id="expense-date" label="Kuupäev" type="date" value={form.expenseDate} required onChange={(event) => setForm({ ...form, expenseDate: event.target.value })} />
    <Select id="expense-category" label="Kategooria" value={form.category} required onChange={(event) => setForm({ ...form, category: event.target.value })}>{EXPENSE_CATEGORIES.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</Select>
    <Input id="expense-description" className="form-grid__wide" label="Kirjeldus" value={form.description} maxLength="500" required onChange={(event) => setForm({ ...form, description: event.target.value })} />
    <Input id="expense-amount" label="Summa koos KM-ga (€)" inputMode="decimal" value={form.amount} required onChange={(event) => setForm({ ...form, amount: event.target.value })} />
    <Input id="expense-vat" label="Käibemaks (€)" inputMode="decimal" value={form.vatAmount} required onChange={(event) => setForm({ ...form, vatAmount: event.target.value })} />
    <Select id="expense-payment-method" label="Makseviis" value={form.paymentMethod} onChange={(event) => setForm({ ...form, paymentMethod: event.target.value })}>{EXPENSE_PAYMENT_METHODS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</Select>
    <Input id="expense-note" label="Märkus (valikuline)" value={form.note} maxLength="1000" onChange={(event) => setForm({ ...form, note: event.target.value })} />
  </div>;
}

export default function ExpensesPage({ repository = expensesService }) {
  const [month, setMonth] = useState(currentMonth);
  const [query, setQuery] = useState('');
  const [editor, setEditor] = useState(null);
  const [form, setForm] = useState(blankForm);
  const [reason, setReason] = useState('');
  const [voidTarget, setVoidTarget] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const state = useAsyncData(() => repository.list(), [repository]);
  const visible = useMemo(() => filterExpenses(state.data || [], month, query), [state.data, month, query]);
  const totals = useMemo(() => expenseTotals(visible), [visible]);

  const openCreate = () => { setEditor({ mode: 'create' }); setForm(blankForm()); setReason(''); setError(''); };
  const openCorrection = (expense) => {
    setEditor({ mode: 'correct', expense });
    setForm({
      expenseDate: expense.expenseDate || today(),
      category: expense.category || 'other',
      description: expense.description || '',
      amount: String(Number(expense.amountCents || 0) / 100),
      vatAmount: String(Number(expense.vatAmountCents || 0) / 100),
      paymentMethod: expense.paymentMethod || 'bank',
      note: expense.note || '',
    });
    setReason(''); setError('');
  };
  const closeEditor = () => { if (!saving) { setEditor(null); setError(''); } };
  const submitExpense = async (event) => {
    event.preventDefault();
    const validation = validateExpenseForm(form);
    if (validation) { setError(validation); return; }
    if (editor.mode === 'correct' && !reason.trim()) { setError('Lisa paranduse põhjus.'); return; }
    setSaving(true); setError('');
    try {
      if (editor.mode === 'correct') {
        await repository.correct(editor.expense.id, form, reason.trim());
        setSuccess('Kulu parandus salvestati. Algne kirje jäi ajalukku.');
      } else {
        await repository.create(form);
        setSuccess('Kulu lisati.');
      }
      setEditor(null);
      await state.reload();
    } catch (nextError) { setError(nextError.message || 'Kulu salvestamine ebaõnnestus.'); }
    finally { setSaving(false); }
  };
  const submitVoid = async (event) => {
    event.preventDefault();
    if (!reason.trim()) { setError('Lisa tühistamise põhjus.'); return; }
    setSaving(true); setError('');
    try {
      await repository.void(voidTarget.id, reason.trim());
      setSuccess('Kulu tühistati ja säilitati ajaloos.');
      setVoidTarget(null); setReason('');
      await state.reload();
    } catch (nextError) { setError(nextError.message || 'Kulu tühistamine ebaõnnestus.'); }
    finally { setSaving(false); }
  };
  const upload = async (expense, file) => {
    if (!file) return;
    setSaving(true); setError('');
    try {
      await repository.uploadDocument(expense.id, file);
      setSuccess(`Fail „${file.name}” lisati kulule.`);
      await state.reload();
    } catch (nextError) { setError(nextError.message || 'Faili lisamine ebaõnnestus.'); }
    finally { setSaving(false); }
  };
  const preview = async (document) => {
    try {
      const url = await repository.getDocumentUrl(document);
      globalThis.open(url, '_blank', 'noopener,noreferrer');
    } catch (nextError) { setError(nextError.message || 'Faili avamine ebaõnnestus.'); }
  };

  if (state.loading) return <LoadingState label="Laen kulusid…" />;
  if (state.error) return <ErrorState message={state.error.message} onRetry={state.reload} />;

  return <div className="page-content expenses-page">
    <Link className="back-link" to="/finance"><ArrowLeft size={17} /> Tagasi finantsidesse</Link>
    <PageHeader eyebrow="Kulud" title="Kulude register" description="Keeleõppega seotud kulud, käibemaks ja kuludokumendid ühes kontrollitavas vaates." actions={<Button onClick={openCreate}><Plus size={17} /> Lisa uus kulu</Button>} />
    {success ? <div className="success-notice" role="status">{success}<button aria-label="Sulge teade" onClick={() => setSuccess('')}>×</button></div> : null}
    {error && !editor && !voidTarget ? <div className="expense-error" role="alert">{error}<button aria-label="Sulge veateade" onClick={() => setError('')}>×</button></div> : null}
    <section className="metric-grid">
      <Card className="metric-card metric-card--amber"><div className="metric-card__top"><span>Kulud kokku</span><i><WalletCards size={19} /></i></div><strong>{money(totals.amountCents)}</strong><small>{totals.count} aktiivset kirjet</small></Card>
      <Card className="metric-card metric-card--blue"><div className="metric-card__top"><span>Käibemaks</span><i><ReceiptText size={19} /></i></div><strong>{money(totals.vatAmountCents)}</strong><small>eraldi arvestatud KM</small></Card>
      <Card className="metric-card metric-card--green"><div className="metric-card__top"><span>Netokulu</span><i><WalletCards size={19} /></i></div><strong>{money(totals.netAmountCents)}</strong><small>summa ilma KM-ta</small></Card>
      <Card className="metric-card metric-card--purple"><div className="metric-card__top"><span>Dokumendid</span><i><FileText size={19} /></i></div><strong>{totals.documentCount}</strong><small>aktiivsete kulude failid</small></Card>
    </section>
    <Card className="expenses-toolbar"><div className="search-field"><Search size={17} /><input aria-label="Otsi kuludest" placeholder="Otsi kirjelduse või kategooria järgi…" value={query} onChange={(event) => setQuery(event.target.value)} /></div><Input aria-label="Kulude kuu" type="month" value={month} onChange={(event) => setMonth(event.target.value)} /></Card>
    <Card className="expenses-card">
      {visible.length ? <div className="students-table-wrap expense-table-wrap"><table className="students-table expense-table"><thead><tr><th>Kuupäev</th><th>Kulu</th><th>Summa</th><th>KM</th><th>Makseviis</th><th>Dokumendid</th><th>Olek</th><th>Tegevus</th></tr></thead><tbody>{visible.map((expense) => { const meta = statusMeta[expense.status] || [expense.status, 'neutral']; return <tr key={expense.id} className={expense.status !== 'active' ? 'expense-row--inactive' : ''}><td>{dateLabel(expense.expenseDate)}</td><td><strong>{expense.description}</strong><span>{categoryLabel(expense.category)}{expense.note ? ` · ${expense.note}` : ''}</span></td><td><strong>{money(expense.amountCents)}</strong><span>neto {money(expense.netAmountCents)}</span></td><td>{money(expense.vatAmountCents)}</td><td>{paymentMethodLabel(expense.paymentMethod)}</td><td><div className="expense-documents">{(expense.documents || []).map((document) => <Button key={document.id} variant="secondary" title={document.fileName} onClick={() => preview(document)}><Eye size={15} /> {document.fileName}</Button>)}{expense.status === 'active' ? <label className={`button button--secondary expense-upload ${saving ? 'is-disabled' : ''}`}><FileUp size={15} /> Lisa fail<input aria-label={`Lisa fail kulule ${expense.description}`} type="file" accept="application/pdf,image/jpeg,image/png,image/webp" disabled={saving} onChange={(event) => { upload(expense, event.target.files?.[0]); event.target.value = ''; }} /></label> : null}</div></td><td><Badge tone={meta[1]}>{meta[0]}</Badge>{expense.correctsExpenseId ? <span>Parandus kirjele {expense.correctsExpenseId.slice(0, 8)}…</span> : null}</td><td>{expense.status === 'active' ? <div className="expense-actions"><Button variant="secondary" onClick={() => openCorrection(expense)}><Pencil size={15} /> Paranda</Button><Button variant="danger" onClick={() => { setVoidTarget(expense); setReason(''); setError(''); }}><Ban size={15} /> Tühista</Button></div> : '—'}</td></tr>; })}</tbody></table></div> : <EmptyState title="Valitud kuul kulusid ei ole" description="Lisa esimene kulu või vali teine kuu." />}
    </Card>

    <Modal open={Boolean(editor)} title={editor?.mode === 'correct' ? 'Paranda kulu' : 'Lisa kulu'} onClose={closeEditor} footer={<><Button variant="secondary" disabled={saving} onClick={closeEditor}>Loobu</Button><Button type="submit" form="expense-form" loading={saving}>{editor?.mode === 'correct' ? 'Salvesta parandus' : 'Lisa kulu'}</Button></>}><form id="expense-form" className="expense-form" onSubmit={submitExpense}>{editor?.mode === 'correct' ? <p className="form-hint">Algset kirjet ei kirjutata üle: parandus luuakse uue kirjena ja seotakse ajalooga.</p> : null}{error ? <p className="form-error" role="alert">{error}</p> : null}<ExpenseFields form={form} setForm={setForm} />{editor?.mode === 'correct' ? <label className="textarea-field"><span>Paranduse põhjus *</span><textarea aria-label="Paranduse põhjus" rows="3" value={reason} onChange={(event) => setReason(event.target.value)} /></label> : null}</form></Modal>
    <Modal open={Boolean(voidTarget)} title="Tühista kulu" onClose={() => !saving && setVoidTarget(null)} footer={<><Button variant="secondary" disabled={saving} onClick={() => setVoidTarget(null)}>Loobu</Button><Button variant="danger" type="submit" form="expense-void-form" loading={saving}>Tühista kulu</Button></>}><form id="expense-void-form" className="expense-form" onSubmit={submitVoid}><p className="form-hint">Kirjet ei kustutata. See jääb kontrollitava ajaloona alles, kuid eemaldatakse aktiivsete kulude summast.</p>{error ? <p className="form-error" role="alert">{error}</p> : null}<label className="textarea-field"><span>Tühistamise põhjus *</span><textarea aria-label="Tühistamise põhjus" rows="4" value={reason} onChange={(event) => setReason(event.target.value)} /></label></form></Modal>
  </div>;
}
