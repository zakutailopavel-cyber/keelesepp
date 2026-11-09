import { FileUp, History, Mail, Pencil, Trash2, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Badge, Button, Card, EmptyState, Modal } from '../../components/ui/index.js';
import { askConfirm } from '../../components/ui/ConfirmHost.jsx';
import { displayDate } from './finance.js';
import { financeRowState, sortFinanceRows } from './financeRows.js';
import { debtAgeBuckets, debtsByPayer, pastDueInvoices } from './financeDebts.js';
import { canCancelInvoice, creditableLessonLines, fullCorrectionBlocker } from './invoiceActions.js';
import InvoiceCorrectionDialog from './InvoiceCorrectionDialog.jsx';
import BankReconciliationPanel from './BankReconciliationPanel.jsx';
import PaymentClaimBadge, { paymentClaimTitle } from './PaymentClaimBadge.jsx';
import { invoicePaymentClaimsService, openPaymentClaim } from '../../services/firebase/invoicePaymentClaims.js';
import './financeDebts.css';

const money = (cents) => new Intl.NumberFormat('et-EE', { style: 'currency', currency: 'EUR' }).format(Number(cents || 0) / 100);

const lineCents = (line) => Number(line.amountCents) || Math.round(Number(line.amount || 0) * 100);

// „Muuda” (owner request, PR #368): a past-due invoice is never overwritten — the due date is corrected with a reason
// (server keeps dueDateHistory + audit) or one lesson line gets its own credit note
function DebtInvoiceEditDialog({ invoice, busy, error, canDue, canCredit, canCreditFull, canCorrect, onClose, onSaveDueDate, onCreditLessonLine, onOpenCorrection }) {
  const originalDue = invoice?.due || invoice?.dueDate || '';
  const [due, setDue] = useState(originalDue);
  const [reason, setReason] = useState('');
  const [creditLessonId, setCreditLessonId] = useState('');
  const lines = creditableLessonLines(invoice || {});
  const hasLessonLines = (invoice?.lines || []).some((line) => line?.lessonId);
  const validReason = reason.trim().length >= 10;
  const dueChanged = Boolean(due) && due !== originalDue;
  const ready = validReason && (creditLessonId ? true : canDue && dueChanged);
  const wholeBlocked = fullCorrectionBlocker(invoice || {});
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
      {canCreditFull || canCorrect ? <div className="finance-debts__credit-lines finance-debts__whole">
        <strong>Kogu arve parandamine</strong>
        {wholeBlocked ? <p className="finance-debts__credit-note">{wholeBlocked}</p> : <>
          <p>Väljastatud arvet üle ei kirjutata: tehakse kreeditarve ja vajadusel uus arve. Järgmises aknas näed, mis luuakse.</p>
          <div className="finance-debts__whole-actions">
            {canCreditFull ? <Button variant="secondary" type="button" disabled={busy} onClick={() => onOpenCorrection('full')}>Krediteeri kogu arve</Button> : null}
            {canCorrect ? <Button variant="secondary" type="button" disabled={busy} onClick={() => onOpenCorrection('correct')}>Paranda summa või maksja</Button> : null}
          </div>
        </>}
      </div> : null}
      <div className="field"><label className="field__label" htmlFor="finance-debt-reason">Paranduse põhjus</label><textarea id="finance-debt-reason" className="field__textarea" rows="3" minLength="10" maxLength="500" required value={reason} disabled={busy} onChange={(event) => setReason(event.target.value)} placeholder="Kirjelda paranduse põhjust (vähemalt 10 märki)" />{reason.trim().length < 10 ? <small className="field__hint">Põhjus peab olema vähemalt 10 märki — veel {10 - reason.trim().length}.</small> : null}</div>
      {error ? <p className="form-error" role="alert">{error}</p> : null}
    </form>
  </Modal>;
}

export default function FinanceDebtsPanel({ month, invoices, students, transactions, onAllocate, onReload, onRemind, onCancel, onCorrectDueDate, onCreditLessonLine, onCreditInFull, onCorrectInvoice, claimsRepository = invoicePaymentClaimsService, canRemoveClaims = false }) {
  const [importOpen, setImportOpen] = useState(false);
  const [editInvoice, setEditInvoice] = useState(null);
  const [editError, setEditError] = useState('');
  const [busy, setBusy] = useState('');
  const [notice, setNotice] = useState('');
  // „Krediteeri kogu arve” / „Paranda summa või maksja” (owner 2026-10-23): a confirmation dialog of its own
  const [correction, setCorrection] = useState(null);
  const [correctionError, setCorrectionError] = useState('');
  const canEdit = Boolean(onCorrectDueDate || onCreditLessonLine || onCreditInFull || onCorrectInvoice);
  const debts = useMemo(() => pastDueInvoices(invoices, month), [invoices, month]);
  const total = debts.reduce((sum, invoice) => sum + financeRowState(invoice).balanceCents, 0);
  const ages = useMemo(() => debtAgeBuckets(debts), [debts]);
  const payers = useMemo(() => debtsByPayer(debts), [debts]);
  // „Maksin ära” from the parents' cabinet (owner 2026-11-09): notices only, the money is confirmed here from the bank
  const [claims, setClaims] = useState(() => new Map());
  useEffect(() => {
    let live = true;
    Promise.resolve().then(() => claimsRepository.list()).then((found) => live && setClaims(found instanceof Map ? found : new Map())).catch(() => {});
    return () => { live = false; };
  }, [claimsRepository]);
  // „Eemalda teade” (administrator): a mistaken notice is deleted; the parent sees „Maksin ära” again
  const removeClaim = async (invoice) => {
    const label = invoice.num || invoice.number || '';
    if (!(await askConfirm(`Eemaldada pere teade „Maksin ära” arvelt ${label}? Arve ja maksed ei muutu; pere saab teate uuesti saata.`, { confirmLabel: 'Eemalda teade', danger: true }))) return;
    setBusy(`claim-${invoice.id}`); setNotice('');
    try {
      await claimsRepository.remove(invoice.id, invoice);
      setClaims((current) => { const next = new Map(current); next.delete(invoice.id); return next; });
      setNotice(`Pere teade arvelt ${label} eemaldati.`);
    } catch (error) { setNotice(error.message || 'Teadet ei saanud eemaldada.'); }
    finally { setBusy(''); }
  };
  // every unpaid invoice a family says it has paid, of any month (also this month's, which are not in the list below)
  const claimed = useMemo(() => sortFinanceRows(invoices.filter((invoice) => invoice.status !== 'Tühistatud' && openPaymentClaim(claims, invoice, financeRowState(invoice).balanceCents)), 'dueDate'), [claims, invoices]);
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
  const openCorrection = (mode) => {
    const invoice = editInvoice;
    setEditInvoice(null); setCorrectionError(''); setNotice('');
    setCorrection({ invoice, mode });
  };
  const submitCorrection = async (values) => {
    const { invoice, mode } = correction;
    setBusy(`correct-${invoice.id}`); setCorrectionError('');
    try {
      const result = mode === 'full' ? await onCreditInFull(invoice, values.reason, values.requestId) : await onCorrectInvoice(invoice, values);
      setCorrection(null);
      const creditNum = result?.creditNote?.num ? ` ${result.creditNote.num}` : '';
      setNotice(mode === 'full'
        ? `Arve krediteeriti täies ulatuses (kreeditarve${creditNum}).`
        : `Kreeditarve${creditNum} ja uus arve${result?.invoice?.num ? ` ${result.invoice.num}` : ''} on loodud. Saada uus arve perele arvete nimekirjast.`);
      await onReload();
    } catch (error) { setCorrectionError(error.message || 'Arve parandamine ebaõnnestus.'); }
    finally { setBusy(''); }
  };
  return (
    <Card className="finance-debts" id="volgnevused">
      <div className="finance-debts__heading"><div><span className="eyebrow">Võlgnevused</span><h2>Varasemate kuude tasumata arved</h2><p>Kõik valitud kuust varasemad arved, millel on veel jääk.{onRemind ? '' : ' Ainult vaatamiseks.'}</p></div><div><strong>{money(total)}</strong>{onAllocate ? <Button variant="secondary" onClick={() => setImportOpen(true)}><FileUp size={17} /> Impordi pank</Button> : null}</div></div>
      {notice ? <p className="finance-debts__notice" role="status">{notice}</p> : null}
      {claimed.length ? <section className="finance-debts__claims" aria-label="Pere teated: makstud">
        <h3>Pere teatas „Maksin ära” · {claimed.length}</h3>
        <p>Arve on veel tasumata: kontrolli pangast ja lisa makse (Arved → arve → „Lisa makse”). Teade ise arvet makstuks ei märgi.</p>
        <ul>{claimed.map((invoice) => { const claim = claims.get(invoice.id); const label = invoice.num || invoice.number || ''; return <li key={invoice.id} data-entity="invoice" data-invoice-id={invoice.id} data-invoice-number={label || undefined} data-student-id={invoice.studentId || undefined}><PaymentClaimBadge claim={claim} /><span><b>{invoice.studentName || invoice.payerName || '—'}</b> · {label || '—'} · {money(financeRowState(invoice).balanceCents)}</span><small>{paymentClaimTitle(claim)}</small>{canRemoveClaims ? <Button variant="secondary" loading={busy === `claim-${invoice.id}`} onClick={() => removeClaim(invoice)} aria-label={`Eemalda pere teade arvelt ${label}`}><X size={15} /> Eemalda teade</Button> : null}</li>; })}</ul>
      </section> : null}
      {debts.length ? <div className="finance-debts__summary">
        <ul className="finance-debts__ages" aria-label="Võlgade vanus">{ages.map((bucket) => <li key={bucket.id} className={`is-${bucket.id}${bucket.count ? '' : ' is-empty'}`}><span>{bucket.label}</span><strong>{money(bucket.cents)}</strong><small>{bucket.count} arvet</small></li>)}</ul>
        {payers.length > 1 ? <details className="finance-debts__payers"><summary>Pere kaupa · {payers.length} maksjat</summary><ol>{payers.map((payer) => <li key={payer.key}><span><b>{payer.name}</b>{payer.students.length ? <small>{payer.students.join(', ')}</small> : null}</span><span>{payer.count} arvet</span><strong>{money(payer.cents)}</strong></li>)}</ol></details> : null}
      </div> : null}
      {!debts.length ? <EmptyState title="Varasemaid võlgnevusi ei ole" description="Kõik eelmiste kuude arved on tasutud või krediteeritud." action={<History size={28} />} /> : <div className="finance-debts__table" role="table" aria-label="Võlgnevused">
        <div className="finance-debts__head" role="row"><span>Õpilane</span><span>Arve</span><span>Tähtaeg</span><span>Jääk</span><span>Olek</span><span /></div>
        {debts.map((invoice) => { const row = financeRowState(invoice); const label = invoice.num || invoice.number || ''; return <div className="finance-debts__row" role="row" key={invoice.id} data-entity="invoice" data-invoice-id={invoice.id} data-invoice-number={label || undefined} data-student-id={invoice.studentId || undefined} data-entity-title={[invoice.studentName || invoice.payerName, label].filter(Boolean).join(' · ') || undefined}><span data-label="Õpilane"><strong>{invoice.studentName || invoice.payerName || '—'}</strong><small>{invoice.payerEmail || ''}</small></span><span data-label="Arve">{label || '—'}</span><span data-label="Tähtaeg">{displayDate(invoice.due || invoice.dueDate)}</span><span data-label="Jääk"><strong>{money(row.balanceCents)}</strong></span><span data-label="Olek"><Badge tone={row.overdue ? 'danger' : 'neutral'}>{row.overdue ? 'Üle tähtaja' : 'Tasumata'}</Badge> <PaymentClaimBadge claim={openPaymentClaim(claims, invoice, row.balanceCents)} /></span><span className="finance-debts__actions">{onRemind ? <Button variant="secondary" loading={busy === invoice.id} data-entity-action="remind" onClick={() => remind(invoice)}><Mail size={15} /> Meeldetuletus</Button> : null}{canEdit ? <Button variant="secondary" data-entity-action="edit" onClick={() => { setEditError(''); setEditInvoice(invoice); }} aria-label={`Muuda arvet ${label}`}><Pencil size={15} /> Muuda</Button> : null}{onCancel && canCancelInvoice(invoice) ? <Button variant="secondary" data-entity-action="cancel" onClick={() => onCancel(invoice)} aria-label={`Tühista arve ${label}`}><Trash2 size={15} /> Tühista</Button> : null}</span></div>; })}
      </div>}
      <DebtInvoiceEditDialog key={editInvoice?.id || 'closed'} invoice={editInvoice} busy={Boolean(editInvoice) && busy === `edit-${editInvoice.id}`} error={editError} canDue={Boolean(onCorrectDueDate)} canCredit={Boolean(onCreditLessonLine)} canCreditFull={Boolean(onCreditInFull)} canCorrect={Boolean(onCorrectInvoice)} onOpenCorrection={openCorrection} onClose={() => { if (!busy) setEditInvoice(null); }} onSaveDueDate={(due, reason) => correct('due', due, reason)} onCreditLessonLine={(lessonId, reason) => correct('credit', lessonId, reason)} />
      {correction ? <InvoiceCorrectionDialog key={`${correction.mode}-${correction.invoice.id}`} invoice={correction.invoice} mode={correction.mode} busy={busy === `correct-${correction.invoice.id}`} error={correctionError} onClose={() => { if (!busy) setCorrection(null); }} onSubmit={submitCorrection} /> : null}
      <Modal open={importOpen} title="Impordi pangaväljavõte" className="finance-bank-modal" onClose={() => setImportOpen(false)} footer={<Button variant="secondary" onClick={() => setImportOpen(false)}>Sulge</Button>}>
        <BankReconciliationPanel invoices={invoices} students={students} transactions={transactions} onAllocate={onAllocate} onReload={onReload} />
      </Modal>
    </Card>
  );
}
