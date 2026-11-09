import { useEffect, useState } from 'react';
import { Button, Input, Modal, Select } from '../../components/ui/index.js';
import { financeApi, financeRequestId } from '../../services/firebase/financeApi.js';
import { validatePayment } from './finance.js';
import { financeRowState } from './financeRows.js';
import PaymentDateField, { OverpaymentQuestion } from './PaymentDateField.jsx';

const today = () => new Date().toISOString().slice(0, 10);

/**
 * „Registreeri makse” of one invoice: the month's invoice list and the side drawer's invoice panel (owner 2026-11-09)
 * open the same window; the caller records it with paymentEntry.js `recordPaymentWithAdvance`.
 */
export default function PaymentDialog({ invoice, busy, error, overpaymentQuestion = '', onDismissOverpayment, onClose, onSubmit, cashApi = financeApi }) {
  const state = financeRowState(invoice || {});
  const [form, setForm] = useState(() => ({
    amount: (state.balanceCents / 100).toFixed(2), paidAt: today(), method: 'bank',
    reference: invoice?.paymentReference || invoice?.num || invoice?.number || '', note: '',
    // one request id per opened dialog: a double click never records the payment twice
    requestId: financeRequestId('payment'),
  }));
  const [errors, setErrors] = useState({});
  // cash (owner 2026-10-18): who took the money — it goes into that person's cash box („Kassa”)
  const [people, setPeople] = useState(null);
  useEffect(() => {
    if (form.method !== 'cash' || people) return undefined;
    let live = true;
    cashApi.cashSummary?.().then((summary) => { if (live) setPeople(summary.people || []); }).catch(() => { if (live) setPeople([]); });
    return () => { live = false; };
  }, [cashApi, form.method, people]);
  const submit = (event) => {
    event.preventDefault();
    const validation = validatePayment(form);
    setErrors(validation.errors);
    if (validation.valid) onSubmit({ ...form, amount: validation.amount });
  };
  // the same request id: the refused request wrote nothing, the confirmed one is still recorded once
  const confirmOverpayment = () => {
    const validation = validatePayment(form);
    if (validation.valid) onSubmit({ ...form, amount: validation.amount, allowOverpayment: true });
  };
  return (
    <Modal open={Boolean(invoice)} title={`Registreeri makse · ${invoice?.studentName || ''}`} onClose={onClose}
      footer={<><Button variant="secondary" disabled={busy} onClick={onClose}>Loobu</Button><Button type="submit" form="finance-month-payment" loading={busy}>Registreeri</Button></>}>
      <form id="finance-month-payment" className="form-grid" onSubmit={submit}>
        <Input label="Summa (€)" type="number" min="0.01" step="0.01" value={form.amount} error={errors.amount} onChange={(event) => { onDismissOverpayment?.(); setForm({ ...form, amount: event.target.value }); }} />
        <PaymentDateField id="finance-month-payment-date" invoice={invoice} value={form.paidAt} method={form.method} error={errors.paidAt} onChange={(paidAt) => setForm({ ...form, paidAt })} />
        <Select label="Makseviis" value={form.method} onChange={(event) => setForm({ ...form, method: event.target.value })}><option value="bank">Pangaülekanne</option><option value="cash">Sularaha</option><option value="card">Kaardimakse</option><option value="other">Muu</option></Select>
        {form.method === 'cash' ? <Select label="Kes raha sai" value={form.receivedByUid || ''} onChange={(event) => setForm({ ...form, receivedByUid: event.target.value })}><option value="">Mina</option>{(people || []).map((person) => <option key={person.uid} value={person.uid}>{person.name}</option>)}</Select> : null}
        <Input label="Viide" value={form.reference} onChange={(event) => setForm({ ...form, reference: event.target.value })} />
        <OverpaymentQuestion className="form-grid__wide" message={overpaymentQuestion} busy={busy} onConfirm={confirmOverpayment} onCancel={onDismissOverpayment} />
        {error ? <p className="form-error form-grid__wide" role="alert">{error}</p> : null}
      </form>
    </Modal>
  );
}
