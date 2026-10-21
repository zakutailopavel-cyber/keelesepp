import { ArrowRightLeft, HandCoins, Link2, Wallet, XCircle } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../../app/AuthContext.jsx';
import { Badge, Button, Card, EmptyState, ErrorState, Input, LoadingState, Modal, PageHeader, Select } from '../../components/ui/index.js';
import { useAsyncData } from '../../hooks/useAsyncData.js';
import { financeApi } from '../../services/firebase/financeApi.js';
import { invoicesService } from '../../services/firebase/invoices.js';
import { studentsService } from '../../services/firebase/students.js';
import { ROLES } from '../../utils/roles.js';
import { entryDate, entryLine, euro, invoiceChoices, openReceipts, STATUS_LABEL, todayIso } from './cashModel.js';
import './cash.css';

// „Kassa” (owner 2026-10-18): every staff member records the cash they took from a payer and hands it over to someone
// else; an administrator sees every person's cash, links each receipt to the payer's invoice (a payment with method
// „cash”) and voids a wrong entry. Teachers see only their own part; the server decides what each one sees.
export default function CashPage({ api = financeApi, studentApi = studentsService, invoiceApi = invoicesService }) {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const isAdmin = user.roles.includes(ROLES.ADMIN);
  const state = useAsyncData(async () => Promise.all([
    api.cashSummary(),
    studentApi.list({ status: 'active', pageSize: 500, exhaustive: true, ...(isAdmin ? {} : { scopeTeacherUid: user.uid }) }),
  ]), [api, studentApi, isAdmin, user.uid]);
  const [receipt, setReceipt] = useState(() => ({ studentId: searchParams.get('student') || '', amount: '', receivedAt: todayIso(), note: '', holderUid: '' }));
  const [handover, setHandover] = useState({ toUid: '', fromUid: '', amount: '', handedAt: todayIso(), note: '' });
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [linking, setLinking] = useState(null);

  const [summary, students] = state.data || [{ entries: [], balances: [], people: [] }, { items: [] }];
  const studentItems = useMemo(() => [...(students?.items || [])].sort((a, b) => String(a.name).localeCompare(String(b.name), 'et')), [students]);
  const people = summary?.people || [];
  const mine = (summary?.balances || []).find((row) => row.uid === user.uid)?.cents || 0;

  const run = async (key, action, done) => {
    setBusy(key); setError(''); setNotice('');
    try { await action(); setNotice(done); await state.reload(); return true; } catch (caught) { setError(caught.message || 'Salvestamine ebaõnnestus.'); return false; } finally { setBusy(''); }
  };
  const saveReceipt = async (event) => {
    event.preventDefault();
    const ok = await run('receipt', () => api.recordCashReceipt({ ...receipt, ...(isAdmin && receipt.holderUid ? {} : { holderUid: undefined }) }), 'Sularaha on kassas kirjas.');
    if (ok) setReceipt({ ...receipt, amount: '', note: '' });
  };
  const saveHandover = async (event) => {
    event.preventDefault();
    const ok = await run('handover', () => api.recordCashHandover({ ...handover, ...(isAdmin && handover.fromUid ? {} : { fromUid: undefined }) }), 'Üleandmine on kirjas.');
    if (ok) setHandover({ ...handover, amount: '', note: '' });
  };
  const voidEntry = async (entry) => {
    const reason = globalThis.prompt?.('Miks see kirje tühistatakse?') || '';
    if (!reason.trim()) return;
    await run(`void-${entry.id}`, () => api.voidCashEntry(entry.id, reason), 'Kirje on tühistatud.');
  };

  if (state.loading && !state.data) return <LoadingState label="Laen kassat…" />;
  if (state.error) return <ErrorState message={state.error.message} onRetry={state.reload} />;
  const waiting = openReceipts(summary.entries);

  return (
    <div className="cash-page">
      {state.loading ? <p className="page-refreshing" role="status">Uuendan andmeid…</p> : null}
      <PageHeader eyebrow="Raha" title="Kassa" description={isAdmin ? 'Kelle käes on sularaha, mis on veel arvega sidumata ja kes kellele raha andis.' : 'Märgi siia sularaha, mille said maksjalt, ja kellele selle edasi andsid.'} />
      {error ? <p className="form-error" role="alert">{error}</p> : null}
      {notice ? <p className="form-hint cash-notice" role="status">{notice}</p> : null}

      <section className="cash-balances" aria-label="Kelle käes on raha">
        {isAdmin ? (summary.balances.length ? summary.balances.map((row) => (
          <Card key={row.uid} className="cash-balance"><Wallet size={18} aria-hidden="true" /><span>{row.name || 'Nimeta'}</span><strong>{euro(row.cents)}</strong></Card>
        )) : <Card className="cash-balance"><Wallet size={18} aria-hidden="true" /><span>Kassa on tühi</span><strong>{euro(0)}</strong></Card>)
          : <Card className="cash-balance"><Wallet size={18} aria-hidden="true" /><span>Sinu käes</span><strong>{euro(mine)}</strong></Card>}
        {isAdmin && waiting.length ? <Card className="cash-balance is-todo"><Link2 size={18} aria-hidden="true" /><span>Arvega sidumata</span><strong>{waiting.length}</strong></Card> : null}
      </section>

      <div className="cash-forms">
        <Card>
          <h2><HandCoins size={18} aria-hidden="true" /> Sain sularaha</h2>
          <form className="form-grid" onSubmit={saveReceipt}>
            <Select label="Õpilane" value={receipt.studentId} onChange={(event) => setReceipt({ ...receipt, studentId: event.target.value })} required className="form-grid__wide">
              <option value="">Vali õpilane…</option>
              {studentItems.map((student) => <option key={student.id} value={student.id}>{student.name}{student.payerMethod === 'cash' ? ' · sularaha' : ''}{student.parentName ? ` (${student.parentName})` : ''}</option>)}
            </Select>
            <Input label="Summa (€)" inputMode="decimal" value={receipt.amount} onChange={(event) => setReceipt({ ...receipt, amount: event.target.value })} required />
            <Input label="Kuupäev" type="date" max={todayIso()} value={receipt.receivedAt} onChange={(event) => setReceipt({ ...receipt, receivedAt: event.target.value })} required />
            {isAdmin ? <Select label="Kelle käes raha on" value={receipt.holderUid} onChange={(event) => setReceipt({ ...receipt, holderUid: event.target.value })} className="form-grid__wide">
              <option value="">Minu käes</option>
              {people.filter((person) => person.uid !== user.uid).map((person) => <option key={person.uid} value={person.uid}>{person.name}</option>)}
            </Select> : null}
            <Input label="Märkus (valikuline)" value={receipt.note} onChange={(event) => setReceipt({ ...receipt, note: event.target.value })} placeholder="nt oktoobri tunnid" className="form-grid__wide" />
            <Button type="submit" loading={busy === 'receipt'}><HandCoins size={16} /> Märgi saaduks</Button>
          </form>
        </Card>
        <Card>
          <h2><ArrowRightLeft size={18} aria-hidden="true" /> Andsin raha üle</h2>
          <form className="form-grid" onSubmit={saveHandover}>
            {isAdmin ? <Select label="Kes andis" value={handover.fromUid} onChange={(event) => setHandover({ ...handover, fromUid: event.target.value })} className="form-grid__wide">
              <option value="">Mina</option>
              {(summary.balances || []).filter((row) => row.uid !== user.uid && row.cents > 0).map((row) => <option key={row.uid} value={row.uid}>{row.name} ({euro(row.cents)})</option>)}
            </Select> : null}
            <Select label="Kellele" value={handover.toUid} onChange={(event) => setHandover({ ...handover, toUid: event.target.value })} required className="form-grid__wide">
              <option value="">Vali inimene…</option>
              {people.filter((person) => person.uid !== (handover.fromUid || user.uid)).map((person) => <option key={person.uid} value={person.uid}>{person.name}</option>)}
            </Select>
            <Input label="Summa (€)" inputMode="decimal" value={handover.amount} onChange={(event) => setHandover({ ...handover, amount: event.target.value })} required />
            <Input label="Kuupäev" type="date" max={todayIso()} value={handover.handedAt} onChange={(event) => setHandover({ ...handover, handedAt: event.target.value })} required />
            <Button type="submit" variant="secondary" loading={busy === 'handover'}><ArrowRightLeft size={16} /> Märgi üleantuks</Button>
          </form>
        </Card>
      </div>

      <Card className="cash-entries">
        <h2>Kirjed</h2>
        {summary.entries.length ? (
          <div className="cash-table" role="table" aria-label="Kassa kirjed">
            {summary.entries.map((entry) => (
              <div role="row" key={entry.id} className={`cash-row is-${entry.status}`}>
                <span role="cell">{entryDate(entry)}</span>
                <span role="cell">{entry.type === 'handover' ? <Badge tone="neutral">üle antud</Badge> : <Badge tone="info">saadud</Badge>}</span>
                <span role="cell" className="cash-row__what"><strong>{entryLine(entry)}</strong>{entry.type === 'receipt' ? <small>käes: {entry.holderName || '—'}{entry.note ? ` · ${entry.note}` : ''}</small> : entry.note ? <small>{entry.note}</small> : null}</span>
                <span role="cell" className="cash-row__sum">{euro(entry.amountCents)}</span>
                <span role="cell">{STATUS_LABEL[entry.status] ? <Badge tone={entry.status === 'open' ? 'warning' : entry.status === 'void' ? 'neutral' : 'success'}>{STATUS_LABEL[entry.status]}</Badge> : null}</span>
                <span role="cell" className="cash-row__actions">
                  {isAdmin && entry.type === 'receipt' && entry.status === 'open' ? <Button variant="secondary" onClick={() => setLinking(entry)}><Link2 size={15} /> Seo arvega</Button> : null}
                  {isAdmin && entry.status !== 'void' && !(entry.type === 'receipt' && entry.status === 'allocated') ? <Button variant="secondary" aria-label="Tühista kirje" title="Tühista kirje" disabled={busy === `void-${entry.id}`} onClick={() => voidEntry(entry)}><XCircle size={15} /></Button> : null}
                </span>
              </div>
            ))}
          </div>
        ) : <EmptyState title="Kirjeid veel pole" description="Kui saad maksjalt sularaha, märgi see ülal." />}
      </Card>

      {linking ? <LinkInvoiceDialog receipt={linking} invoiceApi={invoiceApi} busy={busy === 'link'} onClose={() => setLinking(null)}
        onLink={async (invoiceId) => { if (await run('link', () => api.allocateCashReceipt(linking.id, invoiceId), 'Raha on arvega seotud ja arve makse kirjas.')) setLinking(null); }} /> : null}
    </div>
  );
}

function LinkInvoiceDialog({ receipt, invoiceApi, busy, onClose, onLink }) {
  const invoices = useAsyncData(() => invoiceApi.listByStudent(receipt.studentId), [invoiceApi, receipt.studentId]);
  const [chosen, setChosen] = useState('');
  const choices = invoiceChoices(invoices.data || [], receipt);
  return (
    <Modal open title={`Seo arvega: ${euro(receipt.amountCents)}`} onClose={onClose} footer={<><Button variant="secondary" onClick={onClose}>Loobu</Button><Button loading={busy} disabled={!chosen} onClick={() => onLink(chosen)}>Seo arvega</Button></>}>
      <p className="form-hint">{receipt.studentName} · sai {receipt.holderName} {receipt.receivedAt}. Arvele läheb makse „sularaha”; panga kontrolli seda ei vaja.</p>
      {invoices.loading ? <LoadingState label="Laen arveid…" /> : invoices.error ? <p className="form-error" role="alert">{invoices.error.message}</p>
        : choices.length ? <div className="cash-invoices" role="radiogroup" aria-label="Arve">{choices.map((invoice) => (
          <label key={invoice.id} className={chosen === invoice.id ? 'is-chosen' : ''}>
            <input type="radio" name="cash-invoice" value={invoice.id} checked={chosen === invoice.id} onChange={() => setChosen(invoice.id)} />
            <span><strong>{invoice.num || invoice.id}</strong><small>{invoice.date || ''} · tasuda {euro(invoice.dueCents)}{invoice.exact ? ' · sama summa' : ''}</small></span>
          </label>
        ))}</div> : <EmptyState title="Avatud arveid pole" description="Koosta enne arve või jäta raha kassasse, kuni arve on olemas." />}
    </Modal>
  );
}
