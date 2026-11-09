import { useCallback, useEffect, useState } from 'react';
import { askConfirm } from '../../../components/ui/ConfirmHost.jsx';
import { Badge, Button, Card, EmptyState, LoadingState } from '../../../components/ui/index.js';
import { financeApi, invoiceDeliveryApi } from '../../../services/firebase/financeApi.js';
import { invoicesService } from '../../../services/firebase/invoices.js';
import InvoicePdfButton from '../../parents/InvoicePdfButton.jsx';
import PaymentDialog from '../PaymentDialog.jsx';
import { euro, fieSummary } from './fieModel.js';

const STATUS = { paid: 'Makstud', partial: 'Osaliselt', overdue: 'Üle tähtaja', unpaid: 'Tasumata', 'email-failed': 'Tasumata', 'no-show': 'Tasumata', credit: 'Krediteeritud' };

/**
 * „FIE” on the finance page (owner only, 2026-11-09): the owner's own FIE invoices, money received and debts — kept
 * apart from the company's figures (they are in none of the company's sums, analytics or books).
 */
export default function FiePanel({ month = '', invoiceRepository = invoicesService, api = financeApi, pdfApi = invoiceDeliveryApi }) {
  const [invoices, setInvoices] = useState(null);
  const [error, setError] = useState('');
  const [allMonths, setAllMonths] = useState(false);
  const [paying, setPaying] = useState(null);
  const [payState, setPayState] = useState({ busy: false, error: '' });
  const [sending, setSending] = useState('');
  const [notice, setNotice] = useState('');
  const load = useCallback(() => invoiceRepository.listFie()
    .then((list) => { setInvoices(list); setError(''); })
    .catch((loadError) => setError(loadError?.message || 'FIE arveid ei saanud laadida.')), [invoiceRepository]);
  useEffect(() => { load(); }, [load]);

  const submitPayment = async (values) => {
    setPayState({ busy: true, error: '' });
    try {
      await api.recordPayment(paying.id, values);
      setPaying(null);
      setPayState({ busy: false, error: '' });
      await load();
    } catch (payError) {
      setPayState({ busy: false, error: payError?.message || 'Makset ei saanud registreerida.' });
    }
  };

  // „Saada” (owner 2026-11-09): look at the PDF first, then send — always with a question, the e-mail goes to the family
  const deliver = async (invoice, kind) => {
    const to = invoice.emailRecipient || invoice.parentEmail || invoice.payerEmail || '';
    const ok = await askConfirm(`${invoice.num} · ${invoice.studentName || ''}${to ? ` → ${to}` : ''}. Vaata enne PDF üle.`, {
      title: kind === 'remind' ? 'Saada meeldetuletus?' : 'Saada arve?',
      confirmLabel: kind === 'remind' ? 'Saada meeldetuletus' : 'Saada arve',
    });
    if (!ok) return;
    setSending(`${kind}-${invoice.id}`);
    setNotice('');
    try {
      await (kind === 'remind' ? pdfApi.remind(invoice.id) : pdfApi.send(invoice.id));
      setNotice(kind === 'remind' ? `Meeldetuletus saadetud: ${invoice.num}` : `Arve saadetud: ${invoice.num}`);
      await load();
    } catch (sendError) {
      setNotice(sendError?.message || 'Arvet ei saanud saata.');
    } finally {
      setSending('');
    }
  };

  if (error) return <Card><p className="form-error" role="alert">{error}</p></Card>;
  if (!invoices) return <Card><LoadingState inline label="Laen FIE arveid…" /></Card>;
  const summary = fieSummary(invoices, allMonths ? '' : month);
  return <Card className="fie-panel">
    <div className="section-heading">
      <div><span className="eyebrow">Ainult sulle · ei kuulu ettevõtte arvestusse</span><h2>FIE arved{allMonths || !month ? '' : ` · ${month}`}</h2></div>
      {month ? <Button variant="secondary" onClick={() => setAllMonths(!allMonths)}>{allMonths ? 'Ainult see kuu' : 'Kõik kuud'}</Button> : null}
    </div>
    <dl className="fie-panel__totals">
      <div><dt>Arveid</dt><dd>{summary.count}</dd></div>
      <div><dt>Kokku</dt><dd>{euro(summary.amountCents)}</dd></div>
      <div><dt>Laekunud</dt><dd>{euro(summary.paidCents)}</dd></div>
      <div><dt>Võlg</dt><dd>{euro(summary.debtCents)}{summary.overdueCount ? ` (${summary.overdueCount} üle tähtaja)` : ''}</dd></div>
    </dl>
    {notice ? <p className="success-notice" role="status">{notice}</p> : null}
    {!summary.rows.length ? <EmptyState title="FIE arveid ei ole" description="Vali õpilase kaardil „Arve väljastaja: FIE” või arve koostamisel „FIE (minu)”." /> : <div className="table-wrap"><table className="table">
      <thead><tr><th>Arve</th><th>Kuupäev</th><th>Õpilane</th><th>Summa</th><th>Laekunud</th><th>Jääk</th><th>Olek</th><th aria-label="Toimingud" /></tr></thead>
      <tbody>{summary.rows.map(({ invoice, state }) => <tr key={invoice.id}>
        <td>{invoice.num}</td>
        <td>{invoice.date}</td>
        <td>{invoice.studentName}</td>
        <td>{euro(state.amountCents)}</td>
        <td>{euro(state.paidCents)}</td>
        <td>{euro(state.balanceCents)}</td>
        <td><Badge tone={state.status === 'paid' ? 'success' : state.overdue ? 'danger' : 'warning'}>{STATUS[state.status] || state.status}</Badge>{invoice.invoiceEmailSentAt || invoice.emailSentAt ? <small className="fie-panel__sent"> ✉ saadetud</small> : <small className="fie-panel__sent"> ✉ saatmata</small>}</td>
        <td className="fie-panel__actions"><InvoicePdfButton invoice={invoice} api={pdfApi} className="link-button" /><button type="button" className="link-button" disabled={Boolean(sending)} onClick={() => deliver(invoice, 'send')}>{sending === `send-${invoice.id}` ? 'Saadan…' : 'Saada'}</button>{state.balanceCents > 0 && (invoice.invoiceEmailSentAt || invoice.emailSentAt) ? <button type="button" className="link-button" disabled={Boolean(sending)} onClick={() => deliver(invoice, 'remind')}>{sending === `remind-${invoice.id}` ? 'Saadan…' : 'Meeldetuletus'}</button> : null}{state.balanceCents > 0 ? <button type="button" className="link-button" onClick={() => { setPayState({ busy: false, error: '' }); setPaying(invoice); }}>Registreeri makse</button> : null}</td>
      </tr>)}</tbody>
    </table></div>}
    {paying ? <PaymentDialog invoice={paying} busy={payState.busy} error={payState.error} onClose={() => setPaying(null)} onSubmit={submitPayment} /> : null}
  </Card>;
}
