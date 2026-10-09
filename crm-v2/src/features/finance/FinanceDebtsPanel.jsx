import { FileUp, History, Mail, Pencil, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Badge, Button, Card, EmptyState, Modal } from '../../components/ui/index.js';
import { displayDate } from './finance.js';
import { financeRowState } from './financeRows.js';
import { pastDueInvoices } from './financeDebts.js';
import { canCancelInvoice } from './invoiceActions.js';
import BankReconciliationPanel from './BankReconciliationPanel.jsx';
import './financeDebts.css';

const money = (cents) => new Intl.NumberFormat('et-EE', { style: 'currency', currency: 'EUR' }).format(Number(cents || 0) / 100);

function DebtInvoiceEditDialog({ invoice, busy, error, onClose, onSaveDueDate, onCreditLessonLine }) {
  const [due, setDue] = useState(invoice?.due || invoice?.dueDate || '');
  const [reason, setReason] = useState('');
  const [creditLessonId, setCreditLessonId] = useState('');
  const originalDue = invoice?.due || invoice?.dueDate || '';
  const creditableLines = (invoice?.lines || []).filter((line) => line.lessonId && !(invoice.correctedLessonIds || []).includes(line.lessonId));
  const validReason = reason.trim().length >= 10;
  return <Modal open={Boolean(invoice)} title={`Muuda arvet · ${invoice?.num || invoice?.number || ''}`} onClose={onClose}
    footer={<><Button variant="secondary" disabled={busy} onClick={onClose}>Sulge</Button><Button type="submit" form="finance-debt-correction" loading={busy} disabled={!validReason || (!creditLessonId && (!due || due === originalDue))}>{creditLessonId ? 'Krediteeri tunnirida' : 'Salvesta tähtaeg'}</Button></>}>
    <form id="finance-debt-correction" onSubmit={(event) => { event.preventDefault(); if (!validReason) return; if (creditLessonId) onCreditLessonLine(creditLessonId, reason.trim()); else if (due && due !== originalDue) onSaveDueDate(due, reason.trim()); }}>
      <p>Muudatus salvestatakse koos põhjusega finantsajalukku. Väljastatud arve summat ei kirjutata üle.</p>
      <div className="field"><label className="field__label" htmlFor="finance-debt-due">Uus maksetähtaeg</label><input id="finance-debt-due" className="field__input" type="date" value={due} disabled={Boolean(creditLessonId) || busy} onChange={(event) => setDue(event.target.value)} /></div>
      {creditableLines.length ? <div className="finance-debts__credit-lines"><strong>Arve tunniread</strong><p>Vali üks ekslikult arvestatud tund, et teha selle kohta kreeditarve.</p>{creditableLines.map((line) => <label key={line.lessonId}><input type="radio" name="finance-debt-credit-line" checked={creditLessonId === line.lessonId} onChange={() => setCreditLessonId(line.lessonId)} disabled={busy} /> {displayDate(line.date)} · {line.description || 'Keeletund'} · {money(Number(line.amountCents) || Math.round(Number(line.amount || 0) * 100))}</label>)}{creditLessonId ? <Button variant="secondary" type="button" onClick={() => setCreditLessonId('')} disabled={busy}>Muuda tähtaega</Button> : null}</div> : null}
      <div className="field"><label className="field__label" htmlFor="finance-debt-reason">Paranduse põhjus</label><textarea id="finance-debt-reason" className="field__textarea" rows="3" minLength="10" maxLength="500" required value={reason} disabled={busy} onChange={(event) => setReason(event.target.value)} placeholder="Kirjelda paranduse põhjust" /></div>
      {error ? <p className="form-error" role="alert">{error}</p> : null}
    </form>
  </Modal>;
}

export default function FinanceDebtsPanel({ month, invoices, students, transactions, onAllocate, onReload, onRemind, onCancel, onCorrectDueDate, onCreditLessonLine }) {
  const [importOpen, setImportOpen] = useState(false);
  const [editInvoice, setEditInvoice] = useState(null);
  const [busy, setBusy] = useState('');
  const [notice, setNotice] = useState('');
  const [editError, setEditError] = useState('');
  const debts = useMemo(() => pastDueInvoices(invoices, month), [invoices, month]);
  const total = debts.reduce((sum, invoice) => sum + financeRowState(invoice).balanceCents, 0);
  const remind = async (invoice) => {
    setBusy(invoice.id); setNotice('');
    try { await onRemind(invoice); setNotice('Maksemeeldetuletus saadeti.'); }
    catch (error) { setNotice(error.message || 'Meeldetuletust ei saanud saata.'); }
    finally { setBusy(''); }
  };
  const correct = async (kind, dueOrLessonId, reason) => {
    setBusy(`edit-${editInvoice.id}`); setEditError(''); setNotice('');
    try {
      if (kind === 'due') await onCorrectDueDate(editInvoice, dueOrLessonId, reason);
      else await onCreditLessonLine(editInvoice, dueOrLessonId, reason);
      await onReload();
      setEditInvoice(null);
      setNotice(kind === 'due' ? 'Maksetähtaeg parandati. Muudatus on finantsajaloos.' : 'Tunnirida krediteeriti ja arve jääk uuendati.');
    } catch (error) { setEditError(error.message || 'Arve parandamine ebaõnnestus.'); }
    finally { setBusy(''); }
  };
  return (
    <Card className="finance-debts" id="volgnevused">
      <div className="finance-debts__heading"><div><span className="eyebrow">Võlgnevused</span><h2>Varasemate kuude tasumata arved</h2><p>Kõik valitud kuust varasemad arved, millel on veel jääk.</p></div><div><strong>{money(total)}</strong><Button variant="secondary" onClick={() => setImportOpen(true)}><FileUp size={17} /> Impordi pank</Button></div></div>
      {notice ? <p className="finance-debts__notice" role="status">{notice}</p> : null}
      {!debts.length ? <EmptyState title="Varasemaid võlgnevusi ei ole" description="Kõik eelmiste kuude arved on tasutud või krediteeritud." action={<History size={28} />} /> : <div className="finance-debts__table" role="table" aria-label="Võlgnevused">
        <div className="finance-debts__head" role="row"><span>Õpilane</span><span>Arve</span><span>Tähtaeg</span><span>Jääk</span><span>Olek</span><span /></div>
        {debts.map((invoice) => { const row = financeRowState(invoice); return <div className="finance-debts__row" role="row" key={invoice.id}><span data-label="Õpilane"><strong>{invoice.studentName || invoice.payerName || '—'}</strong><small>{invoice.payerEmail || ''}</small></span><span data-label="Arve">{invoice.num || invoice.number || '—'}</span><span data-label="Tähtaeg">{displayDate(invoice.due || invoice.dueDate)}</span><span data-label="Jääk"><strong>{money(row.balanceCents)}</strong></span><span data-label="Olek"><Badge tone={row.overdue ? 'danger' : 'neutral'}>{row.overdue ? 'Üle tähtaja' : 'Tasumata'}</Badge></span><span className="finance-debts__actions"><Button variant="secondary" loading={busy === invoice.id} onClick={() => remind(invoice)}><Mail size={15} /> Meeldetuletus</Button><Button variant="secondary" onClick={() => { setEditInvoice(invoice); setEditError(''); }} aria-label={`Muuda arvet ${invoice.num || invoice.number || ''}`}><Pencil size={15} /> Muuda</Button>{canCancelInvoice(invoice) ? <Button variant="secondary" onClick={() => onCancel(invoice)} aria-label={`Tühista arve ${invoice.num || invoice.number || ''}`}><Trash2 size={15} /> Tühista</Button> : null}</span></div>; })}
      </div>}
      <DebtInvoiceEditDialog key={editInvoice?.id || 'closed'} invoice={editInvoice} busy={busy === `edit-${editInvoice?.id}`} error={editError} onClose={() => { if (!busy) setEditInvoice(null); }} onSaveDueDate={(due, reason) => correct('due', due, reason)} onCreditLessonLine={(lessonId, reason) => correct('credit', lessonId, reason)} />
      <Modal open={importOpen} title="Impordi pangaväljavõte" className="finance-bank-modal" onClose={() => setImportOpen(false)} footer={<Button variant="secondary" onClick={() => setImportOpen(false)}>Sulge</Button>}>
        <BankReconciliationPanel invoices={invoices} students={students} transactions={transactions} onAllocate={onAllocate} onReload={onReload} />
      </Modal>
    </Card>
  );
}
