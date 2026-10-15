import { Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Button, EmptyState, Select } from '../../components/ui/index.js';
import { displayDate } from './finance.js';
import { filterLedger, paymentLedger } from './paymentReconciliation.js';

const money = (value) => new Intl.NumberFormat('et-EE', { style: 'currency', currency: 'EUR' }).format(Number(value || 0) / 100);
const PAGE = 60;
const monthLabel = (month) => new Date(`${month}-15T12:00:00Z`).toLocaleDateString('et-EE', { month: 'long', year: 'numeric' });

// „Laekumised” (owner 2026-10-15: „вид как в банке… кто оплатил и поиск по имени, счёту”): every incoming payment
// newest first — day, payer, explanation, the invoice and child it paid, amount — with a search and a month filter.
export default function PaymentLedger({ payments = [], transactions = [], invoices = [] }) {
  const [query, setQuery] = useState('');
  const [month, setMonth] = useState('all');
  const [shown, setShown] = useState(PAGE);
  const rows = useMemo(() => paymentLedger({ payments, transactions, invoices }), [payments, transactions, invoices]);
  const months = useMemo(() => [...new Set(rows.map((row) => row.paidAt.slice(0, 7)).filter(Boolean))].sort().reverse(), [rows]);
  const visible = useMemo(() => filterLedger(rows, { query, month }), [rows, query, month]);
  const total = visible.reduce((sum, row) => sum + row.amountCents, 0);

  return <section className="payment-ledger" aria-label="Laekumised">
    <div className="payment-ledger__filters">
      <label className="search-field"><Search size={17} /><input aria-label="Otsi laekumisi" type="search" placeholder="Nimi, arve number, laps, selgitus või summa" value={query} onChange={(event) => { setQuery(event.target.value); setShown(PAGE); }} /></label>
      <Select label="Kuu" value={month} onChange={(event) => { setMonth(event.target.value); setShown(PAGE); }}>
        <option value="all">Kõik kuud</option>
        {months.map((value) => <option key={value} value={value}>{monthLabel(value)}</option>)}
      </Select>
      <p className="payment-ledger__total" role="status"><span>{visible.length} laekumist</span><strong>{money(total)}</strong></p>
    </div>
    {!visible.length ? <EmptyState title={rows.length ? 'Otsingule ei vasta ühtegi laekumist' : 'Laekumisi veel ei ole'} description={rows.length ? 'Proovi teist nime, arve numbrit või kuud.' : 'Makse registreerimisel või pangaväljavõtte importimisel ilmuvad laekumised siia.'} /> : <div className="payment-ledger__table" role="table" aria-label="Laekumised">
      <div className="payment-ledger__head" role="row"><span role="columnheader">Kuupäev</span><span role="columnheader">Maksja</span><span role="columnheader">Selgitus</span><span role="columnheader">Arve ja õpilane</span><span role="columnheader">Summa</span></div>
      {visible.slice(0, shown).map((row) => <div className="payment-ledger__row" role="row" key={row.id}>
        <span role="cell">{displayDate(row.paidAt)}</span>
        <span role="cell"><strong>{row.payerName || '—'}</strong>{row.source === 'cash' ? <small>sularaha</small> : row.source === 'card' ? <small>kaart</small> : null}</span>
        <span role="cell" className="payment-ledger__reference">{row.reference || '—'}</span>
        <span role="cell">{row.links.map((item) => <small key={`${item.invoiceId}-${item.amountCents}`}><b>{item.label || 'arve'}</b> · {item.studentName || '—'}{row.links.length > 1 ? ` · ${money(item.amountCents)}` : ''}</small>)}
          {row.advanceCents ? <small className="payment-ledger__advance">Ettemaks {money(row.advanceCents)}{row.advanceFor ? ` · ${row.advanceFor}` : ''}</small> : null}
          {!row.links.length && !row.advanceCents ? <small>—</small> : null}</span>
        <span role="cell" className="payment-ledger__amount">+{money(row.amountCents)}</span>
      </div>)}
    </div>}
    {visible.length > shown ? <div className="payment-ledger__more"><Button variant="secondary" onClick={() => setShown((value) => value + PAGE)}>Näita veel ({visible.length - shown})</Button></div> : null}
  </section>;
}
