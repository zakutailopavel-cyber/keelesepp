import { FileUp, History, Mail } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Badge, Button, Card, EmptyState, Modal } from '../../components/ui/index.js';
import { displayDate } from './finance.js';
import { financeRowState } from './financeRows.js';
import { pastDueInvoices } from './financeDebts.js';
import BankReconciliationPanel from './BankReconciliationPanel.jsx';
import './financeDebts.css';

const money = (cents) => new Intl.NumberFormat('et-EE', { style: 'currency', currency: 'EUR' }).format(Number(cents || 0) / 100);

export default function FinanceDebtsPanel({ month, invoices, students, transactions, onAllocate, onReload, onRemind }) {
  const [importOpen, setImportOpen] = useState(false);
  const [busy, setBusy] = useState('');
  const [notice, setNotice] = useState('');
  const debts = useMemo(() => pastDueInvoices(invoices, month), [invoices, month]);
  const total = debts.reduce((sum, invoice) => sum + financeRowState(invoice).balanceCents, 0);
  const remind = async (invoice) => {
    setBusy(invoice.id); setNotice('');
    try { await onRemind(invoice); setNotice('Maksemeeldetuletus saadeti.'); }
    catch (error) { setNotice(error.message || 'Meeldetuletust ei saanud saata.'); }
    finally { setBusy(''); }
  };
  return (
    <Card className="finance-debts" id="volgnevused">
      <div className="finance-debts__heading"><div><span className="eyebrow">Võlgnevused</span><h2>Varasemate kuude tasumata arved</h2><p>Kõik valitud kuust varasemad arved, millel on veel jääk.</p></div><div><strong>{money(total)}</strong><Button variant="secondary" onClick={() => setImportOpen(true)}><FileUp size={17} /> Impordi pank</Button></div></div>
      {notice ? <p className="finance-debts__notice" role="status">{notice}</p> : null}
      {!debts.length ? <EmptyState title="Varasemaid võlgnevusi ei ole" description="Kõik eelmiste kuude arved on tasutud või krediteeritud." action={<History size={28} />} /> : <div className="finance-debts__table" role="table" aria-label="Võlgnevused">
        <div className="finance-debts__head" role="row"><span>Õpilane</span><span>Arve</span><span>Tähtaeg</span><span>Jääk</span><span>Olek</span><span /></div>
        {debts.map((invoice) => { const row = financeRowState(invoice); return <div className="finance-debts__row" role="row" key={invoice.id}><span><strong>{invoice.studentName || invoice.payerName || '—'}</strong><small>{invoice.payerEmail || ''}</small></span><span>{invoice.num || invoice.number || '—'}</span><span>{displayDate(invoice.due || invoice.dueDate)}</span><span><strong>{money(row.balanceCents)}</strong></span><span><Badge tone={row.overdue ? 'danger' : 'neutral'}>{row.overdue ? 'Üle tähtaja' : 'Tasumata'}</Badge></span><span><Button variant="secondary" loading={busy === invoice.id} onClick={() => remind(invoice)}><Mail size={15} /> Meeldetuletus</Button></span></div>; })}
      </div>}
      <Modal open={importOpen} title="Impordi pangaväljavõte" className="finance-bank-modal" onClose={() => setImportOpen(false)} footer={<Button variant="secondary" onClick={() => setImportOpen(false)}>Sulge</Button>}>
        <BankReconciliationPanel invoices={invoices} students={students} transactions={transactions} onAllocate={onAllocate} onReload={onReload} />
      </Modal>
    </Card>
  );
}
