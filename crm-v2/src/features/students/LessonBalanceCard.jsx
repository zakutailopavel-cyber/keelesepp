import { Card } from '../../components/ui/index.js';
import { currentMonth, studentLessonBalances } from '../finance/monthlyBilling.js';

const num = (value) => String(value).replace('.', ',');

// Õpilase kaart → Finantsid (owner 2026-11-01): how many lessons the monthly invoices paid, how many were held and what is
// left. What is left comes off the next monthly invoice. Counted from the card's first monthly invoice.
export default function LessonBalanceCard({ student, plan, invoices, lessons, month = currentMonth() }) {
  const balances = studentLessonBalances({ student, plan, invoices, lessons, month });
  if (!balances.length) return null;
  return <Card>
    <div className="section-heading"><div><span className="eyebrow">Kuuarved</span><h2>Tunde alles</h2></div></div>
    <ul className="simple-list" aria-label="Tunde alles">
      {balances.map((balance) => <li key={balance.subject || 'all'}>
        <span><strong>{balance.subject ? `${balance.subject}: ` : ''}{num(balance.left)}</strong><small>Arvetega makstud {num(balance.paid)} · peetud {num(balance.used)} · alates {balance.start}</small></span>
      </li>)}
    </ul>
    <p className="form-hint">Alles olevad tunnid arvestatakse järgmise kuuarve summast maha.</p>
  </Card>;
}
