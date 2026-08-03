import { CircleCheck, Clock3, ReceiptText, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Badge, Card, EmptyState, ErrorState, LoadingState, PageHeader, Select } from '../../components/ui/index.js';
import { useAsyncData } from '../../hooks/useAsyncData.js';
import { invoicesService } from '../../services/firebase/index.js';
import { invoiceBalanceCents, isInvoiceOverdue } from '../students/studentFinance.js';

const cents = (invoice) => Number.isFinite(Number(invoice.amountCents)) ? Number(invoice.amountCents) : Math.round(Number(invoice.amount || 0) * 100);
const money = (value) => new Intl.NumberFormat('et-EE', { style: 'currency', currency: 'EUR' }).format(value / 100);
function statusOf(invoice) { if (invoiceBalanceCents(invoice) <= 0) return 'paid'; if (isInvoiceOverdue(invoice)) return 'overdue'; if (Number(invoice.paidAmountCents || invoice.paidAmount || 0) > 0) return 'partial'; return 'unpaid'; }
const statusLabel = { paid: 'Makstud', overdue: 'Üle tähtaja', partial: 'Osaliselt', unpaid: 'Tasumata' };

export default function FinancePage() {
  const state = useAsyncData(() => invoicesService.list(), []);
  const [query, setQuery] = useState(''); const [status, setStatus] = useState('all');
  const filtered = useMemo(() => (state.data || []).filter((item) => {
    const match = `${item.studentName || ''} ${item.number || item.invoiceNumber || ''}`.toLocaleLowerCase('et').includes(query.toLocaleLowerCase('et'));
    return match && (status === 'all' || statusOf(item) === status);
  }), [state.data, query, status]);
  if (state.loading) return <LoadingState label="Laen finantsandmeid…" />;
  if (state.error) return <ErrorState message={state.error.message} onRetry={state.reload} />;
  const invoices = state.data;
  const paid = invoices.reduce((sum, item) => sum + Math.max(0, cents(item) - invoiceBalanceCents(item)), 0);
  const balance = invoices.reduce((sum, item) => sum + invoiceBalanceCents(item), 0);
  const overdue = invoices.filter(isInvoiceOverdue);
  return <div className="page-content"><PageHeader eyebrow="Finantsid" title="Arved ja maksed" description="Reaalne ülevaade laekumistest, võlgadest ja arvete olekust." />
    <section className="metric-grid metric-grid--three"><Card className="metric-card metric-card--green"><div className="metric-card__top"><span>Laekunud</span><i><CircleCheck size={19} /></i></div><strong>{money(paid)}</strong><small>kõigi arvete lõikes</small></Card><Card className="metric-card metric-card--amber"><div className="metric-card__top"><span>Laekumata</span><i><Clock3 size={19} /></i></div><strong>{money(balance)}</strong><small>{overdue.length} tähtaja ületanud</small></Card><Card className="metric-card metric-card--blue"><div className="metric-card__top"><span>Arveid kokku</span><i><ReceiptText size={19} /></i></div><strong>{invoices.length}</strong><small>andmebaasis</small></Card></section>
    <Card className="list-card"><div className="list-toolbar"><div className="search-field"><Search size={18} /><input aria-label="Otsi arvet" placeholder="Otsi õpilase või arve numbri järgi" value={query} onChange={(e) => setQuery(e.target.value)} /></div><Select aria-label="Arve staatus" value={status} onChange={(e) => setStatus(e.target.value)}><option value="all">Kõik staatused</option><option value="unpaid">Tasumata</option><option value="partial">Osaliselt</option><option value="overdue">Üle tähtaja</option><option value="paid">Makstud</option></Select></div>
    {filtered.length ? <div className="students-table-wrap"><table className="students-table"><thead><tr><th>Arve</th><th>Õpilane</th><th>Kuupäev</th><th>Tähtaeg</th><th>Summa</th><th>Jääk</th><th>Staatus</th></tr></thead><tbody>{filtered.map((item) => { const stateValue = statusOf(item); return <tr key={item.id}><td><strong>{item.number || item.invoiceNumber || `#${item.id.slice(0, 6)}`}</strong></td><td>{item.studentName || '—'}</td><td>{item.date || item.createdAt || '—'}</td><td>{item.due || item.dueDate || '—'}</td><td>{money(cents(item))}</td><td><strong>{money(invoiceBalanceCents(item))}</strong></td><td><Badge tone={stateValue === 'paid' ? 'success' : stateValue === 'overdue' ? 'danger' : 'neutral'}>{statusLabel[stateValue]}</Badge></td></tr>; })}</tbody></table></div> : <EmptyState title="Sobivaid arveid ei leitud" description="Muuda otsingut või filtrit." />}</Card>
  </div>;
}
