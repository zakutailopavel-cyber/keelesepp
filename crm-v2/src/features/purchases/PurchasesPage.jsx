import { ArrowLeft, Ban, Download, Eye, FilePlus2, FileUp, Lock, Pencil, Wallet, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, Card, EmptyState, ErrorState, Input, LoadingState, Modal, PageHeader, Select } from '../../components/ui/index.js';
import { useAsyncData } from '../../hooks/useAsyncData.js';
import { purchasesService } from '../../services/firebase/index.js';
import { downloadWorkbook, purchaseInvoicesWorkbook, suppliersWorkbook } from '../accounting/accountingExcel.js';
import { COMPANY, amount, dmy, isLockedDate, parseEuro } from '../accounting/accountingReports.js';
import PurchaseInvoiceDraft from './PurchaseInvoiceDraft.jsx';
import SuppliersPanel from './SuppliersPanel.jsx';
import { PAYMENT_METHODS, STATUS_LABELS, blankPurchaseDraft, blankPurchaseLine, draftFromInvoice, draftPayload, filterInvoices, invoiceTotals, methodLabel, overdue } from './purchases.js';
import '../accounting/accounting.css';
import './purchases.css';

// Ostuarved and Tarnijad (the accountant 2026-10-23, docs/ACCOUNTING.md): a supplier's invoice is typed into the grid
// row by row; saving it books the OA Ostuarve kanne (debit the cost, credit 2110), a payment books the VM Väljamakse
// kanne (debit 2110, credit the bank). Replaces the old „Kulud” register for new costs.
const today = () => new Date().toISOString().slice(0, 10);

export default function PurchasesPage({ repository = purchasesService }) {
  const state = useAsyncData(() => repository.load(), [repository]);
  const [tab, setTab] = useState('invoices');
  const [period, setPeriod] = useState({ from: `${today().slice(0, 4)}-01-01`, to: '' });
  const [status, setStatus] = useState('');
  const [query, setQuery] = useState('');
  const [editor, setEditor] = useState(null);
  const [paying, setPaying] = useState(null);
  const [dialog, setDialog] = useState(null);
  const [busy, setBusy] = useState('');
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  const data = state.data || { suppliers: [], invoices: [], accounts: [], lockedThrough: '' };
  const accounts = data.accounts;
  const lockedThrough = data.lockedThrough || '';
  const visible = useMemo(() => filterInvoices(data.invoices, { ...period, status, query }), [data.invoices, period, status, query]);
  const totals = useMemo(() => invoiceTotals(visible), [visible]);
  const accountName = (code) => accounts.find((a) => a.code === code)?.name || '';

  const run = async (label, action, success) => {
    setBusy(label); setError('');
    try {
      const result = await action();
      if (success) setNotice(typeof success === 'function' ? success(result) : success);
      await state.reload();
      return true;
    } catch (nextError) {
      setError(nextError.message || 'Toiming ebaõnnestus.');
      return false;
    } finally { setBusy(''); }
  };

  const openNew = () => { setPaying(null); setError(''); setEditor({ id: '', draft: blankPurchaseDraft(today()), lines: [blankPurchaseLine(), blankPurchaseLine()], reason: '' }); };
  const openEdit = (invoice) => { setPaying(null); setError(''); setEditor({ id: invoice.id, ...draftFromInvoice(invoice), reason: '' }); };
  const cancelEditor = () => { if (!busy) { setEditor(null); setError(''); } };
  const saveEditor = async () => {
    const payload = draftPayload(editor.draft, editor.lines);
    const options = editor.id ? { reason: editor.reason.trim() } : { paidNow: editor.draft.paidNow ? { date: editor.draft.date, method: editor.draft.method } : null };
    const ok = await run('save', () => repository.saveInvoice(editor.id, payload, options), (r) => (editor.id ? `Ostuarve ${payload.documentNumber} parandati; kanne muudeti koos ajalooga.` : `Ostuarve ${payload.documentNumber} salvestati (kanne ${r.purchaseInvoice?.entryNumber || ''}).`));
    if (ok) setEditor(null);
  };
  const openPay = (invoice) => { setEditor(null); setError(''); setPaying({ id: invoice.id, date: today(), amount: amount(invoice.totalCents - (invoice.paidCents || 0)).replace(/\s/g, ''), method: 'bank' }); };
  const savePay = async () => {
    const cents = parseEuro(paying.amount);
    if (!cents || Number.isNaN(cents)) { setError('Summa peab olema kujul 123,45.'); return; }
    if (await run('pay', () => repository.pay(paying.id, { date: paying.date, amountCents: cents, method: paying.method }), 'Tasumine salvestati (VM kanne).')) setPaying(null);
  };
  const submitDialog = async (event) => {
    event.preventDefault();
    if (!dialog.reason.trim()) { setError('Lisa põhjus.'); return; }
    const ok = dialog.kind === 'void'
      ? await run('save', () => repository.voidInvoice(dialog.invoice.id, dialog.reason.trim()), `Ostuarve ${dialog.invoice.documentNumber} tühistati.`)
      : await run('save', () => repository.removePayment(dialog.invoice.id, dialog.payment.id, dialog.reason.trim()), 'Tasumine eemaldati; selle kanne jäi ajalukku.');
    if (ok) setDialog(null);
  };
  const upload = (invoice, file) => file && run('upload', () => repository.uploadDocument(invoice.id, file), `Fail „${file.name}” lisati arvele ${invoice.documentNumber}.`);
  const preview = async (document) => {
    try {
      globalThis.open(await repository.getDocumentUrl(document), '_blank', 'noopener,noreferrer');
    } catch (nextError) { setError(nextError.message || 'Faili avamine ebaõnnestus.'); }
  };
  const saveSupplier = async (supplierId, values) => {
    setBusy('supplier'); setError('');
    try {
      await repository.saveSupplier(supplierId, values);
      setNotice(`Tarnija ${values.name} salvestati.`);
      await state.reload();
      return '';
    } catch (nextError) {
      return nextError.message || 'Salvestamine ebaõnnestus.';
    } finally { setBusy(''); }
  };
  const importSuppliers = async (rows) => {
    const result = await repository.importSuppliers(rows);
    setNotice(`Imporditi ${result?.created?.length ?? rows.length} tarnijat.`);
    await state.reload();
  };
  const exportFile = () => {
    if (tab === 'suppliers') downloadWorkbook(suppliersWorkbook(data.suppliers, { company: COMPANY }), 'tarnijad.xls');
    else downloadWorkbook(purchaseInvoicesWorkbook(visible, { company: COMPANY, period, accounts, statusLabels: STATUS_LABELS }), `ostuarved_${period.from || 'algus'}_${period.to || today()}.xls`);
  };

  if (state.loading && !state.data) return <LoadingState label="Laen ostuarveid…" />;
  if (state.error) return <ErrorState message={state.error.message} onRetry={state.reload} />;

  return <div className="page-content accounting-page purchases-page">
    <Link className="back-link" to="/finance/raamatupidamine"><ArrowLeft size={17} /> Raamatupidamine</Link>
    <PageHeader eyebrow="Finantsid" title="Ostuarved" description="Tarnijate arved rida-realt nagu Excelis. Salvestamisel tekib OA ostuarve kanne (D kulu, K 2110 Võlad tarnijatele), tasumisel VM väljamakse kanne (D 2110, K pank)."
      actions={<>
        <Button variant="secondary" onClick={exportFile}><Download size={17} /> Excel</Button>
        <Link className="button button--secondary" to="/finance/expenses">Vanad kulud</Link>
        {tab === 'invoices' ? <Button disabled={Boolean(editor)} onClick={openNew}><FilePlus2 size={17} /> Lisa ostuarve</Button> : null}
      </>} />
    {notice ? <div className="success-notice" role="status">{notice}<button aria-label="Sulge teade" onClick={() => setNotice('')}>×</button></div> : null}
    {error && !editor && !dialog ? <div className="expense-error" role="alert">{error}<button aria-label="Sulge veateade" onClick={() => setError('')}>×</button></div> : null}

    <Card className="accounting-toolbar">
      <nav className="accounting-tabs" aria-label="Ostud">{[['invoices', 'Ostuarved'], ['suppliers', 'Tarnijad']].map(([id, label]) => <button key={id} type="button" className={tab === id ? 'is-active' : ''} aria-pressed={tab === id} onClick={() => setTab(id)}>{label}</button>)}</nav>
      {tab === 'invoices' ? <div className="accounting-period">
        <Input id="purchases-from" label="Alates" type="date" value={period.from} onChange={(event) => setPeriod({ ...period, from: event.target.value })} />
        <Input id="purchases-to" label="Kuni" type="date" value={period.to} onChange={(event) => setPeriod({ ...period, to: event.target.value })} />
        <Select id="purchases-status" label="Olek" value={status} onChange={(event) => setStatus(event.target.value)}><option value="">Kõik (v.a tühistatud)</option><option value="unpaid">Tasumata</option><option value="paid">Tasutud</option><option value="voided">Tühistatud</option></Select>
        <input aria-label="Otsi ostuarvetest" placeholder="Otsi tarnija, arve nr, konto…" value={query} onChange={(event) => setQuery(event.target.value)} />
      </div> : null}
      {lockedThrough ? <p className="purchases-lock"><Lock size={13} /> Periood suletud kuni {dmy(lockedThrough)} — sinna kuupäevani arveid ei lisata ega muudeta.</p> : null}
    </Card>

    {tab === 'suppliers' ? <Card className="accounting-card">
      <SuppliersPanel suppliers={data.suppliers} accounts={accounts} onSave={saveSupplier} onImport={repository.importSuppliers ? importSuppliers : null} busy={busy === 'supplier'} />
    </Card> : null}

    {tab === 'invoices' ? <Card className="accounting-card">
      {visible.length || editor ? <div className="accounting-sheet">
        <p className="purchases-totals">{totals.count} arvet · kokku {amount(totals.totalCents)} · tasumata {amount(totals.openCents)}</p>
        <div className="accounting-grid-wrap"><table className="accounting-grid purchases-grid">
          <colgroup><col className="c-account" /><col className="c-doc" /><col className="c-date" /><col className="c-date" /><col /><col className="c-num" /><col className="c-num" /><col className="c-status" /></colgroup>
          <thead>
            <tr><th>Tarnija</th><th>Arve nr</th><th>Kuupäev</th><th>Tähtaeg</th><th>Märkus / failid</th><th className="num">Kokku</th><th className="num">Tasutud</th><th>Olek</th></tr>
            <tr><th>Konto</th><th colSpan="3" /><th>Kirjeldus</th><th className="num">Summa</th><th className="num">KM</th><th /></tr>
          </thead>
          {editor && !editor.id ? <PurchaseInvoiceDraft draft={editor.draft} setDraft={(next) => setEditor((current) => ({ ...current, draft: next }))} lines={editor.lines} setLines={(next) => setEditor((current) => ({ ...current, lines: next }))} suppliers={data.suppliers} accounts={accounts} busy={busy === 'save'} error={error} onSave={saveEditor} onCancel={cancelEditor} /> : null}
          {visible.map((invoice) => {
            if (editor?.id === invoice.id) {
              return <PurchaseInvoiceDraft key={invoice.id} editing draft={editor.draft} setDraft={(next) => setEditor((current) => ({ ...current, draft: next }))} lines={editor.lines} setLines={(next) => setEditor((current) => ({ ...current, lines: next }))} reason={editor.reason} setReason={(next) => setEditor((current) => ({ ...current, reason: next }))} suppliers={data.suppliers} accounts={accounts} busy={busy === 'save'} error={error} onSave={saveEditor} onCancel={cancelEditor} />;
            }
            const locked = isLockedDate(invoice.date, lockedThrough);
            const voided = invoice.status === 'voided';
            const late = overdue(invoice, today());
            return <tbody key={invoice.id} className={voided ? 'is-reversed' : ''}>
              <tr className="accounting-grid__entry">
                <td>{invoice.supplierName}</td><td title={invoice.entryNumber ? `OA kanne ${invoice.entryNumber}` : ''}>{invoice.documentNumber}</td><td>{dmy(invoice.date)}</td><td className={late ? 'is-late' : ''}>{dmy(invoice.dueDate)}</td>
                <td className="purchases-files">{invoice.note ? <span>{invoice.note}</span> : null}{(invoice.documents || []).map((document) => <button key={document.id} type="button" className="link-button" title={document.fileName} onClick={() => preview(document)}><Eye size={13} /> {document.fileName}</button>)}
                  {!voided ? <label className="link-button purchases-upload"><FileUp size={13} /> fail<input aria-label={`Lisa fail arvele ${invoice.documentNumber}`} type="file" accept="application/pdf,image/jpeg,image/png,image/webp" disabled={Boolean(busy)} onChange={(event) => { upload(invoice, event.target.files?.[0]); event.target.value = ''; }} /></label> : null}</td>
                <td className="num">{amount(invoice.totalCents)}</td><td className="num">{amount(invoice.paidCents || 0)}</td>
                <td className="accounting-grid__actions"><span className={`purchases-status purchases-status--${invoice.status}`}>{late ? 'Üle tähtaja' : STATUS_LABELS[invoice.status] || invoice.status}</span>
                  {locked && !voided ? <span title={`Periood suletud kuni ${dmy(lockedThrough)}`}><Lock size={12} /></span> : null}
                  {invoice.status === 'unpaid' && !editor ? <button type="button" className="link-button" onClick={() => openPay(invoice)}><Wallet size={13} /> Tasu</button> : null}
                  {!voided && !locked && !editor ? <button type="button" className="link-button" onClick={() => openEdit(invoice)}><Pencil size={13} /> Muuda</button> : null}
                  {!voided && !(invoice.paidCents > 0) && !editor ? <button type="button" className="link-button" onClick={() => { setError(''); setDialog({ kind: 'void', invoice, reason: '' }); }}><Ban size={13} /> Tühista</button> : null}
                </td>
              </tr>
              {(invoice.lines || []).map((l, i) => <tr key={i}><td>{l.account} {accountName(l.account)}</td><td colSpan="3" /><td>{l.description}</td><td className="num">{amount(l.amountCents)}</td><td className="num">{l.vatCents ? `${amount(l.vatCents)}${l.vatDeductible ? ' (maha)' : ''}` : ''}</td><td /></tr>)}
              {(invoice.payments || []).map((p) => <tr key={p.id} className="purchases-payment"><td>Tasumine</td><td colSpan="1">{p.entryNumber || ''}</td><td>{dmy(p.date)}</td><td /><td>{methodLabel(p.method)}{p.reference ? ` · ${p.reference}` : ''}</td><td /><td className="num">{amount(p.amountCents)}</td>
                <td>{!isLockedDate(p.date, lockedThrough) ? <button type="button" className="link-button" onClick={() => { setError(''); setDialog({ kind: 'payment', invoice, payment: p, reason: '' }); }}><X size={13} /> Eemalda</button> : null}</td></tr>)}
              {paying?.id === invoice.id ? <tr className="accounting-draft purchases-pay-row"><td>Tasumine</td><td /><td><input aria-label="Tasumise kuupäev" type="date" value={paying.date} onChange={(event) => setPaying({ ...paying, date: event.target.value })} /></td>
                <td colSpan="2"><select aria-label="Tasumise viis" value={paying.method} onChange={(event) => setPaying({ ...paying, method: event.target.value })}>{PAYMENT_METHODS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></td>
                <td /><td className="num"><input aria-label="Tasutud summa" inputMode="decimal" value={paying.amount} onChange={(event) => setPaying({ ...paying, amount: event.target.value })} /></td>
                <td><span className="accounting-draft__buttons"><Button variant="secondary" disabled={Boolean(busy)} onClick={() => setPaying(null)}>Loobu</Button><Button loading={busy === 'pay'} onClick={savePay}>Salvesta</Button></span>{error ? <small className="is-off" role="alert">{error}</small> : null}</td></tr> : null}
            </tbody>;
          })}
        </table></div>
        <p className="accounting-sheet__footer"><span>{COMPANY.name}</span><span>Rg-kood {COMPANY.regCode}</span></p>
      </div> : <EmptyState title="Ostuarveid ei ole" description={data.suppliers.length ? 'Vajuta „Lisa ostuarve” või vali teine periood.' : 'Lisa kõigepealt tarnija (Tarnijad), siis ostuarve.'} />}
    </Card> : null}

    <Modal open={Boolean(dialog)} title={dialog?.kind === 'void' ? `Tühista ostuarve ${dialog?.invoice?.documentNumber || ''}` : 'Eemalda tasumine'} onClose={() => !busy && setDialog(null)}
      footer={<><Button variant="secondary" disabled={Boolean(busy)} onClick={() => setDialog(null)}>Loobu</Button><Button variant="danger" type="submit" form="purchase-dialog-form" loading={busy === 'save'}>{dialog?.kind === 'void' ? 'Tühista arve' : 'Eemalda tasumine'}</Button></>}>
      <form id="purchase-dialog-form" className="expense-form" onSubmit={submitDialog}>
        <p className="form-hint">{dialog?.kind === 'void' ? 'Arve jääb alles tühistatuna. Avatud perioodis kustutatakse selle kanne (ajalugu jääb), suletud perioodis tehakse täna storno.' : 'Tasumise kanne kustutatakse; sisu, aeg ja põhjus jäävad kande ajalukku.'}</p>
        {error ? <p className="form-error" role="alert">{error}</p> : null}
        <label className="textarea-field"><span>Põhjus *</span><textarea aria-label="Põhjus" rows="3" value={dialog?.reason || ''} onChange={(event) => setDialog({ ...dialog, reason: event.target.value })} /></label>
      </form>
    </Modal>
  </div>;
}
