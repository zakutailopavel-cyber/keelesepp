import { ChevronDown, ChevronUp, Search } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Button, Modal } from '../../components/ui/index.js';
import { manualInvoiceApi } from '../../services/firebase/manualInvoiceApi.js';
import AutomaticInvoiceStatus from './AutomaticInvoiceStatus.jsx';
import FinancePage from './FinancePage.jsx';
import ManualInvoiceDialog from './ManualInvoiceDialog.jsx';
import { INVOICE_DETAILS, formatInvoiceDate, formatInvoiceMoney } from './invoiceDetails.js';
import './manualInvoice.css';
import './financeStagingSimplify.css';

const statusLabels = {
  paid: 'Makstud',
  unpaid: 'Tasumata',
  overdue: 'Üle tähtaja',
  partial: 'Osaliselt tasutud',
};

const statusStyles = {
  paid: { background: '#e9f8ef', color: '#176b3a' },
  unpaid: { background: '#f1f5f9', color: '#334155' },
  overdue: { background: '#fff0ed', color: '#b42318' },
  partial: { background: '#eef4ff', color: '#3448a4' },
};

const shell = {
  maxWidth: 1260,
  margin: '0 auto',
  padding: '24px 32px 48px',
};

const panel = {
  background: '#fff',
  border: '1px solid #e5e7eb',
  borderRadius: 18,
  boxShadow: '0 8px 24px rgba(15, 23, 42, 0.05)',
};

function invoiceStudentName(invoice, studentsById) {
  return studentsById.get(invoice.studentId)?.name || invoice.customer || '—';
}

function SimpleFinanceOverview({ refreshKey }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [provider, setProvider] = useState(null);
  const [students, setStudents] = useState([]);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    Promise.all([manualInvoiceApi.providerStatus(), manualInvoiceApi.listStudents()])
      .then(([status, studentItems]) => {
        if (!active) return;
        setProvider(status);
        setStudents(studentItems || []);
      })
      .catch((requestError) => {
        if (!active) return;
        setError(requestError.message || 'Arvete laadimine ebaõnnestus.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, [refreshKey]);

  const studentsById = useMemo(() => new Map(students.map((student) => [student.id, student])), [students]);
  const invoices = Array.isArray(provider?.invoices) ? provider.invoices : [];

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase('et');
    return invoices.filter((invoice) => {
      const paymentStatus = invoice.paymentStatus || 'unpaid';
      const statusMatch = filter === 'all'
        || (filter === 'open' && paymentStatus !== 'paid')
        || paymentStatus === filter;
      if (!statusMatch) return false;
      if (!normalizedQuery) return true;
      const student = studentsById.get(invoice.studentId);
      const haystack = [
        invoice.number,
        invoice.customer,
        student?.name,
        student?.payerName,
        student?.parentName,
      ].filter(Boolean).join(' ').toLocaleLowerCase('et');
      return haystack.includes(normalizedQuery);
    });
  }, [filter, invoices, query, studentsById]);

  const totals = useMemo(() => invoices.reduce((summary, invoice) => {
    const total = Number(invoice.grandTotal || 0);
    const outstanding = Number(invoice.outstandingAmount || 0);
    summary.total += total;
    summary.outstanding += outstanding;
    summary.paid += Math.max(0, total - outstanding);
    if (invoice.paymentStatus === 'paid') summary.paidCount += 1;
    if (invoice.paymentStatus === 'overdue') summary.overdueCount += 1;
    return summary;
  }, { total: 0, outstanding: 0, paid: 0, paidCount: 0, overdueCount: 0 }), [invoices]);

  if (loading) {
    return <div style={{ ...panel, padding: 32, color: '#64748b' }}>Laen arveid…</div>;
  }
  if (error) {
    return <div style={{ ...panel, padding: 32, color: '#b42318' }}>{error}</div>;
  }

  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 16, marginBottom: 18 }}>
        <div style={{ ...panel, padding: 22 }}>
          <div style={{ color: '#64748b', fontSize: 14 }}>Laekumata</div>
          <strong style={{ display: 'block', marginTop: 8, fontSize: 30 }}>{formatInvoiceMoney(totals.outstanding)}</strong>
          <small style={{ color: '#64748b' }}>{invoices.filter((item) => item.paymentStatus !== 'paid').length} avatud arvet</small>
        </div>
        <div style={{ ...panel, padding: 22 }}>
          <div style={{ color: '#64748b', fontSize: 14 }}>Laekunud</div>
          <strong style={{ display: 'block', marginTop: 8, fontSize: 30 }}>{formatInvoiceMoney(totals.paid)}</strong>
          <small style={{ color: '#64748b' }}>{totals.paidCount} makstud arvet</small>
        </div>
        <div style={{ ...panel, padding: 22 }}>
          <div style={{ color: '#64748b', fontSize: 14 }}>Arveid kokku</div>
          <strong style={{ display: 'block', marginTop: 8, fontSize: 30 }}>{invoices.length}</strong>
          <small style={{ color: totals.overdueCount ? '#b42318' : '#64748b' }}>{totals.overdueCount} tähtaja ületanud</small>
        </div>
      </div>

      <div style={{ ...panel, overflow: 'hidden' }}>
        <div style={{ padding: 20, borderBottom: '1px solid #e5e7eb', display: 'flex', gap: 14, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {[
              ['all', 'Kõik arved'],
              ['open', 'Tasumata'],
              ['paid', 'Makstud'],
              ['overdue', 'Üle tähtaja'],
            ].map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setFilter(value)}
                style={{
                  border: filter === value ? '1px solid #111827' : '1px solid #dbe1e8',
                  background: filter === value ? '#111827' : '#fff',
                  color: filter === value ? '#fff' : '#334155',
                  borderRadius: 999,
                  padding: '9px 14px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                {label}
              </button>
            ))}
          </div>
          <label style={{ marginLeft: 'auto', minWidth: 280, display: 'flex', alignItems: 'center', gap: 8, border: '1px solid #dbe1e8', borderRadius: 12, padding: '9px 12px', background: '#fff' }}>
            <Search size={17} color="#64748b" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Otsi õpilase või arve numbri järgi"
              style={{ border: 0, outline: 0, width: '100%', font: 'inherit', background: 'transparent' }}
            />
          </label>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 760 }}>
            <thead>
              <tr style={{ background: '#f8fafc', color: '#64748b', textAlign: 'left', fontSize: 13 }}>
                <th style={{ padding: '13px 18px' }}>Arve</th>
                <th style={{ padding: '13px 18px' }}>Õpilane / maksja</th>
                <th style={{ padding: '13px 18px' }}>Summa</th>
                <th style={{ padding: '13px 18px' }}>Tähtaeg</th>
                <th style={{ padding: '13px 18px' }}>Staatus</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((invoice) => (
                <tr key={invoice.id} onClick={() => setSelected(invoice)} style={{ borderTop: '1px solid #eef2f7', cursor: 'pointer' }}>
                  <td style={{ padding: '15px 18px', fontWeight: 750 }}>{invoice.number}</td>
                  <td style={{ padding: '15px 18px' }}>
                    <strong style={{ display: 'block' }}>{invoiceStudentName(invoice, studentsById)}</strong>
                    {invoice.customer && invoice.customer !== invoiceStudentName(invoice, studentsById) ? <small style={{ color: '#64748b' }}>{invoice.customer}</small> : null}
                  </td>
                  <td style={{ padding: '15px 18px', fontWeight: 700 }}>{formatInvoiceMoney(invoice.grandTotal)}</td>
                  <td style={{ padding: '15px 18px' }}>{formatInvoiceDate(invoice.dueDate)}</td>
                  <td style={{ padding: '15px 18px' }}>
                    <span style={{ ...statusStyles[invoice.paymentStatus], display: 'inline-flex', borderRadius: 999, padding: '6px 10px', fontSize: 12, fontWeight: 800 }}>
                      {statusLabels[invoice.paymentStatus] || invoice.paymentStatus}
                    </span>
                  </td>
                </tr>
              ))}
              {!filtered.length ? (
                <tr><td colSpan="5" style={{ padding: 36, textAlign: 'center', color: '#64748b' }}>Sobivaid arveid ei leitud.</td></tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={Boolean(selected)} title={selected?.number || 'Arve'} onClose={() => setSelected(null)}>
        {selected ? (
          <div style={{ display: 'grid', gap: 18 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 18, flexWrap: 'wrap' }}>
              <div>
                <div style={{ color: '#64748b', fontSize: 12, textTransform: 'uppercase', fontWeight: 800 }}>Saaja</div>
                <strong>{INVOICE_DETAILS.company}</strong>
                <div style={{ color: '#64748b', marginTop: 5, lineHeight: 1.5 }}>Reg. kood {INVOICE_DETAILS.regCode}<br />{INVOICE_DETAILS.address}</div>
              </div>
              <div style={{ minWidth: 210 }}>
                <div style={{ color: '#64748b', fontSize: 12, textTransform: 'uppercase', fontWeight: 800 }}>Maksja</div>
                <strong>{selected.customer || '—'}</strong>
                <div style={{ color: '#64748b', marginTop: 5 }}>Õpilane: {invoiceStudentName(selected, studentsById)}</div>
              </div>
            </div>
            <div style={{ borderTop: '1px solid #e5e7eb', borderBottom: '1px solid #e5e7eb', padding: '16px 0', display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0,1fr))', gap: 12 }}>
              <div><small style={{ color: '#64748b' }}>Summa</small><strong style={{ display: 'block', fontSize: 20 }}>{formatInvoiceMoney(selected.grandTotal)}</strong></div>
              <div><small style={{ color: '#64748b' }}>Tasuda</small><strong style={{ display: 'block', fontSize: 20 }}>{formatInvoiceMoney(selected.outstandingAmount)}</strong></div>
              <div><small style={{ color: '#64748b' }}>Maksetähtaeg</small><strong style={{ display: 'block', fontSize: 18 }}>{formatInvoiceDate(selected.dueDate)}</strong></div>
            </div>
            {selected.remarks ? <div><small style={{ color: '#64748b' }}>Selgitus</small><div style={{ marginTop: 4 }}>{selected.remarks}</div></div> : null}
            <div style={{ background: '#f8fafc', borderRadius: 14, padding: 16 }}>
              <strong>Makseandmed</strong>
              <div style={{ display: 'grid', gridTemplateColumns: '110px 1fr', gap: '7px 12px', marginTop: 12 }}>
                <span style={{ color: '#64748b' }}>Saaja</span><span>{INVOICE_DETAILS.company}</span>
                <span style={{ color: '#64748b' }}>IBAN</span><strong>{INVOICE_DETAILS.iban}</strong>
                <span style={{ color: '#64748b' }}>Pank</span><span>{INVOICE_DETAILS.bank}</span>
                <span style={{ color: '#64748b' }}>SWIFT</span><span>{INVOICE_DETAILS.swift}</span>
                <span style={{ color: '#64748b' }}>Selgitus</span><span>{selected.number}</span>
              </div>
            </div>
          </div>
        ) : null}
      </Modal>
    </>
  );
}

export default function FinanceWorkspacePage(props) {
  const [refreshKey, setRefreshKey] = useState(0);
  const [notice, setNotice] = useState('');
  const [advancedOpen, setAdvancedOpen] = useState(false);

  const handleManualInvoiceCreated = async (invoice) => {
    setNotice(`Arve ${invoice?.num || invoice?.number || ''} loodi edukalt.`.trim());
    setRefreshKey((current) => current + 1);
  };

  return (
    <div style={shell}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 18, marginBottom: 22, flexWrap: 'wrap' }}>
        <div>
          <div style={{ color: '#13795b', fontSize: 13, fontWeight: 800, letterSpacing: '.08em' }}>FINANTSID</div>
          <h1 style={{ margin: '6px 0 4px', fontSize: 42, lineHeight: 1.05 }}>Arved ja maksed</h1>
          <p style={{ margin: 0, color: '#64748b' }}>Vaata võlgnevusi ja laekumisi ning loo uus arve mõne hetkega.</p>
        </div>
        <ManualInvoiceDialog onCreated={handleManualInvoiceCreated} />
      </div>

      {notice ? (
        <div className="finance-workspace-notice" role="status" style={{ marginBottom: 16 }}>
          <span>{notice}</span>
          <button type="button" aria-label="Sulge teade" onClick={() => setNotice('')}>×</button>
        </div>
      ) : null}

      <SimpleFinanceOverview refreshKey={refreshKey} />

      <div style={{ marginTop: 18 }}>
        <Button variant="secondary" onClick={() => setAdvancedOpen((value) => !value)}>
          {advancedOpen ? <ChevronUp size={17} /> : <ChevronDown size={17} />}
          Täpsemad toimingud
        </Button>
      </div>

      {advancedOpen ? (
        <div style={{ marginTop: 18 }}>
          <AutomaticInvoiceStatus />
          <FinancePage key={`advanced-${refreshKey}`} {...props} />
        </div>
      ) : null}
    </div>
  );
}
