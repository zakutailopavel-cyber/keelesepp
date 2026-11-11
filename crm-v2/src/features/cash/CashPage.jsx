import { ArrowRightLeft, HandCoins, Link2, Pencil, Users, Wallet, X, XCircle } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../../app/AuthContext.jsx';
import { Badge, Button, Card, EmptyState, ErrorState, Input, LoadingState, Modal, PageHeader, Select } from '../../components/ui/index.js';
import { useAsyncData } from '../../hooks/useAsyncData.js';
import { financeApi } from '../../services/firebase/financeApi.js';
import { invoicesService } from '../../services/firebase/invoices.js';
import { studentsService } from '../../services/firebase/students.js';
import { ROLES } from '../../utils/roles.js';
import { entryDate, entryLine, euro, heldByOthers, invoiceChoices, isLessonCash, lessonLine, openReceipts, STATUS_LABEL, todayIso } from './cashModel.js';
import { amountCents, amountText } from './lessonCash.js';
import { announceCashBoxChange } from '../../services/firebase/cashBox.js';
import { HandoverDialog, MyCashSummary, PendingIncoming } from './MyCashParts.jsx';
import './cash.css';
import './myCash.css';

// „Kassa” (owner 2026-10-18; 2026-11-11: only the administrator and the accountant). The administrator sees every
// person's cash, records cash and hand-overs („Sain kätte”), links a receipt to the payer's invoice (a payment with
// method „cash”), corrects a lesson's cash amount and voids a wrong entry. The accountant (finance role) only reads.
// Teachers never open it: their cash comes from „Toimus · makstud sularahas” on the lesson.
export default function CashPage({ api = financeApi, studentApi = studentsService, invoiceApi = invoicesService }) {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const isAdmin = user.roles.includes(ROLES.ADMIN);
  const state = useAsyncData(async () => Promise.all([
    api.cashSummary(),
    isAdmin ? studentApi.list({ status: 'active', pageSize: 500, exhaustive: true }) : Promise.resolve({ items: [] }),
    // „Minu kassa” (owner 2026-11-11): the admin's own cash and the hand-overs that wait for their „Sain kätte”
    isAdmin && api.cashMine ? api.cashMine().catch(() => null) : Promise.resolve(null),
  ]), [api, studentApi, isAdmin]);
  const [giving, setGiving] = useState(false);
  const [receipt, setReceipt] = useState(() => ({ studentId: searchParams.get('student') || '', amount: '', receivedAt: todayIso(), note: '', holderUid: '' }));
  const [handover, setHandover] = useState({ toUid: '', fromUid: '', amount: '', handedAt: todayIso(), note: '' });
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [linking, setLinking] = useState(null);

  const [summary, students, myBox] = state.data || [{ entries: [], balances: [], people: [] }, { items: [] }, null];
  const studentItems = useMemo(() => [...(students?.items || [])].sort((a, b) => String(a.name).localeCompare(String(b.name), 'et')), [students]);
  const people = summary?.people || [];

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
  // „Sain kätte” (owner 2026-11-10): the admin got a teacher's cash — a handover of everything they hold to the admin
  // (minus what already waits for a receiver's confirmation, „Minu kassa” 2026-11-11)
  const collect = async (row) => {
    const cents = row.cents - (row.pendingOutCents || 0);
    if (!globalThis.confirm?.(`Said ${row.name || 'õpetajalt'} kätte ${euro(cents)}?`)) return;
    await run(`collect-${row.uid}`, () => api.recordCashHandover({ fromUid: row.uid, toUid: user.uid, amount: (cents / 100).toFixed(2), handedAt: todayIso(), note: 'Sain kätte' }), `${row.name || 'Õpetaja'}: ${euro(cents)} on sinu käes.`);
  };
  const boxDone = async (message) => { setGiving(false); setNotice(message || ''); setError(''); announceCashBoxChange(); await state.reload(); };
  const voidEntry = async (entry) => {
    const reason = globalThis.prompt?.('Miks see kirje tühistatakse?') || '';
    if (!reason.trim()) return;
    await run(`void-${entry.id}`, () => api.voidCashEntry(entry.id, reason), 'Kirje on tühistatud.');
  };
  // the amount of a lesson's cash (the server took the card's price) corrected by the admin (owner 2026-11-11)
  const fixAmount = async (entry) => {
    const typed = globalThis.prompt?.(`Õige summa eurodes (praegu ${euro(entry.amountCents)}):`, amountText(entry.amountCents)) || '';
    if (!typed.trim()) return;
    const cents = amountCents(typed);
    if (!cents) { setError('Kirjuta summa eurodes, nt 25 või 25,50.'); return; }
    await run(`amount-${entry.id}`, () => api.correctLessonCashAmount(entry.id, (cents / 100).toFixed(2), 'Admin parandas summa'), `Summa on nüüd ${euro(cents)}.`);
  };

  if (state.loading && !state.data) return <LoadingState label="Laen kassat…" />;
  if (state.error) return <ErrorState message={state.error.message} onRetry={state.reload} />;
  const waiting = openReceipts(summary.entries);

  return (
    <div className="cash-page">
      {state.loading ? <p className="page-refreshing" role="status">Uuendan andmeid…</p> : null}
      <PageHeader eyebrow="Raha" title="Kassa" description={isAdmin ? 'Kelle käes on sularaha, mis on veel arvega sidumata ja kes kellele raha andis.' : 'Kelle käes on sularaha ja kes kellele raha andis (ainult vaatamiseks).'} />
      {error ? <p className="form-error" role="alert">{error}</p> : null}
      {notice ? <p className="form-hint cash-notice" role="status">{notice}</p> : null}

      {isAdmin && myBox ? <PendingIncoming incoming={myBox.incoming} api={api} onDone={boxDone} /> : null}
      {isAdmin && myBox && (myBox.ever || myBox.onHandCents) ? <MyCashSummary box={myBox} title="Minu käes" onHandOver={() => setGiving(true)} /> : null}

      <section className="cash-balances" aria-label="Kelle käes on raha">
        {summary.balances.length ? summary.balances.map((row) => (
          <Card key={row.uid} className="cash-balance"><Wallet size={18} aria-hidden="true" /><span>{row.name || 'Nimeta'}{row.inactive ? ' · lahkunud' : ''}</span><strong>{euro(row.cents)}</strong></Card>
        )) : <Card className="cash-balance"><Wallet size={18} aria-hidden="true" /><span>Kassa on tühi</span><strong>{euro(0)}</strong></Card>}
        {waiting.length ? <Card className="cash-balance is-todo"><Link2 size={18} aria-hidden="true" /><span>Arvega sidumata</span><strong>{waiting.length}</strong></Card> : null}
      </section>

      {isAdmin ? <Card className="cash-held" as="section" aria-label="Õpetajate käes sularaha">
        <h2><Wallet size={18} aria-hidden="true" /> Õpetajate käes sularaha</h2>
        {heldByOthers(summary.balances, user.uid).length ? <ul className="cash-held__list">
          {heldByOthers(summary.balances, user.uid).map((row) => <li key={row.uid}>
            <span>{row.name || 'Nimeta'} {row.inactive ? <Badge tone="neutral">lahkunud</Badge> : null}{row.pendingOutCents ? <small>{euro(row.pendingOutCents)} ootab kinnitust</small> : null}</span>
            <strong>{euro(row.cents)}</strong>
            {row.cents - (row.pendingOutCents || 0) > 0
              ? <Button variant="secondary" loading={busy === `collect-${row.uid}`} disabled={Boolean(busy)} onClick={() => collect(row)}><HandCoins size={15} aria-hidden="true" /> Sain kätte</Button>
              : <span />}
          </li>)}
        </ul> : <p className="form-hint">Kellelgi teisel ei ole praegu sularaha käes.</p>}
        <p className="form-hint">Tunni eest saadud sularaha („Toimus · makstud sularahas”) ei lähe raamatupidamisse ega seota arvega. Tund ise tuleb kuuarvelt maha, tunnipaketist tundi ei võeta.</p>
      </Card> : null}

      {isAdmin ? <ReceiversSettings api={api} /> : null}

      {isAdmin ? <div className="cash-forms">
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
      </div> : null}

      <Card className="cash-entries">
        <h2>Kirjed</h2>
        {summary.entries.length ? (
          <div className="cash-table" role="table" aria-label="Kassa kirjed">
            {summary.entries.map((entry) => (
              <div role="row" key={entry.id} className={`cash-row is-${entry.status}`}>
                <span role="cell">{entryDate(entry)}</span>
                <span role="cell">{entry.type === 'handover' ? <Badge tone="neutral">üle antud</Badge> : isLessonCash(entry) ? <Badge tone="info">tunni eest</Badge> : <Badge tone="info">saadud</Badge>}</span>
                <span role="cell" className="cash-row__what"><strong>{entryLine(entry)}</strong>{entry.type === 'receipt' ? <small>{isLessonCash(entry) ? `${lessonLine(entry)} · ` : ''}käes: {entry.holderName || '—'}{entry.note ? ` · ${entry.note}` : ''}</small> : entry.note ? <small>{entry.note}</small> : null}</span>
                <span role="cell" className="cash-row__sum">{euro(entry.amountCents)}</span>
                <span role="cell">{isLessonCash(entry) && entry.status === 'open' ? (entry.invoicedBefore?.length
                  ? <Badge tone="warning" title="Selle kuu arve oli juba tehtud; seda ei muudetud. Kuuarve tasaarveldus võtab tunni järgmiselt arvelt maha, „pärast toimunud tunde” arve puhul kontrolli käsitsi.">Makstud sularahas pärast arvet {entry.invoicedBefore.map((invoice) => invoice.num || invoice.id).join(', ')}</Badge>
                  : <Badge tone="neutral">Kuuarvelt maha</Badge>) : STATUS_LABEL[entry.status] ? <Badge tone={entry.status === 'open' || entry.status === 'pending' ? 'warning' : entry.status === 'rejected' ? 'danger' : entry.status === 'void' ? 'neutral' : 'success'}>{STATUS_LABEL[entry.status]}</Badge> : null}</span>
                <span role="cell" className="cash-row__actions">
                  {isAdmin && entry.type === 'receipt' && entry.status === 'open' && !isLessonCash(entry) ? <Button variant="secondary" onClick={() => setLinking(entry)}><Link2 size={15} /> Seo arvega</Button> : null}
                  {isAdmin && isLessonCash(entry) && entry.status === 'open' ? <Button variant="secondary" aria-label="Paranda summa" title="Paranda summa" disabled={busy === `amount-${entry.id}`} onClick={() => fixAmount(entry)}><Pencil size={15} /></Button> : null}
                  {isAdmin && entry.status !== 'void' && !(entry.type === 'receipt' && entry.status === 'allocated') ? <Button variant="secondary" aria-label="Tühista kirje" title="Tühista kirje" disabled={busy === `void-${entry.id}`} onClick={() => voidEntry(entry)}><XCircle size={15} /></Button> : null}
                </span>
              </div>
            ))}
          </div>
        ) : <EmptyState title="Kirjeid veel pole" description="Kui saad maksjalt sularaha, märgi see ülal." />}
      </Card>

      {giving && myBox ? <HandoverDialog box={myBox} api={api} onClose={() => setGiving(false)} onDone={boxDone} /> : null}
      {linking ? <LinkInvoiceDialog receipt={linking} invoiceApi={invoiceApi} busy={busy === 'link'} onClose={() => setLinking(null)}
        onLink={async (invoiceId) => { if (await run('link', () => api.allocateCashReceipt(linking.id, invoiceId), 'Raha on arvega seotud ja arve makse kirjas.')) setLinking(null); }} /> : null}
    </div>
  );
}

function LinkInvoiceDialog({ receipt, invoiceApi, busy, onClose, onLink }) {
  const invoices = useAsyncData(() => invoiceApi.listByStudent(receipt.studentId), [invoiceApi, receipt.studentId]);
  const [chosen, setChosen] = useState('');
  // the school's cash box never pays an FIE invoice (the owner's own FIE, 2026-11-09)
  const choices = invoiceChoices((invoices.data || []).filter((invoice) => invoice.issuer !== 'fie'), receipt);
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

// „Kassa vastuvõtjad” (owner 2026-11-11): who can receive teachers' cash („Andsin raha üle” in „Minu kassa”). Saved by
// the server (cashSettings/receivers, /cash/settings); until the first save the default is the owner + Oleksiy.
function ReceiversSettings({ api }) {
  const state = useAsyncData(() => (api.cashReceiverSettings ? api.cashReceiverSettings() : Promise.resolve(null)), [api]);
  const [draft, setDraft] = useState(null);
  const [adding, setAdding] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  if (!state.data) return null;
  const people = state.data.people || [];
  const uids = draft || state.data.receivers.map((person) => person.uid);
  const nameOf = (uid) => people.find((person) => person.uid === uid)?.name || state.data.receivers.find((person) => person.uid === uid)?.name || uid;
  const changed = Boolean(draft) && draft.join('|') !== state.data.receivers.map((person) => person.uid).join('|');
  const save = async () => {
    setBusy(true); setError(''); setMessage('');
    try { await api.cashReceiverSettings({ uids }); setDraft(null); setMessage('Vastuvõtjad on salvestatud.'); await state.reload(); } catch (caught) { setError(caught.message || 'Salvestamine ebaõnnestus.'); } finally { setBusy(false); }
  };
  return (
    <Card as="section" className="cash-receivers" aria-label="Kassa vastuvõtjad">
      <h2 className="cash-receivers__title"><Users size={18} aria-hidden="true" /> Kassa vastuvõtjad</h2>
      <p className="form-hint">Kellele õpetajad saavad „Minu kassas” sularaha üle anda. Raha liigub alles siis, kui vastuvõtja vajutab „Sain kätte”.{state.data.saved ? '' : ' (Vaikimisi nimekiri — pole veel salvestatud.)'}</p>
      {error ? <p className="form-error" role="alert">{error}</p> : null}
      {message ? <p className="form-hint" role="status">{message}</p> : null}
      <ul>
        {uids.map((uid) => <li key={uid}><span>{nameOf(uid)}</span><button type="button" className="icon-button" aria-label={`Eemalda ${nameOf(uid)}`} disabled={uids.length <= 1} onClick={() => setDraft(uids.filter((item) => item !== uid))}><X size={16} aria-hidden="true" /></button></li>)}
      </ul>
      <div className="cash-receivers__add">
        <Select label="Lisa vastuvõtja" value={adding} onChange={(event) => setAdding(event.target.value)}>
          <option value="">Vali inimene…</option>
          {people.filter((person) => !uids.includes(person.uid)).map((person) => <option key={person.uid} value={person.uid}>{person.name}{person.isAdmin ? ' (admin)' : ''}</option>)}
        </Select>
        <Button variant="secondary" disabled={!adding} onClick={() => { setDraft([...uids, adding]); setAdding(''); }}>Lisa</Button>
        <Button loading={busy} disabled={!changed} onClick={save}>Salvesta</Button>
      </div>
    </Card>
  );
}
