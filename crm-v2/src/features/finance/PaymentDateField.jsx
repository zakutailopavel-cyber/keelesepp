import { Button, Input } from '../../components/ui/index.js';
import { paymentDateCheck } from './paymentEntry.js';

// „Makse kuupäev” of a payment dialog: editable as before, with the invoice's due date and earlier payment next to it
// and a warning when the date does not look like the day the money arrived (paymentEntry.js)
export default function PaymentDateField({ id = 'payment-date', invoice, payments, value, method, error, onChange, today, className = '' }) {
  const check = paymentDateCheck({ invoice: invoice || {}, payments, paidAt: value, method, today });
  const hintId = `${id}-hint`;
  const describedBy = [error ? `${id}-error` : '', check.info || check.warning ? hintId : ''].filter(Boolean).join(' ');
  return <div className={`payment-date-field ${className}`}>
    <Input id={id} label="Makse kuupäev" type="date" value={value} error={error} aria-describedby={describedBy || undefined}
      onChange={(event) => onChange(event.target.value)} required />
    <div id={hintId}>
      {check.info ? <small className="field__hint">{check.info}</small> : null}
      {check.warning ? <p className="payment-warning" role="status"><strong>{check.warning}</strong>{' '}{check.reasons.join(' ')}{method === 'cash' ? '' : ' Kontrolli pangaväljavõttest.'}</p> : null}
    </div>
  </div>;
}

// the server refused a payment above the open balance (409 „overpayment”): register it as an advance, or go back
export function OverpaymentQuestion({ message, busy, onConfirm, onCancel, className = '' }) {
  if (!message) return null;
  return <div className={`payment-warning ${className}`} role="alertdialog" aria-label="Ülemakse">
    <p style={{ margin: '0 0 8px' }}><strong>{message}</strong> Ülejääk kantakse maksja ettemaksuks (järgmiste arvete jaoks).</p>
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      <Button type="button" loading={busy} onClick={onConfirm}>Jah, registreeri ettemaksuna</Button>
      <Button type="button" variant="secondary" disabled={busy} onClick={onCancel}>Ei, paranda summat</Button>
    </div>
  </div>;
}
