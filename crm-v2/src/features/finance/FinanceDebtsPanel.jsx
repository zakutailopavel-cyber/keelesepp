import { FileUp, History, Mail, Pencil, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Badge, Button, Card, EmptyState, Modal } from '../../components/ui/index.js';
import { displayDate } from './finance.js';
import { financeRowState } from './financeRows.js';
import { pastDueInvoices } from './financeDebts.js';
import { canCancelInvoice, creditableLessonLines } from './invoiceActions.js';
import BankReconciliationPanel from './BankReconciliationPanel.jsx';
import './financeDebts.css';

const money = (cents) => new Intl.NumberFormat('et-EE', { style: 'currency', currency: 'EUR' }).format(Number(cents || 0) / 100);

const lineCents = (line) => Number(line.amountCents) || Math.round(Number(line.amount || 0) * 100);

// „Muuda” (owner request, PR #368): a past-due invoice is never overwritten — the due date is corrected with a reason
// (server keeps dueDateHistory + audit) or one lesson line gets its own credit note
function DebtInvoiceEditDialog({ invoice, busy, error, canDue, canCredit, onClose, onSaveDueDate, onCreditLessonLine }) {
  const originalDue = invoice?.due || invoice?.dueDate || '';
  const [due, setDue] = useState(originalDue);
  const [reason, setReason] = useState('');
  const [creditLessonId, setCreditLessonId] = useState('');
  const lines = creditableLessonLines(invoice || {});
  const hasLessonLines = (invoice?.lines || []).some((line) => line?.lessonId);
  const validReason = reason.trim().length >= 10;
  const dueChanged = Boolean(due) && due !== originalDue;
  const ready = validReason && (creditLessonId ? true : canDue && dueChanged);
  const submit = (event) => {
    event.preventDefault();
    if (!ready) return;
    if (creditLessonId) onCreditLessonLine(creditLessonId, reason.trim());
    else onSaveDueDate(due, reason.trim());
  };
  return <Modal open={Boolean(invoice)} title={`Muuda arvet · ${invoice?.num || invoice?.number || ''}`} onClose={onClose}
    footer={<><Button variant="secondary" disabled={busy} onClick={onClose}>Sulge</Button><Button type="submit" form="finance-debt-correction" loading={busy} disabled={!ready}>{creditLessonId ? 'Krediteeri tunnirida' : 'Salvesta tähtaeg'}</Button></>}>
    <form id="finance-debt-correction" onSubmit={submit}>
      <p>Muudatus salvestatakse koos põhjusega finantsajalukku. Väljastatud arve summat ei kirjutata üle.</p>
      <div className="field"><label className="field__label" htmlFor="finance-debt-due">Uus maksetähtaeg</label><input id="finance-debt-due" className="field__input" type="date" value={due} disabled={!canDue || Boolean(creditLessonId) || busy} onChange={(event) => setDue(event.target.value)} /></div>
      <div className="finance-debts__credit-lines">
        <strong>Krediteeri üks tund</strong>
        {!canCredit ? <p>Tunnirea krediteerimine ei ole siin saadaval.</p>
          : !hasLessonLines ? <p className="finance-debts__credit-note">Sellel arvel ei ole tunniridu (nt mitme aine kuuarve), seega üksikut tundi krediteerida ei saa. Vale arve puhul kasuta „Tühista”.</p>
          : !lines.length ? <p className="finance-debts__credit-note">Kõik selle arve tunniread on juba krediteeritud.</p>
          : <><p>Vali üks ekslikult arvestatud tund — selle kohta tehakse eraldi kreeditarve.</p>{lines.map((line) => <label key={line.lessonId}><input type="radio" name="finance-debt-credit-line" checked={creditLessonId === line.lessonId} onChange={() => setCreditLessonId(line.lessonId)} disabled={busy} /> {displayDate(line.date)} · {line.description || 'Keeletund'} · {money(lineCents(line))}</label>)}{creditLessonId ? <Button variant="secondary" type="button" onClick={() => setCreditLessonId('')} disabled={busy}>Muuda hoopis tähtaega</Button> : null}</>}
      </div>
      <div className="field"><label className="field__label" htmlFor="finance-debt-reason">Paranduse põhjus</label><textarea id="finance-debt-reason" className="field__textarea" rows="3" minLength="10" maxLength="500" required value={reason} disabled={busy} onChange={(event) => setReason(event.target.value)} placeholder="Kirjelda paranduse põhjust (vähemalt 10 märki)" />{reason.trim().length < 10 ? <small className="field__hint">Põhjus peab olema vähemalt 10 märki — veel {10 - reason.trim().length}.</small> : null}</div>
      {error ? <p className="form-error" role="alert">{error}</p> : null}
    </form>
  </Modal>;
}

export default function FinanceDebtsPanel({ month, invoices, students, transactions, onAllocate, onReload, onRemind, onCancel, onCorrectDueDate, onCreditLessonLine }) {
  const [importOpen, setImportOpen] = useState(false);
  const [editInvoice, setEditInvoice] = useState(null);
  const [editError, setEditError] = useState('');
  const [busy, setBusy] = useState('');
  const [notice, setNotice] = useState('');
  const canEdit = Boolean(onCorrectDueDate || onCreditLessonLine);
  const debts = useMemo(() => pastDueInvoices(invoices, month), [invoices, month]);
  const total = debts.reduce((sum, invoice) => sum + financeRowState(invoice).balanceCents, 0);
  const remind = async (invoice) => {
    setBusy(invoice.id); setNotice('');
    try { await onRemind(invoice); setNotice('Maksemeeldetuletus saadeti.'); }
    catch (error) { setNotice(error.message || 'Meeldetuletust ei saanud saata.'); }
    finally { setBusy(''); }
  };
  const correct = async (kind, value, reason) => {
    const invoice = editInvoice;
    setBusy(`edit-${invoice.id}`); setEditError(''); setNotice('');
    try {
      if (kind === 'due') await onCorrectDueDate(invoice, value, reason);
      else await onCreditLessonLine(invoice, value, reason);
      setEditInvoice(null);
      setNotice(kind === 'due' ? 'Maksetähtaeg parandati. Muudatus on finantsajaloos.' : 'Tunnirida krediteeriti eraldi kreeditarvega ja arve jääk uuendati.');
      await onReload();
    } catch (error) { setEditError(error.message || 'Arve parandamine ebaõnnestus.'); }
    finally { setBusy(''); }
  };
  return (
    <Card className="finance-debts" id="volgnevused">
      <div className="finance-debts__heading"><div><span className="eyebrow">Võlgnevused</span><h2>Varasemate kuude tasumata arved</h2><p>Kõik valitud kuust varasemad arved, millel on veel jääk.</p></div><div><strong>{money(total)}</strong><Button variant="secondary" onClick={() => setImportOpen(true)}><FileUp size={17} /> Impordi pank</Button></div></div>
      {notice ? <p className="finance-debts__notice" role="status">{notice}</p> : null}
      {!debts.length ? <EmptyState title="Varasemaid võlgnevusi ei ole" description="Kõik eelmiste kuude arved on tasutud või krediteeritud." action={<History size={28} />} /> : <div className="finance-debts__table" role="table" aria-label="Võlgnevused">
        <div className="finance-debts__head" role="row"><span>Õpilane</span><span>Arve</span><span>Tähtaeg</span><span>Jääk</span><span>Olek</span><span /></div>
        {debts.map((invoice) => { const row = financeRowState(invoice); const label = invoice.num || invoice.number || ''; return <div className="finance-debts__row" role="row" key={invoice.id}><span data-label="Õpilane"><strong>{invoice.studentName || invoice.payerName || '—'}</strong><small>{invoice.payerEmail || ''}</small></span><span data-label="Arve">{label || '—'}</span><span data-label="Tähtaeg">{displayDate(invoice.due || invoice.dueDate)}</span><span data-label="Jääk"><strong>{money(row.balanceCents)}</strong></span><span data-label="Olek"><Badge tone={row.overdue ? 'danger' : 'neutral'}>{row.overdue ? 'Üle tähtaja' : 'Tasumata'}</Badge></span><span className="finance-debts__actions"><Button variant="secondary" loading={busy === invoice.id} onClick={() => remind(invoice)}><Mail size={15} /> Meeldetuletus</Button>{canEdit ? <Button variant="secondary" onClick={() => { setEditError(''); setEditInvoice(invoice); }} aria-label={`Muuda arvet ${label}`}><Pencil size={15} /> Muuda</Button> : null}{onCancel && canCancelInvoice(invoice) ? <Button variant="secondary" onClick={() => onCancel(invoice)} aria-label={`Tühista arve ${label}`}><Trash2 size={15} /> Tühista</Button> : null}</span></div>; })}
      </div>}
      <DebtInvoiceEditDialog key={editInvoice?.id || 'closed'} invoice={editInvoice} busy={Boolean(editInvoice) && busy === `edit-${editInvoice.id}`} error={editError} canDue={Boolean(onCorrectDueDate)} canCredit={Boolean(onCreditLessonLine)} onClose={() => { if (!busy) setEditInvoice(null); }} onSaveDueDate={(due, reason) => correct('due', due, reason)} onCreditLessonLine={(lessonId, reason) => correct('credit', lessonId, reason)} />
      <Modal open={importOpen} title="Impordi pangaväljavõte" className="finance-bank-modal" onClose={() => setImportOpen(false)} footer={<Button variant="secondary" onClick={() => setImportOpen(false)}>Sulge</Button>}>
        <BankReconciliationPanel invoices={invoices} students={students} transactions={transactions} onAllocate={onAllocate} onReload={onReload} />
      </Modal>
    </Card>
  );
}
